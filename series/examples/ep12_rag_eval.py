"""Evals for RAG: measure the search and the answer separately.

Part 1 - the search. Six versions of the pipeline run on the same 21 questions. Metrics: recall@1, recall@3 and MRR.
Part 2 - the answer. A simple grader checks that every fact of an answer is in the retrieved text (groundedness).
         The two sample answers are written by hand. The "model" of the pipeline is a stub (it copies a sentence).
Part 3 - the judge. A judge model grades answers that a rule cannot. The judge here is a TOY, built with a bias toward the
         first answer, to show the swap test. To test a real LLM judge, replace toy_judge with a call to the model.
Part 4 - a trace: one record for each request, so that you can see which step failed.

All results hold for this small hand-written corpus only.
"""
import json
import re

from ep12_corpus import QUESTIONS, is_relevant, paragraphs
from ep12_hybrid import CHUNKS, TITLES, bm25, lsa, relevant, tfidf
from ep12_retrieval import BM25, first_rank, joint_score, metrics, order, rerank, rrf, terms

TITLED = [f"{title}. {text}" for title, text in paragraphs()]
bm25_titled = BM25(TITLED)

VERSIONS = [
    "TF-IDF (episode 7)",
    "BM25",
    "Dense stand-in (LSA)",
    "Hybrid (BM25 + dense, RRF)",
    "Hybrid + reranker (top 10)",
    "BM25 + section title line",
]


def ranking(version: str, question: str) -> list[int]:
    """The ranked chunk indexes that one version of the pipeline returns."""
    if version == VERSIONS[0]:
        return order(tfidf.scores(question))
    if version == VERSIONS[1]:
        return order(bm25.scores(question))
    if version == VERSIONS[2]:
        return order(lsa.scores(question))
    fused = [i for i, _ in rrf([order(bm25.scores(question)), order(lsa.scores(question))])]
    if version == VERSIONS[3]:
        return fused
    if version == VERSIONS[4]:
        return rerank(question, CHUNKS, fused[:10])
    return order(bm25_titled.scores(question))


def evaluate_versions() -> list[dict]:
    rows = []
    n = len(QUESTIONS)
    for v in VERSIONS:
        ranks = [first_rank(ranking(v, q), relevant(a)) for q, a in QUESTIONS]
        m = metrics(ranks, (1, 3))
        rows.append({"version": v, "recall@1": round(m["recall@1"] * n), "recall@3": round(m["recall@3"] * n),
                     "mrr": m["mrr"], "ranks": ranks,
                     "missed": [i for i, r in enumerate(ranks) if r is None or r > 3]})
    return rows


# ---------------------------------------------------------------- the answer: a simple groundedness grader
FILLER = {"yes", "no", "ok"}          # a sentence that only says yes or no makes no claim about the text


def numbers(text: str) -> set[str]:
    return set(re.findall(r"\d+(?:\.\d+)?", text))


def grounded(answer: str, context: str, min_cover: float = 0.7) -> list[dict]:
    """Check each sentence of the answer against the retrieved text.

    A sentence is supported when (1) every number in it is in the text and (2) at least `min_cover` of its content
    words are in the text. It is a simple rule. A judge model can check meaning; this rule can only check words.
    """
    have = set(terms(context))
    out = []
    for sentence in re.split(r"(?<=[.!?])\s+", answer.strip()):
        words = [w for w in terms(sentence) if w not in FILLER]
        cover = sum(w in have for w in words) / len(words) if words else 1.0
        missing = sorted(n for n in numbers(sentence) if n not in numbers(context))
        out.append({"sentence": sentence, "cover": cover, "missing_numbers": missing,
                    "supported": not missing and cover >= min_cover})
    return out


SAMPLES = [
    # Written by hand: one answer that follows the text, one that invents a fact.
    ("Can I return a bike after two weeks?",
     "Yes. You can return a bike within 30 days of delivery."),
    ("Can I return a bike after two weeks?",
     "Yes. You can return a bike within 60 days. The shop pays for the courier."),
]


# ---------------------------------------------------------------- the judge: a toy with a position bias
JUDGE_BIAS = 0.5      # the toy adds this to the answer that is shown first


def toy_judge(key_fact: str, first: str, second: str) -> int:
    """Rubric: the answer must contain the key fact. A tie goes to the first answer (the bias). Returns 1 or 2."""
    s1 = (key_fact in first) + JUDGE_BIAS
    s2 = (key_fact in second)
    return 1 if s1 >= s2 else 2


# (question, key fact, answer A, answer B, which answer a human prefers)
PAIRS = [
    # four clear pairs: only one answer holds the key fact
    ("How long is the return period?", "30 days",
     "You can return a bike within 30 days of delivery.", "It depends on the bike.", "A"),
    ("How long does express delivery take?", "1 day",
     "Express delivery is fast.", "Express delivery takes 1 day.", "B"),
    ("How long is the warranty on a frame?", "5-year",
     "A frame has a 5-year warranty.", "Frames are covered for a long time.", "A"),
    ("What does a basic service cost?", "60 dollars",
     "The price is on the website.", "A basic service costs 60 dollars.", "B"),
    # four close pairs: both answers hold the key fact, but one adds a claim that the handbook does not support
    ("What does a puncture repair cost?", "15 dollars",
     "A puncture repair costs 15 dollars.", "A puncture repair costs 15 dollars, and the first one is free.", "A"),
    ("How long does a battery take to charge?", "4 hours",
     "A full charge takes 4 hours, and it is faster in summer.", "A full charge takes 4 hours.", "B"),
    ("How much is a bike fit?", "40 dollars",
     "A bike fit costs 40 dollars.", "A bike fit costs 40 dollars, and we send you a free helmet.", "A"),
    ("When is the shop open on Saturday?", "10 to 16",
     "On Saturday the shop is open from 10 to 16, and also on Sunday.", "On Saturday the shop is open from 10 to 16.", "B"),
]


def swap_test() -> list[dict]:
    """Ask the judge twice for each pair: A first, then B first. The verdict must not depend on the order."""
    rows = []
    for question, key, a, b, human in PAIRS:
        v1 = "A" if toy_judge(key, a, b) == 1 else "B"
        v2 = "B" if toy_judge(key, b, a) == 1 else "A"        # in the swapped call, the first answer is B
        rows.append({"question": question, "answer_A": a, "answer_B": b, "order_AB": v1, "order_BA": v2, "human": human,
                     "consistent": v1 == v2, "agrees_AB": v1 == human, "agrees_BA": v2 == human})
    return rows


# ---------------------------------------------------------------- the trace
def stub_answer(question: str, ids: list[int]) -> str:
    """Stand-in for the LLM: copy the sentence of the retrieved chunks that shares the most words with the question."""
    sentences = [s for i in ids for s in re.split(r"(?<=[.!?])\s+", CHUNKS[i])]
    return max(sentences, key=lambda s: (joint_score(question, s), -len(s)))


def trace(question: str, version: str = VERSIONS[4]) -> dict:
    ids = ranking(version, question)[:3]
    context = " ".join(CHUNKS[i] for i in ids)
    answer = stub_answer(question, ids)
    return {"question": question, "pipeline": version, "chunks": ids, "sections": [TITLES[i] for i in ids],
            "prompt_words": len(context.split()) + len(question.split()) + 18,
            "answer": answer, "grounded": all(r["supported"] for r in grounded(answer, context))}


if __name__ == "__main__":
    n = len(QUESTIONS)
    print(f"1. THE SEARCH: {len(VERSIONS)} versions, {n} questions (recall counts are of {n})\n")
    print(f"{'version':<30}{'recall@1':>9}{'recall@3':>9}{'MRR':>8}")
    for row in evaluate_versions():
        print(f"{row['version']:<30}{row['recall@1']:>9}{row['recall@3']:>9}{row['mrr']:>8.3f}")
    rows = evaluate_versions()
    print("\nQuestions that each version misses at k = 3:")
    for row in rows:
        print(f"  {row['version']:<30}{row['missed']}")
    print(f"One question is {100 / n:.1f} points of recall.\n")

    print("2. THE ANSWER: a simple groundedness check (the context is the retrieved text)")
    context = CHUNKS[0]
    for question, answer in SAMPLES:
        print(f"  answer: {answer}")
        for r in grounded(answer, context):
            note = f"missing numbers {r['missing_numbers']}" if r["missing_numbers"] else f"word cover {r['cover']:.2f}"
            print(f"    {'supported  ' if r['supported'] else 'NOT SUPPORTED'}  {r['sentence']!r}  ({note})")

    print("\n3. THE JUDGE: a toy judge with a built-in bias toward the first answer (swap test)")
    results = swap_test()
    for r in results:
        print(f"  {r['question']:<42} A first -> {r['order_AB']}   B first -> {r['order_BA']}   "
              f"human -> {r['human']}   {'same' if r['consistent'] else 'FLIPS'}")
    print(f"  verdict changed after the swap in {sum(not r['consistent'] for r in results)} of {len(results)} pairs; "
          f"agrees with the human in {sum(r['agrees_AB'] for r in results)} of {len(results)} (A first) "
          f"and in {sum(r['agrees_BA'] for r in results)} of {len(results)} (B first)")

    print("\n4. A TRACE of one request (stub model in place of the LLM):")
    t = trace(QUESTIONS[19][0])
    body = ",\n".join(f"  {json.dumps(key)}: {json.dumps(value)}" for key, value in t.items())
    print("{\n" + body + "\n}")

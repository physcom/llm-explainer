"""Two-stage search: a cheap first stage finds 10 candidates, a reranker re-orders them, the top 3 go to the prompt.

The reranker here is a STAND-IN for a cross-encoder. A cross-encoder is one neural model that reads the question and a
chunk together and gives a relevance score. The stand-in reads them together too, but it only counts shared words,
shared word pairs and how close the matching words are. It cannot see that two different words mean the same.
"""
from ep12_corpus import QUESTIONS
from ep12_hybrid import CHUNKS, TITLES, relevant, search_all
from ep12_retrieval import first_rank, joint_score, metrics, rerank

CANDIDATES = 10          # first stage: how many chunks the reranker reads for each question
KEEP = 3                 # second stage: how many chunks go into the prompt


def two_stage(question: str) -> dict:
    """First stage = hybrid search (BM25 + dense stand-in, fused with RRF). Second stage = the stand-in reranker."""
    first = search_all(question)["fused"][:CANDIDATES]
    second = rerank(question, CHUNKS, first)
    return {"first": first, "second": second,
            "scores": {i: round(joint_score(question, CHUNKS[i]), 3) for i in first}}


def summary() -> dict:
    """Recall@3 and MRR before and after the second stage, over all 21 questions, and the work that it costs."""
    before, after, ceiling = [], [], 0
    for question, answer in QUESTIONS:
        rel = relevant(answer)
        r = two_stage(question)
        before.append(first_rank(r["first"], rel))
        after.append(first_rank(r["second"], rel))
        ceiling += first_rank(r["first"], rel) is not None
    return {"before": metrics(before), "after": metrics(after), "ceiling": ceiling,
            "pairs": CANDIDATES * len(QUESTIONS), "pairs_all": len(CHUNKS) * len(QUESTIONS),
            "ranks_before": before, "ranks_after": after}


if __name__ == "__main__":
    q, a = QUESTIONS[2]
    rel = relevant(a)
    r = two_stage(q)
    print(f"Question: {q!r}   (the right chunk is #{next(iter(rel))}, section {TITLES[next(iter(rel))]})\n")
    print("First stage (hybrid), top 10, then the reranker's score for each:")
    for pos, i in enumerate(r["first"], start=1):
        star = "  <- right chunk" if i in rel else ""
        print(f"  {pos:>2}. #{i:<3} {TITLES[i]:<12} rerank score {r['scores'][i]:.3f}{star}")
    print("\nAfter the reranker, the top 3:")
    for pos, i in enumerate(r["second"][:KEEP], start=1):
        star = "  <- right chunk" if i in rel else ""
        print(f"  {pos}. #{i:<3} {TITLES[i]:<12} {CHUNKS[i][:60]}...{star}")

    s = summary()
    n = len(QUESTIONS)
    print(f"\nAll {n} questions (first stage = top {CANDIDATES} of hybrid search):")
    for name in ("before", "after"):
        m = s[name]
        print(f"  {name:<6} recall@1 {round(m['recall@1'] * n)}/{n}   recall@3 {round(m['recall@3'] * n)}/{n}   MRR {m['mrr']:.3f}")
    print(f"  The reranker can only re-order what stage one found: the right chunk is in the top {CANDIDATES} "
          f"for {s['ceiling']} of {n} questions.")
    print(f"  Cost: {s['pairs']} question-chunk pairs scored, against {s['pairs_all']} if every chunk were scored.")
    left = [QUESTIONS[i][0] for i, rank in enumerate(s["ranks_after"]) if rank is None or rank > KEEP]
    print(f"  Still not in the top 3: {left}")

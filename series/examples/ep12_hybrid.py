"""Hybrid search: keyword search (BM25) + a dense stand-in (LSA), joined by reciprocal rank fusion (RRF).

The chunks are the 42 paragraphs of the handbook. The dense stand-in is latent semantic analysis, NOT an embedding model:
it learned only from these 42 paragraphs, so it is much weaker than a real embedding model that learned from a huge text.
"""
from ep12_corpus import QUESTIONS, is_relevant, paragraphs
from ep12_retrieval import BM25, LSA, TfidfCosine, first_rank, order, rrf

CHUNKS = [text for _, text in paragraphs()]
TITLES = [title for title, _ in paragraphs()]
bm25, lsa, tfidf = BM25(CHUNKS), LSA(CHUNKS), TfidfCosine(CHUNKS)

# A rewrite of the question in the words of the handbook. A model can write such a rewrite.
# Here it is written by hand, to show the effect.
REWRITE = ("Can I try a bike before I buy it?", "Can I test ride a bike before I buy it?")


def relevant(answer: str) -> set[int]:
    return {i for i, c in enumerate(CHUNKS) if is_relevant(c, answer)}


def search_all(question: str) -> dict:
    """The ranked lists of every retriever, and the fused list (RRF over the two lists, k = 60)."""
    b, d = order(bm25.scores(question)), order(lsa.scores(question))
    fused = rrf([b, d])
    return {"tfidf": order(tfidf.scores(question)), "bm25": b, "dense": d,
            "fused": [i for i, _ in fused], "fused_scores": dict(fused)}


def rank_of(question: str, answer: str) -> dict:
    """The rank of the right chunk for each retriever (None = not found at all)."""
    res = search_all(question)
    rel = relevant(answer)
    return {name: first_rank(res[name], rel) for name in ("tfidf", "bm25", "dense", "fused")}


def failures_at(k: int = 3) -> dict[str, list[int]]:
    """For each retriever: the questions (by index) whose right chunk is NOT in the top k."""
    out: dict[str, list[int]] = {name: [] for name in ("tfidf", "bm25", "dense", "fused")}
    for qi, (question, answer) in enumerate(QUESTIONS):
        for name, rank in rank_of(question, answer).items():
            if rank is None or rank > k:
                out[name].append(qi)
    return out


if __name__ == "__main__":
    print(f"{len(CHUNKS)} paragraph chunks. The dense stand-in (LSA) has {lsa.dims} dimensions.\n")

    q, a = QUESTIONS[2]
    print(f"The question that failed in episode 7: {q!r}")
    print("  TF-IDF score of the right chunk:", round(float(tfidf.scores(q)[next(iter(relevant(a)))]), 3))
    print("  rank of the right chunk:", rank_of(q, a), "(None = not found)\n")

    q, a = QUESTIONS[0]
    res = search_all(q)
    print(f"Fusion on {q!r}  (the right chunk is #{next(iter(relevant(a)))})")
    print("  BM25 top 5 :", res["bm25"][:5])
    print("  dense top 5:", res["dense"][:5])
    print("  fused top 5:", [(i, round(res['fused_scores'][i], 4)) for i in res["fused"][:5]])
    print("  score of a chunk = 1/(60+rank in list 1) + 1/(60+rank in list 2)\n")

    print("Questions whose right chunk is NOT in the top 3 (index in the question list):")
    for name, qs in failures_at().items():
        print(f"  {name:<6} {len(qs)} of {len(QUESTIONS)}  {qs}")

    before, after = REWRITE
    answer = next(ans for qq, ans in QUESTIONS if qq == before)
    print(f"\nRewrite by hand: {before!r} -> {after!r}")
    print("  rank before:", rank_of(before, answer))
    print("  rank after :", rank_of(after, answer))

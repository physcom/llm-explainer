"""Chunking: how you split the handbook changes what search can find.

One retriever (BM25), one corpus, 21 questions. Only the split changes.
Four numbers for each split (all counts are of the 21 questions):
  whole   = the answer text lies completely inside ONE chunk (a cut in the middle does not count).
            This is the best that any search could do with this split.
  top3    = the right chunk is among the top 3 that search returns (recall@3).
  words   = the average number of words that the top 3 chunks put into the prompt.
"""
from ep12_corpus import QUESTIONS, flat_text, is_relevant, paragraphs, sections
from ep12_retrieval import BM25, first_rank, metrics, order


def fixed_chunks(size: int, overlap: int = 0) -> list[str]:
    """Cut the handbook into windows of `size` words. With overlap, each window repeats the end of the one before."""
    words = flat_text().split()
    step = size - overlap
    out = []
    for start in range(0, len(words), step):
        out.append(" ".join(words[start:start + size]))
        if start + size >= len(words):
            break
    return out


def splits() -> dict[str, list[str]]:
    """The splits that are compared. The sizes were fixed before the test (20, 40, 80, 160 words)."""
    return {
        "fixed 20 words": fixed_chunks(20),
        "fixed 40 words": fixed_chunks(40),
        "fixed 80 words": fixed_chunks(80),
        "fixed 160 words": fixed_chunks(160),
        "fixed 40, overlap 10": fixed_chunks(40, 10),
        "by paragraph": [text for _, text in paragraphs()],
        "by section": [text for _, text in sections()],
    }


def evaluate(chunks: list[str], gold: list[str] | None = None) -> dict:
    """Run the 21 questions with BM25 over `chunks`. `gold` = the plain text of each chunk (when a line is added)."""
    gold = gold or chunks
    bm25 = BM25(chunks)
    ranks, whole, words = [], 0, []
    for question, answer in QUESTIONS:
        relevant = {i for i, c in enumerate(gold) if is_relevant(c, answer)}
        whole += bool(relevant)
        top = order(bm25.scores(question))
        ranks.append(first_rank(top, relevant))
        words.append(sum(len(gold[i].split()) for i in top[:3]))
    m = metrics(ranks, (1, 3))
    return {"chunks": len(chunks), "avg_words": sum(len(c.split()) for c in chunks) / len(chunks), "whole": whole,
            "top3": round(m["recall@3"] * len(QUESTIONS)), "mrr": m["mrr"], "words": sum(words) / len(words),
            "ranks": ranks}


def cut_examples(size: int = 40) -> list[tuple[str, str, str]]:
    """Questions whose answer text is cut in two by a fixed split: (question, first half, second half)."""
    chunks = fixed_chunks(size)
    out = []
    for question, answer in QUESTIONS:
        if any(is_relevant(c, answer) for c in chunks):
            continue
        for a, b in zip(chunks, chunks[1:]):
            # the cut falls between two words: the answer starts at the end of a and goes on at the start of b
            for k in (i for i, ch in enumerate(answer) if ch == " "):
                if a.endswith(answer[:k]) and b.startswith(answer[k + 1:]):
                    out.append((question, answer[:k], answer[k + 1:]))
    return out


def with_title_line() -> dict:
    """The idea of contextual retrieval, in its cheapest form: put the section title in front of each paragraph."""
    plain = [text for _, text in paragraphs()]
    titled = [f"{title}. {text}" for title, text in paragraphs()]
    return {"plain": evaluate(plain), "titled": evaluate(titled, gold=plain)}


if __name__ == "__main__":
    print(f"{len(QUESTIONS)} questions, BM25, top 3 chunks. whole = answer text complete inside one chunk.\n")
    print(f"{'split':<22}{'chunks':>7}{'words':>7}{'whole':>7}{'top3':>6}{'words in top 3':>16}")
    for name, chunks in splits().items():
        r = evaluate(chunks)
        print(f"{name:<22}{r['chunks']:>7}{r['avg_words']:>7.0f}{r['whole']:>5}/21{r['top3']:>4}/21{r['words']:>16.0f}")
    print()
    print(f"The handbook has {len(flat_text().split())} words in all.")
    print("\nA fixed split of 40 words cuts these answers in two:")
    for question, first, second in cut_examples():
        print(f"  Q: {question}\n     ...{first[-40:]!r} | {second[:40]!r}...")
    t = with_title_line()
    print("\nAdd the section title in front of each paragraph (a cheap context line):")
    for name in ("plain", "titled"):
        r = t[name]
        print(f"  {name:<7} top3 {r['top3']}/21   MRR {r['mrr']:.3f}")

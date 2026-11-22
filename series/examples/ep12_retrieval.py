"""Retrievers for episode 12: TF-IDF (episode 7), BM25, a dense stand-in, rank fusion, and a stand-in reranker.

All of them are small, original and offline (numpy and scikit-learn only).
- BM25 is written here in plain numpy.
- The dense retriever is latent semantic analysis (LSA): TF-IDF vectors cut down to a few dimensions with an SVD.
  It is a dense stand-in. A real application uses an embedding model that learned from a huge amount of text.
- The reranker is a stand-in for a cross-encoder. A cross-encoder is one model that reads the question and a
  chunk TOGETHER. The stand-in also reads them together, but it only counts words, pairs of words and distance.
"""
import math
import re

import numpy as np
from sklearn.decomposition import TruncatedSVD
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS, TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

STOP = set(ENGLISH_STOP_WORDS) | {"does", "much", "many", "long"}


def terms(text: str) -> list[str]:
    """Lower-case words, without stop words, with a plural 's' removed (tires -> tire)."""
    out = []
    for w in re.findall(r"[a-z0-9]+(?:\.[0-9]+)?", text.lower()):
        if w in STOP:
            continue
        out.append(w[:-1] if len(w) > 3 and w.endswith("s") and not w.endswith("ss") else w)
    return out


def order(scores) -> list[int]:
    """Indexes of the chunks with a score above zero, best first (a tie keeps the document order)."""
    s = np.asarray(scores, dtype=float)
    return [int(i) for i in sorted(range(len(s)), key=lambda i: (-s[i], i)) if s[i] > 1e-12]


class BM25:
    """BM25 (Robertson and Zaragoza): TF-IDF with a limit on repeated words and a correction for chunk length."""

    def __init__(self, docs: list[str], k1: float = 1.5, b: float = 0.75):
        toks = [terms(d) for d in docs]
        vocab = sorted({t for d in toks for t in d})
        self.index = {t: j for j, t in enumerate(vocab)}
        self.tf = np.zeros((len(docs), len(vocab)))
        for i, d in enumerate(toks):
            for t in d:
                self.tf[i, self.index[t]] += 1
        n = len(docs)
        df = (self.tf > 0).sum(axis=0)
        self.idf = np.log(1 + (n - df + 0.5) / (df + 0.5))
        self.length = self.tf.sum(axis=1)
        self.avg = self.length.mean()
        self.k1, self.b = k1, b

    def scores(self, query: str) -> np.ndarray:
        s = np.zeros(len(self.tf))
        for t in terms(query):
            j = self.index.get(t)
            if j is None:
                continue
            tf = self.tf[:, j]
            s += self.idf[j] * tf * (self.k1 + 1) / (tf + self.k1 * (1 - self.b + self.b * self.length / self.avg))
        return s


class TfidfCosine:
    """The retriever of episode 7: TF-IDF vectors and cosine similarity."""

    def __init__(self, docs: list[str]):
        self.vec = TfidfVectorizer(stop_words="english")
        self.m = self.vec.fit_transform(docs)

    def scores(self, query: str) -> np.ndarray:
        return cosine_similarity(self.vec.transform([query]), self.m)[0]


class LSA:
    """A dense stand-in: TF-IDF vectors cut down to `dims` dimensions with a truncated SVD, then cosine similarity."""

    def __init__(self, docs: list[str], dims: int = 15):
        self.vec = TfidfVectorizer(stop_words="english")
        m = self.vec.fit_transform(docs)
        self.dims = max(2, min(dims, m.shape[0] - 1, m.shape[1] - 1))
        self.svd = TruncatedSVD(n_components=self.dims, algorithm="arpack", random_state=0)
        z = self.svd.fit_transform(m)
        self.z = z / (np.linalg.norm(z, axis=1, keepdims=True) + 1e-12)

    def scores(self, query: str) -> np.ndarray:
        q = self.svd.transform(self.vec.transform([query]))
        q = q / (np.linalg.norm(q, axis=1, keepdims=True) + 1e-12)
        return (self.z @ q[0])


def rrf(rankings: list[list[int]], k: int = 60) -> list[tuple[int, float]]:
    """Reciprocal rank fusion (Cormack et al.): each list gives 1 / (k + rank) to a chunk. Sum, then sort."""
    total: dict[int, float] = {}
    for ranking in rankings:
        for rank, i in enumerate(ranking, start=1):
            total[i] = total.get(i, 0.0) + 1.0 / (k + rank)
    return sorted(total.items(), key=lambda kv: (-kv[1], kv[0]))


def joint_score(query: str, chunk: str) -> float:
    """Stand-in for a cross-encoder: read the question and the chunk together.

    Three signals, with fixed weights chosen before any test: how many question words the chunk has (coverage),
    how many neighbouring question-word pairs the chunk has in the same order (phrase), and how close together
    the matching words are (tightness).
    """
    q = terms(query)
    c = terms(chunk)
    qset = set(q)
    if not qset:
        return 0.0
    hits = [i for i, t in enumerate(c) if t in qset]
    coverage = len({c[i] for i in hits}) / len(qset)
    pairs = list(zip(q, q[1:]))
    phrase = (sum(1 for p in pairs if any(c[i] == p[0] and c[i + 1] == p[1] for i in range(len(c) - 1))) / len(pairs)
              if pairs else 0.0)
    if len({c[i] for i in hits}) >= 2:
        # the shortest stretch of the chunk that holds every matching word at least once
        need = {c[i] for i in hits}
        best = len(c)
        left, seen = 0, {}
        for right, t in enumerate(c):
            if t in need:
                seen[t] = seen.get(t, 0) + 1
            while len(seen) == len(need):
                best = min(best, right - left + 1)
                if c[left] in seen:
                    seen[c[left]] -= 1
                    if seen[c[left]] == 0:
                        del seen[c[left]]
                left += 1
        tight = len(need) / best
    else:
        tight = 0.0
    return coverage + 0.5 * phrase + 0.5 * tight


def rerank(query: str, chunks: list[str], candidates: list[int], keep: int | None = None) -> list[int]:
    """Re-order the candidate chunk indexes by joint_score (ties keep the first-stage order)."""
    scored = sorted(range(len(candidates)), key=lambda r: (-joint_score(query, chunks[candidates[r]]), r))
    out = [candidates[r] for r in scored]
    return out if keep is None else out[:keep]


def first_rank(ranking: list[int], relevant: set[int]) -> int | None:
    """Position (1 = best) of the first relevant chunk in a ranking, or None if it is not in the list."""
    for pos, i in enumerate(ranking, start=1):
        if i in relevant:
            return pos
    return None


def metrics(ranks: list[int | None], ks: tuple[int, ...] = (1, 3)) -> dict:
    """recall@k = share of questions with a relevant chunk in the top k. MRR = mean of 1 / first rank (0 if missing)."""
    n = len(ranks)
    out = {f"recall@{k}": sum(1 for r in ranks if r is not None and r <= k) / n for k in ks}
    out["mrr"] = sum((1 / r if r else 0.0) for r in ranks) / n
    return out


if __name__ == "__main__":
    from ep12_corpus import QUESTIONS, is_relevant, paragraphs

    chunks = [t for _, t in paragraphs()]
    bm25, tfidf, lsa = BM25(chunks), TfidfCosine(chunks), LSA(chunks)
    print(f"{len(chunks)} paragraph chunks; the dense stand-in has {lsa.dims} dimensions")
    for name, r in [("TF-IDF", tfidf), ("BM25", bm25), ("LSA", lsa)]:
        ranks = []
        for q, ev in QUESTIONS:
            rel = {i for i, c in enumerate(chunks) if is_relevant(c, ev)}
            ranks.append(first_rank(order(r.scores(q)), rel))
        print(f"{name:<7}", {k: round(v, 3) for k, v in metrics(ranks).items()}, "first ranks:", ranks)

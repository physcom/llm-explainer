"""Scaled dot-product attention with a causal mask, using only NumPy.

Toy setup: 6 tokens, 4-dimensional vectors, random weights (seed 6).
Real models use the same arithmetic with much larger vectors and learned weights.
"""
import numpy as np

VOCAB = ["the", "cat", "dog", "sat", "ran", "on", "under", "to", "mat", "rug", "bed", "."]
TOKENS = ["the", "cat", "sat", "on", "the", "mat"]
D = 4                                    # size of each vector


def position_encoding(n, d):
    """Sine and cosine position vectors (Vaswani et al. 2017)."""
    pos = np.arange(n)[:, None]
    i = np.arange(0, d, 2)[None, :]
    angle = pos / (10000 ** (i / d))
    pe = np.zeros((n, d))
    pe[:, 0::2] = np.sin(angle)
    pe[:, 1::2] = np.cos(angle)
    return pe


def softmax(z):
    z = z - z.max(axis=-1, keepdims=True)  # for numerical stability
    e = np.exp(z)
    return e / e.sum(axis=-1, keepdims=True)


def attention_demo():
    rng = np.random.default_rng(6)
    E = rng.normal(0, 1, (len(VOCAB), D))           # embedding table: one row per token
    Wq, Wk, Wv = (rng.normal(0, 1, (D, D)) / np.sqrt(D) for _ in range(3))

    ids = [VOCAB.index(t) for t in TOKENS]
    x = E[ids] + position_encoding(len(ids), D)      # token vector + position vector
    Q, K, V = x @ Wq, x @ Wk, x @ Wv                 # query, key, value for each token

    scores = Q @ K.T / np.sqrt(D)                    # how well each query matches each key
    mask = np.triu(np.ones_like(scores, dtype=bool), k=1)
    scores = np.where(mask, -np.inf, scores)         # a token cannot look at later tokens
    weights = softmax(scores)                        # each row: positive, sum = 1
    out = weights @ V                                # weighted sum of the values
    return {"E": E, "ids": ids, "x": x, "Q": Q, "K": K, "V": V,
            "scores": scores, "weights": weights, "out": out}


if __name__ == "__main__":
    r = attention_demo()
    print("tokens :", " ".join(TOKENS))
    print("ids    :", r["ids"])
    print()
    print("attention weights (row = token, column = token it looks at):")
    print("        " + "".join(f"{t:>7}" for t in TOKENS))
    for t, row in zip(TOKENS, r["weights"]):
        print(f"{t:>7} " + "".join(f"{w:7.2f}" for w in row))
    print()
    print("row sums:", np.round(r["weights"].sum(axis=1), 6))
    print("new vector for 'mat':", np.round(r["out"][-1], 3))

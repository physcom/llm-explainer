"""A character bigram language model: count, normalise, sample with a temperature.

It predicts the next character from the current character only.
An LLM predicts the next token from all earlier tokens, but the last step is the same:
a probability for every item in the vocabulary, then one random choice.
"""
import numpy as np

TEXT = """
the cat sat on the mat. the dog sat on the rug. the cat ran to the bed.
a model learns from data. the loss tells the model how bad it is.
the gradient shows the way down. the model takes a small step each time.
attention lets each token look at the tokens before it.
the model predicts the next token, then it adds the token to the text.
""".replace("\n", " ").strip()

chars = sorted(set(TEXT))
idx = {c: i for i, c in enumerate(chars)}

# counts[a, b] = how often character b follows character a; +0.1 so that no probability is zero
counts = np.full((len(chars), len(chars)), 0.1)
for a, b in zip(TEXT, TEXT[1:]):
    counts[idx[a], idx[b]] += 1
probs = counts / counts.sum(axis=1, keepdims=True)


def with_temperature(p, t):
    """p ** (1/t), normalised: t < 1 sharpens, t > 1 flattens."""
    q = p ** (1.0 / t)
    return q / q.sum()


def sample(start, n, t, rng):
    out = start
    for _ in range(n):
        p = with_temperature(probs[idx[out[-1]]], t)
        out += chars[rng.choice(len(chars), p=p)]
    return out


print(f"text: {len(TEXT)} characters, vocabulary: {len(chars)} characters")
print()
print("next-character probabilities after 'h' (top 5):")
for t in (0.5, 1.0, 1.5):
    p = with_temperature(probs[idx["h"]], t)
    top = np.argsort(p)[::-1][:5]
    shown = "  ".join(f"{chars[i]!r}:{p[i]:.2f}" for i in top)
    print(f"  temperature {t}:  {shown}")
print()
for t in (0.5, 1.0, 1.5):
    rng = np.random.default_rng(1)
    print(f"temperature {t}: {sample('the ', 50, t, rng)!r}")

"""Two ways to make decode faster, with NumPy only.

Part 1, speculative decoding (Leviathan et al. 2022; Chen et al. 2023), on a TOY:
  the "large model" and the "draft model" are two small tables of next-token probabilities over 5 words.
  A draft model writes K tokens, the large model checks them, and the accept/reject rule keeps the
  output distribution EXACTLY the same as the large model alone. The test below checks this by counting.
Part 2, quantization, on a random weight matrix: round each weight to a grid with fewer bits.
"""
import numpy as np

WORDS = ["the", "cat", "sat", "on", "mat"]
# Large model: row = the last word, column = probability of the next word. Each row sums to 1.
TARGET = np.array([
    [0.02, 0.45, 0.03, 0.02, 0.48],     # after "the"
    [0.03, 0.02, 0.60, 0.30, 0.05],     # after "cat"
    [0.05, 0.02, 0.03, 0.80, 0.10],     # after "sat"
    [0.85, 0.03, 0.02, 0.02, 0.08],     # after "on"
    [0.10, 0.05, 0.05, 0.60, 0.20],     # after "mat"
])
# Draft model: the same habits, but less sharp (60 % large model + 40 % equal chance).
DRAFT = 0.6 * TARGET + 0.4 / len(WORDS)
K = 4                                    # tokens that the draft model writes before each check


def pick(rng, p):
    """Draw one index from the probabilities p (they need not sum to 1). Faster than rng.choice in a loop."""
    c = np.cumsum(p)
    return int(np.searchsorted(c, rng.random() * c[-1], side="right"))


def speculative_round(prev, rng, k=K):
    """One round: the draft model writes k tokens, the large model checks them in ONE pass.
    Returns the tokens that the round keeps, the details of every check, and all k draft tokens."""
    draft, last = [], prev
    for _ in range(k):
        x = pick(rng, DRAFT[last])
        draft.append(x)
        last = x
    checks, kept, last, rejected = [], [], prev, False
    for x in draft:
        p, q = TARGET[last, x], DRAFT[last, x]
        ratio = min(1.0, p / q)
        u = float(rng.random())
        ok = bool(u < ratio)
        checks.append({"word": x, "p": float(p), "q": float(q), "ratio": float(ratio), "u": u, "ok": ok})
        if ok:
            kept.append(x)
            last = x
        else:
            resid = np.maximum(TARGET[last] - DRAFT[last], 0)       # where the large model wants more
            kept.append(pick(rng, resid / resid.sum()))             # the large model writes this token
            rejected = True
            break
    if not rejected:
        kept.append(pick(rng, TARGET[last]))                        # all accepted: one free token
    return kept, checks, draft


def generate_speculative(start, n, rng, k=K):
    out, rounds = [], 0
    while len(out) < n:
        kept, _, _ = speculative_round(out[-1] if out else start, rng, k)
        out += kept
        rounds += 1
    return out[:n], rounds


def generate_target(start, n, rng):
    out, last = [], start
    for _ in range(n):
        last = pick(rng, TARGET[last])
        out.append(last)
    return out


def exact_distribution(start, n):
    """The exact probability of every n-token text under the large model."""
    dist = {(): 1.0}
    last_of = {(): start}
    for _ in range(n):
        new, new_last = {}, {}
        for seq, pr in dist.items():
            for w in range(len(WORDS)):
                s = seq + (w,)
                new[s] = pr * TARGET[last_of[seq], w]
                new_last[s] = w
        dist, last_of = new, new_last
    return dist


def run_test(trials=40_000, n=3, start=0, seed=10):
    rng = np.random.default_rng(seed)
    exact = exact_distribution(start, n)
    spec, plain, rounds = {}, {}, 0
    for _ in range(trials):
        s, r = generate_speculative(start, n, rng)
        spec[tuple(s)] = spec.get(tuple(s), 0) + 1
        rounds += r
        t = tuple(generate_target(start, n, rng))
        plain[t] = plain.get(t, 0) + 1
    def tv(cnt):
        return 0.5 * sum(abs(cnt.get(s, 0) / trials - p) for s, p in exact.items())

    return {"tv_spec": tv(spec), "tv_plain": tv(plain), "rounds_per_text": rounds / trials, "trials": trials}


def acceptance_stats(rounds=20_000, seed=11):
    """Average number of tokens that one round keeps (one pass of the large model), and the share of accepted drafts."""
    rng = np.random.default_rng(seed)
    kept_total, ok, checked, last = 0, 0, 0, 0
    for _ in range(rounds):
        kept, checks, _ = speculative_round(last, rng)
        kept_total += len(kept)
        ok += sum(c["ok"] for c in checks)
        checked += len(checks)
        last = kept[-1]
    return {"tokens_per_pass": kept_total / rounds, "accept_rate": ok / checked}


def example_round(seed=10):
    """The first round (from the word 'the') in which exactly two drafts are accepted and the third is rejected."""
    rng = np.random.default_rng(seed)
    for _ in range(10_000):
        kept, checks, draft = speculative_round(0, rng)
        if len(checks) == 3 and [c["ok"] for c in checks] == [True, True, False]:
            return {"start": 0, "draft": draft, "checks": checks, "kept": kept}
    raise RuntimeError("no example round found")


# ---------------------------------------------------------------- part 2: quantization
def quantize(v, bits, group=None):
    """Symmetric quantization. Every `group` weights (or the whole row) share one scale = largest value / levels."""
    v = np.asarray(v, dtype=float)
    qmax = 2 ** (bits - 1) - 1
    g = v.shape[-1] if group is None else group
    w = v.reshape(*v.shape[:-1], -1, g)
    scale = np.abs(w).max(axis=-1, keepdims=True) / qmax
    q = np.clip(np.round(w / scale), -qmax, qmax)
    return (q * scale).reshape(v.shape), q.reshape(v.shape), scale


def rel_error(w, w_hat):
    return float(np.linalg.norm(w - w_hat) / np.linalg.norm(w))


def quant_demo(seed=10, rows=64, cols=64, outlier=12.0):
    rng = np.random.default_rng(seed)
    W = rng.normal(0, 1, (rows, cols))
    Wo = W.copy()
    Wo[:, 0] = outlier                                 # one very large weight in every row (a toy outlier)
    rest = slice(1, None)                              # judge the error on the OTHER weights
    out = {"fp16_bits": 16}
    for bits in (8, 4):
        out[f"err_int{bits}"] = rel_error(W, quantize(W, bits)[0])
    out["err_int4_outlier_row"] = rel_error(Wo[:, rest], quantize(Wo, 4)[0][:, rest])
    out["err_int4_outlier_group16"] = rel_error(Wo[:, rest], quantize(Wo, 4, group=16)[0][:, rest])
    # one row of 16 weights, for the picture
    row = W[0, :16].copy()
    row_o = row.copy()
    row_o[0] = outlier
    for key, v in (("row", row), ("row_outlier", row_o)):
        v_hat, q, scale = quantize(v, 4)
        out[key] = {"w": v.tolist(), "w_hat": v_hat.ravel().tolist(), "q": q.ravel().tolist(), "step": float(scale.ravel()[0])}
    return out


if __name__ == "__main__":
    print("PART 1  speculative decoding on a TOY (5 words, K = 4 draft tokens per round)")
    ex = example_round()
    print("one round, after the word 'the':")
    prev = 0
    for c in ex["checks"]:
        print(f"  draft '{WORDS[c['word']]}': large model p = {c['p']:.2f}, draft q = {c['q']:.2f}, "
              f"keep with chance min(1, p/q) = {c['ratio']:.2f}, random u = {c['u']:.2f} -> {'keep' if c['ok'] else 'reject'}")
    print("  the round keeps:", " ".join(WORDS[w] for w in ex["kept"]), "(the last word comes from the large model)")
    t = run_test()
    print(f"test: {t['trials']:,} texts of 3 words, total variation distance to the exact large-model distribution")
    print(f"  speculative decoding : {t['tv_spec']:.4f}")
    print(f"  large model alone    : {t['tv_plain']:.4f}   (both are only sampling noise)")
    assert t["tv_spec"] < 0.03
    s = acceptance_stats()
    print(f"draft tokens accepted: {s['accept_rate'] * 100:.0f} %;  tokens kept per pass of the large model: {s['tokens_per_pass']:.2f} (1.00 without a draft model)")
    print()
    print("PART 2  quantization of a random 64 x 64 weight matrix (relative error = |W - W'| / |W|)")
    q = quant_demo()
    print(f"int8, one scale per row                  : error {q['err_int8'] * 100:5.2f} %   bits per weight: {8 / 16:.2f} x of 16-bit")
    print(f"int4, one scale per row                  : error {q['err_int4'] * 100:5.2f} %   bits per weight: {4 / 16:.2f} x of 16-bit")
    print(f"int4 + one outlier (12) in each row      : error {q['err_int4_outlier_row'] * 100:5.2f} %   (error on the other weights)")
    print(f"int4 + outlier, a scale for each 16 weights: error {q['err_int4_outlier_group16'] * 100:5.2f} %")

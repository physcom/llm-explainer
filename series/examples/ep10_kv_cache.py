"""Decode with and without a KV cache (NumPy only), plus the memory arithmetic for a real-size model.

Part 1 is a TOY: one layer, one attention head, 16-dimensional vectors, random weights (seed 10).
It writes tokens one at a time. One version computes the keys and values of all earlier tokens at every step.
The other version keeps them in a cache. The two versions must write the same tokens.

Part 2 is arithmetic, not a measurement. The model sizes come from the Llama 3 paper (8B model);
the memory bandwidth comes from the NVIDIA H100 SXM data sheet.
"""
import time

import numpy as np

# ---------------------------------------------------------------- part 1: the toy decoder
D = 16                  # size of each vector
VOCAB = 50              # number of tokens in the toy vocabulary
PROMPT_LEN = 8          # tokens in the prompt
NEW_TOKENS = 24         # tokens to write


def make_model(d=D, vocab=VOCAB, seed=10):
    rng = np.random.default_rng(seed)
    return {
        "E": rng.normal(0, 1, (vocab, d)),                       # embedding of each token
        "Wq": rng.normal(0, 1, (d, d)) / np.sqrt(d),
        "Wk": rng.normal(0, 1, (d, d)) / np.sqrt(d),
        "Wv": rng.normal(0, 1, (d, d)) / np.sqrt(d),
        "Wout": rng.normal(0, 1, (d, vocab)) / np.sqrt(d),       # vector -> one score per token
    }


def position(n, d):
    """Sine and cosine position vectors, as in episode 6."""
    pos = np.arange(n)[:, None]
    i = np.arange(0, d, 2)[None, :]
    angle = pos / (10000 ** (i / d))
    pe = np.zeros((n, d))
    pe[:, 0::2] = np.sin(angle)
    pe[:, 1::2] = np.cos(angle)
    return pe


def softmax(z):
    z = z - z.max()
    e = np.exp(z)
    return e / e.sum()


def attend(q, K, V, d):
    """The new token looks at every token in K and V (itself included)."""
    return softmax(K @ q / np.sqrt(d)) @ V


def decode(model, prompt, n_new, use_cache):
    """Greedy decoding. Returns the new tokens and the number of key/value vectors that were computed per step."""
    d = model["Wq"].shape[0]
    tokens = list(prompt)
    pe = position(len(prompt) + n_new, d)
    K_cache = np.zeros((0, d))
    V_cache = np.zeros((0, d))
    kv_per_step = []
    for step in range(n_new):
        if use_cache:
            first = len(K_cache)                       # tokens that are already in the cache
        else:
            first = 0                                  # no cache: start again from token 0
            K_cache, V_cache = np.zeros((0, d)), np.zeros((0, d))
        new_ids = tokens[first:]
        x = model["E"][new_ids] + pe[first:len(tokens)]
        K_cache = np.vstack([K_cache, x @ model["Wk"]])
        V_cache = np.vstack([V_cache, x @ model["Wv"]])
        kv_per_step.append(len(new_ids))
        q = x[-1] @ model["Wq"]                        # only the last token asks a question
        h = x[-1] + attend(q, K_cache, V_cache, d)
        tokens.append(int(np.argmax(h @ model["Wout"])))
    return tokens[len(prompt):], kv_per_step


def run_toy():
    model = make_model()
    prompt = list(range(3, 3 + PROMPT_LEN))
    out_a, work_a = decode(model, prompt, NEW_TOKENS, use_cache=False)
    out_b, work_b = decode(model, prompt, NEW_TOKENS, use_cache=True)
    assert out_a == out_b, "the cache must not change the output"
    return {"prompt": prompt, "tokens": out_b, "work_no_cache": work_a, "work_cache": work_b}


def time_decode(n_new=600, d=64, reps=3):
    """Wall time in seconds for a longer run (the time depends on the computer)."""
    model = make_model(d=d, vocab=200)
    prompt = list(range(8))
    best = {}
    for use_cache in (False, True):
        t = []
        for _ in range(reps):
            t0 = time.perf_counter()
            decode(model, prompt, n_new, use_cache)
            t.append(time.perf_counter() - t0)
        best[use_cache] = min(t)
    return best[False], best[True]


# ---------------------------------------------------------------- part 2: real-size arithmetic
# Llama 3 8B (Dubey et al. 2024, Table 3): 32 layers, 32 attention heads, 8 key/value heads, model dimension 4096.
CONFIG = {"layers": 32, "q_heads": 32, "kv_heads": 8, "head_dim": 4096 // 32, "params": 8.0e9, "bytes": 2}
GPU_NAME = "NVIDIA H100 SXM"
GPU_BANDWIDTH = 3.35e12      # bytes per second (3.35 TB/s, H100 data sheet)
GPU_MEMORY = 80e9            # bytes (80 GB)


def kv_bytes_per_token(cfg=CONFIG, kv_heads=None):
    """2 (key and value) x layers x key/value heads x head size x bytes per number."""
    heads = cfg["kv_heads"] if kv_heads is None else kv_heads
    return 2 * cfg["layers"] * heads * cfg["head_dim"] * cfg["bytes"]


def weight_bytes(cfg=CONFIG, bits=16):
    return cfg["params"] * bits / 8


def tokens_per_second(batch=1, context=4096, cfg=CONFIG, bits=16):
    """Upper bound from memory bandwidth: each step reads the weights once plus the cache of every request.
    It ignores compute, so it is only valid while decode is memory-bound."""
    step_bytes = weight_bytes(cfg, bits) + batch * context * kv_bytes_per_token(cfg)
    return batch / (step_bytes / GPU_BANDWIDTH)


if __name__ == "__main__":
    toy = run_toy()
    print(f"TOY decoder: {PROMPT_LEN} prompt tokens, {NEW_TOKENS} new tokens, vector size {D}")
    print("new tokens (the same with and without the cache; an assert checks this):")
    print(" ".join(map(str, toy["tokens"])))
    print()
    print("key/value vectors computed at each step (the first step reads the prompt)")
    print("step       :", " ".join(f"{i + 1:3d}" for i in range(8)), "...")
    print("no cache   :", " ".join(f"{v:3d}" for v in toy["work_no_cache"][:8]), "...")
    print("with cache :", " ".join(f"{v:3d}" for v in toy["work_cache"][:8]), "...")
    n1, n2 = sum(toy["work_no_cache"]), sum(toy["work_cache"])
    print(f"total, no cache  : {n1}")
    print(f"total, with cache: {n2}   ({n1 / n2:.1f} times fewer)")
    t0, t1 = time_decode()
    print(f"measured time for 600 new tokens (vector size 64): no cache {t0:.2f} s, with cache {t1:.2f} s")
    print()

    c = CONFIG
    print(f"REAL-SIZE ARITHMETIC: Llama 3 8B configuration, 16-bit numbers, {GPU_NAME} ({GPU_BANDWIDTH / 1e12:.2f} TB/s)")
    print(f"weights                       : {weight_bytes() / 1e9:.1f} GB")
    kv_g = kv_bytes_per_token()
    kv_m = kv_bytes_per_token(kv_heads=c["q_heads"])
    print(f"cache per token, {c['kv_heads']} KV heads   : {kv_g:,} bytes  (grouped-query attention, as published)")
    print(f"cache per token, {c['q_heads']} KV heads  : {kv_m:,} bytes  (one KV head per query head: {kv_m / kv_g:.0f} times more)")
    for ctx in (4096, 8192):
        print(f"cache of one request, {ctx:>5} tokens: {ctx * kv_g / 1e9:.2f} GB   (with {c['q_heads']} KV heads: {ctx * kv_m / 1e9:.2f} GB)")
    print()
    print("tokens per second, upper bound from memory bandwidth (context 4096):")
    for b in (1, 2, 4, 8, 16, 32, 64):
        print(f"  batch {b:>2}: {tokens_per_second(b):7.0f} tokens/s")

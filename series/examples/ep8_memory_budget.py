"""Memory for fine-tuning a 7B model: full fine-tuning, LoRA and QLoRA. Plain arithmetic plus a 4-bit rounding test.

Assumptions (the same ones are on the screen in the video):
- 7 billion weights, 32 layers, hidden size 4096. Weights and gradients are stored in 16 bits (2 bytes).
- The optimizer is Adam. It keeps two numbers per trained weight, each 32 bits (8 bytes in all).
- LoRA trains the query and value matrices of every layer (4096 x 4096 each) with rank 8.
- 4-bit storage: each weight is a 4-bit code; every block of 64 weights shares one 16-bit scale.
- The table ignores activations and the KV cache. 1 GB = 1,000,000,000 bytes.
"""
import numpy as np
from statistics import NormalDist

PARAMS = 7_000_000_000
LAYERS, HIDDEN, RANK = 32, 4096, 8
LORA_MATRICES_PER_LAYER = 2          # query and value
BYTES_WEIGHT, BYTES_GRAD, BYTES_OPT = 2, 2, 8
BLOCK, BITS, SCALE_BITS = 64, 4, 16
GB = 1e9


def lora_params(d_out=HIDDEN, d_in=HIDDEN, r=RANK):
    """Trainable weights of one LoRA pair: B is d_out x r, A is r x d_in."""
    return d_out * r + r * d_in


def budget() -> dict:
    adapter = LAYERS * LORA_MATRICES_PER_LAYER * lora_params()
    bits_per_weight = BITS + SCALE_BITS / BLOCK
    q_base = PARAMS * bits_per_weight / 8
    adapter_bytes = adapter * (BYTES_WEIGHT + BYTES_GRAD + BYTES_OPT)
    full = {"weights": PARAMS * BYTES_WEIGHT, "gradients": PARAMS * BYTES_GRAD, "optimizer": PARAMS * BYTES_OPT,
            "adapters": 0}
    lora = {"weights": PARAMS * BYTES_WEIGHT, "gradients": adapter * BYTES_GRAD, "optimizer": adapter * BYTES_OPT,
            "adapters": adapter * BYTES_WEIGHT}
    qlora = {**lora, "weights": q_base}
    rows = {}
    for name, d in [("full", full), ("lora", lora), ("qlora", qlora)]:
        rows[name] = {k: v / GB for k, v in d.items()}
        rows[name]["total"] = sum(d.values()) / GB
    full_matrix = HIDDEN * HIDDEN
    pair = lora_params()
    customers = 1000
    return {
        "params": PARAMS, "layers": LAYERS, "hidden": HIDDEN, "rank": RANK,
        "bytes": {"weight": BYTES_WEIGHT, "grad": BYTES_GRAD, "opt": BYTES_OPT},
        "bits_per_weight": bits_per_weight, "block": BLOCK,
        "adapter_params": adapter, "adapter_mb": adapter * BYTES_WEIGHT / 1e6, "adapter_train_mb": adapter_bytes / 1e6,
        "rows": rows,
        "matrix": {"full": full_matrix, "lora": pair, "pct": 100 * pair / full_matrix},
        "customers": customers,
        "copies_gb": customers * PARAMS * BYTES_WEIGHT / GB,
        "adapters_gb": customers * adapter * BYTES_WEIGHT / GB + PARAMS * BYTES_WEIGHT / GB,
    }


def nf_levels(n=16):
    """16 levels spaced for normally distributed weights (an NF4-style grid, scaled to [-1, 1])."""
    nd = NormalDist()
    q = np.array([nd.inv_cdf((i + 0.5) / n) for i in range(n)])
    return q / np.abs(q).max()


def uniform_levels(n=16):
    return np.linspace(-1, 1, n)


def quantize(W, levels, block=BLOCK):
    """Blockwise 4-bit quantization: scale each block by its largest |w|, then pick the nearest of 16 levels."""
    flat = W.reshape(-1, block)
    scale = np.abs(flat).max(axis=1, keepdims=True)
    unit = flat / scale
    mids = (levels[1:] + levels[:-1]) / 2
    codes = np.searchsorted(mids, unit)                   # 0..15: the 4-bit code of each weight
    return codes, scale, (levels[codes] * scale).reshape(W.shape)


def rel_error(W, W_hat):
    return float(np.linalg.norm(W - W_hat) / np.linalg.norm(W))


def quant_demo(seed=8, n=1024):
    """Round a random normal matrix to 4 bits two ways. Real weights are roughly normal, so this is a fair test."""
    rng = np.random.default_rng(seed)
    W = rng.normal(0, 0.02, (n, n))
    out = {"n": n, "weights": n * n}
    for name, lv in [("uniform", uniform_levels()), ("normal", nf_levels())]:
        codes, scale, W_hat = quantize(W, lv)
        out[name] = {"rel_error": rel_error(W, W_hat), "levels": [round(float(x), 3) for x in lv]}
        if name == "normal":
            out["block"] = {"w": W.reshape(-1, BLOCK)[0, :8].tolist(), "scale": float(scale[0, 0]),
                            "codes": [int(c) for c in codes[0, :8]], "back": W_hat.reshape(-1, BLOCK)[0, :8].tolist()}
    return out


if __name__ == "__main__":
    b = budget()
    print(f"model: {b['params'] / 1e9:.0f}B weights, {b['layers']} layers, hidden size {b['hidden']}; "
          f"weights and gradients in 16 bits, Adam state 2 x 32 bits")
    print(f"one {b['hidden']} x {b['hidden']} matrix: {b['matrix']['full']:,} weights; "
          f"LoRA pair, rank {b['rank']}: {b['matrix']['lora']:,} weights ({b['matrix']['pct']:.2f} %)")
    print(f"LoRA on query and value of every layer: {b['adapter_params']:,} trainable weights "
          f"({b['adapter_mb']:.1f} MB as 16-bit numbers)")
    print()
    print(f"{'GB':14s}{'full':>10s}{'LoRA':>10s}{'QLoRA':>10s}")
    for k in ["weights", "gradients", "optimizer", "adapters", "total"]:
        print(f"{k:14s}" + "".join(f"{b['rows'][m][k]:10.2f}" for m in ["full", "lora", "qlora"]))
    print()
    print(f"4-bit storage: {b['bits_per_weight']:.2f} bits per weight (4-bit code + one 16-bit scale per {b['block']} weights)")
    print(f"{b['customers']:,} customers: {b['copies_gb']:,.0f} GB for full copies, "
          f"{b['adapters_gb']:,.1f} GB for one base model and {b['customers']:,} adapters")
    q = quant_demo()
    print()
    print(f"rounding a random {q['n']} x {q['n']} normal matrix to 4 bits (relative error, smaller is better):")
    print(f"  evenly spaced 16 levels:   {q['uniform']['rel_error']:.4f}")
    print(f"  normal-spaced 16 levels:   {q['normal']['rel_error']:.4f}")

"""Episode 10 - Inference and serving (deep dive)."""
import importlib.util
import sys
from functools import lru_cache

import numpy as np

from common import EXAMPLES as EXAMPLES_DIR


def r(v, n=3):
    if isinstance(v, (list, tuple, np.ndarray)):
        return [r(x, n) for x in v]
    return round(float(v), n)


@lru_cache(maxsize=None)
def _load(name: str):
    """Import an example file (examples/ is not a package)."""
    if str(EXAMPLES_DIR) not in sys.path:
        sys.path.insert(0, str(EXAMPLES_DIR))
    spec = importlib.util.spec_from_file_location(name, EXAMPLES_DIR / f"{name}.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


@lru_cache(maxsize=None)
def _acceptance() -> dict:
    return _load("ep10_faster_decoding").acceptance_stats()


@lru_cache(maxsize=None)
def _speculative_test() -> dict:
    return _load("ep10_faster_decoding").run_test()


@lru_cache(maxsize=None)
def _facts() -> dict:
    """The few numbers that the narration says. They come from the example files, never from typing."""
    kv, bs, fd, cr = (_load(n) for n in ("ep10_kv_cache", "ep10_batching_sim", "ep10_faster_decoding", "ep10_cache_route"))
    toy = kv.run_toy()
    cfg = kv.CONFIG
    per_tok = kv.kv_bytes_per_token()
    st = bs.stats(bs.static_batching(bs.OUTPUT_LENGTHS), bs.OUTPUT_LENGTHS)
    ct = bs.stats(bs.continuous_batching(bs.OUTPUT_LENGTHS), bs.OUTPUT_LENGTHS)
    mem = bs.memory()
    acc = _acceptance()
    cost = cr.prefix_cost()
    rt = cr.routing_demo()
    return {
        "weights_gb": kv.weight_bytes() / 1e9,
        "bw_tb": kv.GPU_BANDWIDTH / 1e12,
        "step_ms": kv.weight_bytes() / kv.GPU_BANDWIDTH * 1e3,
        "tps_weights": kv.tokens_per_second(1, 0),
        "layers": cfg["layers"], "kv_heads": cfg["kv_heads"], "q_heads": cfg["q_heads"],
        "head_dim": cfg["head_dim"], "bytes": cfg["bytes"],
        "kb_per_token": per_tok / 1e3,
        "mha_ratio": kv.kv_bytes_per_token(kv_heads=cfg["q_heads"]) / per_tok,
        "group": cfg["q_heads"] // cfg["kv_heads"],
        "ctx": 8192, "req_gb": 8192 * per_tok / 1e9,
        "batch_n": 8, "tps_b8": kv.tokens_per_second(8, 4096), "tps_b1": kv.tokens_per_second(1, 4096),
        "kv_toy_no": sum(toy["work_no_cache"]), "kv_toy_cache": sum(toy["work_cache"]),
        "steps_static": st["steps"], "steps_cont": ct["steps"], "block": bs.BLOCK,
        "waste_reserved": mem["waste_contiguous"] * 100, "waste_paged": mem["waste_paged"] * 100,
        "K": fd.K, "accept": acc["accept_rate"] * 100, "per_pass": acc["tokens_per_pass"],
        "cost_without": cost["without"], "cost_with": cost["with"], "requests": cr.REQUESTS,
        "route_pct": (1 - rt["routed"] / rt["all_large"]) * 100,
    }


F = _facts()

EPISODE = {
    "id": "ep10",
    "n": 10,
    "level": "Deep dive",
    "title": "Inference and serving",
    "blurb": "Serving an LLM is a memory problem. The KV cache, batching, paged memory, speculative decoding, "
             "quantization and caching make each token faster and cheaper.",
}

CHAPTERS = [
    ("phases", "Prefill and decode"),
    ("kvcache", "The KV cache"),
    ("batching", "Batching and paged memory"),
    ("speed", "Faster decoding"),
    ("cost", "Cache and route"),
]

SEGMENTS = [
    ("phases", "p1", "In episode six, the model wrote one token at a time. Now we make this fast and cheap."),
    ("phases", "p2", "A request has two phases. Prefill reads the whole prompt at once. "
                     "Decode writes the reply, one token for each step."),
    ("phases", "p3", "In prefill, one read of the weights serves every prompt token. "
                     "The GPU is busy, so prefill is compute-bound."),
    ("phases", "p4", "In decode, each read of the weights serves only one token. "
                     "The GPU waits for memory, so decode is memory-bound."),
    ("phases", "p5", f"One H100 GPU reads {F['bw_tb']:.2f} terabytes per second."),
    ("phases", "p6", f"Llama 3 8B has {F['weights_gb']:.0f} GB of weights, "
                     f"so the limit is about {round(F['tps_weights'], -1):.0f} tokens per second."),

    ("kvcache", "k1", "Attention needs the keys and values of all earlier tokens. "
                      "Without a cache, the model computes them again at every step."),
    ("kvcache", "k2", "But old keys and values never change. Thus, the server stores them: the KV cache."),
    ("kvcache", "k3", f"With the cache, each step computes only the new key and value. "
                      f"Our toy test needs {F['kv_toy_cache']} pairs, not {F['kv_toy_no']}."),
    ("kvcache", "k4", f"The cache holds a key and value for each token, layer and KV head. "
                      f"Llama 3 8B needs {F['kb_per_token']:.0f} kilobytes per token."),
    ("kvcache", "k5", f"Grouped-query attention shares each KV head with {F['group']} query heads. "
                      f"Otherwise, the cache is {F['mha_ratio']:.0f} times bigger."),
    ("kvcache", "k6", f"One request of {F['ctx']:,} tokens needs {F['req_gb']:.2f} GB of cache."),

    ("batching", "b1", f"A batch shares one read of the weights. "
                       f"With {F['batch_n']} requests, the limit is {F['tps_b8']:,.0f} tokens per second, not {F['tps_b1']:.0f}."),
    ("batching", "b2", "Requests end at different times. Static batching waits for the longest request, so slots stay idle."),
    ("batching", "b3", f"In continuous batching, a new request takes each free slot at every step. "
                       f"Here, {F['steps_cont']} steps replace {F['steps_static']}."),
    ("batching", "b4", f"A simple server reserves space for the longest text of each request. "
                       f"Here, {F['waste_reserved']:.0f} percent stays empty."),
    ("batching", "b5", f"Paged attention cuts the cache into blocks of {F['block']} tokens. "
                       f"Waste falls to {F['waste_paged']:.1f} percent, and requests can share blocks."),

    ("speed", "s1", f"In speculative decoding, a small draft model quickly writes {F['K']} tokens. "
                    f"The large model checks all {F['K']} in one pass."),
    ("speed", "s2", "It keeps the good tokens. At the first bad token, it writes its own token and stops."),
    ("speed", "s3", "A simple rule keeps the output distribution the same as with the large model alone. "
                    "Our test confirms this."),
    ("speed", "s4", f"In our toy test, {F['accept']:.0f} percent of the draft tokens pass. "
                    f"One large-model pass keeps {F['per_pass']:.1f} tokens, not 1."),
    ("speed", "s5", "Quantization stores each weight with fewer bits. At 4 bits, the weights are 4 times smaller, "
                    "but less precise."),

    ("cost", "c1", "Many requests start with the same text. Prompt caching stores the work for it, "
                   "so a cached token costs far less."),
    ("cost", "c2", "A cache matches only the start of the prompt. Thus, put the text that never changes first."),
    ("cost", "c3", f"For {F['requests']} requests with a 20,000-token start, input cost "
                   f"falls from ${F['cost_without']:.2f} to ${F['cost_with']:.2f}."),
    ("cost", "c4", "Semantic caching reuses the answer to a similar question. "
                   "But a similar question can need a different answer."),
    ("cost", "c5", f"Routing sends easy prompts to a small model and hard prompts to a large one. "
                   f"Here, the toy cost falls {F['route_pct']:.0f} percent."),
    ("cost", "c6", "One model call is now fast and cheap. Next, a model calls tools in a loop: agents."),
]

# TTS only: the subtitles keep the written form.
SPOKEN = [
    ("KV", "K V"),
    ("H100", "H 100"),
    ("Llama", "Lama"),
]

EXAMPLES = [
    {
        "title": "Decode with and without a KV cache",
        "file": "ep10_kv_cache.py",
        "ran": True,
        "about": "A toy decoder (one layer, one head, random weights) writes 24 tokens twice: once with a KV cache and once "
                 "without. An assert checks that the tokens are the same. The file prints how many key/value vectors each "
                 "version computes. The second half is arithmetic for the Llama 3 8B configuration on an H100: cache bytes "
                 "per token, the cache of one request, and the upper limit on tokens per second from memory bandwidth.",
    },
    {
        "title": "Batching and paged memory",
        "file": "ep10_batching_sim.py",
        "ran": True,
        "about": "A small simulation with made-up request lengths. Static batching waits for the longest request; continuous "
                 "batching fills a free slot at every step. Then the cache memory of 8 requests is counted three ways: "
                 "reserved space for the longest text, paged blocks of 16 tokens, and paged blocks with one shared system prompt.",
    },
    {
        "title": "Speculative decoding and quantization",
        "file": "ep10_faster_decoding.py",
        "ran": True,
        "about": "Part 1 implements the accept/reject rule of speculative decoding on two toy next-word tables, and checks by "
                 "counting that the output distribution equals the large model's. Part 2 rounds a random weight matrix to 8 "
                 "bits and 4 bits, with and without one very large weight, and with one scale per group of 16 weights.",
    },
    {
        "title": "Prompt caching, semantic caching, routing",
        "file": "ep10_cache_route.py",
        "ran": True,
        "about": "The input cost of 50 requests that share a 20,000-token start, with and without prompt caching, at the list "
                 "prices that were current on 2026-11-22. Then a toy semantic cache (TF-IDF in place of embeddings) with one "
                 "right hit and one wrong hit, and a toy rule that routes short prompts to a small model.",
    },
]

SOURCES = [
    {"label": "Llama 3 8B configuration: 32 layers, 32 attention heads, 8 key/value heads, model dimension 4096",
     "text": "Dubey et al. 2024, The Llama 3 Herd of Models, Table 3.",
     "url": "https://arxiv.org/abs/2407.21783"},
    {"label": "Memory bandwidth 3.35 TB/s, 80 GB (H100 SXM)",
     "text": "NVIDIA H100 product specifications, read 2026-11-22.",
     "url": "https://www.nvidia.com/en-us/data-center/h100/"},
    {"label": "Fewer key/value heads: multi-query and grouped-query attention",
     "text": "Shazeer 2019, Fast Transformer Decoding: One Write-Head is All You Need. Ainslie et al. 2023, GQA.",
     "url": "https://arxiv.org/abs/2305.13245"},
    {"label": "Paged attention and block tables",
     "text": "Kwon et al. 2023, Efficient Memory Management for Large Language Model Serving with PagedAttention (vLLM).",
     "url": "https://arxiv.org/abs/2309.06180"},
    {"label": "Continuous batching",
     "text": "Yu et al. 2022, Orca: A Distributed Serving System for Transformer-Based Generative Models.",
     "url": "https://www.usenix.org/conference/osdi22/presentation/yu"},
    {"label": "Speculative decoding and the accept/reject rule",
     "text": "Leviathan et al. 2022, Fast Inference from Transformers via Speculative Decoding. "
             "Chen et al. 2023, Accelerating Large Language Model Decoding with Speculative Sampling (arXiv 2302.01318).",
     "url": "https://arxiv.org/abs/2211.17192"},
    {"label": "Outliers in quantization",
     "text": "Dettmers et al. 2022, LLM.int8(). Also: Frantar et al. 2022, GPTQ (arXiv 2210.17323); Lin et al. 2023, AWQ (arXiv 2306.00978).",
     "url": "https://arxiv.org/abs/2208.07339"},
    {"label": "Prompt caching: static text first, 5-minute default lifetime, cache read and write prices",
     "text": "Anthropic docs, Prompt caching.",
     "url": "https://platform.claude.com/docs/en/build-with-claude/prompt-caching"},
    {"label": "Prices (Claude Opus 5.5: $4 input, $5 cache write, $0.20 cache read per million tokens; Claude Haiku 5.5: $0.10 input)",
     "text": "Anthropic pricing page, read 2026-11-22. Prices change: check the page.",
     "url": "https://platform.claude.com/docs/en/about-claude/pricing"},
    {"label": "Topic map and cross-check (no number comes from it)",
     "text": "Daily Dose of Data Science, article on KV caching in LLMs. Its articles on paged attention, batching, speculative "
             "decoding, quantization and caching cover the same topics.",
     "url": "https://www.dailydoseofds.com/p/kv-caching-in-llms-explained-visually/"},
    {"label": "Numbers on screen",
     "text": "Every number comes from running the example files during the build. The request lengths, the draft and large "
             "model tables, the questions and the prompts are toys that we made up for the lesson. "
             "The speed figures are upper limits from memory bandwidth, not measurements of a real server.",
     "url": None},
]


# Every number that the scenes show. Nothing on screen is typed by hand.
def nums() -> dict:
    kv, bs, fd, cr = (_load(n) for n in ("ep10_kv_cache", "ep10_batching_sim", "ep10_faster_decoding", "ep10_cache_route"))
    cfg = kv.CONFIG
    toy = kv.run_toy()
    per_tok = kv.kv_bytes_per_token()
    per_tok_mha = kv.kv_bytes_per_token(kv_heads=cfg["q_heads"])

    # batching: both schedules, and the memory counts
    st_grid, ct_grid = bs.static_batching(bs.OUTPUT_LENGTHS), bs.continuous_batching(bs.OUTPUT_LENGTHS)
    mem = bs.memory()
    tables = bs.block_tables()

    # speculative decoding: one round, the test, the averages
    rnd = fd.example_round()
    test = _speculative_test()
    acc = _acceptance()
    qd = fd.quant_demo()

    cost = cr.prefix_cost()
    sem = cr.semantic_cache()
    rt = cr.routing_demo()

    bits = []
    for b in (16, 8, 4):
        bits.append({"bits": b, "gb": kv.weight_bytes(bits=b) / 1e9, "tps": kv.tokens_per_second(1, 0, bits=b)})

    return {
        "model": {"name": "Llama 3 8B", "layers": cfg["layers"], "q_heads": cfg["q_heads"], "kv_heads": cfg["kv_heads"],
                  "head_dim": cfg["head_dim"], "bytes": cfg["bytes"]},
        "gpu": {"name": kv.GPU_NAME, "bw_tb": kv.GPU_BANDWIDTH / 1e12, "mem_gb": kv.GPU_MEMORY / 1e9},
        "weights_gb": r(kv.weight_bytes() / 1e9, 1),
        "step_ms": r(kv.weight_bytes() / kv.GPU_BANDWIDTH * 1e3, 1),
        "tps_weights": r(kv.tokens_per_second(1, 0), 0),
        "prompt_len": kv.PROMPT_LEN, "new_tokens": kv.NEW_TOKENS,
        "work_no_cache": toy["work_no_cache"], "work_cache": toy["work_cache"],
        "kv_total_no": sum(toy["work_no_cache"]), "kv_total_cache": sum(toy["work_cache"]),
        "kv_per_token": per_tok, "kv_per_token_mha": per_tok_mha,
        "kv_ratio": r(per_tok_mha / per_tok, 1),
        "ctx": 8192, "req_gb": r(8192 * per_tok / 1e9, 2),
        "req_fit": int((kv.GPU_MEMORY - kv.weight_bytes()) // (8192 * per_tok)),
        "curve_ctx": 4096,
        "curve": [{"batch": b, "tps": r(kv.tokens_per_second(b, 4096), 0)} for b in (1, 2, 4, 8, 16, 32, 64)],
        "lengths": bs.OUTPUT_LENGTHS, "slots": bs.SLOTS,
        "static": st_grid, "continuous": ct_grid,
        "static_stats": bs.stats(st_grid, bs.OUTPUT_LENGTHS), "cont_stats": bs.stats(ct_grid, bs.OUTPUT_LENGTHS),
        "used": bs.USED_TOKENS, "max_context": bs.MAX_CONTEXT, "block": bs.BLOCK, "prefix": bs.SHARED_PREFIX,
        "mem": {k: (r(v, 4) if isinstance(v, float) else v) for k, v in mem.items()},
        "table0": tables[0][:6],
        "words": fd.WORDS, "K": fd.K,
        "round": {"start": rnd["start"], "draft": rnd["draft"], "kept": rnd["kept"],
                  "checks": [{k: (r(v, 2) if isinstance(v, float) else v) for k, v in c.items()} for c in rnd["checks"]]},
        "spec": {"tv_spec": r(test["tv_spec"], 4), "tv_plain": r(test["tv_plain"], 4), "trials": test["trials"],
                 "accept": r(acc["accept_rate"] * 100, 0), "per_pass": r(acc["tokens_per_pass"], 2)},
        "bits": [{k: r(v, 1) for k, v in b.items()} for b in bits],
        "quant": {"row": qd["row"], "row_outlier": qd["row_outlier"],
                  "err_int8": r(qd["err_int8"] * 100, 2), "err_int4": r(qd["err_int4"] * 100, 1),
                  "err_outlier": r(qd["err_int4_outlier_row"] * 100, 1),
                  "err_group": r(qd["err_int4_outlier_group16"] * 100, 1)},
        "price": {m: dict(p) for m, p in cr.PRICE.items()},
        "cache": {"prefix": cr.PREFIX_TOKENS, "new": cr.NEW_TOKENS, "requests": cr.REQUESTS,
                  "without": r(cost["without"], 3), "with": r(cost["with"], 3)},
        "semantic": {"threshold": cr.THRESHOLD, "rows": [{k: (r(v, 2) if isinstance(v, float) else v) for k, v in s.items()} for s in sem]},
        "routing": {"rows": [{"prompt": x["prompt"], "easy": x["easy"], "model": x["model"], "cost": r(x["cost"], 5)} for x in rt["rows"]],
                    "all_large": r(rt["all_large"], 4), "routed": r(rt["routed"], 4),
                    "pct": r((1 - rt["routed"] / rt["all_large"]) * 100, 0),
                    "in_tokens": cr.IN_TOKENS, "out_tokens": cr.OUT_TOKENS},
    }

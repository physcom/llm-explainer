"""Episode 8 - Fine-tuning (deep dive): SFT, LoRA, QLoRA, and when to fine-tune."""
import importlib.util
import sys

import numpy as np

from common import EXAMPLES as EXAMPLES_DIR


def _load(name: str):
    """Import an example file (examples/ is not a package)."""
    if str(EXAMPLES_DIR) not in sys.path:
        sys.path.insert(0, str(EXAMPLES_DIR))
    spec = importlib.util.spec_from_file_location(name, EXAMPLES_DIR / f"{name}.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


_mem = _load("ep8_memory_budget")
_B = _mem.budget()                      # plain arithmetic: the narration uses the same numbers as the screen
_ROWS = _B["rows"]
_M = _B["matrix"]

EPISODE = {
    "id": "ep8",
    "n": 8,
    "level": "Deep dive",
    "title": "Fine-tuning",
    "blurb": "Train a pre-trained model a little more on your own examples. LoRA trains two thin matrices instead of "
             "all the weights, and QLoRA also stores the frozen weights in 4 bits.",
}

CHAPTERS = [
    ("why", "Why fine-tune?"),
    ("sft", "Supervised fine-tuning"),
    ("lora", "LoRA"),
    ("qlora", "QLoRA"),
    ("choose", "Prompt, RAG or fine-tune?"),
]

SEGMENTS = [
    ("why", "w1", "A pre-trained model is a generalist. It knows many things, but not your task."),
    ("why", "w2", "Often a good prompt or RAG is enough. Sometimes you need a fixed style, a format, or a skill in your field."),
    ("why", "w3", "Fine-tuning solves this. You train the model more, on your own examples. This changes its weights."),
    ("why", "w4", "Full fine-tuning updates every weight. For each weight, the computer also keeps a gradient and the optimizer state."),
    ("why", "w5", f"A 7B model then needs {_ROWS['full']['total']:.0f} GB of memory. And each customer needs a full copy of the new model."),

    ("sft", "s1", "The most common method is SFT, which means supervised fine-tuning. Each example has a prompt and an ideal answer."),
    ("sft", "s2", "The loss is the same as in episode six. But we count it only on the answer tokens, not on the prompt."),
    ("sft", "s3", "Use a small learning rate and few passes over the data. You want to adjust the model, not replace it."),
    ("sft", "s4", "Quality matters more than quantity. A few clean, correct examples often beat many bad ones."),
    ("sft", "s5", "There are two risks. The model can forget old skills, or overfit a small data set, as in episode two."),

    ("lora", "l1", "Full fine-tuning changes the big matrix W. LoRA freezes W and trains a small update instead."),
    ("lora", "l2", "The update is the product of two thin matrices, B and A. The rank r is their small shared size."),
    ("lora", "l3", f"One big matrix has {_M['full'] / 1e6:.1f} million weights. "
                   f"With rank {_B['rank']}, B and A have only {_M['pct']:.1f} percent of them."),
    ("lora", "l4", "At the start, B is all zeros. So the update is zero, and the model starts exactly as before."),
    ("lora", "l5", "Training changes only B and A. This works when the change that the task needs has few main directions."),
    ("lora", "l6", "In a toy test, full fine-tuning fits the noise in 24 examples. LoRA, with rank 4, fits only the main change."),
    ("lora", "l7", "On new data, LoRA has the smaller error. It also moves less from the old task."),
    ("lora", "l8", "The scale alpha divided by r sets the update size. Merge it into W, and inference has no extra delay."),
    ("lora", "l9", "Or keep the pair B and A apart, as an adapter. It is small, so each customer can have one."),

    ("qlora", "q1", f"The frozen weights are still big: a 7B model has {_ROWS['lora']['weights']:.0f} GB in 16-bit numbers."),
    ("qlora", "q2", "QLoRA stores the frozen weights in 4 bits. A 4-bit code has only 16 values, so the computer rounds each weight."),
    ("qlora", "q3", f"It splits the weights into blocks of {_B['block']}. Each block keeps one scale, and each weight keeps a 4-bit code."),
    ("qlora", "q4", "During the forward pass, the computer converts the codes back to 16-bit numbers. The adapters train in 16-bit."),
    ("qlora", "q5", f"Full fine-tuning needs {_ROWS['full']['total']:.0f} GB, LoRA needs {_ROWS['lora']['total']:.1f} GB, "
                    f"and QLoRA needs {_ROWS['qlora']['total']:.1f} GB."),
    ("qlora", "q6", "The 4-bit error is small, but real. Check the quality of the result with your evals."),

    ("choose", "c1", "How do you choose? Start with the cheapest method. Move on only when your evals say so."),
    ("choose", "c2", "First, improve the prompt. Second, add RAG when the model needs facts that change, or facts with a source."),
    ("choose", "c3", "Third, fine-tune when you need a stable behaviour: a style, a format, or a skill."),
    ("choose", "c4", "The methods combine. Fine-tune for the format, and use RAG for the facts. Test every step with your evals."),
    ("choose", "c5", "Fine-tuning with examples teaches imitation. In the next episode, you learn how to teach a model what is better."),
]

# TTS only: the subtitles keep the written form. A lone "A" can sound like the article, so "B and A" is spelled out.
SPOKEN = [
    ("B and A", "bee and ay"),
    ("QLoRA", "Q Lora"),
    ("SFT", "S F T"),
    ("7B", "7 B"),
    ("pre-trained", "pre trained"),
    ("fine-tuning", "fine tuning"),
    ("fine-tuned", "fine tuned"),
    ("fine-tune", "fine tune"),
    ("W", "double you"),
]

EXAMPLES = [
    {
        "title": "LoRA against full fine-tuning (toy model)",
        "file": "ep8_lora_numpy.py",
        "ran": True,
        "about": "One weight matrix is the whole toy model. Task B needs a change that is close to low rank, and there are "
                 "only 24 noisy examples of it. The code trains all 1,024 weights (full fine-tuning), then trains only B and A "
                 "(LoRA) with the same optimizer, and prints the trainable weights and the error on new data for both tasks. "
                 "It also prints a sweep over the rank r. A real LLM has many such matrices; the toy only shows the idea.",
    },
    {
        "title": "Memory for 7B: full, LoRA and QLoRA",
        "file": "ep8_memory_budget.py",
        "ran": True,
        "about": "Plain arithmetic with the assumptions in the file header: 16-bit weights and gradients, Adam with two 32-bit "
                 "numbers per trained weight, LoRA on the query and value matrices with rank 8, and 4-bit codes with one 16-bit "
                 "scale per 64 weights. It also rounds a random matrix to 4 bits with evenly spaced and with normal-spaced levels. "
                 "The table ignores activations and the KV cache, so real jobs need more.",
    },
]

SOURCES = [
    {"label": "LoRA: freeze W, train B and A (update = B A, rank r, scale alpha / r)",
     "text": "Hu et al. 2021, LoRA: Low-Rank Adaptation of Large Language Models.",
     "url": "https://arxiv.org/abs/2106.09685"},
    {"label": "QLoRA: 4-bit base model, 16-bit adapters, blockwise quantization",
     "text": "Dettmers et al. 2023, QLoRA: Efficient Finetuning of Quantized LLMs.",
     "url": "https://arxiv.org/abs/2305.14314"},
    {"label": "Supervised fine-tuning on prompt and answer pairs",
     "text": "Ouyang et al. 2022, Training language models to follow instructions with human feedback (the SFT step).",
     "url": "https://arxiv.org/abs/2203.02155"},
    {"label": "Optimizer state: Adam keeps two numbers per weight",
     "text": "Kingma and Ba 2014, Adam: A Method for Stochastic Optimization.",
     "url": "https://arxiv.org/abs/1412.6980"},
    {"label": "LoRA in practice (adapters, merge, rank, alpha)",
     "text": "Hugging Face PEFT documentation, LoRA conceptual guide.",
     "url": "https://huggingface.co/docs/peft/main/en/conceptual_guides/lora"},
    {"label": "Topic map and cross-check (not a source of any number)",
     "text": "Daily Dose of Data Science, 5 LLM fine-tuning techniques; and LoRA and QLoRA explained from a business lens. "
             "We read these two pages to check which topics a fine-tuning lesson should cover. The explanations and the code are our own.",
     "url": "https://www.dailydoseofds.com/p/5-llm-fine-tuning-techniques/"},
    {"label": "Numbers on screen",
     "text": "The memory table, the weight counts and the rounding errors come from running ep8_memory_budget.py. "
             "The toy losses and curves come from running ep8_lora_numpy.py (a toy: one 32 x 32 matrix, not an LLM). "
             "The 7B size, 32 layers and hidden size 4096 are the stated assumptions of the example, not a measurement. "
             "The 4-bit storage is simplified: one 16-bit scale for each block of 64 weights. The QLoRA paper also uses the NF4 "
             "data type and double quantization of the scales, so its memory per weight is a little lower.",
     "url": None},
]


def r(v, n=4):
    if isinstance(v, (list, tuple, np.ndarray)):
        return [r(x, n) for x in v]
    return round(float(v), n)


# SFT data for the scene: tokens are words (a toy tokenizer). The loss mask comes from the token lists.
PAIRS = [
    {"prompt": ["Where", "is", "order", "A-1042", "?"], "answer": ["Hello", "!", "It", "ships", "today", "."]},
    {"prompt": ["Can", "I", "return", "a", "bike", "?"], "answer": ["Yes", "!", "Send", "it", "back", "."]},
]


def nums() -> dict:
    lora = _load("ep8_lora_numpy")
    o = lora.run()
    keep = lambda d: {k: r(d[k]) for k in ("train_B", "test_B", "test_A")}   # noqa: E731
    full, lo = o["full"], o["lora"]
    # The narration (l6, l7) says: full fine-tuning fits the noise; LoRA makes the smaller error on new data and moves
    # less away from the old task. Fail the build if the real run does not show that.
    assert full["train_B"] < lo["train_B"], "full fine-tuning should fit the training examples better"
    assert lo["test_B"] < full["test_B"], "LoRA should have the smaller error on new task B data"
    assert lo["test_A"] < full["test_A"], "LoRA should move less away from the old task"
    q = _mem.quant_demo()
    assert q["normal"]["rel_error"] < q["uniform"]["rel_error"]
    step = 5
    return {
        "budget": {
            "params": _B["params"], "layers": _B["layers"], "hidden": _B["hidden"], "rank": _B["rank"],
            "bytes": _B["bytes"], "bits_per_weight": r(_B["bits_per_weight"], 2), "block": _B["block"],
            "adapter_params": _B["adapter_params"], "adapter_mb": r(_B["adapter_mb"], 1),
            "rows": {m: {k: r(v, 2) for k, v in d.items()} for m, d in _ROWS.items()},
            "matrix": {"full": _M["full"], "lora": _M["lora"], "pct": r(_M["pct"], 2)},
            "customers": _B["customers"], "copies_gb": r(_B["copies_gb"], 0), "adapters_gb": r(_B["adapters_gb"], 1),
        },
        "toy": {
            "d": lora.D_OUT, "n_train": lora.N_TRAIN, "steps": lora.STEPS, "lr": lora.LR, "rank": lora.RANK,
            "alpha": lora.ALPHA, "noise": lora.NOISE,
            "before": keep(o["before"]), "ideal": keep(o["ideal"]),
            "full": {**keep(full), "params": full["params"], "curve": r(full["curve"][::step])},
            "lora": {**keep(lo), "params": lo["params"], "curve": r(lo["curve"][::step])},
            "curve_step": step,
            "energy": {str(k): r(v, 3) for k, v in o["energy"].items()},
            "sweep": [{"r": s["r"], "params": s["params"], "test_B": r(s["test_B"]), "test_A": r(s["test_A"])} for s in o["sweep"]],
            "B_end": r(lo["B"][:6, :], 2), "A_end": r(lo["A"][:, :8], 2),
            "A_start": r(lora.init_A(lora.RANK)[:, :8], 2),
        },
        "quant": {
            "levels_uniform": q["uniform"]["levels"], "levels_normal": q["normal"]["levels"],
            "err_uniform": r(q["uniform"]["rel_error"], 4), "err_normal": r(q["normal"]["rel_error"], 4),
            "block": {k: r(v, 4) if k != "codes" else v for k, v in q["block"].items()},
        },
        "pairs": [{**p, "mask": [0] * len(p["prompt"]) + [1] * len(p["answer"])} for p in PAIRS],
    }

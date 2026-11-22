"""Episode 6 - From ML to LLMs (advanced)."""
import importlib.util
from pathlib import Path

import numpy as np


def r(v, n=3):
    if isinstance(v, (list, tuple, np.ndarray)):
        return [r(x, n) for x in v]
    return round(float(v), n)


EPISODE = {
    "id": "ep6",
    "n": 6,
    "level": "Advanced",
    "title": "From ML to LLMs",
    "blurb": "An LLM is also a function with parameters. It changes text into tokens and vectors, uses attention, and predicts the next token.",
}

CHAPTERS = [
    ("tokens", "Tokens"),
    ("embed", "Embeddings"),
    ("attention", "Attention"),
    ("predict", "Next-token prediction"),
    ("train", "Training an LLM"),
]

SEGMENTS = [
    ("tokens", "t1", "A large language model, or LLM, is also a function with parameters, but with billions of them. It learns with a loss and gradient descent, as in episode one."),
    ("tokens", "t3", "A model works with numbers. Thus, it first cuts the text into small pieces: tokens."),
    ("tokens", "t4", "A token can be a word, a part of a word, or a punctuation mark. Each token has an ID number in a fixed list: the vocabulary."),
    ("tokens", "t5", "Our toy vocabulary has twelve tokens. The GPT-2 vocabulary has 50,257 tokens."),

    ("embed", "e1", "An ID does not tell what a token means. Thus, the model changes each ID into a vector: a list of numbers."),
    ("embed", "e2", "We call this vector an embedding. The model learns the embeddings in training, as parameters."),
    ("embed", "e3", "Tokens with a similar use get vectors that are near each other. Real embeddings have hundreds or thousands of dimensions."),
    ("embed", "e4", "The model also adds a position encoding. Thus, each vector shows the token and its place in the text."),

    ("attention", "a1", "Attention lets each token collect information from the tokens before it."),
    ("attention", "a2", "For each token, the model makes three vectors: a query, a key and a value."),
    ("attention", "a3", "The model multiplies the query of one token by each key. A high score means a good match."),
    ("attention", "a4", "Softmax changes the scores into weights between zero and one. Their sum is one."),
    ("attention", "a5", "The weighted sum of the values is the new vector for the token."),
    ("attention", "a6", "A token must not use the tokens after it. Thus, a mask sets these weights to zero."),
    ("attention", "a7", "A transformer stacks many of these blocks. Each block has attention and a small neural network, as in episode four."),

    ("predict", "p1", "After the last block, the model gives a score to every token in the vocabulary. Softmax changes these scores into probabilities."),
    ("predict", "p2", "Our toy model uses word counts from eight short sentences. After “on the”, the token “mat” has the highest probability."),
    ("predict", "p3", "To write text, the model picks one token, adds it to the text, and starts again."),
    ("predict", "p4", "Thus, the model writes one token at a time. Each new token needs one more pass through the model."),
    ("predict", "p5", "The temperature changes the choice. A low temperature makes the most probable token even more probable."),
    ("predict", "p6", "A high temperature makes the probabilities more equal. The text has more variety, but also more errors."),

    ("train", "n1", "How does an LLM find good values for its parameters? It uses the method from episode one."),
    ("train", "n2", "In pretraining, the model reads a very large amount of text and predicts each next token."),
    ("train", "n3", "The loss is the cross-entropy: minus the log of the probability of the correct token. A high probability gives a small loss."),
    ("train", "n4", "Gradient descent then makes this loss smaller, over a very large number of tokens."),
    ("train", "n5", "After pretraining, the model can continue text, but it does not follow instructions well. Fine-tuning on examples of instructions fixes this."),
    ("train", "n6", "LoRA makes fine-tuning less expensive. It freezes the original weights and trains only two small matrices in each layer."),
    ("train", "n7", "Last, in RLHF, people choose the better of two answers. A reward model learns these choices, and the LLM trains for a high reward."),
    ("train", "n8", "In the next episode, we use an LLM inside an application. This is AI engineering."),
]

SPOKEN = [
    ("GPT-2", "G P T 2"),
    ("IDs", "I Ds"),
    ("ID", "I D"),
    ("Softmax", "Soft max"),
    ("softmax", "soft max"),
    ("cross-entropy", "cross entropy"),
]

EXAMPLES = [
    {
        "title": "Attention from scratch",
        "file": "ep6_attention.py",
        "ran": True,
        "about": "Scaled dot-product attention with a causal mask on the 6 toy tokens from the video. The weights in the attention scene are this file's output.",
    },
    {
        "title": "A character bigram model and temperature",
        "file": "ep6_bigram.py",
        "ran": True,
        "about": "Counts which character follows which in a short text, then writes new text at three temperatures. Low temperature repeats the most probable characters; high temperature makes more errors.",
    },
]

SOURCES = [
    {"label": "Attention, query / key / value, softmax, position encoding, transformer blocks",
     "text": "Vaswani et al. (2017), Attention Is All You Need. The original transformer uses vectors with 512 dimensions (1024 in the big model).",
     "url": "https://arxiv.org/abs/1706.03762"},
    {"label": "GPT-2 vocabulary: 50,257 tokens",
     "text": "Radford et al. (2019), Language Models are Unsupervised Multitask Learners, section 2.2.",
     "url": "https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf"},
    {"label": "LoRA",
     "text": "Hu et al. (2021), LoRA: Low-Rank Adaptation of Large Language Models. Frozen weights plus trainable low-rank matrices in each layer; up to 10,000 times fewer trainable parameters than full fine-tuning of GPT-3 175B.",
     "url": "https://arxiv.org/abs/2106.09685"},
    {"label": "RLHF",
     "text": "Ouyang et al. (2022), Training language models to follow instructions with human feedback: people rank answers, a reward model learns the rankings, then reinforcement learning trains the model.",
     "url": "https://arxiv.org/abs/2203.02155"},
    {"label": "Numbers on screen",
     "text": "The vocabulary, sentences, vectors and weights are a toy example. The build script computes every value; the attention weights are the output of ep6_attention.py. The 2-D embedding picture comes from word counts in the toy sentences.",
     "url": None},
]


# ------------------------------------------------------------------ toy data for the scenes
VOCAB = ["the", "cat", "dog", "sat", "ran", "on", "under", "to", "mat", "rug", "bed", "."]
CORPUS = [
    "the cat sat on the mat .",
    "the dog sat on the rug .",
    "the cat sat on the mat .",
    "the dog ran to the bed .",
    "the cat ran under the bed .",
    "the dog sat on the mat .",
    "the cat sat under the rug .",
    "the dog ran to the mat .",
]
SMOOTH = 0.2          # add-k smoothing, so every token gets a probability above zero


def _attention_module():
    path = Path(__file__).resolve().parent.parent / "examples" / "ep6_attention.py"
    spec = importlib.util.spec_from_file_location("ep6_attention", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _trigram(sents):
    counts = {}
    for s in sents:
        w = s.split()
        for a, b, c in zip(w, w[1:], w[2:]):
            counts.setdefault((a, b), np.zeros(len(VOCAB)))[VOCAB.index(c)] += 1
    return counts


def _probs(counts, ctx):
    c = counts.get(ctx, np.zeros(len(VOCAB)))
    return (c + SMOOTH) / (c.sum() + SMOOTH * len(VOCAB))


def _temp(p, t):
    q = p ** (1 / t)
    return q / q.sum()


def _embed_2d(sents):
    """2-D picture: each word described by its left and right neighbours (PPMI), reduced with SVD."""
    ctx = ["<s>"] + VOCAB + ["</s>"]
    M = np.zeros((len(VOCAB), 2 * len(ctx)))
    for s in sents:
        w = ["<s>"] + s.split() + ["</s>"]
        for i in range(1, len(w) - 1):
            k = VOCAB.index(w[i])
            M[k, ctx.index(w[i - 1])] += 1
            M[k, len(ctx) + ctx.index(w[i + 1])] += 1
    tot = M.sum()
    pw = M.sum(1, keepdims=True) / tot
    pc = M.sum(0, keepdims=True) / tot
    with np.errstate(divide="ignore", invalid="ignore"):
        pmi = np.log((M / tot) / (pw * pc))
    ppmi = np.nan_to_num(np.maximum(pmi, 0), nan=0.0, posinf=0.0, neginf=0.0)
    ppmi = ppmi / np.linalg.norm(ppmi, axis=1, keepdims=True)
    U, S, _ = np.linalg.svd(ppmi - ppmi.mean(0), full_matrices=False)
    xy = U[:, :2] * S[:2]
    xy = xy / np.abs(xy).max(0)         # scale each axis to [-1, 1]
    # the picture shows the content words only ("the" and "." fall on the same 2-D point by chance)
    return {w: r(xy[i], 3) for i, w in enumerate(VOCAB) if w not in ("the", ".")}


# Every number that the scenes show. Nothing on screen is typed by hand.
def nums() -> dict:
    assert len(VOCAB) == 12                       # the narration says "twelve tokens"
    att = _attention_module()
    assert att.VOCAB == VOCAB
    a = att.attention_demo()
    w = a["weights"]

    counts = _trigram(CORPUS)
    ctx = ("on", "the")
    p = _probs(counts, ctx)
    assert VOCAB[int(np.argmax(p))] == "mat"      # the narration says "mat" has the highest probability
    temps = {str(t): r(_temp(p, t), 4) for t in (0.5, 1.0, 1.5)}

    # greedy generation from "the cat"
    text, steps = ["the", "cat"], []
    while text[-1] != "." and len(text) < 10:
        q = _probs(counts, (text[-2], text[-1]))
        k = int(np.argmax(q))
        steps.append({"tok": VOCAB[k], "p": r(q[k], 2)})
        text.append(VOCAB[k])

    # pretraining view: each position of one sentence, with the probability of the true next token
    sent = CORPUS[0].split()
    windows = [{"ctx": sent[:i], "next": sent[i], "p": r(_probs(counts, (sent[i - 2], sent[i - 1]))[VOCAB.index(sent[i])], 3)}
               for i in range(2, len(sent))]

    p_mat = float(p[VOCAB.index("mat")])
    p_dog = float(p[VOCAB.index("dog")])
    d, rank = 4096, 8
    return {
        "vocab": VOCAB,
        "corpus": CORPUS,
        "tokens": att.TOKENS,
        "ids": a["ids"],
        "E": r(a["E"], 2),
        "x": r(a["x"], 2),
        "pe": r(att.position_encoding(len(a["ids"]), att.D), 2),
        "q": r(a["Q"], 2), "k": r(a["K"], 2), "v": r(a["V"], 2),
        "scores": r(np.where(np.isfinite(a["scores"]), a["scores"], 0), 2),
        "weights": r(w, 2),
        "wsum": r(w[-1].sum(), 2),
        "out": r(a["out"], 2),
        "embed2d": _embed_2d(CORPUS),
        "ctx": list(ctx),
        "probs": temps,
        "smooth": SMOOTH,
        "gen_start": ["the", "cat"],
        "gen": steps,
        "windows": windows,
        "ce_mat": r(-np.log(p_mat), 2), "p_mat": r(p_mat, 2),
        "ce_dog": r(-np.log(p_dog), 2), "p_dog": r(p_dog, 3),
        "lora": {"d": d, "r": rank, "full": d * d, "lora": 2 * d * rank, "ratio": d * d // (2 * d * rank),
                 "pct": r(100 * 2 * d * rank / (d * d), 2)},
        "gpt2_vocab": 50257,
        "dim_base": 512,
    }

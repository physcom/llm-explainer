"""Narration for "MoE vs. omni-modal" explainer.

Text is written to ASD-STE100 writing rules (short sentences, active voice,
simple tenses, one idea per sentence). Each entry is (key, text). `text` is the
subtitle text. `spoken()` returns the form that the TTS voice reads.
"""

SEGMENTS = [
    # --- Intro -------------------------------------------------------------
    ("i1", "This video explains two terms: Mixture of Experts and omni-modal."),
    ("i2", "These two terms are not opposites. They answer two different questions about a model."),
    ("i3", "Question one is about the inside of the model. This is the architecture."),
    ("i4", "Question two is about the types of data that the model can read and write. This is the modality."),

    # --- Dense ---------------------------------------------------------------
    ("d1", "First, we examine a dense model."),
    ("d2", "A model divides text into small parts. We call these parts tokens."),
    ("d3", "In a dense model, each token goes through all of the parameters."),
    ("d4", "For example, Qwen 3.6 27B has 27 billion parameters. It uses all 27 billion parameters for each token."),
    ("d5", "This is why a large dense model is slow on a small computer."),

    # --- MoE -----------------------------------------------------------------
    ("m1", "Next, we examine a Mixture of Experts model, or MoE model."),
    ("m2", "This model has many small networks in each layer. Each small network is an expert."),
    ("m3", "A router is a small part of the model. For each token, the router selects some experts."),
    ("m4", "Only the selected experts do work. The other experts do no work for that token."),
    ("m5", "This diagram shows eight experts. Real models can have many more."),
    ("m6", "For example, Qwen3-Coder 30B has 128 experts. The router selects 8 experts for each token."),
    ("m7", "Qwen 3.6 35B-A3B has 35 billion parameters in total. It uses only 3 billion parameters for each token."),
    ("m8", "But all of the experts must be in memory. Thus, an MoE model needs much memory."),
    ("m9", "Each token uses only a small part of the model. Thus, the model is fast."),
    ("m10", "On a laptop with 32 GB of memory, a 35B MoE model can be faster than a 27B dense model."),

    # --- Modality ------------------------------------------------------------
    ("o1", "Now, we examine question two: the modality."),
    ("o2", "A text-only model reads text and writes text."),
    ("o3", "A multimodal model can also read images. Claude Opus and Claude Sonnet are examples. They read text, images, and PDF files, and they write text."),
    ("o4", "An omni-modal model can read text, audio, and video. Many omni-modal models can also speak."),
    ("o5", "Each type of input has an encoder. The encoder changes the input into tokens."),
    ("o6", "Then one model uses all of these tokens together."),
    ("o7", "Each encoder adds parameters. Thus, a multimodal model needs more memory than a text-only model."),

    # --- Map -----------------------------------------------------------------
    ("p1", "Now, we put the two answers together on one chart."),
    ("p2", "The rows show the architecture. The columns show the modality."),
    ("p3", "Llama 3.2 3B is dense and text-only. Gemma 4 31B is dense and multimodal."),
    ("p4", "gpt-oss 20B is MoE and text-only. Gemma 4 26B is MoE and multimodal."),
    ("p5", "Qwen3-Omni 30B is MoE and omni-modal. It reads text, audio, and video, and it can speak."),
    ("p6", "Claude Opus and Claude Sonnet are multimodal. They are not omni-modal, because they do not read audio or video."),
    ("p7", "Anthropic does not publish their architecture. Thus, we do not know if they are dense or MoE."),
    ("p8", "Also, you cannot download these two models. Thus, you cannot run them on your computer."),

    # --- Summary -------------------------------------------------------------
    ("s1", "Remember these two points."),
    ("s2", "MoE tells you how the model works inside. It makes a large model fast."),
    ("s3", "Omni-modal tells you which types of data the model can read and write."),
    ("s4", "Thus, a model can be MoE, omni-modal, both, or neither."),
]

TEXT = dict(SEGMENTS)

# Replacements for the TTS voice only. Subtitles keep the exact text.
# Order matters: longer patterns first.
SPOKEN_REPLACEMENTS = [
    ("Qwen3-Coder 30B", "Chwen 3 Coder, 30 B"),
    ("Qwen3-Omni 30B", "Chwen 3 Omni, 30 B"),
    ("Qwen 3.6 35B-A3B", "Chwen 3 point 6, 35 B, A 3 B"),
    ("Qwen 3.6 27B", "Chwen 3 point 6, 27 B"),
    ("gpt-oss 20B", "G P T O S S, 20 B"),
    ("Gemma 4 31B", "Gemma 4, 31 B"),
    ("Gemma 4 26B", "Gemma 4, 26 B"),
    ("Llama 3.2 3B", "Llama 3 point 2, 3 B"),
    ("35B MoE", "35 B, M O E"),
    ("27B dense", "27 B dense"),
    ("an MoE", "an M O E"),
    ("MoE", "M O E"),
    ("32 GB", "32 gigabytes"),
    ("PDF", "P D F"),
]


def spoken(key: str) -> str:
    s = TEXT[key]
    for a, b in SPOKEN_REPLACEMENTS:
        s = s.replace(a, b)
    return s

"""Shared helpers for the ML to AI Engineering series.

Each episode is a module in episodes/ with EPISODE, CHAPTERS, SEGMENTS,
EXAMPLES and SOURCES. SEGMENTS entries are (chapter_id, key, text).
"""
import importlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
AUDIO = ROOT / "audio"
WEB = ROOT / "web"
BUILD = ROOT / "build"
EXAMPLES = ROOT / "examples"

# The outline (see OUTLINE.md). Episodes without a module show as "in production".
SERIES = [
    ("ep1", "Base", "Learn from data"),
    ("ep2", "Base", "Generalization"),
    ("ep3", "Intermediate", "Classification and metrics"),
    ("ep4", "Intermediate", "Neural networks"),
    ("ep5", "Advanced", "Production ML"),
    ("ep6", "Advanced", "From ML to LLMs"),
    ("ep7", "AI engineering", "Build with LLMs"),
    # Part 2: five deep dives. Topics follow the course map of dailydoseofds.com (see research/README.md).
    ("ep8", "Deep dive", "Fine-tuning"),
    ("ep9", "Deep dive", "Alignment and reasoning"),
    ("ep10", "Deep dive", "Inference and serving"),
    ("ep11", "Deep dive", "Agents in depth"),
    ("ep12", "Deep dive", "Advanced RAG and evals"),
]
ORDER = [e for e, _, _ in SERIES]

# Replacements for the TTS voice only. Subtitles keep the exact text.
# Applied in order, as whole-word replacements. Put longer patterns first.
SPOKEN_REPLACEMENTS = [
    ("Qwen", "Chwen"),
    ("MLOps", "M L Ops"),
    ("LLMs", "L L Ms"),
    ("LLM", "L L M"),
    ("GPUs", "G P Us"),
    ("GPU", "G P U"),
    ("CPUs", "C P Us"),
    ("CPU", "C P U"),
    ("APIs", "A P Is"),
    ("API", "A P I"),
    ("RLHF", "R L H F"),
    ("LoRA", "Lora"),
    ("MCP", "M C P"),
    ("JSON", "Jason"),
    ("RAG", "rag"),
    ("ML", "M L"),
    ("AI", "A I"),
    ("MoE", "M O E"),
    ("8B", "8 B"),
    ("FP16", "F P 16"),
    ("Q4", "Q 4"),
    ("32 GB", "32 gigabytes"),
    ("16 GB", "16 gigabytes"),
    ("5 GB", "5 gigabytes"),
    ("GB", "gigabytes"),
    ("e.g.", "for example"),
]


def spoken(text: str, extra: list[tuple[str, str]] | None = None) -> str:
    """TTS form of a narration line. `extra` (an episode's SPOKEN list) is applied first."""
    s = text
    for a, b in list(extra or []) + SPOKEN_REPLACEMENTS:
        s = re.sub(rf"(?<![A-Za-z0-9]){re.escape(a)}(?![A-Za-z0-9])", b, s)
    return s


def load(ep_id: str):
    return importlib.import_module(f"episodes.{ep_id}")


def available() -> list[str]:
    return [e for e in ORDER if (ROOT / "episodes" / f"{e}.py").exists()]

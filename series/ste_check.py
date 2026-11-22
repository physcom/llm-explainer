"""Check narration against the STE100 rules that a script can measure.

- Sentence: max 20 words (procedural limit, the stricter one; Rule 4.1 allows 25 for descriptive text).
- Paragraph (segment): max 6 sentences (Rule 4.3).
- Flag -ing words, contractions, and common passive-voice patterns.
- -ing words are allowed only as part of a technical name (Rule 1.5 / 3.6), listed in TECH_ING.
This does NOT check words against the licensed ASD-STE100 dictionary.

Usage: python ste_check.py [ep1 ep2 ...]
"""
import re
import sys

from common import available, load

# Words that end in -ing but are nouns, prepositions or base-form verbs.
ING_OK = {"thing", "things", "something", "nothing", "anything", "everything", "bring", "during", "string", "strings", "king"}
# Technical names that contain an -ing word (machine learning, training data, learning rate ...).
TECH_ING = {"learning", "training", "engineering", "embedding", "embeddings", "fine-tuning", "overfitting",
            "underfitting", "pretraining", "post-training", "caching", "routing",
            "boosting", "encoding", "sampling",  # gradient boosting, one-hot / positional encoding, temperature sampling
            "serving", "batching", "reasoning", "decoding"}  # model serving, continuous batching, reasoning model, speculative decoding
# Do not grow this list to make a check pass: rewrite the sentence. Add only a real technical name.
PASSIVE = re.compile(r"\b(is|are|was|were|be|been|being)\s+\w+ed\b", re.I)


def check(ep_id: str) -> tuple[int, int, int]:
    mod = load(ep_id)
    problems = 0
    chapters = {c for c, _ in mod.CHAPTERS}
    keys = set()
    for ch, key, text in mod.SEGMENTS:
        if ch not in chapters:
            print(f"{ep_id}/{key}: unknown chapter {ch}")
            problems += 1
        if key in keys:
            print(f"{ep_id}/{key}: duplicate key")
            problems += 1
        keys.add(key)
        sentences = [s.strip() for s in re.split(r"(?<=[.!?:])\s+", text) if s.strip()]
        if len(sentences) > 6:
            print(f"{ep_id}/{key}: {len(sentences)} sentences (max 6)")
            problems += 1
        for s in sentences:
            words = re.findall(r"[A-Za-z0-9][A-Za-z0-9.\-'’]*", s)
            if len(words) > 20:
                print(f"{ep_id}/{key}: {len(words)} words: {s}")
                problems += 1
            for w in words:
                lw = w.lower().strip(".")
                if lw.endswith("ing") and lw not in ING_OK and lw not in TECH_ING:
                    print(f"{ep_id}/{key}: -ing word '{w}'")
                    problems += 1
                if "'" in w or "’" in w:
                    print(f"{ep_id}/{key}: contraction '{w}'")
                    problems += 1
            if PASSIVE.search(s):
                print(f"{ep_id}/{key}: possible passive: {s}")
                problems += 1
    words = sum(len(t.split()) for _, _, t in mod.SEGMENTS)
    return len(mod.SEGMENTS), words, problems


if __name__ == "__main__":
    eps = sys.argv[1:] or available()
    tot = [0, 0, 0]
    for e in eps:
        n, w, p = check(e)
        print(f"{e}: segments={n} words={w} problems={p}")
        tot = [a + b for a, b in zip(tot, (n, w, p))]
    print(f"ALL: segments={tot[0]} words={tot[1]} problems={tot[2]}")

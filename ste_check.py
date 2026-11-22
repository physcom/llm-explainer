"""Check narration against the STE100 rules that a script can measure.

- Descriptive sentence: max 25 words (Rule 4.1). Procedural: max 20 (Rule 3.1).
- Paragraph (segment): max 6 sentences (Rule 4.3).
- Flag -ing words, contractions, and common passive-voice patterns.
This does NOT check words against the licensed ASD-STE100 dictionary.
"""
import re

from narration import SEGMENTS

ING_OK = {"thing", "things"}  # nouns that end in -ing
PASSIVE = re.compile(r"\b(is|are|was|were|be|been)\s+\w+ed\b", re.I)

problems = 0
for key, text in SEGMENTS:
    sentences = [s.strip() for s in re.split(r"(?<=[.!?:])\s+", text) if s.strip()]
    if len(sentences) > 6:
        print(f"{key}: {len(sentences)} sentences (max 6)")
        problems += 1
    for s in sentences:
        words = re.findall(r"[A-Za-z0-9][A-Za-z0-9.\-']*", s)
        if len(words) > 20:
            print(f"{key}: {len(words)} words: {s}")
            problems += 1
        for w in words:
            lw = w.lower().strip(".")
            if lw.endswith("ing") and lw not in ING_OK:
                print(f"{key}: -ing word '{w}'")
                problems += 1
            if "'" in w:
                print(f"{key}: contraction '{w}'")
                problems += 1
        if PASSIVE.search(s):
            print(f"{key}: possible passive: {s}")
            problems += 1

total_words = sum(len(t.split()) for _, t in SEGMENTS)
print(f"segments={len(SEGMENTS)} words={total_words} problems={problems}")

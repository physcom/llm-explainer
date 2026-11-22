"""Build the HTML explainer: one AAC narration track + timeline injected into the page.

Usage: python build_web.py
Reads  audio/<key>.wav, narration.py, web/explainer.src.html
Writes web/narration.m4a, web/explainer.html
"""
import json
import wave
from pathlib import Path

import av
import numpy as np

from narration import SEGMENTS

ROOT = Path(__file__).resolve().parent
AUDIO = ROOT / "audio"
WEB = ROOT / "web"
RATE = 44100

CHAPTERS = [
    ("i", "intro", "Two questions"),
    ("d", "dense", "Dense model"),
    ("m", "moe", "Mixture of Experts"),
    ("o", "modality", "Modality"),
    ("p", "chart", "One chart"),
    ("s", "summary", "Summary"),
]
LEAD, PAD, GAP, TAIL = 0.6, 0.35, 1.0, 1.5


def read_wav(path: Path) -> np.ndarray:
    with wave.open(str(path)) as w:
        assert w.getframerate() == RATE and w.getnchannels() == 1 and w.getsampwidth() == 2
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16)


def main() -> None:
    prefix_to_chapter = {p: cid for p, cid, _ in CHAPTERS}
    segs, chapters, pieces = [], [], []
    t = LEAD
    pieces.append(np.zeros(int(LEAD * RATE), np.int16))
    prev_ch = None
    for key, text in SEGMENTS:
        ch = prefix_to_chapter[key[0]]
        if prev_ch is not None and ch != prev_ch:
            pieces.append(np.zeros(int(GAP * RATE), np.int16))
            t += GAP
        if ch != prev_ch:
            title = next(tt for p, cid, tt in CHAPTERS if cid == ch)
            chapters.append({"id": ch, "title": title, "start": round(t, 3)})
        pcm = read_wav(AUDIO / f"{key}.wav")
        dur = len(pcm) / RATE
        segs.append({"key": key, "chapter": ch, "start": round(t, 3), "dur": round(dur, 3), "text": text})
        pieces.append(pcm)
        pieces.append(np.zeros(int(PAD * RATE), np.int16))
        t += dur + PAD
        prev_ch = ch
    pieces.append(np.zeros(int(TAIL * RATE), np.int16))
    t += TAIL
    pcm = np.concatenate(pieces)
    total = len(pcm) / RATE

    WEB.mkdir(exist_ok=True)
    out_path = WEB / "narration.mp4"  # audio-only MP4 (AAC)
    out = av.open(str(out_path), "w", format="mp4")
    st = out.add_stream("aac", rate=RATE, layout="mono")
    st.bit_rate = 64000
    step = 1024
    for i in range(0, len(pcm), step):
        chunk = pcm[i:i + step]
        frame = av.AudioFrame.from_ndarray(chunk[np.newaxis, :], format="s16", layout="mono")
        frame.sample_rate = RATE
        for pkt in st.encode(frame):
            out.mux(pkt)
    for pkt in st.encode(None):
        out.mux(pkt)
    out.close()

    timeline = {"total": round(total, 3), "segments": segs, "chapters": chapters}
    src = (WEB / "explainer.src.html").read_text(encoding="utf-8")
    placeholder = "/*__TIMELINE__*/null"
    assert placeholder in src, "timeline placeholder missing from explainer.src.html"
    html = src.replace(placeholder, json.dumps(timeline, ensure_ascii=False))
    # For publishing: the Artifact host adds doctype, charset and viewport.
    (WEB / "explainer.html").write_text(html, encoding="utf-8")
    # For opening from disk: a complete standalone document.
    local_head = (
        '<!doctype html>\n<html lang="en">\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
    )
    (WEB / "explainer-local.html").write_text(local_head + html + "\n</html>\n", encoding="utf-8")
    print(f"total {total:.1f}s, {len(segs)} segments, audio {out_path.stat().st_size / 1e6:.2f} MB")


if __name__ == "__main__":
    main()

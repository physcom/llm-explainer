"""Build the series page: one AAC narration track per episode, plus all data and scenes injected into the page.

Usage:  python build.py                 every episode that has a module -> web/dist/series.html (+ series-local.html)
        python build.py --eps ep2       test build of some episodes     -> web/dist/test-ep2.html (standalone)
Reads   episodes/<ep>.py, audio/<ep>/*.wav, examples/*.py, web/scenes/<ep>.js, web/series.src.html
Writes  web/dist/<ep>.mp4 and the pages above. Example output is cached in build/examples/<file>.json by file hash
        (one cache file per example, so test builds of different episodes can run at the same time).
"""
import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
import wave

import av
import numpy as np

from common import AUDIO, BUILD, EXAMPLES, SERIES, WEB, available, load, spoken

DIST = WEB / "dist"
LOCAL = WEB.parent / "local"          # offline copy: series/local/index.html + epN.mp4
GSAP_CDN = '<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>'
GSAP_VENDOR = BUILD / "vendor" / "gsap-3.12.5.min.js"   # the same file, downloaded once from cdnjs
RATE = 44100
LEAD, PAD, GAP, TAIL = 0.6, 0.35, 1.0, 1.5
CACHE = BUILD / "examples"


def read_wav(path) -> np.ndarray:
    with wave.open(str(path)) as w:
        assert w.getframerate() == RATE and w.getnchannels() == 1 and w.getsampwidth() == 2, path
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16)


def encode_aac(pcm: np.ndarray, out_path) -> None:
    out = av.open(str(out_path), "w", format="mp4")  # audio-only MP4 (AAC); .m4a is not a served artifact type
    st = out.add_stream("aac", rate=RATE, layout="mono")
    st.bit_rate = 64000
    for i in range(0, len(pcm), 1024):
        frame = av.AudioFrame.from_ndarray(pcm[i:i + 1024][np.newaxis, :], format="s16", layout="mono")
        frame.sample_rate = RATE
        for pkt in st.encode(frame):
            out.mux(pkt)
    for pkt in st.encode(None):
        out.mux(pkt)
    out.close()


def timeline(ep: str, mod) -> dict:
    """Concatenate the WAVs with silence; return segment and chapter start times. Fails on stale or missing audio."""
    d = AUDIO / ep
    manifest = json.loads((d / "manifest.json").read_text(encoding="utf-8")) if (d / "manifest.json").exists() else {}
    titles = dict(mod.CHAPTERS)
    segs, chapters, pieces = [], [], [np.zeros(int(LEAD * RATE), np.int16)]
    t, prev = LEAD, None
    for ch, key, text in mod.SEGMENTS:
        wav = d / f"{key}.wav"
        if not wav.exists() or manifest.get(key) != spoken(text, getattr(mod, "SPOKEN", None)):
            sys.exit(f"{ep}/{key}: audio missing or stale. Run: python make_voice.py {ep}")
        if prev is not None and ch != prev:
            pieces.append(np.zeros(int(GAP * RATE), np.int16))
            t += GAP
        if ch != prev:
            chapters.append({"id": ch, "title": titles[ch], "start": round(t, 3)})
        pcm = read_wav(wav)
        dur = len(pcm) / RATE
        segs.append({"key": key, "chapter": ch, "start": round(t, 3), "dur": round(dur, 3), "text": text})
        pieces += [pcm, np.zeros(int(PAD * RATE), np.int16)]
        t += dur + PAD
        prev = ch
    pieces.append(np.zeros(int(TAIL * RATE), np.int16))
    pcm = np.concatenate(pieces)
    DIST.mkdir(parents=True, exist_ok=True)
    encode_aac(pcm, DIST / f"{ep}.mp4")
    return {"total": round(len(pcm) / RATE, 3), "segments": segs, "chapters": chapters}


def run_examples(mod) -> list[dict]:
    out = []
    for ex in mod.EXAMPLES:
        path = EXAMPLES / ex["file"]
        code = path.read_text(encoding="utf-8").rstrip() + "\n"
        item = {"title": ex["title"], "file": ex["file"], "about": ex["about"], "ran": bool(ex["ran"]), "code": code}
        if ex["ran"]:
            h = hashlib.sha256(code.encode("utf-8")).hexdigest()
            cf = CACHE / f"{ex['file']}.json"
            cached = json.loads(cf.read_text(encoding="utf-8")) if cf.exists() else {}
            if cached.get("hash") != h:
                env = {**os.environ, "PYTHONIOENCODING": "utf-8", "PYTHONUTF8": "1"}
                p = subprocess.run([sys.executable, str(path)], cwd=EXAMPLES, capture_output=True, text=True,
                                   encoding="utf-8", env=env, timeout=600)
                if p.returncode != 0:
                    sys.exit(f"example {ex['file']} failed:\n{p.stderr}")
                cached = {"hash": h, "output": p.stdout.replace("\r\n", "\n").rstrip()}
                CACHE.mkdir(parents=True, exist_ok=True)
                cf.write_text(json.dumps(cached, indent=1, ensure_ascii=False), encoding="utf-8")
                print(f"  ran {ex['file']}")
            item["output"] = cached["output"]
        else:
            item["why_not_run"] = ex.get("why_not_run", "")
        out.append(item)
    return out


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--eps", nargs="*", help="test build of these episodes -> web/dist/test-<eps>.html")
    ap.add_argument("--release", nargs="*", help="release build of only these reviewed episodes (default: all)")
    args = ap.parse_args()
    eps = args.eps or args.release or available()
    BUILD.mkdir(exist_ok=True)

    episodes, scenes = {}, []
    for ep in eps:
        mod = load(ep)
        info = timeline(ep, mod)
        episodes[ep] = {
            **mod.EPISODE, **info,
            "audio": f"{ep}.mp4",
            "nums": mod.nums() if hasattr(mod, "nums") else {},
            "examples": run_examples(mod),
            "sources": mod.SOURCES,
        }
        js = WEB / "scenes" / f"{ep}.js"
        if js.exists():
            # try/catch: an error at the top level of a scene file shows on the page instead of failing silently
            scenes.append(f"<script>\n/* scenes: {ep} */\ntry {{\n{js.read_text(encoding='utf-8').rstrip()}\n}} catch (err) "
                          f"{{ SCENE_ERRORS[{json.dumps(ep)}] = err.message; console.error('scene file {ep}:', err); }}\n</script>")
        print(f"{ep}: {info['total']:.1f}s, {len(info['segments'])} segments, {len(info['chapters'])} chapters, "
              f"audio {(DIST / f'{ep}.mp4').stat().st_size / 1e6:.2f} MB, scenes {'yes' if js.exists() else 'NO'}")

    data = {
        "series": [{"id": e, "n": i + 1, "level": lv, "title": t} for i, (e, lv, t) in enumerate(SERIES)],
        "episodes": episodes,
    }
    src = (WEB / "series.src.html").read_text(encoding="utf-8")
    for ph in ("/*__DATA__*/null", "<!--__SCENES__-->"):
        assert ph in src, f"placeholder {ph} missing from series.src.html"
    # "</" inside JSON could close the script element; escape it.
    blob = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
    html = src.replace("/*__DATA__*/null", blob).replace("<!--__SCENES__-->", "\n".join(scenes))
    local_head = ('<!doctype html>\n<html lang="en">\n<meta charset="utf-8">\n'
                  '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n')
    local = local_head + html + "\n</html>\n"
    if args.eps:
        out = DIST / f"test-{'-'.join(eps)}.html"
        out.write_text(local, encoding="utf-8")
    else:
        (DIST / "series.html").write_text(html, encoding="utf-8")          # publish: the Artifact host adds the skeleton
        out = DIST / "series-local.html"
        out.write_text(local, encoding="utf-8")                           # open from disk
        # A clean offline copy: one folder with index.html and the audio files, nothing else.
        LOCAL.mkdir(exist_ok=True)
        for old in LOCAL.glob("ep*.mp4"):
            if old.stem not in episodes:
                old.unlink()
        for ep in episodes:
            shutil.copy2(DIST / f"{ep}.mp4", LOCAL / f"{ep}.mp4")
        offline = local
        if GSAP_VENDOR.exists():                                          # works without internet (fonts fall back)
            shutil.copy2(GSAP_VENDOR, LOCAL / "gsap.min.js")
            assert GSAP_CDN in offline, "GSAP script tag changed in series.src.html"
            offline = offline.replace(GSAP_CDN, '<script src="gsap.min.js"></script>')
        (LOCAL / "index.html").write_text(offline, encoding="utf-8")
        print(f"wrote {LOCAL / 'index.html'} (offline copy, {len(episodes)} episodes)")
    print(f"wrote {out} ({len(html) / 1e3:.0f} kB)")


if __name__ == "__main__":
    main()

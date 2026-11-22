"""Local check only: contact sheets of one episode, one PNG per chapter, frames at the end of each narration line.

Usage:  python tools/sheet.py ep1 [--chapters rules model] [--at 12.5 40]
Needs   a test build first: python build.py --eps ep1   (reads web/dist/test-ep1.html)
Writes  build/sheets/<ep>-<chapter>.png  (2 columns of 800x450 frames). Script errors appear in red on the frame.
"""
import argparse
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "web" / "dist"
OUT = ROOT / "build" / "sheets"
EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

PROBE = """
<style>.wrap{max-width:none!important;padding:0!important;gap:0!important}.wrap > :not(.stage){display:none!important}
.stage{border-radius:0!important;outline:0!important}
#errs{position:absolute;left:8px;right:8px;bottom:8px;z-index:9;color:#fff;background:#b00020;font:14px/1.3 monospace;white-space:pre-wrap;padding:4px 8px}#errs:empty{display:none}</style>
<script>(function(){
const box=document.createElement('div');box.id='errs';document.getElementById('stage').appendChild(box);
const say=m=>{box.textContent+=(box.textContent?'\\n':'')+m;};
addEventListener('error',e=>say('error: '+e.message+' @'+(e.lineno||'')+(e.error&&e.error.stack?' | '+e.error.stack.split('\\n').slice(0,3).join(' | '):'')));
const ce=console.error;console.error=(...a)=>{say(a.map(x=>x&&x.stack?x.stack.split('\\n').slice(0,2).join(' | '):String(x)).join(' '));ce(...a);};
const t=parseFloat(new URLSearchParams(location.search).get('t'));
const iv=setInterval(()=>{if(typeof tl!=='undefined'&&tl&&EP){clearInterval(iv);document.getElementById('poster').hidden=true;
const n=document.getElementById('notice');if(!n.hidden)say(n.textContent);seekTo(t);}},50);
})();</script>
"""


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("ep")
    ap.add_argument("--chapters", nargs="*")
    ap.add_argument("--at", nargs="*", type=float, help="explicit times (one sheet named <ep>-at.png)")
    args = ap.parse_args()

    page = DIST / f"test-{args.ep}.html"
    if not page.exists():
        sys.exit(f"missing {page}; run: python build.py --eps {args.ep}")
    html = page.read_text(encoding="utf-8")
    m = re.search(r"const DATA = (\{.*?\});\n", html, re.S)
    data = json.loads(m.group(1).replace("<\\/", "</"))
    ep = data["episodes"][args.ep]
    probe_name = f"_probe-{args.ep}.html"
    (DIST / probe_name).write_text(html.replace("\n</html>", PROBE + "\n</html>"), encoding="utf-8")

    groups = []
    if args.at:
        groups.append(("at", [(f"t={t:.1f}", t) for t in args.at]))
    else:
        for ch in ep["chapters"]:
            if args.chapters and ch["id"] not in args.chapters:
                continue
            segs = [s for s in ep["segments"] if s["chapter"] == ch["id"]]
            groups.append((ch["id"], [(s["key"], s["start"] + s["dur"] + 0.25) for s in segs]))

    OUT.mkdir(parents=True, exist_ok=True)
    for name, frames in groups:
        rows = (len(frames) + 1) // 2
        figs = "".join(
            f'<figure><iframe src="{probe_name}?t={t:.2f}#{args.ep}" width="800" height="450"></iframe>'
            f'<figcaption>{k} @ {t:.1f}s</figcaption></figure>' for k, t in frames)
        sheet = (f'<!doctype html><meta charset="utf-8"><style>body{{margin:0;background:#222;color:#fff;font:14px sans-serif}}'
                 f'main{{display:grid;grid-template-columns:800px 800px}}figure{{margin:0;position:relative}}'
                 f'iframe{{border:0;display:block}}figcaption{{position:absolute;right:8px;top:8px;background:#000a;padding:2px 6px}}'
                 f'</style><main>{figs}</main>')
        sheet_path = DIST / f"_sheet-{args.ep}-{name}.html"
        sheet_path.write_text(sheet, encoding="utf-8")
        png = OUT / f"{args.ep}-{name}.png"
        png.unlink(missing_ok=True)
        for attempt in range(2):                      # headless Edge sometimes hangs; one retry
            with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as prof:
                try:
                    subprocess.run([EDGE, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--mute-audio",
                                    "--allow-file-access-from-files", f"--user-data-dir={prof}",
                                    "--virtual-time-budget=25000", f"--window-size=1600,{rows * 450}",
                                    f"--screenshot={png}", sheet_path.as_uri()],
                                   capture_output=True, timeout=120)
                    break
                except subprocess.TimeoutExpired:
                    print(f"  {name}: Edge timed out (attempt {attempt + 1})")
        sheet_path.unlink()
        print(png, "ok" if png.exists() else "FAILED")
    (DIST / probe_name).unlink()


if __name__ == "__main__":
    main()

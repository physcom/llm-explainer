"""Make one WAV file per narration segment with the Windows SAPI voice.

Usage:  python make_voice.py ep1 [ep2 ...] [--voice "Microsoft David Desktop"] [--rate 0] [--force]
Output: audio/<ep>/<key>.wav (44.1 kHz, 16-bit, mono) and audio/<ep>/manifest.json.
Only segments whose spoken text changed (or whose WAV is missing) are made again.
"""
import argparse
import json
import subprocess

from common import AUDIO, BUILD, available, load, spoken

PS1 = r"""
param([string]$JobFile, [string]$Voice, [int]$Rate)
Add-Type -AssemblyName System.Speech
$jobs = Get-Content -Raw -Encoding UTF8 $JobFile | ConvertFrom-Json
$fmt = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(44100, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
foreach ($j in $jobs) {
  $s = New-Object System.Speech.Synthesis.SpeechSynthesizer
  $s.SelectVoice($Voice)
  $s.Rate = $Rate
  $s.SetOutputToWaveFile($j.path, $fmt)
  $s.Speak($j.text)
  $s.Dispose()
}
"""


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("eps", nargs="*")
    ap.add_argument("--voice", default="Microsoft David Desktop")
    ap.add_argument("--rate", type=int, default=0)
    ap.add_argument("--force", action="store_true")
    args = ap.parse_args()

    BUILD.mkdir(exist_ok=True)
    jobs, manifests = [], {}
    for ep in args.eps or available():
        mod = load(ep)
        d = AUDIO / ep
        d.mkdir(parents=True, exist_ok=True)
        mf = d / "manifest.json"
        old = json.loads(mf.read_text(encoding="utf-8")) if mf.exists() else {}
        new = {}
        for _, key, text in mod.SEGMENTS:
            sp = spoken(text, getattr(mod, "SPOKEN", None))
            new[key] = sp
            wav = d / f"{key}.wav"
            if args.force or old.get(key) != sp or not wav.exists():
                jobs.append({"path": str(wav), "text": sp})
        manifests[mf] = new
    if jobs:
        tag = "_".join(args.eps or ["all"])          # one job file per run, so parallel runs do not collide
        job_file = BUILD / f"voice_jobs_{tag}.json"
        job_file.write_text(json.dumps(jobs, indent=1), encoding="utf-8")
        ps1 = BUILD / "make_voice.ps1"
        ps1.write_text(PS1, encoding="utf-8")
        subprocess.run(
            ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", str(ps1),
             "-JobFile", str(job_file), "-Voice", args.voice, "-Rate", str(args.rate)],
            check=True,
        )
    for mf, data in manifests.items():
        mf.write_text(json.dumps(data, indent=1, ensure_ascii=False), encoding="utf-8")
    print(f"made {len(jobs)} wav files")


if __name__ == "__main__":
    main()

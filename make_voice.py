"""Make one WAV file per narration segment with the Windows SAPI voice.

Usage:  python make_voice.py [--voice "Microsoft David Desktop"] [--rate 0]
Output: audio/<key>.wav  (44.1 kHz, 16-bit, mono)
To use your own voice later, record files with the same names into audio/.
"""
import argparse
import json
import subprocess
from pathlib import Path

from narration import SEGMENTS, spoken

ROOT = Path(__file__).resolve().parent
AUDIO = ROOT / "audio"
BUILD = ROOT / "build"

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
    ap.add_argument("--voice", default="Microsoft David Desktop")
    ap.add_argument("--rate", type=int, default=0)
    ap.add_argument("--only", nargs="*", help="segment keys to (re)make")
    args = ap.parse_args()

    AUDIO.mkdir(exist_ok=True)
    BUILD.mkdir(exist_ok=True)
    keys = args.only or [k for k, _ in SEGMENTS]
    jobs = [{"path": str(AUDIO / f"{k}.wav"), "text": spoken(k)} for k in keys]
    job_file = BUILD / "voice_jobs.json"
    job_file.write_text(json.dumps(jobs, indent=1), encoding="utf-8")
    ps1 = BUILD / "make_voice.ps1"
    ps1.write_text(PS1, encoding="utf-8")
    subprocess.run(
        ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", str(ps1),
         "-JobFile", str(job_file), "-Voice", args.voice, "-Rate", str(args.rate)],
        check=True,
    )
    print(f"made {len(jobs)} wav files in {AUDIO}")


if __name__ == "__main__":
    main()

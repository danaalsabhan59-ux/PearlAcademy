"""Shared helpers for the audio scripts (paths, ffmpeg lookup, hashing)."""

from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIALOGUE = ROOT / "src" / "data" / "dialogue.json"
MANIFEST = ROOT / "src" / "data" / "voices.generated.json"
PUBLIC = ROOT / "public"
VOICES_DIR = PUBLIC / "audio" / "voices"


def load_dialogue() -> dict:
    return json.loads(DIALOGUE.read_text(encoding="utf-8"))


def load_manifest() -> dict:
    if MANIFEST.exists():
        return json.loads(MANIFEST.read_text(encoding="utf-8"))
    return {"lines": {}}


def save_manifest(manifest: dict) -> None:
    MANIFEST.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


def all_lines(dialogue: dict) -> list[dict]:
    return [line for scene in dialogue["scenes"] for line in scene["lines"]]


def voice_settings(dialogue: dict, line: dict) -> dict:
    """Character defaults, overridden per line."""
    char = dialogue["characters"][line["speaker"]]
    return {
        key: line.get(key, char.get(key, default))
        for key, default in (
            ("voice", "ar-SA-HamedNeural"),
            ("rate", "+0%"),
            ("pitch", "+0Hz"),
            ("volume", "+0%"),
        )
    }


def line_hash(line: dict, settings: dict) -> str:
    payload = json.dumps([line["text"], settings], ensure_ascii=False, sort_keys=True)
    return hashlib.sha1(payload.encode("utf-8")).hexdigest()[:16]


def _tool(name: str) -> list[str]:
    # Prefer a system install; fall back to the binaries bundled with Remotion.
    if shutil.which(name):
        return [name]
    return ["npx", "--no-install", "remotion", name]


def ffmpeg(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(
        [*_tool("ffmpeg"), "-hide_banner", "-y", *args],
        capture_output=True,
        text=True,
        cwd=ROOT,
    )


def probe_duration(path: Path) -> float:
    out = subprocess.run(
        [
            *_tool("ffprobe"),
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=nw=1:nk=1",
            str(path),
        ],
        capture_output=True,
        text=True,
        cwd=ROOT,
    )
    return float(out.stdout.strip())


def loudness_stats(path: Path) -> tuple[float, float]:
    """Return (mean_volume, max_volume) in dB using ffmpeg's volumedetect."""
    res = ffmpeg("-i", str(path), "-af", "volumedetect", "-f", "null", "-")
    mean = max_ = -999.0
    for row in res.stderr.splitlines():
        if "mean_volume:" in row:
            mean = float(row.split("mean_volume:")[1].split("dB")[0])
        if "max_volume:" in row:
            max_ = float(row.split("max_volume:")[1].split("dB")[0])
    return mean, max_

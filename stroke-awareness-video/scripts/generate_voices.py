"""Generate one MP3 per dialogue line with Microsoft Edge TTS.

Usage:
  python3 scripts/generate_voices.py            # only new / changed lines
  python3 scripts/generate_voices.py --force    # regenerate everything
  python3 scripts/generate_voices.py --only m1,m4

Reads   src/data/dialogue.json
Writes  public/audio/voices/<line-id>.mp3
        src/data/voices.generated.json  (durations + word timings used for sync)

If any line fails, the script exits with code 1 and lists the failed lines.
It never writes placeholder or silent audio.
"""

from __future__ import annotations

import argparse
import asyncio
import os
import sys
import tempfile
from datetime import datetime, timezone

from audio_common import (
    ROOT,
    VOICES_DIR,
    all_lines,
    ffmpeg,
    line_hash,
    load_dialogue,
    load_manifest,
    probe_duration,
    save_manifest,
    voice_settings,
)

try:
    import edge_tts
except ImportError:
    sys.exit("edge-tts غير مثبّت. ثبّته بالأمر:  pip install edge-tts")

TICKS_PER_SECOND = 10_000_000  # Edge TTS reports offsets in 100 ns units

# Gentle cleanup + loudness normalisation so every line sits at the same level.
VOICE_FILTER = ",".join(
    [
        "highpass=f=70",
        "lowpass=f=12000",
        "acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120",
        "loudnorm=I=-16:TP=-1.5:LRA=9",
    ]
)


async def synthesize(text: str, settings: dict, proxy: str | None) -> tuple[bytes, list[dict]]:
    communicate = edge_tts.Communicate(
        text,
        settings["voice"],
        rate=settings["rate"],
        pitch=settings["pitch"],
        volume=settings["volume"],
        boundary="WordBoundary",
        proxy=proxy,
    )
    audio = bytearray()
    words: list[dict] = []
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio.extend(chunk["data"])
        elif chunk["type"] == "WordBoundary":
            start = chunk["offset"] / TICKS_PER_SECOND
            words.append(
                {
                    "text": chunk["text"],
                    "start": round(start, 3),
                    "end": round(start + chunk["duration"] / TICKS_PER_SECOND, 3),
                }
            )
    if not audio:
        raise RuntimeError("Edge TTS returned no audio")
    return bytes(audio), words


async def generate_line(line: dict, settings: dict, proxy: str | None, retries: int = 3) -> dict:
    last_error: Exception | None = None
    for attempt in range(1, retries + 1):
        try:
            raw, words = await synthesize(line["text"], settings, proxy)
            break
        except Exception as exc:  # network / service errors
            last_error = exc
            if attempt < retries:
                await asyncio.sleep(2**attempt)
    else:
        raise RuntimeError(f"{type(last_error).__name__}: {last_error}")

    out = VOICES_DIR / f"{line['id']}.mp3"
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
        tmp.write(raw)
    try:
        res = ffmpeg(
            "-i", tmp.name, "-af", VOICE_FILTER,
            "-ar", "48000", "-ac", "1", "-c:a", "libmp3lame", "-b:a", "192k",
            str(out),
        )
        if res.returncode != 0:
            raise RuntimeError(f"ffmpeg failed: {res.stderr[-400:]}")
    finally:
        os.unlink(tmp.name)

    duration = probe_duration(out)
    if duration < 0.3:
        out.unlink(missing_ok=True)
        raise RuntimeError(f"audio too short ({duration:.2f}s)")
    return {
        "file": f"audio/voices/{line['id']}.mp3",
        "duration": round(duration, 3),
        "words": words,
    }


async def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="regenerate all lines")
    parser.add_argument("--only", help="comma-separated line ids")
    parser.add_argument(
        "--proxy",
        default=os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy"),
        help="HTTP proxy for Edge TTS (defaults to $HTTPS_PROXY)",
    )
    args = parser.parse_args()

    dialogue = load_dialogue()
    manifest = load_manifest()
    manifest.setdefault("lines", {})
    only = set(args.only.split(",")) if args.only else None
    VOICES_DIR.mkdir(parents=True, exist_ok=True)

    lines = all_lines(dialogue)
    ids = {line["id"] for line in lines}
    # Drop manifest entries for lines that were removed from the script.
    for stale in set(manifest["lines"]) - ids:
        del manifest["lines"][stale]

    failures: list[tuple[str, str]] = []
    for line in lines:
        if only and line["id"] not in only:
            continue
        settings = voice_settings(dialogue, line)
        digest = line_hash(line, settings)
        existing = manifest["lines"].get(line["id"])
        mp3 = VOICES_DIR / f"{line['id']}.mp3"
        if not args.force and existing and existing.get("hash") == digest and mp3.exists():
            print(f"  = {line['id']:<9} (unchanged)")
            continue
        label = f"{line['id']:<9} {settings['voice']} rate={settings['rate']} pitch={settings['pitch']}"
        try:
            entry = await generate_line(line, settings, args.proxy)
        except Exception as exc:
            failures.append((line["id"], str(exc)))
            print(f"  ✗ {label}\n      {exc}")
            continue
        manifest["lines"][line["id"]] = {"hash": digest, **settings, **entry}
        print(f"  ✓ {label}  {entry['duration']:.2f}s")
        save_manifest(manifest)  # save as we go so a later failure keeps finished lines

    manifest["generatedAt"] = datetime.now(timezone.utc).isoformat(timespec="seconds")
    save_manifest(manifest)

    if failures:
        print("\n⚠️  تعذّر توليد الأصوات التالية — لن يتم الرندر حتى تُولَّد كلها:")
        for line_id, err in failures:
            print(f"   - {line_id}: {err}")
        print("Edge TTS failed for the lines above. Check the network / proxy and re-run.")
        return 1
    print(f"\nتم: {len(lines)} جملة جاهزة في {VOICES_DIR.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))

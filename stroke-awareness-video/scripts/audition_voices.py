"""Generate short voice auditions so you can pick speed / pitch per character.

Usage:  python3 scripts/audition_voices.py

Writes public/audio/auditions/<character>__<variant>.mp3 and prints a list.
Copy the rate / pitch you like into the character in src/data/dialogue.json,
then run `npm run voices`.
"""

from __future__ import annotations

import asyncio
import os
import sys

from audio_common import PUBLIC, ffmpeg

try:
    import edge_tts
except ImportError:
    sys.exit("edge-tts غير مثبّت. ثبّته بالأمر:  pip install edge-tts")

OUT = PUBLIC / "audio" / "auditions"

SAMPLES = {
    "father": "إيه والله، هالمرّة بتدخل. صدّقني.",
    "narrator": "توقّف لحظة. ما تراه الآن قد يكون سكتة دماغية، وكلّ دقيقة لها ثمن.",
    "son": "يُبَه؟! وش فيك؟ يُبَه، ردّ عليّ!",
    "paramedic": "ممتاز إنك اتّصلت بسرعة. الفريق في الطريق.",
}

# (variant name, voice, rate, pitch)
VARIANTS = {
    "father": [
        ("hamed-default", "ar-SA-HamedNeural", "+0%", "+0Hz"),
        ("hamed-warm", "ar-SA-HamedNeural", "-8%", "-6Hz"),
        ("hamed-older", "ar-SA-HamedNeural", "-12%", "-12Hz"),
    ],
    "narrator": [
        ("hamed-default", "ar-SA-HamedNeural", "+0%", "+0Hz"),
        ("hamed-calm", "ar-SA-HamedNeural", "-10%", "-2Hz"),
        ("hamed-deep", "ar-SA-HamedNeural", "-14%", "-8Hz"),
    ],
    "son": [
        ("zariyah-default", "ar-SA-ZariyahNeural", "+0%", "+0Hz"),
        ("zariyah-boy", "ar-SA-ZariyahNeural", "+4%", "+0Hz"),
        ("zariyah-young", "ar-SA-ZariyahNeural", "+8%", "+12Hz"),
    ],
    "paramedic": [
        ("hamed-bright", "ar-SA-HamedNeural", "+2%", "+10Hz"),
        ("hamed-firm", "ar-SA-HamedNeural", "+0%", "+4Hz"),
        # Gulf (non-Saudi) alternatives with a clearly different timbre.
        ("gulf-kw-fahed", "ar-KW-FahedNeural", "+0%", "+0Hz"),
        ("gulf-ae-hamdan", "ar-AE-HamdanNeural", "+0%", "+0Hz"),
    ],
}


async def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
    failed = 0
    for character, variants in VARIANTS.items():
        for name, voice, rate, pitch in variants:
            raw = OUT / f"{character}__{name}.raw.mp3"
            out = OUT / f"{character}__{name}.mp3"
            try:
                await edge_tts.Communicate(
                    SAMPLES[character], voice, rate=rate, pitch=pitch, proxy=proxy
                ).save(str(raw))
                ffmpeg("-i", str(raw), "-af", "loudnorm=I=-16:TP=-1.5", "-ar", "48000", str(out))
                print(f"  ✓ {out.name:<38} {voice} rate={rate} pitch={pitch}")
            except Exception as exc:
                failed += 1
                print(f"  ✗ {out.name:<38} {type(exc).__name__}: {exc}")
            finally:
                raw.unlink(missing_ok=True)
    if failed:
        print(f"\n⚠️  تعذّر توليد {failed} عيّنة صوتية.")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))

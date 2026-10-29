"""Verify every audio asset before rendering. Exits 1 if anything is wrong.

Checks for each dialogue line:
  - the MP3 exists and was generated from the *current* text + voice settings
  - it is long enough and not silent
Checks that every sound effect and music file referenced in dialogue.json exists
and is audible.

`npm run render` runs this first, so a silent or out-of-date video is never exported.
"""

from __future__ import annotations

import sys

from audio_common import (
    PUBLIC,
    all_lines,
    line_hash,
    load_dialogue,
    load_manifest,
    loudness_stats,
    probe_duration,
    voice_settings,
)

MIN_MEAN_DB = -40.0  # anything quieter than this is treated as silent


def check_file(rel: str, label: str, problems: list[str]) -> None:
    path = PUBLIC / rel
    if not path.exists():
        problems.append(f"{label}: الملف غير موجود ({rel})")
        return
    duration = probe_duration(path)
    mean, peak = loudness_stats(path)
    status = "✓" if mean > MIN_MEAN_DB and duration > 0.3 else "✗"
    print(f"  {status} {label:<22} {duration:6.2f}s  mean {mean:6.1f} dB  peak {peak:5.1f} dB")
    if duration <= 0.3:
        problems.append(f"{label}: قصير جدًا ({duration:.2f}s)")
    if mean <= MIN_MEAN_DB:
        problems.append(f"{label}: الصوت صامت أو منخفض جدًا ({mean:.1f} dB)")


def main() -> int:
    dialogue = load_dialogue()
    manifest = load_manifest().get("lines", {})
    problems: list[str] = []

    print("الحوارات (Edge TTS):")
    for line in all_lines(dialogue):
        entry = manifest.get(line["id"])
        if not entry:
            problems.append(f"{line['id']}: لم يُولَّد صوت لهذه الجملة — شغّل npm run voices")
            print(f"  ✗ {line['id']:<22} (missing)")
            continue
        if entry.get("hash") != line_hash(line, voice_settings(dialogue, line)):
            problems.append(f"{line['id']}: النص أو إعدادات الصوت تغيّرت — شغّل npm run voices")
            print(f"  ✗ {line['id']:<22} (out of date)")
            continue
        check_file(entry["file"], line["id"], problems)

    print("\nالمؤثرات والموسيقى:")
    for sfx in dialogue["sfx"]:
        check_file(sfx["src"], sfx["id"], problems)
    for key in ("calm", "tension"):
        check_file(dialogue["music"][key]["src"], f"music:{key}", problems)

    if problems:
        print("\n⛔ لا يمكن الرندر — المشاكل التالية يجب حلّها أولًا:")
        for p in problems:
            print(f"   - {p}")
        return 1
    print("\n✅ جميع الأصوات سليمة وجاهزة للرندر.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

"""NuclearAwareness — one 120 s ambience bed aligned to the scene timing (no music, no voices).

Usage:  python3 scripts/generate_nuclear_ambience.py   (needs numpy; run after generate_nuclear_voice.py)

Quiet, non-alarming textures only: space drone + soft pulses, a distant facility hum, wind,
rain, flowing water and a lab room tone with gentle UI blips. No sirens, no explosions.
Writes public/nuclear/sfx/ambience.mp3.
"""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np

from generate_sfx import SR, band, env_exp, pink, rng, stereo_reverb, t_axis, write

import sys

ROOT = Path(__file__).resolve().parent.parent
# --plan FILE: timing exported from the silent film (scripts/export_silent_plan.ts); default = narrated film
PLAN = json.loads(Path(sys.argv[sys.argv.index("--plan") + 1]).read_text()) if "--plan" in sys.argv else None
OUT_NAME = "../nuclear/sfx/ambience-silent.mp3" if PLAN else "../nuclear/sfx/ambience.mp3"
FPS, TOTAL = 30, (PLAN["total"] if PLAN else 3600)
timing = json.loads((ROOT / "src/nuclear/data/voice-timing.json").read_text())
narr = json.loads((ROOT / "src/nuclear/data/narration.json").read_text())
LEAD = {"s1": 1.2}
ids = ["s1", "s2", "s3", "s4", "s5", "s6", "s7"]
scenes, t = {}, 0.0
for i, k in enumerate(ids):  # same arithmetic as src/nuclear/data/timeline.ts
    start = round(t * FPS)
    voice_at = round((t + LEAD.get(k, 0.7)) * FPS)
    t = t + LEAD.get(k, 0.7) + timing[k] + 0.6
    end = TOTAL if i == len(ids) - 1 else round(t * FPS)
    scenes[k] = (start / FPS, end / FPS, voice_at / FPS)


if PLAN:
    scenes = {k: (v[0] / FPS, v[1] / FPS, v[0] / FPS) for k, v in PLAN["scenes"].items()}


def word(sid: str, prefix: str, n: int = 0) -> float:
    if PLAN:
        key = f"{sid}:{prefix}" + (f"#{n}" if n else "")
        return PLAN["cues"][key] / FPS
    words = json.loads((ROOT / f"public/nuclear/voice/{sid}.words.json").read_text())
    toks = next(s["text"] for s in narr["scenes"] if s["id"] == sid).split()
    hits = [w for w, tok in zip(words, toks) if tok.strip("،؛.؟,").startswith(prefix)]
    return scenes[sid][2] + round(hits[n]["t"] * FPS) / FPS


N = int(TOTAL / FPS * SR)
T = np.arange(N) / SR


def gate(a: float, b: float, fade: float = 0.8) -> np.ndarray:
    """Envelope 1 inside [a, b] with raised-cosine fades."""
    g = np.clip((T - a) / fade + 0.5, 0, 1) * np.clip((b - T) / fade + 0.5, 0, 1)
    return 0.5 - 0.5 * np.cos(np.pi * g)


def stereo_noise(lo: float, hi: float) -> np.ndarray:
    return np.stack([band(pink(N), lo, hi), band(pink(N), lo, hi)], axis=1)


def lfo(rate: float, depth: float, phase: float = 0) -> np.ndarray:
    return 1 - depth + depth * (0.5 + 0.5 * np.sin(2 * np.pi * rate * T + phase))


def mono(x: np.ndarray) -> np.ndarray:
    return np.stack([x, x], axis=1)


def norm(x: np.ndarray) -> np.ndarray:
    return x / (np.sqrt(np.mean(x**2)) + 1e-9)


out = np.zeros((N, 2))
s1, s2, s3, s4, s5, s6, s7 = (scenes[k] for k in ids)

# space drone (s1 → map, and the finale)
drone = sum(np.sin(2 * np.pi * f * T + p) * a for f, p, a in [(55, 0, 1), (82.4, 1, 0.6), (110.2, 2, 0.35), (164.8, 0.5, 0.15)])
drone = norm(drone * lfo(0.07, 0.4)) * 0.5 + norm(stereo_noise(60, 420).mean(axis=1)) * 0.25
out += mono(drone) * (gate(0, s1[0] + 7.5, 1.6) + gate(s7[0], s7[1] + 2, 1.4) * 0.9)[:, None] * 0.05

# soft electronic pulses on the opening questions
for at in [word("s1", "حادث"), word("s1", "مئات"), word("s1", "هل")]:
    n = int(1.6 * SR)
    p = np.sin(2 * np.pi * 196 * t_axis(1.6)) * env_exp(n, 0.35) + 0.4 * np.sin(2 * np.pi * 392 * t_axis(1.6)) * env_exp(n, 0.2)
    p = stereo_reverb(p * np.clip(np.arange(n) / (0.01 * SR), 0, 1), 2.2, 0.45)
    i0 = int(at * SR)
    out[i0 : i0 + len(p)] += p[: N - i0] * 0.05

# map / facility: low distant hum
hum = norm(sum(np.sin(2 * np.pi * f * T) * a for f, a in [(50, 1), (100, 0.5), (150, 0.2)])) * 0.35 + norm(stereo_noise(120, 900).mean(axis=1)) * 0.5
out += mono(hum) * gate(s1[0] + 5.5, s2[1] + 0.4, 1.4)[:, None] * 0.035

# wind (atmosphere + dispersion map), gusting slowly
wind = stereo_noise(180, 2200)
wind = wind / np.abs(wind).max()
gust = lfo(0.11, 0.6) * lfo(0.043, 0.4, 1.3)
wstart = word("s3", "تحملها", 1) - 1.0
out += wind * (gust * (gate(s3[0] - 0.5, s4[1] + 0.4, 1.2) * 0.45 + gate(wstart, s3[1], 1.5) * 0.55))[:, None] * 0.11

# rain (rain-out → raindrop scene)
rstart = word("s3", "الأمطار") - 0.6
rain = stereo_noise(1500, 9000)
rain = rain / np.abs(rain).max()
drops = np.zeros(N)
for k in rng.integers(0, N - 2000, 1600):
    drops[k : k + 600] += band(rng.standard_normal(600), 2500, 7000) * env_exp(600, 0.004) * rng.uniform(0.2, 1)
rainbed = rain * 0.7 + mono(drops / (np.abs(drops).max() + 1e-9)) * 0.5
out += rainbed * gate(rstart, s5[0] + 2.4, 1.2)[:, None] * 0.07

# water / soil (s5): soft flowing water
water = stereo_noise(250, 2400) * mono(lfo(0.6, 0.3) * lfo(1.7, 0.2, 0.7))
out += water / np.abs(water).max() * gate(s5[0] + 1.6, s5[1] + 0.3, 1.0)[:, None] * 0.05

# lab room tone (s6) + gentle UI blips on the meter and the analysis screen
room = stereo_noise(90, 700)
out += room / np.abs(room).max() * gate(s6[0], s6[1] + 0.3, 0.8)[:, None] * 0.035
for at, f0 in [(word("s6", "أجهزة"), 1320), (word("s6", "أجهزة") + 0.25, 1760), (word("s6", "والقياسات"), 1175), (word("s6", "الرسمية"), 1568)]:
    n = int(0.35 * SR)
    b = np.sin(2 * np.pi * f0 * t_axis(0.35)) * env_exp(n, 0.06) * np.clip(np.arange(n) / (0.004 * SR), 0, 1)
    b = stereo_reverb(b, 0.8, 0.3)
    i0 = int(at * SR)
    out[i0 : i0 + len(b)] += b[: N - i0] * 0.03

# global fade-in/out
out *= gate(0, TOTAL / FPS, 1.0)[:, None]
write(OUT_NAME, out, peak=0.5, kbps=256)
print("scenes:", {k: tuple(round(v, 2) for v in s) for k, s in scenes.items()})

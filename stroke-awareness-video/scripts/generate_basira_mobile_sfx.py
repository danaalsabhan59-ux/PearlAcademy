"""Basira mobile video — soft, non-musical UI sound effects only (no music, no voices).

Usage:  python3 scripts/generate_basira_mobile_sfx.py      (needs numpy)

Writes public/basira/audio/m-*.mp3. Every sound is a short click, noise swish or a
single soft blip — no chords, melodies or rhythms.
"""

from __future__ import annotations

import numpy as np

from generate_sfx import SR, band, env_exp, place, rng, t_axis, write


def click() -> np.ndarray:
    """Soft card-appear click."""
    n = int(0.06 * SR)
    tick = band(rng.standard_normal(n), 1500, 6000) * env_exp(n, 0.006)
    body = np.sin(2 * np.pi * 1100 * t_axis(0.06)) * env_exp(n, 0.012) * 0.5
    return tick + body


def type_tick() -> np.ndarray:
    """Very light keyboard tick."""
    n = int(0.025 * SR)
    return band(rng.standard_normal(n), 2500, 8000) * env_exp(n, 0.003)


def typing_burst() -> np.ndarray:
    """A short burst of irregular key ticks (~0.9 s)."""
    out = np.zeros(int(1.0 * SR))
    t = 0.0
    while t < 0.85:
        place(out, type_tick(), t, rng.uniform(0.5, 1.0))
        t += rng.uniform(0.07, 0.14)
    return out


def whoosh() -> np.ndarray:
    """Soft transition whoosh (filtered noise sweep)."""
    seconds = 0.55
    tt = t_axis(seconds)
    p = tt / seconds
    x = rng.standard_normal(len(tt))
    lo, hi = band(x, 250, 1400), band(x, 1400, 6000)
    return (lo * (1 - p) + hi * p) * np.sin(np.pi * p) ** 2


def flip() -> np.ndarray:
    """Card flip: two quick paper swishes."""
    out = np.zeros(int(0.32 * SR))
    for at, g in ((0.0, 1.0), (0.12, 0.6)):
        n = int(0.12 * SR)
        sw = band(rng.standard_normal(n), 900, 7000) * np.sin(np.pi * np.arange(n) / n) ** 2
        place(out, sw, at, g)
    return out


def file_open() -> np.ndarray:
    """Digital file open: short rising noise swipe + soft click."""
    seconds = 0.4
    tt = t_axis(seconds)
    p = tt / seconds
    swipe = band(rng.standard_normal(len(tt)), 600, 7000) * p**1.5 * (1 - p) * 4
    out = swipe * 0.6
    place(out, click(), 0.3, 0.8)
    return out


def title_fx() -> np.ndarray:
    """Light electronic title effect: filtered noise rise into a soft digital blip."""
    seconds = 0.9
    tt = t_axis(seconds)
    p = tt / seconds
    noise = band(rng.standard_normal(len(tt)), 2000, 9000) * p**2 * 0.5
    out = noise * np.clip((0.75 - tt) / 0.05, 0, 1)
    blip_t = t_axis(0.15)
    blip = np.sin(2 * np.pi * (1800 - 800 * blip_t / 0.15) * blip_t) * env_exp(len(blip_t), 0.04)
    place(out, blip, 0.72, 0.6)
    return out


def confirm() -> np.ndarray:
    """Single soft confirmation blip (one pitch — not a melody)."""
    tt = t_axis(0.18)
    return np.sin(2 * np.pi * 1500 * tt) * env_exp(len(tt), 0.05) * (1 - np.exp(-tt / 0.002))


def end_fx() -> np.ndarray:
    """Short non-musical closing sound: soft air swoosh settling into a low thud."""
    seconds = 1.2
    out = np.zeros(int(seconds * SR))
    place(out, whoosh(), 0.0, 0.7)
    tt = t_axis(0.6)
    f = 55 + 60 * np.exp(-tt / 0.05)
    thud = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(len(tt), 0.18)
    place(out, thud, 0.42, 0.8)
    return out


def main() -> None:
    print("Basira mobile SFX:")
    for name, fn in [
        ("click", click),
        ("typing", typing_burst),
        ("whoosh", whoosh),
        ("flip", flip),
        ("file-open", file_open),
        ("title", title_fx),
        ("confirm", confirm),
        ("end", end_fx),
    ]:
        write(f"../basira/audio/m-{name}.mp3", fn(), peak=0.8)


if __name__ == "__main__":
    main()

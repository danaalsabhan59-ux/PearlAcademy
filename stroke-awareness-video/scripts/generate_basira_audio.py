"""Basira «الذكاء الاصطناعي في الطب» — original music and UI sound effects (no samples, no vocals).

Usage:  python3 scripts/generate_basira_audio.py      (needs numpy)

Music: bright tech-product-ad electronic track, 120 BPM, D major (D – A – Bm – G),
exactly 60 s. Bars start at odd seconds, so the scene changes at 5, 13, 21, 29, 43
and 55 s land on downbeats. Arrangement: filtered intro → full groove from 5 s →
risers into every scene change → breakdown in the clinical scene (50–55 s) →
final drop on the closing (55 s) → last hit at 59 s.

Writes public/basira/audio/music.mp3 and public/basira/audio/sfx-*.mp3
"""

from __future__ import annotations

import numpy as np

from generate_sfx import SR, band, env_exp, note, place, rng, stereo_reverb, t_axis, write

FILM = 60.0
N = int(FILM * SR)
BEAT = 0.5
T0 = 1.0
SCENE_CHANGES = [5.0, 13.0, 21.0, 29.0, 36.0, 43.0, 50.0, 55.0]
CHORDS = [[62, 66, 69], [57, 61, 64], [59, 62, 66], [55, 59, 62]]  # D A Bm G
ROOTS = [38, 45, 47, 43]


def saw(freq: float, seconds: float, detune: float = 0.0) -> np.ndarray:
    tt = t_axis(seconds)
    return 2 * ((freq * (1 + detune) * tt + rng.uniform()) % 1.0) - 1


def kick(g: float = 1.0) -> np.ndarray:
    tt = t_axis(0.35)
    f = 48 + 110 * np.exp(-tt / 0.03)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(len(tt), 0.14)
    click = band(rng.standard_normal(len(tt)), 3000, 9000) * env_exp(len(tt), 0.002) * 0.3
    return np.tanh((body + click) * 1.4) * g


def clap() -> np.ndarray:
    n = int(0.22 * SR)
    burst = band(rng.standard_normal(n), 1000, 7000)
    x = np.zeros(n)
    for k, d in enumerate((0.0, 0.01, 0.02)):
        i = int(d * SR)
        x[i:] += burst[: n - i] * env_exp(n - i, 0.01 if k < 2 else 0.06)
    return x * 0.8


def hat(open_: bool = False) -> np.ndarray:
    n = int((0.16 if open_ else 0.04) * SR)
    return band(rng.standard_normal(n), 7500, 16000) * env_exp(n, 0.06 if open_ else 0.01)


def pluck(midi: float, seconds: float = 0.3) -> np.ndarray:
    tt = t_axis(seconds)
    f = note(midi)
    x = np.sin(2 * np.pi * f * tt) + 0.5 * np.sin(4 * np.pi * f * tt) * env_exp(len(tt), 0.04) + 0.3 * saw(f, seconds) * env_exp(len(tt), 0.03)
    return x * env_exp(len(tt), 0.12)


def pad(chord: list[int], seconds: float) -> np.ndarray:
    out = np.zeros(int(seconds * SR))
    for m in chord:
        for d in (-0.006, 0.0, 0.006):
            out += saw(note(m), seconds, d)
    n = len(out)
    env = np.minimum(1, np.arange(n) / (0.08 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.2 * SR))
    return out * env / (len(chord) * 3)


def riser(seconds: float) -> np.ndarray:
    tt = t_axis(seconds)
    p = tt / seconds
    noise = band(rng.standard_normal(len(tt)), 1500, 12000) * p**2
    tone = np.sin(2 * np.pi * np.cumsum(400 * 2 ** (p * 2)) / SR) * 0.25 * p**2
    return noise * 0.6 + tone


def impact() -> np.ndarray:
    tt = t_axis(1.2)
    f = 40 + 90 * np.exp(-tt / 0.05)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(len(tt), 0.35)
    shimmer = band(rng.standard_normal(len(tt)), 5000, 14000) * env_exp(len(tt), 0.4) * 0.3
    return np.tanh(boom * 1.6) + shimmer


def section(t: float) -> str:
    if t < 5.0:
        return "intro"
    if 50.0 <= t < 55.0:
        return "break"
    if t >= 59.0:
        return "tail"
    return "full"


def music() -> np.ndarray:
    drums, bass, synth, fx = (np.zeros(N) for _ in range(4))
    kicks: list[float] = []
    n_beats = int((FILM - T0) / BEAT) + 2
    for n in range(-2, n_beats):
        t = T0 + n * BEAT
        if t < 0 or t >= FILM:
            continue
        sec = section(t)
        bar = int(np.floor((t - T0) / 2.0))
        ch = CHORDS[bar % 4]
        # drums
        if sec == "full":
            place(drums, kick(), t)
            kicks.append(t)
            if n % 2 == 1:
                place(drums, clap(), t, 0.5)
            place(drums, hat(open_=True), t + BEAT / 2, 0.22)
            for k in (1, 3):
                place(drums, hat(), t + k * BEAT / 4, 0.1)
        elif sec == "intro" and t >= 3.0:
            place(drums, kick(0.5), t)
            kicks.append(t)
        elif sec == "break" and n % 2 == 0:
            place(drums, hat(), t, 0.12)
        # bass: offbeat 8ths on the root
        if sec == "full":
            seg = saw(note(ROOTS[bar % 4]), BEAT / 2 * 0.9) * 0.6 + np.sin(2 * np.pi * note(ROOTS[bar % 4]) * t_axis(BEAT / 2 * 0.9))
            place(bass, seg * env_exp(len(seg), 0.12), t + BEAT / 2, 0.8)
        # plucky 16th arpeggio (all sections except the tail)
        if sec != "tail":
            pattern = [ch[0] + 12, ch[2] + 12, ch[1] + 12, ch[2] + 12]
            for k in range(4):
                g = 0.07 if sec == "intro" else 0.11 if sec == "full" else 0.09
                place(synth, pluck(pattern[k] + (12 if (n % 4 == 3 and k == 3) else 0)), t + k * BEAT / 4, g)
        # pad at every bar start
        if (t - T0) % 2.0 < 1e-6 and sec != "tail":
            place(synth, pad(ch, 2.05), t, 0.10 if sec != "intro" else 0.07)

    # risers into each scene change, impacts on the big ones
    for c in SCENE_CHANGES:
        place(fx, riser(0.9), c - 0.9, 0.35 if c not in (5.0, 55.0) else 0.55)
    for c, g in [(5.0, 0.7), (29.0, 0.35), (55.0, 0.8), (59.0, 0.9)]:
        place(fx, impact(), c, g)

    # sidechain pump on bass + synth
    tt = t_axis(FILM)
    pump = np.ones(N)
    for kt in kicks:
        i0 = int(kt * SR)
        i1 = min(N, i0 + int(BEAT * SR))
        pump[i0:i1] = np.minimum(pump[i0:i1], 1 - 0.55 * np.exp(-(tt[i0:i1] - kt) / 0.09))
    # intro low-pass opening: filter the synth bus progressively
    synth_lo = band(synth, 150, 1500)
    synth_hi = band(synth, 150, 9000)
    open_ = np.clip(tt / 5.0, 0, 1) ** 2
    synth = (synth_lo * (1 - open_) + synth_hi * open_) * pump
    bass = band(bass, 30, 700) * pump
    mix = drums * 0.85 + bass * 0.8 + synth * 0.9 + fx * 0.7
    st = stereo_reverb(mix, 1.6, 0.18, 8000)
    # final fade: last hit at 59 s rings out, silence by 60 s
    fade = np.clip((FILM - tt) / 0.9, 0, 1)
    return st * fade[:, None]


# -------------------------------------------------------------- effects
def sfx_whoosh() -> np.ndarray:
    seconds = 0.7
    tt = t_axis(seconds)
    p = tt / seconds
    x = band(rng.standard_normal(len(tt)), 300, 6000)
    lo, hi = band(x, 300, 1500), band(x, 1500, 7000)
    return (lo * (1 - p) + hi * p) * np.sin(np.pi * p) ** 2


def sfx_pop() -> np.ndarray:
    tt = t_axis(0.12)
    f = 900 + 600 * np.exp(-tt / 0.02)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(len(tt), 0.03)


def sfx_type() -> np.ndarray:
    n = int(0.03 * SR)
    return band(rng.standard_normal(n), 2000, 8000) * env_exp(n, 0.004)


def sfx_flip() -> np.ndarray:
    seconds = 0.35
    tt = t_axis(seconds)
    x = band(rng.standard_normal(len(tt)), 800, 6000) * np.sin(np.pi * tt / seconds) ** 3
    return x


def sfx_success() -> np.ndarray:
    out = np.zeros(int(0.7 * SR))
    for k, m in enumerate((79, 83, 86)):
        tt = t_axis(0.5)
        tone = np.sin(2 * np.pi * note(m) * tt) * env_exp(len(tt), 0.18)
        place(out, tone, k * 0.07, 0.5)
    return out


def sfx_shimmer() -> np.ndarray:
    seconds = 2.0
    out = np.zeros(int(seconds * SR))
    for k, m in enumerate((74, 78, 81, 86, 90)):
        tt = t_axis(1.6)
        tone = np.sin(2 * np.pi * note(m) * tt) * env_exp(len(tt), 0.5)
        place(out, tone, k * 0.06, 0.3)
    return stereo_reverb(out, 2.0, 0.4, 9000)


def main() -> None:
    print("Basira audio:")
    write("../basira/audio/music.mp3", music(), peak=0.85, kbps=256)
    for name, fn in [
        ("whoosh", sfx_whoosh),
        ("pop", sfx_pop),
        ("type", sfx_type),
        ("flip", sfx_flip),
        ("success", sfx_success),
        ("shimmer", sfx_shimmer),
    ]:
        write(f"../basira/audio/sfx-{name}.mp3", fn())


if __name__ == "__main__":
    main()

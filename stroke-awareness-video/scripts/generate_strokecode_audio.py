"""Synthesise the STROKE CODE sound effects and music (no voices, no samples).

Usage:  python3 scripts/generate_strokecode_audio.py      (needs numpy)

Writes public/sc/sfx/*.mp3 and public/sc/music/*.mp3. Everything is generated
procedurally from oscillators, noise and envelopes, so it is original work.
The cup crash, phone tones, siren and tension bed are reused from
scripts/generate_sfx.py (public/audio/...).
"""

from __future__ import annotations

import numpy as np

from generate_sfx import (
    SR,
    adsr,
    band,
    env_exp,
    loop_seam,
    note,
    pad_voice,
    pink,
    place,
    reverb,
    rng,
    saw,
    stereo_reverb,
    t_axis,
    write,
)


def sine(freq: float, seconds: float) -> np.ndarray:
    return np.sin(2 * np.pi * freq * t_axis(seconds))


def beep(freq: float, seconds: float, attack: float = 0.004, release: float = 0.03) -> np.ndarray:
    x = sine(freq, seconds) + 0.15 * sine(freq * 2, seconds)
    return x * adsr(len(x), attack, release)


def bell(freq: float, seconds: float) -> np.ndarray:
    tt = t_axis(seconds)
    partials = [(1, 1.0, 1.2), (2.01, 0.4, 0.6), (3.02, 0.2, 0.35), (4.17, 0.1, 0.2)]
    return sum(a * np.sin(2 * np.pi * freq * r * tt) * env_exp(len(tt), d) for r, a, d in partials)


# ------------------------------------------------------------------ effects
def ecg_beeps() -> np.ndarray:
    """Soft monitor beeps with a low pulse, ~72 bpm, for the opening ECG line."""
    out = np.zeros(int(7.0 * SR))
    for k in range(9):
        at = 0.2 + k * (60 / 72)
        place(out, beep(880, 0.09), at, 0.35)
        thump = sine(60, 0.18) * env_exp(int(0.18 * SR), 0.05)
        place(out, thump, at, 0.5)
    return reverb(out, 1.2, 0.3)


def whoosh() -> np.ndarray:
    seconds = 1.4
    t = t_axis(seconds)
    n = len(t)
    noise = rng.standard_normal(n)
    # Sweep a band-pass upward by mixing progressively brighter bands.
    lo, mid, hi = band(noise, 150, 600), band(noise, 600, 2500), band(noise, 2500, 8000)
    p = t / seconds
    x = lo * (1 - p) + mid * np.sin(np.pi * p) + hi * p**2
    return reverb(x * np.sin(np.pi * p) ** 1.5, 1.0, 0.3)


def tv_ambience() -> np.ndarray:
    """Distant football-broadcast bed: soft crowd roar and claps, no voices."""
    seconds = 20.0
    t = t_axis(seconds + 2)
    roar = band(pink(len(t)), 300, 1800) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.09 * t))
    clap = band(rng.standard_normal(int(0.04 * SR)), 1200, 5000) * env_exp(int(0.04 * SR), 0.01)
    for _ in range(160):
        place(roar, clap, rng.uniform(0, seconds), 0.04)
    out = band(roar, 250, 3200)  # small TV speaker
    return loop_seam(reverb(out, 0.6, 0.2), 2.0)


def clock_tick() -> np.ndarray:
    out = np.zeros(int(4.0 * SR))
    for k in range(4):
        click = band(rng.standard_normal(int(0.025 * SR)), 1800, 7000) * env_exp(int(0.025 * SR), 0.004)
        body = sine(2600 if k % 2 == 0 else 2100, 0.025) * env_exp(int(0.025 * SR), 0.006)
        place(out, click + 0.5 * body, k * 1.0, 1.0)
    return reverb(out, 0.4, 0.15)


def ui_chime() -> np.ndarray:
    out = np.zeros(int(1.8 * SR))
    place(out, bell(note(81), 1.6), 0.0, 0.5)
    place(out, bell(note(86), 1.4), 0.12, 0.45)
    return reverb(out, 1.4, 0.3)


def monitor_alert() -> np.ndarray:
    out = np.zeros(int(1.6 * SR))
    for k in range(3):
        place(out, beep(960, 0.12), 0.1 + k * 0.22, 0.6)
    return reverb(out, 0.8, 0.2)


def code_alert() -> np.ndarray:
    """Non-vocal overhead alert: rising two-tone chime, three times."""
    out = np.zeros(int(3.4 * SR))
    for k in range(3):
        at = k * 1.0
        place(out, bell(note(76), 0.9), at, 0.55)
        place(out, bell(note(83), 0.9), at + 0.22, 0.55)
    return reverb(out, 1.6, 0.35)


def monitor_beep() -> np.ndarray:
    out = np.zeros(int(4.0 * SR))
    for k in range(5):
        place(out, beep(1000, 0.07), k * 0.8, 0.35)
    return out


def glucometer() -> np.ndarray:
    out = np.zeros(int(0.6 * SR))
    place(out, beep(2400, 0.07), 0.0, 0.4)
    place(out, beep(2400, 0.07), 0.13, 0.4)
    return out


def ct_ambience() -> np.ndarray:
    """CT room: fan noise, mains hum, gantry spin-up and rotating whir."""
    seconds = 10.0
    t = t_axis(seconds)
    n = len(t)
    fan = band(pink(n), 80, 900) * 0.25
    hum = (np.sin(2 * np.pi * 60 * t) + 0.4 * np.sin(2 * np.pi * 120 * t)) * 0.12
    spin = np.clip((t - 2.4) / 2.0, 0, 1)  # spin-up after the table moves in
    rot_freq = 180 + 260 * spin
    whir = np.sin(2 * np.pi * np.cumsum(rot_freq) / SR) * 0.18 * spin
    swish = band(rng.standard_normal(n), 400, 2400) * (0.5 + 0.5 * np.sin(2 * np.pi * 1.6 * t)) * 0.12 * spin
    motor = band(rng.standard_normal(n), 200, 900) * np.exp(-((t - 1.2) ** 2) / 0.6) * 0.3  # table motor
    return reverb(fan + hum + whir + swish + motor, 0.8, 0.2)


def final_hit() -> np.ndarray:
    seconds = 3.0
    tt = t_axis(seconds)
    freq = 45 + 50 * np.exp(-tt / 0.08)
    boom = np.sin(2 * np.pi * np.cumsum(freq) / SR) * env_exp(len(tt), 0.7)
    shimmer = sum(bell(note(m), seconds) for m in (74, 78, 81)) * 0.12
    return reverb(boom + shimmer, 2.4, 0.35)


# -------------------------------------------------------------------- music
def chord_track(chords: list[list[int]], bar: float, seconds: float, pad_gain: float, keys: bool) -> np.ndarray:
    n = int(seconds * SR)
    pad = np.zeros(n)
    sub = np.zeros(n)
    piano = np.zeros(n)
    for b in range(int(np.ceil(seconds / bar))):
        chord = chords[b % len(chords)]
        start = b * bar
        for m in chord[1:]:
            place(pad, pad_voice(note(m), bar + 1.6), start - 0.3, pad_gain)
        st = t_axis(bar + 1)
        place(sub, np.sin(2 * np.pi * note(chord[0] - 12) * st) * adsr(len(st), 0.6, 1.0), start, 0.3)
        if keys:
            for k, m in enumerate([chord[2], chord[3], chord[4], chord[3]]):
                kt = t_axis(2.4)
                f = note(m + 12)
                tone = np.sin(2 * np.pi * f * kt) + 0.3 * np.sin(4 * np.pi * f * kt)
                place(piano, tone * env_exp(len(kt), 0.7) * adsr(len(kt), 0.005, 0.3), start + k * bar / 4, 0.1)
    return band(pad, 80, 2000) + sub + piano


def warm() -> np.ndarray:
    """D major, gentle and warm: D – Bm – G – A."""
    seconds = 18.0
    chords = [[50, 57, 62, 66, 69], [47, 54, 59, 62, 66], [43, 55, 59, 62, 67], [45, 52, 57, 61, 64]]
    x = chord_track(chords, 4.0, seconds, 0.16, keys=True)
    return stereo_reverb(x, 3.0, 0.45, 4500) * adsr(int(seconds * SR), 1.0, 0.5)[:, None]


def hospital() -> np.ndarray:
    """A minor, 100 bpm: steady eighth-note pulse, soft hats, pads. Urgent but controlled."""
    seconds = 56.0
    beat = 0.6
    n = int(seconds * SR)
    chords = [[45, 57, 60, 64, 69], [41, 57, 60, 65, 69], [48, 55, 60, 64, 67], [43, 55, 59, 62, 67]]
    bar = beat * 4 * 2  # two bars per chord
    pads = chord_track(chords, bar, seconds, 0.11, keys=False)
    pulse = np.zeros(n)
    hats = np.zeros(n)
    for k in range(int(seconds / (beat / 2))):
        at = k * beat / 2
        chord = chords[int(at // bar) % len(chords)]
        pt = t_axis(0.26)
        hit = band(saw(note(chord[0]), pt, 18), 50, 1200) * env_exp(len(pt), 0.08)
        place(pulse, hit, at, 0.8 if k % 2 == 0 else 0.5)
        h = band(rng.standard_normal(int(0.05 * SR)), 6000, 14000) * env_exp(int(0.05 * SR), 0.012)
        place(hats, h, at, 0.12 if k % 2 else 0.06)
    # Gentle intensity build across the section.
    build = np.interp(t_axis(seconds), [0, 10, 40, 56], [0.7, 0.9, 1.0, 0.8])
    mono = (pads + 0.5 * pulse + hats) * build
    return stereo_reverb(mono, 2.4, 0.35, 5000) * adsr(n, 0.5, 2.0)[:, None]


def resolve() -> np.ndarray:
    """Hopeful, serious ending: Bm – G – D (sustained)."""
    seconds = 8.5
    n = int(seconds * SR)
    out = np.zeros(n)
    for start, chord, length in [(0.0, [47, 59, 62, 66], 2.6), (2.4, [43, 59, 62, 67], 2.6), (4.8, [38, 57, 62, 66, 69], 3.7)]:
        for m in chord:
            place(out, pad_voice(note(m), length), start, 0.14)
        place(out, bell(note(chord[-1] + 12), 2.5), start + 0.05, 0.08)
    return stereo_reverb(band(out, 60, 3000), 3.5, 0.5, 4500) * adsr(n, 0.4, 2.0)[:, None]


def main() -> None:
    print("STROKE CODE effects:")
    for name, fn in [
        ("ecg-beeps", ecg_beeps),
        ("whoosh", whoosh),
        ("tv-ambience", tv_ambience),
        ("clock-tick", clock_tick),
        ("ui-chime", ui_chime),
        ("monitor-alert", monitor_alert),
        ("code-alert", code_alert),
        ("monitor-beep", monitor_beep),
        ("glucometer", glucometer),
        ("ct-ambience", ct_ambience),
        ("final-hit", final_hit),
    ]:
        write(f"../sc/sfx/{name}.mp3", fn())
    print("STROKE CODE music:")
    write("../sc/music/warm.mp3", warm(), kbps=160)
    write("../sc/music/hospital.mp3", hospital(), kbps=160)
    write("../sc/music/resolve.mp3", resolve(), kbps=160)


if __name__ == "__main__":
    main()

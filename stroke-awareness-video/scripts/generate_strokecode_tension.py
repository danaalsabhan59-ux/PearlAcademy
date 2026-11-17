"""STROKE CODE — "ticking clock" tension score (original, synthesised).

Modelled on the reference video's sound: a deep continuous drone, heavy
heartbeat-like booms, rising sweeps, a steady ticking pulse and sparse 8-bit
blips. Little melody — mostly sound design.

Usage:  python3 scripts/generate_strokecode_tension.py      (needs numpy)

Four stems, each 120 s, aligned to film time 0:
  public/sc/music/tension-drone.mp3  sub drone (rises in register as the story escalates)
  public/sc/music/tension-pulse.mp3  heartbeat booms + ticking pulse
  public/sc/music/tension-fx.mp3     rising sweeps, crashes, impacts
  public/sc/music/tension-blips.mp3  sparse square-wave blips / monitor motifs

Tempo 120 BPM, grid from 0.1 s: the drop lands on 63.6 s (CODE STROKE ACTIVATED),
and the film's 1-per-second clock-tick effect falls on every other beat.
In the intro the booms follow the opening ECG beeps (72 bpm) instead of the grid.
"""

from __future__ import annotations

import numpy as np

from generate_sfx import SR, band, env_exp, note, pink, place, rng, stereo_reverb, t_axis, write

FILM = 120.0
N = int(FILM * SR)
BEAT = 0.5
T0 = 0.1
CUP = 21.65  # hard cut 150 ms before the cup lands (21.8 s)
REBUILD = 23.1
DROP = 63.6
GAP = (DROP - 1.0, DROP)  # one second of near-silence before the drop
END_HIT = 117.6  # beat nearest TIME IS BRAIN (117.8 s)
ECG_BEEPS = [0.6 + k * 60 / 72 for k in range(8)]


def grid(a: float, b: float, step: float = BEAT) -> list[float]:
    first = T0 + np.ceil((a - T0) / step - 1e-9) * step
    return [float(t) for t in np.arange(first, b - 1e-9, step)]


def muted(t: float) -> bool:
    return CUP <= t < REBUILD or GAP[0] <= t < GAP[1]


def level(t: float, pts: list[tuple[float, float]]) -> float:
    xs, ys = zip(*pts)
    return float(np.interp(t, xs, ys))


# ----------------------------------------------------------------- voices
def boom(gain: float, depth: float = 1.0) -> np.ndarray:
    tt = t_axis(1.4)
    freq = 34 + 70 * depth * np.exp(-tt / 0.07)
    body = np.sin(2 * np.pi * np.cumsum(freq) / SR) * env_exp(len(tt), 0.45)
    knock = band(rng.standard_normal(len(tt)), 60, 400) * env_exp(len(tt), 0.03) * 0.5
    return np.tanh((body + knock) * 2.2) * gain


def heartbeat(gain: float) -> np.ndarray:
    out = np.zeros(int(1.0 * SR))
    place(out, boom(1.0, 0.8), 0.0)
    place(out, boom(0.6, 0.6), 0.26)
    return out * gain


def tick(gain: float, bright: float = 1.0) -> np.ndarray:
    n = int(0.03 * SR)
    click = band(rng.standard_normal(n), 900, 2600 + 3000 * bright) * env_exp(n, 0.004)
    tone = np.sin(2 * np.pi * 1050 * t_axis(0.03)) * env_exp(n, 0.006) * 0.6
    return (click + tone) * gain


def blip(midi: float, seconds: float, duty: float = 0.25) -> np.ndarray:
    tt = t_axis(seconds)
    ph = note(midi) * tt % 1.0
    sq = np.where(ph < duty, 1.0, -1.0)
    return sq * env_exp(len(tt), seconds * 0.5)


def sweep(seconds: float, f0: float, f1: float, voices: int = 2) -> np.ndarray:
    """Rising glissando with an octave partner (as in the reference) + noise lift."""
    tt = t_axis(seconds)
    p = tt / seconds
    out = np.zeros(len(tt))
    for v in range(voices):
        f = f0 * (f1 / f0) ** p * (2 ** v)
        tone = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * np.sin(4 * np.pi * np.cumsum(f) / SR)
        out += tone * (0.6 if v == 0 else 0.35)
    lift = band(rng.standard_normal(len(tt)), 2000, 9000) * p**3 * 0.3
    return (out * p**1.3 + lift) * np.clip((seconds - tt) / 0.05, 0, 1)


def crash(seconds: float = 2.4) -> np.ndarray:
    n = int(seconds * SR)
    return band(rng.standard_normal(n), 2500, 14000) * env_exp(n, seconds / 4)


# ------------------------------------------------------------ arrangement
def build() -> dict[str, np.ndarray]:
    drone, pulse, fx, blips = (np.zeros(N) for _ in range(4))
    tt = t_axis(FILM)

    # ---- drone: low A with fifth/octave; register and level rise with the story
    def drone_layer(f: float, gain_pts: list[tuple[float, float]]) -> np.ndarray:
        g = np.interp(tt, *zip(*gain_pts))
        wob = 1 + 0.003 * np.sin(2 * np.pi * 0.13 * tt)
        x = np.sin(2 * np.pi * np.cumsum(f * wob) / SR)
        x += 0.45 * np.sin(2 * np.pi * np.cumsum(2 * f * wob) / SR)
        x += 0.25 * np.sign(np.sin(2 * np.pi * np.cumsum(f * 1.002) / SR)) * 0.4
        return x * g

    drone += drone_layer(note(45), [(0, 0), (2.5, 0.5), (7, 0.55), (18, 0.6), (21.6, 0.8), (23.1, 0.65), (30, 0.8), (63.6, 0.9), (120, 0.9)])
    drone += drone_layer(note(52), [(0, 0), (18, 0), (21, 0.35), (23.1, 0.3), (48, 0.45), (63.6, 0.6), (89, 0.45), (103, 0.6), (120, 0.6)])
    drone += drone_layer(note(57), [(0, 0), (48, 0), (56, 0.25), (63.6, 0.5), (89, 0.3), (110, 0.5), (117.6, 0.5), (120, 0.2)])
    drone = band(drone, 60, 1200)
    drone += band(pink(N), 40, 300) * np.interp(tt, [0, 30, 63.6, 120], [0.03, 0.05, 0.08, 0.06])  # rumble bed

    # ---- intro: heartbeat booms locked to the opening ECG beeps
    for t in ECG_BEEPS:
        place(pulse, heartbeat(0.45 + 0.07 * ECG_BEEPS.index(t)), t)

    # ---- booms on the grid (every 4 beats → every 2 → every beat at the peaks)
    boom_plan = [
        (7.0, 18.0, 8, 0.45),
        (18.0, CUP, 2, 0.75),        # onset: heartbeat quickens
        (REBUILD, 30.0, 4, 0.7),
        (30.0, 48.0, 4, 0.85),
        (48.0, 56.0, 2, 0.9),
        (56.0, GAP[0], 1, 0.9),
        (DROP, 72.0, 1, 1.0),
        (72.0, 89.0, 2, 0.9),
        (89.0, 103.0, 4, 0.85),
        (103.0, 110.0, 2, 0.9),
        (110.0, END_HIT, 1, 1.0),
    ]
    for a, b, every, g in boom_plan:
        for t in grid(a, b, BEAT * every):
            if not muted(t):
                place(pulse, heartbeat(g) if every >= 2 else boom(g), t)

    # ---- ticking pulse (8ths → 16ths), getting brighter and denser
    tick_plan = [
        (7.0, 18.0, 2, 0.12, 0.2),
        (18.0, CUP, 4, 0.22, 0.5),
        (REBUILD, 30.0, 2, 0.18, 0.4),
        (30.0, 48.0, 4, 0.25, 0.6),
        (48.0, GAP[0], 4, 0.32, 0.8),
        (DROP, 89.0, 4, 0.36, 1.0),
        (89.0, 103.0, 4, 0.28, 0.7),
        (103.0, END_HIT, 4, 0.38, 1.0),
    ]
    for a, b, per_beat, g, bright in tick_plan:
        for i, t in enumerate(grid(a, b, BEAT / per_beat)):
            if muted(t):
                continue
            accent = 1.6 if i % per_beat == 0 else 1.0
            place(pulse, tick(2.6 * g * accent, bright), t)

    # ---- rising sweeps
    for a, b, f0, f1, g in [
        (0.4, 6.8, 110, 220, 0.25),
        (17.6, CUP, 220, 880, 0.5),
        (REBUILD + 2, 30.0, 110, 330, 0.3),
        (55.6, GAP[0], 220, 1320, 0.6),
        (103.0, 110.0, 220, 990, 0.5),
    ]:
        place(fx, sweep(b - a, f0, f1), a, 1.4 * g)

    # ---- crashes / impacts
    for t, g in [(7.0, 0.25), (30.0, 0.4), (DROP, 0.9), (110.0, 0.5), (END_HIT, 0.8)]:
        place(fx, crash(), t, g)
    place(fx, boom(1.0, 1.4), DROP, 1.0)
    place(fx, boom(0.9, 1.4), END_HIT, 1.0)

    # ---- sparse 8-bit blips: short minor motifs every 2 bars, monitor-like in the hospital
    motifs = [[69, 72, 76], [69, 71, 72, 69], [76, 74, 72, 69], [81, 76, 72]]
    blip_plan = [(23.1, 48.0, 8, 0.12), (48.0, GAP[0], 4, 0.14), (DROP, 89.0, 4, 0.16), (89.0, 103.0, 2, 0.12), (103.0, END_HIT, 4, 0.16)]
    for a, b, every, g in blip_plan:
        for j, t in enumerate(grid(a, b, BEAT * every)):
            if muted(t):
                continue
            motif = motifs[j % len(motifs)]
            for k, m in enumerate(motif):
                tk = t + k * BEAT / 4
                if not muted(tk):
                    place(blips, blip(m + (12 if t >= DROP else 0), 0.11), tk, 2.0 * g)

    # ---- ending: last boom on TIME IS BRAIN, then a fading heartbeat to 120 s
    after = tt > END_HIT + 0.3
    pulse[after] = 0
    blips[after] = 0
    for k in range(2):
        place(pulse, heartbeat(0.45 - 0.15 * k), END_HIT + 1.0 + k * 0.85)

    # Hard cuts (cup impact, pre-drop gap) on every stem, with 20 ms fades.
    gate = np.ones(N)
    for a, b in [(CUP, REBUILD), GAP]:
        i0, i1 = int(a * SR), int(b * SR)
        gate[i0:i1] = 0
        r = int(0.02 * SR)
        gate[i0 - r:i0] = np.linspace(1, 0, r)
        gate[i1:i1 + r] = np.linspace(0, 1, r)
    drone_gate = gate.copy()
    gi = int(GAP[0] * SR)
    drone_gate[gi:int(DROP * SR)] = 0.25  # drone breathes through the pre-drop gap
    return {"drone": drone * drone_gate, "pulse": pulse * gate, "fx": fx, "blips": blips * gate}


def finish(x: np.ndarray, wet: float) -> np.ndarray:
    st = stereo_reverb(x, 2.2, wet, 6000) if wet > 0 else np.stack([x, x], axis=1)
    fade = np.ones(len(x))
    fade[-int(0.4 * SR):] = np.linspace(1, 0, int(0.4 * SR))
    return st * fade[:, None]


def main() -> None:
    s = build()
    print("STROKE CODE tension stems (120 BPM, 120.0 s):")
    write("../sc/music/tension-drone.mp3", finish(s["drone"], 0.15), peak=0.85, kbps=256)
    write("../sc/music/tension-pulse.mp3", finish(s["pulse"], 0.18), peak=0.9, kbps=256)
    write("../sc/music/tension-fx.mp3", finish(s["fx"], 0.3), peak=0.8, kbps=256)
    write("../sc/music/tension-blips.mp3", finish(s["blips"], 0.25), peak=0.75, kbps=256)


if __name__ == "__main__":
    main()

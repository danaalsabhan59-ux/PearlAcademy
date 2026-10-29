"""STROKE CODE — energetic medical-emergency electronic score (original, synthesised).

Usage:  python3 scripts/generate_strokecode_music.py      (needs numpy)

Writes four stems, each exactly 120 s and aligned to film time 0:
  public/sc/music/drums.mp3   kick (incl. heartbeat-style double kicks), claps, hats, rolls
  public/sc/music/bass.mp3    sidechained rolling bass pulses
  public/sc/music/synths.mp3  supersaw chords, arps, lead stabs
  public/sc/music/fx.mp3      risers, crashes, impacts

Tempo is 127.2 BPM. The beat grid starts at 0.397 s (the opening ECG) so that
beat 14 lands on 7.0 s (home groove), beat 134 on 63.6 s (CODE STROKE ACTIVATED)
and beat 249 on 117.84 s (TIME IS BRAIN). Scene timing is not changed.
Everything is generated from oscillators and noise: no samples, no vocals.
"""

from __future__ import annotations

import numpy as np

from generate_sfx import SR, band, env_exp, note, place, rng, stereo_reverb, t_axis, write

FILM = 120.0
N = int(FILM * SR)
BEAT = 60 / 127.2
T0 = 7.0 - 14 * BEAT  # ≈ 0.397 s
CUP = 21.65  # hard musical cut 150 ms before the cup hits the floor (21.8 s), so the crash lands in silence

# Section boundaries in beats (see module docstring for the anchors).
INTRO, HOME, BREAK_END, SIGNS, CALL, BUILD, DROP, CT, DECIDE, FINAL, END = (
    0, 14, 48, 64, 96, 118, 134, 190, 216, 232, 249,
)


def bt(n: float) -> float:
    """Film time (s) of beat n."""
    return T0 + n * BEAT


# ------------------------------------------------------------------ voices
def kick(gain: float = 1.0, punch: float = 1.0) -> np.ndarray:
    tt = t_axis(0.42)
    freq = 46 + 120 * punch * np.exp(-tt / 0.035)
    body = np.sin(2 * np.pi * np.cumsum(freq) / SR) * env_exp(len(tt), 0.17)
    click = band(rng.standard_normal(len(tt)), 2000, 9000) * env_exp(len(tt), 0.003) * 0.35
    return np.tanh((body + click) * 1.6) * gain


def clap() -> np.ndarray:
    n = int(0.25 * SR)
    x = np.zeros(n)
    burst = band(rng.standard_normal(n), 900, 6000)
    for k, d in enumerate((0.0, 0.011, 0.022)):
        i = int(d * SR)
        x[i:] += burst[: n - i] * env_exp(n - i, 0.012 if k < 2 else 0.07)
    body = np.sin(2 * np.pi * 190 * t_axis(0.25)) * env_exp(n, 0.04) * 0.4
    return x * 0.8 + body


def hat(open_: bool = False) -> np.ndarray:
    n = int((0.2 if open_ else 0.05) * SR)
    return band(rng.standard_normal(n), 7000, 16000) * env_exp(n, 0.07 if open_ else 0.012)


def saw_wave(freq: float, seconds: float, detune: float = 0.0) -> np.ndarray:
    tt = t_axis(seconds)
    ph = (freq * (1 + detune) * tt + rng.uniform()) % 1.0
    return 2 * ph - 1


def supersaw(freq: float, seconds: float, voices: int = 7, spread: float = 0.012) -> np.ndarray:
    dets = np.linspace(-spread, spread, voices)
    return sum(saw_wave(freq, seconds, d) for d in dets) / voices


def pluck(freq: float, seconds: float, decay: float) -> np.ndarray:
    tt = t_axis(seconds)
    sq = np.sign(np.sin(2 * np.pi * freq * tt)) * 0.6 + saw_wave(freq * 2, seconds) * 0.4
    return sq * env_exp(len(tt), decay)


def riser(seconds: float) -> np.ndarray:
    tt = t_axis(seconds)
    p = tt / seconds
    noise = rng.standard_normal(len(tt))
    lo = band(noise, 400, 2500)
    hi = band(noise, 2500, 12000)
    sweep = np.sin(2 * np.pi * np.cumsum(300 + 1500 * p**2) / SR) * 0.25
    return ((lo * (1 - p) + hi * p) * 0.6 + sweep) * p**2


def crash() -> np.ndarray:
    n = int(2.2 * SR)
    return band(rng.standard_normal(n), 3500, 16000) * env_exp(n, 0.55)


def impact() -> np.ndarray:
    tt = t_axis(1.6)
    freq = 38 + 70 * np.exp(-tt / 0.06)
    boom = np.sin(2 * np.pi * np.cumsum(freq) / SR) * env_exp(len(tt), 0.5)
    return np.tanh(boom * 1.8)


# ------------------------------------------------------------- arrangement
# A minor: Am – F – C – G, one chord per bar (4 beats).
CHORDS = [[57, 60, 64], [53, 57, 60], [48, 55, 60], [55, 59, 62]]
ROOTS = [45, 41, 48, 43]


def chord_at(n: float) -> int:
    return int((n - HOME) // 4) % 4 if n >= HOME else 0


def section_energy(n: float) -> float:
    """0..1 overall intensity, rising through the story."""
    pts = [(INTRO, 0.35), (HOME, 0.6), (45, 0.68), (BREAK_END, 0.55), (SIGNS, 0.75), (CALL, 0.85), (BUILD, 0.9),
           (DROP, 1.0), (CT, 0.85), (DECIDE, 0.9), (FINAL, 1.0), (END, 1.0)]
    xs, ys = zip(*pts)
    return float(np.interp(n, xs, ys))


def silent(t: float) -> bool:
    """The hard cut after the cup impact (until the rebuild)."""
    return CUP <= t < bt(BREAK_END)


def build() -> dict[str, np.ndarray]:
    drums, bass, synths, fx = (np.zeros(N) for _ in range(4))
    total_beats = int((FILM - T0) / BEAT) + 1

    kicks: list[float] = []
    for n in range(total_beats):
        t = bt(n)
        if t >= FILM or silent(t):
            continue
        e = section_energy(n)
        drop_gap = BUILD <= n < DROP and n >= DROP - 2  # two-beat silence before the drop
        # ---------------- kicks
        if n < HOME or (BREAK_END <= n < SIGNS):
            # heartbeat-style "lub-dub" double kick on beats 1 and 3
            if n % 2 == 0:
                place(drums, kick(0.75 * e + 0.25, 0.8), t)
                place(drums, kick(0.45 * e + 0.15, 0.6), t + BEAT * 0.38)
                kicks.append(t)
        elif n < END + 1 and not drop_gap:
            place(drums, kick(0.9 if n < DROP else 1.0), t)
            kicks.append(t)
            if n >= SIGNS and n % 4 == 3:  # heartbeat ghost kick leading into the bar
                place(drums, kick(0.35, 0.6), t + BEAT * 0.75)
        # ---------------- claps on 2 and 4
        if n >= HOME and n % 2 == 1 and not drop_gap and n <= END:
            place(drums, clap(), t, 0.55 if n >= SIGNS else 0.4)
        # ---------------- hats
        if n >= HOME and n <= END and not drop_gap:
            subdiv = 4 if n >= SIGNS else 2
            for k in range(subdiv):
                tk = t + k * BEAT / subdiv
                if silent(tk):
                    continue
                is_off = (k == subdiv // 2)
                place(drums, hat(open_=is_off and n >= DROP), tk, (0.22 if is_off else 0.12) * e)
        # ---------------- bass: 16th pulses on the root (8ths at home)
        if n >= HOME and n <= END and not drop_gap:
            root = ROOTS[chord_at(n)]
            steps = 4 if n >= SIGNS else 2
            for k in range(steps):
                tk = t + k * BEAT / steps
                if k == 0 and n >= SIGNS:
                    continue  # leave the downbeat to the kick
                if silent(tk):
                    continue
                octave = 12 if (n >= DROP and k == 3) else 0
                f = note(root - 12 + octave)
                seg = saw_wave(f, BEAT / steps * 0.95) * 0.7 + np.sin(2 * np.pi * f * t_axis(BEAT / steps * 0.95)) * 0.5
                seg *= env_exp(len(seg), 0.09)
                place(bass, seg, tk, 0.55 + 0.35 * e)
        # ---------------- arp (16ths on chord tones)
        if (n < HOME and n >= 4) or (n >= HOME and n <= END and not drop_gap):
            ch = CHORDS[chord_at(n)]
            pattern = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[1] + 24]
            for k in range(4):
                tk = t + k * BEAT / 4
                if silent(tk):
                    continue
                place(synths, pluck(note(pattern[(n * 4 + k) % 4]), 0.18, 0.06), tk, 0.12 * e)
        # ---------------- supersaw chord stabs from the drop (and call build) onwards
        if (CALL <= n < BUILD or n >= DROP) and n <= END and n % 4 == 0:
            ch = CHORDS[chord_at(n)]
            length = BEAT * 4
            stab = sum(supersaw(note(m + 12), length) for m in ch) / 3
            place(synths, stab * env_exp(len(stab), 1.2), t, 0.28 if n >= DROP else 0.18)
        # ---------------- lead hook in the peak sections
        if (DROP <= n < CT or FINAL <= n <= END) and n % 8 in (0, 1, 3, 6):
            ch = CHORDS[chord_at(n)]
            m = ch[(n // 2) % 3] + 24
            ln = supersaw(note(m), BEAT * 0.9, voices=3, spread=0.006)
            place(synths, ln * env_exp(len(ln), 0.25), t, 0.16)

    # ---------------- snare roll + risers into key moments
    def roll(start_n: int, end_n: int, gain: float) -> None:
        n = start_n
        step = 1.0
        while n < end_n:
            place(drums, clap(), bt(n), gain * (0.4 + 0.6 * (n - start_n) / (end_n - start_n)))
            step = 1.0 if n < end_n - 8 else 0.5 if n < end_n - 4 else 0.25
            n += step

    roll(BUILD, DROP - 2, 0.6)
    roll(BREAK_END + 8, SIGNS, 0.45)
    roll(DECIDE + 8, FINAL, 0.5)
    for start_n, end_n, g in [(HOME - 8, HOME, 0.4), (BREAK_END, SIGNS, 0.5), (BUILD, DROP, 0.8), (DECIDE, FINAL, 0.6)]:
        r = riser(bt(end_n) - bt(start_n))
        place(fx, r, bt(start_n), g)
    # ---------------- crashes and impacts on the big moments
    for n_hit, g in [(HOME, 0.4), (SIGNS, 0.5), (DROP, 0.9), (FINAL, 0.6), (END, 0.8)]:
        place(fx, crash(), bt(n_hit), g)
    place(fx, impact(), bt(DROP), 1.0)
    place(fx, impact(), bt(END), 0.9)

    # ---------------- final: groove stops on TIME IS BRAIN, heartbeat pulse rings out to 120 s
    end_t = bt(END)
    tail = (t_axis(FILM) > end_t + BEAT * 0.5)
    drums[tail] = 0
    bass[tail] = 0
    for k in range(4):
        tk = end_t + BEAT * 2 + k * BEAT * 1.0
        if tk + 0.4 < FILM:
            place(drums, kick(0.35 * (1 - k * 0.2), 0.6), tk)

    # ---------------- sidechain pump on bass + synths (follows every kick)
    tt = t_axis(FILM)
    pump = np.ones(N)
    for kt in kicks:
        i0 = int(kt * SR)
        i1 = min(N, i0 + int(BEAT * SR))
        seg = tt[i0:i1] - kt
        pump[i0:i1] = np.minimum(pump[i0:i1], 1 - 0.65 * np.exp(-seg / 0.09))
    bass = band(bass, 30, 900) * pump
    synths = band(synths, 150, 9000) * pump

    # Enforce the hard cut after the cup impact on every stem.
    cut = (tt >= CUP) & (tt < bt(BREAK_END) - 0.05)
    for s in (drums, bass, synths, fx):
        s[cut] = 0
    return {"drums": drums, "bass": bass, "synths": synths, "fx": fx}


def finalize(x: np.ndarray, reverb_wet: float) -> np.ndarray:
    st = stereo_reverb(x, 1.4, reverb_wet, 7000) if reverb_wet > 0 else np.stack([x, x], axis=1)
    fade = np.ones(len(x))
    fade[-int(0.3 * SR):] = np.linspace(1, 0, int(0.3 * SR))
    return st * fade[:, None]


def main() -> None:
    stems = build()
    print("STROKE CODE score stems (127.2 BPM, 120.0 s):")
    write("../sc/music/drums.mp3", finalize(np.tanh(stems["drums"] * 1.2), 0.08), peak=0.9, kbps=256)
    write("../sc/music/bass.mp3", finalize(stems["bass"], 0.0), peak=0.85, kbps=256)
    write("../sc/music/synths.mp3", finalize(stems["synths"], 0.3), peak=0.8, kbps=256)
    write("../sc/music/fx.mp3", finalize(stems["fx"], 0.25), peak=0.85, kbps=256)


if __name__ == "__main__":
    main()

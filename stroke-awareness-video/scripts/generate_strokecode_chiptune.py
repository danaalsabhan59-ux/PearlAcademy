"""STROKE CODE — 8-bit chiptune score (original, synthesised), matching the pixel-art style.

Usage:  python3 scripts/generate_strokecode_chiptune.py      (needs numpy)

Classic console-style voices: two pulse channels (lead + arpeggios), a stepped
triangle bass and an LFSR-style noise channel for drums. Four stems, each 120 s,
aligned to film time 0:
  public/sc/music/chip-drums.mp3   triangle kicks (incl. heartbeat double kicks), noise snares and hats
  public/sc/music/chip-bass.mp3    stepped-triangle bass
  public/sc/music/chip-lead.mp3    pulse-wave melody hook + fast chord arpeggios
  public/sc/music/chip-fx.mp3      pitch sweeps, noise risers, crashes, drop impact

Same beat grid as the electronic score: 127.2 BPM from 0.397 s, so beat 14 = 7.0 s,
beat 134 = 63.6 s (CODE STROKE ACTIVATED) and beat 249 = 117.84 s (TIME IS BRAIN).
No samples, no vocals.
"""

from __future__ import annotations

import numpy as np

from generate_sfx import SR, env_exp, note, place, t_axis, write

FILM = 120.0
N = int(FILM * SR)
BEAT = 60 / 127.2
T0 = 7.0 - 14 * BEAT
CUP = 21.65  # hard cut 150 ms before the cup hits the floor (21.8 s)

INTRO, HOME, BREAK_END, SIGNS, CALL, BUILD, DROP, CT, DECIDE, FINAL, END = (
    0, 14, 48, 64, 96, 118, 134, 190, 216, 232, 249,
)
E8 = BEAT / 2  # eighth note


def bt(n: float) -> float:
    return T0 + n * BEAT


def silent(t: float) -> bool:
    return CUP <= t < bt(BREAK_END) - 0.02


# ------------------------------------------------------------ chip voices
def pulse(freq: float, seconds: float, duty: float = 0.25, vib: float = 0.0) -> np.ndarray:
    tt = t_axis(seconds)
    f = freq * (1 + vib * np.sin(2 * np.pi * 6 * tt) * np.clip((tt - 0.12) / 0.1, 0, 1))
    phase = np.cumsum(f) / SR % 1.0
    return np.where(phase < duty, 1.0, -1.0)


def triangle(freq: float | np.ndarray, seconds: float) -> np.ndarray:
    """4-bit stepped triangle like the classic console triangle channel."""
    tt = t_axis(seconds)
    f = np.broadcast_to(freq, tt.shape)
    phase = np.cumsum(f) / SR % 1.0
    tri = 1 - 4 * np.abs(phase - 0.5)
    return np.round(tri * 7.5) / 7.5


_lfsr_cache: dict[bool, np.ndarray] = {}


def lfsr_noise(seconds: float, short: bool = False, rate: float = 22000) -> np.ndarray:
    """15-bit LFSR noise (short mode = metallic), resampled to SR."""
    if short not in _lfsr_cache:
        reg = 1
        out = np.empty(32767, dtype=np.float64)
        for i in range(32767):
            bit = (reg ^ (reg >> (6 if short else 1))) & 1
            reg = (reg >> 1) | (bit << 14)
            out[i] = 1.0 if reg & 1 else -1.0
        _lfsr_cache[short] = out
    seq = _lfsr_cache[short]
    idx = (np.arange(int(seconds * SR)) * rate / SR).astype(int) % len(seq)
    return seq[idx]


def env(n: int, attack: float, decay: float, sustain: float = 0.0) -> np.ndarray:
    e = np.exp(-np.arange(n) / SR / decay) * (1 - sustain) + sustain
    a = int(attack * SR)
    if a:
        e[:a] *= np.linspace(0, 1, a)
    r = min(n, int(0.01 * SR))
    e[-r:] *= np.linspace(1, 0, r)
    return e


def chip_kick(gain: float = 1.0) -> np.ndarray:
    tt = t_axis(0.2)
    freq = 45 + 180 * np.exp(-tt / 0.025)
    k = triangle(freq, 0.2) * env_exp(len(tt), 0.08)
    k[: int(0.008 * SR)] += lfsr_noise(0.008) * 0.5
    return k * gain


def chip_snare() -> np.ndarray:
    n = int(0.14 * SR)
    return lfsr_noise(0.14, rate=14000) * env_exp(n, 0.045) + triangle(220, 0.14) * env_exp(n, 0.02) * 0.4


def chip_hat(open_: bool = False) -> np.ndarray:
    s = 0.12 if open_ else 0.035
    return lfsr_noise(s, short=True, rate=40000) * env_exp(int(s * SR), 0.04 if open_ else 0.01)


def chip_crash() -> np.ndarray:
    return lfsr_noise(1.6, rate=30000) * env_exp(int(1.6 * SR), 0.4)


def chip_impact() -> np.ndarray:
    tt = t_axis(1.0)
    freq = 30 + 220 * np.exp(-tt / 0.08)
    return triangle(freq, 1.0) * env_exp(len(tt), 0.35)


def sweep_up(seconds: float) -> np.ndarray:
    """Classic rising pitch sweep + noise roll."""
    tt = t_axis(seconds)
    p = tt / seconds
    freq = 200 * 2 ** (p * 4)
    phase = np.cumsum(freq) / SR % 1.0
    sq = np.where(phase < 0.5, 1.0, -1.0)
    return (sq * 0.35 + lfsr_noise(seconds, rate=8000 + 26000 * 0) * 0.25 * p) * p**1.5


# --------------------------------------------------------------- the music
# A minor: Am – F – C – G, one chord per bar.
CHORDS = [[57, 60, 64], [53, 57, 60], [48, 55, 60], [55, 59, 62]]
ROOTS = [45, 41, 48, 43]

# Hook: 4 bars of eighth notes. Numbers are MIDI notes, "-" holds, "." rests.
HOOK = (
    "76 . 81 . 84 83 81 79 "
    "81 - 77 . 81 84 - 81 "
    "79 . 76 . 79 84 83 79 "
    "86 - 83 . 79 . 83 86"
).split()
# Answer phrase (second half of the 8-bar melody).
ANSWER = (
    "84 - 83 81 79 - 76 . "
    "77 . 81 . 84 - 81 . "
    "79 - 84 - 88 - 86 84 "
    "83 - 79 . 83 - 86 -"
).split()
MELODY = HOOK + ANSWER  # 64 eighths = 8 bars


def chord_at(n: float) -> int:
    return int((n - HOME) // 4) % 4 if n >= HOME else 0


def energy(n: float) -> float:
    pts = [(INTRO, 0.4), (HOME, 0.6), (45, 0.7), (BREAK_END, 0.55), (SIGNS, 0.78), (CALL, 0.88), (BUILD, 0.92),
           (DROP, 1.0), (CT, 0.85), (DECIDE, 0.9), (FINAL, 1.0), (END, 1.0)]
    xs, ys = zip(*pts)
    return float(np.interp(n, xs, ys))


def build() -> dict[str, np.ndarray]:
    drums, bass, lead, fx = (np.zeros(N) for _ in range(4))
    total_beats = int((FILM - T0) / BEAT) + 1

    for n in range(total_beats):
        t = bt(n)
        if t >= FILM or n > END:
            continue
        e = energy(n)
        pre_drop = DROP - 2 <= n < DROP  # two-beat gap before the drop
        if pre_drop:
            continue
        if silent(t):
            continue

        # ---------------- drums
        if n < HOME or BREAK_END <= n < SIGNS:
            if n % 2 == 0:  # heartbeat double kick
                place(drums, chip_kick(0.9), t)
                place(drums, chip_kick(0.55), t + BEAT * 0.36)
        else:
            four_floor = n >= SIGNS
            if four_floor or n % 2 == 0:
                place(drums, chip_kick(1.0), t)
            if n % 2 == 1:
                place(drums, chip_snare(), t, 0.7)
            hats = 4 if n >= DROP else 2
            for k in range(hats):
                tk = t + k * BEAT / hats
                if not silent(tk):
                    place(drums, chip_hat(open_=(k == hats // 2 and n >= CALL)), tk, 0.35 if k == hats // 2 else 0.22)

        # ---------------- bass: octave-jumping 8ths on the triangle
        if n >= HOME:
            root = ROOTS[chord_at(n)]
            for k in range(2):
                tk = t + k * E8
                if silent(tk):
                    continue
                m = root - 12 + (12 if (k == 1 and n >= SIGNS) else 0)
                seg = triangle(note(m), E8 * 0.9)
                place(bass, seg * env(len(seg), 0.002, 0.25, 0.6), tk, 0.9)
        elif n >= 4:
            if n % 2 == 0:  # intro: slow pulse on A
                seg = triangle(note(33), BEAT * 1.8)
                place(bass, seg * env(len(seg), 0.01, 0.6, 0.3), t, 0.6)

        # ---------------- arpeggios: fast chord arps (32nds) on pulse 2
        if (n >= 6 and n < HOME) or (n >= HOME):
            ch = CHORDS[chord_at(n)]
            steps = 8 if n >= SIGNS else 4
            tones = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[1] + 24]
            for k in range(steps):
                tk = t + k * BEAT / steps
                if silent(tk):
                    continue
                seg = pulse(note(tones[k % 4]), BEAT / steps * 0.9, duty=0.125)
                place(lead, seg * env(len(seg), 0.001, 0.05), tk, (0.07 + 0.05 * e))

        # ---------------- lead melody on pulse 1 (from the home groove; strongest at the drop/final)
        melody_on = (HOME <= n < 45) or (SIGNS <= n < BUILD) or (DROP <= n < CT) or (FINAL <= n <= END) or (DECIDE <= n < FINAL and n % 8 < 4)
        if melody_on:
            base_n = HOME if n < 45 else SIGNS if n < BUILD else DROP if n < CT else DECIDE if n < FINAL else FINAL
            for k in range(2):
                idx = ((n - base_n) * 2 + k) % len(MELODY)
                tok = MELODY[idx]
                if tok in ("-", "."):
                    continue
                length = 1
                while MELODY[(idx + length) % len(MELODY)] == "-" and length < 4:
                    length += 1
                tk = t + k * E8
                if silent(tk):
                    continue
                m = int(tok) + (0 if n >= SIGNS else -12)
                dur = E8 * length * 0.92
                duty = 0.25 if n >= DROP else 0.5
                seg = pulse(note(m), dur, duty=duty, vib=0.006)
                g = 0.2 if n >= DROP else 0.15 if n >= SIGNS else 0.11
                place(lead, seg * env(len(seg), 0.003, 0.35, 0.55), tk, g)
                if n >= DROP:  # echo one eighth later, quieter: classic chip delay
                    place(lead, seg * env(len(seg), 0.003, 0.35, 0.55), tk + E8 * 1.5, g * 0.35)

    # ---------------- builds, crashes, impacts
    def roll(start_n: int, end_n: int, gain: float) -> None:
        n = float(start_n)
        while n < end_n:
            p = (n - start_n) / (end_n - start_n)
            place(drums, chip_snare(), bt(n), gain * (0.4 + 0.6 * p))
            n += 1.0 if n < end_n - 8 else 0.5 if n < end_n - 4 else 0.25

    roll(BUILD, DROP - 2, 0.8)
    roll(BREAK_END + 8, SIGNS, 0.55)
    roll(DECIDE + 8, FINAL, 0.6)
    for s_n, e_n, g in [(HOME - 4, HOME, 0.4), (BREAK_END + 8, SIGNS, 0.45), (BUILD, DROP - 2, 0.7), (DECIDE + 8, FINAL, 0.5)]:
        place(fx, sweep_up(bt(e_n) - bt(s_n)), bt(s_n), g)
    for n_hit, g in [(HOME, 0.35), (SIGNS, 0.45), (DROP, 0.8), (FINAL, 0.55), (END, 0.75)]:
        place(fx, chip_crash(), bt(n_hit), g)
    place(fx, chip_impact(), bt(DROP), 1.0)
    place(fx, chip_impact(), bt(END), 0.9)

    # Final: big chord stab on TIME IS BRAIN, then a heartbeat that fades to 120 s.
    end_t = bt(END)
    tt = t_axis(FILM)
    after = tt > end_t + BEAT * 0.5
    for s in (drums, bass):
        s[after] = 0
    lead[after] *= np.exp(-(tt[after] - end_t) / 0.6)
    for m in (69, 72, 76, 81):
        seg = pulse(note(m), 1.6, duty=0.25)
        place(lead, seg * env(len(seg), 0.002, 0.6), end_t, 0.09)
    for k in range(3):
        tk = end_t + BEAT * 2 + k * BEAT * 1.4
        place(drums, chip_kick(0.5 * (1 - 0.25 * k)), tk)
        place(drums, chip_kick(0.3 * (1 - 0.25 * k)), tk + BEAT * 0.36)

    cut = (tt >= CUP) & (tt < bt(BREAK_END) - 0.02)
    for s in (drums, bass, lead, fx):
        s[cut] = 0
    return {"drums": drums, "bass": bass, "lead": lead, "fx": fx}


def stereo(x: np.ndarray, width: float) -> np.ndarray:
    """Tiny Haas-style widening (chip music is dry)."""
    d = int(0.012 * SR)
    right = np.concatenate([np.zeros(d), x[:-d]])
    st = np.stack([x, x * (1 - width) + right * width], axis=1)
    fade = np.ones(len(x))
    fade[-int(0.3 * SR):] = np.linspace(1, 0, int(0.3 * SR))
    return st * fade[:, None]


def main() -> None:
    s = build()
    print("STROKE CODE chiptune stems (127.2 BPM, 120.0 s):")
    write("../sc/music/chip-drums.mp3", stereo(s["drums"], 0.0), peak=0.9, kbps=256)
    write("../sc/music/chip-bass.mp3", stereo(s["bass"], 0.0), peak=0.85, kbps=256)
    write("../sc/music/chip-lead.mp3", stereo(s["lead"], 0.5), peak=0.8, kbps=256)
    write("../sc/music/chip-fx.mp3", stereo(s["fx"], 0.3), peak=0.85, kbps=256)


if __name__ == "__main__":
    main()

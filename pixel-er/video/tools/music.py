#!/usr/bin/env python3
"""Original 8-bit soundtrack + sound effects for the PIXEL ER promo (65 s).
Everything is synthesised here, so there are no licensing questions.
    python3 video/tools/music.py   → video/out/music.wav
Scene times match SCENES in promo.html."""
import pathlib
import wave
import numpy as np

SR, DUR = 44100, 65.0
N = int(SR * DUR)
mix = np.zeros((N, 2), dtype=np.float64)
BPM = 128
BEAT = 60 / BPM


def note_hz(n):  # MIDI → Hz
    return 440.0 * 2 ** ((n - 69) / 12)


def env(n, a=0.005, r=0.08):
    e = np.ones(n)
    na, nr = int(SR * a), int(SR * r)
    if na: e[:na] = np.linspace(0, 1, na)
    if nr and nr < n: e[-nr:] *= np.linspace(1, 0, nr)
    return e


def osc(kind, hz, dur, duty=0.5):
    t = np.arange(int(SR * dur)) / SR
    ph = (t * hz) % 1.0
    if kind == 'square': return np.where(ph < duty, 1.0, -1.0)
    if kind == 'tri': return 4 * np.abs(ph - 0.5) - 1
    if kind == 'saw': return 2 * ph - 1
    if kind == 'sine': return np.sin(2 * np.pi * hz * t)
    raise ValueError(kind)


def add(sig, start, vol=0.2, pan=0.0):
    i = int(start * SR)
    if i >= N: return
    sig = sig[: N - i]
    mix[i:i + len(sig), 0] += sig * vol * (1 - max(0, pan))
    mix[i:i + len(sig), 1] += sig * vol * (1 + min(0, pan))


def tone(kind, midi, start, dur, vol, duty=0.5, pan=0.0, a=0.004, r=0.06):
    s = osc(kind, note_hz(midi), dur, duty)
    add(s * env(len(s), a, r), start, vol, pan)


rng = np.random.default_rng(7)


def noise(start, dur, vol, decay=30.0, hp=False):
    n = int(SR * dur)
    s = rng.uniform(-1, 1, n)
    if hp: s = np.diff(np.concatenate([[0], s]))
    s *= np.exp(-np.arange(n) / SR * decay)
    add(s, start, vol)


def kick(start, vol=0.55):
    n = int(SR * 0.18); t = np.arange(n) / SR
    f = 120 * np.exp(-t * 28) + 42
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 18)
    add(s, start, vol)


# ---------------------------------------------------------------- harmony
# i – VI – III – VII in A minor (Am F C G), two bars each
CHORDS = [(57, [57, 60, 64]), (53, [53, 57, 60]), (48, [55, 60, 64]), (55, [55, 59, 62])]
LEAD_A = [76, 74, 72, 74, 76, 76, 79, 76,  77, 76, 74, 72, 74, 72, 69, 67,
          72, 74, 76, 79, 76, 74, 72, 74,  71, 72, 74, 71, 67, 69, 71, 74]
LEAD_B = [81, 79, 76, 79, 81, 84, 81, 79,  77, 79, 81, 77, 76, 74, 72, 74,
          76, 79, 84, 83, 81, 79, 76, 79,  74, 76, 79, 81, 83, 81, 79, 83]


def groove(t0, t1, energy=1.0, lead=LEAD_A, drums=True):
    """Chiptune loop between t0 and t1 (seconds)."""
    bar = 4 * BEAT
    t, k = t0, 0
    while t < t1 - 0.01:
        root, chord = CHORDS[(k // 2) % 4]
        for b in range(8):                       # bass: octave 8ths
            st = t + b * BEAT / 2
            if st >= t1: break
            tone('tri', root - 12 + (12 if b % 2 else 0), st, BEAT / 2 * 0.9, 0.22 * energy)
        for b in range(8):                       # arpeggio
            st = t + b * BEAT / 2
            if st >= t1: break
            tone('square', chord[b % 3] + 12, st, BEAT / 4, 0.045 * energy, duty=0.25, pan=0.35)
        for b in range(8):                       # lead
            st = t + b * BEAT / 2
            if st >= t1: break
            tone('square', lead[(k % 4) * 8 + b], st, BEAT / 2 * 0.85, 0.075 * energy, duty=0.5, pan=-0.2)
        if drums:
            for b in range(4):
                st = t + b * BEAT
                if st >= t1: break
                kick(st, 0.5 * energy)
                if b % 2 == 1: noise(st, 0.12, 0.12 * energy, 22)              # snare
                noise(st + BEAT / 2, 0.04, 0.05 * energy, 80, hp=True)         # hat
        t += bar; k += 1


# ---------------------------------------------------------------- scenes
# 0–6  night campus: soft pad + twinkles + passing siren
for i, (root, chord) in enumerate(CHORDS[:3]):
    for n in chord:
        tone('tri', n, i * 2.0, 2.2, 0.05, a=0.6, r=0.8)
for i in range(10):
    tone('sine', 84 + (i * 5) % 12, 0.3 + i * 0.55, 0.25, 0.04, pan=(i % 3 - 1) * 0.6)
t = 1.4
while t < 5.4:                                    # two-tone siren, rising then fading (Doppler-ish)
    k = (t - 1.4) / 4.0
    vol = 0.13 * np.sin(np.pi * k) + 0.02
    pitch_shift = 1.0 if k < 0.55 else 0.94
    for hz in (960, 770):
        s = osc('square', hz * pitch_shift, 0.25, 0.5) * env(int(SR * 0.25), 0.01, 0.03)
        add(s, t, vol, pan=-0.8 + 1.6 * k); t += 0.25

# 6–9.2  zoom: riser + flash + heartbeat
n = int(SR * 1.2); tt = np.arange(n) / SR
riser = rng.uniform(-1, 1, n) * np.linspace(0, 1, n) ** 2
add(riser, 6.0, 0.18)
add(np.sin(2 * np.pi * np.cumsum(200 + 1200 * (tt / 1.2) ** 2) / SR) * np.linspace(0, 1, n), 6.0, 0.08)
noise(7.2, 0.5, 0.3, 8)                           # flash
for bt in (7.5, 7.75, 8.4, 8.65):                 # lub-dub
    kick(bt, 0.6)

# 9.2–13  title: letters + fanfare
for i in range(8):
    tone('square', 72 + [0, 4, 7, 12, 7, 12, 16, 19][i], 9.3 + i * 0.08, 0.12, 0.07, duty=0.25)
for n_ in (69, 72, 76, 81):
    tone('square', n_, 10.3, 1.4, 0.05, duty=0.5, r=0.5)
tone('tri', 45, 10.3, 1.6, 0.25, r=0.6)
kick(10.3, 0.7); noise(10.3, 0.6, 0.15, 6)

# 13–37  main groove (ER), alarm drama at 32–35, relief at 35.5
groove(11.8, 31.9, energy=0.9)
groove(35.1, 37.0, energy=0.9)
for k in range(int((37 - 13) * 98 / 60)):          # monitor beeps at HR ≈ 98
    st = 13 + k * 60 / 98
    if 31.9 < st < 35.0: continue
    tone('sine', 93, st, 0.06, 0.035)
t = 32.0
while t < 35.0:                                    # alarm
    tone('square', 81, t, 0.18, 0.09, duty=0.5); tone('square', 76, t + 0.2, 0.18, 0.09, duty=0.5); t += 0.45
kick(32.0, 0.8); noise(32.0, 0.4, 0.25, 10)
for i, n_ in enumerate((72, 76, 79, 84)):          # relief arpeggio
    tone('square', n_, 35.6 + i * 0.09, 0.2, 0.07, duty=0.25)

# 37–42.5  clock: ticking over a lighter groove
groove(37.0, 42.5, energy=0.7, drums=False)
for k in range(int((41.0 - 37.6) / 0.12)):
    tone('square', 96, 37.6 + k * 0.12, 0.02, 0.04, duty=0.25)
for k in range(6):
    tone('square', 88, 40.9 + k * 0.25, 0.1, 0.07)

# 42.5–48  score: count-up blips, coin, success
for k in range(28):
    tone('square', 72 + k % 12, 43.0 + k * 0.053, 0.03, 0.035, duty=0.25)
tone('square', 83, 44.5, 0.08, 0.1, duty=0.5); tone('square', 88, 44.58, 0.35, 0.1, duty=0.5, r=0.25)   # coin
for i, n_ in enumerate((72, 76, 79, 84, 79, 84)):
    tone('square', n_, 45.2 + i * 0.12, 0.14, 0.06, duty=0.25)
groove(45.2, 48.0, energy=0.6, drums=False)

# 48–60  competition + how to: full energy, B melody
groove(48.0, 60.0, energy=1.0, lead=LEAD_B)

# 60–65  end card: big final chord and fade
for n_ in (57, 64, 69, 72, 76):
    tone('square', n_, 60.0, 3.2, 0.045, duty=0.5, r=1.6)
tone('tri', 33, 60.0, 3.4, 0.3, r=1.6)
kick(60.0, 0.8); noise(60.0, 1.2, 0.18, 4)
for i, n_ in enumerate((81, 84, 88, 93)):
    tone('square', n_, 61.2 + i * 0.1, 0.15, 0.04, duty=0.25)

# ---------------------------------------------------------------- master
fade = np.ones(N); fn = int(SR * 1.2); fade[-fn:] = np.linspace(1, 0, fn)
mix *= fade[:, None]
peak = np.max(np.abs(mix))
mix = np.tanh(mix / peak * 1.25) * 0.89                      # gentle limiter
out = pathlib.Path(__file__).resolve().parent.parent / 'out' / 'music.wav'
out.parent.mkdir(exist_ok=True)
with wave.open(str(out), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print(out, f'{DUR:.0f}s')

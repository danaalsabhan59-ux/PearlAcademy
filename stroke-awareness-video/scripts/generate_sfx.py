"""Synthesise all sound effects and music from scratch with numpy.

Everything here is generated procedurally (noise, oscillators, envelopes), so the
output is original work with no third-party samples and no licensing issues.

Usage:  python3 scripts/generate_sfx.py      (needs: pip install numpy)

Writes public/audio/sfx/*.mp3 and public/audio/music/*.mp3
"""

from __future__ import annotations

import sys
import tempfile
import wave
from pathlib import Path

import numpy as np

from audio_common import PUBLIC, ffmpeg

SR = 48_000
rng = np.random.default_rng(997)


# ---------------------------------------------------------------- helpers
def t_axis(seconds: float) -> np.ndarray:
    return np.arange(int(seconds * SR)) / SR


def band(x: np.ndarray, lo: float | None = None, hi: float | None = None, slope: float = 0.15) -> np.ndarray:
    """Zero-phase band-pass in the frequency domain with soft (log) edges."""
    spec = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR) + 1e-9
    gain = np.ones_like(f)
    if lo:
        gain *= 1 / (1 + (lo / f) ** (1 / slope * 0.5))
    if hi:
        gain *= 1 / (1 + (f / hi) ** (1 / slope * 0.5))
    return np.fft.irfft(spec * gain, n=len(x))


def pink(n: int) -> np.ndarray:
    spec = np.fft.rfft(rng.standard_normal(n))
    f = np.fft.rfftfreq(n, 1 / SR)
    f[0] = f[1]
    out = np.fft.irfft(spec / np.sqrt(f), n=n)
    return out / np.abs(out).max()


def env_exp(n: int, decay: float) -> np.ndarray:
    return np.exp(-np.arange(n) / SR / decay)


def adsr(n: int, a: float, r: float) -> np.ndarray:
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    if na:
        e[:na] = np.linspace(0, 1, na) ** 2
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr) ** 2
    return e


def place(dst: np.ndarray, src: np.ndarray, at: float, gain: float = 1.0) -> None:
    i = int(at * SR)
    if i < 0:
        src, i = src[-i:], 0
    if i >= len(dst):
        return
    j = min(len(dst), i + len(src))
    dst[i:j] += src[: j - i] * gain


def convolve(x: np.ndarray, ir: np.ndarray) -> np.ndarray:
    n = len(x) + len(ir) - 1
    size = 1 << (n - 1).bit_length()
    y = np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size), size)[:n]
    return y[: len(x)]


def reverb_ir(seconds: float, damp_hz: float = 5000) -> np.ndarray:
    n = int(seconds * SR)
    ir = band(rng.standard_normal(n), hi=damp_hz) * env_exp(n, seconds / 6.5)
    return ir / np.sqrt(np.sum(ir**2))


def reverb(x: np.ndarray, seconds: float, wet: float, damp_hz: float = 5000) -> np.ndarray:
    return x * (1 - wet) + convolve(x, reverb_ir(seconds, damp_hz)) * wet


def stereo_reverb(x: np.ndarray, seconds: float, wet: float, damp_hz: float = 5000) -> np.ndarray:
    left = x * (1 - wet) + convolve(x, reverb_ir(seconds, damp_hz)) * wet
    right = x * (1 - wet) + convolve(x, reverb_ir(seconds, damp_hz)) * wet
    return np.stack([left, right], axis=1)


def loop_seam(x: np.ndarray, fade: float) -> np.ndarray:
    """Cross-fade the tail into the head so the clip loops without a click."""
    n = int(fade * SR)
    ramp = np.linspace(0, 1, n)
    if x.ndim == 2:
        ramp = ramp[:, None]
    out = x[:-n].copy()
    out[:n] = x[:n] * ramp + x[-n:] * (1 - ramp)
    return out


def write(name: str, x: np.ndarray, peak: float = 0.89, kbps: int = 192) -> None:
    x = x / (np.abs(x).max() + 1e-9) * peak
    if x.ndim == 1:
        x = np.stack([x, x], axis=1)
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2")
    out = PUBLIC / "audio" / name
    out.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        with wave.open(tmp.name, "wb") as w:
            w.setnchannels(2)
            w.setsampwidth(2)
            w.setframerate(SR)
            w.writeframes(pcm.tobytes())
        res = ffmpeg("-i", tmp.name, "-c:a", "libmp3lame", "-b:a", f"{kbps}k", str(out))
    Path(tmp.name).unlink()
    if res.returncode != 0:
        sys.exit(f"ffmpeg failed for {name}: {res.stderr[-300:]}")
    print(f"  ✓ {name:<28} {len(x) / SR:6.2f}s")


def note(midi: float) -> float:
    return 440.0 * 2 ** ((midi - 69) / 12)


def saw(freq: float | np.ndarray, t: np.ndarray, harmonics: int = 24) -> np.ndarray:
    phase = 2 * np.pi * (np.cumsum(np.broadcast_to(freq, t.shape)) / SR)
    return sum(np.sin(k * phase) / k for k in range(1, harmonics + 1))


# ------------------------------------------------------------- sound effects
def crowd_loop() -> np.ndarray:
    """Stadium ambience on TV: crowd roar, murmurs, chants, claps, a whistle."""
    seconds = 24.0
    t = t_axis(seconds + 2)
    n = len(t)
    roar = band(pink(n), 250, 2600)
    swell = 0.75 + 0.15 * np.sin(2 * np.pi * 0.11 * t) + 0.1 * np.sin(2 * np.pi * 0.27 * t + 1)
    out = roar * swell
    # Vowel-ish murmurs: band-limited noise bursts at speech-like formants.
    for _ in range(140):
        dur = rng.uniform(0.25, 0.8)
        f0 = rng.choice([500, 700, 900, 1200])
        burst = band(rng.standard_normal(int(dur * SR)), f0 * 0.8, f0 * 1.3) * adsr(int(dur * SR), 0.08, 0.2)
        place(out, burst, rng.uniform(0, seconds), 0.25)
    # Rhythmic chant claps (clap-clap-clap) on top.
    clap = band(rng.standard_normal(int(0.05 * SR)), 900, 5000) * env_exp(int(0.05 * SR), 0.012)
    for bar_start in (3.0, 11.0, 18.5):
        for k, dt in enumerate([0, 0.33, 0.66, 1.33, 1.66, 2.0, 2.33]):
            for _ in range(25):  # many people, slightly out of sync
                place(out, clap, bar_start + dt + rng.normal(0, 0.018), 0.05)
    # Distant referee whistle (pea whistle = tone with fast trill).
    wt = t_axis(0.9)
    trill = 1 + 0.03 * np.sin(2 * np.pi * 28 * wt)
    whistle = np.sin(2 * np.pi * np.cumsum(2900 * trill) / SR) * adsr(len(wt), 0.02, 0.15)
    place(out, whistle, 7.2, 0.12)
    out = reverb(out, 1.6, 0.35)
    return loop_seam(out, 2.0)


def goal_cheer() -> np.ndarray:
    t = t_axis(6.0)
    n = len(t)
    shape = np.interp(t, [0, 0.4, 1.0, 2.8, 6.0], [0.15, 0.6, 1.0, 0.7, 0.0]) ** 1.3
    roar = band(pink(n), 300, 4200) * shape
    bright = band(rng.standard_normal(n), 1500, 6000) * shape * 0.25
    out = roar + bright
    # A few stadium air-horns.
    for at in (0.9, 1.6):
        ht = t_axis(0.7)
        horn = band(saw(np.full(len(ht), 233.0), ht), 200, 2500) * adsr(len(ht), 0.03, 0.2)
        place(out, horn, at, 0.18)
    return reverb(out, 1.8, 0.35)


def cup_crash() -> np.ndarray:
    """Small ceramic coffee cup (finjan) hitting a tiled floor and breaking."""
    out = np.zeros(int(2.2 * SR))
    # Impact: thump + broadband crack.
    it = t_axis(0.12)
    thump = np.sin(2 * np.pi * (140 - 60 * it / 0.12) * it) * env_exp(len(it), 0.03)
    crack = band(rng.standard_normal(int(0.03 * SR)), 1500, 12000) * env_exp(int(0.03 * SR), 0.006)
    place(out, thump, 0.0, 0.6)
    place(out, crack, 0.0, 1.0)

    def shard(gain: float, base: float) -> np.ndarray:
        st = t_axis(0.6)
        ratios = [1.0, 1.59, 2.14, 2.83, 3.71]
        s = sum(
            np.sin(2 * np.pi * base * r * rng.uniform(0.97, 1.03) * st + rng.uniform(0, 6))
            * env_exp(len(st), rng.uniform(0.04, 0.18) / r**0.5)
            for r in ratios
        )
        return s * gain

    place(out, shard(0.35, 2100), 0.0)
    place(out, shard(0.25, 2650), 0.004)
    # Shards bouncing and skittering across the floor.
    for at in sorted(rng.uniform(0.08, 0.9, 16)):
        place(out, shard(rng.uniform(0.05, 0.14) * (1.1 - at), rng.uniform(2800, 6200)), at)
        tick = band(rng.standard_normal(int(0.01 * SR)), 3000, 12000) * env_exp(int(0.01 * SR), 0.002)
        place(out, tick, at, 0.25 * (1.1 - at))
    # Coffee splash.
    st = t_axis(0.5)
    splash = band(rng.standard_normal(len(st)), 400, 3500) * adsr(len(st), 0.01, 0.35) * env_exp(len(st), 0.15)
    place(out, splash, 0.02, 0.35)
    return reverb(out, 0.7, 0.18, 7000)


def heartbeat_loop() -> np.ndarray:
    bpm = 84
    beat = 60 / bpm
    beats = 12
    out = np.zeros(int(beat * beats * SR))

    def thump(f_start: float, f_end: float, decay: float) -> np.ndarray:
        tt = t_axis(0.25)
        freq = f_end + (f_start - f_end) * np.exp(-tt / 0.03)
        body = np.sin(2 * np.pi * np.cumsum(freq) / SR) * env_exp(len(tt), decay)
        thud = band(rng.standard_normal(len(tt)), 30, 220) * env_exp(len(tt), decay * 0.6) * 0.4
        return body + thud

    lub, dub = thump(95, 45, 0.07), thump(110, 55, 0.05)
    for k in range(beats):
        place(out, lub, k * beat, 1.0)
        place(out, dub, k * beat + 0.27, 0.7)
    out = band(out, 25, 600)
    return reverb(out, 0.5, 0.12, 1200)


def phone_call() -> np.ndarray:
    """Dial 9-9-7, ringback twice, then the call is picked up."""
    out = np.zeros(int(6.6 * SR))
    dtmf = {"9": (852, 1477), "7": (852, 1209)}
    for i, digit in enumerate("997"):
        tt = t_axis(0.16)
        lo, hi = dtmf[digit]
        tone = (np.sin(2 * np.pi * lo * tt) + np.sin(2 * np.pi * hi * tt)) * adsr(len(tt), 0.005, 0.01)
        place(out, tone, 0.15 + i * 0.28, 0.5)
    for at in (1.4, 3.6):  # ringback: 425 Hz, the standard tone in Saudi Arabia
        tt = t_axis(1.2)
        tone = np.sin(2 * np.pi * 425 * tt) * adsr(len(tt), 0.01, 0.02)
        place(out, tone, at, 0.45)
    # Pick-up click + faint line hiss afterwards.
    click = band(rng.standard_normal(int(0.02 * SR)), 300, 3400) * env_exp(int(0.02 * SR), 0.004)
    place(out, click, 5.7, 1.0)
    hiss = band(rng.standard_normal(int(0.9 * SR)), 300, 3400) * 0.02
    place(out, hiss, 5.72)
    return band(out, 300, 3400)  # telephone band


def siren() -> np.ndarray:
    """Ambulance 'wail' approaching from far away (volume + brightness rise)."""
    seconds = 13.0
    t = t_axis(seconds)
    sweep = 0.5 - 0.5 * np.cos(2 * np.pi * t / 2.6)  # smooth up / down
    freq = 650 + 850 * sweep
    tone = sum(
        np.sin(k * 2 * np.pi * np.cumsum(freq) / SR) / k**1.4 for k in (1, 2, 3, 5)
    )
    approach = np.interp(t, [0, 9.0, seconds], [0.06, 1.0, 1.0]) ** 1.6
    far = band(tone, 300, 1400)
    near = band(tone, 300, 6000)
    mix = far * (1 - approach) + near * approach
    return reverb(mix * approach, 2.2, 0.35)


# --------------------------------------------------------------------- music
CHORDS = [  # D minor: Dm – Bb – F – C (i – VI – III – VII), 4 s per chord
    [50, 57, 62, 65, 69],
    [46, 53, 58, 62, 65],
    [41, 53, 57, 60, 65],
    [48, 55, 60, 64, 67],
]
BAR = 4.0
MUSIC_SECONDS = 200.0


def pad_voice(freq: float, seconds: float) -> np.ndarray:
    tt = t_axis(seconds)
    v = sum(saw(freq * d, tt, 18) for d in (0.996, 1.0, 1.004)) / 3
    return v * adsr(len(tt), 1.4, 1.6)


def calm_pad() -> np.ndarray:
    n = int(MUSIC_SECONDS * SR)
    pad = np.zeros(n)
    sub = np.zeros(n)
    keys = np.zeros(n)
    bars = int(MUSIC_SECONDS / BAR)
    for b in range(bars):
        chord = CHORDS[b % 4]
        start = b * BAR
        for m in chord[1:]:
            place(pad, pad_voice(note(m), BAR + 1.6), start - 0.4, 0.18)
        st = t_axis(BAR + 1)
        place(sub, np.sin(2 * np.pi * note(chord[0] - 12) * st) * adsr(len(st), 0.8, 1.2), start, 0.35)
        # Soft felt-piano arpeggio, sparse and slightly humanised.
        for k, m in enumerate([chord[2], chord[3], chord[4], chord[3]]):
            if rng.random() < 0.25:
                continue
            kt = t_axis(2.2)
            f = note(m + 12)
            tone = (np.sin(2 * np.pi * f * kt) + 0.35 * np.sin(4 * np.pi * f * kt) + 0.1 * np.sin(6 * np.pi * f * kt))
            place(keys, tone * env_exp(len(kt), 0.6) * adsr(len(kt), 0.004, 0.3), start + k * 1.0 + rng.normal(0, 0.015), 0.09)
    pad = band(pad, 80, 1800)
    mono = pad + sub + keys
    out = stereo_reverb(mono, 3.5, 0.45, 4500)
    fade = adsr(n, 3.0, 4.0)[:, None]
    return out * fade


def tension() -> np.ndarray:
    n = int(MUSIC_SECONDS * SR)
    t = t_axis(MUSIC_SECONDS)
    # Low drone on D with slow beating.
    drone = band(saw(note(38), t, 30) + saw(note(38) * 1.003, t, 30) + 0.6 * saw(note(26), t, 12), 30, 500)
    drone *= 0.8 + 0.2 * np.sin(2 * np.pi * 0.07 * t)
    # Pulsing eighth-note ostinato (120 bpm feel).
    pulse = np.zeros(n)
    for k in range(int(MUSIC_SECONDS / 0.25)):
        pt = t_axis(0.22)
        m = 50 if k % 8 not in (3, 7) else 51  # D with a tense Eb step
        hit = band(saw(note(m), pt, 20), 60, 1400) * env_exp(len(pt), 0.07)
        place(pulse, hit, k * 0.25, 0.9 if k % 2 == 0 else 0.55)
    # Low timpani-like hit every bar.
    hits = np.zeros(n)
    for b in range(int(MUSIC_SECONDS / BAR)):
        ht = t_axis(1.2)
        freq = 55 + 30 * np.exp(-ht / 0.05)
        boom = np.sin(2 * np.pi * np.cumsum(freq) / SR) * env_exp(len(ht), 0.35)
        place(hits, boom, b * BAR, 1.0)
        place(hits, boom, b * BAR + 2.5, 0.5)
    # String-like cluster that swells over each 8 s phrase.
    strings = np.zeros(n)
    for ph in range(int(MUSIC_SECONDS / (2 * BAR))):
        for m in (62, 63, 69, 74):
            v = pad_voice(note(m), 2 * BAR + 0.5) * np.linspace(0.2, 1.0, int((2 * BAR + 0.5) * SR)) ** 2
            place(strings, v, ph * 2 * BAR, 0.12)
    strings = band(strings, 200, 3500)
    mono = 0.5 * drone + 0.45 * pulse + 0.7 * hits + strings
    out = stereo_reverb(mono, 3.0, 0.4, 4000)
    return out * adsr(n, 2.0, 4.0)[:, None]


def main() -> None:
    print("Sound effects:")
    write("sfx/crowd-loop.mp3", crowd_loop())
    write("sfx/goal-cheer.mp3", goal_cheer())
    write("sfx/cup-crash.mp3", cup_crash())
    write("sfx/heartbeat-loop.mp3", heartbeat_loop())
    write("sfx/phone-call.mp3", phone_call())
    write("sfx/siren.mp3", siren())
    print("Music:")
    write("music/calm-pad.mp3", calm_pad(), kbps=160)
    write("music/tension.mp3", tension(), kbps=160)


if __name__ == "__main__":
    main()

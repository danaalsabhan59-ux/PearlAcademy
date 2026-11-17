"""Sound-effects-only mix for the diabetes reel (no voice, no music). The picture stream is copied untouched.
All effects: Mixkit Sound Effects Free License (public/diabetes/sfx2/, IDs in file names; see SOURCES.json).
Every sound is softened (gentle low-pass, short fades), placed so its peak lands on the visual, and kept sparse.
Usage: python3 scripts/mix_diabetes_reel_sfx.py IN.mp4 OUT.mp4"""
import os, subprocess, sys, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR, FPS, DUR = 48000, 30, 40.0
N = int(SR * DUR)

def load(i, t0=0.0, t1=None):
    a = ["ffmpeg", "-v", "error", "-ss", str(t0)] + (["-t", str(t1 - t0)] if t1 else []) + ["-i", os.path.join(ROOT, f"public/diabetes/sfx2/mixkit-{i}.wav"), "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"]
    x = np.frombuffer(subprocess.run(a, capture_output=True, check=True).stdout, np.float32).reshape(-1, 2).copy()
    return x / (np.abs(x).max() + 1e-9)  # peak-normalise, then gain per cue

def soften(x, fc=6500, fade_in=0.008, fade_out=0.12):
    X = np.fft.rfft(x, axis=0); f = np.fft.rfftfreq(len(x), 1 / SR)[:, None]
    x = np.fft.irfft(X / np.sqrt(1 + (f / fc) ** 4), n=len(x), axis=0)
    a, b = int(fade_in * SR), int(fade_out * SR)
    x[:a] *= np.linspace(0, 1, a)[:, None]; x[-b:] *= np.linspace(1, 0, b)[:, None]
    return x

mix = np.zeros((N, 2), np.float32)
def place(x, frame, gain_db, align_peak=True):
    pk = np.argmax(np.abs(x).sum(1)) if align_peak else 0
    i = int(round(frame / FPS * SR)) - pk
    if i < 0: x = x[-i:]; i = 0
    x = x[: N - i]; mix[i:i + len(x)] += x * 10 ** (gain_db / 20)

S = {k: soften(load(k)) for k in [2573, 2568, 2574, 2870, 1107, 2344, 2867, 1104]}
pour = soften(load(2826, 0.6, 3.0), fc=7000, fade_in=0.25, fade_out=0.6)   # water poured into a glass
tick = soften(load(1050, 0.0, 2.8), fc=6000, fade_in=0.15, fade_out=0.5)   # slow tick-tock

CUES = [
    (12, 2573, -9), (80, 2573, -10),                     # scene 1 text
    (160, 2568, -11), (222, 2574, -9),                   # question, «هبوط السكر»
    *[(245 + i * 13, 2568, -14) for i in range(6)],      # six sign cards
    (362, 2574, -10), (388, 2573, -11),                   # «قاعدة ١٥-١٥», step 1
    (548, 2573, -11), (646, 2870, -12), (708, 1107, -11),  # step 2, meter check, step 3
    (850, 2344, -14), (930, 2867, -11),                  # condition card (calm), phone 997
    (1022, 1107, -11), (1090, 1104, -13), (1110, 2573, -13),  # closing ring, infographic card, last line
]
for fr, k, g in CUES:
    place(S[k], fr, g)
place(pour, 400, -17, align_peak=False)
place(tick, 564, -11, align_peak=False)
mix[-int(0.5 * SR):] *= np.linspace(1, 0, int(0.5 * SR))[:, None]
mix *= 10 ** (-4 / 20) / (np.abs(mix).max() + 1e-9)  # peaks at −4 dBFS: clear but never loud

wav = os.path.join(ROOT, "out/diabetes/reel_sfx_mix.wav")
with wave.open(wav, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix, -1, 1) * 32767).astype("<i2").tobytes())
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", sys.argv[1], "-i", wav, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-af", f"atrim=end={DUR}", "-movflags", "+faststart", sys.argv[2]], check=True)
os.remove(wav)
print("wrote", sys.argv[2])

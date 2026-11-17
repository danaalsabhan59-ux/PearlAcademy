"""Voice-over + sound-design mix for the diabetes reel. The picture is NOT re-rendered:
the existing video stream is copied bit-for-bit; only the audio track is replaced.

Layers
- Narration (ar-SA-HamedNeural, public/diabetes/voice/*.wav, placed per src/diabetes/reel/narration.json)
- Original pop cues (same frames as DiabetesReel.tsx), softened and ducked under the voice
- Action sounds: room tone, heartbeat, juice pour, clock tick, meter beep, plate, paper slide
Sources/licences: public/diabetes/sfx/SOURCES.json (Mixkit Sound Effects Free License) and sounds
synthesised in this script or by scripts/generate_strokecode_audio.py / generate_sfx.py (original).
Usage: python3 scripts/mix_diabetes_reel_vo.py IN.mp4 OUT.mp4
"""
import json, os, subprocess, sys
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR, FPS, DUR = 48000, 30, 40.0
N = int(SR * DUR)
rng = np.random.default_rng(14)

def load(path, t0=None, t1=None):
    args = ["ffmpeg", "-v", "error"]
    if t0 is not None:
        args += ["-ss", str(t0)]
    if t1 is not None:
        args += ["-t", str(t1 - (t0 or 0))]
    args += ["-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(args, capture_output=True, check=True).stdout, np.float32).copy()

def db(x): return 10 ** (x / 20)
def place(buf, x, t, gain_db=0.0):
    i = int(round(t * SR)); x = x[: max(0, N - i)] * db(gain_db); buf[i:i + len(x)] += x
def fade(x, a=0.01, b=0.05):
    na, nb = int(a * SR), int(b * SR); x = x.copy()
    if na: x[:na] *= np.linspace(0, 1, na)
    if nb: x[-nb:] *= np.linspace(1, 0, nb)
    return x
def rms_norm(x, target_db):
    r = np.sqrt(np.mean(x ** 2)) + 1e-9; return x * db(target_db) / r
def peak_at(x): return np.argmax(np.abs(x)) / SR
def lowpass(x, fc):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); return np.fft.irfft(X / np.sqrt(1 + (f / fc) ** 4), n=len(x))
def bandpass(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR) + 1e-9
    g = 1 / np.sqrt(1 + (lo / f) ** 4) / np.sqrt(1 + (f / hi) ** 4); return np.fft.irfft(X * g, n=len(x))

# ---------------------------------------------------------------- narration
cfg = json.load(open(os.path.join(ROOT, "src/diabetes/reel/narration.json")))
voice = np.zeros(N, np.float32)
spans = []
for ln in cfg["lines"]:
    v = load(os.path.join(ROOT, f"public/diabetes/voice/{ln['id']}.wav"))
    v = rms_norm(v, -20)  # even level line to line
    place(voice, fade(v, 0.01, 0.04), ln["start"])
    spans.append((ln["id"], ln["start"], ln["start"] + len(v) / SR, ln["end"]))

# ---------------------------------------------------------------- sound design bus
sfx = np.zeros(N, np.float32)
POP = {"dry": "pop-2356", "long": "pop-2358", "light": "pop-3005", "bubble": "pop-2357", "soap": "pop-2925", "hard": "pop-2364"}
pops = {k: load(os.path.join(ROOT, f"public/diabetes/sfx/{v}.mp3")) for k, v in POP.items()}
CUES = [(12, "dry", 0.5), (60, "light", 0.35), (80, "soap", 0.55), (160, "dry", 0.5), (222, "hard", 0.55)]
CUES += [(245 + i * 13, "light" if i % 2 else "long", 0.45) for i in range(6)]
CUES += [(362, "soap", 0.5), (388, "bubble", 0.5), (548, "bubble", 0.5), (640, "dry", 0.45), (708, "bubble", 0.5),
         (850, "hard", 0.5), (885, "dry", 0.5), (930, "soap", 0.55), (1022, "long", 0.45), (1046, "dry", 0.5),
         (1062, "light", 0.4), (1090, "soap", 0.55), (1110, "dry", 0.4)]
for fr, k, v in CUES:  # same frames as the original pop track; peak lands on the visual
    x = pops[k]; place(sfx, x, max(0, fr / FPS - peak_at(x)), 20 * np.log10(v) - 15)

def seg(n_sec): return int(n_sec * SR)
# classroom room tone 0–5.3 s (very low, warm)
rt = lowpass(rng.standard_normal(seg(5.3)), 500); rt = fade(rms_norm(rt, -50), 0.6, 0.8); place(sfx, rt, 0.0)
# heartbeat as symptoms build (frames 55–150)
hb = load(os.path.join(ROOT, "public/audio/sfx/heartbeat-loop.mp3"), 0, 3.0); place(sfx, fade(rms_norm(hb, -36), 0.8, 0.6), 1.9)
# juice pour while the glass fills (frames 400–460)
n = seg(2.1); t = np.arange(n) / SR
pour = bandpass(rng.standard_normal(n), 350, 2600) * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * t + rng.uniform(0, 6)))
for _ in range(26):  # small bubbles
    i = rng.integers(0, n - 2000); f0 = rng.uniform(500, 1100); k = np.arange(1500) / SR
    pour[i:i + 1500] += 0.6 * np.sin(2 * np.pi * (f0 + 900 * k / 0.03) * k) * np.exp(-k / 0.008)
place(sfx, fade(rms_norm(pour, -36), 0.25, 0.5), 400 / FPS)
# clock tick during the 15-minute sweep (frames 564–644)
ck = load(os.path.join(ROOT, "public/sc/sfx/clock-tick.mp3"), 0, 2.8); place(sfx, fade(rms_norm(ck, -38), 0.2, 0.5), 564 / FPS)
# glucometer beep when the meter appears (frame 646)
gm = load(os.path.join(ROOT, "public/sc/sfx/glucometer.mp3")); place(sfx, fade(rms_norm(gm, -34)), 646 / FPS)
# plate set on the table (frame 712)
k = np.arange(seg(0.35)) / SR
plate = (np.sin(2 * np.pi * 1850 * k) * 0.6 + np.sin(2 * np.pi * 2730 * k) * 0.35) * np.exp(-k / 0.06)
plate[: seg(0.004)] += rng.standard_normal(seg(0.004)) * 0.8
place(sfx, rms_norm(plate, -34), 712 / FPS)
# paper slide as the infographic card rises (frame 1090) — Mixkit 1104 "Paper slide"
pp = load(os.path.join(ROOT, "public/basira/audio/mixkit/paper.mp3")); place(sfx, fade(rms_norm(pp, -34)), 1090 / FPS - peak_at(pp) * 0.5)

# ---------------------------------------------------------------- ducking + mix
env = np.abs(voice); w = seg(0.12)
env = np.convolve(env, np.ones(w) / w, mode="same")
active = np.clip(env / (env.max() * 0.08 + 1e-9), 0, 1)
a = 1 - np.exp(-1 / (0.15 * SR)); sm = np.zeros_like(active); acc = 0.0
for i in range(0, N, 64):  # smooth gain (attack ≈ release ≈ 150 ms)
    acc += (active[i] - acc) * (1 - (1 - a) ** 64); sm[i:i + 64] = acc
duck = 1 - 0.5 * sm  # −6 dB on effects while narration speaks
sfx *= db(6)  # effects bus: ~22 dB under the narration while it speaks
mix = voice + sfx * duck
mix[: seg(0.02)] *= np.linspace(0, 1, seg(0.02)); mix[-seg(0.6):] *= np.linspace(1, 0, seg(0.6))

# report: effects vs voice level while speaking
spk = sm > 0.5
v_db = 20 * np.log10(np.sqrt(np.mean(voice[spk] ** 2)) + 1e-12)
s_db = 20 * np.log10(np.sqrt(np.mean((sfx * duck)[spk] ** 2)) + 1e-12)
print(f"voice RMS {v_db:.1f} dB | effects under voice {s_db:.1f} dB | margin {v_db - s_db:.1f} dB")
for sid, s, e, lim in spans:
    print(f"  {sid} {s:5.2f}–{e:5.2f}s (limit {lim:5.2f}) {'OK' if e <= lim + 0.02 else 'OVER'}")
prev = 0
for sid, s, e, _ in spans:
    if s < prev - 0.01: print("  OVERLAP before", sid)
    prev = e

wav = os.path.join(ROOT, "out/diabetes/reel_vo_mix.wav")
pcm = (np.clip(np.stack([mix, mix], 1), -1, 1) * 32767).astype("<i2")
import wave
with wave.open(wav, "wb") as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes(pcm.tobytes())

# two-pass loudness to −14 LUFS / −1 dBTP, mux with the untouched video stream
inp, out = sys.argv[1], sys.argv[2]
st = subprocess.run(["ffmpeg", "-hide_banner", "-i", wav, "-af", "loudnorm=I=-14:TP=-1:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
j = json.loads(st[st.rindex("{"):st.rindex("}") + 1])
af = f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true,aresample=48000,atrim=end={DUR}"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", inp, "-i", wav, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-af", af, "-c:a", "aac", "-b:a", "320k", "-movflags", "+faststart", out], check=True)
print("wrote", out)

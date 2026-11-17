"""Saudi-locale Arabic narration for the diabetes reel (Edge TTS, ar-SA-HamedNeural). Fails loudly.
Each line is generated, silence-trimmed, and — only if it would overrun its on-screen window — re-generated
slightly faster (max +20%). Writes public/diabetes/voice/<id>.wav and src/diabetes/reel/voice-fit.json."""
import asyncio, json, os, subprocess, sys
import edge_tts

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CFG = json.load(open(os.path.join(ROOT, "src/diabetes/reel/narration.json")))
OUT = os.path.join(ROOT, "public/diabetes/voice")
os.makedirs(OUT, exist_ok=True)
PROXY = os.environ.get("HTTPS_PROXY")

def dur(p):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]).decode())

async def tts(text, rate, path):
    c = edge_tts.Communicate(text, CFG["voice"], rate=f"{rate:+d}%", proxy=PROXY)
    await c.save(path)
    if os.path.getsize(path) < 2000:
        sys.exit(f"TTS failed for: {text}")

def trim(src, dst):
    # trim leading/trailing silence, 15 ms fades, mono 48 kHz
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-af",
        "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.04,areverse,afade=t=in:d=0.015,aresample=48000",
        "-ac", "1", dst], check=True)

async def main():
    fit = {}
    only = set(sys.argv[1:])
    old = json.load(open(os.path.join(ROOT, "src/diabetes/reel/voice-fit.json"))) if only else {}
    fit.update({k: v for k, v in old.items() if k not in only})
    for ln in CFG["lines"]:
        if only and ln["id"] not in only:
            continue
        window = ln["end"] - ln["start"]
        rate = CFG["baseRate"]
        while True:
            raw = os.path.join(OUT, ln["id"] + ".raw.mp3"); wav = os.path.join(OUT, ln["id"] + ".wav")
            await tts(ln["text"], rate, raw); trim(raw, wav); os.remove(raw)
            d = dur(wav)
            if d <= window or rate >= 20:
                break
            rate += 4
        ok = d <= window
        fit[ln["id"]] = {"start": ln["start"], "dur": round(d, 3), "rate": rate, "fits": ok, "text": ln["text"]}
        print(f'{ln["id"]} {d:5.2f}s / {window:4.2f}s  rate {rate:+d}%  {"OK" if ok else "OVERRUN"}')
    fit = dict(sorted(fit.items()))
    json.dump(fit, open(os.path.join(ROOT, "src/diabetes/reel/voice-fit.json"), "w"), indent=1)

asyncio.run(main())

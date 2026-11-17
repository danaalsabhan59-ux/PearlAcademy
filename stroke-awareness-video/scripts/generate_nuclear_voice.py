"""Arabic male narration for NuclearAwareness via Edge TTS (fails loudly; never writes silence).
Writes public/nuclear/voice/<id>.mp3 and <id>.words.json (word timings, seconds).
Usage: python3 scripts/generate_nuclear_voice.py [--proxy URL] [--rate -6%]"""
import argparse, asyncio, json, os, subprocess, sys
import edge_tts

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "src/nuclear/data/narration.json")
OUT = os.path.join(ROOT, "public/nuclear/voice")

def dur(p):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]).decode())

async def one(sc, voice, rate, proxy):
    c = edge_tts.Communicate(sc["text"], voice, rate=rate, proxy=proxy, boundary="WordBoundary")
    audio, words = bytearray(), []
    async for ch in c.stream():
        if ch["type"] == "audio":
            audio += ch["data"]
        elif ch["type"] == "WordBoundary":
            words.append({"w": ch["text"], "t": ch["offset"] / 1e7, "d": ch["duration"] / 1e7})
    if len(audio) < 2000 or not words:
        sys.exit(f"TTS failed for {sc['id']} — refusing to continue")
    p = os.path.join(OUT, sc["id"] + ".mp3")
    open(p, "wb").write(audio)
    json.dump(words, open(os.path.join(OUT, sc["id"] + ".words.json"), "w"), ensure_ascii=False)
    print(f"{sc['id']}: {dur(p):5.2f}s")

async def main():
    a = argparse.ArgumentParser(); a.add_argument("--proxy", default=os.environ.get("HTTPS_PROXY")); a.add_argument("--rate")
    args = a.parse_args(); cfg = json.load(open(DATA)); os.makedirs(OUT, exist_ok=True)
    for sc in cfg["scenes"]:
        await one(sc, cfg["voice"], args.rate or cfg["rate"], args.proxy)
    timing = {sc["id"]: round(dur(os.path.join(OUT, sc["id"] + ".mp3")), 3) for sc in cfg["scenes"]}
    json.dump(timing, open(os.path.join(ROOT, "src/nuclear/data/voice-timing.json"), "w"), indent=1)
    print("total voice", round(sum(timing.values()), 2), "s")

asyncio.run(main())

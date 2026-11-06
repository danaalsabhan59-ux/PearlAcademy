// Verify the rendered STROKE CODE files: duration, frame count, resolution, codecs, audio presence.
// Usage: node scripts/qc_strokecode.mjs [out/stroke-code-world-stroke-day.mp4] [out/...-muted.mp4]
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

const files = process.argv.slice(2);
if (files.length === 0) {
  files.push("out/stroke-code-world-stroke-day.mp4", "out/stroke-code-world-stroke-day-muted.mp4");
}

const probe = (file) =>
  JSON.parse(
    execFileSync("ffprobe", ["-v", "error", "-count_frames", "-show_streams", "-show_format", "-of", "json", file]).toString(),
  );

let failed = false;
const check = (ok, label) => {
  console.log(`  ${ok ? "✓" : "✗"} ${label}`);
  if (!ok) failed = true;
};

for (const file of files) {
  console.log(`\n${file}`);
  if (!existsSync(file)) {
    check(false, "file exists");
    continue;
  }
  const info = probe(file);
  const v = info.streams.find((s) => s.codec_type === "video");
  const a = info.streams.find((s) => s.codec_type === "audio");
  const muted = file.includes("muted");
  check(v?.codec_name === "h264", `video codec h264 (${v?.codec_name})`);
  check(v?.width === 1080 && v?.height === 1920, `resolution 1080×1920 (${v?.width}×${v?.height})`);
  check(v?.r_frame_rate === "30/1", `30 fps (${v?.r_frame_rate})`);
  check(Number(v?.nb_read_frames) === 3600, `3600 frames (${v?.nb_read_frames})`);
  const dur = Number(info.format.duration);
  check(Math.abs(dur - 120) < 0.05, `duration 120 s (${dur.toFixed(3)} s)`);
  if (muted) {
    check(!a, "no audio track (muted version)");
  } else {
    check(a?.codec_name === "aac", `audio codec AAC (${a?.codec_name})`);
    const err = execFileSync("sh", ["-c", `ffmpeg -hide_banner -i "${file}" -af volumedetect -f null - 2>&1 | grep -E "mean_volume|max_volume"`]).toString();
    console.log(err.trim().replace(/^/gm, "    "));
    const mean = Number(/mean_volume: (-?[\d.]+)/.exec(err)?.[1]);
    check(mean > -45, `audio is not silent (mean ${mean} dB)`);
  }
}
process.exit(failed ? 1 : 0);

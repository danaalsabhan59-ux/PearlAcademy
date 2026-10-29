// Render review stills for STROKE CODE and tile them into contact sheets.
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import { execFileSync } from "node:child_process";

const project = "/home/user/PearlAcademy/stroke-awareness-video";
const out = process.argv[2];
const frames = process.argv.slice(3).map(Number);
const browserExecutable = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";

const serveUrl = await bundle({ entryPoint: path.join(project, "src/index.ts"), publicDir: path.join(project, "public") });
const composition = await selectComposition({ serveUrl, id: "StrokeCode", browserExecutable, inputProps: { showSafeZones: false, muted: true } });
const files = [];
for (const frame of frames) {
  const file = path.join(out, `f${String(frame).padStart(4, "0")}.png`);
  await renderStill({ serveUrl, composition, frame, output: file, browserExecutable, scale: 0.5, inputProps: { showSafeZones: false, muted: true } });
  files.push(file);
  console.log("frame", frame);
}
// contact sheets of 6
for (let i = 0; i < files.length; i += 6) {
  const group = files.slice(i, i + 6);
  const args = [];
  group.forEach((f) => args.push("-i", f));
  const n = group.length;
  const layout = group.map((_, j) => `${(j % 3) === 0 ? "0" : (j % 3) === 1 ? "w0" : "w0+w1"}_${j < 3 ? "0" : "h0"}`).join("|");
  execFileSync("ffmpeg", ["-y", "-v", "error", ...args, "-filter_complex", n > 1 ? `xstack=inputs=${n}:layout=${layout}:fill=black` : "null", path.join(out, `sheet${i / 6}.png`)]);
}
console.log("done");

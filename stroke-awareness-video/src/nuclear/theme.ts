import { loadFont } from "@remotion/fonts";
import { Easing, interpolate, staticFile } from "remotion";

export const C = {
  navy: "#081827",
  blue: "#102B40",
  charcoal: "#111820",
  white: "#F5F7FA",
  amber: "#E8AD45",
  cyan: "#56C7D9",
  muted: "rgba(245,247,250,0.72)",
};
export const FONT = "'IBM Plex Sans Arabic', sans-serif";

for (const weight of ["500", "600", "700"]) {
  for (const subset of ["arabic", "latin"]) {
    loadFont({ family: "IBM Plex Sans Arabic", url: staticFile(`nuclear/fonts/ibm-plex-sans-arabic-${subset}-${weight}-normal.woff2`), weight });
  }
}

const io = Easing.inOut(Easing.cubic);
/** 0→1 between frames a and a+d, eased. */
export const ramp = (f: number, a: number, d: number, ease = io) =>
  interpolate(f, [a, a + Math.max(1, d)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
/** fade in at a over d, fade out ending at b over d */
export const win = (f: number, a: number, b: number, d = 12) => Math.min(ramp(f, a, d), 1 - ramp(f, b - d, d));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
/** deterministic pseudo-random 0..1 */
export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

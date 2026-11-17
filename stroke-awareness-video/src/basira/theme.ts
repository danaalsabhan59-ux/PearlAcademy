import { loadFont } from "@remotion/fonts";
import { Easing, interpolate, spring, staticFile } from "remotion";
import { FPS } from "./data/timeline";

export const T = {
  bg: "#071426",
  bgDeep: "#040c18",
  cyan: "#00D9FF",
  teal: "#19D6C5",
  white: "#FFFFFF",
  text: "#E9F6FF",
  muted: "#9DB4C8",
  glass: "rgba(255,255,255,0.06)",
  glassStrong: "rgba(255,255,255,0.10)",
  border: "rgba(0,217,255,0.32)",
  good: "#3BE39A",
  warn: "#FFB547",
  bad: "#FF5C7A",
  font: "'IBM Plex Sans Arabic', sans-serif",
};

// IBM Plex Sans Arabic (SIL OFL), bundled locally — the project renders offline.
for (const weight of ["500", "600", "700"]) {
  for (const subset of ["arabic", "latin"]) {
    loadFont({
      family: "IBM Plex Sans Arabic",
      url: staticFile(`basira/fonts/ibm-plex-sans-arabic-${subset}-${weight}-normal.woff2`),
      weight,
    });
  }
}

/** 0→1 between frames a and a+d, eased. */
export const ramp = (f: number, a: number, d: number, ease = Easing.inOut(Easing.cubic)) =>
  interpolate(f, [a, a + d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

/** Spring 0→1 starting at frame a. */
export const pop = (f: number, a: number, damping = 14, stiffness = 140) =>
  f < a ? 0 : spring({ frame: f - a, fps: FPS, config: { damping, stiffness, mass: 0.7 } });

/** Visible window with eased in/out. */
export const win = (f: number, a: number, b: number, d = 10) => Math.min(ramp(f, a, d), 1 - ramp(f, b - d, d));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export type Rect = { x: number; y: number; w: number; h: number };
export const lerpRect = (a: Rect, b: Rect, t: number): Rect => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  w: lerp(a.w, b.w, t),
  h: lerp(a.h, b.h, t),
});

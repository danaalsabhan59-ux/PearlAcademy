import { Easing, interpolate, useCurrentFrame } from "remotion";
import { FPS } from "../data/timeline";

const easeInOut = Easing.inOut(Easing.cubic);

/** Absolute film time in seconds. Scenes are not wrapped in <Sequence>, so this is global. */
export const useT = () => useCurrentFrame() / FPS;

/** 0→1 over [start, start+dur], clamped and eased. */
export const prog = (t: number, start: number, dur: number, easing: (x: number) => number = easeInOut) =>
  interpolate(t, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

/** Eased piecewise keyframes [[time, value], ...]. */
export const kf = (t: number, frames: [number, number][]) => {
  if (t <= frames[0][0]) return frames[0][1];
  for (let i = 1; i < frames.length; i++) {
    const [t1, v1] = frames[i];
    const [t0, v0] = frames[i - 1];
    if (t <= t1) return v0 + (v1 - v0) * easeInOut((t - t0) / Math.max(1e-6, t1 - t0));
  }
  return frames[frames.length - 1][1];
};

/** Fade in at `start`, out at `end` (seconds), each over `dur`. */
export const window01 = (t: number, start: number, end: number, dur = 0.35) =>
  Math.min(prog(t, start, dur), 1 - prog(t, end - dur, dur));

/** Deterministic blink: ~0.13 s every few seconds, offset per character. */
export const blinkAt = (t: number, seed: number) => (t + seed * 1.37) % (3.2 + seed * 0.6) < 0.13;

/** Idle breathing: 0/1 pixel offset. */
export const breathAt = (t: number, seed: number) => (Math.sin(t * 2.2 + seed) > 0.4 ? 1 : 0);

/** Mouth flap for an animated (silent) speech attempt. */
export const flap = (t: number, rate = 7) => Math.floor(t * rate) % 3 !== 2;

export const outCubic = Easing.out(Easing.cubic);
export const outBack = Easing.out(Easing.back(1.6));

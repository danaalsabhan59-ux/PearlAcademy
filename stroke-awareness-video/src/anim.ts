import { Easing, interpolate } from "remotion";
import { isTalking, SpeakerId, timeline } from "./timeline";

const ease = Easing.inOut(Easing.cubic);

/** 0→1 progress of a transition that starts at `start` and lasts `dur` seconds. */
export const progress = (t: number, start: number, dur: number, easing = ease) =>
  interpolate(t, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

/** Piecewise keyframes: [[time, value], ...] with eased segments. */
export const keyframes = (t: number, frames: [number, number][]) => {
  if (t <= frames[0][0]) return frames[0][1];
  for (let i = 1; i < frames.length; i++) {
    const [t1, v1] = frames[i];
    const [t0, v0] = frames[i - 1];
    if (t <= t1) return v0 + (v1 - v0) * ease((t - t0) / Math.max(1e-6, t1 - t0));
  }
  return frames[frames.length - 1][1];
};

/** Lip-sync: mouth is open on alternating 3-frame steps while a word is spoken. */
export const mouthFor = (speaker: SpeakerId, t: number, frame: number) => {
  const talking = isTalking(speaker, t);
  return { talking, open: talking && Math.floor(frame / 3) % 3 !== 2 };
};

/** Blink for ~0.12 s every few seconds, offset per character. */
export const blinkAt = (t: number, seed: number) => {
  const period = 3.1 + seed * 0.7;
  return (t + seed * 1.3) % period < 0.12;
};

export const ev = (name: string) => {
  const v = timeline.events[name];
  if (v === undefined) throw new Error(`Missing visual event "${name}" in dialogue.json`);
  return v;
};

export const lineStart = (id: string) => timeline.lines.find((l) => l.id === id)!.start;
export const lineEnd = (id: string) => timeline.lines.find((l) => l.id === id)!.end;
export const scene = (id: string) => timeline.scenes.find((s) => s.id === id)!;

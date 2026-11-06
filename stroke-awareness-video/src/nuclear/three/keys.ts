import { Cam } from "./common";

const ss = (t: number) => t * t * (3 - 2 * t);
/** Smooth camera keyframes: [frame, cam]. */
export const camAt = (lf: number, keys: [number, Cam][]): Cam => {
  if (lf <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [f0, a] = keys[i], [f1, b] = keys[i + 1];
    if (lf <= f1) {
      const t = ss((lf - f0) / (f1 - f0));
      const l = (x: number, y: number) => x + (y - x) * t;
      return {
        pos: [l(a.pos[0], b.pos[0]), l(a.pos[1], b.pos[1]), l(a.pos[2], b.pos[2])],
        target: [l(a.target[0], b.target[0]), l(a.target[1], b.target[1]), l(a.target[2], b.target[2])],
        fov: l(a.fov, b.fov),
      };
    }
  }
  return keys[keys.length - 1][1];
};

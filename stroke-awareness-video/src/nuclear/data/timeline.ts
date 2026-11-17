import timing from "./voice-timing.json";

export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const TOTAL = 3600; // exactly 120 s

/**
 * Scene lengths follow the real narration: lead-in + voice + tail. The last scene takes
 * whatever remains so the film is exactly 3600 frames.
 */
const ids = ["s1", "s2", "s3", "s4", "s5", "s6", "s7"] as const;
export type SceneId = (typeof ids)[number];
const LEAD: Record<SceneId, number> = { s1: 1.2, s2: 0.7, s3: 0.7, s4: 0.7, s5: 0.7, s6: 0.7, s7: 0.7 };
const TAIL = 0.6;

type Sc = { id: SceneId; start: number; end: number; voiceAt: number; voiceLen: number };
export const SCENES: Sc[] = [];
{
  let t = 0;
  ids.forEach((id, i) => {
    const v = timing[id];
    const start = Math.round(t * FPS);
    const voiceAt = Math.round((t + LEAD[id]) * FPS);
    t = t + LEAD[id] + v + TAIL;
    const end = i === ids.length - 1 ? TOTAL : Math.round(t * FPS);
    SCENES.push({ id, start, end, voiceAt, voiceLen: Math.ceil(v * FPS) });
  });
  if (SCENES[6].end - SCENES[6].voiceAt < SCENES[6].voiceLen + 20) {
    throw new Error("Narration does not fit 120 s — regenerate voice with a faster rate.");
  }
}
export const sc = (id: SceneId) => SCENES.find((s) => s.id === id)!;
/** Frame at which a given word index of a scene's narration starts. */
export const XF = 18; // cross-transition overlap in frames

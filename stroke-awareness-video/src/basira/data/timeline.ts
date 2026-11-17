/**
 * «الذكاء الاصطناعي في الطب» — frame-exact timeline (60 s, 30 fps, 1920×1080).
 * Scenes are contiguous; the total is enforced to be exactly 1800 frames.
 */
export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const TOTAL_FRAMES = 1800;

export type SceneId =
  | "intro"
  | "chatgpt"
  | "claude"
  | "notebooklm"
  | "research"
  | "flashcards"
  | "design"
  | "clinical"
  | "outro";

const DEFS: { id: SceneId; frames: number }[] = [
  { id: "intro", frames: 150 }, // 00:00–00:05
  { id: "chatgpt", frames: 240 }, // 00:05–00:13
  { id: "claude", frames: 240 }, // 00:13–00:21
  { id: "notebooklm", frames: 240 }, // 00:21–00:29
  { id: "research", frames: 210 }, // 00:29–00:36
  { id: "flashcards", frames: 210 }, // 00:36–00:43
  { id: "design", frames: 210 }, // 00:43–00:50
  { id: "clinical", frames: 150 }, // 00:50–00:55
  { id: "outro", frames: 150 }, // 00:55–01:00
];

export type Scene = { id: SceneId; start: number; end: number; frames: number };

export const SCENES: Scene[] = DEFS.reduce<Scene[]>((acc, d) => {
  const start = acc.length ? acc[acc.length - 1].end : 0;
  acc.push({ id: d.id, start, end: start + d.frames, frames: d.frames });
  return acc;
}, []);

if (SCENES[SCENES.length - 1].end !== TOTAL_FRAMES) {
  throw new Error(`Basira timeline totals ${SCENES[SCENES.length - 1].end} frames, expected ${TOTAL_FRAMES}`);
}

export const scene = (id: SceneId) => SCENES.find((s) => s.id === id)!;

/** Frames the shared panel takes to morph from one scene's layout to the next. */
export const MORPH = 16;

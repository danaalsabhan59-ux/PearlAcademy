import { Rect } from "../theme";
import { MORPH, scene, SceneId } from "./timeline";

/** Content coordinate system of the shared glass panel. */
export const CONTENT = { w: 960, h: 800 };
export const MAIN: Rect = { x: 90, y: 180, w: 960, h: 800 };

/** Intro tool cards (8, right-to-left). */
export const CARD = { w: 190, h: 132, gap: 22, y: 812 };
export const cardRect = (i: number): Rect => {
  const total = CARD.w * 8 + CARD.gap * 7;
  const x0 = (1920 - total) / 2;
  // index 0 is the right-most card (RTL reading order)
  return { x: x0 + (7 - i) * (CARD.w + CARD.gap), y: CARD.y, w: CARD.w, h: CARD.h };
};

// Shapes that one scene hands to the next (the element "becomes" the next scene's first element).
const DOC: Rect = { x: 330, y: 190, w: 480, h: 780 }; // ChatGPT infographic → Claude lecture document
const BAR: Rect = { x: 90, y: 520, w: 960, h: 120 }; // NotebookLM answer line → research search bar
const FLASH: Rect = { x: 290, y: 250, w: 560, h: 640 }; // research table row → flashcard
const SLIDE: Rect = { x: 130, y: 300, w: 880, h: 520 }; // review calendar → crowded slide
const PATIENT: Rect = { x: 250, y: 220, w: 640, h: 720 }; // poster → virtual patient card
const NODE: Rect = { x: 930, y: 530, w: 60, h: 60 }; // clinical panel → central network node

const SHAPES: Partial<Record<SceneId, { enter: Rect; exit: Rect }>> = {
  chatgpt: { enter: cardRect(0), exit: DOC },
  claude: { enter: DOC, exit: MAIN },
  notebooklm: { enter: MAIN, exit: BAR },
  research: { enter: BAR, exit: FLASH },
  flashcards: { enter: FLASH, exit: SLIDE },
  design: { enter: SLIDE, exit: PATIENT },
  clinical: { enter: PATIENT, exit: NODE },
};

const EXIT_FRAMES = 12;

/**
 * The panel's rect for a scene at absolute frame f, or null when the scene has no panel.
 * enter → MAIN over MORPH frames, MAIN → exit over the scene's last EXIT_FRAMES.
 */
export const panelRect = (id: SceneId, f: number, ease: (x: number) => number): Rect | null => {
  const shape = SHAPES[id];
  if (!shape) return null;
  const s = scene(id);
  const tin = ease(Math.min(1, Math.max(0, (f - s.start) / MORPH)));
  const tout = ease(Math.min(1, Math.max(0, (f - (s.end - EXIT_FRAMES)) / EXIT_FRAMES)));
  const mix = (a: Rect, b: Rect, t: number): Rect => ({
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    w: a.w + (b.w - a.w) * t,
    h: a.h + (b.h - a.h) * t,
  });
  return tout > 0 ? mix(MAIN, shape.exit, tout) : mix(shape.enter, MAIN, tin);
};

/** 0..1: how "settled" the panel content is (fades content in after the morph, out before exit). */
export const contentAlpha = (id: SceneId, f: number) => {
  const s = scene(id);
  const a = Math.min(1, Math.max(0, (f - s.start - MORPH * 0.55) / (MORPH * 0.6)));
  const b = Math.min(1, Math.max(0, (s.end - f - 2) / 8));
  return Math.min(a, b);
};

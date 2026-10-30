import { Rect } from "../theme";
import { MORPH, scene, SceneId } from "../data/timeline";

/** Vertical (1080×1920) layout. Content is still authored at 960×800 and scaled into the panel. */
export const V = {
  logoBar: { top: 160, h: 86 },
  header: { chipTop: 276, taglineTop: 378 },
  // right edge kept at x ≤ 990 so the TikTok/Reels icon rail never covers panel text
  main: { x: 70, y: 504, w: 920, h: 767 } as Rect,
  benefits: { top: 1318 },
  safeBottom: 1560,
};

/** Intro tool cards: 2 rows × 4, index 0 at top-right (RTL). */
export const CARD_V = { w: 205, h: 150, gap: 20, rows: [1030, 1200] };
export const cardRectV = (i: number): Rect => {
  const row = Math.floor(i / 4);
  const col = i % 4;
  const total = CARD_V.w * 4 + CARD_V.gap * 3;
  const x0 = (1080 - total) / 2;
  return { x: x0 + (3 - col) * (CARD_V.w + CARD_V.gap), y: CARD_V.rows[row], w: CARD_V.w, h: CARD_V.h };
};

const DOC: Rect = { x: 300, y: 520, w: 480, h: 740 };
const BAR: Rect = { x: 70, y: 840, w: 920, h: 116 };
const FLASH: Rect = { x: 270, y: 560, w: 540, h: 620 };
const SLIDE: Rect = { x: 90, y: 660, w: 900, h: 520 };
const PATIENT: Rect = { x: 230, y: 540, w: 620, h: 700 };
const NODE: Rect = { x: 510, y: 1020, w: 60, h: 60 };

/** How each tool's panel enters — varied on purpose. */
export type Entry = "morph" | "flip" | "iris" | "zoom";

const SHAPES: Partial<Record<SceneId, { enter: Rect; exit: Rect; entry: Entry }>> = {
  chatgpt: { enter: cardRectV(0), exit: DOC, entry: "morph" }, // tool card grows into the chat window
  claude: { enter: DOC, exit: V.main, entry: "morph" }, // infographic becomes the lecture page
  notebooklm: { enter: V.main, exit: BAR, entry: "flip" }, // the app flips over to the notebook
  research: { enter: BAR, exit: FLASH, entry: "morph" }, // answer line becomes the search bar
  flashcards: { enter: FLASH, exit: SLIDE, entry: "flip" }, // a table row flips into a flashcard
  design: { enter: SLIDE, exit: PATIENT, entry: "iris" }, // the calendar opens like a lens onto the slide
  clinical: { enter: PATIENT, exit: NODE, entry: "zoom" }, // zoom through the poster into the case
};

const EXIT = 12;

const mix = (a: Rect, b: Rect, t: number): Rect => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  w: a.w + (b.w - a.w) * t,
  h: a.h + (b.h - a.h) * t,
});

export const panelV = (id: SceneId, f: number, ease: (x: number) => number) => {
  const shape = SHAPES[id];
  if (!shape) return null;
  const s = scene(id);
  const tin = ease(Math.min(1, Math.max(0, (f - s.start) / MORPH)));
  const tout = ease(Math.min(1, Math.max(0, (f - (s.end - EXIT)) / EXIT)));
  const rect = tout > 0 ? mix(V.main, shape.exit, tout) : mix(shape.enter, V.main, tin);
  return { rect, entry: shape.entry, tin };
};

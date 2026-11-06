import { CueAPI } from "../data/cues";
import { SceneId } from "../data/timeline";
import { Card, PLAN } from "./script";

export const SILENT_TOTAL = 2700; // 90 s
const FPS = 30;
const TAIL = 0.4;

const natural = PLAN.reduce((t, s) => t + s.lead + s.cards.reduce((a, c) => a + c.dur, 0) + TAIL, 0);
/** Scale reading time so the film is exactly 90 s (never faster than 0.85× natural). */
export const K = SILENT_TOTAL / FPS / natural;
if (K < 0.85) throw new Error(`Silent script too long for 90 s (needs ${natural.toFixed(1)} s)`);

export type TimedCard = Card & { scene: SceneId; f0: number; f1: number };
export const SSCENES: { id: SceneId; chapter: string; start: number; end: number }[] = [];
export const CARDS: TimedCard[] = [];
const CUE: Record<string, number> = {};
{
  let t = 0;
  PLAN.forEach((s, i) => {
    const start = Math.round(t * FPS);
    t += s.lead * K;
    const cardStart: Record<string, number> = {};
    for (const c of s.cards) {
      const f0 = Math.round(t * FPS);
      t += c.dur * K;
      CARDS.push({ ...c, scene: s.id, f0, f1: Math.round(t * FPS) });
      cardStart[c.id] = f0;
    }
    t += TAIL * K;
    const end = i === PLAN.length - 1 ? SILENT_TOTAL : Math.round(t * FPS);
    SSCENES.push({ id: s.id, chapter: s.chapter, start, end });
    for (const [key, [card, off]] of Object.entries(s.cues)) CUE[`${s.id}:${key}`] = cardStart[card] + Math.round(off * K * FPS);
  });
}

export const silentCues = (hideKeyWords: boolean): CueAPI => ({
  at: (id, word, n = 0) => {
    const v = CUE[`${id}:${word}${n ? `#${n}` : ""}`];
    if (v === undefined) throw new Error(`silent cue missing: ${id}:${word}${n ? `#${n}` : ""}`);
    return v;
  },
  sc: (id) => SSCENES.find((s) => s.id === id)!,
  hideKeyWords,
  silent: true,
});
export const SILENT_CUE_TABLE = CUE;

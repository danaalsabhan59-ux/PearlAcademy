import narration from "./narration.json";
import w1 from "../../../public/nuclear/voice/s1.words.json";
import w2 from "../../../public/nuclear/voice/s2.words.json";
import w3 from "../../../public/nuclear/voice/s3.words.json";
import w4 from "../../../public/nuclear/voice/s4.words.json";
import w5 from "../../../public/nuclear/voice/s5.words.json";
import w6 from "../../../public/nuclear/voice/s6.words.json";
import w7 from "../../../public/nuclear/voice/s7.words.json";
import { FPS, sc, SceneId } from "./timeline";

const RAW: Record<SceneId, { w: string; t: number; d: number }[]> = { s1: w1, s2: w2, s3: w3, s4: w4, s5: w5, s6: w6, s7: w7 };

export type Word = { text: string; f0: number; f1: number };
/** Narration words (with the script's own punctuation) and their absolute frames. */
export const WORDS: Record<SceneId, Word[]> = {} as Record<SceneId, Word[]>;
for (const s of narration.scenes) {
  const id = s.id as SceneId;
  const toks = s.text.split(/\s+/);
  const base = sc(id).voiceAt;
  if (toks.length !== RAW[id].length) throw new Error(`word timing mismatch in ${id}`);
  WORDS[id] = RAW[id].map((r, i) => ({ text: toks[i], f0: base + Math.round(r.t * FPS), f1: base + Math.round((r.t + r.d) * FPS) }));
}

/** Absolute frame where the n-th occurrence of a word (prefix match, script spelling) is spoken. */
export const at = (id: SceneId, word: string, n = 0) => {
  const hits = WORDS[id].filter((w) => w.text.replace(/[،؛.؟,]/g, "").startsWith(word));
  if (!hits[n]) throw new Error(`word "${word}" not found in ${id}`);
  return hits[n].f0;
};

export type Cue = { text: string; f0: number; f1: number };
/**
 * Subtitle cues: whole phrases, max ~2 lines (≤ 52 chars), broken at punctuation where possible.
 * Each cue stays until the next one starts (or a short hold after its last word).
 */
export const CUES: Cue[] = [];
const MAXC = 50;
const lenOf = (ws: Word[]) => ws.map((x) => x.text).join(" ").length;
for (const s of narration.scenes) {
  const ws = WORDS[s.id as SceneId];
  // 1) sentences, 2) balanced chunks ≤ MAXC chars, preferring breaks after «،»
  const sentences: Word[][] = [];
  let cur: Word[] = [];
  ws.forEach((w) => {
    cur.push(w);
    if (/[.؟؛]$/.test(w.text)) { sentences.push(cur); cur = []; }
  });
  if (cur.length) sentences.push(cur);
  for (const sen of sentences) {
    // DP over break points: chunks ≤ MAXC chars; prefer even lengths and breaks after «،»;
    // penalise very short chunks and breaks after a preposition/conjunction.
    const n = sen.length;
    const weak = /^(في|من|إلى|على|عن|أن|أو|و|بل|لا|قد|كما|هذه|ذلك|بعض|كل|عبر)$/;
    const best: number[] = Array(n + 1).fill(Infinity);
    const prev: number[] = Array(n + 1).fill(-1);
    best[0] = 0;
    for (let j = 1; j <= n; j++) {
      for (let i = 0; i < j; i++) {
        const L = lenOf(sen.slice(i, j));
        if (L > MAXC && j - i > 1) continue;
        const last = sen[j - 1].text;
        let c = Math.pow(MAXC - L, 2) * 0.15;
        if (L < 16) c += 400;
        if (j < n) c += /[،,:]$/.test(last) ? 0 : 160;
        if (j < n && weak.test(last.replace(/[،؛.؟,]/g, ""))) c += 300;
        // keep construct phrases together (… نوع | المنشأة, مياه | الشرب)
        if (j < n && !/[،,:]$/.test(last) && /^ال/.test(sen[j].text)) c += 420;
        c += 120; // per-cue cost (fewer, fuller cues)
        if (best[i] + c < best[j]) { best[j] = best[i] + c; prev[j] = i; }
      }
    }
    const cuts: number[] = [];
    for (let j = n; j > 0; j = prev[j]) cuts.unshift(j);
    let i0 = 0;
    for (const j of cuts) {
      const chunk = sen.slice(i0, j);
      CUES.push({ text: chunk.map((x) => x.text).join(" "), f0: chunk[0].f0 - 3, f1: chunk[chunk.length - 1].f1 + 12 });
      i0 = j;
    }
  }
}
for (let i = 0; i < CUES.length - 1; i++) CUES[i].f1 = Math.min(CUES[i].f1 + 6, CUES[i + 1].f0);

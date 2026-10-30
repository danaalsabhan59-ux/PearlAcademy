import { Audio } from "@remotion/media";
import React from "react";
import { staticFile } from "remotion";
import { SCENES, scene } from "../data/timeline";

/**
 * Sound effects only — no music track, no voices. Sparse and quiet on purpose:
 * one sound per meaningful visual event, with silence in between.
 */
type Cue = { src: string; at: number; volume: number };
const s = (id: Parameters<typeof scene>[0]) => scene(id).start;

export const MOBILE_CUES: Cue[] = [
  { src: "m-title", at: 44, volume: 0.3 }, // title appears
  { src: "m-click", at: 56, volume: 0.22 }, // tool cards appear
  ...SCENES.slice(1).map((sc) => ({ src: "m-whoosh", at: sc.start - 4, volume: 0.2 })), // soft transitions
  { src: "m-typing", at: s("chatgpt") + 18, volume: 0.18 }, // question typed
  { src: "m-typing", at: s("chatgpt") + 68, volume: 0.12 }, // answer appears
  { src: "m-confirm", at: s("chatgpt") + 148, volume: 0.22 }, // correct MCQ answer
  { src: "m-click", at: s("chatgpt") + 202, volume: 0.18 }, // infographic card
  { src: "m-flip", at: s("claude") + 58, volume: 0.22 }, // lecture → slides
  { src: "m-click", at: s("claude") + 128, volume: 0.18 }, // slides → app
  { src: "m-file-open", at: s("notebooklm") + 2, volume: 0.28 }, // PDF opens
  { src: "m-click", at: s("notebooklm") + 66, volume: 0.18 }, // outputs appear
  { src: "m-typing", at: s("research") + 10, volume: 0.18 }, // query typed
  { src: "m-click", at: s("research") + 92, volume: 0.24 }, // pointer clicks a study
  { src: "m-flip", at: s("flashcards") + 26, volume: 0.32 }, // flashcard flips
  { src: "m-confirm", at: s("flashcards") + 44, volume: 0.2 }, // answer revealed
  { src: "m-whoosh", at: s("design") + 44, volume: 0.16 }, // crowded slide breaks apart
  { src: "m-typing", at: s("clinical") + 20, volume: 0.14 }, // student asks
  { src: "m-typing", at: s("clinical") + 42, volume: 0.1 }, // patient answers
  { src: "m-confirm", at: s("clinical") + 68, volume: 0.18 }, // first reasoning step
  { src: "m-end", at: s("outro") + 80, volume: 0.32 }, // closing logo
];

export const MobileAudio: React.FC = () => (
  <>
    {MOBILE_CUES.map((c, i) => (
      <Audio key={i} name={`${c.src} @${c.at}`} src={staticFile(`basira/audio/${c.src}.mp3`)} from={c.at} volume={c.volume} />
    ))}
  </>
);

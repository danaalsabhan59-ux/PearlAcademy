import { Audio } from "@remotion/media";
import React from "react";
import { staticFile } from "remotion";
import { SCENES, scene } from "../data/timeline";

type Cue = { src: string; at: number; volume: number };

const s = (id: Parameters<typeof scene>[0]) => scene(id).start;

/** Sound effects, each placed on the frame of the visual event it belongs to. */
const CUES: Cue[] = [
  // transitions: a whoosh on every scene change
  ...SCENES.slice(1).map((sc) => ({ src: "sfx-whoosh", at: sc.start - 6, volume: 0.45 })),
  // intro: heart forms, tool cards pop in
  { src: "sfx-shimmer", at: 30, volume: 0.35 },
  ...Array.from({ length: 8 }, (_, i) => ({ src: "sfx-pop", at: 56 + i * 5, volume: 0.28 })),
  // ChatGPT: typing, answer bullets, correct answer, OSCE checks, infographic
  ...Array.from({ length: 9 }, (_, i) => ({ src: "sfx-type", at: s("chatgpt") + 18 + i * 4, volume: 0.35 })),
  ...Array.from({ length: 4 }, (_, i) => ({ src: "sfx-pop", at: s("chatgpt") + 68 + i * 9, volume: 0.25 })),
  { src: "sfx-success", at: s("chatgpt") + 148, volume: 0.45 },
  ...Array.from({ length: 3 }, (_, i) => ({ src: "sfx-pop", at: s("chatgpt") + 178 + i * 6, volume: 0.22 })),
  { src: "sfx-flip", at: s("chatgpt") + 200, volume: 0.35 },
  // Claude: document → slides → app
  { src: "sfx-flip", at: s("claude") + 58, volume: 0.4 },
  ...Array.from({ length: 3 }, (_, i) => ({ src: "sfx-pop", at: s("claude") + 64 + i * 6, volume: 0.22 })),
  { src: "sfx-shimmer", at: s("claude") + 112, volume: 0.3 },
  // NotebookLM: files absorbed, outputs appear, map nodes
  ...Array.from({ length: 3 }, (_, i) => ({ src: "sfx-pop", at: s("notebooklm") + 50 + i * 5, volume: 0.22 })),
  ...Array.from({ length: 3 }, (_, i) => ({ src: "sfx-pop", at: s("notebooklm") + 66 + i * 12, volume: 0.28 })),
  ...Array.from({ length: 4 }, (_, i) => ({ src: "sfx-pop", at: s("notebooklm") + 156 + i * 6, volume: 0.2 })),
  // research: typing the query, papers, table
  ...Array.from({ length: 7 }, (_, i) => ({ src: "sfx-type", at: s("research") + 10 + i * 4, volume: 0.35 })),
  ...Array.from({ length: 3 }, (_, i) => ({ src: "sfx-pop", at: s("research") + 56 + i * 8, volume: 0.25 })),
  { src: "sfx-flip", at: s("research") + 112, volume: 0.35 },
  // flashcards: flip, correct, calendar days light up
  { src: "sfx-flip", at: s("flashcards") + 26, volume: 0.5 },
  { src: "sfx-success", at: s("flashcards") + 44, volume: 0.45 },
  ...[0, 1, 2, 3, 4].map((k) => ({ src: "sfx-pop", at: s("flashcards") + 96 + k * 10, volume: 0.22 })),
  // design: explode → rebuild, examples
  { src: "sfx-whoosh", at: s("design") + 44, volume: 0.45 },
  { src: "sfx-shimmer", at: s("design") + 62, volume: 0.3 },
  ...Array.from({ length: 3 }, (_, i) => ({ src: "sfx-pop", at: s("design") + 116 + i * 8, volume: 0.25 })),
  // clinical: reasoning steps checked
  ...Array.from({ length: 3 }, (_, i) => ({ src: "sfx-success", at: s("clinical") + 52 + i * 18, volume: 0.3 })),
  // outro: network forms, logo reveal
  { src: "sfx-shimmer", at: s("outro") + 80, volume: 0.5 },
];

export const BasiraAudio: React.FC = () => (
  <>
    <Audio name="music" src={staticFile("basira/audio/music.mp3")} volume={0.55} />
    {CUES.map((c, i) => (
      <Audio key={i} name={`${c.src} @${c.at}`} src={staticFile(`basira/audio/${c.src}.mp3`)} from={c.at} volume={c.volume} />
    ))}
  </>
);

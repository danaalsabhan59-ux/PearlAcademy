import { Audio } from "@remotion/media";
import React from "react";
import { staticFile } from "remotion";
import { scene } from "../data/timeline";

/**
 * Sound effects only — no music, no voices. Professional recorded effects from
 * Mixkit (Mixkit Sound Effects Free License; sources in public/basira/audio/mixkit/SOURCES.json),
 * trimmed and peak-normalised. Each cue is placed so the sound's PEAK lands on its
 * visual event (`peak` = frames from file start to its loudest point).
 */
type Sound = keyof typeof PEAK;
const PEAK = {
  card: 0,
  "cards-burst": 12,
  check: 1,
  confirm: 0,
  end: 22,
  "file-open": 3,
  flip: 4,
  paper: 1,
  "pointer-click": 0,
  title: 6,
  typing: 0,
  "whoosh-big": 21,
  whoosh: 1,
  zoom: 0,
};

type Cue = { sound: Sound; event: number; volume: number };
const s = (id: Parameters<typeof scene>[0]) => scene(id).start;

export const MOBILE_CUES: Cue[] = [
  // intro
  { sound: "title", event: 46, volume: 0.45 },
  { sound: "cards-burst", event: 62, volume: 0.38 },
  // ChatGPT
  { sound: "whoosh-big", event: s("chatgpt"), volume: 0.42 },
  { sound: "typing", event: s("chatgpt") + 18, volume: 0.38 },
  { sound: "typing", event: s("chatgpt") + 68, volume: 0.26 },
  { sound: "paper", event: s("chatgpt") + 116, volume: 0.32 },
  { sound: "confirm", event: s("chatgpt") + 148, volume: 0.45 },
  { sound: "check", event: s("chatgpt") + 178, volume: 0.3 },
  { sound: "card", event: s("chatgpt") + 202, volume: 0.38 },
  // Claude
  { sound: "whoosh", event: s("claude"), volume: 0.42 },
  { sound: "paper", event: s("claude") + 58, volume: 0.38 },
  { sound: "whoosh", event: s("claude") + 112, volume: 0.28 },
  { sound: "card", event: s("claude") + 128, volume: 0.32 },
  // NotebookLM
  { sound: "flip", event: s("notebooklm"), volume: 0.42 },
  { sound: "file-open", event: s("notebooklm") + 10, volume: 0.42 },
  { sound: "whoosh", event: s("notebooklm") + 50, volume: 0.24 },
  { sound: "card", event: s("notebooklm") + 66, volume: 0.32 },
  { sound: "card", event: s("notebooklm") + 90, volume: 0.26 },
  { sound: "check", event: s("notebooklm") + 156, volume: 0.24 },
  // Perplexity + Elicit
  { sound: "whoosh", event: s("research"), volume: 0.4 },
  { sound: "typing", event: s("research") + 10, volume: 0.38 },
  { sound: "card", event: s("research") + 56, volume: 0.3 },
  { sound: "pointer-click", event: s("research") + 92, volume: 0.55 },
  { sound: "paper", event: s("research") + 112, volume: 0.32 },
  // Anki + Quizlet
  { sound: "flip", event: s("flashcards"), volume: 0.4 },
  { sound: "flip", event: s("flashcards") + 30, volume: 0.55 },
  { sound: "confirm", event: s("flashcards") + 44, volume: 0.42 },
  { sound: "check", event: s("flashcards") + 96, volume: 0.28 },
  { sound: "check", event: s("flashcards") + 116, volume: 0.22 },
  // Canva + Gamma
  { sound: "whoosh-big", event: s("design"), volume: 0.38 },
  { sound: "whoosh", event: s("design") + 46, volume: 0.36 },
  { sound: "card", event: s("design") + 62, volume: 0.34 },
  { sound: "cards-burst", event: s("design") + 118, volume: 0.3 },
  // clinical training
  { sound: "zoom", event: s("clinical"), volume: 0.42 },
  { sound: "typing", event: s("clinical") + 20, volume: 0.32 },
  { sound: "typing", event: s("clinical") + 40, volume: 0.26 },
  { sound: "check", event: s("clinical") + 68, volume: 0.36 },
  { sound: "check", event: s("clinical") + 84, volume: 0.36 },
  { sound: "check", event: s("clinical") + 100, volume: 0.36 },
  // closing
  { sound: "whoosh-big", event: s("outro"), volume: 0.38 },
  { sound: "zoom", event: s("outro") + 6, volume: 0.26 },
  { sound: "end", event: s("outro") + 80, volume: 0.55 },
];

export const MobileAudio: React.FC = () => (
  <>
    {MOBILE_CUES.map((c, i) => (
      <Audio
        key={i}
        name={`${c.sound} @${c.event}`}
        src={staticFile(`basira/audio/mixkit/${c.sound}.mp3`)}
        from={Math.max(0, c.event - PEAK[c.sound])}
        volume={c.volume}
      />
    ))}
  </>
);

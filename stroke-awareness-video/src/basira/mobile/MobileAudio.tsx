import { Audio } from "@remotion/media";
import React from "react";
import { staticFile } from "remotion";
import { scene } from "../data/timeline";

/**
 * Sound effects only — no music, no voices. Professional recorded effects from
 * Mixkit (Mixkit Sound Effects Free License; sources in public/basira/audio/mixkit/SOURCES.json),
 * softened in public/basira/audio/mixkit-soft/ (gentle low-pass, 10 ms fade-in, −4 dB); final mix ≈ −28 LUFS. Each cue is placed so the sound's PEAK lands on its
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
  // Soft and sparse: one quiet sound per key moment, with natural silences between.
  // intro
  { sound: "title", event: 46, volume: 0.3 },
  { sound: "card", event: 60, volume: 0.22 },
  // ChatGPT
  { sound: "whoosh-big", event: s("chatgpt"), volume: 0.24 },
  { sound: "typing", event: s("chatgpt") + 18, volume: 0.2 },
  { sound: "paper", event: s("chatgpt") + 116, volume: 0.24 },
  { sound: "confirm", event: s("chatgpt") + 148, volume: 0.22 },
  { sound: "card", event: s("chatgpt") + 202, volume: 0.2 },
  // Claude
  { sound: "whoosh", event: s("claude"), volume: 0.24 },
  { sound: "paper", event: s("claude") + 58, volume: 0.26 },
  { sound: "card", event: s("claude") + 128, volume: 0.18 },
  // NotebookLM
  { sound: "flip", event: s("notebooklm"), volume: 0.22 },
  { sound: "file-open", event: s("notebooklm") + 10, volume: 0.22 },
  { sound: "card", event: s("notebooklm") + 66, volume: 0.18 },
  // Perplexity + Elicit
  { sound: "whoosh", event: s("research"), volume: 0.22 },
  { sound: "typing", event: s("research") + 10, volume: 0.2 },
  { sound: "pointer-click", event: s("research") + 92, volume: 0.24 },
  { sound: "paper", event: s("research") + 112, volume: 0.2 },
  // Anki + Quizlet
  { sound: "flip", event: s("flashcards") + 30, volume: 0.28 },
  { sound: "confirm", event: s("flashcards") + 44, volume: 0.2 },
  // Canva + Gamma
  { sound: "whoosh-big", event: s("design"), volume: 0.22 },
  { sound: "whoosh", event: s("design") + 46, volume: 0.2 },
  { sound: "card", event: s("design") + 118, volume: 0.18 },
  // clinical training
  { sound: "zoom", event: s("clinical"), volume: 0.2 },
  { sound: "typing", event: s("clinical") + 20, volume: 0.18 },
  { sound: "check", event: s("clinical") + 68, volume: 0.2 },
  // closing
  { sound: "whoosh-big", event: s("outro"), volume: 0.22 },
  { sound: "end", event: s("outro") + 80, volume: 0.32 },
];

export const MobileAudio: React.FC = () => (
  <>
    {MOBILE_CUES.map((c, i) => (
      <Audio
        key={i}
        name={`${c.sound} @${c.event}`}
        src={staticFile(`basira/audio/mixkit-soft/${c.sound}.mp3`)}
        from={Math.max(0, c.event - PEAK[c.sound])}
        volume={c.volume}
      />
    ))}
  </>
);

import { Audio } from "@remotion/media";
import React from "react";
import { staticFile } from "remotion";
import { sc, SCENES } from "../data/timeline";

/**
 * Voice first. Narration at full level; one quiet ambience bed (scripts/generate_nuclear_ambience.py)
 * and a few soft transition sweeps (Mixkit Sound Effects Free License — see public/nuclear/sfx/SOURCES.json),
 * each placed so its peak lands on the visual transition.
 */
const SWEEPS: { src: string; at: number; peak: number; volume: number }[] = [
  { src: "zoom", at: sc("s2").start, peak: 0, volume: 0.22 },
  { src: "whoosh", at: sc("s3").start + 4, peak: 1, volume: 0.2 },
  { src: "whoosh-big", at: sc("s4").start + 6, peak: 21, volume: 0.16 },
  { src: "whoosh", at: sc("s5").start + 58, peak: 1, volume: 0.16 },
  { src: "zoom", at: sc("s6").start, peak: 0, volume: 0.18 },
  { src: "whoosh-big", at: sc("s7").start + 4, peak: 21, volume: 0.16 },
];

export const NuclearAudio: React.FC = () => (
  <>
    <Audio name="ambience" src={staticFile("nuclear/sfx/ambience.mp3")} volume={0.21} />
    {/* very quiet music bed (Mixkit #441, Stock Music Free License), faded in/out, well under the voice */}
    <Audio
      name="music"
      src={staticFile("nuclear/music/mixkit-441.mp3")}
      volume={(fr) => 0.05 * Math.min(1, fr / 60) * Math.min(1, Math.max(0, (3590 - fr) / 75))}
    />
    {SWEEPS.map((w, i) => (
      <Audio key={i} name={`sweep ${w.src}`} src={staticFile(`nuclear/sfx/${w.src}.mp3`)} from={Math.max(0, w.at - w.peak)} volume={w.volume} />
    ))}
    {SCENES.map((s) => (
      <Audio key={s.id} name={`voice ${s.id}`} src={staticFile(`nuclear/voice/${s.id}.mp3`)} from={s.voiceAt} volume={1} />
    ))}
  </>
);

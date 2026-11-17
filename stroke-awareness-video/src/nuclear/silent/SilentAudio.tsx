import { Audio } from "@remotion/media";
import React from "react";
import { staticFile } from "remotion";
import { SILENT_TOTAL, SSCENES } from "./timeline";

/** No voice. Calm music carries the film, with the ambience bed and soft transition sweeps beneath it. */
const st = (id: string) => SSCENES.find((s) => s.id === id)!.start;
const SWEEPS = [
  { src: "zoom", at: st("s2"), peak: 0, volume: 0.24 },
  { src: "whoosh", at: st("s3") + 4, peak: 1, volume: 0.22 },
  { src: "whoosh-big", at: st("s4") + 6, peak: 21, volume: 0.18 },
  { src: "whoosh", at: st("s5") + 58, peak: 1, volume: 0.18 },
  { src: "zoom", at: st("s6"), peak: 0, volume: 0.2 },
  { src: "whoosh-big", at: st("s7") + 4, peak: 21, volume: 0.18 },
];

export const SilentAudio: React.FC = () => (
  <>
    <Audio name="music" src={staticFile("nuclear/music/mixkit-441.mp3")} volume={(fr) => 0.5 * Math.min(1, fr / 45) * Math.min(1, Math.max(0, (SILENT_TOTAL - 8 - fr) / 90))} />
    <Audio name="ambience" src={staticFile("nuclear/sfx/ambience-silent.mp3")} volume={0.3} />
    {SWEEPS.map((w, i) => (
      <Audio key={i} name={`sweep ${w.src}`} src={staticFile(`nuclear/sfx/${w.src}.mp3`)} from={Math.max(0, w.at - w.peak)} volume={w.volume} />
    ))}
  </>
);

import { Audio } from "@remotion/media";
import React from "react";
import { staticFile } from "remotion";
import { windowGain } from "../../timeline";
import { LEVELS, MUSIC, SFX } from "../data/audio";
import { FPS } from "../data/timeline";

/** Instrumental music + non-vocal effects. No voices anywhere. */
export const Score: React.FC = () => (
  <>
    {MUSIC.map((m) => {
      const from = Math.round(m.start * FPS);
      return (
        <Audio
          key={m.id}
          name={`music ${m.id}`}
          src={staticFile(m.src)}
          from={from}
          durationInFrames={Math.round((m.end - m.start) * FPS)}
          volume={(f) => {
            const t = (from + f) / FPS;
            const duck = (m.duck ?? []).reduce(
              (g, d) => Math.min(g, 1 - (1 - d.level) * windowGain(t, d.start, d.end, 0.08, 0.6)),
              1,
            );
            return LEVELS.master * LEVELS.music * m.volume * duck * windowGain(t, m.start, m.end, m.fadeIn, m.fadeOut);
          }}
        />
      );
    })}
    {SFX.map((s) => {
      const from = Math.round(s.start * FPS);
      const end = s.end ?? s.start + 60;
      return (
        <Audio
          key={s.id}
          name={`sfx ${s.id}`}
          src={staticFile(s.src)}
          from={from}
          durationInFrames={s.end === undefined ? undefined : Math.round((s.end - s.start) * FPS)}
          loop={s.loop}
          loopVolumeCurveBehavior="extend"
          volume={(f) => {
            const t = (from + f) / FPS;
            return LEVELS.master * LEVELS.sfx * s.volume * windowGain(t, s.start, end, s.fadeIn ?? 0, s.fadeOut ?? 0);
          }}
        />
      );
    })}
  </>
);

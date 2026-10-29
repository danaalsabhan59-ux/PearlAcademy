import { Audio } from "@remotion/media";
import { staticFile, useVideoConfig } from "remotion";
import {
  dialogue,
  duckGain,
  tensionAmount,
  timeline,
  windowGain,
} from "../timeline";

/**
 * Every sound in the video: one <Audio> per dialogue line, the sound effects
 * and two music layers (calm + tension) that cross-fade and duck under speech.
 */
export const Soundtrack: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();
  const total = durationInFrames / fps;
  const { music } = dialogue;

  const musicFade = (t: number) =>
    windowGain(t, 0, total, music.fadeIn, music.fadeOut);

  return (
    <>
      {timeline.lines.map((line) =>
        line.audio ? (
          <Audio
            key={line.id}
            name={`voice ${line.id} (${line.speaker})`}
            src={staticFile(line.audio)}
            from={Math.round(line.start * fps)}
            durationInFrames={Math.ceil((line.end - line.start) * fps) + 2}
          />
        ) : null,
      )}

      {timeline.sfx.map((sfx) => {
        const from = Math.round(sfx.start * fps);
        const end = sfx.end ?? sfx.start + 30;
        return (
          <Audio
            key={sfx.id}
            name={`sfx ${sfx.id}`}
            src={staticFile(sfx.src)}
            from={from}
            durationInFrames={
              sfx.end === null ? undefined : Math.ceil((sfx.end - sfx.start) * fps)
            }
            loop={sfx.loop}
            loopVolumeCurveBehavior="extend"
            volume={(f) => {
              const t = (from + f) / fps;
              const fade = windowGain(t, sfx.start, end, sfx.fadeIn ?? 0, sfx.fadeOut ?? 0);
              // Effects duck less than music so they stay readable.
              const duck = sfx.duck ? 0.5 + 0.5 * duckGain(t) : 1;
              return sfx.volume * fade * duck;
            }}
          />
        );
      })}

      <Audio
        name="music calm"
        src={staticFile(music.calm.src)}
        loop
        loopVolumeCurveBehavior="extend"
        volume={(f) => {
          const t = f / fps;
          const calm = 1 - 0.75 * tensionAmount(t);
          return music.calm.volume * calm * duckGain(t) * musicFade(t);
        }}
      />
      <Audio
        name="music tension"
        src={staticFile(music.tension.src)}
        loop
        loopVolumeCurveBehavior="extend"
        volume={(f) => {
          const t = f / fps;
          // Tension rises during the dramatic moments, still ducked under speech.
          const duck = 0.35 + 0.65 * duckGain(t);
          return music.tension.volume * tensionAmount(t) * duck * musicFade(t);
        }}
      />
    </>
  );
};

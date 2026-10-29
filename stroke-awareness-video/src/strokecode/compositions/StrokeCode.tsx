import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Score } from "../audio/Score";
import { Backdrop, Hud, LogoHeader, SafeZones } from "../components/Layout";
import text from "../data/text.json";
import { CROSSFADE_FRAMES, FPS, SceneId, SCENES, TOTAL_FRAMES } from "../data/timeline";
import { S01Opening, S02Evening, S03Onset, S04Signs, S05Call } from "../scenes/HomeScenes";
import { S06CodeStroke, S07Assessment, S08CT, S09Decision, S10Final } from "../scenes/HospitalScenes";
import "../styles/fonts";

const SCENE_COMPONENTS: Record<SceneId, React.FC<{ t: number }>> = {
  s01Opening: S01Opening,
  s02Evening: S02Evening,
  s03Onset: S03Onset,
  s04Signs: S04Signs,
  s05Call: S05Call,
  s06CodeStroke: S06CodeStroke,
  s07Assessment: S07Assessment,
  s08CT: S08CT,
  s09Decision: S09Decision,
  s10Final: S10Final,
};

export type StrokeCodeProps = {
  /** Draw safe-zone guides (layout review only). */
  showSafeZones: boolean;
  /** Leave out all audio (for the silent social version). */
  muted: boolean;
};

export const StrokeCode: React.FC<StrokeCodeProps> = ({ showSafeZones, muted }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const idx = SCENES.findIndex((s) => frame >= s.startFrame && frame < s.endFrame);
  const current = SCENES[idx === -1 ? SCENES.length - 1 : idx];
  const previous = idx > 0 ? SCENES[idx - 1] : null;
  const intoScene = frame - current.startFrame;
  const fading = previous !== null && intoScene < CROSSFADE_FRAMES;
  const Current = SCENE_COMPONENTS[current.id];
  const Previous = previous ? SCENE_COMPONENTS[previous.id] : null;
  const hospital = frame >= SCENES.find((s) => s.id === "s06CodeStroke")!.startFrame;
  const opening = current.id === "s01Opening";
  const ending = current.id === "s10Final";

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b1126" }}>
      <Backdrop tint={hospital ? "rgba(30,95,191,0.30)" : "rgba(255,179,71,0.14)"} />
      {/* Outgoing scene stays underneath while the incoming one fades in: no black gaps. */}
      {fading && Previous ? (
        <AbsoluteFill>
          <Previous t={t} />
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{ opacity: fading ? intoScene / CROSSFADE_FRAMES : 1 }}>
        <Current t={t} />
      </AbsoluteFill>
      {!opening && !ending ? (
        <Hud chapter={hospital ? text.hud.hospital : text.hud.home} progress={frame / (TOTAL_FRAMES - 1)} t={t} alert={hospital} />
      ) : null}
      <LogoHeader />
      {showSafeZones ? <SafeZones /> : null}
      {muted ? null : <Score />}
    </AbsoluteFill>
  );
};

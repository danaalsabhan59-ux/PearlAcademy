import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { progress, scene } from "./anim";
import { Soundtrack } from "./audio/Soundtrack";
import "./fonts";
import { LivingRoom } from "./scenes/LivingRoom";
import { Street } from "./scenes/Street";
import { sceneAt } from "./timeline";
import {
  FastPanel,
  HeartbeatVignette,
  MissingVoicesBanner,
  Outro,
  PhonePanel,
  Subtitles,
  TitleCard,
  VisualCheckWatermark,
} from "./ui/Overlays";

/** Fade through black around these scene boundaries. */
const BLACK_CUTS = ["ambulance", "outro"];

export type StrokeVideoProps = {
  /** Silent, watermarked render for checking visuals only. Never a final export. */
  visualCheck: boolean;
};

export const StrokeVideo: React.FC<StrokeVideoProps> = ({ visualCheck }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const current = sceneAt(t);
  const fast = scene("fast");

  // Dim and desaturate the room while the narrator explains the signs.
  const dim = Math.min(progress(t, fast.start - 0.3, 0.6), 1 - progress(t, fast.end - 0.6, 0.6));
  const black = Math.max(
    1 - progress(t, 0, 0.8),
    ...BLACK_CUTS.map((id) => {
      const start = scene(id).start;
      return Math.min(progress(t, start - 0.5, 0.5), 1 - progress(t, start, 0.5));
    }),
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#14101f" }}>
      {current.id === "ambulance" ? (
        <Street />
      ) : current.id === "outro" ? (
        <Outro />
      ) : (
        <AbsoluteFill style={{ filter: `saturate(${1 - 0.55 * dim}) brightness(${1 - 0.3 * dim})` }}>
          <LivingRoom />
        </AbsoluteFill>
      )}
      <HeartbeatVignette />
      <FastPanel />
      <PhonePanel />
      <TitleCard />
      <Subtitles />
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: black, pointerEvents: "none" }} />
      <MissingVoicesBanner />
      {visualCheck ? <VisualCheckWatermark /> : <Soundtrack />}
    </AbsoluteFill>
  );
};

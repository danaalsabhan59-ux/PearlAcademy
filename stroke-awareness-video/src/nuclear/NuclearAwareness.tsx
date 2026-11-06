import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { HeaderStyle, PersistentInstitutionalHeader } from "./components/PersistentInstitutionalHeader";
import { Subtitles } from "./components/Text";
import { SCENES, SceneId, XF } from "./data/timeline";
import { NuclearAudio } from "./audio/NuclearAudio";
import { S1Question } from "./scenes/S1Question";
import { S2Facility } from "./scenes/S2Facility";
import { S3Transport } from "./scenes/S3Transport";
import { S4Distance } from "./scenes/S4Distance";
import { S5WaterFood } from "./scenes/S5WaterFood";
import { S6Monitoring } from "./scenes/S6Monitoring";
import { S7Finale } from "./scenes/S7Finale";
import { C, ramp } from "./theme";

const SCENE_COMPONENTS: Partial<Record<SceneId, React.FC<{ f: number }>>> = {
  s1: S1Question,
  s2: S2Facility,
  s3: S3Transport,
  s4: S4Distance,
  s5: S5WaterFood,
  s6: S6Monitoring,
  s7: S7Finale,
};

/**
 * «الإشعاع النووي | هل يمكن أن يصل إلينا؟» — 120 s, 1080×1920, 30 fps.
 * Each scene keeps animating XF frames past its end while the next one dissolves in on top
 * (object-based transitions are built into the scenes themselves). The institutional header
 * and subtitles are rendered once, above every scene and transition.
 */
export const NuclearAwareness: React.FC<{ muted?: boolean; headerStyle?: HeaderStyle }> = ({ muted, headerStyle = "transparent" }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.navy, overflow: "hidden" }}>
      {SCENES.map((s, i) => {
        const Comp = SCENE_COMPONENTS[s.id];
        if (!Comp) return null;
        const last = i === SCENES.length - 1;
        if (f < s.start || f >= (last ? s.end : s.end + XF)) return null;
        const fadeIn = i === 0 ? 1 : ramp(f, s.start, XF);
        return (
          <AbsoluteFill key={s.id} style={{ opacity: fadeIn }}>
            <Comp f={f} />
          </AbsoluteFill>
        );
      })}
      {/* subtle vignette + grain-free cinematic falloff */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.42) 100%)", pointerEvents: "none" }} />
      <Subtitles f={f} />
      <PersistentInstitutionalHeader style={headerStyle} />
      {muted ? null : <NuclearAudio />}
    </AbsoluteFill>
  );
};

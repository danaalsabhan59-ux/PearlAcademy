import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { PersistentInstitutionalHeader } from "../components/PersistentInstitutionalHeader";
import { CueContext } from "../data/cues";
import { SceneId, XF } from "../data/timeline";
import { S1Question } from "../scenes/S1Question";
import { S2Facility } from "../scenes/S2Facility";
import { S3Transport } from "../scenes/S3Transport";
import { S4Distance } from "../scenes/S4Distance";
import { S5WaterFood } from "../scenes/S5WaterFood";
import { S6Monitoring } from "../scenes/S6Monitoring";
import { S7Finale } from "../scenes/S7Finale";
import { C, FONT, ramp } from "../theme";
import { SilentAudio } from "./SilentAudio";
import { silentCues, SSCENES } from "./timeline";
import { Chapter, Grain, Typography } from "./Typography";

const SCENES: Record<SceneId, React.FC<{ f: number }>> = { s1: S1Question, s2: S2Facility, s3: S3Transport, s4: S4Distance, s5: S5WaterFood, s6: S6Monitoring, s7: S7Finale };
const CUES_HIDE = silentCues(true);
const CUES_KEEP = silentCues(false); // finale draws its own designed text

/** «الإشعاع النووي | هل يمكن أن يصل إلينا؟» — silent cinematic version: 90 s, 1080×1920, text-led, no voice. */
export const NuclearSilent: React.FC<{ muted?: boolean }> = ({ muted }) => {
  const f = useCurrentFrame();
  const last = SSCENES[SSCENES.length - 1];
  return (
    <AbsoluteFill style={{ background: C.navy, overflow: "hidden" }}>
      {SSCENES.map((s, i) => {
        const Comp = SCENES[s.id];
        const isLast = i === SSCENES.length - 1;
        if (f < s.start || f >= (isLast ? s.end : s.end + XF)) return null;
        return (
          <AbsoluteFill key={s.id} style={{ opacity: i === 0 ? 1 : ramp(f, s.start, XF) }}>
            <CueContext.Provider value={s.id === "s7" ? CUES_KEEP : CUES_HIDE}>
              <Comp f={f} />
            </CueContext.Provider>
          </AbsoluteFill>
        );
      })}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.5) 100%)", pointerEvents: "none" }} />
      <Typography f={f} />
      <Grain f={f} />
      <Chapter f={f} />
      <div dir="rtl" style={{ position: "absolute", top: 166, right: 34, zIndex: 950, opacity: (1 - ramp(f, last.start, 20)) * ramp(f, 20, 20) }}>
        <span style={{ fontFamily: FONT, fontWeight: 500, fontSize: 24, color: C.cyan, padding: "4px 14px", borderRadius: 999, border: "1px solid rgba(86,199,217,0.55)", background: "rgba(8,24,39,0.6)" }}>محاكاة توضيحية افتراضية</span>
      </div>
      <PersistentInstitutionalHeader />
      {muted ? null : <SilentAudio />}
    </AbsoluteFill>
  );
};

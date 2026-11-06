import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { NuclearAwareness } from "../NuclearAwareness";
import { sc } from "../data/timeline";
import { C, FONT, ramp } from "../theme";

/** Three self-contained cut-downs of the film, cut at scene boundaries (no new content). */
export const PARTS = [
  { from: sc("s1").start, to: sc("s3").start, title: "هل يمكن أن يصل إلينا؟" },
  { from: sc("s3").start, to: sc("s5").start, title: "كيف ينتقل وما الذي يحدد انتشاره؟" },
  { from: sc("s5").start, to: 3600, title: "الماء والغذاء والمصادر الرسمية" },
];
const NUM = ["١", "٢", "٣"];

export const NuclearPart: React.FC<{ part: number }> = ({ part }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = PARTS[part];
  const badge = ramp(f, 4, 12);
  const next = part < 2 ? ramp(f, durationInFrames - 40, 14) : 0;
  return (
    <AbsoluteFill>
      <Sequence from={-p.from}>
        <NuclearAwareness />
      </Sequence>
      <div dir="rtl" style={{ position: "absolute", top: 166, left: 34, zIndex: 1100, opacity: badge }}>
        <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 26, color: C.navy, background: C.amber, borderRadius: 999, padding: "5px 16px" }}>
          الجزء {NUM[part]} من ٣
        </span>
      </div>
      {next > 0 ? (
        <div dir="rtl" style={{ position: "absolute", left: 0, right: 0, top: 1250, textAlign: "center", zIndex: 1100, opacity: next, transform: `translateY(${(1 - next) * 20}px)` }}>
          <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 40, color: C.white, background: "rgba(8,24,39,0.9)", border: `2px solid ${C.cyan}`, borderRadius: 18, padding: "10px 28px" }}>
            يتبع في الجزء {NUM[part + 1]} ←
          </span>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

import React from "react";
import { C, FONT, ramp } from "../theme";
import { CUES } from "../data/words";
import { useCues } from "../data/cues";

/** Synchronised Arabic subtitles (whole words, RTL, ≤ 2 lines), fixed above the platform caption zone. */
export const Subtitles: React.FC<{ f: number }> = ({ f }) => {
  const cue = CUES.find((c) => f >= c.f0 && f < c.f1);
  if (!cue) return null;
  const a = Math.min(ramp(f, cue.f0, 5), 1 - ramp(f, cue.f1 - 5, 5));
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 1418, height: 170, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 900 }}>
      <div
        dir="rtl"
        style={{
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 44,
          lineHeight: 1.5,
          color: C.white,
          textAlign: "center",
          padding: "10px 30px",
          borderRadius: 18,
          background: "rgba(8,24,39,0.62)",
          boxShadow: "0 8px 26px rgba(0,0,0,0.35)",
          maxWidth: 920,
          opacity: a,
          transform: `translateY(${(1 - a) * 8}px)`,
        }}
      >
        {cue.text}
      </div>
    </div>
  );
};

/** On-screen keyword: word-by-word reveal (letters never split), amber highlight for scientific terms. */
export const KeyWord: React.FC<{
  f: number;
  at: number;
  out?: number;
  text: string;
  size?: number;
  color?: string;
  top: number;
  left?: number;
  right?: number;
  weight?: number;
  align?: "center" | "right" | "left";
  chip?: boolean;
}> = ({ f, at, out, text, size = 64, color = C.white, top, left = 60, right = 60, weight = 700, align = "center", chip }) => {
  const { hideKeyWords } = useCues();
  if (hideKeyWords || f < at - 1) return null;
  const o = out === undefined ? 0 : ramp(f, out - 10, 10);
  if (o >= 1) return null;
  const words = text.split(" ");
  return (
    <div style={{ position: "absolute", top, left, right, textAlign: align, opacity: 1 - o, zIndex: 800 }}>
      <div
        dir="rtl"
        style={{
          display: "inline-block",
          fontFamily: FONT,
          fontWeight: weight,
          fontSize: size,
          lineHeight: 1.35,
          color,
          padding: chip ? "8px 28px" : 0,
          borderRadius: chip ? 16 : 0,
          background: chip ? "rgba(8,24,39,0.7)" : undefined,
          border: chip ? `1.5px solid ${color === C.amber ? "rgba(232,173,69,0.55)" : "rgba(86,199,217,0.45)"}` : undefined,
          textShadow: "0 4px 22px rgba(0,0,0,0.7)",
        }}
      >
        {words.map((w, i) => {
          const p = ramp(f, at + i * 4, 10);
          return (
            <span key={i} style={{ display: "inline-block", opacity: p, transform: `translateY(${(1 - p) * 22}px)`, filter: p < 1 ? `blur(${(1 - p) * 6}px)` : undefined, whiteSpace: "pre" }}>
              {w}
              {i < words.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** Small honest label, e.g. «محاكاة افتراضية». */
export const Tag: React.FC<{ f: number; a: number; b: number; text: string; top: number; color?: string }> = ({ f, a, b, text, top, color = C.cyan }) => {
  const o = Math.min(ramp(f, a, 12), 1 - ramp(f, b - 12, 12));
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, textAlign: "center", opacity: o, zIndex: 850 }}>
      <span dir="rtl" style={{ fontFamily: FONT, fontWeight: 500, fontSize: 28, color, padding: "6px 18px", borderRadius: 999, border: `1px solid ${color}`, background: "rgba(8,24,39,0.66)", letterSpacing: 0 }}>
        {text}
      </span>
    </div>
  );
};

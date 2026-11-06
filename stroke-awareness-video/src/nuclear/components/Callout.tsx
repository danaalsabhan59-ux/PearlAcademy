import React from "react";
import { C, FONT, ramp } from "../theme";

/** Label with a leader line pointing at (x, y); text box at (tx, ty). Drawn in screen space. */
export const Callout: React.FC<{ f: number; at: number; out?: number; x: number; y: number; tx: number; ty: number; text: string; color?: string; size?: number }> = ({
  f, at, out, x, y, tx, ty, text, color = C.cyan, size = 34,
}) => {
  const a = ramp(f, at, 14);
  const o = out === undefined ? 0 : ramp(f, out - 10, 10);
  const vis = a * (1 - o);
  if (vis <= 0) return null;
  const lx = x + (tx - x) * a, ly = y + (ty - y) * a;
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: vis, zIndex: 700 }}>
        <circle cx={x} cy={y} r={8} fill={color} />
        <circle cx={x} cy={y} r={16} fill="none" stroke={color} strokeWidth={2} opacity={0.6} />
        <line x1={x} y1={y} x2={lx} y2={ly} stroke={color} strokeWidth={2.5} />
      </svg>
      <div
        dir="rtl"
        style={{
          position: "absolute",
          left: tx - 200,
          top: ty - 30,
          width: 400,
          textAlign: "center",
          opacity: ramp(f, at + 8, 10) * (1 - o),
          zIndex: 710,
        }}
      >
        <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: size, color: C.white, background: "rgba(8,24,39,0.82)", border: `1.5px solid ${color}`, borderRadius: 14, padding: "6px 20px", whiteSpace: "nowrap" }}>
          {text}
        </span>
      </div>
    </>
  );
};

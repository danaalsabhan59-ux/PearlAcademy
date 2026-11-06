import React, { useLayoutEffect, useRef } from "react";
import { drawEarth, EarthView } from "../animations/earth";

/** Earth canvas at half resolution (540×960), scaled to the full frame. View values are in full-frame pixels. */
export const Earth: React.FC<{ view: EarthView; style?: React.CSSProperties }> = ({ view, style }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const { cx, cy, r, lon, tilt, alpha } = view;
  useLayoutEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    drawEarth(ctx, 540, 960, { cx: cx / 2, cy: cy / 2, r: r / 2, lon, tilt, alpha, light: view.light });
  }, [cx, cy, r, lon, tilt, alpha, view.light]);
  return <canvas ref={ref} width={540} height={960} style={{ position: "absolute", inset: 0, width: 1080, height: 1920, ...style }} />;
};

/** Deterministic star field. */
export const Stars: React.FC<{ alpha: number; drift?: number }> = ({ alpha, drift = 0 }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: alpha }}>
    {Array.from({ length: 220 }, (_, i) => {
      const x = ((i * 733.7) % 1080 + drift * (0.3 + (i % 5) * 0.15)) % 1080;
      const y = (i * 419.3) % 1920;
      const r = (i % 7 === 0 ? 1.8 : 1) * (0.6 + ((i * 37) % 10) / 14);
      return <circle key={i} cx={x} cy={y} r={r} fill="#F5F7FA" opacity={0.25 + ((i * 53) % 10) / 14} />;
    })}
  </svg>
);

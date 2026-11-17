import React, { createContext, useContext } from "react";

/** The pixel stage: 180×180 art pixels shown at 6× (1080×1080 screen pixels). */
export const ART = 180;

type Cam = { scale: number; cx: number; cy: number; shakeX: number };
const CamContext = createContext<Cam>({ scale: 1, cx: 90, cy: 90, shakeX: 0 });

/**
 * A parallax layer. depth < 1 moves less than the camera (far away),
 * depth > 1 moves more (foreground).
 */
export const Layer: React.FC<{ depth?: number; children: React.ReactNode }> = ({ depth = 1, children }) => {
  const { scale, cx, cy, shakeX } = useContext(CamContext);
  const s = 1 + (scale - 1) * depth;
  const lx = 90 + (cx - 90) * depth;
  const ly = 90 + (cy - 90) * depth;
  return <g transform={`translate(${90 + shakeX} 90) scale(${s}) translate(${-lx} ${-ly})`}>{children}</g>;
};

export const Stage: React.FC<{
  scale?: number;
  cx?: number;
  cy?: number;
  shakeX?: number;
  filter?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ scale = 1, cx = 90, cy = 90, shakeX = 0, filter, children, style }) => {
  // Keep the camera inside the set.
  const half = ART / 2 / scale;
  const ccx = Math.min(ART - half, Math.max(half, cx));
  const ccy = Math.min(ART - half, Math.max(half, cy));
  return (
    <svg
      viewBox={`0 0 ${ART} ${ART}`}
      width="100%"
      height="100%"
      shapeRendering="crispEdges"
      style={{ display: "block", filter, ...style }}
    >
      <CamContext.Provider value={{ scale, cx: ccx, cy: ccy, shakeX }}>{children}</CamContext.Provider>
    </svg>
  );
};

/** Convert an art-space point to screen pixels for a stage with the given camera. */
export const artToScreen = (
  ax: number,
  ay: number,
  cam: { scale?: number; cx?: number; cy?: number },
  viewport = { left: 90, top: 586, size: 900 },
) => {
  const scale = cam.scale ?? 1;
  const half = ART / 2 / scale;
  const cx = Math.min(ART - half, Math.max(half, cam.cx ?? 90));
  const cy = Math.min(ART - half, Math.max(half, cam.cy ?? 90));
  const k = viewport.size / ART;
  return {
    x: viewport.left + ((ax - cx) * scale + 90) * k,
    y: viewport.top + ((ay - cy) * scale + 90) * k,
  };
};

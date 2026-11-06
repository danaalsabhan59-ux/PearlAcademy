import React from "react";

/** Logical pixel canvas: 320×180 art pixels scaled up to 1920×1080 (×6). */
export const ART_W = 320;
export const ART_H = 180;

export const R: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  c: string;
  o?: number;
}> = ({ x, y, w = 1, h = 1, c, o }) => (
  <rect x={x} y={y} width={w} height={h} fill={c} opacity={o} />
);

/**
 * Draws a sprite from text rows. Each character is a palette key; "." is empty.
 * Horizontal runs of the same colour are merged into one rect.
 */
export const Sprite: React.FC<{
  rows: string[];
  palette: Record<string, string>;
  x?: number;
  y?: number;
}> = ({ rows, palette, x = 0, y = 0 }) => {
  const rects: React.ReactNode[] = [];
  rows.forEach((row, ry) => {
    let rx = 0;
    while (rx < row.length) {
      const key = row[rx];
      let len = 1;
      while (row[rx + len] === key) len++;
      if (key !== "." && palette[key]) {
        rects.push(
          <rect key={`${ry}-${rx}`} x={x + rx} y={y + ry} width={len} height={1} fill={palette[key]} />,
        );
      }
      rx += len;
    }
  });
  return <>{rects}</>;
};

export const PixelCanvas: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <svg
    viewBox={`0 0 ${ART_W} ${ART_H}`}
    width="100%"
    height="100%"
    shapeRendering="crispEdges"
    style={{ position: "absolute", inset: 0, ...style }}
  >
    {children}
  </svg>
);

export const PALETTE = {
  skin: "#c68a5c",
  skinShade: "#a86d45",
  skinDark: "#8a5534",
  thobe: "#f1efe6",
  thobeShade: "#cfcabb",
  red: "#c73a3a",
  agal: "#1b1b22",
  beard: "#2a1d16",
  hair: "#1a1410",
  eye: "#1a1214",
  mouth: "#5a2018",
  mouthOpen: "#2a0b08",
  tongue: "#b5524a",
  jersey: "#1f8a4c",
  jerseyShade: "#166b3a",
  white: "#ffffff",
  shorts: "#e9e9e9",
  sandal: "#6b4428",
  uniform: "#24406b",
  uniformShade: "#1a3052",
  reflect: "#e8f04a",
};

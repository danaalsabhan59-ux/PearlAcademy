import React from "react";
import { C } from "../theme";

/** Small generic facility marker: dome + cooling tower (no real plant). */
export const FacilityIcon: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 1, color = C.amber }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={46} fill="rgba(232,173,69,0.12)" stroke={color} strokeWidth={2} />
    <path d="M -24 14 L -24 -2 A 12 12 0 0 1 0 -2 L 0 14 Z" fill={color} />
    <path d="M 6 14 Q 10 0 6 -16 L 22 -16 Q 18 0 22 14 Z" fill={color} opacity={0.85} />
    <rect x={-30} y={14} width={58} height={4} fill={color} />
  </g>
);

/** City / "us" marker. */
export const CityIcon: React.FC<{ x: number; y: number; color?: string }> = ({ x, y, color = C.cyan }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={40} fill="rgba(86,199,217,0.12)" stroke={color} strokeWidth={2} />
    {[-18, -6, 6, 18].map((dx, i) => (
      <rect key={i} x={dx - 5} y={-[10, 20, 14, 6][i]} width={10} height={[10, 20, 14, 6][i] + 10} fill={color} />
    ))}
  </g>
);

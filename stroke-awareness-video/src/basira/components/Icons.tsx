import React from "react";
import { T } from "../theme";

/** Simple medical / tool glyphs drawn in SVG (24×24 grid, stroke style). */
type IconProps = { size?: number; color?: string; stroke?: number; draw?: number };

const Svg: React.FC<IconProps & { children: React.ReactNode }> = ({ size = 48, color = T.cyan, stroke = 1.8, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

/** `draw` (0..1) animates the outline being drawn. */
const dash = (draw?: number, len = 80) =>
  draw === undefined ? {} : { strokeDasharray: len, strokeDashoffset: len * (1 - draw) };

export const HeartPulse: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" style={dash(p.draw)} />
    <path d="M5.5 12h3l1.5-3 2 6 1.5-3h4.5" style={dash(p.draw, 40)} />
  </Svg>
);

export const Stethoscope: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M6 3v6a4 4 0 0 0 8 0V3" />
    <path d="M10 13v2a5 5 0 0 0 10 0v-2" />
    <circle cx="20" cy="11" r="2" />
  </Svg>
);

export const Brain: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 3 3V4z" />
    <path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-3 3V4z" />
  </Svg>
);

export const Chat: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M4 5h16v11H9l-5 4z" />
    <path d="M8 9h8M8 12h5" />
  </Svg>
);

export const Code: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 5l-3 14" />
  </Svg>
);

export const Notebook: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <path d="M9 3v18M12 8h4M12 12h4" />
  </Svg>
);

export const Search: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.5 15.5L21 21" />
  </Svg>
);

export const Cards: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <rect x="3" y="7" width="13" height="13" rx="2" />
    <path d="M8 4h11a2 2 0 0 1 2 2v11" />
  </Svg>
);

export const Palette: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.9 1.4-2-.5-1.3.4-2.6 1.8-2.6H18a3 3 0 0 0 3-3C21 7.4 17 3 12 3z" />
    <circle cx="7.5" cy="11" r="1" />
    <circle cx="10" cy="7" r="1" />
    <circle cx="15" cy="7" r="1" />
  </Svg>
);

export const Doc: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M6 3h8l4 4v14H6z" />
    <path d="M14 3v4h4M9 12h6M9 15h6M9 18h4" />
  </Svg>
);

export const Wave: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 7v10M21 12h0" />
  </Svg>
);

export const Check: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M5 12.5l4.5 4.5L19 7" style={dash(p.draw, 24)} />
  </Svg>
);

export const Calendar: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </Svg>
);

export const User: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </Svg>
);

export const Play: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M8 5v14l11-7z" fill={p.color ?? T.cyan} />
  </Svg>
);

export const TOOL_ICONS: Record<string, React.FC<IconProps>> = {
  ChatGPT: Chat,
  Claude: Code,
  NotebookLM: Notebook,
  Perplexity: Search,
  Elicit: Doc,
  Anki: Cards,
  Quizlet: Cards,
  Canva: Palette,
  Gamma: Palette,
};

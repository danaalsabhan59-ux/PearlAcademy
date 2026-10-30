import React from "react";
import { Img, staticFile } from "remotion";
import { T } from "../theme";
import meta from "../../../public/basira/tool-logos/logos.json";

/**
 * Official tool logos supplied by the club (public/basira/tool-logos/), shown with their
 * original colours and proportions. Dark logos sit on a white plate and the white
 * Canva logo on a navy plate so every logo stays legible on the navy design.
 * NotebookLM and Anki have no usable logo file yet, so they keep the original icon + name.
 */
type LogoName = keyof typeof meta;
const DARK_PLATE: Partial<Record<LogoName, true>> = { Canva: true };

export const hasLogo = (name: string): name is LogoName => name in meta;

export const LogoPlate: React.FC<{ name: LogoName; height: number; maxWidth?: number }> = ({ name, height, maxWidth }) => {
  const m = meta[name];
  const pad = Math.round(height * 0.14);
  const padX = Math.round(pad * 1.4);
  // fit inside maxWidth (if given) while keeping the logo's own proportions
  const inner = Math.min(height - pad * 2, maxWidth ? (maxWidth - padX * 2) / m.ratio : Infinity);
  const plateH = Math.max(inner + pad * 2, Math.min(height, 40));
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        height: plateH,
        padding: `0 ${padX}px`,
        borderRadius: Math.round(plateH * 0.24),
        background: DARK_PLATE[name] ? "#0b1730" : "#FFFFFF",
        border: DARK_PLATE[name] ? `1.5px solid ${T.border}` : "none",
        boxSizing: "border-box",
        flexShrink: 0,
      }}
    >
      <Img src={staticFile(m.file)} style={{ height: inner, width: inner * m.ratio, display: "block" }} />
    </div>
  );
};

/** A tool label made of logos and/or text, e.g. [Perplexity logo] + [Elicit logo]. */
export type MarkPart = { logo: LogoName } | { text: string };

export const ToolMark: React.FC<{ parts: MarkPart[]; height: number; textSize: number; gap?: number; maxLogoWidth?: number }> = ({
  parts,
  height,
  textSize,
  gap = 12,
  maxLogoWidth,
}) => (
  <div dir="ltr" style={{ display: "inline-flex", alignItems: "center", gap }}>
    {parts.map((p, i) =>
      "logo" in p ? (
        <LogoPlate key={i} name={p.logo} height={height} maxWidth={maxLogoWidth} />
      ) : (
        <span key={i} style={{ fontFamily: T.font, fontWeight: 700, fontSize: textSize, color: T.white, whiteSpace: "nowrap" }}>
          {p.text}
        </span>
      ),
    )}
  </div>
);

/** Logo parts for each tool label used in the video and the poster. */
export const TOOL_MARKS: Record<string, MarkPart[] | null> = {
  ChatGPT: [{ logo: "ChatGPT" }],
  "Claude + Claude Code": [{ logo: "Claude" }, { text: "+ Claude Code" }],
  Claude: [{ logo: "Claude" }],
  NotebookLM: null, // supplied file is not the NotebookLM logo — keep icon + name
  "Perplexity + Elicit": [{ logo: "Perplexity" }, { text: "+" }, { logo: "Elicit" }],
  Perplexity: [{ logo: "Perplexity" }],
  Elicit: [{ logo: "Elicit" }],
  "Anki + Quizlet": [{ text: "Anki +" }, { logo: "Quizlet" }],
  Anki: null, // no Anki logo supplied — keep icon + name
  Quizlet: [{ logo: "Quizlet" }],
  "Canva + Gamma": [{ logo: "Canva" }, { text: "+" }, { logo: "Gamma" }],
  "Canva · Gamma": [{ logo: "Canva" }, { logo: "Gamma" }],
};

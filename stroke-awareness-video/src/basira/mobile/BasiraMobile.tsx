import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import { Background } from "../components/Frame";
import { Cards, Chat, Code, Notebook, Palette, Search, Stethoscope } from "../components/Icons";
import { contentAlpha } from "../data/layout";
import text from "../data/text.json";
import { MORPH, SCENES, SceneId } from "../data/timeline";
import { ChatGPTContent, ClaudeContent } from "../scenes/Scenes1";
import { ClinicalContent, DesignContent, FlashcardsContent, NotebookContent, ResearchContent } from "../scenes/Scenes2";
import { T } from "../theme";
import { IntroV, OutroV } from "./IntroOutroV";
import { panelV } from "./layoutV";
import { MobileAudio } from "./MobileAudio";
import { Benefit, LogoBarV, PanelV, SafeZonesV, ToolHeader } from "./MobileFrame";

type Panelled = Exclude<SceneId, "intro" | "outro">;

const CONTENTS: Record<Panelled, React.FC<{ lf: number; f: number }>> = {
  chatgpt: ChatGPTContent,
  claude: ClaudeContent,
  notebooklm: NotebookContent,
  research: ResearchContent,
  flashcards: FlashcardsContent,
  design: DesignContent,
  clinical: ClinicalContent,
};

const ICON = { size: 48, color: T.cyan };

/** Header + benefits per tool. Benefit times are frames from the scene start. */
const COPY: Record<Panelled, { tool: string; tagline: string; icon: React.ReactNode; benefits: [string, number][] }> = {
  chatgpt: {
    tool: text.chatgpt.tool,
    tagline: text.chatgpt.tagline,
    icon: <Chat {...ICON} />,
    benefits: [
      [text.chatgpt.phrases[0], 72],
      [text.chatgpt.phrases[1], 124],
      [text.chatgpt.phrases[2], 204],
    ],
  },
  claude: {
    tool: text.claude.tool,
    tagline: text.claude.tagline,
    icon: <Code {...ICON} />,
    benefits: [
      [text.claude.phrases[0], 24],
      [text.claude.phrases[1], 70],
      [text.claude.phrases[2], 126],
    ],
  },
  notebooklm: { tool: text.notebooklm.tool, tagline: text.notebooklm.tagline, icon: <Notebook {...ICON} />, benefits: [[text.notebooklm.main, 66]] },
  research: {
    tool: text.research.tool,
    tagline: text.research.tagline,
    icon: <Search {...ICON} />,
    benefits: [
      [text.research.phrases[0], 56],
      [text.research.phrases[1], 112],
      [text.research.phrases[2], 160],
    ],
  },
  flashcards: {
    tool: text.flashcards.tool,
    tagline: text.flashcards.tagline,
    icon: <Cards {...ICON} />,
    benefits: [
      [text.flashcards.phrases[0], 26],
      [text.flashcards.phrases[1], 90],
      [text.flashcards.phrases[2], 150],
    ],
  },
  design: {
    tool: text.design.tool,
    tagline: text.design.tagline,
    icon: <Palette {...ICON} />,
    benefits: [
      [text.design.phrases[0], 64],
      [text.design.phrases[1], 112],
      [text.design.phrases[2], 160],
    ],
  },
  clinical: { tool: text.clinical.tool, tagline: text.clinical.main, icon: <Stethoscope {...ICON} />, benefits: [] },
};

const ease = Easing.inOut(Easing.cubic);

export type BasiraMobileProps = { showSafeZones: boolean };

/** Vertical 1080×1920 version: header (tool) → interactive panel → benefit, with SFX only. */
export const BasiraMobile: React.FC<BasiraMobileProps> = ({ showSafeZones }) => {
  const f = useCurrentFrame();
  const cur = SCENES.find((s) => f >= s.start && f < s.end) ?? SCENES[SCENES.length - 1];
  const id = cur.id;
  const lf = f - cur.start;
  const panelled = id !== "intro" && id !== "outro";
  const panel = panelled ? panelV(id, f, ease) : null;
  const Content = panelled ? CONTENTS[id as Panelled] : null;
  const copy = panelled ? COPY[id as Panelled] : null;
  const sweep = panelled && lf < MORPH + 8 ? lf / (MORPH + 8) : -1;

  return (
    <AbsoluteFill style={{ background: T.bg, fontFamily: T.font }}>
      <Background frame={f} />
      {id === "intro" ? <IntroV f={f} /> : null}
      {panel && Content ? (
        <PanelV rect={panel.rect} entry={panel.entry} tin={panel.tin} sweep={sweep}>
          <div style={{ position: "absolute", inset: 0, opacity: contentAlpha(id, f) }}>
            <Content lf={lf} f={f} />
          </div>
        </PanelV>
      ) : null}
      {copy ? (
        <>
          <ToolHeader frame={f} start={cur.start} end={cur.end} tool={copy.tool} tagline={copy.tagline} icon={copy.icon} />
          <Benefit frame={f} end={cur.end} phrases={copy.benefits.map(([t, at]) => ({ text: t, at: cur.start + at }))} />
        </>
      ) : null}
      {id === "outro" ? <OutroV f={f} /> : null}
      <LogoBarV frame={f} dim={id === "outro" ? 1 : 0} />
      {showSafeZones ? <SafeZonesV /> : null}
      <MobileAudio />
    </AbsoluteFill>
  );
};

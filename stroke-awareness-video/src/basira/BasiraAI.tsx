import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import { BasiraAudio } from "./audio/BasiraAudio";
import { Background, GlassPanel, LogoBar, SideText } from "./components/Frame";
import { Cards, Chat, Code, Notebook, Palette, Search, Stethoscope } from "./components/Icons";
import { CONTENT, contentAlpha, panelRect } from "./data/layout";
import text from "./data/text.json";
import { MORPH, SCENES, SceneId, scene } from "./data/timeline";
import { ChatGPTContent, ClaudeContent, Intro } from "./scenes/Scenes1";
import { ClinicalContent, DesignContent, FlashcardsContent, NotebookContent, Outro, ResearchContent } from "./scenes/Scenes2";
import { T } from "./theme";

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

const ICON = { size: 40, color: T.cyan };

/** Right-hand column for each tool scene (phrase times are frames from the scene start). */
const SIDE: Record<Panelled, { tool: string; tagline: string; phrases: [string, number][]; icon: React.ReactNode }> = {
  chatgpt: {
    tool: text.chatgpt.tool,
    tagline: text.chatgpt.tagline,
    phrases: [
      [text.chatgpt.phrases[0], 70],
      [text.chatgpt.phrases[1], 122],
      [text.chatgpt.phrases[2], 202],
    ],
    icon: <Chat {...ICON} />,
  },
  claude: {
    tool: text.claude.tool,
    tagline: text.claude.tagline,
    phrases: [
      [text.claude.phrases[0], 24],
      [text.claude.phrases[1], 70],
      [text.claude.phrases[2], 124],
    ],
    icon: <Code {...ICON} />,
  },
  notebooklm: {
    tool: text.notebooklm.tool,
    tagline: text.notebooklm.tagline,
    phrases: [[text.notebooklm.main, 66]],
    icon: <Notebook {...ICON} />,
  },
  research: {
    tool: text.research.tool,
    tagline: text.research.tagline,
    phrases: [
      [text.research.phrases[0], 56],
      [text.research.phrases[1], 112],
      [text.research.phrases[2], 160],
    ],
    icon: <Search {...ICON} />,
  },
  flashcards: {
    tool: text.flashcards.tool,
    tagline: text.flashcards.tagline,
    phrases: [
      [text.flashcards.phrases[0], 26],
      [text.flashcards.phrases[1], 90],
      [text.flashcards.phrases[2], 150],
    ],
    icon: <Cards {...ICON} />,
  },
  design: {
    tool: text.design.tool,
    tagline: text.design.tagline,
    phrases: [
      [text.design.phrases[0], 64],
      [text.design.phrases[1], 112],
      [text.design.phrases[2], 160],
    ],
    icon: <Palette {...ICON} />,
  },
  clinical: {
    tool: "",
    tagline: text.clinical.main,
    phrases: [],
    icon: null,
  },
};

const easeMorph = Easing.inOut(Easing.cubic);

export type BasiraProps = { muted: boolean };

export const BasiraAI: React.FC<BasiraProps> = ({ muted }) => {
  const f = useCurrentFrame();
  const cur = SCENES.find((s) => f >= s.start && f < s.end) ?? SCENES[SCENES.length - 1];
  const id = cur.id;
  const panelled = id !== "intro" && id !== "outro";
  const rect = panelled ? panelRect(id, f, easeMorph) : null;
  const lf = f - cur.start;
  // light sweep across the panel while it morphs in
  const sweep = panelled && lf < MORPH + 8 ? lf / (MORPH + 8) : -1;
  const Content = panelled ? CONTENTS[id as Panelled] : null;
  const side = panelled ? SIDE[id as Panelled] : null;

  return (
    <AbsoluteFill style={{ background: T.bg, fontFamily: T.font }}>
      <Background frame={f} />
      {id === "intro" ? <Intro f={f} /> : null}
      {rect && Content ? (
        <GlassPanel rect={rect} content={CONTENT} sweep={sweep}>
          <div style={{ position: "absolute", inset: 0, opacity: contentAlpha(id, f) }}>
            <Content lf={lf} f={f} />
          </div>
        </GlassPanel>
      ) : null}
      {side && id !== "clinical" ? (
        <SideText
          frame={f}
          start={cur.start}
          end={cur.end}
          tool={side.tool}
          tagline={side.tagline}
          phrases={side.phrases.map(([t, at]) => ({ text: t, at: cur.start + at }))}
          icon={side.icon}
        />
      ) : null}
      {id === "clinical" ? <ClinicalSide f={f} /> : null}
      {id === "outro" ? <Outro f={f} /> : null}
      <LogoBar frame={f} dim={id === "outro" ? 1 : 0} />
      {muted ? null : <BasiraAudio />}
    </AbsoluteFill>
  );
};

/** The clinical scene's title is Arabic (no tool name), with the training disclaimer. */
const ClinicalSide: React.FC<{ f: number }> = ({ f }) => {
  const s = scene("clinical");
  return (
    <SideText
      frame={f}
      start={s.start}
      end={s.end}
      tool={text.clinical.tool}
      tagline={text.clinical.main}
      phrases={[]}
      icon={<Stethoscope {...ICON} />}
    />
  );
};

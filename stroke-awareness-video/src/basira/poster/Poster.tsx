import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Background } from "../components/Frame";
import { Brain, Cards, Chat, Check, Code, Notebook, Palette, Search, Stethoscope } from "../components/Icons";
import { T } from "../theme";
import content from "./poster.json";

/**
 * «دليلك لأدوات الذكاء الاصطناعي في الطب» — two-page poster (1080×1920) built from the
 * video's design system: same background, colours, IBM Plex Sans Arabic, glass cards,
 * icons and logos. Edit the text in poster.json.
 */

const ICONS: Record<string, React.FC<{ size?: number; color?: string; stroke?: number }>> = {
  chat: Chat,
  code: Code,
  notebook: Notebook,
  search: Search,
  cards: Cards,
  palette: Palette,
  brain: Brain,
  check: Check,
  stethoscope: Stethoscope,
};

const glass: React.CSSProperties = {
  borderRadius: 26,
  background: "linear-gradient(160deg, rgba(255,255,255,0.09), rgba(255,255,255,0.03))",
  border: `1.5px solid ${T.border}`,
  boxShadow: "0 24px 60px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 34px rgba(0,217,255,0.08)",
};

const Plate: React.FC<{ src: string; w: number; h: number }> = ({ src, w, h }) => (
  <div style={{ width: w, height: h, background: "#FFFFFF", borderRadius: 16, padding: "6px 12px", boxSizing: "border-box", boxShadow: "0 8px 22px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,217,255,0.25)" }}>
    <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
  </div>
);

const LogoRow: React.FC = () => (
  <div style={{ position: "absolute", top: 56, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 36 }}>
    <Plate src="basira/logos/student-council.png" w={136} h={98} />
    <Plate src="basira/logos/college-of-medicine.png" w={164} h={98} />
    <Plate src="basira/logos/basira-club.png" w={136} h={98} />
  </div>
);

const Header: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div dir="rtl" style={{ position: "absolute", top: 196, left: 60, right: 60, textAlign: "center" }}>
    <div style={{ fontSize: 60, fontWeight: 700, color: T.white, lineHeight: 1.35, textShadow: "0 0 40px rgba(0,217,255,0.35)" }}>{title}</div>
    <div style={{ marginTop: 10, fontSize: 34, fontWeight: 600, color: T.cyan }}>{subtitle}</div>
    <div style={{ margin: "22px auto 0", width: 220, height: 4, borderRadius: 2, background: `linear-gradient(90deg, rgba(0,217,255,0), ${T.cyan}, rgba(0,217,255,0))` }} />
  </div>
);

/** Highlights [placeholders] in cyan inside a prompt. */
const PromptText: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text.split(/(\[[^\]]+\])/).map((part, i) =>
      part.startsWith("[") ? (
        <span key={i} style={{ color: T.bg, background: T.cyan, borderRadius: 8, padding: "0 8px", margin: "0 2px" }}>
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      ),
    )}
  </>
);

// ----------------------------------------------------------------- page 1
export const PosterTools: React.FC = () => (
  <AbsoluteFill style={{ background: T.bg, fontFamily: T.font }}>
    <Background frame={40} />
    <LogoRow />
    <Header title={content.title} subtitle={content.subtitle} />
    <div
      dir="rtl"
      style={{
        position: "absolute",
        top: 420,
        left: 50,
        right: 50,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridAutoRows: "auto",
        gap: 26,
      }}
    >
      {content.sections.map((sec) => {
        const Icon = ICONS[sec.icon];
        return (
          <div key={sec.tool} style={{ ...glass, padding: "24px 26px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 62, height: 62, borderRadius: 16, background: "rgba(0,217,255,0.12)", border: `1.5px solid ${T.cyan}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={38} color={T.cyan} stroke={2} />
              </div>
              <span dir="ltr" style={{ fontSize: sec.tool.length > 14 ? 28 : 33, fontWeight: 700, color: T.white, whiteSpace: "nowrap" }}>
                {sec.tool}
              </span>
            </div>
            <div style={{ marginTop: 12, fontSize: 36, fontWeight: 700, color: T.cyan }}>{sec.title}</div>
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 9 }}>
              {sec.uses.map((u) => (
                <div key={u} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ width: 11, height: 11, marginTop: 16, borderRadius: 3, background: T.teal, transform: "rotate(45deg)", flexShrink: 0 }} />
                  <span style={{ fontSize: 29, fontWeight: 500, color: T.text, lineHeight: 1.45 }}>{u}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
    <div dir="rtl" style={{ position: "absolute", bottom: 60, left: 60, right: 60, textAlign: "center" }}>
      <div style={{ fontSize: 28, fontWeight: 600, color: T.muted }}>{content.page1Footer} ←</div>
      <div style={{ marginTop: 10, fontSize: 32, fontWeight: 700, color: T.white }}>{content.club}</div>
    </div>
  </AbsoluteFill>
);

// ----------------------------------------------------------------- page 2
export const PosterPrompts: React.FC = () => (
  <AbsoluteFill style={{ background: T.bg, fontFamily: T.font }}>
    <Background frame={90} />
    <LogoRow />
    <Header title={content.promptsTitle} subtitle={content.promptsSubtitle} />
    <div dir="rtl" style={{ position: "absolute", top: 410, left: 60, right: 60, display: "flex", flexDirection: "column", gap: 30 }}>
      {content.prompts.map((p) => {
        const Icon = ICONS[p.icon];
        return (
          <div key={p.label} style={{ ...glass, padding: "28px 34px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 66, height: 66, borderRadius: 18, background: "rgba(0,217,255,0.12)", border: `1.5px solid ${T.cyan}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={40} color={T.cyan} stroke={2} />
              </div>
              <span style={{ fontSize: 40, fontWeight: 700, color: T.cyan }}>{p.label}</span>
            </div>
            <div style={{ marginTop: 18, padding: "20px 24px", borderRadius: 18, background: "rgba(4,12,24,0.65)", border: "1px solid rgba(0,217,255,0.25)", fontSize: 36, fontWeight: 500, lineHeight: 1.65, color: T.white }}>
              «<PromptText text={p.text} />»
            </div>
          </div>
        );
      })}
      <div style={{ ...glass, border: `2px solid ${T.warn}`, background: "linear-gradient(160deg, rgba(255,181,71,0.14), rgba(255,255,255,0.03))", padding: "28px 34px", marginTop: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width={58} height={58} viewBox="0 0 24 24" fill="none" stroke={T.warn} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z" />
            <path d="M12 8v5M12 16.5v.5" />
          </svg>
          <span style={{ fontSize: 40, fontWeight: 700, color: T.warn }}>{content.responsibleTitle}</span>
        </div>
        <div style={{ marginTop: 16, fontSize: 34, fontWeight: 600, lineHeight: 1.65, color: T.white }}>{content.responsible}</div>
      </div>
    </div>
    <div dir="rtl" style={{ position: "absolute", bottom: 60, left: 60, right: 60, textAlign: "center", fontSize: 32, fontWeight: 700, color: T.white }}>
      {content.club}
    </div>
  </AbsoluteFill>
);

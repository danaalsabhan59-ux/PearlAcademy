import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { pop, ramp, Rect, T } from "../theme";

// ------------------------------------------------------------ background
/** Navy background: faint grid, two drifting light orbs and floating particles (parallax). */
export const Background: React.FC<{ frame: number }> = ({ frame }) => {
  const t = frame / 30;
  const particles = Array.from({ length: 36 }, (_, i) => {
    const depth = 0.3 + ((i * 37) % 10) / 14;
    const x = ((i * 211 + t * 18 * depth) % 1960) - 20;
    const y = ((i * 137) % 1080) + Math.sin(t * 0.6 + i) * 12 * depth;
    return (
      <circle
        key={i}
        cx={x}
        cy={y}
        r={1 + depth * 1.6}
        fill={i % 3 ? T.cyan : T.teal}
        opacity={0.12 + 0.25 * depth}
      />
    );
  });
  return (
    <AbsoluteFill style={{ background: T.bg }}>
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,217,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(0,217,255,0.045) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          backgroundPosition: `${-t * 6}px ${-t * 3}px`,
          maskImage:
            "radial-gradient(ellipse at 50% 55%, black 30%, transparent 80%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          left: 1100 + Math.sin(t * 0.3) * 80,
          top: 200 + Math.cos(t * 0.25) * 60,
          background:
            "radial-gradient(circle, rgba(0,217,255,0.16) 0%, rgba(0,217,255,0) 65%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          left: -150 + Math.cos(t * 0.27) * 70,
          top: 380 + Math.sin(t * 0.33) * 50,
          background:
            "radial-gradient(circle, rgba(25,214,197,0.12) 0%, rgba(25,214,197,0) 65%)",
        }}
      />
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0 }}
      >
        {particles}
      </svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------- logo bar
const LOGOS = {
  // RTL order: Basira (right), College of Medicine (centre), Student Council (left).
  right: { src: "basira/logos/basira-club.png", alt: "نادي بصيرة" },
  center: {
    src: "basira/logos/college-of-medicine.png",
    alt: "كلية الطب — جامعة المجمعة",
  },
  left: {
    src: "basira/logos/student-council.png",
    alt: "المجلس الطلابي — كلية الطب",
  },
};

const Plate: React.FC<{ src: string; alt: string; w: number; h: number }> = ({
  src,
  alt,
  w,
  h,
}) => (
  <div
    style={{
      width: w,
      height: h,
      background: "#FFFFFF",
      borderRadius: 18,
      padding: "6px 14px",
      boxSizing: "border-box",
      boxShadow: "0 8px 24px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,217,255,0.25)",
    }}
  >
    <Img
      src={staticFile(src)}
      alt={alt}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        display: "block",
      }}
    />
  </div>
);

/** The persistent top bar with the three official logos (original files, unaltered). */
export const LogoBar: React.FC<{ frame: number; dim?: number }> = ({
  frame,
  dim = 0,
}) => {
  const enter = pop(frame, 4, 16, 120);
  return (
    <div
      style={{
        position: "absolute",
        top: 22,
        left: 70,
        right: 70,
        height: 116,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        opacity: enter * (1 - 0.35 * dim),
        transform: `translateY(${(1 - enter) * -30}px)`,
        zIndex: 50,
      }}
    >
      <Plate {...LOGOS.left} w={168} h={112} />
      <Plate {...LOGOS.center} w={196} h={112} />
      <Plate {...LOGOS.right} w={168} h={112} />
      <div
        style={{
          position: "absolute",
          left: 170,
          right: 170,
          top: 57,
          height: 1,
          background:
            "linear-gradient(90deg, rgba(0,217,255,0), rgba(0,217,255,0.35), rgba(0,217,255,0))",
          zIndex: -1,
        }}
      />
    </div>
  );
};

// --------------------------------------------------------- glass panel
/** Glass UI panel at an animated rect; children are laid out for (cw × ch) and scaled to fit. */
export const GlassPanel: React.FC<{
  rect: Rect;
  content: { w: number; h: number };
  sweep?: number;
  opacity?: number;
  children?: React.ReactNode;
}> = ({ rect, content, sweep = -1, opacity = 1, children }) => {
  const s = Math.min(rect.w / content.w, rect.h / content.h);
  return (
    <div
      style={{
        position: "absolute",
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h,
        borderRadius: 28,
        background:
          "linear-gradient(160deg, rgba(255,255,255,0.09), rgba(255,255,255,0.03))",
        border: `1.5px solid ${T.border}`,
        boxShadow:
          "0 30px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 40px rgba(0,217,255,0.10)",
        backdropFilter: "blur(14px)",
        overflow: "hidden",
        opacity,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: (rect.w - content.w * s) / 2,
          top: (rect.h - content.h * s) / 2,
          width: content.w,
          height: content.h,
          transform: `scale(${s})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
      {sweep >= 0 && sweep <= 1 ? (
        <div
          style={{
            position: "absolute",
            top: -40,
            bottom: -40,
            width: 160,
            left: -200 + sweep * (rect.w + 400),
            transform: "skewX(-18deg)",
            background:
              "linear-gradient(90deg, rgba(0,217,255,0), rgba(0,217,255,0.28), rgba(255,255,255,0.35), rgba(0,217,255,0))",
          }}
        />
      ) : null}
    </div>
  );
};

/** Small glass card used inside panels. */
export const Card: React.FC<{
  style?: React.CSSProperties;
  children?: React.ReactNode;
  glow?: number;
}> = ({ style, children, glow = 0 }) => (
  <div
    style={{
      position: "absolute",
      borderRadius: 20,
      background: "rgba(255,255,255,0.07)",
      border: `1.5px solid rgba(0,217,255,${0.25 + 0.5 * glow})`,
      boxShadow: `0 16px 40px rgba(0,0,0,0.35), 0 0 ${24 * glow}px rgba(0,217,255,${0.45 * glow})`,
      color: T.text,
      fontFamily: T.font,
      ...style,
    }}
  >
    {children}
  </div>
);

// ------------------------------------------------------ kinetic text
/**
 * Arabic kinetic typography: animates whole words (never letters, so joining
 * is preserved) inside an RTL container. Latin words are isolated with <bdi>.
 */
export const Kinetic: React.FC<{
  text: string;
  frame: number;
  start: number;
  size: number;
  weight?: number;
  color?: string;
  stagger?: number;
  style?: React.CSSProperties;
}> = ({
  text,
  frame,
  start,
  size,
  weight = 700,
  color = T.white,
  stagger = 3,
  style,
}) => {
  const words = text.split(" ");
  return (
    <div
      dir="rtl"
      lang="ar"
      style={{
        fontFamily: T.font,
        fontSize: size,
        fontWeight: weight,
        color,
        lineHeight: 1.45,
        ...style,
      }}
    >
      {words.map((w, i) => {
        const p = pop(frame, start + i * stagger, 15, 170);
        const latin = /^[A-Za-z0-9+.]+$/.test(w);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: Math.min(1, p * 1.4),
              transform: `translateY(${(1 - p) * 0.55 * size}px)`,
              filter: `blur(${(1 - Math.min(1, p)) * 6}px)`,
              marginLeft: i < words.length - 1 ? size * 0.26 : 0,
            }}
          >
            {latin ? <bdi dir="ltr">{w}</bdi> : w}
          </span>
        );
      })}
    </div>
  );
};

// --------------------------------------------------- side text column
/** Right-hand column: tool name chip, Arabic tagline and up to three phrases. */
export const SideText: React.FC<{
  frame: number;
  start: number;
  end: number;
  tool: string;
  tagline: string;
  phrases: { text: string; at: number }[];
  icon?: React.ReactNode;
}> = ({ frame, start, end, tool, tagline, phrases, icon }) => {
  const out = ramp(frame, end - 10, 10);
  const chip = pop(frame, start + 2, 14, 160);
  const active = phrases.reduce((acc, p, i) => (frame >= p.at ? i : acc), -1);
  return (
    <div
      style={{
        position: "absolute",
        right: 90,
        top: 210,
        width: 740,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 22,
        opacity: 1 - out,
        transform: `translateX(${out * 60}px)`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "12px 26px",
          borderRadius: 999,
          background: "rgba(0,217,255,0.10)",
          border: `1.5px solid ${T.cyan}`,
          boxShadow: "0 0 28px rgba(0,217,255,0.25)",
          opacity: chip,
          transform: `scale(${0.7 + 0.3 * chip})`,
          transformOrigin: "right center",
        }}
      >
        <span
          dir="auto"
          style={{
            fontFamily: T.font,
            fontWeight: 700,
            fontSize: 40,
            color: T.white,
            letterSpacing: 0.5,
          }}
        >
          {tool}
        </span>
        {icon}
      </div>
      <Kinetic
        text={tagline}
        frame={frame}
        start={start + 8}
        size={62}
        color={T.white}
        style={{ textAlign: "right" }}
      />
      <div
        style={{
          position: "relative",
          height: 70,
          width: "100%",
          marginTop: 8,
        }}
      >
        {phrases.map((p, i) => {
          const a = pop(frame, p.at, 16, 150);
          const on = i === active;
          return (
            <div
              key={p.text}
              dir="rtl"
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                display: "flex",
                alignItems: "center",
                gap: 18,
                // only the active phrase is shown, so at most three short lines are on screen
                opacity: on ? Math.min(1, a * 1.3) : 0,
                transform: `translateX(${(1 - a) * 50}px)`,
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 4,
                  background: on ? T.cyan : T.teal,
                  boxShadow: on ? `0 0 16px ${T.cyan}` : "none",
                  transform: "rotate(45deg)",
                }}
              />
              <span
                style={{
                  fontFamily: T.font,
                  fontWeight: 600,
                  fontSize: 44,
                  color: T.cyan,
                  whiteSpace: "nowrap",
                }}
              >
                {p.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------- typewriter
const segmenter = new Intl.Segmenter("ar", { granularity: "grapheme" });
const graphemes = (s: string) => Array.from(segmenter.segment(s), (g) => g.segment);

/**
 * Letter-by-letter reveal for Arabic. Splits on grapheme clusters so diacritics
 * (e.g. shadda) stay with their letter; the visible prefix is one text run, so the
 * browser shapes and joins the letters exactly as typed text would look.
 */
export const Typewriter: React.FC<{
  text: string;
  frame: number;
  start: number;
  perFrame?: number;
  caret?: boolean;
  style?: React.CSSProperties;
}> = ({ text, frame, start, perFrame = 1.5, caret = true, style }) => {
  const g = graphemes(text);
  const n = Math.max(0, Math.min(g.length, Math.floor((frame - start) * perFrame)));
  const typing = n > 0 && n < g.length;
  return (
    <span dir="rtl" style={style}>
      {g.slice(0, n).join("")}
      {caret && typing && Math.floor(frame / 5) % 2 === 0 ? <span style={{ color: T.cyan }}>▍</span> : null}
    </span>
  );
};

export const typedDone = (text: string, start: number, perFrame = 1.5) => start + Math.ceil(graphemes(text).length / perFrame);

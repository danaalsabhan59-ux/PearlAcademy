import React from "react";
import { Img, staticFile } from "remotion";
import { GlassPanel, Kinetic } from "../components/Frame";
import { CONTENT } from "../data/layout";
import { pop, ramp, Rect, T } from "../theme";
import { Entry, V } from "./layoutV";

const Plate: React.FC<{ src: string; alt: string; w: number }> = ({ src, alt, w }) => (
  <div
    style={{
      width: w,
      height: V.logoBar.h,
      background: "#FFFFFF",
      borderRadius: 14,
      padding: "5px 10px",
      boxSizing: "border-box",
      boxShadow: "0 6px 18px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,217,255,0.25)",
    }}
  >
    <Img src={staticFile(src)} alt={alt} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
  </div>
);

/** Small, tidy logo bar: Basira (right), College of Medicine (centre), Student Council (left). */
export const LogoBarV: React.FC<{ frame: number; dim?: number }> = ({ frame, dim = 0 }) => {
  const a = pop(frame, 4, 16, 120);
  return (
    <div
      style={{
        position: "absolute",
        top: V.logoBar.top,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        gap: 34,
        opacity: a * (1 - 0.4 * dim),
        transform: `translateY(${(1 - a) * -24}px)`,
        zIndex: 50,
      }}
    >
      <Plate src="basira/logos/student-council.png" alt="المجلس الطلابي — كلية الطب" w={120} />
      <Plate src="basira/logos/college-of-medicine.png" alt="كلية الطب — جامعة المجمعة" w={146} />
      <Plate src="basira/logos/basira-club.png" alt="نادي بصيرة" w={120} />
    </div>
  );
};

/** Tool name (large, letter reveal for Latin names) + short Arabic tagline. */
export const ToolHeader: React.FC<{
  frame: number;
  start: number;
  end: number;
  tool: string;
  tagline: string;
  icon: React.ReactNode;
}> = ({ frame, start, end, tool, tagline, icon }) => {
  const out = ramp(frame, end - 10, 10);
  const chip = pop(frame, start + 2, 13, 170);
  const latin = /^[A-Za-z0-9 +.·]+$/.test(tool);
  const letters = latin ? Array.from(tool) : null;
  return (
    <div style={{ position: "absolute", top: V.header.chipTop, left: 40, right: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, opacity: 1 - out, transform: `translateY(${-out * 30}px)` }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "10px 30px",
          borderRadius: 999,
          background: "rgba(0,217,255,0.12)",
          border: `2px solid ${T.cyan}`,
          boxShadow: `0 0 ${30 + 10 * Math.sin(frame / 8)}px rgba(0,217,255,0.35)`,
          transform: `scale(${0.6 + 0.4 * chip})`,
          opacity: Math.min(1, chip * 1.5),
        }}
      >
        {icon}
        {letters ? (
          <span dir="ltr" style={{ fontFamily: T.font, fontWeight: 700, fontSize: 58, color: T.white, whiteSpace: "nowrap" }}>
            {letters.map((ch, i) => {
              const p = ramp(frame, start + 4 + i * 1.2, 6);
              return (
                <span key={i} style={{ display: "inline-block", opacity: p, transform: `translateY(${(1 - p) * 18}px)`, whiteSpace: "pre" }}>
                  {ch}
                </span>
              );
            })}
          </span>
        ) : (
          <span dir="rtl" style={{ fontFamily: T.font, fontWeight: 700, fontSize: 44, color: T.white, whiteSpace: "nowrap" }}>
            {tool}
          </span>
        )}
      </div>
      <Kinetic text={tagline} frame={frame} start={start + 10} size={52} color={T.white} style={{ textAlign: "center" }} />
    </div>
  );
};

/** Bottom benefit pill: one short benefit at a time, with progress dots. */
export const Benefit: React.FC<{ frame: number; end: number; phrases: { text: string; at: number }[] }> = ({ frame, end, phrases }) => {
  if (phrases.length === 0) return null;
  const active = phrases.reduce((acc, p, i) => (frame >= p.at ? i : acc), -1);
  if (active < 0) return null;
  const p = phrases[active];
  const a = pop(frame, p.at, 14, 170);
  const out = ramp(frame, end - 10, 10);
  return (
    <div style={{ position: "absolute", top: V.benefits.top, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: 1 - out }}>
      <div
        key={active}
        dir="rtl"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          maxWidth: 840,
          padding: "16px 34px",
          borderRadius: 26,
          background: "rgba(0,217,255,0.10)",
          border: `1.5px solid ${T.border}`,
          boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
          opacity: Math.min(1, a * 1.4),
          transform: `translateY(${(1 - a) * 40}px) scale(${0.9 + 0.1 * a})`,
        }}
      >
        <div style={{ width: 18, height: 18, borderRadius: 5, background: T.cyan, boxShadow: `0 0 16px ${T.cyan}`, transform: "rotate(45deg)", flexShrink: 0 }} />
        <span style={{ fontFamily: T.font, fontWeight: 700, fontSize: 46, color: T.white, whiteSpace: "nowrap" }}>{p.text}</span>
      </div>
      {phrases.length > 1 ? (
        <div style={{ display: "flex", gap: 12, direction: "rtl" }}>
          {phrases.map((_, i) => (
            <div key={i} style={{ width: i === active ? 34 : 12, height: 12, borderRadius: 6, background: i <= active ? T.cyan : "rgba(255,255,255,0.25)" }} />
          ))}
        </div>
      ) : null}
    </div>
  );
};

/** The shared glass panel with a per-tool entry style (morph / 3D flip / iris / zoom-through). */
export const PanelV: React.FC<{ rect: Rect; entry: Entry; tin: number; sweep: number; children: React.ReactNode }> = ({
  rect,
  entry,
  tin,
  sweep,
  children,
}) => {
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  let style: React.CSSProperties = {};
  if (entry === "flip") {
    style = { transform: `perspective(1800px) rotateY(${(1 - tin) * -85}deg)`, transformOrigin: `${cx}px ${cy}px` };
  } else if (entry === "iris") {
    style = { clipPath: tin < 1 ? `circle(${tin * 110}% at ${cx}px ${cy}px)` : undefined };
  } else if (entry === "zoom") {
    style = { transform: `scale(${1 + (1 - tin) * 0.35})`, transformOrigin: `${cx}px ${cy}px`, filter: tin < 1 ? `blur(${(1 - tin) * 10}px)` : undefined, opacity: 0.2 + 0.8 * tin };
  }
  return (
    <div style={{ position: "absolute", inset: 0, ...style }}>
      <GlassPanel rect={rect} content={CONTENT} sweep={sweep}>
        {children}
      </GlassPanel>
    </div>
  );
};

/** Safe-zone guides for review (off in renders): platform UI areas shaded red. */
export const SafeZonesV: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 99 }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 140, background: "rgba(255,0,0,0.22)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: V.safeBottom, bottom: 0, background: "rgba(255,0,0,0.22)" }} />
    <div style={{ position: "absolute", right: 0, top: 880, width: 100, height: 700, background: "rgba(255,0,0,0.22)" }} />
  </div>
);

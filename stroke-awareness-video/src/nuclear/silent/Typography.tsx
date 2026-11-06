import React from "react";
import { C, FONT, ramp } from "../theme";
import { CARDS, SSCENES } from "./timeline";

/**
 * Cinematic reading layer: one statement at a time, large and centred in the upper third,
 * revealed word by word (whole words — Arabic letters stay joined), amber highlights,
 * a soft scrim so it reads over any 3D shot.
 */
const TOP = 250;
/** Split into words; a word is highlighted if any of its letters sits between *asterisks*. */
const parse = (t: string) => {
  const out: { w: string; hl: boolean }[] = [];
  let on = false;
  for (const raw of t.split(" ")) {
    let w = "";
    let hl = false;
    for (const ch of raw) {
      if (ch === "*") on = !on;
      else {
        w += ch;
        if (on) hl = true;
      }
    }
    out.push({ w, hl });
  }
  return out;
};

export const Typography: React.FC<{ f: number }> = ({ f }) => {
  const card = CARDS.find((c) => !c.own && f >= c.f0 - 2 && f < c.f1);
  const len = card ? card.text.replace(/\*/g, "").length : 0;
  const size = card ? (card.big ? 96 : len <= 24 ? 86 : len <= 36 ? 74 : 64) : 0;
  const scrim = Math.max(...CARDS.filter((c) => !c.own).map((c) => Math.min(ramp(f, c.f0 - 10, 14), 1 - ramp(f, c.f1 - 4, 14))), 0);
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 140, height: 640, background: "linear-gradient(180deg, rgba(8,24,39,0.82) 0%, rgba(8,24,39,0.55) 55%, rgba(8,24,39,0) 100%)", opacity: scrim, pointerEvents: "none", zIndex: 790 }} />
      {card ? <CardText key={card.id} f={f} f0={card.f0} f1={card.f1} words={parse(card.text)} size={size} big={!!card.big} /> : null}
    </>
  );
};

const CardText: React.FC<{ f: number; f0: number; f1: number; words: { w: string; hl: boolean }[]; size: number; big: boolean }> = ({ f, f0, f1, words, size, big }) => {
  const out = ramp(f, f1 - 9, 9);
  const rule = ramp(f, f0 + words.length * 3 + 4, 16);
  return (
    <div style={{ position: "absolute", top: TOP, left: 56, right: 56, display: "flex", flexDirection: "column", alignItems: "center", zIndex: 800, opacity: 1 - out, transform: `translateY(${-out * 16}px)`, filter: out > 0 ? `blur(${out * 6}px)` : undefined }}>
      <div dir="rtl" style={{ fontFamily: FONT, fontWeight: 700, fontSize: size, lineHeight: 1.38, color: C.white, textAlign: "center", textShadow: "0 6px 30px rgba(0,0,0,0.65)", maxWidth: 968 }}>
        {words.map((t, i) => {
          const p = ramp(f, f0 + i * 3, 12);
          return (
            <span key={i} style={{ display: "inline-block", whiteSpace: "pre", color: t.hl ? C.amber : C.white, opacity: p, transform: `translateY(${(1 - p) * 26}px)`, filter: p < 1 ? `blur(${(1 - p) * 8}px)` : undefined }}>
              {t.w}
              {i < words.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
      {big ? <div style={{ marginTop: 22, height: 4, width: 220 * rule, borderRadius: 2, background: `linear-gradient(90deg, ${C.cyan}, ${C.amber})` }} /> : null}
    </div>
  );
};

/** Small chapter marker «٠٣ · الانتقال» under the header, top-left; changes with each scene. */
const AR = ["٠١", "٠٢", "٠٣", "٠٤", "٠٥", "٠٦", "٠٧"];
export const Chapter: React.FC<{ f: number }> = ({ f }) => {
  const i = SSCENES.findIndex((s) => f >= s.start && f < s.end);
  if (i < 0) return null;
  const s = SSCENES[i];
  const a = Math.min(ramp(f, s.start + 8, 14), 1 - ramp(f, s.end - 10, 10));
  return (
    <div dir="rtl" style={{ position: "absolute", top: 166, left: 34, zIndex: 950, opacity: a, display: "flex", alignItems: "center", gap: 10, fontFamily: FONT }}>
      <span style={{ fontWeight: 700, fontSize: 26, color: C.amber }}>{AR[i]}</span>
      <span style={{ width: 26 * a, height: 2, background: C.amber, display: "inline-block" }} />
      <span style={{ fontWeight: 600, fontSize: 26, color: C.white }}>{s.chapter}</span>
    </div>
  );
};

/** Subtle animated film grain (deterministic per frame). */
export const Grain: React.FC<{ f: number }> = ({ f }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, zIndex: 870, opacity: 0.07, mixBlendMode: "overlay", pointerEvents: "none" }}>
    <filter id="grainF">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f % 24} stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#grainF)" />
  </svg>
);

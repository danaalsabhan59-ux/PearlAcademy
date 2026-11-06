import React from "react";
import { Img, staticFile } from "remotion";
import text from "../data/text.json";
import { scene } from "../data/timeline";
import { Card, Kinetic, Typewriter } from "../components/Frame";
import { Calendar, Check, Doc, HeartPulse, Notebook, Palette, Play, Search, Stethoscope, User } from "../components/Icons";
import { lerp, pop, ramp, T } from "../theme";

const AR: React.CSSProperties = { fontFamily: T.font, direction: "rtl" };
const Skel: React.FC<{ w: number | string; h?: number; o?: number; c?: string; style?: React.CSSProperties }> = ({ w, h = 12, o = 0.3, c = "#ffffff", style }) => (
  <div style={{ width: w, height: h, borderRadius: h / 2, background: c, opacity: o, ...style }} />
);

// ============================================================== NOTEBOOKLM
const MAP_C = { x: 480, y: 640 };
const MAP_NODES = [
  { x: 800, y: 560 },
  { x: 800, y: 730 },
  { x: 160, y: 560 },
  { x: 160, y: 730 },
];
export const NotebookContent: React.FC<{ lf: number; f: number }> = ({ lf, f }) => {
  const t = text.notebooklm;
  const s0 = scene("notebooklm").start;
  const absorb = ramp(lf, 50, 12);
  const mapIn = ramp(lf, 140, 30);
  const fileStart = (i: number) => ({ x: 80 + i * 290, y: 60 });
  const ws = { x: 330, y: 150, w: 300, h: 150 };
  return (
    <div style={{ position: "absolute", inset: 0, ...AR }}>
      {/* workspace */}
      <Card glow={absorb * (1 - ramp(lf, 70, 20))} style={{ left: ws.x, top: ws.y, width: ws.w, height: ws.h, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, opacity: ramp(lf, 14, 10) }}>
        <Notebook size={50} color={T.cyan} />
        <span style={{ fontSize: 30, fontWeight: 700, color: T.white }}>{t.workspace}</span>
      </Card>
      {/* a PDF opens: the page unfolds and its key lines get highlighted */}
      {lf < 40 ? (
        <div
          style={{
            position: "absolute",
            left: 250,
            top: 90,
            width: 460,
            height: 560,
            borderRadius: 18,
            background: "#f4f8fc",
            boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
            transformOrigin: "top center",
            transform: `perspective(1200px) rotateX(${(1 - ramp(lf, 2, 14)) * -75}deg) scale(${1 - 0.7 * ramp(lf, 28, 10)})`,
            opacity: ramp(lf, 2, 6) * (1 - ramp(lf, 32, 8)),
            padding: "26px 30px",
            boxSizing: "border-box",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
            <div dir="ltr" style={{ fontSize: 20, fontWeight: 700, color: "#fff", background: T.bad, borderRadius: 6, padding: "2px 8px" }}>
              PDF
            </div>
            <span style={{ fontSize: 28, fontWeight: 700, color: T.bg }}>{t.files[0]}</span>
          </div>
          {Array.from({ length: 9 }, (_, k) => {
            const hl = [1, 4, 6].includes(k) ? ramp(lf, 14 + k * 1.5, 8) : 0;
            return (
              <div key={k} style={{ position: "relative", height: 16, marginBottom: 22, width: `${92 - (k % 3) * 14}%` }}>
                <div style={{ position: "absolute", inset: 0, borderRadius: 8, background: "#c9d6e3" }} />
                <div style={{ position: "absolute", top: -6, bottom: -6, right: 0, width: `${hl * 100}%`, borderRadius: 6, background: "rgba(0,217,255,0.45)" }} />
              </div>
            );
          })}
        </div>
      ) : null}
      {/* PDFs fly into the workspace */}
      {t.files.map((name, i) => {
        const a = pop(f, s0 + 10 + i * 6, 15, 150);
        const fly = ramp(lf, 34 + i * 5, 18);
        const st = fileStart(i);
        const x = lerp(st.x, ws.x + 110, fly);
        const y = lerp(st.y - 40 + (1 - Math.min(1, a)) * -40, ws.y + 40, fly);
        return (
          <Card key={name} style={{ left: x, top: y, width: 220 * (1 - 0.6 * fly), height: 70 * (1 - 0.6 * fly), display: "flex", alignItems: "center", gap: 10, padding: "0 14px", opacity: Math.min(1, a) * (1 - ramp(lf, 50 + i * 5, 6)), overflow: "hidden" }}>
            <div dir="ltr" style={{ fontSize: 18, fontWeight: 700, color: "#fff", background: T.bad, borderRadius: 6, padding: "2px 6px" }}>
              PDF
            </div>
            <span style={{ fontSize: 24, fontWeight: 600, color: T.white, whiteSpace: "nowrap" }}>{name}</span>
          </Card>
        );
      })}
      {/* three outputs */}
      {t.outputs.map((name, i) => {
        const a = pop(f, s0 + 66 + i * 12, 15, 150);
        const x = 650 - i * 310;
        const shrink = mapIn;
        return (
          <Card key={name} style={{ left: x, top: lerp(350, 330, shrink), width: 280, height: lerp(250, 150, shrink), padding: "20px 22px", opacity: Math.min(1, a), transform: `translateY(${(1 - Math.min(1, a)) * 50}px)`, overflow: "hidden" }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: T.cyan, marginBottom: 16, whiteSpace: "nowrap" }}>{name}</div>
            {i === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, opacity: 1 - shrink }}>
                <Skel w="90%" />
                <Skel w="70%" />
                <Skel w="80%" />
                <Skel w="55%" />
              </div>
            ) : null}
            {i === 1 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, opacity: 1 - shrink }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Skel w={150} />
                  <span dir="ltr" style={{ fontSize: 18, fontWeight: 700, color: T.bg, background: T.teal, borderRadius: 6, padding: "0 6px" }}>
                    1
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Skel w={120} />
                  <span dir="ltr" style={{ fontSize: 18, fontWeight: 700, color: T.bg, background: T.teal, borderRadius: 6, padding: "0 6px" }}>
                    2
                  </span>
                </div>
              </div>
            ) : null}
            {i === 2 ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Play size={34} color={T.cyan} />
                <svg width={180} height={60}>
                  {Array.from({ length: 22 }, (_, k) => {
                    const h = 8 + 44 * Math.abs(Math.sin(lf / 4 + k * 0.7) * Math.sin(k * 1.3 + 1));
                    return <rect key={k} x={k * 8} y={30 - h / 2} width={5} height={h} rx={2} fill={k % 2 ? T.teal : T.cyan} />;
                  })}
                </svg>
              </div>
            ) : null}
          </Card>
        );
      })}
      {/* simple knowledge map: lines meet the node centres */}
      {mapIn > 0 ? (
        <>
          <svg width={960} height={800} style={{ position: "absolute", left: 0, top: 0, opacity: mapIn }}>
            {MAP_NODES.map((p, k) => {
              const d = ramp(lf, 146 + k * 6, 16);
              return <line key={k} x1={MAP_C.x} y1={MAP_C.y} x2={lerp(MAP_C.x, p.x, d)} y2={lerp(MAP_C.y, p.y, d)} stroke={T.cyan} strokeWidth={3} opacity={0.75} />;
            })}
          </svg>
          {t.mapNodes.map((n, k) => {
            const a2 = pop(f, s0 + 156 + k * 6, 14, 160);
            const p = MAP_NODES[k];
            return (
              <div key={n} style={{ position: "absolute", left: p.x - 110, top: p.y - 30, width: 220, height: 60, borderRadius: 30, border: `1.5px solid ${T.teal}`, background: "#0b2236", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 600, color: T.white, opacity: Math.min(1, a2), transform: `scale(${0.6 + 0.4 * Math.min(1, a2)})` }}>
                {n}
              </div>
            );
          })}
          <div style={{ position: "absolute", left: MAP_C.x - 130, top: MAP_C.y - 36, width: 260, height: 72, borderRadius: 36, background: T.cyan, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 700, color: T.bg, opacity: mapIn, transform: `scale(${0.7 + 0.3 * mapIn})` }}>
            {t.mapCenter}
          </div>
        </>
      ) : null}
    </div>
  );
};

// ================================================================ RESEARCH
export const ResearchContent: React.FC<{ lf: number; f: number }> = ({ lf, f }) => {
  const t = text.research;
  const s0 = scene("research").start;
  const barUp = ramp(lf, 44, 14);
  const toTable = ramp(lf, 112, 26);
  const card = (i: number) => ({ x: 640 - i * 310, y: 260, w: 290, h: 300 });
  const row = (i: number) => ({ x: 40, y: 330 + i * 110, w: 880, h: 96 });
  return (
    <div style={{ position: "absolute", inset: 0, ...AR }}>
      {/* search bar */}
      <div
        style={{
          position: "absolute",
          left: 40,
          right: 40,
          top: lerp(340, 70, barUp),
          height: 110,
          borderRadius: 55,
          background: "rgba(255,255,255,0.08)",
          border: `2px solid ${T.cyan}`,
          boxShadow: "0 0 30px rgba(0,217,255,0.25)",
          display: "flex",
          alignItems: "center",
          gap: 20,
          padding: "0 34px",
        }}
      >
        <Search size={46} color={T.cyan} stroke={2.2} />
        <span style={{ fontSize: 36, fontWeight: 600, color: T.white }}>
          <Typewriter text={t.query} frame={lf} start={10} perFrame={1.4} />
        </span>
      </div>
      {/* table header */}
      <div style={{ position: "absolute", left: 40, right: 40, top: 230, height: 70, display: "flex", alignItems: "center", borderBottom: `1.5px solid ${T.cyan}`, opacity: toTable }}>
        {t.columns.map((c, i) => (
          <div key={c} style={{ flex: i === 3 ? 1.4 : 1, fontSize: 26, fontWeight: 700, color: T.cyan, padding: "0 12px" }}>
            {c}
          </div>
        ))}
      </div>
      {/* papers → table rows */}
      {[0, 1, 2].map((i) => {
        const a = pop(f, s0 + 56 + i * 8, 15, 150);
        const c = card(i);
        const r = row(i);
        const p = toTable;
        const clicked = i === 1 ? ramp(lf, 92, 4) * (1 - ramp(lf, 108, 6)) : 0;
        return (
          <Card
            key={i}
            glow={clicked}
            style={{
              left: lerp(c.x, r.x, p),
              top: lerp(c.y, r.y, p),
              width: lerp(c.w, r.w, p),
              height: lerp(c.h, r.h, p),
              opacity: Math.min(1, a),
              transform: `translateY(${(1 - Math.min(1, a)) * 60}px)`,
              overflow: "hidden",
            }}
          >
            {/* paper card view */}
            <div style={{ position: "absolute", inset: 0, padding: 24, opacity: 1 - p }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <Doc size={34} color={T.cyan} />
                <span style={{ fontSize: 26, fontWeight: 700, color: T.white }}>
                  {t.paper} {i + 1}
                </span>
              </div>
              <Skel w="90%" h={14} o={0.35} />
              <Skel w="75%" h={14} o={0.25} style={{ marginTop: 12 }} />
              <Skel w="60%" h={14} o={0.25} style={{ marginTop: 12 }} />
              <div style={{ marginTop: 24, display: "inline-block", padding: "6px 14px", borderRadius: 12, background: "rgba(25,214,197,0.16)", border: `1px solid ${T.teal}`, fontSize: 22, fontWeight: 600, color: T.teal }}>
                {t.studyTypes[i]}
              </div>
            </div>
            {/* table row view */}
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", opacity: p }}>
              <div style={{ flex: 1, padding: "0 12px", fontSize: 26, fontWeight: 700, color: T.white }}>
                {t.paper} {i + 1}
              </div>
              <div style={{ flex: 1, padding: "0 12px", fontSize: 24, fontWeight: 600, color: T.teal }}>{t.studyTypes[i]}</div>
              <div style={{ flex: 1, padding: "0 12px" }}>
                <div style={{ width: `${[45, 85, 65][i] * ramp(lf, 130 + i * 6, 20)}%`, height: 16, borderRadius: 8, background: T.cyan }} />
              </div>
              <div style={{ flex: 1.4, padding: "0 12px", display: "flex", gap: 8 }}>
                <Skel w={[120, 160, 90][i]} h={14} o={0.35} />
              </div>
            </div>
          </Card>
        );
      })}
      {/* search pointer: moves to study 2 and clicks */}
      {lf > 70 && lf < 118 ? (
        <div style={{ position: "absolute", left: lerp(820, 470, ramp(lf, 72, 18)), top: lerp(720, 420, ramp(lf, 72, 18)), opacity: Math.min(ramp(lf, 70, 4), 1 - ramp(lf, 112, 6)) }}>
          <svg width={48} height={56} viewBox="0 0 24 28" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.5))" }}>
            <path d="M3 2 L3 22 L8.5 17 L12 25 L15.5 23.5 L12 15.8 L19 15.5 Z" fill="#fff" stroke={T.bg} strokeWidth={1.2} />
          </svg>
          {lf >= 92 ? (
            <div style={{ position: "absolute", left: -26, top: -26, width: 56, height: 56, borderRadius: 28, border: `3px solid ${T.cyan}`, transform: `scale(${0.4 + ramp(lf, 92, 12) * 1.4})`, opacity: 1 - ramp(lf, 92, 12) }} />
          ) : null}
        </div>
      ) : null}
      <div style={{ position: "absolute", bottom: 28, left: 0, right: 0, textAlign: "center", fontSize: 24, fontWeight: 600, color: T.warn, opacity: ramp(lf, 60, 10) }}>
        {t.illustrative}
      </div>
    </div>
  );
};

// ============================================================== FLASHCARDS
export const FlashcardsContent: React.FC<{ lf: number; f: number }> = ({ lf }) => {
  const t = text.flashcards;
  const flip = ramp(lf, 26, 18);
  const angle = flip * 180;
  const aside = ramp(lf, 76, 18);
  const cal = ramp(lf, 84, 16);
  const curve = ramp(lf, 100, 60);
  const cardBox = { left: lerp(220, 40, aside), top: lerp(70, 60, aside), w: lerp(520, 300, aside), h: lerp(600, 340, aside) };
  return (
    <div style={{ position: "absolute", inset: 0, ...AR, perspective: 1600 }}>
      {/* stacked deck behind */}
      {[2, 1].map((k) => (
        <div key={k} style={{ position: "absolute", left: cardBox.left + k * 14, top: cardBox.top - k * 14, width: cardBox.w, height: cardBox.h, borderRadius: 24, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(0,217,255,0.2)", opacity: 0.6 }} />
      ))}
      {/* the flashcard: 3D flip */}
      <div style={{ position: "absolute", left: cardBox.left, top: cardBox.top, width: cardBox.w, height: cardBox.h, transformStyle: "preserve-3d", transform: `rotateY(${angle}deg)` }}>
        <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", borderRadius: 24, background: "linear-gradient(160deg, rgba(0,217,255,0.20), rgba(255,255,255,0.06))", border: `2px solid ${T.cyan}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 34, gap: 24 }}>
          <span style={{ fontSize: 24, fontWeight: 700, color: T.cyan }}>سؤال</span>
          <span style={{ fontSize: lerp(40, 26, aside), fontWeight: 700, color: T.white, textAlign: "center", lineHeight: 1.5 }}>{t.front}</span>
        </div>
        <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", borderRadius: 24, background: "linear-gradient(160deg, rgba(59,227,154,0.22), rgba(255,255,255,0.06))", border: `2px solid ${T.good}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 34, gap: 18 }}>
          <Check size={lerp(70, 44, aside)} color={T.good} stroke={2.6} draw={ramp(lf, 44, 10)} />
          <span style={{ fontSize: lerp(60, 38, aside), fontWeight: 700, color: T.white }}>{t.back}</span>
          <span style={{ fontSize: lerp(28, 20, aside), fontWeight: 500, color: T.text, textAlign: "center" }}>{t.backNote}</span>
        </div>
      </div>
      {/* spaced-repetition calendar */}
      {cal > 0 ? (
        <Card style={{ left: 380, top: 60, width: 540, height: 680, padding: 30, opacity: cal, transform: `translateX(${(1 - cal) * -60}px)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
            <Calendar size={42} color={T.cyan} />
            <span style={{ fontSize: 32, fontWeight: 700, color: T.white }}>{t.calendar}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10, direction: "rtl" }}>
            {Array.from({ length: 35 }, (_, d) => {
              const review = [0, 2, 6, 13, 29].includes(d);
              const idx = [0, 2, 6, 13, 29].indexOf(d);
              const lit = review && lf > 96 + idx * 10;
              return (
                <div
                  key={d}
                  style={{
                    height: 46,
                    borderRadius: 10,
                    background: lit ? T.cyan : "rgba(255,255,255,0.06)",
                    boxShadow: lit ? `0 0 16px ${T.cyan}` : "none",
                    transform: `scale(${lit ? 1 + 0.15 * Math.max(0, 1 - (lf - 96 - idx * 10) / 8) : 1})`,
                  }}
                />
              );
            })}
          </div>
          {/* memory strength: drops between reviews, resets higher each time */}
          <svg width={480} height={190} style={{ marginTop: 22, transform: "scaleX(-1)" }}>
            <path
              d="M0 20 C30 70 50 90 60 100 L60 20 C110 50 140 70 150 80 L150 20 C240 40 270 50 290 56 L290 20 C380 30 440 36 480 40"
              fill="none"
              stroke={T.teal}
              strokeWidth={4}
              strokeDasharray={900}
              strokeDashoffset={900 * (1 - curve)}
            />
            <line x1={0} y1={170} x2={480} y2={170} stroke="rgba(255,255,255,0.25)" />
          </svg>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, color: T.muted, fontWeight: 600 }}>
            {t.days.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
};

// ================================================================== DESIGN
export const DesignContent: React.FC<{ lf: number; f: number }> = ({ lf, f }) => {
  const t = text.design;
  const s0 = scene("design").start;
  const explode = ramp(lf, 46, 16);
  const rebuild = ramp(lf, 62, 22);
  const examples = ramp(lf, 112, 14);
  const slide = { left: 40, top: 120, w: 880, h: 520 };
  const messy = [
    { x: 30, y: 30, w: 600, h: 34, c: "#ff4d4d" },
    { x: 60, y: 90, w: 760, h: 14, c: "#ffff66" },
    { x: 20, y: 120, w: 700, h: 14, c: "#66ff66" },
    { x: 80, y: 150, w: 740, h: 14, c: "#ff66ff" },
    { x: 40, y: 180, w: 660, h: 14, c: "#66ffff" },
    { x: 10, y: 210, w: 820, h: 14, c: "#ffffff" },
    { x: 90, y: 240, w: 600, h: 14, c: "#ff9933" },
    { x: 30, y: 270, w: 780, h: 14, c: "#ffffff" },
    { x: 500, y: 320, w: 300, h: 160, c: "#9966ff" },
    { x: 40, y: 330, w: 400, h: 14, c: "#ffff66" },
    { x: 60, y: 360, w: 380, h: 14, c: "#66ff66" },
    { x: 20, y: 400, w: 420, h: 14, c: "#ff4d4d" },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, ...AR }}>
      {examples < 1 ? (
        <div style={{ position: "absolute", left: slide.left, top: slide.top, width: slide.w, height: slide.h, opacity: 1 - examples, transform: `scale(${1 - 0.3 * examples})` }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 16, background: rebuild > 0 ? `rgba(255,255,255,${0.06 + 0.04 * rebuild})` : "#d9d9d9", border: rebuild > 0 ? `1.5px solid ${T.border}` : "none" }} />
          {/* messy elements explode outward, then fade */}
          {messy.map((m, i) => {
            const ang = (i * 73) % 360;
            const dx = Math.cos((ang * Math.PI) / 180) * 500 * explode;
            const dy = Math.sin((ang * Math.PI) / 180) * 350 * explode;
            return <div key={i} style={{ position: "absolute", left: m.x + dx, top: m.y + dy, width: m.w, height: m.h, background: m.c, opacity: 1 - explode, transform: `rotate(${explode * (i % 2 ? 40 : -40)}deg)` }} />;
          })}
          {/* clean rebuilt slide */}
          {rebuild > 0 ? (
            <div style={{ position: "absolute", inset: 0, padding: "40px 50px", opacity: rebuild }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18, transform: `translateY(${(1 - rebuild) * 30}px)` }}>
                <HeartPulse size={64} color={T.cyan} stroke={1.8} />
                <span style={{ fontSize: 48, fontWeight: 700, color: T.white }}>{t.slideTitle}</span>
              </div>
              <div style={{ height: 4, width: 160 * rebuild, background: T.cyan, borderRadius: 2, margin: "18px 0 30px" }} />
              {[0, 1, 2].map((k) => (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22, opacity: ramp(lf, 70 + k * 5, 10) }}>
                  <div style={{ width: 16, height: 16, borderRadius: 8, background: T.teal }} />
                  <Skel w={[420, 360, 300][k]} h={16} o={0.45} />
                </div>
              ))}
              <div style={{ position: "absolute", left: 50, bottom: 40, width: 260, height: 170, borderRadius: 16, background: "rgba(0,217,255,0.12)", border: `1.5px solid ${T.cyan}` }}>
                <svg width={260} height={170}>
                  {[50, 90, 70, 120, 100].map((h, k) => (
                    <rect key={k} x={24 + k * 46} y={150 - h * rebuild} width={30} height={h * rebuild} rx={6} fill={k % 2 ? T.teal : T.cyan} />
                  ))}
                </svg>
              </div>
            </div>
          ) : null}
          {/* before / after tag */}
          <div style={{ position: "absolute", top: -60, right: 0, padding: "6px 22px", borderRadius: 999, fontSize: 28, fontWeight: 700, color: T.bg, background: rebuild > 0.5 ? T.good : T.warn }}>
            {rebuild > 0.5 ? t.after : t.before}
          </div>
        </div>
      ) : null}
      {/* three example designs */}
      {examples > 0
        ? t.examples.map((name, i) => {
            const a = pop(f, s0 + 116 + i * 8, 14, 150);
            const float = Math.sin((lf + i * 10) / 12) * 6;
            const shapes = [
              { w: 260, h: 170 },
              { w: 200, h: 330 },
              { w: 230, h: 320 },
            ][i];
            const x = [650, 345, 40][i];
            return (
              <div key={name} style={{ position: "absolute", left: x, top: 180 + float, width: 280, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: Math.min(1, a), transform: `translateY(${(1 - Math.min(1, a)) * 80}px)` }}>
                <div style={{ width: shapes.w, height: shapes.h, borderRadius: 16, background: "linear-gradient(160deg, rgba(0,217,255,0.22), rgba(25,214,197,0.08))", border: `1.5px solid ${T.cyan}`, padding: 18, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 10 }}>
                  {i === 0 ? <HeartPulse size={40} color={T.white} /> : i === 1 ? <Stethoscope size={40} color={T.white} /> : <Palette size={40} color={T.white} />}
                  <Skel w="80%" h={12} o={0.5} />
                  <Skel w="60%" h={10} o={0.3} />
                  {i > 0 ? <Skel w="70%" h={10} o={0.3} /> : null}
                  {i > 0 ? (
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      {[0, 1, 2].map((k) => (
                        <div key={k} style={{ flex: 1, height: i === 1 ? 50 : 70, borderRadius: 8, background: "rgba(255,255,255,0.15)" }} />
                      ))}
                    </div>
                  ) : null}
                </div>
                <span style={{ fontSize: 28, fontWeight: 700, color: T.white, whiteSpace: "nowrap" }}>{name}</span>
              </div>
            );
          })
        : null}
    </div>
  );
};

// ================================================================ CLINICAL
export const ClinicalContent: React.FC<{ lf: number; f: number }> = ({ lf, f }) => {
  const t = text.clinical;
  const s0 = scene("clinical").start;
  return (
    <div style={{ position: "absolute", inset: 0, ...AR }}>
      <Card style={{ left: 160, top: 40, width: 640, height: 320, padding: 30 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div style={{ width: 110, height: 110, borderRadius: 55, background: "rgba(0,217,255,0.14)", border: `2px solid ${T.cyan}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={64} color={T.cyan} />
          </div>
          <div>
            <div style={{ fontSize: 38, fontWeight: 700, color: T.white }}>{t.patient}</div>
            <div style={{ fontSize: 28, fontWeight: 500, color: T.muted, marginTop: 4 }}>{t.patientInfo}</div>
          </div>
        </div>
        <div style={{ marginTop: 26, fontSize: 32, fontWeight: 600, color: T.text, display: "flex", alignItems: "center", gap: 12 }}>
          <HeartPulse size={36} color={T.bad} />
          {t.complaint}
        </div>
        <div style={{ position: "absolute", left: 30, bottom: -26, padding: "8px 20px", borderRadius: 999, background: T.warn, color: T.bg, fontSize: 24, fontWeight: 700, boxShadow: "0 8px 20px rgba(0,0,0,0.35)" }}>{t.badge}</div>
      </Card>
      {/* short exchange: the student asks, the virtual patient answers */}
      <div style={{ position: "absolute", right: 60, top: 420, maxWidth: 560, padding: "14px 24px", borderRadius: "20px 20px 6px 20px", background: "rgba(0,217,255,0.16)", border: "1px solid rgba(0,217,255,0.45)", fontSize: 32, fontWeight: 600, color: T.white, opacity: ramp(lf, 18, 4) }}>
        <Typewriter text={t.ask} frame={lf} start={20} perFrame={1.3} />
      </div>
      <div style={{ position: "absolute", left: 60, top: 500, maxWidth: 840, whiteSpace: "nowrap", padding: "14px 24px", borderRadius: "20px 20px 20px 6px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", fontSize: 32, fontWeight: 600, color: T.text, opacity: ramp(lf, 38, 4) }}>
        <Typewriter text={t.reply} frame={lf} start={40} perFrame={1.3} />
      </div>
      {/* reasoning steps */}
      {t.steps.map((st, i) => {
        const a = pop(f, s0 + 58 + i * 16, 14, 160);
        const done = lf > 68 + i * 16;
        return (
          <React.Fragment key={st}>
            <div style={{ position: "absolute", left: 640 - i * 300, top: 618, width: 260, height: 170, borderRadius: 20, border: `1.5px solid ${done ? T.good : T.border}`, background: done ? "rgba(59,227,154,0.10)" : "rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, opacity: Math.min(1, a), transform: `scale(${0.7 + 0.3 * Math.min(1, a)})` }}>
              <div style={{ width: 56, height: 56, borderRadius: 28, background: done ? T.good : "rgba(0,217,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: T.bg }}>
                {done ? <Check size={34} color={T.bg} stroke={3} /> : <span dir="ltr">{i + 1}</span>}
              </div>
              <span style={{ fontSize: 28, fontWeight: 700, color: T.white, textAlign: "center", padding: "0 12px" }}>{st}</span>
            </div>
            {i < 2 ? <div style={{ position: "absolute", left: 610 - i * 300, top: 701, width: 30 * ramp(lf, 66 + i * 16, 8), height: 4, background: T.cyan }} /> : null}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ==================================================================== OUTRO
const LogoPlate: React.FC<{ src: string; w: number; h: number; style?: React.CSSProperties }> = ({ src, w, h, style }) => (
  <div style={{ width: w, height: h, background: "#FFFFFF", borderRadius: 26, padding: 16, boxSizing: "border-box", boxShadow: "0 20px 60px rgba(0,0,0,0.45), 0 0 50px rgba(0,217,255,0.25)", ...style }}>
    <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
  </div>
);

export const Outro: React.FC<{ f: number }> = ({ f }) => {
  const t = text.outro;
  const s0 = scene("outro").start;
  const lf = f - s0;
  const gather = ramp(lf, 0, 26);
  const networkOut = ramp(lf, 70, 16);
  const linesOut = ramp(lf, 72, 12);
  const logo = pop(f, s0 + 80, 13, 120);
  const sweep = ramp(lf, 112, 18);
  const fadeOut = ramp(lf, 136, 14);
  const cx = 960;
  const cy = 690;
  const n = 8;
  const nodes = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const r = 330 * (1 - 0.15 * networkOut);
    const sx = [1700, 1500, 1200, 900, 600, 300, 200, 1800][i];
    const sy = [900, 950, 980, 960, 980, 940, 300, 400][i];
    return { x: lerp(sx, cx + Math.cos(a) * r, gather), y: lerp(sy, cy + Math.sin(a) * r * 0.5, gather) };
  });
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - fadeOut }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: 1 - networkOut }}>
        {nodes.map((p, i) => (
          <React.Fragment key={i}>
            <line x1={p.x} y1={p.y} x2={cx} y2={cy} stroke={T.cyan} strokeWidth={2} opacity={0.5 * gather} />
            <line x1={p.x} y1={p.y} x2={nodes[(i + 1) % n].x} y2={nodes[(i + 1) % n].y} stroke={T.teal} strokeWidth={1.5} opacity={0.35 * gather} />
          </React.Fragment>
        ))}
        {nodes.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={22} fill="rgba(0,217,255,0.15)" stroke={T.cyan} strokeWidth={2} />
            <circle cx={p.x} cy={p.y} r={6 + 3 * Math.sin(lf / 5 + i)} fill={T.cyan} />
          </g>
        ))}
        <circle cx={cx} cy={cy} r={40 + 6 * Math.sin(lf / 4)} fill={T.cyan} opacity={0.25 * gather} />
        <circle cx={cx} cy={cy} r={16} fill={T.white} opacity={gather} />
      </svg>
      <div style={{ position: "absolute", top: 230, left: 0, right: 0, textAlign: "center", opacity: 1 - linesOut, transform: `translateY(${-linesOut * 40}px)` }}>
        <Kinetic text={t.line1} frame={f} start={s0 + 18} size={60} color={T.white} stagger={3} style={{ textShadow: "0 0 30px rgba(0,0,0,0.6)" }} />
        <Kinetic text={t.line2} frame={f} start={s0 + 46} size={64} color={T.cyan} stagger={4} style={{ marginTop: 10, textShadow: "0 0 30px rgba(0,217,255,0.4)" }} />
      </div>
      {lf > 76 ? (
        <>
          <div style={{ position: "absolute", left: 960 - 200, top: 230, opacity: Math.min(1, logo), transform: `scale(${0.7 + 0.3 * logo})` }}>
            <LogoPlate src="basira/logos/basira-club.png" w={400} h={340} />
          </div>
          <div style={{ position: "absolute", left: 960 - 200 - 380, top: 330, opacity: ramp(lf, 92, 12), transform: `translateX(${(1 - ramp(lf, 92, 12)) * 60}px)` }}>
            <LogoPlate src="basira/logos/student-council.png" w={220} h={220} />
          </div>
          <div style={{ position: "absolute", left: 960 + 200 + 160, top: 330, opacity: ramp(lf, 92, 12), transform: `translateX(${(1 - ramp(lf, 92, 12)) * -60}px)` }}>
            <LogoPlate src="basira/logos/college-of-medicine.png" w={260} h={220} />
          </div>
          <div style={{ position: "absolute", top: 640, left: 0, right: 0, textAlign: "center" }}>
            <Kinetic text={t.club} frame={f} start={s0 + 96} size={46} weight={600} color={T.white} stagger={2} />
          </div>
          {/* light sweep across the closing card */}
          <div style={{ position: "absolute", top: 180, height: 600, width: 220, left: -300 + sweep * 2500, transform: "skewX(-20deg)", background: "linear-gradient(90deg, rgba(0,217,255,0), rgba(255,255,255,0.22), rgba(0,217,255,0))", opacity: sweep > 0 && sweep < 1 ? 1 : 0 }} />
        </>
      ) : null}
    </div>
  );
};

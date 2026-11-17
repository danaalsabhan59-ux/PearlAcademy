import React from "react";
import { Img, staticFile } from "remotion";
import { Card, Kinetic } from "../components/Frame";
import { TOOL_MARKS, ToolMark } from "../components/ToolLogos";
import { Cards, Chat, Code, Doc, Notebook, Palette, Search } from "../components/Icons";
import text from "../data/text.json";
import { scene } from "../data/timeline";
import { lerp, pop, ramp, T } from "../theme";
import { cardRectV } from "./layoutV";

const heartPoint = (u: number) => ({
  x: 16 * Math.sin(u) ** 3,
  y: -(13 * Math.cos(u) - 5 * Math.cos(2 * u) - 2 * Math.cos(3 * u) - Math.cos(4 * u)),
});

const ICONS = [Chat, Code, Notebook, Search, Doc, Cards, Cards, Palette];

// ==================================================================== INTRO
export const IntroV: React.FC<{ f: number }> = ({ f }) => {
  const s = scene("intro");
  const lf = f - s.start;
  const cx = 540;
  const cy = 560;
  const gather = ramp(lf, 0, 34);
  const ecg = ramp(lf, 34, 20);
  const fadeOthers = ramp(lf, 118, 20);
  const dots = Array.from({ length: 70 }, (_, i) => {
    const tg = heartPoint((i / 70) * Math.PI * 2);
    const sx = (i * 397) % 1080;
    const sy = 300 + ((i * 251) % 1300);
    return <circle key={i} cx={lerp(sx, cx + tg.x * 8.5, gather)} cy={lerp(sy, cy + tg.y * 8.5, gather)} r={3} fill={i % 2 ? T.cyan : T.teal} opacity={0.4 + 0.6 * gather} />;
  });
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 1 - 0.6 * fadeOthers }}>
        <defs>
          <filter id="glowV" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>
        <circle cx={cx} cy={cy - 6} r={150} fill={T.cyan} opacity={0.12 * ramp(lf, 30, 12)} filter="url(#glowV)" />
        {dots}
        <polyline
          points={`${cx - 110},${cy} ${cx - 50},${cy} ${cx - 30},${cy - 45} ${cx - 5},${cy + 50} ${cx + 18},${cy - 25} ${cx + 32},${cy} ${cx + 110},${cy}`}
          fill="none"
          stroke={T.white}
          strokeWidth={5}
          strokeLinejoin="round"
          strokeDasharray={420}
          strokeDashoffset={420 * (1 - ecg)}
        />
      </svg>
      <div style={{ position: "absolute", top: 700, left: 50, right: 50, textAlign: "center", opacity: 1 - fadeOthers }}>
        <Kinetic text={text.intro.question} frame={f} start={s.start + 22} size={40} weight={500} color={T.muted} stagger={2} />
        <Kinetic text={text.intro.title} frame={f} start={s.start + 46} size={78} color={T.white} stagger={4} style={{ textShadow: "0 0 40px rgba(0,217,255,0.35)" }} />
        <Kinetic text={text.intro.subtitle} frame={f} start={s.start + 72} size={46} weight={600} color={T.cyan} stagger={3} />
      </div>
      {text.intro.tools.map((name, i) => {
        const r = cardRectV(i);
        const p = pop(f, s.start + 56 + i * 4, 13, 170);
        const Icon = ICONS[i];
        const hl = i === 0 ? ramp(lf, 112, 14) : 0;
        return (
          <Card
            key={name}
            glow={hl}
            style={{
              left: r.x,
              top: r.y,
              width: r.w,
              height: r.h,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              opacity: Math.min(1, p) * (i === 0 ? 1 : 1 - fadeOthers),
              transform: `translateY(${(1 - p) * 140}px) rotate(${(1 - p) * (i % 2 ? 8 : -8)}deg) scale(${0.6 + 0.4 * p + 0.06 * hl})`,
            }}
          >
            {TOOL_MARKS[name] ? (
              <ToolMark parts={TOOL_MARKS[name]!} height={name.includes("·") ? 70 : 100} maxLogoWidth={name.includes("·") ? 90 : 186} textSize={26} gap={6} />
            ) : (
              <>
                <Icon size={50} color={i % 2 ? T.teal : T.cyan} />
                <span dir="ltr" style={{ fontWeight: 700, fontSize: name.length > 11 ? 24 : 28, color: T.white }}>
                  {name}
                </span>
              </>
            )}
          </Card>
        );
      })}
    </>
  );
};

// ==================================================================== OUTRO
const LogoPlate: React.FC<{ src: string; w: number; h: number }> = ({ src, w, h }) => (
  <div style={{ width: w, height: h, background: "#FFFFFF", borderRadius: 26, padding: 16, boxSizing: "border-box", boxShadow: "0 20px 60px rgba(0,0,0,0.45), 0 0 50px rgba(0,217,255,0.25)" }}>
    <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
  </div>
);

export const OutroV: React.FC<{ f: number }> = ({ f }) => {
  const t = text.outro;
  const s0 = scene("outro").start;
  const lf = f - s0;
  const gather = ramp(lf, 0, 26);
  const networkOut = ramp(lf, 70, 16);
  const linesOut = ramp(lf, 72, 12);
  const logo = pop(f, s0 + 80, 13, 120);
  const sides = ramp(lf, 92, 12);
  const sweep = ramp(lf, 112, 18);
  const fadeOut = ramp(lf, 138, 12);
  const cx = 540;
  const cy = 1060;
  const nodes = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const r = 330 * (1 - 0.15 * networkOut);
    const sx = [1000, 900, 700, 400, 120, 60, 80, 1040][i];
    const sy = [1500, 1650, 1700, 1700, 1650, 1300, 700, 800][i];
    return { x: lerp(sx, cx + Math.cos(a) * r, gather), y: lerp(sy, cy + Math.sin(a) * r * 0.75, gather) };
  });
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - fadeOut }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 1 - networkOut }}>
        {nodes.map((p, i) => (
          <React.Fragment key={i}>
            <line x1={p.x} y1={p.y} x2={cx} y2={cy} stroke={T.cyan} strokeWidth={2} opacity={0.5 * gather} />
            <line x1={p.x} y1={p.y} x2={nodes[(i + 1) % 8].x} y2={nodes[(i + 1) % 8].y} stroke={T.teal} strokeWidth={1.5} opacity={0.35 * gather} />
          </React.Fragment>
        ))}
        {nodes.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={24} fill="rgba(0,217,255,0.15)" stroke={T.cyan} strokeWidth={2} />
            <circle cx={p.x} cy={p.y} r={7 + 3 * Math.sin(lf / 5 + i)} fill={T.cyan} />
          </g>
        ))}
        <circle cx={cx} cy={cy} r={44 + 6 * Math.sin(lf / 4)} fill={T.cyan} opacity={0.25 * gather} />
        <circle cx={cx} cy={cy} r={18} fill={T.white} opacity={gather} />
      </svg>
      <div style={{ position: "absolute", top: 470, left: 60, right: 60, textAlign: "center", opacity: 1 - linesOut, transform: `translateY(${-linesOut * 40}px)` }}>
        <Kinetic text={t.line1} frame={f} start={s0 + 18} size={62} color={T.white} stagger={3} />
        <Kinetic text={t.line2} frame={f} start={s0 + 46} size={66} color={T.cyan} stagger={4} style={{ marginTop: 16, textShadow: "0 0 30px rgba(0,217,255,0.4)" }} />
      </div>
      {lf > 76 ? (
        <>
          <div style={{ position: "absolute", left: 540 - 230, top: 440, opacity: Math.min(1, logo), transform: `scale(${0.7 + 0.3 * logo})` }}>
            <LogoPlate src="basira/logos/basira-club.png" w={460} h={390} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 880, display: "flex", justifyContent: "center", gap: 40, opacity: sides, transform: `translateY(${(1 - sides) * 50}px)` }}>
            <LogoPlate src="basira/logos/student-council.png" w={230} h={210} />
            <LogoPlate src="basira/logos/college-of-medicine.png" w={270} h={210} />
          </div>
          <div style={{ position: "absolute", top: 1150, left: 60, right: 60, textAlign: "center" }}>
            <Kinetic text={t.club} frame={f} start={s0 + 96} size={46} weight={600} color={T.white} stagger={2} />
          </div>
          <div style={{ position: "absolute", top: 400, height: 900, width: 220, left: -300 + sweep * 1700, transform: "skewX(-20deg)", background: "linear-gradient(90deg, rgba(0,217,255,0), rgba(255,255,255,0.22), rgba(0,217,255,0))", opacity: sweep > 0 && sweep < 1 ? 1 : 0 }} />
        </>
      ) : null}
    </div>
  );
};

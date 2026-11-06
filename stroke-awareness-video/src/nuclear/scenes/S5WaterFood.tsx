import { useCues } from "../data/cues";
import React from "react";
import { KeyWord } from "../components/Text";
import { XF } from "../data/timeline";
import { C, FONT, lerp, ramp } from "../theme";

const SURF = 940; // ground surface
const IMPACT = { x: 380, y: SURF };

const Drop: React.FC<{ x: number; y: number; s: number; particle?: boolean }> = ({ x, y, s, particle }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 0 -120 C 30 -70 70 -20 70 25 C 70 70 38 100 0 100 C -38 100 -70 70 -70 25 C -70 -20 -30 -70 0 -120 Z" fill="url(#dropG)" stroke="#bfe6f2" strokeOpacity={0.7} strokeWidth={3} />
    <ellipse cx={-26} cy={10} rx={12} ry={26} fill="#ffffff" opacity={0.45} transform="rotate(20 -26 10)" />
    {particle ? (
      <g>
        <circle cx={14} cy={42} r={14} fill={C.amber} opacity={0.3} />
        <circle cx={14} cy={42} r={7} fill={C.amber} />
      </g>
    ) : null}
  </g>
);

/** Pathway segment: animated dotted line that draws on, then flows. */
const Path: React.FC<{ d: string; f: number; a: number; dim: number; lf: number }> = ({ d, f, a, dim, lf }) => {
  const p = ramp(f, a, 26);
  if (p <= 0) return null;
  return (
    <>
      <path d={d} fill="none" stroke={C.amber} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={`${p} 1`} opacity={0.35 * (1 - 0.6 * dim)} />
      <path d={d} fill="none" stroke={C.amber} strokeWidth={7} strokeLinecap="round" strokeDasharray="2 22" strokeDashoffset={-lf * 1.6} opacity={p * (1 - 0.7 * dim)} />
    </>
  );
};

const Label: React.FC<{ f: number; a: number; text: string; x: number; y: number; color?: string }> = ({ f, a, text, x, y, color = C.white }) => {
  const p = ramp(f, a, 12);
  if (p <= 0) return null;
  return (
    <div dir="rtl" style={{ position: "absolute", left: x - 160, top: y, width: 320, textAlign: "center", opacity: p, transform: `translateY(${(1 - p) * 16}px)`, zIndex: 700 }}>
      <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 44, color, padding: "6px 22px", borderRadius: 14, background: "rgba(8,24,39,0.8)", border: "1.5px solid rgba(232,173,69,0.5)" }}>{text}</span>
    </div>
  );
};

/** Raindrop → soil → water → crops → food chain; then: deposition does not mean water or food are unsafe. */
export const S5WaterFood: React.FC<{ f: number }> = ({ f }) => {
  const { at, sc } = useCues();
  const s = sc("s5");
  const lf = f - s.start;
  const len = s.end - s.start;
  const fall = ramp(lf, 0, 62, (t) => t * t);
  const splash = ramp(lf, 60, 22);
  const reveal = ramp(lf, 58, 36);
  const fSoil = at("s5", "التربة");
  const fWater = at("s5", "والمياه");
  const fCrops = at("s5", "والمحاصيل");
  const fChain = at("s5", "الزراعية");
  const fBut = at("s5", "لكن");
  const safe = ramp(f, fBut + 10, 30);
  const exit = ramp(lf, len - 30, 30 + XF);
  const camS = lerp(1.9, 1, reveal) * lerp(1, 2.6, exit);
  const dropY = lerp(640, IMPACT.y - 70, fall);
  const glass = { x: 930, y: 742 };
  const plate = { x: 790, y: 776 };
  return (
    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, #091b2b 0%, ${C.blue} 46%, #0b1824 100%)` }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="dropG" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#d7f3fb" stopOpacity={0.9} />
            <stop offset="55%" stopColor="#56C7D9" stopOpacity={0.55} />
            <stop offset="100%" stopColor="#1d6f8a" stopOpacity={0.75} />
          </radialGradient>
          <linearGradient id="soil" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#3a2f26" />
            <stop offset="100%" stopColor="#1c1915" />
          </linearGradient>
          <linearGradient id="gw" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#1f5f7d" />
            <stop offset="100%" stopColor="#123a52" />
          </linearGradient>
        </defs>
        <g transform={`translate(540 960) scale(${camS}) translate(${-lerp(540, glass.x, exit)} ${-lerp(960, glass.y, exit)})`}>
          {/* falling streaks while following the drop */}
          {fall < 1
            ? Array.from({ length: 40 }, (_, k) => {
                const x = (k * 113) % 1080;
                const y = ((k * 211 - lf * 30) % 1200 + 1200) % 1200 + 200;
                return <line key={k} x1={x} y1={y} x2={x} y2={y + 60} stroke="#a9c9de" strokeOpacity={0.25 * (1 - reveal)} strokeWidth={2} />;
              })
            : null}
          {/* cross-section */}
          <g opacity={0.25 + 0.75 * reveal}>
            <rect x={-200} y={SURF} width={1480} height={600} fill="url(#soil)" />
            {[0, 1, 2].map((k) => (
              <path key={k} d={`M -200 ${SURF + 70 + k * 70} Q 270 ${SURF + 50 + k * 70} 540 ${SURF + 80 + k * 70} T 1280 ${SURF + 66 + k * 70}`} stroke="#5a4636" strokeOpacity={0.6} strokeWidth={2} fill="none" />
            ))}
            <rect x={-200} y={SURF + 250} width={1480} height={80} fill="url(#gw)" opacity={0.95} />
            {/* river on the surface (right) */}
            <path d={`M 430 ${SURF} Q 480 ${SURF + 44} 560 ${SURF + 44} T 680 ${SURF} Z`} fill="#1d5f7c" stroke={C.cyan} strokeOpacity={0.5} strokeWidth={2} />
            {/* table */}
            <rect x={700} y={SURF - 122} width={320} height={14} rx={4} fill="#6b4f3a" />
            <rect x={716} y={SURF - 108} width={12} height={108} fill="#4e3a2b" />
            <rect x={992} y={SURF - 108} width={12} height={108} fill="#4e3a2b" />
            {/* crops (left) with roots */}
            {Array.from({ length: 7 }, (_, k) => {
              const x = 70 + k * 48;
              const sway = Math.sin(lf / 20 + k) * 4;
              return (
                <g key={k}>
                  <path d={`M ${x} ${SURF} Q ${x + sway} ${SURF - 70} ${x + sway * 2} ${SURF - 140}`} stroke="#7aa35a" strokeWidth={5} fill="none" />
                  {[0, 1, 2, 3].map((j) => (
                    <ellipse key={j} cx={x + sway * 2 + (j % 2 ? 9 : -9)} cy={SURF - 130 + j * 14} rx={7} ry={12} fill="#d8b45a" transform={`rotate(${j % 2 ? 30 : -30} ${x + sway * 2 + (j % 2 ? 9 : -9)} ${SURF - 130 + j * 14})`} />
                  ))}
                  <path d={`M ${x} ${SURF} l -10 40 M ${x} ${SURF} l 8 46 M ${x} ${SURF} l 0 56`} stroke="#8a6b4e" strokeWidth={2.5} />
                </g>
              );
            })}
            {/* glass of drinking water + plate (food) */}
            <g transform={`translate(${glass.x} ${glass.y})`}>
              <path d="M -40 -70 L 40 -70 L 30 70 L -30 70 Z" fill="rgba(170,220,240,0.12)" stroke="#bfe6f2" strokeWidth={3} />
              <path d="M -36 -30 L 36 -30 L 30 70 L -30 70 Z" fill="#56C7D9" opacity={0.45} />
            </g>
            <g transform={`translate(${plate.x} ${plate.y})`}>
              <ellipse cx={0} cy={40} rx={90} ry={22} fill="#e9eef3" opacity={0.85} />
              <ellipse cx={0} cy={34} rx={62} ry={14} fill="#c6ced6" />
              <circle cx={-22} cy={20} r={18} fill="#d8b45a" />
              <circle cx={14} cy={18} r={20} fill="#7aa35a" />
              <circle cx={34} cy={26} r={12} fill="#c96a4a" />
            </g>
            {/* pathways */}
            <Path f={f} a={fSoil - 4} dim={safe} lf={lf} d={`M ${IMPACT.x} ${SURF + 10} L ${IMPACT.x} ${SURF + 150}`} />
            <Path f={f} a={fWater - 2} dim={safe} lf={lf} d={`M ${IMPACT.x} ${SURF + 150} Q ${IMPACT.x + 60} ${SURF + 230} ${IMPACT.x + 160} ${SURF + 270}`} />
            <Path f={f} a={fWater + 8} dim={safe} lf={lf} d={`M ${IMPACT.x + 20} ${SURF - 4} Q 450 ${SURF - 16} 520 ${SURF + 22}`} />
            <Path f={f} a={fCrops - 2} dim={safe} lf={lf} d={`M ${IMPACT.x - 10} ${SURF + 120} Q 300 ${SURF + 110} 230 ${SURF + 50}`} />
            <Path f={f} a={fChain + 4} dim={safe} lf={lf} d={`M 220 ${SURF - 160} Q 500 ${SURF - 360} ${plate.x - 30} ${plate.y + 10}`} />
          </g>
          {/* impact splash */}
          {splash > 0 && splash < 1 ? (
            <g opacity={1 - splash}>
              <ellipse cx={IMPACT.x} cy={IMPACT.y} rx={40 + splash * 140} ry={10 + splash * 26} fill="none" stroke="#bfe6f2" strokeWidth={4} />
              {[-1, 1].map((k) => [0, 1, 2].map((j) => <circle key={`${k}${j}`} cx={IMPACT.x + k * (20 + j * 22) * splash * 2} cy={IMPACT.y - 60 * Math.sin(splash * Math.PI) * (1 - j * 0.2)} r={6 - j} fill="#bfe6f2" />))}
            </g>
          ) : null}
          {lf < 66 ? <Drop x={IMPACT.x} y={dropY} s={lerp(1.2, 0.7, fall)} particle /> : null}
          {/* "not inevitable": calm cyan rings around drinking water and food */}
          {safe > 0
            ? [glass, { x: plate.x, y: plate.y + 24 }].map((p, k) => (
                <g key={k} opacity={safe}>
                  <circle cx={p.x} cy={p.y} r={120} fill="none" stroke={C.cyan} strokeWidth={4} />
                  <path d={`M ${p.x - 22} ${p.y + 96} l 14 14 l 28 -30`} stroke={C.cyan} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              ))
            : null}
        </g>
      </svg>
      {exit < 0.5 ? (
        <>
          <Label f={f} a={fSoil} text="التربة" x={300} y={SURF + 170} />
          <Label f={f} a={fWater} text="المياه" x={600} y={SURF + 190} color={C.cyan} />
          <Label f={f} a={fChain + 4} text="الغذاء" x={850} y={560} color={C.amber} />
        </>
      ) : null}
      <KeyWord f={f} at={at("s5", "ترسبت")} out={fBut - 2} text="هل تتلوث المياه والغذاء؟" size={60} top={250} />
      <KeyWord f={f} at={fBut + 6} out={s.end + 6} text="التلوث ليس حتمياً" size={72} color={C.cyan} top={250} chip />
    </div>
  );
};

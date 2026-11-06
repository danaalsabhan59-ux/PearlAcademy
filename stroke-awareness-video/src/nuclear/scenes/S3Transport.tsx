import React from "react";
import { KeyWord, Tag } from "../components/Text";
import { sc, XF } from "../data/timeline";
import { at } from "../data/words";
import { C, FONT, ramp, rnd } from "../theme";

const SRC = { x: 120, y: 1205 };
const GROUND = 1262;

/** Sky → wind transport → dispersion → rain-out deposition. Coloured dots are a visual symbol only. */
export const S3Transport: React.FC<{ f: number }> = ({ f }) => {
  const s = sc("s3");
  const lf = f - s.start;
  const tw = at("s3", "تحمل", 1) - s.start; // wind picks up
  const tr = at("s3", "للأمطار") - s.start; // rain
  const wind = ramp(lf, tw - 10, 40);
  const rain = ramp(lf, tr - 16, 30);
  const rise = 1 - ramp(lf, 0, 50); // continuing the tilt-up from the facility
  const inset = Math.min(ramp(lf, 14, 22), 1 - ramp(lf, tw - 26, 22));
  const exit = ramp(lf, s.end - s.start - 30, 30 + XF);
  // cumulative wind displacement (px) since frame 0
  const G = (t: number) => 0.35 * t + 2.3 * Math.max(0, t - tw) - 1.15 * Math.min(Math.max(0, t - tw), 40) * (1 - Math.min(Math.max(0, t - tw), 40) / 40);

  const parts = Array.from({ length: 190 }, (_, i) => {
    const b = -60 + (i / 190) * (tr + 40);
    const age = lf - b;
    if (age < 0) return null;
    const H = 330 + rnd(i) * 470;
    let y = SRC.y - H * (1 - Math.exp(-age / 45)) + Math.sin(age / 22 + i) * 14 * (1 + age / 200);
    const spread = (rnd(i + 3) - 0.5) * age * 0.55;
    let x = SRC.x + (G(lf) - G(b)) * (0.75 + rnd(i + 7) * 0.5) + spread * 0.4;
    y += spread * 0.6;
    let deposited = false;
    const falls = i % 3 === 0 && b < tr;
    if (falls) {
      const td = lf - (tr + rnd(i + 11) * 70);
      if (td > 0) {
        const gy = GROUND + 10 + rnd(i + 5) * 110;
        y = Math.min(gy, y + td * 9);
        deposited = y >= gy;
        if (deposited) x -= 0; // stays where it lands
      }
    }
    if (x > 1140 || x < -40) return null;
    return { x, y, a: Math.min(1, age / 12), deposited, i };
  });

  const yShift = rise * 420 - exit * 160;
  return (
    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, #071422 0%, ${C.navy} 35%, ${C.blue} 75%, #0d2131 100%)` }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="cl"><feGaussianBlur stdDeviation="22" /></filter>
          <filter id="pg"><feGaussianBlur stdDeviation="3" /></filter>
          <linearGradient id="lake" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#1f5a78" />
            <stop offset="100%" stopColor="#0d2a3e" />
          </linearGradient>
        </defs>
        <g transform={`translate(0 ${yShift})`}>
          {/* wind streamlines */}
          {Array.from({ length: 9 }, (_, k) => {
            const y0 = 420 + k * 95;
            const d = `M -100 ${y0} C 200 ${y0 - 60}, 500 ${y0 + 70}, 800 ${y0 - 20} S 1100 ${y0 + 40}, 1300 ${y0}`;
            return (
              <path key={k} d={d} fill="none" stroke={C.cyan} strokeWidth={2.2} strokeDasharray="70 160" strokeDashoffset={-lf * (4 + k * 0.4)} opacity={0.38 * wind * (1 - 0.5 * rain)} />
            );
          })}
          {/* rain clouds */}
          {Array.from({ length: 7 }, (_, k) => (
            <ellipse key={k} cx={80 + k * 160 + Math.sin(k) * 30 + lf * 0.2} cy={470 + (k % 2) * 60} rx={170} ry={70} fill="#2b4258" opacity={0.85 * rain} filter="url(#cl)" />
          ))}
          {/* rain */}
          {rain > 0
            ? Array.from({ length: 110 }, (_, k) => {
                const x = (k * 97.3) % 1120 - 20;
                const y = 520 + (((lf - tr) * 26 + k * 83) % 760);
                return <line key={k} x1={x} y1={y} x2={x - 6} y2={y + 34} stroke="#a9c9de" strokeWidth={2} opacity={0.4 * rain} />;
              })
            : null}
          {/* ground, lake and the faraway source */}
          <path d={`M -20 ${GROUND} Q 300 ${GROUND - 30} 560 ${GROUND - 6} T 1100 ${GROUND - 14} L 1100 1500 L -20 1500 Z`} fill="#0b1b28" />
          <ellipse cx={810} cy={GROUND + 60} rx={210} ry={34} fill="url(#lake)" stroke={C.cyan} strokeOpacity={0.35} />
          <g transform={`translate(${SRC.x} ${SRC.y + 8})`} opacity={0.9}>
            <path d="M -30 46 L -30 10 A 22 22 0 0 1 14 10 L 14 46 Z" fill="#35597a" />
            <path d="M 22 46 Q 26 20 22 0 L 44 0 Q 40 20 44 46 Z" fill="#2c4c68" />
          </g>
          {/* symbolic particles */}
          {parts.map((p) =>
            p ? (
              <g key={p.i} opacity={p.a}>
                <circle cx={p.x} cy={p.y} r={p.deposited ? 6 : 8} fill={C.amber} opacity={0.22} filter="url(#pg)" />
                <circle cx={p.x} cy={p.y} r={p.deposited ? 3 : 3.6} fill={C.amber} />
              </g>
            ) : null,
          )}
        </g>
      </svg>
      {/* macro inset: a radioactive particle emits radiation; it is the material that travels */}
      {inset > 0 ? (
        <div style={{ position: "absolute", left: 540 - 250, top: 560, width: 500, height: 500, borderRadius: "50%", overflow: "hidden", opacity: inset, transform: `scale(${0.6 + 0.4 * inset})`, background: "radial-gradient(circle, rgba(16,43,64,0.96) 0%, rgba(8,24,39,0.96) 70%)", border: `2px solid ${C.cyan}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
          <svg width={500} height={500}>
            {Array.from({ length: 12 }, (_, k) => {
              const ang = (k / 12) * Math.PI * 2;
              const t = ((lf * 2.2 + k * 23) % 120) / 120;
              const r0 = 60 + t * 160;
              return (
                <path
                  key={k}
                  d={`M ${250 + Math.cos(ang) * r0} ${250 + Math.sin(ang) * r0} l ${Math.cos(ang) * 26} ${Math.sin(ang) * 26}`}
                  stroke={C.cyan}
                  strokeWidth={4}
                  strokeLinecap="round"
                  opacity={1 - t}
                />
              );
            })}
            <circle cx={250} cy={250} r={52} fill={C.amber} opacity={0.25} />
            <circle cx={250} cy={250} r={38} fill={C.amber} />
            <circle cx={238} cy={238} r={10} fill="#fff3d6" opacity={0.6} />
          </svg>
          <div dir="rtl" style={{ position: "absolute", top: 330, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 34, color: C.amber }}>مادة مشعة</div>
          <div dir="rtl" style={{ position: "absolute", top: 92, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 600, fontSize: 30, color: C.cyan }}>تُطلق إشعاعاً</div>
        </div>
      ) : null}
      <Tag f={f} a={s.start + 6} b={s.end + XF} text="الجسيمات الملوّنة تمثيل بصري فقط — الإشعاع لا يُرى" top={376} />
      <KeyWord f={f} at={at("s3", "مواد")} out={tw + s.start - 4} text="مواد مشعة ≠ الإشعاع نفسه" size={60} color={C.amber} top={250} chip />
      <KeyWord f={f} at={at("s3", "الرياح", 1)} out={at("s3", "مسافات") - 2} text="الرياح" size={76} top={250} />
      <KeyWord f={f} at={at("s3", "مسافات")} out={tr + s.start - 2} text="الانتشار" size={76} color={C.cyan} top={250} />
      <KeyWord f={f} at={at("s3", "تُرسّب")} out={s.end + 6} text="الترسّب" size={76} color={C.amber} top={250} />
      {/* labels near ground */}
      <div dir="rtl" style={{ position: "absolute", top: GROUND + 104 + yShift, left: 640, width: 340, textAlign: "center", fontFamily: FONT, fontWeight: 600, fontSize: 28, color: C.cyan, opacity: rain }}>مسطّح مائي</div>
      <div dir="rtl" style={{ position: "absolute", top: GROUND + 104 + yShift, left: 160, width: 340, textAlign: "center", fontFamily: FONT, fontWeight: 600, fontSize: 28, color: C.muted, opacity: rain }}>سطح الأرض</div>
      <div dir="rtl" style={{ position: "absolute", top: SRC.y + 64 + yShift, left: SRC.x - 110, width: 220, textAlign: "center", fontFamily: FONT, fontWeight: 600, fontSize: 24, color: C.amber, opacity: ramp(lf, 40, 20) * (1 - rain) }}>المصدر</div>
    </div>
  );
};

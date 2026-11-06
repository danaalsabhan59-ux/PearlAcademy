import { useCues } from "../data/cues";
import React from "react";
import { Stars } from "../components/Earth";
import { KeyWord } from "../components/Text";
import { GlobeView } from "../three/GlobeView";
import { C, FONT, lerp, ramp } from "../theme";

const BODIES = ["هيئة الرقابة النووية والإشعاعية", "وزارة الصحة", "الدفاع المدني", "هيئة الغذاء والدواء"];

const StepIcon: React.FC<{ k: number }> = ({ k }) => (
  <svg width={74} height={74} viewBox="0 0 74 74">
    <circle cx={37} cy={37} r={35} fill="rgba(86,199,217,0.14)" stroke={C.cyan} strokeWidth={2.5} />
    {k < 2 ? (
      <>
        <path d="M 18 36 L 37 20 L 56 36 L 56 56 L 18 56 Z" fill="none" stroke={C.white} strokeWidth={3.4} strokeLinejoin="round" />
        <rect x={31} y={40} width={12} height={16} fill={k === 1 ? C.cyan : "none"} stroke={C.white} strokeWidth={3} />
        {k === 0 ? <path d="M 4 47 L 24 47 M 18 41 L 24 47 L 18 53" stroke={C.amber} strokeWidth={3.6} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
      </>
    ) : (
      <>
        <rect x={16} y={28} width={42} height={28} rx={6} fill="none" stroke={C.white} strokeWidth={3.4} />
        <circle cx={28} cy={42} r={7} fill="none" stroke={C.white} strokeWidth={3} />
        <line x1={40} y1={37} x2={52} y2={37} stroke={C.white} strokeWidth={3} />
        <line x1={40} y1={46} x2={52} y2={46} stroke={C.white} strokeWidth={3} />
        <line x1={24} y1={28} x2={46} y2={16} stroke={C.amber} strokeWidth={3.4} strokeLinecap="round" />
      </>
    )}
  </svg>
);

/** Calm Earth → practical steps for an official alert → key message, official bodies (text only), disclaimer. */
export const S7Finale: React.FC<{ f: number }> = ({ f }) => {
  const { at, sc } = useCues();
  const s = sc("s7");
  const lf = f - s.start;
  const fAlert = at("s7", "تنبيه");
  const steps = [at("s7", "ادخل"), at("s7", "وابقَ"), at("s7", "وتابع")];
  const fCalm = at("s7", "فليس");
  const fMsg = at("s7", "والوعي");
  const grow = ramp(lf, 0, 46);
  const dimForSteps = Math.min(ramp(f, fAlert - 10, 20), 1 - ramp(f, fCalm - 6, 20));
  const toNavy = ramp(f, fMsg - 24, 44);
  const stepsOut = ramp(f, fCalm - 8, 14);
  const sub = ramp(f, fMsg + 34, 16);
  const z = lerp(40, 8.6, grow) * lerp(1, 1.12, toNavy);
  return (
    <div style={{ position: "absolute", inset: 0, background: "#04090f" }}>
      <Stars alpha={(1 - toNavy) * grow} drift={lf * 0.05} />
      {toNavy < 1 ? <GlobeView z={z} rot={2.2 + lf * 0.003} opacity={(1 - toNavy) * (1 - 0.65 * dimForSteps)} cy={0.15} /> : null}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 45%, ${C.blue} 0%, ${C.navy} 70%)`, opacity: toNavy }} />

      {/* practical steps */}
      {stepsOut < 1 ? (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - stepsOut }}>
          <KeyWord f={f} at={fAlert} text="عند صدور تنبيه رسمي" size={58} color={C.amber} top={420} />
          <div dir="rtl" style={{ position: "absolute", top: 560, left: 110, right: 110, display: "flex", flexDirection: "column", gap: 26 }}>
            {["ادخل", "ابقَ في الداخل", "تابع التعليمات الرسمية"].map((t, k) => {
              const p = ramp(f, steps[k] - 3, 12);
              return (
                <div key={t} style={{ opacity: p, transform: `translateX(${(1 - p) * -40}px)`, display: "flex", alignItems: "center", gap: 24, padding: "16px 28px", borderRadius: 22, background: "rgba(8,24,39,0.86)", border: `2px solid ${p > 0.9 ? C.cyan : "rgba(86,199,217,0.4)"}` }}>
                  <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 40, color: C.cyan, width: 40 }}>{["١", "٢", "٣"][k]}</span>
                  <StepIcon k={k} />
                  <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 48, color: C.white }}>{t}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* closing message */}
      <KeyWord f={f} at={fMsg} text="الوعي يبدأ من المعلومة الموثوقة" size={70} top={430} />
      <div dir="rtl" style={{ position: "absolute", top: 640, left: 60, right: 60, textAlign: "center", opacity: sub, transform: `translateY(${(1 - sub) * 16}px)` }}>
        <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 44, color: C.amber }}>تابع الجهات الرسمية المختصة</span>
      </div>
      <div dir="rtl" style={{ position: "absolute", top: 740, left: 90, right: 90, display: "flex", flexDirection: "column", gap: 18, alignItems: "stretch" }}>
        {BODIES.map((b, k) => {
          const p = ramp(f, fMsg + 46 + k * 7, 12);
          return (
            <div key={b} style={{ opacity: p, transform: `translateX(${(1 - p) * -30}px)`, display: "flex", alignItems: "center", gap: 18, padding: "14px 28px", borderRadius: 18, background: "rgba(16,43,64,0.85)", border: "1.5px solid rgba(86,199,217,0.4)" }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, background: C.cyan, transform: "rotate(45deg)", flexShrink: 0 }} />
              <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 38, color: C.white }}>{b}</span>
            </div>
          );
        })}
      </div>
      <div dir="rtl" style={{ position: "absolute", top: 1338, left: 80, right: 80, textAlign: "center", opacity: ramp(f, fMsg, 20) }}>
        <span style={{ fontFamily: FONT, fontWeight: 500, fontSize: 28, color: C.muted }}>محتوى توعوي افتراضي لا يشير إلى وجود خطر إشعاعي حالي.</span>
      </div>
    </div>
  );
};

import React from "react";
import { Earth, Stars } from "../components/Earth";
import { KeyWord } from "../components/Text";
import { sc } from "../data/timeline";
import { at } from "../data/words";
import { C, FONT, lerp, ramp } from "../theme";

const BODIES = ["هيئة الرقابة النووية والإشعاعية", "وزارة الصحة", "الدفاع المدني", "هيئة الغذاء والدواء"];

/** Calm Earth → navy; key message, official bodies (text only) and the disclaimer. */
export const S7Finale: React.FC<{ f: number }> = ({ f }) => {
  const s = sc("s7");
  const lf = f - s.start;
  const fMsg = at("s7", "الوعي");
  const grow = ramp(lf, 0, 40);
  const toNavy = ramp(f, fMsg - 30, 50);
  const r = lerp(40, 330, grow) * lerp(1, 0.86, toNavy);
  const sub = ramp(f, fMsg + 40, 16);
  return (
    <div style={{ position: "absolute", inset: 0, background: "#04090f" }}>
      <Stars alpha={(1 - toNavy) * grow} drift={lf * 0.05} />
      {toNavy < 1 ? <Earth view={{ cx: 540, cy: 860, r, lon: 2.2 + lf * 0.003, tilt: 0.3, alpha: (1 - toNavy) * Math.min(1, grow * 1.5), light: [-0.4, -0.5, 0.77] }} /> : null}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 45%, ${C.blue} 0%, ${C.navy} 70%)`, opacity: toNavy }} />
      <KeyWord f={f} at={fMsg} text="الوعي يبدأ من المعلومة الموثوقة" size={70} top={430} />
      <div dir="rtl" style={{ position: "absolute", top: 640, left: 60, right: 60, textAlign: "center", opacity: sub, transform: `translateY(${(1 - sub) * 16}px)` }}>
        <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 44, color: C.amber }}>تابع الجهات الرسمية المختصة</span>
      </div>
      <div dir="rtl" style={{ position: "absolute", top: 740, left: 90, right: 90, display: "flex", flexDirection: "column", gap: 18, alignItems: "stretch" }}>
        {BODIES.map((b, k) => {
          const p = ramp(f, fMsg + 52 + k * 7, 12);
          return (
            <div key={b} style={{ opacity: p, transform: `translateX(${(1 - p) * -30}px)`, display: "flex", alignItems: "center", gap: 18, padding: "14px 28px", borderRadius: 18, background: "rgba(16,43,64,0.85)", border: "1.5px solid rgba(86,199,217,0.4)" }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, background: C.cyan, transform: "rotate(45deg)", flexShrink: 0 }} />
              <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 38, color: C.white }}>{b}</span>
            </div>
          );
        })}
      </div>
      <div dir="rtl" style={{ position: "absolute", top: 1338, left: 80, right: 80, textAlign: "center", opacity: ramp(lf, 20, 20) }}>
        <span style={{ fontFamily: FONT, fontWeight: 500, fontSize: 28, color: C.muted }}>محتوى توعوي افتراضي لا يشير إلى وجود خطر إشعاعي حالي.</span>
      </div>
    </div>
  );
};

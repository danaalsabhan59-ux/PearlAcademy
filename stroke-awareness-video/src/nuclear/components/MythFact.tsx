import React from "react";
import { C, FONT, ramp } from "../theme";

/** «خرافة أم حقيقة؟» — the misconception is asked, struck out, then corrected. */
export const MythFact: React.FC<{ f: number; q: number; no: number; yes: number; out: number }> = ({ f, q, no, yes, out }) => {
  const a = ramp(f, q - 2, 14);
  const strike = ramp(f, no - 2, 12);
  const fact = ramp(f, yes - 2, 14);
  const o = ramp(f, out - 10, 10);
  if (a <= 0 || o >= 1) return null;
  const tag = (t: string, col: string) => (
    <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 28, color: C.navy, background: col, borderRadius: 999, padding: "3px 16px", marginInlineEnd: 14 }}>{t}</span>
  );
  return (
    <div dir="rtl" style={{ position: "absolute", top: 236, left: 50, right: 50, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: 1 - o, zIndex: 800 }}>
      <div style={{ position: "relative", opacity: a * (1 - 0.45 * fact), transform: `translateY(${(1 - a) * 18}px) scale(${1 - 0.12 * fact})` }}>
        <div style={{ display: "flex", alignItems: "center", padding: "10px 26px", borderRadius: 18, background: "rgba(8,24,39,0.8)", border: "1.5px solid rgba(245,247,250,0.35)" }}>
          {tag("خرافة؟", "#c9d6e2")}
          <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 44, color: C.white, whiteSpace: "nowrap" }}>الإشعاع سحابة تحملها الرياح</span>
        </div>
        {strike > 0 ? (
          <>
            <div style={{ position: "absolute", top: "50%", right: 18, height: 5, width: `calc(${strike * 100}% - 36px)`, background: C.amber, borderRadius: 3, transform: "translateY(-50%)" }} />
            <div style={{ position: "absolute", left: -26, top: -22, width: 58, height: 58, borderRadius: "50%", background: C.amber, color: C.navy, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 700, fontSize: 40, transform: `scale(${0.4 + 0.6 * strike})`, opacity: strike }}>✕</div>
          </>
        ) : null}
      </div>
      {fact > 0 ? (
        <div style={{ display: "flex", alignItems: "center", padding: "12px 28px", borderRadius: 18, background: "rgba(8,24,39,0.86)", border: `2px solid ${C.cyan}`, opacity: fact, transform: `translateY(${(1 - fact) * 24}px)` }}>
          {tag("حقيقة", C.cyan)}
          <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 46, color: C.amber, whiteSpace: "nowrap" }}>مواد مشعة ≠ الإشعاع نفسه</span>
        </div>
      ) : null}
    </div>
  );
};

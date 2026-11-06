import React from "react";
import { KeyWord, Tag } from "../components/Text";
import { sc, XF } from "../data/timeline";
import { at } from "../data/words";
import { C, FONT, lerp, ramp, rnd } from "../theme";

const VIAL = { x: 420, y: 1010 };

/** Specialist in profile (stylised, no identity) holding a generic survey meter. */
const Specialist: React.FC<{ a: number; lf: number }> = ({ a, lf }) => (
  <g opacity={a} transform={`translate(${lerp(-80, 0, a)} 0)`}>
    {/* body in lab coat */}
    <path d="M 70 1250 L 90 980 Q 110 900 190 890 L 250 890 Q 320 900 330 990 L 345 1250 Z" fill="#dfe7ee" />
    <path d="M 200 892 L 220 1000 L 240 892 Z" fill="#9fb4c6" />
    <circle cx={220} cy={830} r={58} fill="#2c4a63" />
    <path d="M 168 812 Q 220 760 274 812 L 274 790 Q 220 740 166 790 Z" fill="#17304a" />
    {/* arm to the meter */}
    <path d="M 300 960 Q 360 1010 400 1040" stroke="#dfe7ee" strokeWidth={34} strokeLinecap="round" fill="none" />
    {/* survey meter + probe */}
    <g transform={`translate(400 1010) rotate(${Math.sin(lf / 30) * 2})`}>
      <rect x={0} y={0} width={120} height={84} rx={14} fill="#f0c64e" stroke="#7d6420" strokeWidth={3} />
      <rect x={14} y={12} width={92} height={40} rx={6} fill="#0d2233" />
      {/* abstract indicator bars — no numbers */}
      {[0, 1, 2, 3, 4, 5].map((k) => (
        <rect key={k} x={20 + k * 14} y={44 - 6 - k * 3} width={9} height={6 + k * 3} fill={C.cyan} opacity={k <= 1 + (Math.floor(lf / 9) % 2) ? 0.95 : 0.2} />
      ))}
      <path d="M 120 50 Q 160 60 170 110" stroke="#334" strokeWidth={5} fill="none" />
    </g>
  </g>
);

export const S6Monitoring: React.FC<{ f: number }> = ({ f }) => {
  const s = sc("s6");
  const lf = f - s.start;
  const len = s.end - s.start;
  const drop = ramp(lf, 0, 34, (t) => t * t);
  const fill = ramp(lf, 30, 26);
  const fRumor = at("s6", "بالشائعات");
  const fBut = at("s6", "بل");
  const fDev = at("s6", "بأجهزة");
  const fMeas = at("s6", "والقياسات");
  const fOff = at("s6", "الرسمية");
  const fBody = at("s6", "هيئة");
  const rumors = Math.min(ramp(f, fRumor - 6, 14), 1 - ramp(f, fBut + 4, 16));
  const spec = ramp(f, fDev - 6, 24);
  const screen = ramp(f, fMeas - 4, 24);
  const official = ramp(f, fOff - 4, 18);
  const exit = ramp(lf, len - 34, 34 + XF);
  const curve = ramp(f, fMeas + 6, 70);
  const scrS = 1 - exit * 0.96;
  return (
    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${C.charcoal} 0%, ${C.blue} 55%, #0b1824 100%)` }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 1 - exit }}>
        {/* bench */}
        <rect x={-20} y={1150} width={1120} height={22} fill="#2f4d66" />
        <rect x={-20} y={1172} width={1120} height={200} fill="#14273a" />
        {/* vial */}
        <g transform={`translate(${VIAL.x} ${VIAL.y})`}>
          <rect x={-34} y={-150} width={68} height={290} rx={30} fill="rgba(170,220,240,0.10)" stroke="#cfe9f3" strokeWidth={4} />
          <rect x={-28} y={130 - 150 * fill} width={56} height={150 * fill + 4} rx={24} fill={C.cyan} opacity={0.5} />
          <rect x={-40} y={-170} width={80} height={26} rx={6} fill="#56C7D9" />
          <rect x={-26} y={-60} width={52} height={36} rx={4} fill="#f5f7fa" />
          <text x={0} y={-36} textAnchor="middle" fontFamily="IBM Plex Sans Arabic" fontWeight={700} fontSize={20} fill="#102B40">عينة</text>
        </g>
        {/* droplet entering the vial (from the previous scene) */}
        {lf < 36 ? (
          <path transform={`translate(${VIAL.x} ${lerp(420, VIAL.y - 40, drop)}) scale(0.5)`} d="M 0 -120 C 30 -70 70 -20 70 25 C 70 70 38 100 0 100 C -38 100 -70 70 -70 25 C -70 -20 -30 -70 0 -120 Z" fill="#56C7D9" opacity={0.8} />
        ) : null}
        <Specialist a={spec} lf={lf} />
        {/* rumours dissolving */}
        {rumors > 0
          ? ["؟", "!", "؟؟", "!؟"].map((t, k) => {
              const x = 640 + (k % 2) * 220 + rnd(k) * 40;
              const y = 600 + Math.floor(k / 2) * 170 - lf * 0.4;
              return (
                <g key={k} opacity={rumors * 0.9} transform={`translate(${x} ${y}) scale(${0.8 + 0.2 * rumors})`}>
                  <path d="M -80 -50 H 80 Q 96 -50 96 -34 V 24 Q 96 40 80 40 H -30 L -56 66 L -50 40 H -80 Q -96 40 -96 24 V -34 Q -96 -50 -80 -50 Z" fill="rgba(245,247,250,0.10)" stroke="#9fb4c6" strokeWidth={3} />
                  <text x={0} y={10} textAnchor="middle" fontFamily="IBM Plex Sans Arabic" fontWeight={700} fontSize={44} fill="#c9d6e2">{t}</text>
                  <line x1={-90} y1={50} x2={90} y2={-60} stroke={C.amber} strokeWidth={5} opacity={ramp(f, fBut - 10, 10)} />
                </g>
              );
            })
          : null}
      </svg>
      {/* analysis screen (illustrative only) */}
      {screen > 0 ? (
        <div style={{ position: "absolute", left: 560, top: 540, width: 460, height: 520, opacity: screen, transform: `translateX(${(1 - screen) * 80}px) scale(${scrS})`, transformOrigin: "230px 260px", borderRadius: 22, background: "rgba(8,24,39,0.9)", border: `2px solid ${C.cyan}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", overflow: "hidden" }}>
          <div dir="rtl" style={{ padding: "16px 24px", borderBottom: "1px solid rgba(86,199,217,0.3)", fontFamily: FONT, fontWeight: 700, fontSize: 30, color: C.white }}>تحليل العينات</div>
          <svg width={460} height={250} style={{ display: "block" }}>
            {[0, 1, 2, 3].map((k) => <line key={k} x1={30} x2={430} y1={40 + k * 50} y2={40 + k * 50} stroke="rgba(86,199,217,0.15)" />)}
            <path
              d={Array.from({ length: 81 }, (_, i) => {
                const x = 30 + i * 5;
                const y = 200 - 30 * Math.exp(-((i - 22) ** 2) / 40) - 70 * Math.exp(-((i - 50) ** 2) / 18) - 20 * Math.exp(-((i - 66) ** 2) / 30) - 6 * Math.sin(i * 1.7) * 0.4;
                return `${i ? "L" : "M"} ${x} ${y}`;
              }).join(" ")}
              fill="none"
              stroke={C.cyan}
              strokeWidth={4}
              pathLength={1}
              strokeDasharray={`${curve} 1`}
            />
            <line x1={30 + curve * 400} x2={30 + curve * 400} y1={20} y2={210} stroke={C.amber} strokeWidth={2} opacity={curve < 1 ? 0.8 : 0} />
          </svg>
          <div style={{ padding: "0 24px", display: "flex", flexDirection: "column", gap: 12 }}>
            {[0, 1, 2].map((k) => (
              <div key={k} style={{ display: "flex", gap: 12, alignItems: "center", opacity: ramp(f, fMeas + 20 + k * 10, 10) }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: k < 2 || official > 0 ? C.cyan : "rgba(86,199,217,0.3)" }} />
                <div style={{ height: 14, borderRadius: 7, background: "rgba(245,247,250,0.25)", width: 160 + k * 60 }} />
              </div>
            ))}
          </div>
          {official > 0 ? (
            <div dir="rtl" style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "16px 20px", background: "rgba(86,199,217,0.16)", borderTop: `2px solid ${C.cyan}`, display: "flex", alignItems: "center", gap: 12, opacity: official }}>
              <svg width={34} height={34}><circle cx={17} cy={17} r={15} fill={C.cyan} /><path d="M 9 17 l 6 6 l 11 -12" stroke={C.navy} strokeWidth={4} fill="none" strokeLinecap="round" /></svg>
              <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 30, color: C.white }}>مصدر رسمي معتمد</span>
            </div>
          ) : null}
        </div>
      ) : null}
      {/* official body (text only, no logo) */}
      <div dir="rtl" style={{ position: "absolute", left: 60, right: 60, top: 1250, textAlign: "center", opacity: ramp(f, fBody - 2, 14) * (1 - exit), zIndex: 760 }}>
        <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 38, color: C.white, background: "rgba(8,24,39,0.86)", border: `2px solid ${C.amber}`, borderRadius: 16, padding: "10px 26px" }}>هيئة الرقابة النووية والإشعاعية</span>
      </div>
      <Tag f={f} a={fMeas} b={s.end + XF} text="شاشة توضيحية — لا تعرض قياسات حقيقية" top={376} />
      <KeyWord f={f} at={at("s6", "الخطر")} out={fDev - 4} text="كيف نعرف مستوى الخطر؟" size={60} top={250} />
      <KeyWord f={f} at={fDev} out={fMeas - 2} text="الرصد الإشعاعي" size={68} color={C.amber} top={250} chip />
      <KeyWord f={f} at={fMeas} out={fOff - 2} text="تحليل العينات" size={68} color={C.amber} top={250} chip />
      <KeyWord f={f} at={fOff} out={s.end + 6} text="المعلومات الرسمية" size={68} color={C.cyan} top={250} chip />
    </div>
  );
};

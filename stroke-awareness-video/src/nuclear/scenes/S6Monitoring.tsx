import React from "react";
import { KeyWord } from "../components/Text";
import { sc, XF } from "../data/timeline";
import { at } from "../data/words";
import { C, FONT, lerp, ramp, rnd } from "../theme";

const VIAL = { x: 420, y: 1010 };

/** Specialist in profile (stylised, no identity): lab coat, safety glasses, gloves, generic survey meter. */
const Specialist: React.FC<{ a: number; lf: number }> = ({ a, lf }) => {
  const bob = Math.sin(lf / 40) * 2;
  return (
    <g opacity={a} transform={`translate(${lerp(-90, 0, a)} ${bob})`}>
      {/* back arm */}
      <path d="M 170 960 Q 200 1060 260 1100" stroke="#cfd9e2" strokeWidth={40} strokeLinecap="round" fill="none" />
      {/* torso / lab coat */}
      <path d="M 92 1250 L 104 1010 Q 112 930 182 908 L 262 904 Q 320 918 330 1000 L 346 1250 Z" fill="#eef3f7" />
      <path d="M 206 906 L 232 1010 L 252 904 Z" fill="#2f5d7a" />
      <path d="M 196 906 L 222 1060 M 262 904 L 238 1060" stroke="#c7d3dd" strokeWidth={4} fill="none" />
      <rect x={270} y={1040} width={42} height={52} rx={4} fill="none" stroke="#c7d3dd" strokeWidth={3} />
      <rect x={280} y={1026} width={6} height={30} rx={2} fill={C.cyan} />
      <rect x={200} y={1080} width={36} height={46} rx={4} fill="#56C7D9" opacity={0.85} />
      {/* neck + head */}
      <rect x={210} y={872} width={34} height={40} rx={10} fill="#b98a6a" />
      <path d="M 186 818 Q 188 760 236 756 Q 290 756 296 812 Q 300 846 284 866 L 290 884 Q 280 892 264 888 Q 246 902 222 896 Q 190 884 186 818 Z" fill="#c99a78" />
      <path d="M 180 820 Q 176 744 240 738 Q 300 738 300 796 Q 280 776 250 778 Q 228 790 214 812 L 196 852 Q 180 846 180 820 Z" fill="#1d2b38" />
      <circle cx={212} cy={826} r={10} fill="#b98a6a" />
      {/* safety glasses */}
      <path d="M 236 810 L 300 806" stroke="#9fe6f2" strokeWidth={5} strokeLinecap="round" />
      <path d="M 262 806 L 302 804 L 300 828 L 266 830 Z" fill="rgba(159,230,242,0.35)" stroke="#9fe6f2" strokeWidth={3} />
      {/* front arm + gloved hand holding the meter */}
      <path d="M 300 950 Q 360 1010 398 1038" stroke="#eef3f7" strokeWidth={38} strokeLinecap="round" fill="none" />
      <circle cx={404} cy={1044} r={20} fill="#8fd0e3" />
      <g transform={`translate(392 1006) rotate(${Math.sin(lf / 30) * 2})`}>
        <rect x={0} y={0} width={124} height={86} rx={14} fill="#f0c64e" stroke="#7d6420" strokeWidth={3} />
        <rect x={14} y={12} width={96} height={40} rx={6} fill="#0d2233" />
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <rect key={k} x={20 + k * 14} y={44 - 6 - k * 3} width={9} height={6 + k * 3} fill={C.cyan} opacity={k <= 1 + (Math.floor(lf / 9) % 2) ? 0.95 : 0.2} />
        ))}
        <circle cx={30} cy={68} r={7} fill="#7d6420" />
        <circle cx={56} cy={68} r={7} fill="#7d6420" />
        <path d="M 124 50 Q 164 60 172 112" stroke="#2b3440" strokeWidth={6} fill="none" />
        <rect x={160} y={108} width={26} height={54} rx={8} fill="#3a4654" />
      </g>
    </g>
  );
};

export const S6Monitoring: React.FC<{ f: number }> = ({ f }) => {
  const s = sc("s6");
  const lf = f - s.start;
  const len = s.end - s.start;
  const drop = ramp(lf, 0, 34, (t) => t * t);
  const fill = ramp(lf, 30, 26);
  const fRumor = at("s6", "الشائعات");
  const fBut = at("s6", "بل");
  const fDev = at("s6", "أجهزة");
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
      <KeyWord f={f} at={at("s6", "الخطر")} out={fDev - 4} text="كيف نعرف مستوى الخطر؟" size={60} top={250} />
      <KeyWord f={f} at={fDev} out={fMeas - 2} text="الرصد الإشعاعي" size={68} color={C.amber} top={250} chip />
      <KeyWord f={f} at={fMeas} out={fOff - 2} text="تحليل العينات" size={68} color={C.amber} top={250} chip />
      <KeyWord f={f} at={fOff} out={s.end + 6} text="المعلومات الرسمية" size={68} color={C.cyan} top={250} chip />
    </div>
  );
};

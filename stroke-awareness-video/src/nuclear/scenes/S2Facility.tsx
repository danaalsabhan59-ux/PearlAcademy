import React from "react";
import { Callout } from "../components/Callout";
import { KeyWord, Tag } from "../components/Text";
import { sc, XF } from "../data/timeline";
import { at } from "../data/words";
import { C, lerp, ramp, rnd } from "../theme";

/** World-space anchor points (before camera transform). */
const DOME = { cx: 430, top: 610, base: 1250, half: 185 };
export const CRACK = { x: 548, y: 668 };

/** Camera: settle from the map push-in, cutaway reveal, slow push-in, tilt up after the leak. */
const camera = (lf: number, len: number) => {
  const settle = ramp(lf, 0, 60);
  const push = ramp(lf, 120, len - 160);
  const up = ramp(lf, len - 36, 36 + XF);
  const s = lerp(1.75, 1.28, settle) * lerp(1, 1.14, push);
  const ox = lerp(0, -40, push);
  const oy = lerp(-120, 20, settle) + up * 520;
  return { s, ox, oy };
};

export const S2Facility: React.FC<{ f: number }> = ({ f }) => {
  const sc2 = sc("s2");
  const lf = f - sc2.start;
  const len = sc2.end - sc2.start;
  const cam = camera(lf, len);
  const cut = ramp(lf, 34, 70); // cutaway reveal
  const damage = ramp(f, at("s2", "الحوادث"), 40);
  const leak = at("s2", "تتسرب");
  const flowSpeed = lerp(1, 0.18, damage);
  const coolant = damage > 0.5 ? C.amber : C.cyan;
  const pulse = 0.6 + 0.4 * Math.sin(lf / 7);
  const labelsOut = at("s2", "الحوادث") + 4;
  const P = (x: number, y: number) => ({ x: 540 + (x - 540 + cam.ox) * cam.s, y: 960 + (y - 960 + cam.oy) * cam.s });
  const dash = (k: number) => -lf * 2.2 * flowSpeed * k;

  return (
    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${C.navy} 0%, ${C.blue} 62%, #0c1c2a 100%)` }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="core" cx="50%" cy="55%" r="60%">
            <stop offset="0%" stopColor={C.cyan} stopOpacity={0.95} />
            <stop offset="100%" stopColor={C.cyan} stopOpacity={0} />
          </radialGradient>
          <linearGradient id="shell" x1="0" x2="1">
            <stop offset="0%" stopColor="#1d3a52" />
            <stop offset="45%" stopColor="#35597a" />
            <stop offset="100%" stopColor="#173047" />
          </linearGradient>
          <linearGradient id="tower" x1="0" x2="1">
            <stop offset="0%" stopColor="#1b3349" />
            <stop offset="50%" stopColor="#2f5170" />
            <stop offset="100%" stopColor="#152a3d" />
          </linearGradient>
          <pattern id="hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="10" height="10" fill="#4d6f8c" />
            <line x1="0" y1="0" x2="0" y2="10" stroke="#2a465f" strokeWidth="4" />
          </pattern>
          <clipPath id="facade">
            <rect x={DOME.cx - DOME.half - 20} y={300} width={(DOME.half * 2 + 40) * (1 - cut)} height={1000} />
          </clipPath>
          <filter id="soft"><feGaussianBlur stdDeviation="10" /></filter>
          <filter id="glow4"><feGaussianBlur stdDeviation="4" /></filter>
        </defs>
        <g transform={`translate(540 960) scale(${cam.s}) translate(${-540 + cam.ox} ${-960 + cam.oy})`}>
          {/* distant ridge + ground */}
          <path d="M -400 1180 Q -100 1090 200 1150 T 800 1130 T 1500 1160 L 1500 1260 L -400 1260 Z" fill="#0d2234" />
          <rect x={-600} y={1250} width={2300} height={900} fill="#0b1824" />
          {Array.from({ length: 14 }, (_, i) => (
            <line key={i} x1={-600 + i * 170} y1={1250} x2={-1800 + i * 340} y2={2100} stroke={C.cyan} strokeOpacity={0.07} />
          ))}
          {/* cooling tower + vapour (water vapour only) */}
          <path d="M 880 1250 Q 905 1020 895 830 L 1035 830 Q 1025 1020 1050 1250 Z" fill="url(#tower)" />
          <ellipse cx={965} cy={830} rx={70} ry={10} fill="#0f2233" />
          {[0, 1, 2, 3, 4].map((i) => {
            const t = ((lf * 0.6 + i * 40) % 200) / 200;
            return <ellipse key={i} cx={965 + t * 60} cy={810 - t * 260} rx={50 + t * 70} ry={30 + t * 40} fill="#cfdbe6" opacity={0.16 * (1 - t)} filter="url(#soft)" />;
          })}
          {/* turbine hall */}
          <rect x={650} y={1040} width={200} height={210} fill="#1a3248" stroke="#2c4c68" strokeWidth={3} />
          <rect x={650} y={1040} width={200} height={20} fill="#2a4a66" />
          <g opacity={cut}>
            <rect x={680} y={1130} width={140} height={60} rx={28} fill="#24435f" stroke={C.cyan} strokeOpacity={0.4} strokeWidth={2} />
            {[0, 1, 2, 3].map((k) => (
              <line key={k} x1={700 + k * 32} y1={1136} x2={700 + k * 32} y2={1184} stroke={C.cyan} strokeOpacity={0.5} strokeWidth={3} transform={`rotate(${lf * 6 * flowSpeed} ${700 + k * 32} 1160)`} />
            ))}
          </g>
          {/* cooling water loop turbine ⇄ tower */}
          <path d="M 850 1200 L 900 1200" stroke={coolant} strokeWidth={10} fill="none" opacity={0.5} />
          <path d="M 850 1200 L 900 1200" stroke={C.white} strokeWidth={4} strokeDasharray="10 14" strokeDashoffset={dash(1)} fill="none" opacity={0.7} />

          {/* ===== containment interior (revealed by the cutaway) ===== */}
          <g>
            <path d={`M ${DOME.cx - DOME.half} ${DOME.base} L ${DOME.cx - DOME.half} ${DOME.top + DOME.half} A ${DOME.half} ${DOME.half} 0 0 1 ${DOME.cx + DOME.half} ${DOME.top + DOME.half} L ${DOME.cx + DOME.half} ${DOME.base} Z`} fill="#0e2133" />
            {/* biological shield */}
            <rect x={322} y={870} width={136} height={350} fill="url(#hatch)" opacity={0.9} />
            <rect x={344} y={890} width={92} height={310} rx={10} fill="#0e2133" />
            {/* pressure vessel + core */}
            <rect x={352} y={900} width={76} height={290} rx={36} fill="#3b5d7c" stroke="#86a6c0" strokeWidth={3} />
            <rect x={362} y={1040} width={56} height={120} rx={8} fill="#0d2233" />
            <rect x={354} y={1020} width={72} height={160} fill="url(#core)" opacity={0.5 + 0.3 * pulse} filter="url(#glow4)" />
            {[0, 1, 2, 3, 4].map((k) => (
              <rect key={k} x={368 + k * 10} y={1050} width={5} height={100} rx={2} fill={C.cyan} opacity={0.85} />
            ))}
            {/* steam generator */}
            <rect x={505} y={860} width={64} height={300} rx={30} fill="#36587a" stroke="#86a6c0" strokeWidth={3} />
            {/* primary loop: hot leg / cold leg */}
            <path d="M 428 960 L 505 960" stroke={coolant} strokeWidth={14} fill="none" opacity={0.55} />
            <path d="M 505 1130 L 428 1130" stroke={coolant} strokeWidth={14} fill="none" opacity={0.55} />
            <path d="M 428 960 L 505 960" stroke={C.white} strokeWidth={4} strokeDasharray="10 12" strokeDashoffset={dash(1)} fill="none" />
            <path d="M 505 1130 L 428 1130" stroke={C.white} strokeWidth={4} strokeDasharray="10 12" strokeDashoffset={dash(1)} fill="none" />
            {/* steam line through the wall to the turbine */}
            <path d="M 569 900 L 640 900 L 640 1100 L 680 1100" stroke="#9fb8cc" strokeWidth={10} fill="none" opacity={0.6} />
            <path d="M 569 900 L 640 900 L 640 1100 L 680 1100" stroke={C.white} strokeWidth={3} strokeDasharray="8 14" strokeDashoffset={dash(1.4)} fill="none" opacity={0.75} />
            {/* sectioned containment wall (hatched) */}
            <path
              d={`M ${DOME.cx - DOME.half} ${DOME.base} L ${DOME.cx - DOME.half} ${DOME.top + DOME.half} A ${DOME.half} ${DOME.half} 0 0 1 ${DOME.cx + DOME.half} ${DOME.top + DOME.half} L ${DOME.cx + DOME.half} ${DOME.base}`}
              fill="none"
              stroke="url(#hatch)"
              strokeWidth={30}
            />
            <path
              d={`M ${DOME.cx - DOME.half + 17} ${DOME.base} L ${DOME.cx - DOME.half + 17} ${DOME.top + DOME.half} A ${DOME.half - 17} ${DOME.half - 17} 0 0 1 ${DOME.cx + DOME.half - 17} ${DOME.top + DOME.half} L ${DOME.cx + DOME.half - 17} ${DOME.base}`}
              fill="none"
              stroke="#9db6c9"
              strokeWidth={3}
            />
          </g>
          {/* exterior facade, wiped away by the cutaway */}
          <g clipPath="url(#facade)">
            <path d={`M ${DOME.cx - DOME.half - 15} ${DOME.base} L ${DOME.cx - DOME.half - 15} ${DOME.top + DOME.half} A ${DOME.half + 15} ${DOME.half + 15} 0 0 1 ${DOME.cx + DOME.half + 15} ${DOME.top + DOME.half} L ${DOME.cx + DOME.half + 15} ${DOME.base} Z`} fill="url(#shell)" />
            {Array.from({ length: 6 }, (_, i) => (
              <line key={i} x1={DOME.cx - DOME.half - 15} x2={DOME.cx + DOME.half + 15} y1={DOME.top + DOME.half + 60 + i * 70} y2={DOME.top + DOME.half + 60 + i * 70} stroke="#0f2233" strokeOpacity={0.35} />
            ))}
          </g>
          {/* cut edge highlight */}
          {cut > 0 && cut < 1 ? <line x1={DOME.cx - DOME.half - 20 + (DOME.half * 2 + 40) * (1 - cut)} x2={DOME.cx - DOME.half - 20 + (DOME.half * 2 + 40) * (1 - cut)} y1={590} y2={1250} stroke={C.cyan} strokeWidth={3} opacity={0.8} /> : null}

          {/* damage: hairline crack + soft amber warning halo (no explosion) */}
          <g opacity={damage}>
            <path d={`M ${CRACK.x - 20} ${CRACK.y - 14} l 12 14 l -6 10 l 16 12 l -4 12`} stroke={C.amber} strokeWidth={4} fill="none" />
            <circle cx={CRACK.x - 10} cy={CRACK.y + 6} r={36 + 10 * pulse} fill="none" stroke={C.amber} strokeWidth={2} opacity={0.5} />
            <rect x={354} y={1020} width={72} height={160} fill={C.amber} opacity={0.12 * pulse} />
          </g>
          {/* symbolic radioactive material seeping out and rising */}
          {Array.from({ length: 46 }, (_, i) => {
            const born = leak - sc2.start + i * 5.2;
            const age = lf - born;
            if (age < 0) return null;
            const x = CRACK.x - 6 + age * (0.9 + rnd(i) * 1.4) + Math.sin(age / 14 + i) * 10;
            const y = CRACK.y - age * (1.9 + rnd(i + 9) * 1.2);
            const a = Math.min(1, age / 10);
            return (
              <g key={i} opacity={a}>
                <circle cx={x} cy={y} r={9} fill={C.amber} opacity={0.25} />
                <circle cx={x} cy={y} r={4} fill={C.amber} />
              </g>
            );
          })}
        </g>
      </svg>
      {/* callouts (screen space, following the camera) */}
      {(() => {
        const r = P(390, 1000), dm = P(430, 700), co = P(470, 960), sh = P(330, 1180);
        return (
          <>
            <Callout f={f} at={sc2.start + 92} out={labelsOut} x={r.x} y={r.y} tx={170} ty={700} text="المفاعل" />
            <Callout f={f} at={sc2.start + 112} out={labelsOut} x={dm.x} y={dm.y} tx={860} ty={500} text="مبنى الاحتواء" />
            <Callout f={f} at={sc2.start + 132} out={labelsOut} x={co.x} y={co.y} tx={880} ty={1290} text="أنظمة التبريد" />
            <Callout f={f} at={sc2.start + 152} out={labelsOut} x={sh.x} y={sh.y} tx={190} ty={1290} text="الحواجز الواقية" />
          </>
        );
      })()}
      <Tag f={f} a={sc2.start + 20} b={sc2.end + XF} text="نموذج توضيحي افتراضي — ليس منشأة حقيقية" top={376} />
      <KeyWord f={f} at={at("s2", "انفجار")} out={at("s2", "تتسرب") - 2} text="تضرر المنشأة ≠ انفجار نووي" size={62} top={250} chip />
      <KeyWord f={f} at={at("s2", "تتسرب")} out={sc2.end + 4} text="احتمال تسرب مواد مشعة" size={62} color={C.amber} top={250} chip />
    </div>
  );
};

import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { PersistentInstitutionalHeader } from "../../nuclear/components/PersistentInstitutionalHeader";
import { KeyWord } from "../../nuclear/components/Text";
import { FONT, lerp, ramp } from "../../nuclear/theme";
import { ICONS, SIGNS } from "../Poster";

/**
 * «لحظة هبوط السكر» — World Diabetes Day reel, Emergency Medicine Club. 40 s, 1080×1920, silent (music only).
 * Facts are the same WHO/CDC-sourced content as the infographic (CDC: hypoglycaemia signs, <70 mg/dL, 15-15 rule).
 */
export const REEL_TOTAL = 1200;
const K = { navy: "#081827", blue2: "#102B40", blue: "#2E8BE6", sky: "#8EC5FF", white: "#F5F7FA", amber: "#E8AD45", alert: "#FF6B5A", juice: "#F4A23A", muted: "rgba(245,247,250,0.72)" };

// scene windows (frames)
const SC = { s1: [0, 160], s2: [150, 370], s3: [360, 850], s4: [840, 1030], s5: [1020, 1200] } as const;
const vis = (f: number, [a, b]: readonly [number, number], d = 12) => Math.min(ramp(f, a, d), 1 - ramp(f, b - d, d));

// ------------------------------------------------------------------ S1: the moment
const Student: React.FC<{ f: number; s: number }> = ({ f, s }) => {
  const sway = Math.sin(f / 9) * 3 * s;
  const trem = Math.sin(f * 2.3) * 4 * s;
  const eye = lerp(1, 0.35, s);
  return (
    <g>
      {/* desk */}
      <rect x={250} y={1060} width={580} height={30} rx={8} fill="#6b4f3a" />
      <rect x={290} y={1090} width={20} height={230} fill="#4e3a2b" />
      <rect x={770} y={1090} width={20} height={230} fill="#4e3a2b" />
      <g transform={`rotate(${sway} 540 1060)`}>
        {/* torso */}
        <path d="M 400 1060 Q 400 930 470 905 L 610 905 Q 680 930 680 1060 Z" fill="#2E5E86" />
        <path d="M 512 905 L 540 950 L 568 905 Z" fill="#dfe7ee" />
        {/* neck + head */}
        <rect x={522} y={860} width={36} height={52} rx={12} fill="#c99a78" />
        <ellipse cx={540} cy={790} rx={78} ry={88} fill="#d4a582" />
        <path d="M 462 780 Q 462 690 540 688 Q 620 690 620 780 Q 600 735 540 738 Q 480 735 462 780 Z" fill="#1d2b38" />
        {/* eyes (heavier as symptoms grow) */}
        {[510, 570].map((x) => (
          <ellipse key={x} cx={x} cy={792} rx={9} ry={9 * eye} fill="#1d2b38" />
        ))}
        <path d={`M 522 838 Q 540 ${838 - 6 + 10 * s} 558 838`} stroke="#8a5a44" strokeWidth={4} fill="none" strokeLinecap="round" />
        {/* sweat drops */}
        {[0, 1, 2].map((k) => {
          const t = ((f * 0.8 + k * 30) % 90) / 90;
          return <path key={k} d="M 0 -10 C 5 -3 8 2 8 6 a8 8 0 0 1 -16 0 C -8 2 -5 -3 0 -10 Z" transform={`translate(${[478, 604, 590][k]} ${742 + t * 60})`} fill="#8EC5FF" opacity={s * (1 - t) * 0.9} />;
        })}
        {/* arms + trembling hand on the desk */}
        <path d={`M 420 1000 Q 430 1050 ${470 + trem} 1056`} stroke="#2E5E86" strokeWidth={42} strokeLinecap="round" fill="none" />
        <path d={`M 660 1000 Q 650 1050 ${610 + trem} 1056`} stroke="#2E5E86" strokeWidth={42} strokeLinecap="round" fill="none" />
        <circle cx={610 + trem} cy={1056} r={22} fill="#d4a582" />
        <circle cx={470 - trem * 0.6} cy={1056} r={22} fill="#d4a582" />
      </g>
      {/* notebook */}
      <rect x={480} y={1046} width={130} height={14} rx={3} fill="#e9eef3" />
      {/* dizziness spiral */}
      <g transform={`translate(540 650) rotate(${f * 4})`} opacity={s}>
        <path d="M 0 0 m -26 0 a 26 26 0 1 1 26 26 a 16 16 0 1 1 -16 -16 a 7 7 0 1 1 7 7" fill="none" stroke={K.amber} strokeWidth={5} strokeLinecap="round" />
      </g>
      {/* tremor marks near hand */}
      <g opacity={s}>
        <path d="M 660 1020 l 14 -10 M 668 1040 l 18 -4 M 664 1060 l 16 6" stroke={K.amber} strokeWidth={4} strokeLinecap="round" />
      </g>
    </g>
  );
};

const S1: React.FC<{ f: number }> = ({ f }) => {
  const s = ramp(f, 55, 60);
  const push = lerp(1.3, 1.42, ramp(f, 0, 160, (t) => t));
  return (
    <AbsoluteFill style={{ opacity: vis(f, SC.s1) }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, transform: `scale(${push})`, transformOrigin: "540px 820px" }}>
        {/* classroom: board + back rows */}
        <rect x={140} y={430} width={800} height={190} rx={10} fill="#1d3a50" stroke="#2c5370" strokeWidth={6} opacity={0.55} />
        {[0, 1, 2].map((k) => <line key={k} x1={200} x2={560 - k * 80} y1={480 + k * 40} y2={480 + k * 40} stroke="#4f7896" strokeWidth={4} opacity={0.6} />)}
        {[-1, 1].map((d) => <rect key={d} x={540 + d * 380 - 110} y={1150} width={220} height={20} rx={6} fill="#3d2f24" opacity={0.6} />)}
        <Student f={f} s={s} />
      </svg>
      <KeyWord f={f} at={12} out={76} text="زميلك مصاب بالسكري…" size={70} top={250} />
      <KeyWord f={f} at={80} out={SC.s1[1] - 4} text="وفجأة تغيّر حاله" size={78} color={K.amber} top={250} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ S2: what is happening
const S2: React.FC<{ f: number }> = ({ f }) => {
  const big = ramp(f, 222, 16);
  return (
    <AbsoluteFill style={{ opacity: vis(f, SC.s2) }}>
      <KeyWord f={f} at={160} out={218} text="هل تعرف ما الذي يحدث؟" size={72} top={300} />
      {big > 0 ? (
        <div style={{ position: "absolute", top: 270, left: 0, right: 0, textAlign: "center", fontFamily: FONT, direction: "rtl", opacity: big, transform: `scale(${0.85 + 0.15 * big})` }}>
          <div style={{ fontSize: 110, fontWeight: 700, color: K.amber, lineHeight: 1.1 }}>هبوط السكر</div>
          <div style={{ fontSize: 40, fontWeight: 600, color: K.sky, marginTop: 6 }}>
            أقل من <span style={{ direction: "ltr", unicodeBidi: "isolate" }}>70</span> ملغ/دل
          </div>
        </div>
      ) : null}
      <div style={{ position: "absolute", top: 640, left: 80, right: 80, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, direction: "rtl", fontFamily: FONT }}>
        {SIGNS.map(([icon, label], i) => {
          const p = ramp(f, 245 + i * 13, 12);
          return (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 18, padding: "20px 24px", borderRadius: 24, background: "rgba(8,24,39,0.7)", border: "1.5px solid rgba(142,197,255,0.35)", opacity: p, transform: `translateY(${(1 - p) * 30}px) scale(${0.9 + 0.1 * p})` }}>
              <div style={{ transform: "scale(1.35)", transformOrigin: "center", width: 62, height: 62, display: "flex", alignItems: "center", justifyContent: "center" }}>{ICONS[icon]}</div>
              <span style={{ fontSize: 40, fontWeight: 700, color: K.white }}>{label}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ S3: 15-15 rule
const STEP = [380, 540, 700] as const;
const S3: React.FC<{ f: number }> = ({ f }) => {
  const step = f < STEP[1] ? 0 : f < STEP[2] ? 1 : 2;
  const fill = ramp(f, STEP[0] + 20, 60);
  const sweep = ramp(f, STEP[1] + 16, 80);
  const check = ramp(f, STEP[1] + 100, 14);
  const plate = ramp(f, STEP[2] + 10, 18);
  const cx = 540, cy = 1010;
  return (
    <AbsoluteFill style={{ opacity: vis(f, SC.s3) }}>
      {/* rule badge + condition */}
      <div dir="rtl" style={{ position: "absolute", top: 230, left: 0, right: 0, textAlign: "center", fontFamily: FONT, opacity: ramp(f, 362, 14) }}>
        <span style={{ fontSize: 32, fontWeight: 600, color: K.sky }}>إذا كان واعياً ويستطيع البلع</span>
        <div style={{ marginTop: 10, fontSize: 64, fontWeight: 700, color: K.white }}>
          قاعدة <span style={{ color: K.amber }}>١٥ - ١٥</span>
        </div>
      </div>
      {/* progress dots */}
      <div style={{ position: "absolute", top: 440, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 14, direction: "rtl" }}>
        {[0, 1, 2].map((k) => (
          <div key={k} style={{ width: k === step ? 46 : 16, height: 16, borderRadius: 8, background: k <= step ? K.blue : "rgba(255,255,255,0.22)" }} />
        ))}
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <clipPath id="glassClip"><path d="M 455 860 L 625 860 L 605 1160 L 475 1160 Z" /></clipPath>
        </defs>
        {/* step 1: juice glass fills to half */}
        <g opacity={vis(f, [STEP[0], STEP[1] + 6], 14)}>
          <rect x={455} y={1160 - 300 * 0.5 * fill} width={170} height={300} fill={K.juice} clipPath="url(#glassClip)" />
          <path d="M 455 860 L 625 860 L 605 1160 L 475 1160 Z" fill="rgba(170,220,240,0.10)" stroke="#cfe9f3" strokeWidth={6} strokeLinejoin="round" />
          <line x1={447} x2={633} y1={1010} y2={1010} stroke={K.white} strokeWidth={3} strokeDasharray="10 8" opacity={0.7} />
          <text x={660} y={1020} fill={K.white} fontFamily="IBM Plex Sans Arabic" fontWeight={700} fontSize={34}>½ كوب</text>
        </g>
        {/* step 2: 15-minute clock */}
        <g opacity={vis(f, [STEP[1], STEP[2] + 6], 14)}>
          <circle cx={cx} cy={cy} r={170} fill="rgba(8,24,39,0.7)" stroke={K.sky} strokeWidth={8} />
          <path d={`M ${cx} ${cy} L ${cx} ${cy - 160} A 160 160 0 0 1 ${cx + 160 * Math.sin((Math.PI / 2) * sweep)} ${cy - 160 * Math.cos((Math.PI / 2) * sweep)} Z`} fill={K.blue} opacity={0.55} />
          {Array.from({ length: 12 }, (_, k) => (
            <line key={k} x1={cx + 140 * Math.sin((k * Math.PI) / 6)} y1={cy - 140 * Math.cos((k * Math.PI) / 6)} x2={cx + 156 * Math.sin((k * Math.PI) / 6)} y2={cy - 156 * Math.cos((k * Math.PI) / 6)} stroke={K.white} strokeWidth={k % 3 ? 3 : 6} />
          ))}
          <line x1={cx} y1={cy} x2={cx + 120 * Math.sin((Math.PI / 2) * sweep)} y2={cy - 120 * Math.cos((Math.PI / 2) * sweep)} stroke={K.white} strokeWidth={8} strokeLinecap="round" />
          <circle cx={cx} cy={cy} r={12} fill={K.amber} />
          {/* glucometer re-check */}
          <g transform="translate(760 1150)" opacity={check}>
            <rect x={0} y={0} width={120} height={170} rx={22} fill="#dfe7ee" />
            <rect x={16} y={18} width={88} height={64} rx={8} fill="#0d2233" />
            <path d="M 40 50 l 14 14 l 26 -28" stroke="#4CC38A" strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={60} cy={120} r={14} fill="#9fb3c4" />
          </g>
        </g>
        {/* step 3: light snack */}
        <g opacity={vis(f, [STEP[2], SC.s3[1]], 14)} transform={`translate(540 1030) scale(${0.85 + 0.15 * plate})`}>
          <ellipse cx={0} cy={60} rx={230} ry={50} fill="#e9eef3" />
          <ellipse cx={0} cy={50} rx={170} ry={32} fill="#c6ced6" />
          {[-110, -50, 10].map((x, k) => <rect key={k} x={x} y={-10 - k * 6} width={80} height={56} rx={6} fill="#e3b866" stroke="#b98a3e" strokeWidth={3} opacity={plate} />)}
          <path d="M 70 40 L 160 40 L 140 -20 Z" fill="#f2d16b" stroke="#c9a640" strokeWidth={3} opacity={plate} />
        </g>
      </svg>
      <KeyWord f={f} at={STEP[0] + 8} out={STEP[1] - 2} text="١٥ غراماً من سكر سريع" size={64} top={1290} />
      <KeyWord f={f} at={STEP[0] + 30} out={STEP[1] - 2} text="نصف كوب عصير، أو ملعقة سكر أو عسل" size={36} color={K.muted} top={1390} weight={600} />
      <KeyWord f={f} at={STEP[1] + 8} out={STEP[2] - 2} text="انتظر ١٥ دقيقة ثم أعِد القياس" size={58} top={1290} />
      <KeyWord f={f} at={STEP[1] + 30} out={STEP[2] - 2} text="وكرّر الخطوة إن بقي منخفضاً" size={36} color={K.muted} top={1390} weight={600} />
      <KeyWord f={f} at={STEP[2] + 8} out={SC.s3[1] - 4} text="بعد تحسّنه: وجبة خفيفة" size={62} top={1290} />
      <KeyWord f={f} at={STEP[2] + 30} out={SC.s3[1] - 4} text="تحتوي نشويات وبروتيناً" size={36} color={K.muted} top={1390} weight={600} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ S4: when to call
const S4: React.FC<{ f: number }> = ({ f }) => {
  const pulse = 0.5 + 0.5 * Math.sin((f - 840) / 10);
  const phone = ramp(f, 930, 16);
  return (
    <AbsoluteFill style={{ opacity: vis(f, SC.s4), background: "radial-gradient(ellipse at 50% 55%, rgba(255,107,90,0.14) 0%, rgba(8,24,39,0) 60%)" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <circle cx={540} cy={900} r={190 + 20 * pulse} fill="none" stroke={K.alert} strokeOpacity={0.25 + 0.2 * pulse} strokeWidth={4} />
        <circle cx={540} cy={900} r={150} fill="rgba(255,107,90,0.12)" stroke={K.alert} strokeWidth={6} />
        <g opacity={1 - phone}>
          <path d="M 540 800 L 640 975 H 440 Z" fill="none" stroke={K.alert} strokeWidth={10} strokeLinejoin="round" />
          <path d="M 540 860 V 920 M 540 948 V 950" stroke={K.white} strokeWidth={12} strokeLinecap="round" />
        </g>
        <g opacity={phone} transform={`translate(540 900) scale(${0.8 + 0.2 * phone})`}>
          <path d="M -70 -60 q 0 -20 20 -20 h 20 l 18 45 l -22 16 q 20 40 55 58 l 16 -22 l 45 18 v 20 q 0 20 -20 20 q -130 -6 -132 -135 Z" fill={K.white} />
        </g>
      </svg>
      <KeyWord f={f} at={850} out={SC.s4[1] - 4} text="إذا فقد الوعي أو لم يستطع البلع" size={60} top={300} />
      <KeyWord f={f} at={885} out={SC.s4[1] - 4} text="لا تُعطِه شيئاً بالفم" size={62} color={K.amber} top={1170} />
      <div dir="rtl" style={{ position: "absolute", top: 1270, left: 0, right: 0, textAlign: "center", fontFamily: FONT, opacity: phone }}>
        <span style={{ fontSize: 52, fontWeight: 700, color: K.white }}>واتصل بالإسعاف </span>
        <span style={{ fontSize: 90, fontWeight: 700, color: K.alert, direction: "ltr", unicodeBidi: "isolate" }}>997</span>
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ S5: closing
const S5: React.FC<{ f: number }> = ({ f }) => {
  const ring = ramp(f, 1022, 40);
  const card = ramp(f, 1090, 22);
  return (
    <AbsoluteFill style={{ opacity: ramp(f, SC.s5[0], 12) }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <circle cx={540} cy={560} r={150} fill="none" stroke={K.blue} strokeWidth={30} pathLength={1} strokeDasharray={`${ring} 1`} transform="rotate(-90 540 560)" />
      </svg>
      <div dir="rtl" style={{ position: "absolute", top: 490, left: 0, right: 0, textAlign: "center", fontFamily: FONT, opacity: ramp(f, 1040, 14) }}>
        <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1, color: K.white }}>١٤</div>
        <div style={{ fontSize: 32, fontWeight: 600, color: K.sky }}>نوفمبر</div>
      </div>
      <KeyWord f={f} at={1046} text="اليوم العالمي للسكري" size={70} top={250} />
      <KeyWord f={f} at={1062} text="كن مستعداً… قد تُنقذ حياة" size={50} color={K.amber} top={770} />
      <div style={{ position: "absolute", left: 540 - 165, top: 880, width: 330, opacity: card, transform: `translateY(${(1 - card) * 80}px) rotate(${(1 - card) * -4}deg)`, borderRadius: 18, overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.55)", border: "2px solid rgba(142,197,255,0.4)" }}>
        <Img src={staticFile("diabetes/infographic.png")} style={{ width: 330, display: "block" }} />
      </div>
      <div dir="rtl" style={{ position: "absolute", top: 1490, left: 60, right: 60, textAlign: "center", fontFamily: FONT, opacity: ramp(f, 1110, 14) }}>
        <div style={{ fontSize: 36, fontWeight: 700, color: K.white }}>المعلومات كاملة في الإنفوجرافيك ↑</div>
        <div style={{ fontSize: 22, fontWeight: 500, color: K.muted, marginTop: 10 }}>معلومات توعوية لا تغني عن استشارة الطبيب · المصادر: CDC، WHO</div>
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ audio
/**
 * No music — only short pop sounds, one per element as it appears (Mixkit Sound Effects Free License;
 * IDs in the file names: 2356 dry pop, 2358 long pop, 3005 light pop, 2357 bubble pop, 2925 soap bubble, 2364 hard pop).
 * `peak` = frames from file start to its loudest point, so the pop lands exactly on the visual.
 */
const POP = { dry: ["pop-2356", 0], long: ["pop-2358", 0], light: ["pop-3005", 1], bubble: ["pop-2357", 7], soap: ["pop-2925", 4], hard: ["pop-2364", 0] } as const;
type PopKind = keyof typeof POP;
const CUES: [number, PopKind, number][] = [
  [12, "dry", 0.5], [60, "light", 0.35], [80, "soap", 0.55],
  [160, "dry", 0.5], [222, "hard", 0.55],
  ...[0, 1, 2, 3, 4, 5].map((i) => [245 + i * 13, i % 2 ? "light" : "long", 0.45] as [number, PopKind, number]),
  [362, "soap", 0.5], [388, "bubble", 0.5], [548, "bubble", 0.5], [640, "dry", 0.45], [708, "bubble", 0.5],
  [850, "hard", 0.5], [885, "dry", 0.5], [930, "soap", 0.55],
  [1022, "long", 0.45], [1046, "dry", 0.5], [1062, "light", 0.4], [1090, "soap", 0.55], [1110, "dry", 0.4],
];
const ReelAudio: React.FC = () => (
  <>
    {CUES.map(([at, kind, v], i) => (
      <Audio key={i} name={`${kind} @${at}`} src={staticFile(`diabetes/sfx/${POP[kind][0]}.mp3`)} from={Math.max(0, at - POP[kind][1])} volume={v} />
    ))}
  </>
);

export const DiabetesReel: React.FC<{ muted?: boolean }> = ({ muted }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 30%, #12406a 0%, ${K.blue2} 35%, ${K.navy} 80%)`, overflow: "hidden" }}>
      {f < SC.s1[1] ? <S1 f={f} /> : null}
      {f >= SC.s2[0] && f < SC.s2[1] ? <S2 f={f} /> : null}
      {f >= SC.s3[0] && f < SC.s3[1] ? <S3 f={f} /> : null}
      {f >= SC.s4[0] && f < SC.s4[1] ? <S4 f={f} /> : null}
      {f >= SC.s5[0] ? <S5 f={f} /> : null}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)", pointerEvents: "none" }} />
      <PersistentInstitutionalHeader />
      {muted ? null : <ReelAudio />}
    </AbsoluteFill>
  );
};

import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import meta from "../../public/nuclear/logos/logos.json";
import { FONT } from "../nuclear/theme"; // loads IBM Plex Sans Arabic

/**
 * World Diabetes Day poster — Emergency Medicine Club (Majmaah University).
 * Emergency angle: recognise low blood sugar and act (CDC 15-15 rule). 1080×1350.
 * Sources: CDC (Low blood sugar / Treatment of low blood sugar), WHO diabetes fact sheet (14 November).
 */
const K = {
  navy: "#081827",
  blue2: "#102B40",
  blue: "#2E8BE6", // the diabetes blue circle
  sky: "#8EC5FF",
  white: "#F5F7FA",
  amber: "#E8AD45",
  alert: "#FF6B5A",
  muted: "rgba(245,247,250,0.7)",
};

const Header: React.FC = () => (
  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 132, direction: "ltr", display: "flex", flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", padding: "0 60px", background: "linear-gradient(180deg, rgba(8,24,39,0.95), rgba(16,43,64,0.85))", borderBottom: "1px solid rgba(142,197,255,0.2)" }}>
    {(["majmaah-university", "emergency-medicine-club", "student-council"] as const).map((n) => {
      const h = n === "majmaah-university" ? 88 : 100;
      return <Img key={n} src={staticFile(`nuclear/logos/${n}.png`)} style={{ height: h, width: h * meta[n].ratio }} />;
    })}
  </div>
);

const S = 46; // icon size
const st = { fill: "none", stroke: K.sky, strokeWidth: 3.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
export const ICONS: Record<string, React.ReactNode> = {
  heart: (
    <svg width={S} height={S} viewBox="0 0 48 48"><path {...st} d="M24 40 C8 29 6 20 10 14 C14 8 21 9 24 15 C27 9 34 8 38 14 C42 20 40 29 24 40 Z" /><path {...st} d="M10 24 H18 L21 18 L25 30 L28 24 H38" stroke={K.amber} /></svg>
  ),
  shake: (
    <svg width={S} height={S} viewBox="0 0 48 48"><path {...st} d="M18 40 V22 a3 3 0 0 1 6 0 V30 M24 22 V16 a3 3 0 0 1 6 0 V30 M30 20 a3 3 0 0 1 6 0 V32 C36 38 32 42 26 42 H22 C18 42 14 38 13 33 L11 27 a3 3 0 0 1 5 -2 L18 29" /><path {...st} stroke={K.amber} d="M6 12 L10 8 M6 20 L3 18 M42 10 L45 6" /></svg>
  ),
  sweat: (
    <svg width={S} height={S} viewBox="0 0 48 48"><path {...st} d="M24 6 C30 16 36 23 36 30 a12 12 0 0 1 -24 0 C12 23 18 16 24 6 Z" /><path {...st} stroke={K.amber} d="M19 31 a5 5 0 0 0 5 5" /></svg>
  ),
  dizzy: (
    <svg width={S} height={S} viewBox="0 0 48 48"><circle {...st} cx={24} cy={24} r={16} /><path {...st} stroke={K.amber} d="M24 24 m-6 0 a6 6 0 1 1 6 6 a3 3 0 1 1 -3 -3" /></svg>
  ),
  hunger: (
    <svg width={S} height={S} viewBox="0 0 48 48"><path {...st} d="M14 6 V20 a4 4 0 0 0 8 0 V6 M18 6 V42" /><path {...st} d="M34 42 V6 C28 10 27 20 28 26 H34" /><path {...st} stroke={K.amber} d="M38 30 l4 -2" /></svg>
  ),
  confuse: (
    <svg width={S} height={S} viewBox="0 0 48 48"><path {...st} d="M14 40 V32 C9 29 7 24 8 18 C10 10 17 6 25 6 C34 6 40 13 40 21 L43 28 H39 V34 a4 4 0 0 1 -4 4 H30 V42" /><path {...st} stroke={K.amber} d="M20 17 a5 5 0 1 1 6 5 v3 M26 30 v0.5" /></svg>
  ),
};

export const SIGNS: [keyof typeof ICONS, string][] = [
  ["shake", "رجفة"],
  ["sweat", "تعرّق"],
  ["dizzy", "دوخة"],
  ["hunger", "جوع"],
  ["heart", "تسارع النبض"],
  ["confuse", "قلق أو تشوّش"],
];

const STEPS: [string, string, string][] = [
  ["١", "أعطِه ١٥ غراماً من سكر سريع", "نصف كوب عصير، أو ملعقة سكر أو عسل"],
  ["٢", "انتظر ١٥ دقيقة ثم أعِد القياس", "إن بقي منخفضاً، كرّر الخطوة"],
  ["٣", "بعد تحسّنه: وجبة خفيفة", "تحتوي نشويات وبروتيناً"],
];

export const DiabetesPoster: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT, direction: "rtl", color: K.white, background: `radial-gradient(ellipse at 22% 22%, #12406a 0%, ${K.blue2} 38%, ${K.navy} 78%)`, overflow: "hidden" }}>
    {/* decorative oversized blue circle (the global symbol for diabetes) */}
    <svg width={1080} height={1350} style={{ position: "absolute", inset: 0 }}>
      <circle cx={210} cy={330} r={150} fill="none" stroke={K.blue} strokeWidth={34} />
      <circle cx={210} cy={330} r={198} fill="none" stroke={K.blue} strokeOpacity={0.18} strokeWidth={2} />
      <circle cx={210} cy={330} r={240} fill="none" stroke={K.blue} strokeOpacity={0.08} strokeWidth={2} />
    </svg>
    <Header />

    {/* hero */}
    <div style={{ position: "absolute", top: 228, left: 135, width: 150, textAlign: "center", direction: "rtl" }}>
      <div style={{ fontSize: 96, fontWeight: 700, lineHeight: 1, color: K.white }}>١٤</div>
      <div style={{ fontSize: 34, fontWeight: 600, color: K.sky, marginTop: 4 }}>نوفمبر</div>
    </div>
    <div style={{ position: "absolute", top: 190, right: 64, width: 560 }}>
      <div style={{ fontSize: 30, fontWeight: 600, color: K.sky }}>اليوم العالمي</div>
      <div style={{ fontSize: 104, fontWeight: 700, lineHeight: 1.12 }}>للسكري</div>
      <div style={{ marginTop: 18, fontSize: 40, fontWeight: 700, lineHeight: 1.45 }}>
        <span style={{ color: K.amber }}>هبوط السكر</span> حالة طارئة…
        <br />
        هل تعرف علاماته؟
      </div>
    </div>

    {/* signs */}
    <div style={{ position: "absolute", top: 500, left: 60, right: 60 }}>
      <SectionTitle text="علامات هبوط السكر" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 18 }}>
        {SIGNS.map(([icon, label]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 18px", borderRadius: 20, background: "rgba(8,24,39,0.6)", border: "1.5px solid rgba(142,197,255,0.28)" }}>
            {ICONS[icon]}
            <span style={{ fontSize: label.length > 10 ? 27 : 32, fontWeight: 700, lineHeight: 1.25 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>

    {/* 15-15 rule */}
    <div style={{ position: "absolute", top: 748, left: 60, right: 60 }}>
      <SectionTitle text="إذا كان واعياً ويستطيع البلع: قاعدة ١٥-١٥" />
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
        {STEPS.map(([n, t, sub]) => (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: 20, padding: "9px 22px", borderRadius: 20, background: "rgba(46,139,230,0.14)", border: `1.5px solid rgba(46,139,230,0.55)` }}>
            <div style={{ width: 54, height: 54, borderRadius: "50%", background: K.blue, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700, flexShrink: 0 }}>{n}</div>
            <div>
              <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.25 }}>{t}</div>
              <div style={{ fontSize: 23, fontWeight: 500, color: K.muted }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* emergency strip */}
    <div style={{ position: "absolute", top: 1150, left: 60, right: 60, display: "flex", alignItems: "center", gap: 20, padding: "12px 24px", borderRadius: 22, background: "rgba(255,107,90,0.14)", border: `2px solid ${K.alert}` }}>
      <svg width={58} height={58} viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
        <path d="M24 5 L45 42 H3 Z" fill="none" stroke={K.alert} strokeWidth={3.4} strokeLinejoin="round" />
        <path d="M24 18 V30 M24 35.5 V36" stroke={K.white} strokeWidth={4} strokeLinecap="round" />
      </svg>
      <div style={{ fontSize: 29, fontWeight: 700, lineHeight: 1.4 }}>
        إذا فقد الوعي أو لم يستطع البلع: لا تُعطِه شيئاً بالفم
        <br />
        واتصل بالإسعاف فوراً <span style={{ color: K.alert, fontSize: 38, direction: "ltr", unicodeBidi: "isolate" }}>997</span>
      </div>
    </div>

    {/* footer */}
    <div style={{ position: "absolute", bottom: 22, left: 60, right: 60, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 19, color: K.muted }}>
      <span>معلومات توعوية عامة لا تغني عن استشارة الطبيب · المصادر: CDC، WHO</span>
      <span style={{ fontWeight: 600, color: K.white }}>نادي طب الطوارئ — كلية الطب</span>
    </div>
  </AbsoluteFill>
);

const SectionTitle: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
    <div style={{ width: 14, height: 14, borderRadius: "50%", border: `4px solid ${K.blue}` }} />
    <span style={{ fontSize: 36, fontWeight: 700, color: K.white }}>{text}</span>
    <div style={{ flex: 1, height: 1.5, background: "linear-gradient(270deg, rgba(142,197,255,0.4), rgba(142,197,255,0))" }} />
  </div>
);

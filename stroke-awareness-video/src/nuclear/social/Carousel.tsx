import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import meta from "../../../public/nuclear/logos/logos.json";
import { GlobeView } from "../three/GlobeView";
import { C, FONT } from "../theme";

/** Instagram carousel (1080×1350) + cover (1080×1920) built from the film's verified content. */
const Header: React.FC<{ h?: number }> = ({ h = 130 }) => (
  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: h, direction: "ltr", display: "flex", flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", padding: "0 56px", boxSizing: "border-box", background: "linear-gradient(180deg, rgba(8,24,39,0.96), rgba(16,43,64,0.86))", borderBottom: "1px solid rgba(86,199,217,0.22)", zIndex: 10 }}>
    {(["majmaah-university", "emergency-medicine-club", "student-council"] as const).map((n) => {
      const hh = n === "majmaah-university" ? h * 0.7 : h * 0.78;
      return <Img key={n} src={staticFile(`nuclear/logos/${n}.png`)} style={{ height: hh, width: hh * meta[n].ratio }} />;
    })}
  </div>
);

const Frame: React.FC<{ n: number; children: React.ReactNode }> = ({ n, children }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, ${C.blue} 0%, ${C.navy} 75%)`, fontFamily: FONT, direction: "rtl" }}>
    <Header />
    <div style={{ position: "absolute", top: 130, bottom: 110, left: 80, right: 80, display: "flex", flexDirection: "column", justifyContent: "center", gap: 34 }}>{children}</div>
    <div style={{ position: "absolute", bottom: 40, left: 80, right: 80, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 24, color: C.muted }}>
      <span>محتوى توعوي افتراضي لا يشير إلى وجود خطر إشعاعي حالي.</span>
      <span style={{ color: C.cyan, fontWeight: 700 }}>{["١", "٢", "٣", "٤", "٥", "٦"][n]} / ٦</span>
    </div>
  </AbsoluteFill>
);

const H: React.FC<{ children: React.ReactNode; color?: string; size?: number }> = ({ children, color = C.white, size = 74 }) => (
  <div style={{ fontWeight: 700, fontSize: size, lineHeight: 1.3, color, textAlign: "center" }}>{children}</div>
);
const P: React.FC<{ children: React.ReactNode }> = ({ children }) => <div style={{ fontWeight: 500, fontSize: 40, lineHeight: 1.6, color: C.white, textAlign: "center", opacity: 0.92 }}>{children}</div>;
const Pill: React.FC<{ children: React.ReactNode; color?: string; tag?: string; tagColor?: string; strike?: boolean }> = ({ children, color = C.cyan, tag, tagColor, strike }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "18px 30px", borderRadius: 22, background: "rgba(8,24,39,0.8)", border: `2px solid ${color}` }}>
    {tag ? <span style={{ fontWeight: 700, fontSize: 30, color: C.navy, background: tagColor ?? color, borderRadius: 999, padding: "4px 18px", flexShrink: 0 }}>{tag}</span> : null}
    <span style={{ fontWeight: 700, fontSize: 44, color: C.white, textDecoration: strike ? "line-through" : undefined, textDecorationColor: C.amber, textDecorationThickness: 5 }}>{children}</span>
  </div>
);

export const SLIDES: React.FC[] = [
  () => (
    <AbsoluteFill style={{ background: "#04090f", fontFamily: FONT, direction: "rtl", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: -360, width: 1080, height: 1920 }}>
        <GlobeView z={7.4} rot={1.6} opacity={1} cy={0.1} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,24,39,0) 40%, rgba(8,24,39,0.96) 74%)" }} />
      <Header />
      <div style={{ position: "absolute", top: 900, left: 60, right: 60, textAlign: "center" }}>
        <div style={{ fontWeight: 700, fontSize: 96, color: C.white, lineHeight: 1.2 }}>الإشعاع النووي</div>
        <div style={{ fontWeight: 700, fontSize: 60, color: C.amber, marginTop: 10 }}>هل يمكن أن يصل إلينا؟</div>
        <div style={{ fontWeight: 500, fontSize: 34, color: C.muted, marginTop: 22 }}>اسحب لتعرف كيف ينتقل، وما الذي يحدد خطره ←</div>
      </div>
      <div style={{ position: "absolute", bottom: 40, left: 80, right: 80, display: "flex", justifyContent: "space-between", fontSize: 24, color: C.muted }}>
        <span>محتوى توعوي افتراضي لا يشير إلى وجود خطر إشعاعي حالي.</span>
        <span style={{ color: C.cyan, fontWeight: 700 }}>١ / ٦</span>
      </div>
    </AbsoluteFill>
  ),
  () => (
    <Frame n={1}>
      <H color={C.amber}>تضرّر المنشأة ≠ انفجار نووي</H>
      <P>تضرُّر منشأة نووية لا يعني انفجاراً كالقنبلة الذرية. لكن في بعض الحوادث قد تتسرب مواد مشعة إلى البيئة، بحسب نوع المنشأة ومدى الضرر.</P>
    </Frame>
  ),
  () => (
    <Frame n={2}>
      <H size={60}>خرافة أم حقيقة؟</H>
      <Pill color="rgba(245,247,250,0.4)" tag="خرافة" tagColor="#c9d6e2" strike>الإشعاع سحابة تحملها الرياح</Pill>
      <Pill tag="حقيقة">ما ينتقل هو مواد مشعة تُطلق الإشعاع</Pill>
      <P>تحملها الرياح لمسافات طويلة، وقد تُرسّبها الأمطار على الأرض والمياه.</P>
    </Frame>
  ),
  () => (
    <Frame n={3}>
      <H color={C.amber}>المسافة ليست العامل الوحيد</H>
      <P>كلما ابتعدنا عن المصدر يقل التعرض عادةً، لكن الانتشار يتأثر أيضاً بـ:</P>
      {["اتجاه الرياح وسرعتها", "كمية المواد المنبعثة", "الظروف الجوية"].map((t) => (
        <Pill key={t}>{t}</Pill>
      ))}
    </Frame>
  ),
  () => (
    <Frame n={4}>
      <H color={C.cyan}>التلوث ليس حتمياً</H>
      <P>قد تصل المواد المترسبة إلى التربة والمياه والمحاصيل، لكن ذلك لا يعني بالضرورة أن مياه الشرب أو الطعام أصبحا غير آمنين.</P>
      <Pill color={C.amber}>الخطر تحدده أجهزة الرصد والقياسات، لا الشائعات</Pill>
    </Frame>
  ),
  () => (
    <Frame n={5}>
      <H size={64} color={C.amber}>عند صدور تنبيه رسمي</H>
      {["١  ادخل", "٢  ابقَ في الداخل", "٣  تابع التعليمات الرسمية"].map((t) => (
        <Pill key={t}>{t}</Pill>
      ))}
      <P>تابع الجهات المختصة: هيئة الرقابة النووية والإشعاعية · وزارة الصحة · الدفاع المدني · هيئة الغذاء والدواء</P>
    </Frame>
  ),
];

export const CarouselSlide: React.FC<{ n: number }> = ({ n }) => {
  const S = SLIDES[n];
  return <S />;
};

export const NuclearCover: React.FC = () => (
  <AbsoluteFill style={{ background: "#04090f", fontFamily: FONT, direction: "rtl" }}>
    <GlobeView z={6.6} rot={1.9} opacity={1} cy={-0.35} />
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,24,39,0) 45%, rgba(8,24,39,0.95) 78%)" }} />
    <Header h={148} />
    <div style={{ position: "absolute", top: 1180, left: 60, right: 60, textAlign: "center" }}>
      <div style={{ fontWeight: 700, fontSize: 112, color: C.white, lineHeight: 1.2 }}>الإشعاع النووي</div>
      <div style={{ fontWeight: 700, fontSize: 66, color: C.amber, marginTop: 14 }}>هل يمكن أن يصل إلينا؟</div>
      <div style={{ fontWeight: 500, fontSize: 34, color: C.muted, marginTop: 30 }}>نادي طب الطوارئ — جامعة المجمعة</div>
    </div>
  </AbsoluteFill>
);

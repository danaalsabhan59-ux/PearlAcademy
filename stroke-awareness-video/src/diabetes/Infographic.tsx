import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import meta from "../../public/nuclear/logos/logos.json";
import { FONT } from "../nuclear/theme";

/**
 * World Diabetes Day — full infographic (1080×1920). Emergency Medicine Club, Majmaah University.
 * Every fact is taken from: WHO Diabetes fact sheet (who.int) and CDC Diabetes pages (cdc.gov):
 * risk factors, testing (thresholds), prevention-type-2, low blood sugar + treatment (15-15 rule).
 */
const K = {
  navy: "#081827",
  blue2: "#102B40",
  blue: "#2E8BE6",
  sky: "#8EC5FF",
  white: "#F5F7FA",
  amber: "#E8AD45",
  green: "#4CC38A",
  alert: "#FF6B5A",
  muted: "rgba(245,247,250,0.72)",
  card: "rgba(8,24,39,0.62)",
  line: "rgba(142,197,255,0.26)",
};

const Header: React.FC = () => (
  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 132, direction: "ltr", display: "flex", flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", padding: "0 60px", background: "linear-gradient(180deg, rgba(8,24,39,0.96), rgba(16,43,64,0.86))", borderBottom: `1px solid ${K.line}` }}>
    {(["majmaah-university", "emergency-medicine-club", "student-council"] as const).map((n) => {
      const h = n === "majmaah-university" ? 88 : 100;
      return <Img key={n} src={staticFile(`nuclear/logos/${n}.png`)} style={{ height: h, width: h * meta[n].ratio }} />;
    })}
  </div>
);

const Title: React.FC<{ n: string; text: string; color?: string }> = ({ n, text, color = K.sky }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
    <span style={{ fontSize: 22, fontWeight: 700, color: K.navy, background: color, borderRadius: 999, padding: "1px 12px" }}>{n}</span>
    <span style={{ fontSize: 31, fontWeight: 700 }}>{text}</span>
    <div style={{ flex: 1, height: 1.5, background: `linear-gradient(270deg, ${K.line}, rgba(0,0,0,0))` }} />
  </div>
);

const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: K.card, border: `1.5px solid ${K.line}`, borderRadius: 20, padding: "14px 18px", ...style }}>{children}</div>
);

const Bullet: React.FC<{ children: React.ReactNode; color?: string; size?: number }> = ({ children, color = K.blue, size = 26 }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: size, fontWeight: 600, lineHeight: 1.36 }}>
    <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, marginTop: size * 0.55, flexShrink: 0 }} />
    <span>{children}</span>
  </div>
);

const Num: React.FC<{ v: string; color?: string }> = ({ v, color = K.white }) => <span style={{ direction: "ltr", unicodeBidi: "isolate", color, fontWeight: 700 }}>{v}</span>;

export const DiabetesInfographic: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: FONT, direction: "rtl", color: K.white, background: `radial-gradient(ellipse at 20% 12%, #12406a 0%, ${K.blue2} 30%, ${K.navy} 70%)`, overflow: "hidden" }}>
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <circle cx={190} cy={282} r={112} fill="none" stroke={K.blue} strokeWidth={26} />
      <circle cx={190} cy={282} r={150} fill="none" stroke={K.blue} strokeOpacity={0.16} strokeWidth={2} />
    </svg>
    <Header />

    {/* hero */}
    <div style={{ position: "absolute", top: 222, left: 115, width: 150, textAlign: "center" }}>
      <div style={{ fontSize: 74, fontWeight: 700, lineHeight: 1 }}>١٤</div>
      <div style={{ fontSize: 28, fontWeight: 600, color: K.sky }}>نوفمبر</div>
    </div>
    <div style={{ position: "absolute", top: 160, right: 60, width: 640 }}>
      <div style={{ fontSize: 28, fontWeight: 600, color: K.sky }}>اليوم العالمي</div>
      <div style={{ fontSize: 92, fontWeight: 700, lineHeight: 1.1 }}>للسكري</div>
      <div style={{ fontSize: 31, fontWeight: 700, marginTop: 8, lineHeight: 1.4 }}>
        اعرفه<span style={{ color: K.muted, margin: "0 14px" }}>|</span><span style={{ color: K.sky }}>اكتشفه مبكراً</span><span style={{ color: K.muted, margin: "0 14px" }}>|</span><span style={{ color: K.amber }}>تصرّف في الطوارئ</span>
      </div>
    </div>

    <div style={{ position: "absolute", top: 418, left: 52, right: 52, display: "flex", flexDirection: "column", gap: 11 }}>
      {/* numbers */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 14 }}>
        <Card style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 18px" }}>
          <div style={{ fontSize: 62, fontWeight: 700, color: K.amber, lineHeight: 1 }}><Num v="830" color={K.amber} /></div>
          <div style={{ fontSize: 23, fontWeight: 600, lineHeight: 1.4 }}>مليون مصاب بالسكري عام <Num v="2022" /><br />مقابل <Num v="200" /> مليون عام <Num v="1990" /></div>
        </Card>
        <Card style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 18px" }}>
          <div style={{ fontSize: 50, fontWeight: 700, color: K.sky, lineHeight: 1 }}>½+</div>
          <div style={{ fontSize: 23, fontWeight: 600, lineHeight: 1.4 }}>أكثر من نصف المصابين لم يتناولوا علاجاً للسكري عام <Num v="2022" /></div>
        </Card>
      </div>

      {/* types */}
      <div>
        <Title n="١" text="ما هو السكري؟ وأنواعه" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {[
            ["النوع الأول", "نقص في إنتاج الإنسولين، ويحتاج المصاب إنسولين يومياً. لا تُعرف طريقة للوقاية منه.", K.sky],
            ["النوع الثاني", "الجسم لا يستخدم الإنسولين بشكل صحيح. ويمكن غالباً الوقاية منه.", K.amber],
            ["سكري الحمل", "يظهر أثناء الحمل ويُكتشف بالفحص، ويرفع خطر النوع الثاني لاحقاً.", K.green],
          ].map(([h, t, c]) => (
            <Card key={h} style={{ borderTop: `4px solid ${c}`, padding: "12px 16px" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: c, marginBottom: 4 }}>{h}</div>
              <div style={{ fontSize: 21, fontWeight: 500, lineHeight: 1.42, color: K.white }}>{t}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* symptoms + risk */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr", gap: 14 }}>
        <div>
          <Title n="٢" text="الأعراض" />
          <Card style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {["عطش شديد", "كثرة التبول", "تشوّش الرؤية", "تعب وإرهاق", "نقص الوزن دون سبب"].map((s) => (
              <Bullet key={s} size={24}>{s}</Bullet>
            ))}
            <div style={{ fontSize: 19, color: K.muted, marginTop: 6, lineHeight: 1.4 }}>أعراض النوع الثاني قد تكون خفيفة، وتتأخر سنوات</div>
          </Card>
        </div>
        <div>
          <Title n="٣" text="عوامل الخطر (النوع الثاني)" color={K.amber} />
          <Card style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {["زيادة الوزن أو السمنة", <>العمر <Num v="45" /> سنة فأكثر</>, "أب أو أم أو أخ مصاب", "نشاط بدني أقل من ٣ مرات أسبوعياً", "الكبد الدهني", "سكري حمل سابق"].map((s, i) => (
              <Bullet key={i} color={K.amber} size={23}>{s}</Bullet>
            ))}
          </Card>
        </div>
      </div>

      {/* diagnosis table */}
      <div>
        <Title n="٤" text="كيف يُشخَّص؟" />
        <Card style={{ padding: 0, overflow: "hidden" }}>
          {[
            ["", "طبيعي", "مقدّمات السكري", "سكري"],
            ["سكر صائم (ملغ/دل)", "٩٩ أو أقل", "١٠٠ – ١٢٥", "١٢٦ فأكثر"],
            ["التراكمي HbA1c", "أقل من ٥٫٧٪", "٥٫٧ – ٦٫٤٪", "٦٫٥٪ فأكثر"],
          ].map((row, r) => (
            <div key={r} style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr 1.2fr 1fr", borderTop: r ? `1px solid ${K.line}` : undefined, background: r === 0 ? "rgba(46,139,230,0.16)" : undefined }}>
              {row.map((c, i) => (
                <div key={i} style={{ padding: "7px 12px", textAlign: i ? "center" : "right", fontSize: r === 0 ? 23 : 24, fontWeight: r === 0 || i === 0 ? 700 : 600, color: r === 0 ? [K.white, K.green, K.amber, K.alert][i] : i === 0 ? K.sky : K.white }}>
                  {c}
                </div>
              ))}
            </div>
          ))}
        </Card>
        <div style={{ fontSize: 19, color: K.muted, marginTop: 4 }}>مقدّمات السكري غالباً بلا أعراض، ويمكن عكسها بتغيير نمط الحياة</div>
      </div>

      {/* prevention */}
      <div>
        <Title n="٥" text="الوقاية من النوع الثاني" color={K.green} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
          {[
            ["وزن صحي", "حافظ عليه"],
            ["نشاط بدني", "١٥٠ دقيقة أسبوعياً"],
            ["غذاء صحي", "قلّل السكر والدهون المشبعة"],
            ["لا للتدخين", "امتنع عن التبغ"],
          ].map(([h, t]) => (
            <Card key={h} style={{ textAlign: "center", padding: "8px 8px", borderColor: "rgba(76,195,138,0.45)" }}>
              <div style={{ fontSize: 25, fontWeight: 700, color: K.green }}>{h}</div>
              <div style={{ fontSize: 19, fontWeight: 500, lineHeight: 1.35 }}>{t}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* complications */}
      <div>
        <Title n="٦" text="لماذا المتابعة مهمة؟ مضاعفات السكري" color={K.alert} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
          {[
            ["القلب", "النوبات القلبية والجلطات"],
            ["الكلى", "الفشل الكلوي"],
            ["العين", "فقدان البصر"],
            ["الأعصاب والقدم", "قُرَح قد تصل للبتر"],
          ].map(([h, t]) => (
            <Card key={h} style={{ textAlign: "center", padding: "8px 8px", borderColor: "rgba(255,107,90,0.4)" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: K.alert }}>{h}</div>
              <div style={{ fontSize: 19, fontWeight: 500, lineHeight: 1.35 }}>{t}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* emergency */}
      <div style={{ border: `2px solid ${K.alert}`, borderRadius: 24, padding: "10px 20px", background: "rgba(255,107,90,0.10)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <svg width={40} height={40} viewBox="0 0 48 48"><path d="M24 5 L45 42 H3 Z" fill="none" stroke={K.alert} strokeWidth={3.6} strokeLinejoin="round" /><path d="M24 18 V30 M24 35.5 V36" stroke={K.white} strokeWidth={4} strokeLinecap="round" /></svg>
          <span style={{ fontSize: 32, fontWeight: 700 }}>طوارئ: <span style={{ color: K.amber }}>هبوط السكر</span> (أقل من <Num v="70" /> ملغ/دل)</span>
        </div>
        <div style={{ fontSize: 22, fontWeight: 600, color: K.muted, marginBottom: 6 }}>العلامات: رجفة · تعرّق · دوخة · جوع · تسارع النبض · قلق أو تشوّش</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            ["١", "١٥ غراماً سكراً سريعاً", "نصف كوب عصير أو ملعقة سكر أو عسل"],
            ["٢", "انتظر ١٥ دقيقة", "ثم أعِد القياس، وكرّر إن بقي منخفضاً"],
            ["٣", "ثم وجبة خفيفة", "نشويات مع بروتين"],
          ].map(([n, t, s]) => (
            <div key={n} style={{ background: "rgba(8,24,39,0.6)", borderRadius: 16, padding: "10px 12px", border: `1px solid rgba(46,139,230,0.5)` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 34, height: 34, borderRadius: "50%", background: K.blue, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, flexShrink: 0 }}>{n}</span>
                <span style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.3 }}>{t}</span>
              </div>
              <div style={{ fontSize: 18, color: K.muted, marginTop: 4, lineHeight: 1.35 }}>{s}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, marginTop: 8, lineHeight: 1.4 }}>
          إذا فقد الوعي أو لم يستطع البلع: لا تُعطِه شيئاً بالفم، واتصل بالإسعاف <span style={{ color: K.alert, fontSize: 32 }}><Num v="997" color={K.alert} /></span>
        </div>
      </div>
    </div>

    <div style={{ position: "absolute", bottom: 22, left: 52, right: 52, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 18, color: K.muted }}>
      <span>معلومات توعوية عامة لا تغني عن استشارة الطبيب · المصادر: منظمة الصحة العالمية WHO، مراكز CDC</span>
      <span style={{ fontWeight: 700, color: K.white }}>نادي طب الطوارئ — كلية الطب</span>
    </div>
  </AbsoluteFill>
);

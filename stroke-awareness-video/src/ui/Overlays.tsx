import React from "react";
import { getRemotionEnvironment, useCurrentFrame, useVideoConfig } from "remotion";
import { blinkAt, lineStart, mouthFor, progress, scene } from "../anim";
import { ParamedicHead } from "../pixel/characters";
import { Sprite } from "../pixel/Px";
import { dialogue, lineAt, timeline } from "../timeline";

export const FONT = "Cairo, sans-serif";

const pixelBorder = (color: string): React.CSSProperties => ({
  boxShadow: `0 -6px 0 0 ${color}, 0 6px 0 0 ${color}, -6px 0 0 0 ${color}, 6px 0 0 0 ${color}, 0 0 0 6px rgba(0,0,0,0.35)`,
});

// ---------------------------------------------------------------- subtitles
export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  // Keep the subtitle up briefly after the line ends so it can be read.
  const line =
    lineAt(t) ?? timeline.lines.find((l) => t > l.end && t < l.end + 0.35) ?? null;
  // The outro already shows the narrated words as large on-screen text.
  if (!line || line.scene === "outro") return null;

  const char = dialogue.characters[line.speaker];
  const words = (line.display ?? line.text).split(/\s+/);
  const spoken =
    line.words.length > 0
      ? Math.round((line.words.filter((w) => w.start <= t).length / line.words.length) * words.length)
      : Math.ceil(((t - line.start) / (line.end - line.start)) * words.length);
  const opacity = Math.min(progress(t, line.start - 0.1, 0.15), 1 - progress(t, line.end + 0.2, 0.15));

  return (
    <div
      style={{
        position: "absolute",
        left: 160,
        right: 160,
        bottom: 56,
        display: "flex",
        justifyContent: "center",
        opacity,
      }}
    >
      <div
        dir="rtl"
        lang="ar"
        style={{
          background: "rgba(12, 10, 24, 0.86)",
          padding: "18px 40px 22px",
          maxWidth: 1500,
          fontFamily: FONT,
          ...pixelBorder("#f4ecd8"),
        }}
      >
        <div
          style={{
            display: "inline-block",
            background: char.color,
            color: "#14101f",
            fontWeight: 800,
            fontSize: 30,
            padding: "0 18px",
            marginBottom: 6,
          }}
        >
          {char.name}
        </div>
        <div style={{ fontSize: 50, fontWeight: 700, lineHeight: 1.45, color: "#fff" }}>
          {words.map((w, i) => (
            <span key={i} style={{ color: i < spoken ? "#ffffff" : "rgba(255,255,255,0.5)" }}>
              {w}{" "}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------------------------- FAST panel
const ICONS: Record<string, string[]> = {
  face: [
    "..YYYYYY..",
    ".YYYYYYYY.",
    "YYKYYYYKYY",
    "YYYYYYYYYY",
    "YYYYYYYYYY",
    "YKYYYYYYYY",
    "YYKKKYYYYY",
    "YYYYYKKYYY",
    ".YYYYYYKY.",
    "..YYYYYY..",
  ],
  arms: [
    "Y........Y",
    "Y........Y",
    "YY......YY",
    ".YY....YY.",
    "..YYYYYY..",
    "..YYYYYY..",
    "..YYYYYY..",
    "..YY..YY..",
    "..YY..YY..",
    "..YY..YY..",
  ],
  speech: [
    "YYYYYYYYYY",
    "Y........Y",
    "Y.K.K.K..Y",
    "Y........Y",
    "Y.KK.K.K.Y",
    "Y........Y",
    "YYYYYYYYYY",
    "...YY.....",
    "..YY......",
    ".Y........",
  ],
  time: [
    "..YYYYYY..",
    ".Y......Y.",
    "Y....K...Y",
    "Y....K...Y",
    "Y....KKK.Y",
    "Y........Y",
    "Y........Y",
    ".Y......Y.",
    "..YYYYYY..",
    "..........",
  ],
};

const STEPS = [
  { id: "n2", icon: "face", label: "الوجه", hint: "ميلان الوجه" },
  { id: "n3", icon: "arms", label: "الذراعان", hint: "ضعف في الذراع" },
  { id: "n4", icon: "speech", label: "الكلام", hint: "كلام ثقيل" },
  { id: "n5", icon: "time", label: "الوقت", hint: "اتصل 997" },
];

export const PixelIcon: React.FC<{ name: string; color: string; size: number }> = ({ name, color, size }) => (
  <svg viewBox="0 0 10 10" width={size} height={size} shapeRendering="crispEdges">
    <Sprite rows={ICONS[name]} palette={{ Y: color, K: "#14101f" }} />
  </svg>
);

export const FastPanel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const fast = scene("fast");
  if (t < fast.start || t > fast.end) return null;
  const show = Math.min(progress(t, fast.start + 0.4, 0.5), 1 - progress(t, fast.end - 0.5, 0.4));

  return (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        top: 70,
        right: 70,
        width: 480,
        display: "flex",
        flexDirection: "column",
        gap: 26,
        opacity: show,
        transform: `translateX(${(1 - show) * 80}px)`,
        fontFamily: FONT,
      }}
    >
      <div style={{ color: "#ffd166", fontSize: 38, fontWeight: 800, textShadow: "4px 4px 0 #14101f", whiteSpace: "nowrap" }}>
        علامات السكتة الدماغية
      </div>
      {STEPS.map((step, i) => {
        const start = lineStart(step.id);
        const next = STEPS[i + 1] ? lineStart(STEPS[i + 1].id) : fast.end;
        const active = t >= start && t < next;
        const done = t >= next;
        const reveal = progress(t, start - 0.2, 0.35);
        return (
          <div
            key={step.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 22,
              padding: "14px 22px",
              background: active ? "#ffd166" : "rgba(12,10,24,0.85)",
              color: active ? "#14101f" : "#f4ecd8",
              opacity: 0.35 + 0.65 * reveal,
              transform: `scale(${active ? 1.04 : 1})`,
              ...pixelBorder(active ? "#14101f" : "#f4ecd8"),
            }}
          >
            <PixelIcon name={step.icon} color={active ? "#14101f" : "#ffd166"} size={64} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.2 }}>{step.label}</div>
              <div style={{ fontSize: 26, fontWeight: 700, opacity: 0.85 }}>{step.hint}</div>
            </div>
            <div style={{ fontSize: 40, fontWeight: 800, color: "#5fd068", opacity: done ? 1 : 0 }}>✓</div>
          </div>
        );
      })}
    </div>
  );
};

// -------------------------------------------------------------- phone panel
export const PhonePanel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const call = scene("call");
  if (t < call.start || t > call.end) return null;
  const connectedAt = lineStart("c1") - 0.6;
  const connected = t >= connectedAt;
  const show = Math.min(progress(t, call.start + 0.2, 0.5), 1 - progress(t, call.end - 0.6, 0.5));
  const secs = Math.max(0, Math.floor(t - connectedAt));
  const timer = `00:${String(secs).padStart(2, "0")}`;
  const ringPulse = connected ? 0 : Math.abs(Math.sin(t * 4));

  return (
    <div
      style={{
        position: "absolute",
        top: 90,
        right: 120,
        width: 400,
        height: 720,
        background: "#20232b",
        padding: 24,
        opacity: show,
        transform: `translateY(${(1 - show) * 120}px)`,
        fontFamily: FONT,
        ...pixelBorder("#0d0f14"),
      }}
    >
      <div
        dir="rtl"
        style={{
          width: "100%",
          height: "100%",
          background: connected ? "#103b2a" : "#14213d",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 50,
          gap: 18,
          color: "#fff",
        }}
      >
        <div style={{ fontSize: 34, fontWeight: 700, opacity: 0.85 }}>
          {connected ? "متصل" : "جارٍ الاتصال…"}
        </div>
        <div style={{ fontSize: 110, fontWeight: 800, lineHeight: 1, fontFamily: FONT }}>997</div>
        <div style={{ fontSize: 40, fontWeight: 800, color: "#ff8a8a" }}>الإسعاف</div>
        <div
          style={{
            width: 190,
            height: 190,
            marginTop: 20,
            background: "#2b3a55",
            boxShadow: `0 0 0 ${8 + ringPulse * 14}px rgba(95,208,104,${0.25 * (1 - ringPulse)})`,
          }}
        >
          {connected ? (
            <svg viewBox="-2 -1 14 13" width={190} height={190} shapeRendering="crispEdges">
              <ParamedicHead mouth={mouthFor("paramedic", t, frame)} blink={blinkAt(t, 2)} />
            </svg>
          ) : null}
        </div>
        <div style={{ fontSize: 40, fontWeight: 700, marginTop: 10, fontVariantNumeric: "tabular-nums" }}>
          {connected ? timer : ""}
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------- title card / scene chips
export const TitleCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const opacity = 1 - progress(t, 1.8, 0.7);
  if (opacity <= 0) return null;
  return (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: `rgba(10,8,20,${0.55 * opacity})`,
        opacity,
        fontFamily: FONT,
        color: "#fff",
        textShadow: "6px 6px 0 #14101f",
      }}
    >
      <div style={{ fontSize: 96, fontWeight: 800, color: "#ffd166" }}>السكتة الدماغية</div>
      <div style={{ fontSize: 52, fontWeight: 700 }}>كل دقيقة مهمة</div>
    </div>
  );
};

// ------------------------------------------------- heartbeat red vignette
export const HeartbeatVignette: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const beat = 60 / 84; // matches the tempo of heartbeat-loop.mp3
  let amount = 0;
  for (const s of timeline.sfx) {
    if (!s.id.startsWith("heartbeat") || s.end === null) continue;
    if (t < s.start || t > s.end) continue;
    const fade = Math.min(progress(t, s.start, s.fadeIn ?? 0.5), 1 - progress(t, s.end - (s.fadeOut ?? 0.5), s.fadeOut ?? 0.5));
    const phase = (t - s.start) % beat;
    const pulse = Math.exp(-phase / 0.12) + 0.6 * Math.exp(-Math.max(0, phase - 0.27) / 0.1) * (phase > 0.27 ? 1 : 0);
    amount = Math.max(amount, fade * Math.min(1, pulse) * s.volume);
  }
  if (amount <= 0.01) return null;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(180,0,20,${0.5 * amount}) 100%)`,
        pointerEvents: "none",
      }}
    />
  );
};

// ---------------------------------------------------------------- the outro
export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const outro = scene("outro");
  const appear = progress(t, outro.start, 0.6);
  const pulse = 1 + 0.04 * Math.sin(t * 6);
  const tagline = progress(t, lineStart("o2") - 0.2, 0.5);

  return (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        inset: 0,
        background: "#14101f",
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 30,
        fontFamily: FONT,
        color: "#fff",
        opacity: appear,
      }}
    >
      <div style={{ display: "flex", gap: 60, marginBottom: 10 }}>
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              opacity: progress(t, outro.start + 0.3 + i * 0.25, 0.4),
            }}
          >
            <PixelIcon name={s.icon} color="#ffd166" size={96} />
            <div style={{ fontSize: 36, fontWeight: 800 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 46, fontWeight: 700 }}>عند ظهور أيّ علامة اتصل فورًا</div>
      <div
        style={{
          fontSize: 230,
          fontWeight: 800,
          lineHeight: 1,
          color: "#ff4d5a",
          textShadow: "10px 10px 0 #5a0f18",
          transform: `scale(${pulse})`,
        }}
      >
        997
      </div>
      <div style={{ fontSize: 64, fontWeight: 800, color: "#ffd166", opacity: tagline, textShadow: "6px 6px 0 #000" }}>
        اعرف العلامات... وأنقذ حياة
      </div>
    </div>
  );
};

// ---------------------------------------- warning shown only in the Studio
export const MissingVoicesBanner: React.FC = () => {
  if (getRemotionEnvironment().isRendering || timeline.missingVoices.length === 0) return null;
  const total = timeline.lines.length;
  return (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        background: "#b00020",
        color: "#fff",
        fontFamily: FONT,
        fontSize: 30,
        fontWeight: 700,
        padding: "10px 30px",
        textAlign: "center",
      }}
    >
      ⚠️ الأصوات غير مولّدة ({timeline.missingVoices.length} من {total}) — شغّل npm run voices. التوقيتات الحالية تقديرية، والرندر معطّل حتى تُولّد كل الأصوات.
    </div>
  );
};

export const VisualCheckWatermark: React.FC = () => (
  <div
    dir="rtl"
    style={{
      position: "absolute",
      top: 20,
      left: 20,
      background: "rgba(176,0,32,0.9)",
      color: "#fff",
      fontFamily: FONT,
      fontSize: 28,
      fontWeight: 800,
      padding: "6px 20px",
    }}
  >
    معاينة بصرية فقط — بدون صوت
  </div>
);

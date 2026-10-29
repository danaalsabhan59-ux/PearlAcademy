import React from "react";
import { Img, staticFile } from "remotion";
import { C } from "../styles/palette";

export const AR_FONT = "Cairo, sans-serif";
export const PX_FONT = "'Press Start 2P', monospace";

/** Screen layout (1080×1920). The pixel stage is 900×900 (5 screen px per art px). */
export const LAYOUT = {
  header: { top: 40, card: 196, gap: 34 },
  hud: { top: 268, height: 84 },
  topCaption: { top: 370, height: 200 },
  viewport: { left: 90, top: 586, size: 900 },
  bottomCaption: { top: 1508, height: 250 },
  safeBottom: 1780,
};

export const LOGOS = [
  { src: "logos/majmaah-university.jpg", alt: "جامعة المجمعة — كلية الطب" },
  { src: "logos/emergency-medicine-club.jpg", alt: "Emergency Club — نادي طب الطوارئ" },
  { src: "logos/student-council.jpg", alt: "المجلس الطلابي — كلية الطب" },
];

/** Navy background with a faint pixel grid and vignette. */
export const Backdrop: React.FC<{ tint?: string }> = ({ tint }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundColor: C.navy800,
      backgroundImage: `radial-gradient(ellipse at 50% 45%, ${tint ?? "rgba(40,60,120,0.35)"} 0%, rgba(0,0,0,0) 60%), linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
      backgroundSize: "100% 100%, 20px 20px, 20px 20px",
    }}
  />
);

/**
 * The three official logos, always on top. Images are shown complete and unaltered
 * (object-fit: contain, original aspect ratio) on white cards.
 */
export const LogoHeader: React.FC = () => {
  const { top, card, gap } = LAYOUT.header;
  const total = card * 3 + gap * 2;
  return (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        top,
        left: (1080 - total) / 2,
        width: total,
        height: card,
        display: "flex",
        gap,
        zIndex: 50,
      }}
    >
      {LOGOS.map((logo) => (
        <div
          key={logo.src}
          style={{
            width: card,
            height: card,
            background: "#ffffff",
            borderRadius: 16,
            boxShadow: "0 6px 18px rgba(0,0,0,0.45), 0 0 0 2px rgba(255,255,255,0.15)",
            overflow: "hidden",
          }}
        >
          <Img
            src={staticFile(logo.src)}
            alt={logo.alt}
            style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
          />
        </div>
      ))}
    </div>
  );
};

/** Chapter / campaign strip under the logos. */
export const Hud: React.FC<{ chapter: string; progress: number; t: number; alert?: boolean }> = ({
  chapter,
  progress,
  t,
  alert,
}) => {
  const { top, height } = LAYOUT.hud;
  const pts: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const s = (i + t * 40) % 30;
    const v = s > 12 && s < 14 ? -14 : s >= 14 && s < 16 ? 10 : 0;
    pts.push(`${i * 3},${22 + v}`);
  }
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 70,
        right: 70,
        height,
        background: "rgba(6,10,26,0.82)",
        border: `3px solid ${alert ? C.red : C.navy500}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 26px",
        zIndex: 40,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <svg width={180} height={44} viewBox="0 0 180 44">
          <polyline points={pts.join(" ")} fill="none" stroke={C.red} strokeWidth={3} />
        </svg>
        <div style={{ fontFamily: PX_FONT, fontSize: 22, color: C.white, letterSpacing: 1 }}>STROKE CODE</div>
      </div>
      <div dir="rtl" style={{ fontFamily: AR_FONT, fontWeight: 700, fontSize: 30, color: C.amberSoft }}>
        {chapter}
      </div>
      <div style={{ position: "absolute", left: 0, bottom: 0, height: 5, width: `${progress * 100}%`, background: C.red }} />
    </div>
  );
};

/** Frame around the pixel stage. */
export const Viewport: React.FC<{ children: React.ReactNode; border?: string; opacity?: number }> = ({
  children,
  border = C.navy500,
  opacity = 1,
}) => {
  const { left, top, size } = LAYOUT.viewport;
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: size,
        height: size,
        outline: `6px solid ${border}`,
        boxShadow: "0 0 0 12px rgba(6,10,26,0.9), 0 20px 60px rgba(0,0,0,0.6)",
        overflow: "hidden",
        opacity,
        background: C.navy900,
      }}
    >
      {children}
    </div>
  );
};

/** Big caption above the stage. */
export const TopCaption: React.FC<{
  title: React.ReactNode;
  sub?: React.ReactNode;
  opacity?: number;
  titleColor?: string;
  subColor?: string;
  en?: boolean;
}> = ({ title, sub, opacity = 1, titleColor = C.white, subColor = C.grey, en }) => {
  const { top, height } = LAYOUT.topCaption;
  return (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        top,
        left: 60,
        right: 60,
        height,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        opacity,
        transform: `translateY(${(1 - opacity) * 14}px)`,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: en ? PX_FONT : AR_FONT,
          fontWeight: 800,
          fontSize: en ? 40 : 58,
          lineHeight: en ? 1.4 : 1.35,
          color: titleColor,
          textShadow: "4px 4px 0 #000",
        }}
      >
        {title}
      </div>
      {sub ? (
        <div style={{ fontFamily: AR_FONT, fontWeight: 700, fontSize: 36, lineHeight: 1.4, color: subColor }}>{sub}</div>
      ) : null}
    </div>
  );
};

/** Medical label: English term (pixel font) + Arabic explanation, below the stage. */
export const MedLabel: React.FC<{
  en?: string;
  ar?: string;
  opacity?: number;
  color?: string;
  note?: string;
}> = ({ en, ar, opacity = 1, color = C.red, note }) => {
  const { top, height } = LAYOUT.bottomCaption;
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 70,
        right: 70,
        height,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 12,
        opacity,
        transform: `translateY(${(1 - opacity) * 14}px)`,
      }}
    >
      {en ? (
        <div
          style={{
            fontFamily: PX_FONT,
            fontSize: en.length > 22 ? 26 : 34,
            color: "#fff",
            background: color,
            padding: "14px 22px 12px",
            lineHeight: 1.3,
            textAlign: "center",
            boxShadow: "6px 6px 0 rgba(0,0,0,0.6)",
          }}
        >
          {en}
        </div>
      ) : null}
      {ar ? (
        <div
          dir="rtl"
          style={{
            fontFamily: AR_FONT,
            fontWeight: 800,
            fontSize: 42,
            lineHeight: 1.4,
            color: C.white,
            textAlign: "center",
            background: "rgba(6,10,26,0.85)",
            padding: "6px 22px",
          }}
        >
          {ar}
        </div>
      ) : null}
      {note ? (
        <div dir="rtl" style={{ fontFamily: AR_FONT, fontWeight: 700, fontSize: 30, color: C.grey, textAlign: "center" }}>
          {note}
        </div>
      ) : null}
    </div>
  );
};

/** Speech bubble (screen space, positioned over the stage). */
export const Bubble: React.FC<{
  x: number;
  y: number;
  opacity: number;
  tail?: "left" | "right";
  children: React.ReactNode;
  width?: number;
}> = ({ x, y, opacity, tail = "left", children, width }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width,
      opacity,
      transform: `scale(${0.85 + 0.15 * opacity})`,
      transformOrigin: tail === "left" ? "bottom left" : "bottom right",
      background: "#fff",
      color: "#14101f",
      padding: "14px 26px",
      fontFamily: AR_FONT,
      fontWeight: 800,
      fontSize: 44,
      boxShadow: "0 0 0 5px #14101f, 8px 8px 0 5px rgba(0,0,0,0.35)",
      zIndex: 20,
    }}
  >
    {children}
    <div
      style={{
        position: "absolute",
        bottom: -22,
        [tail === "left" ? "left" : "right"]: 34,
        width: 0,
        height: 0,
        borderLeft: "14px solid transparent",
        borderRight: "14px solid transparent",
        borderTop: "22px solid #14101f",
      }}
    />
  </div>
);

/** Unreadable, broken "speech": scattered fragments, not words. */
export const BrokenSpeech: React.FC<{ t: number; count?: number }> = ({ t, count = 7 }) => {
  const shapes = ["M0 8 L6 0 L12 8", "M0 4 L12 4", "M0 0 Q6 12 12 0", "M2 0 L2 10", "M0 10 L10 0", "M0 6 Q6 -4 12 6"];
  return (
    <svg width={count * 30} height={40} viewBox={`0 0 ${count * 30} 40`}>
      {Array.from({ length: count }, (_, i) => {
        const visible = (Math.floor(t * 8) + i * 3) % 5 !== 0;
        return (
          <path
            key={i}
            d={shapes[(i * 7 + Math.floor(t * 3)) % shapes.length]}
            transform={`translate(${i * 30 + 8} ${12 + ((i * 5) % 9)}) scale(1.4)`}
            stroke="#14101f"
            strokeWidth={2.4}
            fill="none"
            opacity={visible ? 1 : 0.15}
          />
        );
      })}
    </svg>
  );
};

/** Optional safe-zone guides for layout review (off in renders). */
export const SafeZones: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 99 }}>
    {[
      { top: 0, height: LAYOUT.header.top, c: "rgba(255,0,0,0.25)" },
      { top: LAYOUT.safeBottom, height: 1920 - LAYOUT.safeBottom, c: "rgba(255,0,0,0.25)" },
    ].map((z, i) => (
      <div key={i} style={{ position: "absolute", left: 0, right: 0, top: z.top, height: z.height, background: z.c }} />
    ))}
    <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 60, background: "rgba(255,0,0,0.15)" }} />
    <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: 60, background: "rgba(255,0,0,0.15)" }} />
  </div>
);

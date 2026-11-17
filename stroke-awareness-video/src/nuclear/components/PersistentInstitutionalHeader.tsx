import React from "react";
import { Img, staticFile } from "remotion";
import meta from "../../../public/nuclear/logos/logos.json";

export const HEADER_H = 148;

/**
 * Fixed institutional header, rendered ONCE above every scene and transition for all 3600 frames.
 * Order right → left: Majmaah University · Emergency Medicine Club · Student Council.
 * Original files, original colours and proportions; no glow, no motion, no added backgrounds.
 * The Emergency Club file is the club's original JPEG, whose white background is part of the file.
 */
export type HeaderStyle = "transparent" | "plates";
const Logo: React.FC<{ name: keyof typeof meta; h: number; alt: string; plate: boolean }> = ({ name, h, alt, plate }) => {
  const img = <Img src={staticFile(`nuclear/logos/${name}.png`)} alt={alt} style={{ height: h, width: h * meta[name].ratio, display: "block", flexShrink: 0 }} />;
  // "plates": optional review variant — white rounded plate behind the transparent logos (only if the club approves it).
  if (!plate || name === "emergency-medicine-club") return img;
  return <div style={{ background: "#FFFFFF", borderRadius: 14, padding: "6px 12px", flexShrink: 0 }}>{img}</div>;
};

export const PersistentInstitutionalHeader: React.FC<{ style?: HeaderStyle }> = ({ style = "transparent" }) => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: HEADER_H,
      zIndex: 1000,
      background: "linear-gradient(180deg, rgba(8,24,39,0.94) 0%, rgba(16,43,64,0.86) 72%, rgba(16,43,64,0.78) 100%)",
      borderBottom: "1px solid rgba(86,199,217,0.22)",
      boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
      display: "flex",
      flexDirection: "row-reverse", // right → left
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 64px",
      boxSizing: "border-box",
    }}
  >
    <Logo name="majmaah-university" h={style === "plates" ? 92 : 104} alt="جامعة المجمعة — كلية الطب" plate={style === "plates"} />
    <Logo name="emergency-medicine-club" h={116} alt="نادي طب الطوارئ" plate={false} />
    <Logo name="student-council" h={style === "plates" ? 102 : 116} alt="المجلس الطلابي — كلية الطب" plate={style === "plates"} />
  </div>
);

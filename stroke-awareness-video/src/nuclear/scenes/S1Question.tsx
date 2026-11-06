import React from "react";
import { Earth, Stars } from "../components/Earth";
import { CityIcon, FacilityIcon } from "../components/Icons";
import { MapLayer } from "../components/MapLayer";
import { KeyWord } from "../components/Text";
import { sc } from "../data/timeline";
import { at } from "../data/words";
import { C, lerp, ramp } from "../theme";

/** 00:00 — Earth from space → push-in → fictional map: facility far away, "us" near. */
export const FAC = { x: 560, y: 600 }; // facility on screen (map phase)
export const S1Question: React.FC<{ f: number }> = ({ f }) => {
  const s = sc("s1");
  const lf = f - s.start;
  const a0 = ramp(lf, 8, 40);
  const push = ramp(lf, 0, 150);
  const zoom = ramp(lf, 112, 62);
  const r = lerp(300, 420, push) * Math.pow(9, zoom);
  const lon = 1.3 + lf * 0.0032 * (1 - 0.7 * zoom);
  const earthA = a0 * (1 - ramp(lf, 128, 30));
  const mapIn = ramp(lf, 126, 34);
  const mapScale = lerp(2.6, 1, ramp(lf, 140, 70));
  const line = ramp(f, at("s1", "مئات") - 6, 46);
  const route = ramp(f, at("s1", "وكيف") - 4, 60);
  const exit = ramp(f, s.end - 46, 64); // push toward facility (continues into s2 overlap)
  const camS = 1 + exit * 2.4;
  const ox = (540 - FAC.x) * exit, oy = (960 - FAC.y) * exit;
  return (
    <div style={{ position: "absolute", inset: 0, background: "#04090f" }}>
      <Stars alpha={a0 * (1 - mapIn)} drift={lf * 0.08} />
      {earthA > 0.002 ? (
        <Earth view={{ cx: 540, cy: 960, r, lon, tilt: 0.38, alpha: earthA }} style={{ filter: zoom > 0.15 ? `blur(${(zoom - 0.15) * 22}px)` : undefined }} />
      ) : null}
      {mapIn > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: mapIn, transform: `translate(${ox}px, ${oy}px) scale(${camS})`, transformOrigin: `${FAC.x}px ${FAC.y}px` }}>
          <div style={{ position: "absolute", inset: 0, transform: `scale(${mapScale})`, transformOrigin: "540px 960px" }}>
            <MapLayer style={{ left: 0, top: 420, transform: "scale(1.78)", transformOrigin: "540px 540px" }} />
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, rgba(8,24,39,0) 30%, rgba(8,24,39,0.85) 80%)" }} />
          </div>
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            {/* invisible route: faint air currents between source and us */}
            {[0, 1, 2].map((k) => (
              <path
                key={k}
                d={`M ${FAC.x} ${FAC.y} C ${FAC.x + 220 - k * 120} ${FAC.y + 260}, ${520 - 200 + k * 140} ${1100}, 500 1290`}
                fill="none"
                stroke={C.cyan}
                strokeWidth={2}
                strokeDasharray="4 18"
                strokeDashoffset={-lf * 1.2}
                opacity={0.45 * route}
              />
            ))}
            <line x1={FAC.x - 4} y1={FAC.y + 50} x2={lerp(FAC.x - 4, 502, line)} y2={lerp(FAC.y + 50, 1248, line)} stroke={C.white} strokeWidth={3} strokeDasharray="14 12" opacity={0.75 * Math.min(1, line * 4)} />
            <FacilityIcon x={FAC.x} y={FAC.y} s={lerp(0.6, 1, ramp(lf, 150, 20))} />
            <CityIcon x={500} y={1290} />
          </svg>
          <div dir="rtl" style={{ position: "absolute", top: 1345, left: 380, width: 240, textAlign: "center", fontFamily: "'IBM Plex Sans Arabic'", fontWeight: 600, fontSize: 32, color: C.cyan, opacity: ramp(lf, 165, 15) * (1 - exit) }}>
            نحن
          </div>
          <div dir="rtl" style={{ position: "absolute", top: FAC.y - 104, left: FAC.x - 200, width: 400, textAlign: "center", fontFamily: "'IBM Plex Sans Arabic'", fontWeight: 600, fontSize: 30, color: C.amber, opacity: ramp(lf, 165, 15) * (1 - exit) }}>
            منشأة نووية افتراضية
          </div>
        </div>
      ) : null}
      <KeyWord f={f} at={at("s1", "حادث")} out={at("s1", "مئات") - 4} text="حادث نووي؟" size={84} top={300} />
      <KeyWord f={f} at={at("s1", "مئات")} out={at("s1", "هل") - 2} text="مئات الكيلومترات…" size={70} color={C.amber} top={300} />
      <KeyWord f={f} at={at("s1", "هل")} out={s.end - 8} text="هل يصل التأثير إلينا؟" size={68} top={300} />
    </div>
  );
};

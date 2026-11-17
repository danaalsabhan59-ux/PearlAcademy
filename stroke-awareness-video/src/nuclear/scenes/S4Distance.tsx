import { useCues } from "../data/cues";
import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { CameraRig } from "../three/common";
import { mw, Plume, Rings, SourceMarker, Terrain3D, WindArrow } from "../three/Terrain3D";
import { KeyWord } from "../components/Text";
import { XF } from "../data/timeline";
import { C, FONT, lerp, ramp } from "../theme";

/** Map coordinates (0..1080). */
const SRC = { x: 300, y: 600 };

const Chip: React.FC<{ f: number; at: number; text: string; x: number; y: number; icon: React.ReactNode; active: number }> = ({ f, at: a0, text, x, y, icon, active }) => {
  const p = ramp(f, a0, 14);
  if (p <= 0) return null;
  return (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        left: x - 230,
        top: y,
        width: 460,
        display: "flex",
        justifyContent: "center",
        opacity: p,
        transform: `translateY(${(1 - p) * 20}px) scale(${1 + 0.06 * active})`,
        zIndex: 760,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 24px", borderRadius: 18, background: "rgba(8,24,39,0.84)", border: `2px solid ${active > 0.5 ? C.amber : "rgba(86,199,217,0.5)"}`, boxShadow: active > 0.5 ? "0 0 24px rgba(232,173,69,0.35)" : "none" }}>
        {icon}
        <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 40, color: C.white, whiteSpace: "nowrap" }}>{text}</span>
      </div>
    </div>
  );
};

const I = {
  dist: <svg width={36} height={36}><circle cx={18} cy={18} r={6} fill={C.amber} /><circle cx={18} cy={18} r={15} fill="none" stroke={C.cyan} strokeWidth={2.5} strokeDasharray="4 4" /></svg>,
  wind: <svg width={40} height={36}><path d="M 4 12 H 26 a 6 6 0 1 0 -6 -6 M 4 22 H 32 a 6 6 0 1 1 -6 6" stroke={C.cyan} strokeWidth={3.4} fill="none" strokeLinecap="round" /></svg>,
  amount: <svg width={36} height={36}>{[0, 1, 2].map((k) => <rect key={k} x={4 + k * 11} y={24 - k * 8} width={8} height={10 + k * 8} rx={2} fill={k === 2 ? C.amber : C.cyan} />)}</svg>,
  weather: <svg width={40} height={36}><ellipse cx={22} cy={14} rx={14} ry={9} fill={C.cyan} /><ellipse cx={12} cy={17} rx={9} ry={7} fill={C.cyan} />{[0, 1, 2].map((k) => <line key={k} x1={10 + k * 9} y1={27} x2={7 + k * 9} y2={34} stroke={C.cyan} strokeWidth={2.6} strokeLinecap="round" />)}</svg>,
};

/** 3D dispersion map over fictional terrain: illustrative plume shaped by wind direction/speed, amount and weather. No numbers. */
export const S4Distance: React.FC<{ f: number }> = ({ f }) => {
  const { at, sc, silent } = useCues();
  const cy = silent ? 1000 : 0; // silent film: chips sit low (no subtitles there)
  const s = sc("s4");
  const lf = f - s.start;
  const len = s.end - s.start;
  const fDist = at("s4", "ابتعدنا");
  const fBut = at("s4", "لكن");
  const fWind = at("s4", "فاتجاه");
  const fSpeed = at("s4", "وسرعتها");
  const fAmt = at("s4", "وكمية");
  const fWx = at("s4", "والظروف");
  const fAll = at("s4", "كلها");
  const src = mw(SRC.x, SRC.y);
  const rings = ramp(f, fDist, 36);
  const dir = lerp(8, -38, ramp(f, fWind, 50)) + 14 * ramp(f, fWx, 40) * Math.sin((f - fWx) / 22);
  const L = lerp(3, 9.5, ramp(lf, 10, 140)) * lerp(1, 1.3, ramp(f, fSpeed, 40));
  const amount = 1 + 0.8 * Math.min(ramp(f, fAmt, 20), 1 - ramp(f, fAmt + 70, 30));
  const meander = ramp(f, fWx, 40);
  const az = lerp(-1.16, -0.98, ramp(lf, 0, len + XF, (t) => t));
  const elev = lerp(0.16, 0.95, ramp(lf, 0, 90));
  const dist = lerp(13, 11, ramp(lf, 0, len));
  const tgt: [number, number, number] = [src[0] + 1.3, 0.5, src[2] - 0.35];
  const cam = {
    pos: [tgt[0] + Math.sin(az) * dist * Math.cos(elev), tgt[1] + dist * Math.sin(elev), tgt[2] + Math.cos(az) * dist * Math.cos(elev)] as [number, number, number],
    target: tgt,
    fov: 50,
  };
  const act = (a: number, b: number) => Math.min(ramp(f, a, 10), 1 - ramp(f, b, 10));
  const exit = ramp(lf, len - 26, 26 + XF);
  const dropY = lerp(-200, 980, exit);
  return (
    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, #06111c 0%, ${C.navy} 45%, ${C.blue} 100%)` }}>
      <ThreeCanvas width={1080} height={1920} style={{ position: "absolute", inset: 0 }} gl={{ antialias: true }}>
        <CameraRig cam={cam} />
        <fog attach="fog" args={["#081827", 14, 34]} />
        <hemisphereLight args={["#9fc4dd", "#081827", 0.7]} />
        <directionalLight position={[-10, 6, -4]} intensity={1.9} color="#e2ecf4" />
        <ambientLight intensity={0.25} />
        <Terrain3D />
        <Rings src={src} p={rings} />
        <Plume src={src} dirDeg={dir} L={L} amount={amount} meander={meander} t={lf} />
        <WindArrow at={[src[0] + 1.2, src[1] + 2.2, src[2] - 1.6]} dirDeg={dir} opacity={ramp(lf, 30, 20)} />
        <SourceMarker at={src} pulse={(lf % 45) / 45} />
      </ThreeCanvas>
      {exit > 0 ? (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <radialGradient id="dropG4" cx="40%" cy="35%" r="70%"><stop offset="0%" stopColor="#d7f3fb" stopOpacity={0.9} /><stop offset="55%" stopColor="#56C7D9" stopOpacity={0.55} /><stop offset="100%" stopColor="#1d6f8a" stopOpacity={0.75} /></radialGradient>
          </defs>
          <path transform={`translate(540 ${dropY}) scale(${0.6 + exit * 0.9})`} d="M 0 -120 C 30 -70 70 -20 70 25 C 70 70 38 100 0 100 C -38 100 -70 70 -70 25 C -70 -20 -30 -70 0 -120 Z" fill="url(#dropG4)" stroke="#bfe6f2" strokeOpacity={0.7} strokeWidth={3} />
        </svg>
      ) : null}
      <Chip f={f} at={fDist} text="المسافة" x={300} y={cy + 392} icon={I.dist} active={act(fDist, fBut + 30)} />
      <Chip f={f} at={fWind} text="اتجاه الرياح" x={780} y={cy + 392} icon={I.wind} active={act(fWind, fAmt)} />
      <Chip f={f} at={fAmt} text="كمية التسرب" x={300} y={cy + 478} icon={I.amount} active={act(fAmt, fWx)} />
      <Chip f={f} at={fWx} text="الظروف الجوية" x={780} y={cy + 478} icon={I.weather} active={act(fWx, fAll)} />
      <KeyWord f={f} at={fDist} out={fBut - 2} text="هل المسافة كافية؟" size={66} top={250} />
      <KeyWord f={f} at={fBut} out={s.end + 6} text="المسافة ليست العامل الوحيد" size={60} color={C.amber} top={250} chip />
    </div>
  );
};

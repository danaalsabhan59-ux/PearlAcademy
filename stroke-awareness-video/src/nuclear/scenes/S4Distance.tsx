import React from "react";
import { MapLayer } from "../components/MapLayer";
import { KeyWord, Tag } from "../components/Text";
import { sc, XF } from "../data/timeline";
import { at } from "../data/words";
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

/** 3D dispersion map: illustrative plume whose shape follows wind direction/speed, release amount and weather. No numbers. */
export const S4Distance: React.FC<{ f: number }> = ({ f }) => {
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
  const tiltIn = ramp(lf, 0, 70);
  const tilt = lerp(78, 52, tiltIn);
  const orbit = lerp(-8, 6, ramp(lf, 0, len));
  const scale = lerp(1.15, 1.32, ramp(lf, 0, len));
  const rings = ramp(f, fDist, 30);
  const dirT = ramp(f, fWind, 50);
  const dir = lerp(8, -38, dirT) + 14 * ramp(f, fWx, 40) * Math.sin((f - fWx) / 22);
  const L = lerp(240, 520, ramp(lf, 10, 120)) * lerp(1, 1.35, ramp(f, fSpeed, 40));
  const amount = 1 + 0.7 * Math.min(ramp(f, fAmt, 20), 1 - ramp(f, fAmt + 70, 30));
  const meander = ramp(f, fWx, 40);
  const exit = ramp(lf, len - 30, 30 + XF);
  const rad = (dir * Math.PI) / 180;
  const ux = Math.cos(rad), uy = Math.sin(rad);
  const blobs = Array.from({ length: 70 }, (_, k) => {
    const d = (k / 69) * L;
    const sig = 18 + d * 0.3;
    const wob = Math.sin(d / 60 - lf / 18) * 30 * meander;
    const x = SRC.x + ux * d - uy * wob;
    const y = SRC.y + uy * d + ux * wob;
    const op = 0.085 * amount * Math.pow(1 - d / (L * 1.08), 1.2);
    return { x, y, r: sig, op };
  });
  const act = (a: number, b: number) => Math.min(ramp(f, a, 10), 1 - ramp(f, b, 10));
  return (
    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 55%, ${C.blue} 0%, ${C.navy} 60%, #050e17 100%)` }}>
      <div style={{ position: "absolute", left: 0, top: 380, width: 1080, height: 1080, perspective: 1500, perspectiveOrigin: "540px 300px", opacity: 1 - exit * 0.7 }}>
        <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `translateY(${60 + exit * 120}px) rotateX(${tilt}deg) rotateZ(${orbit}deg) scale(${scale})` }}>
          <MapLayer style={{ left: 0, top: 0, filter: "brightness(0.95)" }} />
          <svg width={1080} height={1080} style={{ position: "absolute", inset: 0 }}>
            <defs>
              <radialGradient id="blob"><stop offset="0%" stopColor={C.amber} stopOpacity={1} /><stop offset="100%" stopColor={C.amber} stopOpacity={0} /></radialGradient>
              <radialGradient id="edge" cx="50%" cy="50%" r="50%"><stop offset="70%" stopColor="#081827" stopOpacity={0} /><stop offset="100%" stopColor="#081827" stopOpacity={0.95} /></radialGradient>
            </defs>
            {[150, 300, 450].map((r, k) => (
              <circle key={r} cx={SRC.x} cy={SRC.y} r={r * rings} fill="none" stroke={C.white} strokeWidth={3} strokeDasharray="12 12" opacity={0.45 - k * 0.1} />
            ))}
            {blobs.map((b, k) => (
              <circle key={k} cx={b.x} cy={b.y} r={b.r} fill="url(#blob)" opacity={Math.min(1, b.op * 4)} />
            ))}
            {/* wind arrow */}
            <g transform={`translate(${SRC.x + ux * 120 - uy * -150} ${SRC.y + uy * 120 + ux * -150}) rotate(${dir})`} opacity={ramp(lf, 30, 20)}>
              <line x1={-60} y1={0} x2={50} y2={0} stroke={C.cyan} strokeWidth={8} strokeLinecap="round" />
              <path d="M 50 -20 L 82 0 L 50 20 Z" fill={C.cyan} />
            </g>
            <circle cx={SRC.x} cy={SRC.y} r={16} fill={C.amber} />
            <circle cx={SRC.x} cy={SRC.y} r={30} fill="none" stroke={C.amber} strokeWidth={3} />
            <rect x={0} y={0} width={1080} height={1080} fill="url(#edge)" />
          </svg>
        </div>
      </div>
      <Tag f={f} a={s.start + 10} b={s.end + XF} text="خريطة افتراضية توضيحية — لا تمثل حدثاً حقيقياً" top={376} />
      <Chip f={f} at={fDist} text="المسافة" x={300} y={1180} icon={I.dist} active={act(fDist, fBut + 30)} />
      <Chip f={f} at={fWind} text="اتجاه الرياح" x={780} y={1180} icon={I.wind} active={act(fWind, fAmt)} />
      <Chip f={f} at={fAmt} text="كمية التسرب" x={300} y={1290} icon={I.amount} active={act(fAmt, fWx)} />
      <Chip f={f} at={fWx} text="الظروف الجوية" x={780} y={1290} icon={I.weather} active={act(fWx, fAll)} />
      <KeyWord f={f} at={fDist} out={fBut - 2} text="هل المسافة كافية؟" size={66} top={250} />
      <KeyWord f={f} at={fBut} out={s.end + 6} text="المسافة ليست العامل الوحيد" size={60} color={C.amber} top={250} chip />
    </div>
  );
};

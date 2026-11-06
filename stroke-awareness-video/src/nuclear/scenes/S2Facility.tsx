import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { Callout } from "../components/Callout";
import { KeyWord } from "../components/Text";
import { sc, XF } from "../data/timeline";
import { at } from "../data/words";
import { CameraRig, project } from "../three/common";
import { Facility3D, POINTS } from "../three/Facility3D";
import { camAt } from "../three/keys";
import { C, ramp } from "../theme";

/** 3D cutaway of a fictional facility: aerial arrival → wedge opens → labels → loss of containment (no explosion) → tilt up with the rising material. */
export const S2Facility: React.FC<{ f: number }> = ({ f }) => {
  const s = sc("s2");
  const lf = f - s.start;
  const len = s.end - s.start;
  const fDmg = at("s2", "الحوادث");
  const fLeak = at("s2", "تتسرب");
  const damage = ramp(f, fDmg, 40);
  const gap = ramp(lf, 34, 70) * 1.75;
  const flow = lf * 0.035 - Math.max(0, f - fDmg) * 0.026 * Math.min(1, damage);
  const cam = camAt(lf, [
    [0, { pos: [3, 30, 22], target: [0.6, 1.5, 0], fov: 46 }],
    [86, { pos: [9.5, 7.0, 15.5], target: [1.0, 2.2, 0], fov: 46 }],
    [210, { pos: [5.2, 4.4, 11.5], target: [0.3, 2.1, -0.2], fov: 46 }],
    [len - 70, { pos: [6.2, 5.2, 10.6], target: [0.8, 3.3, 0], fov: 46 }],
    [len + XF, { pos: [6.6, 6.4, 11.0], target: [2.0, 12, 0.5], fov: 50 }],
  ]);
  const labelsOut = fDmg + 4;
  const P = (k: keyof typeof POINTS) => project(cam, POINTS[k]);
  const r = P("reactor"), ct = P("containment"), co = P("cooling"), sh = P("shield");
  return (
    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, #06111c 0%, ${C.navy} 40%, ${C.blue} 100%)` }}>
      <ThreeCanvas width={1080} height={1920} style={{ position: "absolute", inset: 0 }} gl={{ antialias: true }}>
        <CameraRig cam={cam} />
        <fog attach="fog" args={["#0a1a29", 14, 60]} />
        <hemisphereLight args={["#9fc4dd", "#0b1824", 0.9]} />
        <directionalLight position={[6, 10, 8]} intensity={1.6} color="#dbe8f2" />
        <directionalLight position={[-8, 5, -4]} intensity={0.5} color="#56C7D9" />
        <ambientLight intensity={0.15} />
        <Facility3D f={lf} gap={gap} damage={damage} leakAge={Math.max(0, f - fLeak)} flow={flow} />
      </ThreeCanvas>
      <Callout f={f} at={s.start + 96} out={labelsOut} x={r.x} y={r.y} tx={180} ty={840} text="المفاعل" />
      <Callout f={f} at={s.start + 114} out={labelsOut} x={ct.x} y={ct.y} tx={860} ty={480} text="مبنى الاحتواء" />
      <Callout f={f} at={s.start + 132} out={labelsOut} x={co.x} y={co.y} tx={880} ty={1250} text="أنظمة التبريد" />
      <Callout f={f} at={s.start + 150} out={labelsOut} x={sh.x} y={sh.y} tx={200} ty={1250} text="الحواجز الواقية" />
      <KeyWord f={f} at={at("s2", "انفجار")} out={fLeak - 2} text="تضرر المنشأة ≠ انفجار نووي" size={62} top={250} chip />
      <KeyWord f={f} at={fLeak} out={s.end + 4} text="احتمال تسرب مواد مشعة" size={62} color={C.amber} top={250} chip />
    </div>
  );
};

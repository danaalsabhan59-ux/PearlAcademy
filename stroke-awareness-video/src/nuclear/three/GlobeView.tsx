import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { CameraRig } from "./common";
import { Globe } from "./Globe";

/** Full-frame 3D globe; `z` = camera distance (radius 1 globe at origin), `cy` shifts the globe vertically (world units). */
export const GlobeView: React.FC<{ z: number; rot: number; opacity: number; cy?: number; blur?: number }> = ({ z, rot, opacity, cy = 0, blur = 0 }) => (
  <div style={{ position: "absolute", inset: 0, opacity, filter: blur > 0.2 ? `blur(${blur}px)` : undefined }}>
    <ThreeCanvas width={1080} height={1920} style={{ position: "absolute", inset: 0 }} gl={{ antialias: true, alpha: true }}>
      <CameraRig cam={{ pos: [0, -cy, z], target: [0, -cy, 0], fov: 30 }} />
      <ambientLight intensity={0.08} />
      <directionalLight position={[-4, 3, 5]} intensity={2.6} color="#fff6ea" />
      <directionalLight position={[5, -2, -3]} intensity={0.25} color="#56C7D9" />
      <Globe rot={rot} cloudRot={rot * 1.15 + 0.4} />
    </ThreeCanvas>
  </div>
);

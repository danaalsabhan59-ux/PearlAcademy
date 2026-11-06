import { useThree } from "@react-three/fiber";
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";

export type Cam = { pos: [number, number, number]; target: [number, number, number]; fov: number };

/** Sets the R3F default camera every frame from plain values (deterministic per frame). */
export const CameraRig: React.FC<{ cam: Cam }> = ({ cam }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.position.set(...cam.pos);
    c.fov = cam.fov;
    c.near = 0.05;
    c.far = 400;
    c.lookAt(...cam.target);
    c.updateProjectionMatrix();
  }, [camera, cam]);
  return null;
};

/** Project a world point to screen pixels (1080×1920) for HTML labels. */
export const project = (cam: Cam, p: [number, number, number]) => {
  const c = new THREE.PerspectiveCamera(cam.fov, 1080 / 1920, 0.05, 400);
  c.position.set(...cam.pos);
  c.lookAt(...cam.target);
  c.updateMatrixWorld();
  c.updateProjectionMatrix();
  const v = new THREE.Vector3(...p).project(c);
  return { x: (v.x * 0.5 + 0.5) * 1080, y: (-v.y * 0.5 + 0.5) * 1920 };
};

/** Soft radial sprite texture (for glows, vapour, plume puffs). */
let SOFT: THREE.CanvasTexture | null = null;
export const softTexture = () => {
  if (SOFT) return SOFT;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.4, "rgba(255,255,255,0.45)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  SOFT = new THREE.CanvasTexture(c);
  return SOFT;
};

/** Deterministic star points. */
export const Stars3D: React.FC<{ opacity: number }> = ({ opacity }) => {
  const geo = useMemo(() => {
    const n = 1400, a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const u = Math.sin(i * 12.9898) * 43758.5453, v = Math.sin(i * 78.233) * 12345.678;
      const th = (u - Math.floor(u)) * Math.PI * 2, ph = Math.acos(2 * (v - Math.floor(v)) - 1);
      a[i * 3] = 120 * Math.sin(ph) * Math.cos(th); a[i * 3 + 1] = 120 * Math.cos(ph); a[i * 3 + 2] = 120 * Math.sin(ph) * Math.sin(th);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(a, 3));
    return g;
  }, []);
  return (
    <points geometry={geo}>
      <pointsMaterial color="#F5F7FA" size={0.35} sizeAttenuation transparent opacity={opacity} depthWrite={false} />
    </points>
  );
};

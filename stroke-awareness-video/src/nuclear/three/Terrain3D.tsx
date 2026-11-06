import React, { useMemo } from "react";
import * as THREE from "three";
import { mapCanvas, mapHeight } from "../animations/map";
import { softTexture } from "./common";

/** World size of the terrain (map 1080 px ↔ SIZE units). */
export const SIZE = 20;
const HS = 4.2; // height scale
export const terrainY = (u: number, v: number) => mapHeight(u, v) * HS;
/** map pixel → world */
export const mw = (px: number, py: number): [number, number, number] => {
  const u = px / 1080, v = py / 1080;
  return [(u - 0.5) * SIZE, terrainY(u, v), (v - 0.5) * SIZE];
};

export const Terrain3D: React.FC = () => {
  const { geo, tex } = useMemo(() => {
    const seg = 220;
    const g = new THREE.PlaneGeometry(SIZE, SIZE, seg, seg);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i) / SIZE + 0.5, v = pos.getZ(i) / SIZE + 0.5;
      pos.setY(i, terrainY(u, v));
    }
    g.computeVertexNormals();
    const t = new THREE.CanvasTexture(mapCanvas());
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return { geo: g, tex: t };
  }, []);
  return (
    <group>
      <mesh geometry={geo}>
        <meshStandardMaterial map={tex} roughness={0.95} metalness={0} />
      </mesh>
      {/* water plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[SIZE, SIZE]} />
        <meshStandardMaterial color="#0d2b40" roughness={0.25} metalness={0.2} transparent opacity={0.55} />
      </mesh>
    </group>
  );
};

/** Illustrative plume: additive puffs along the wind direction; fainter with distance. No numbers. */
export const Plume: React.FC<{ src: [number, number, number]; dirDeg: number; L: number; amount: number; meander: number; t: number }> = ({ src, dirDeg, L, amount, meander, t }) => {
  const soft = softTexture();
  const rad = (dirDeg * Math.PI) / 180;
  const ux = Math.cos(rad), uz = Math.sin(rad);
  return (
    <group>
      {Array.from({ length: 90 }, (_, k) => {
        const d = (k / 89) * L;
        const sig = 0.22 + d * 0.15;
        const wob = Math.sin(d * 0.9 - t / 18) * 0.6 * meander;
        const jitter = Math.sin(k * 12.9898) * 0.5;
        const x = src[0] + ux * d - uz * (wob + jitter * sig * 0.6);
        const z = src[2] + uz * d + ux * (wob + jitter * sig * 0.6);
        const y = src[1] + 0.5 + d * 0.06;
        const op = 0.15 * amount * Math.pow(Math.max(0, 1 - d / (L * 1.05)), 1.3);
        return (
          <sprite key={k} position={[x, y, z]} scale={[sig * 2.4, sig * 1.6, 1]}>
            <spriteMaterial map={soft} color="#E8AD45" transparent opacity={op} depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
        );
      })}
    </group>
  );
};

export const Rings: React.FC<{ src: [number, number, number]; p: number }> = ({ src, p }) => (
  <group position={[src[0], src[1] + 0.25, src[2]]}>
    {[2.5, 5, 7.5].map((r, i) => (
      <mesh key={r} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[r * p - 0.04, r * p + 0.04, 128]} />
        <meshBasicMaterial color="#F5F7FA" transparent opacity={(0.55 - i * 0.12) * Math.min(1, p * 2)} depthWrite={false} />
      </mesh>
    ))}
  </group>
);

export const WindArrow: React.FC<{ at: [number, number, number]; dirDeg: number; opacity: number }> = ({ at, dirDeg, opacity }) => (
  <group position={at} rotation={[0, (-dirDeg * Math.PI) / 180, 0]}>
    <mesh rotation={[0, 0, -Math.PI / 2]} position={[0.6, 0, 0]}>
      <cylinderGeometry args={[0.07, 0.07, 1.6, 12]} />
      <meshStandardMaterial color="#56C7D9" emissive="#56C7D9" emissiveIntensity={0.8} transparent opacity={opacity} />
    </mesh>
    <mesh rotation={[0, 0, -Math.PI / 2]} position={[1.6, 0, 0]}>
      <coneGeometry args={[0.22, 0.5, 16]} />
      <meshStandardMaterial color="#56C7D9" emissive="#56C7D9" emissiveIntensity={0.8} transparent opacity={opacity} />
    </mesh>
  </group>
);

export const SourceMarker: React.FC<{ at: [number, number, number]; pulse: number }> = ({ at, pulse }) => (
  <group position={at}>
    <mesh position={[0, 0.25, 0]}>
      <cylinderGeometry args={[0.16, 0.16, 0.5, 24]} />
      <meshStandardMaterial color="#E8AD45" emissive="#E8AD45" emissiveIntensity={1.2} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
      <ringGeometry args={[0.35 + pulse * 0.25, 0.42 + pulse * 0.25, 48]} />
      <meshBasicMaterial color="#E8AD45" transparent opacity={1 - pulse} />
    </mesh>
  </group>
);

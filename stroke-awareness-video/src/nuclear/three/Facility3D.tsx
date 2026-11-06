import React, { useMemo } from "react";
import * as THREE from "three";
import { softTexture } from "./common";

/**
 * Generic, fictional pressurised-water-style facility (no real plant): containment building with an
 * animated cutaway wedge, biological shield, reactor vessel with glowing core, steam generator,
 * primary loop, turbine hall and cooling tower. Units ≈ metres/10.
 */
const R_OUT = 2.0, R_IN = 1.74, WALL_H = 3.0;
export const CRACK_POS: [number, number, number] = [1.52, WALL_H + 1.3, -0.28];
export const POINTS = {
  reactor: [-0.25, 1.1, -0.35] as [number, number, number],
  containment: [-1.55, WALL_H + 0.9, -0.9] as [number, number, number],
  cooling: [0.95, 1.55, -0.55] as [number, number, number],
  shield: [-0.85, 0.5, 0.1] as [number, number, number],
};

const concrete = "#6f8396", concreteDark = "#3a4c5e", steel = "#9fb3c4";

const stripeTexture = () => {
  const c = document.createElement("canvas");
  c.width = 64; c.height = 8;
  const g = c.getContext("2d")!;
  g.fillStyle = "#16384d"; g.fillRect(0, 0, 64, 8);
  g.fillStyle = "#ffffff"; g.fillRect(0, 0, 22, 8);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
};

const Pipe: React.FC<{ pts: [number, number, number][]; r: number; color: string; flow: number; tex: THREE.Texture; repeat: number }> = ({ pts, r, color, flow, tex, repeat }) => {
  const geo = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, "catmullrom", 0.05), 64, r, 16, false), [pts, r]);
  const t = useMemo(() => { const c = tex.clone(); c.needsUpdate = true; c.repeat.set(repeat, 1); return c; }, [tex, repeat]);
  t.offset.x = -flow;
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} emissiveMap={t} map={t} roughness={0.4} metalness={0.3} />
    </mesh>
  );
};

export const Facility3D: React.FC<{ f: number; gap: number; damage: number; leakAge: number; flow: number }> = ({ f, gap, damage, leakAge, flow }) => {
  const stripes = useMemo(stripeTexture, []);
  const soft = softTexture();
  // cutaway wedge centred on +Z (towards camera), plus a little toward +X
  const g = Math.max(0.0001, gap);
  const centre = 0.35;
  const thStart = centre + g / 2, thLen = Math.PI * 2 - g;
  const a1 = centre + g / 2, a2 = centre - g / 2;
  const cutFace = (a: number, key: string) => {
    const d = [Math.sin(a), Math.cos(a)];
    const rotY = a - Math.PI / 2;
    return (
      <group key={key}>
        <mesh position={[d[0] * (R_OUT + R_IN) / 2, WALL_H / 2, d[1] * (R_OUT + R_IN) / 2]} rotation={[0, rotY, 0]}>
          <boxGeometry args={[R_OUT - R_IN, WALL_H, 0.02]} />
          <meshStandardMaterial color="#c9d3dc" roughness={0.9} />
        </mesh>
        <mesh position={[0, WALL_H, 0]} rotation={[0, rotY, 0]}>
          <ringGeometry args={[R_IN, R_OUT, 48, 1, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#c9d3dc" roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      </group>
    );
  };
  const coolant = new THREE.Color("#56C7D9").lerp(new THREE.Color("#E8AD45"), Math.min(1, damage * 1.4)).getStyle();
  const corePulse = 0.75 + 0.25 * Math.sin(f / 7);
  return (
    <group>
      {/* ground + site */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[160, 160]} />
        <meshStandardMaterial color="#0f2030" roughness={1} />
      </mesh>
      <gridHelper args={[60, 60, "#1f4a62", "#16324a"]} position={[0, 0.005, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.6, 0.01, 0.2]}>
        <planeGeometry args={[12, 7]} />
        <meshStandardMaterial color="#1a2c3c" roughness={1} />
      </mesh>

      {/* containment: wall + dome, with cutaway wedge */}
      <mesh position={[0, WALL_H / 2, 0]}>
        <cylinderGeometry args={[R_OUT, R_OUT, WALL_H, 128, 1, true, thStart, thLen]} />
        <meshStandardMaterial color={concrete} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, WALL_H / 2, 0]}>
        <cylinderGeometry args={[R_IN, R_IN, WALL_H, 128, 1, true, thStart, thLen]} />
        <meshStandardMaterial color={steel} roughness={0.5} metalness={0.4} side={THREE.BackSide} />
      </mesh>
      <mesh position={[0, WALL_H, 0]}>
        <sphereGeometry args={[R_OUT, 128, 64, thStart - Math.PI / 2 + Math.PI, thLen, 0, Math.PI / 2]} />
        <meshStandardMaterial color={concrete} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, WALL_H, 0]}>
        <sphereGeometry args={[R_IN, 128, 64, thStart - Math.PI / 2 + Math.PI, thLen, 0, Math.PI / 2]} />
        <meshStandardMaterial color={steel} roughness={0.5} metalness={0.4} side={THREE.BackSide} />
      </mesh>
      {gap > 0.01 ? [cutFace(a1, "a"), cutFace(a2, "b")] : null}
      {/* dome cut edges (quarter rings in the two cut planes) */}
      {gap > 0.01
        ? [a1, a2].map((a, i) => (
            <mesh key={i} position={[0, WALL_H, 0]} rotation={[0, a - Math.PI / 2, 0]}>
              <ringGeometry args={[R_IN, R_OUT, 48, 1, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#c9d3dc" roughness={0.9} side={THREE.DoubleSide} />
            </mesh>
          ))
        : null}
      {/* interior floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[R_IN, 64]} />
        <meshStandardMaterial color="#2a3c4d" roughness={0.9} />
      </mesh>
      {/* polar crane */}
      <mesh position={[0, WALL_H - 0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[R_IN - 0.08, 0.05, 8, 96]} />
        <meshStandardMaterial color="#E8AD45" roughness={0.6} />
      </mesh>
      {/* biological shield (also cut open toward the camera) */}
      <mesh position={[-0.25, 0.95, -0.35]}>
        <cylinderGeometry args={[0.72, 0.72, 1.9, 64, 1, true, thStart, thLen]} />
        <meshStandardMaterial color={concreteDark} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-0.25, 0.95, -0.35]}>
        <cylinderGeometry args={[0.55, 0.55, 1.9, 64, 1, true, thStart, thLen]} />
        <meshStandardMaterial color="#56697b" roughness={0.95} side={THREE.BackSide} />
      </mesh>
      {/* reactor pressure vessel (semi-transparent so the core reads) + core */}
      <mesh position={POINTS.reactor}>
        <capsuleGeometry args={[0.32, 1.0, 12, 32]} />
        <meshStandardMaterial color={steel} roughness={0.3} metalness={0.6} transparent opacity={0.42} />
      </mesh>
      <mesh position={[-0.25, 0.95, -0.35]}>
        <cylinderGeometry args={[0.2, 0.2, 0.62, 32]} />
        <meshStandardMaterial color="#56C7D9" emissive="#56C7D9" emissiveIntensity={1.6 * corePulse} />
      </mesh>
      {Array.from({ length: 7 }, (_, k) => (
        <mesh key={k} position={[-0.25 + Math.cos(k) * 0.11 * (k % 3), 0.95, -0.35 + Math.sin(k) * 0.11 * (k % 3)]}>
          <cylinderGeometry args={[0.025, 0.025, 0.66, 8]} />
          <meshStandardMaterial color="#d9fbff" emissive="#56C7D9" emissiveIntensity={1.2} />
        </mesh>
      ))}
      <pointLight position={[-0.25, 1.0, -0.1]} color="#56C7D9" intensity={2.2 * corePulse * (1 - 0.3 * damage)} distance={3} decay={1.5} />
      {/* steam generator + pressuriser */}
      <mesh position={[0.95, 1.45, -0.55]}>
        <capsuleGeometry args={[0.24, 1.3, 12, 32]} />
        <meshStandardMaterial color="#8da5b8" roughness={0.35} metalness={0.5} />
      </mesh>
      <mesh position={[0.35, 1.8, -1.1]}>
        <capsuleGeometry args={[0.13, 0.6, 8, 24]} />
        <meshStandardMaterial color="#8da5b8" roughness={0.35} metalness={0.5} />
      </mesh>
      {/* primary loop (hot leg / cold leg) with flowing stripes */}
      <Pipe pts={[[-0.05, 1.25, -0.35], [0.4, 1.25, -0.45], [0.8, 1.2, -0.55]]} r={0.07} color={coolant} flow={flow} tex={stripes} repeat={5} />
      <Pipe pts={[[0.85, 0.75, -0.5], [0.4, 0.62, -0.42], [-0.05, 0.7, -0.35]]} r={0.07} color={coolant} flow={flow} tex={stripes} repeat={5} />
      {/* steam line out to the turbine hall */}
      <Pipe pts={[[0.95, 2.3, -0.55], [1.6, 2.35, -0.4], [2.4, 2.0, -0.2], [3.2, 1.2, 0]]} r={0.06} color="#cfe0ea" flow={flow * 1.3} tex={stripes} repeat={8} />
      {/* turbine hall */}
      <mesh position={[4.3, 0.8, 0]}>
        <boxGeometry args={[2.4, 1.6, 1.8]} />
        <meshStandardMaterial color="#2c4a63" roughness={0.8} />
      </mesh>
      <mesh position={[4.3, 1.62, 0]}>
        <boxGeometry args={[2.5, 0.06, 1.9]} />
        <meshStandardMaterial color="#3e6180" roughness={0.6} />
      </mesh>
      {/* cooling tower (hyperboloid) + water vapour */}
      <mesh position={[7.4, 0, -3.6]}>
        <latheGeometry args={[Array.from({ length: 24 }, (_, i) => { const y = (i / 23) * 4.6; const r = 1.05 + 0.55 * ((y - 3.1) / 3.1) ** 2; return new THREE.Vector2(r, y); }), 64]} />
        <meshStandardMaterial color="#58708a" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      {Array.from({ length: 10 }, (_, i) => {
        const t = ((f * 0.5 + i * 22) % 220) / 220;
        return (
          <sprite key={i} position={[7.4 + t * 1.4, 4.7 + t * 4.5, -3.6]} scale={[1.6 + t * 3, 1.6 + t * 3, 1]}>
            <spriteMaterial map={soft} color="#e3edf3" transparent opacity={0.22 * (1 - t)} depthWrite={false} />
          </sprite>
        );
      })}
      {/* damage: hairline crack + soft amber glow on the dome */}
      {damage > 0 ? (
        <>
          <Pipe pts={[[CRACK_POS[0] - 0.12, CRACK_POS[1] + 0.12, CRACK_POS[2] + 0.04], [CRACK_POS[0], CRACK_POS[1], CRACK_POS[2] + 0.06], [CRACK_POS[0] + 0.08, CRACK_POS[1] - 0.18, CRACK_POS[2] + 0.02]]} r={0.018 * damage} color="#E8AD45" flow={0} tex={stripes} repeat={1} />
          <sprite position={CRACK_POS} scale={[0.9, 0.9, 1]}>
            <spriteMaterial map={soft} color="#E8AD45" transparent opacity={0.35 * damage * corePulse} depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
        </>
      ) : null}
      {/* symbolic radioactive material seeping out and rising */}
      {leakAge > 0
        ? Array.from({ length: 60 }, (_, i) => {
            const age = leakAge - i * 4.5;
            if (age <= 0) return null;
            const r1 = Math.sin(i * 12.9898) * 43758.5453, r2 = Math.sin(i * 78.233) * 9631.17;
            const rx = r1 - Math.floor(r1), rz = r2 - Math.floor(r2);
            const x = CRACK_POS[0] + age * (0.01 + rx * 0.012) + Math.sin(age / 16 + i) * 0.08;
            const y = CRACK_POS[1] + age * (0.02 + rz * 0.012);
            const z = CRACK_POS[2] + (rz - 0.5) * age * 0.01;
            const a = Math.min(1, age / 10);
            return (
              <group key={i} position={[x, y, z]}>
                <mesh>
                  <sphereGeometry args={[0.03, 10, 10]} />
                  <meshBasicMaterial color="#E8AD45" transparent opacity={a} />
                </mesh>
                <sprite scale={[0.22, 0.22, 1]}>
                  <spriteMaterial map={soft} color="#E8AD45" transparent opacity={0.45 * a} depthWrite={false} blending={THREE.AdditiveBlending} />
                </sprite>
              </group>
            );
          })
        : null}
    </group>
  );
};

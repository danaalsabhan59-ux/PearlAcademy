import React, { useMemo } from "react";
import * as THREE from "three";
import { globeCanvases } from "../animations/earth";

/** Fictional planet: procedural colour map, drifting cloud shell, fresnel atmosphere. */
export const Globe: React.FC<{ rot: number; cloudRot: number; opacity?: number; tilt?: number }> = ({ rot, cloudRot, opacity = 1, tilt = 0.35 }) => {
  const { colorTex, cloudTex } = useMemo(() => {
    const c = globeCanvases();
    const colorTex = new THREE.CanvasTexture(c.color);
    colorTex.colorSpace = THREE.SRGBColorSpace;
    colorTex.anisotropy = 8;
    const cloudTex = new THREE.CanvasTexture(c.clouds);
    return { colorTex, cloudTex };
  }, []);
  const atmo = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color("#56C7D9") }, uOpacity: { value: 1 } },
        vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
        fragmentShader: `uniform vec3 uColor; uniform float uOpacity; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(vN, vV)), 2.6); gl_FragColor = vec4(uColor, f*uOpacity); }`,
        side: THREE.BackSide,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  );
  atmo.uniforms.uOpacity.value = 1.3 * opacity;
  return (
    <group rotation={[tilt, 0, 0.12]}>
      <mesh rotation={[0, rot, 0]}>
        <sphereGeometry args={[1, 128, 96]} />
        <meshStandardMaterial map={colorTex} roughness={0.85} metalness={0} transparent={opacity < 1} opacity={opacity} />
      </mesh>
      <mesh rotation={[0, cloudRot, 0]}>
        <sphereGeometry args={[1.012, 96, 72]} />
        <meshStandardMaterial alphaMap={cloudTex} color="#eef4f8" transparent opacity={0.9 * opacity} depthWrite={false} roughness={1} />
      </mesh>
      <mesh scale={1.09}>
        <sphereGeometry args={[1, 64, 48]} />
        <primitive object={atmo} attach="material" />
      </mesh>
    </group>
  );
};

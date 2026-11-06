import React from "react";
import { PALETTE as P, R } from "./Px";

type MouthState = { talking: boolean; open: boolean };

/** Arm hanging from a shoulder pivot; angle 0 = straight down, rotation in degrees. */
const Arm: React.FC<{
  px: number;
  py: number;
  angle: number;
  sleeve: string;
  sleeveLen: number;
  armLen?: number;
  children?: React.ReactNode;
}> = ({ px, py, angle, sleeve, sleeveLen, armLen = 0, children }) => (
  <g transform={`translate(${px} ${py}) rotate(${angle})`}>
    <R x={-1} y={0} w={3} h={sleeveLen} c={sleeve} />
    {armLen > 0 ? <R x={-1} y={sleeveLen} w={3} h={armLen} c={P.skin} /> : null}
    <R x={-1} y={sleeveLen + armLen} w={3} h={3} c={P.skin} />
    <g transform={`translate(0 ${sleeveLen + armLen + 1})`}>{children}</g>
  </g>
);

export const Finjan: React.FC = () => (
  <>
    <R x={-2} y={-2} w={4} h={3} c="#f4f1ea" />
    <R x={-2} y={-2} w={4} h={1} c="#6b3d1f" />
    <R x={-1} y={1} w={2} h={1} c="#d9d2c3" />
  </>
);

// ---------------------------------------------------------------- the father
export type FatherPose = {
  mouth: MouthState;
  blink: boolean;
  /** 0..1 face droop on the affected side (viewer's right). */
  droop: number;
  /** 0..1 head and body slump. */
  slump: number;
  leftArm: number;
  rightArm: number;
  holdingCup: boolean;
};

const FatherHead: React.FC<{ pose: FatherPose }> = ({ pose }) => {
  const checks: React.ReactNode[] = [];
  for (let y = 1; y < 13; y++) {
    for (let x = 0; x < 12; x++) {
      const inFace = x >= 2 && x <= 9 && y >= 3;
      if (!inFace && (x + y) % 2 === 0) checks.push(<R key={`${x}-${y}`} x={x} y={y} c={P.red} />);
    }
  }
  const droopy = pose.droop > 0.5;
  const { talking, open } = pose.mouth;
  return (
    <>
      {/* ghutra (red-and-white headscarf) and agal */}
      <R x={2} y={0} w={8} h={1} c={P.thobe} />
      <R x={0} y={1} w={12} h={13} c={P.thobe} />
      <R x={-1} y={9} w={2} h={7} c={P.thobe} />
      <R x={11} y={9} w={2} h={7} c={P.thobe} />
      {checks}
      <R x={-1} y={10} c={P.red} />
      <R x={12} y={10} c={P.red} />
      <R x={-1} y={12} c={P.red} />
      <R x={12} y={12} c={P.red} />
      <R x={1} y={2} w={10} h={1} c={P.agal} />
      {/* face */}
      <R x={2} y={3} w={8} h={10} c={P.skin} />
      <R x={3} y={5} w={2} h={1} c={P.hair} />
      <R x={7} y={droopy ? 6 : 5} w={2} h={1} c={P.hair} />
      {pose.blink ? (
        <>
          <R x={3} y={6} w={2} h={1} c={P.skinShade} />
          <R x={7} y={droopy ? 7 : 6} w={2} h={1} c={P.skinShade} />
        </>
      ) : (
        <>
          <R x={4} y={6} c={P.eye} />
          <R x={3} y={6} c={P.white} />
          {droopy ? (
            <>
              <R x={7} y={6} w={2} h={1} c={P.skinShade} />
              <R x={7} y={7} c={P.eye} />
            </>
          ) : (
            <>
              <R x={7} y={6} c={P.eye} />
              <R x={8} y={6} c={P.white} />
            </>
          )}
        </>
      )}
      <R x={5} y={7} w={2} h={2} c={P.skinShade} />
      {/* beard + mouth */}
      <R x={2} y={9} w={8} h={3} c={P.beard} />
      <R x={3} y={12} w={6} h={1} c={P.beard} />
      {talking && open ? (
        <>
          <R x={4} y={10} w={droopy ? 3 : 4} h={2} c={P.mouthOpen} />
          <R x={5} y={11} w={2} h={1} c={P.tongue} />
        </>
      ) : droopy ? (
        <>
          <R x={4} y={10} w={2} h={1} c={P.mouth} />
          <R x={6} y={10} c={P.mouth} />
          <R x={7} y={11} c={P.mouth} />
        </>
      ) : (
        <R x={4} y={10} w={4} h={1} c={P.mouth} />
      )}
    </>
  );
};

/** Seated father in a white thobe and ghutra. (x, y) = top-left of the head. */
export const Father: React.FC<{ x: number; y: number; pose: FatherPose }> = ({ x, y, pose }) => {
  const bodyLean = pose.slump * 6;
  const headTilt = pose.slump * 16;
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* legs (seated, shins down to the floor) */}
      <R x={-2} y={27} w={16} h={4} c={P.thobeShade} />
      <R x={-1} y={31} w={6} h={20} c={P.thobe} />
      <R x={7} y={31} w={6} h={20} c={P.thobe} />
      <R x={4} y={31} w={1} h={20} c={P.thobeShade} />
      <R x={12} y={31} w={1} h={20} c={P.thobeShade} />
      <R x={-1} y={51} w={6} h={2} c={P.sandal} />
      <R x={7} y={51} w={6} h={2} c={P.sandal} />
      <g transform={`rotate(${bodyLean} 6 28)`}>
        {/* torso */}
        <R x={-2} y={13} w={16} h={15} c={P.thobe} />
        <R x={5} y={14} w={2} h={6} c={P.thobeShade} />
        <R x={-2} y={25} w={16} h={2} c={P.thobeShade} />
        <Arm px={-1} py={15} angle={pose.leftArm} sleeve={P.thobe} sleeveLen={11} />
        <Arm px={13} py={15} angle={pose.rightArm} sleeve={P.thobe} sleeveLen={11}>
          {pose.holdingCup ? <Finjan /> : null}
        </Arm>
        <g transform={`translate(0 ${pose.slump}) rotate(${headTilt} 6 13)`}>
          <FatherHead pose={pose} />
        </g>
      </g>
    </g>
  );
};

/** Global position of the father's right hand (for the falling cup). */
export const fatherRightHand = (x: number, y: number, angle: number) => {
  const rad = (angle * Math.PI) / 180;
  const len = 14;
  return { x: x + 13 - Math.sin(rad) * len, y: y + 15 + Math.cos(rad) * len };
};

// ------------------------------------------------------------------- the son
export type SonPose = {
  mouth: MouthState;
  blink: boolean;
  sitting: boolean;
  walkPhase: number | null;
  leftArm: number;
  rightArm: number;
  phone: boolean;
  worried: boolean;
};

export const SonHead: React.FC<{ mouth: MouthState; blink: boolean; worried: boolean }> = ({
  mouth,
  blink,
  worried,
}) => (
  <>
    <R x={1} y={0} w={8} h={1} c={P.hair} />
    <R x={0} y={1} w={10} h={3} c={P.hair} />
    <R x={1} y={3} w={8} h={6} c={P.skin} />
    <R x={2} y={9} w={6} h={1} c={P.skin} />
    <R x={0} y={4} w={1} h={3} c={P.hair} />
    <R x={9} y={4} w={1} h={3} c={P.hair} />
    <R x={0} y={5} w={1} h={2} c={P.skinShade} />
    <R x={9} y={5} w={1} h={2} c={P.skinShade} />
    {worried ? (
      <>
        <R x={2} y={4} c={P.hair} />
        <R x={3} y={3} c={P.hair} />
        <R x={7} y={4} c={P.hair} />
        <R x={6} y={3} c={P.hair} />
      </>
    ) : (
      <>
        <R x={2} y={3} w={2} h={1} c={P.hair} />
        <R x={6} y={3} w={2} h={1} c={P.hair} />
      </>
    )}
    {blink ? (
      <>
        <R x={3} y={5} w={2} h={1} c={P.skinShade} />
        <R x={6} y={5} w={2} h={1} c={P.skinShade} />
      </>
    ) : (
      <>
        <R x={3} y={5} c={P.white} />
        <R x={4} y={5} c={P.eye} />
        <R x={6} y={5} c={P.eye} />
        <R x={7} y={5} c={P.white} />
      </>
    )}
    <R x={5} y={6} c={P.skinShade} />
    {mouth.talking && mouth.open ? (
      <>
        <R x={4} y={7} w={2} h={2} c={P.mouthOpen} />
        <R x={4} y={8} w={2} h={1} c={P.tongue} />
      </>
    ) : (
      <R x={4} y={8} w={2} h={1} c={P.mouth} />
    )}
  </>
);

const Phone: React.FC = () => (
  <>
    <R x={-1} y={-1} w={3} h={5} c="#20232b" />
    <R x={0} y={0} w={1} h={3} c="#7fd3ff" />
  </>
);

/** The son in a green football jersey. (x, y) = top-left of the head. */
export const Son: React.FC<{ x: number; y: number; pose: SonPose }> = ({ x, y, pose }) => {
  const step = pose.walkPhase === null ? 0 : Math.sin(pose.walkPhase);
  const bob = pose.walkPhase === null ? 0 : Math.abs(step) > 0.5 ? -1 : 0;
  return (
    <g transform={`translate(${x} ${y + bob})`}>
      {pose.sitting ? (
        <>
          <R x={-1} y={21} w={12} h={3} c={P.shorts} />
          <R x={-4} y={24} w={18} h={3} c={P.skin} />
          <R x={-5} y={25} w={3} h={2} c={P.white} />
          <R x={12} y={25} w={3} h={2} c={P.white} />
        </>
      ) : (
        <>
          <R x={-1} y={21} w={12} h={4} c={P.shorts} />
          <g transform={`translate(${Math.round(step * 2)} 0)`}>
            <R x={0} y={25} w={4} h={8} c={P.skin} />
            <R x={0} y={33} w={4} h={2} c={P.white} />
          </g>
          <g transform={`translate(${Math.round(-step * 2)} 0)`}>
            <R x={6} y={25} w={4} h={8} c={P.skin} />
            <R x={6} y={33} w={4} h={2} c={P.white} />
          </g>
        </>
      )}
      <R x={4} y={10} w={2} h={1} c={P.skin} />
      <R x={-1} y={11} w={12} h={10} c={P.jersey} />
      <R x={-1} y={11} w={12} h={1} c={P.white} />
      <R x={3} y={14} w={1} h={4} c={P.white} />
      <R x={5} y={14} w={3} h={1} c={P.white} />
      <R x={5} y={17} w={3} h={1} c={P.white} />
      <R x={5} y={14} w={1} h={4} c={P.white} />
      <R x={7} y={14} w={1} h={4} c={P.white} />
      <R x={-1} y={19} w={12} h={2} c={P.jerseyShade} />
      <Arm px={-1} py={12} angle={pose.leftArm} sleeve={P.jersey} sleeveLen={3} armLen={5} />
      <Arm px={11} py={12} angle={pose.rightArm} sleeve={P.jersey} sleeveLen={3} armLen={5}>
        {pose.phone ? <Phone /> : null}
      </Arm>
      <SonHead mouth={pose.mouth} blink={pose.blink} worried={pose.worried} />
    </g>
  );
};

// ------------------------------------------------------------- the paramedic
export const ParamedicHead: React.FC<{ mouth: MouthState; blink: boolean }> = ({ mouth, blink }) => (
  <>
    <R x={1} y={0} w={8} h={1} c={P.uniformShade} />
    <R x={0} y={1} w={10} h={2} c={P.uniform} />
    <R x={-1} y={3} w={12} h={1} c={P.uniformShade} />
    <R x={1} y={4} w={8} h={6} c={P.skin} />
    <R x={0} y={4} w={1} h={3} c={P.hair} />
    <R x={9} y={4} w={1} h={3} c={P.hair} />
    {blink ? (
      <>
        <R x={2} y={5} w={2} h={1} c={P.skinShade} />
        <R x={6} y={5} w={2} h={1} c={P.skinShade} />
      </>
    ) : (
      <>
        <R x={3} y={5} c={P.eye} />
        <R x={6} y={5} c={P.eye} />
      </>
    )}
    <R x={4} y={6} w={2} h={1} c={P.skinShade} />
    <R x={1} y={7} w={8} h={3} c={P.beard} />
    <R x={2} y={10} w={6} h={1} c={P.beard} />
    {mouth.talking && mouth.open ? (
      <R x={3} y={8} w={4} h={2} c={P.mouthOpen} />
    ) : (
      <R x={3} y={8} w={4} h={1} c={P.mouth} />
    )}
  </>
);

/** Paramedic in a navy uniform with reflective stripes, carrying a kit bag. */
export const Paramedic: React.FC<{
  x: number;
  y: number;
  mouth: MouthState;
  blink: boolean;
  walkPhase: number | null;
}> = ({ x, y, mouth, blink, walkPhase }) => {
  const step = walkPhase === null ? 0 : Math.sin(walkPhase);
  return (
    <g transform={`translate(${x} ${y})`}>
      <g transform={`translate(${Math.round(step * 2)} 0)`}>
        <R x={0} y={26} w={4} h={11} c={P.uniformShade} />
        <R x={0} y={37} w={5} h={2} c="#111" />
      </g>
      <g transform={`translate(${Math.round(-step * 2)} 0)`}>
        <R x={6} y={26} w={4} h={11} c={P.uniformShade} />
        <R x={6} y={37} w={5} h={2} c="#111" />
      </g>
      <R x={4} y={11} w={2} h={1} c={P.skin} />
      <R x={-2} y={12} w={14} h={14} c={P.uniform} />
      <R x={-2} y={19} w={14} h={2} c={P.reflect} />
      <R x={7} y={14} w={3} h={3} c={P.white} />
      <R x={8} y={13} w={1} h={5} c={P.red} />
      <R x={7} y={15} w={3} h={1} c={P.red} />
      <Arm px={-2} py={13} angle={8} sleeve={P.uniform} sleeveLen={11} />
      <Arm px={12} py={13} angle={-6} sleeve={P.uniform} sleeveLen={11}>
        <R x={-2} y={1} w={8} h={7} c="#d63a3a" />
        <R x={-2} y={1} w={8} h={1} c="#a82828" />
        <R x={1} y={3} w={2} h={4} c={P.white} />
        <R x={0} y={4} w={4} h={2} c={P.white} />
      </Arm>
      <g transform="translate(0 1)">
        <ParamedicHead mouth={mouth} blink={blink} />
      </g>
    </g>
  );
};

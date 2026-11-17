import React from "react";
import { C } from "../styles/palette";

/** One art pixel (or a w×h block of them). */
export const P: React.FC<{ x: number; y: number; w?: number; h?: number; c: string; o?: number }> = ({
  x,
  y,
  w = 1,
  h = 1,
  c,
  o,
}) => <rect x={x} y={y} width={w} height={h} fill={c} opacity={o} />;

// ----------------------------------------------------------------- types
export type Mouth = "neutral" | "smile" | "open" | "worried" | "talk";
export type Headwear = "shemagh" | "ghutra" | "hair" | "hairQuiff" | "hijab" | "cap";

export type Face = {
  mouth: Mouth;
  /** Mouth open on this frame (for talk / failed speech). */
  open?: boolean;
  /** 0..1 droop of the viewer-left side of the face (= the character's right side). */
  droop?: number;
  look?: -1 | 0 | 1;
  blink?: boolean;
  worried?: boolean;
};

export type Look = {
  skin: string;
  skinShade: string;
  headwear: Headwear;
  headColor: string;
  headAccent?: string;
  hair: string;
  brows: string;
  beard?: string;
  beardShade?: string;
  wrinkles?: boolean;
  glasses?: boolean;
  outfit: "thobe" | "scrubs" | "coat" | "uniform";
  top: string;
  topShade: string;
  pants: string;
  pantsShade: string;
  shoes: string;
  stethoscope?: boolean;
  badge?: string;
  slim?: boolean;
};

export type Pose = {
  face: Face;
  /** Arm angles in degrees; 0 = hanging down. Viewer-left arm is the character's RIGHT arm. */
  rightArm: number;
  leftArm: number;
  seated?: boolean;
  /** Walking phase in radians (null = standing still). */
  walk?: number | null;
  /** Lean of upper body in degrees, positive = towards viewer-right. */
  lean?: number;
  /** Head tilt in degrees. */
  headTilt?: number;
  /** Head turn shifts facial features by one pixel (-1 = towards viewer-left). */
  headTurn?: -1 | 0 | 1;
  /** Idle breathing offset (0 or 1). */
  breath?: number;
  rightHand?: React.ReactNode;
  leftHand?: React.ReactNode;
};

// ------------------------------------------------------------------ head
const Head: React.FC<{ look: Look; face: Face; turn: number }> = ({ look, face, turn }) => {
  const L = look;
  const droop = (face.droop ?? 0) > 0.5;
  const fx = turn; // feature offset for head turns
  const px: React.ReactNode[] = [];
  const add = (key: string, x: number, y: number, c: string, w = 1, h = 1) =>
    px.push(<P key={key} x={x} y={y} w={w} h={h} c={c} />);

  // --- headwear behind the face
  if (L.headwear === "shemagh" || L.headwear === "ghutra") {
    add("hw-top", 2, 0, L.headColor, 8);
    add("hw", 0, 1, L.headColor, 12, 13);
    add("hw-l", -1, 9, L.headColor, 2, 8);
    add("hw-r", 11, 9, L.headColor, 2, 8);
    if (L.headwear === "shemagh" && L.headAccent) {
      for (let y = 1; y < 17; y++) {
        for (let x = -1; x < 13; x++) {
          const inFace = x >= 2 && x <= 9 && y >= 3 && y <= 13;
          const inside = (y < 14 && x >= 0 && x <= 11) || (y >= 9 && (x <= 0 || x >= 11));
          if (inside && !inFace && (x + y) % 2 === 0) add(`ck${x}-${y}`, x, y, L.headAccent);
        }
      }
    } else {
      add("gh-fold-l", 0, 4, C.thobeShade, 1, 9);
      add("gh-fold-r", 11, 4, C.thobeShade, 1, 9);
    }
    add("agal", 1, 2, C.agal, 10);
    add("agal2", 1, 3, C.agal, 1);
    add("agal3", 10, 3, C.agal, 1);
  } else if (L.headwear === "hijab") {
    add("hj", 0, 0, L.headColor, 12, 15);
    add("hj-l", -1, 4, L.headColor, 1, 11);
    add("hj-r", 12, 4, L.headColor, 1, 11);
    add("hj-shade", 0, 12, L.headAccent ?? L.headColor, 12, 3);
  } else if (L.headwear === "cap") {
    add("cap", 1, 0, L.headColor, 10, 3);
    add("cap-b", 0, 2, L.headColor, 12, 2);
    add("ear-l", 1, 6, L.skinShade, 1, 3);
    add("ear-r", 10, 6, L.skinShade, 1, 3);
  } else {
    // hair
    add("hair", 1, 0, L.hair, 10, 2);
    add("hair2", 0, 1, L.hair, 12, 3);
    add("hair-l", 1, 4, L.hair, 1, 3);
    add("hair-r", 10, 4, L.hair, 1, 3);
    if (L.headwear === "hairQuiff") {
      add("quiff", 3, -1, L.hair, 7, 1);
      add("quiff2", 6, -2, L.hair, 3, 1);
    }
    add("ear-l", 1, 6, L.skinShade, 1, 3);
    add("ear-r", 10, 6, L.skinShade, 1, 3);
  }

  // --- face
  const top = L.headwear === "hijab" ? 3 : L.headwear === "cap" ? 4 : L.headwear === "hair" || L.headwear === "hairQuiff" ? 4 : 3;
  add("face", 2, top, L.skin, 8, 13 - top);
  add("face-shade", 2, top, L.skinShade, 1, 13 - top);
  add("jaw", 3, 13, L.skin, 6, 1);
  if (L.wrinkles) {
    add("wr1", 3 + fx, top, L.skinShade, 2);
    add("wr2", 7 + fx, top, L.skinShade, 2);
  }

  // brows
  const by = top + 1;
  if (face.worried) {
    add("br-l1", 3 + fx, by + 1, L.brows);
    add("br-l2", 4 + fx, by, L.brows);
    add("br-r1", 7 + fx, by, L.brows);
    add("br-r2", 8 + fx, by + 1, L.brows);
  } else {
    add("br-l", 3 + fx, by, L.brows, 2);
    add("br-r", 7 + fx, by, L.brows, 2);
  }
  // Droop affects the viewer-LEFT side of the face (the character's RIGHT side).

  // eyes (look direction shifts the pupil)
  const ey = top + 3;
  const gaze = face.look ?? 0;
  if (face.blink) {
    add("eye-l", 3 + fx, ey, L.skinShade, 2);
    add("eye-r", 7 + fx, ey, L.skinShade, 2);
  } else {
    // viewer-left eye (character's right): heavy lid when drooping
    if (droop) {
      add("lid-l", 3 + fx, ey, L.skinShade, 2);
      add("eye-l", 3 + fx + (gaze >= 0 ? 1 : 0), ey + 1, C.eye);
    } else {
      add("eyew-l", 3 + fx, ey, C.eyeWhite, 2);
      add("eye-l", 3 + fx + (gaze >= 0 ? 1 : 0), ey, C.eye);
    }
    add("eyew-r", 7 + fx, ey, C.eyeWhite, 2);
    add("eye-r", 7 + fx + (gaze > 0 ? 1 : 0), ey, C.eye);
  }
  if (L.glasses) {
    add("gl-l", 2 + fx, ey - 1, "#2b2b33", 4, 1);
    add("gl-r", 6 + fx, ey - 1, "#2b2b33", 4, 1);
    add("gl-l2", 2 + fx, ey + 1, "#2b2b33", 4, 1);
    add("gl-r2", 6 + fx, ey + 1, "#2b2b33", 4, 1);
  }

  // nose
  add("nose", 5 + fx, ey + 1, L.skinShade, 2, 2);

  // beard
  const my = ey + 4; // mouth row
  if (L.beard) {
    add("beard", 2, my - 1, L.beard, 8, 13 - (my - 1) + 1);
    add("beard-shade", 2, my - 1, L.beardShade ?? L.beard, 1, 13 - (my - 1) + 1);
    add("chin", 3, 14, L.beard, 6, 1);
    add("must", 4 + fx, my - 1, L.beardShade ?? L.beard, 4, 1);
  }

  // mouth
  const m = face.mouth;
  const mx = 4 + fx;
  const lip = C.mouth;
  if ((m === "talk" || m === "open") && face.open) {
    add("mo", mx, my, C.mouthOpen, droop ? 3 : 4, 2);
    if (droop) add("mo-d", mx, my + 2, C.mouthOpen);
  } else if (m === "smile") {
    if (droop) {
      // smile only lifts the viewer-right corner; viewer-left corner sags
      add("sm1", mx, my + 1, lip);
      add("sm2", mx + 1, my, lip, 2);
      add("sm3", mx + 3, my - 1, lip);
    } else {
      add("sm1", mx, my - 1, lip);
      add("sm2", mx + 1, my, lip, 2);
      add("sm3", mx + 3, my - 1, lip);
    }
  } else if (m === "worried") {
    add("wo1", mx, my + 1, lip);
    add("wo2", mx + 1, my, lip, 2);
    add("wo3", mx + 3, my + 1, lip);
  } else if (droop) {
    add("dr1", mx, my + 1, lip);
    add("dr2", mx + 1, my, lip, 3);
  } else {
    add("mn", mx, my, lip, 4);
  }
  return <>{px}</>;
};

// ----------------------------------------------------------------- limbs
export const Arm: React.FC<{
  x: number;
  y: number;
  angle: number;
  sleeve: string;
  sleeveShade: string;
  skin: string;
  sleeveLen: number;
  hand?: React.ReactNode;
}> = ({ x, y, angle, sleeve, sleeveShade, skin, sleeveLen, hand }) => (
  <g transform={`translate(${x} ${y}) rotate(${angle})`}>
    <P x={-1} y={0} w={3} h={sleeveLen} c={sleeve} />
    <P x={1} y={1} w={1} h={sleeveLen - 1} c={sleeveShade} />
    {sleeveLen < 12 ? <P x={-1} y={sleeveLen} w={3} h={12 - sleeveLen} c={skin} /> : null}
    <P x={-1} y={12} w={3} h={3} c={skin} />
    <g transform="translate(0 14)">{hand}</g>
  </g>
);

// ---------------------------------------------------------------- person
/**
 * Front-facing pixel person. (0,0) is the top-left of the head; a standing
 * adult is ~48 px tall, a seated one ~50 px including shins to the floor.
 */
export const Person: React.FC<{ x: number; y: number; look: Look; pose: Pose; flip?: boolean }> = ({
  x,
  y,
  look: L,
  pose,
  flip,
}) => {
  const w = L.slim ? 14 : 16;
  const left = L.slim ? -1 : -2;
  const walk = pose.walk ?? null;
  const step = walk === null ? 0 : Math.sin(walk);
  const bob = walk === null ? (pose.breath ?? 0) : Math.abs(step) > 0.6 ? -1 : 0;
  const longGarment = L.outfit === "thobe";
  const sleeveLen = L.outfit === "scrubs" ? 5 : 12;

  const legs = pose.seated ? (
    <>
      <P x={left - 1} y={28} w={w + 2} h={5} c={longGarment ? L.top : L.pants} />
      <P x={left - 1} y={32} w={w + 2} h={1} c={longGarment ? L.topShade : L.pantsShade} />
      <P x={left + 7} y={28} w={1} h={5} c={longGarment ? L.topShade : L.pantsShade} />
      <P x={left + 1} y={33} w={6} h={17} c={longGarment ? L.top : L.pants} />
      <P x={left + w - 7} y={33} w={6} h={17} c={longGarment ? L.top : L.pants} />
      <P x={left + 6} y={32} w={1} h={18} c={longGarment ? L.topShade : L.pantsShade} />
      <P x={left + w - 2} y={32} w={1} h={18} c={longGarment ? L.topShade : L.pantsShade} />
      <P x={left + 1} y={50} w={6} h={2} c={L.shoes} />
      <P x={left + w - 7} y={50} w={6} h={2} c={L.shoes} />
    </>
  ) : longGarment ? (
    <>
      <P x={left} y={30} w={w} h={15} c={L.top} />
      <P x={left + 5} y={31} w={1} h={14} c={L.topShade} />
      <P x={left + w - 1} y={30} w={1} h={15} c={L.topShade} />
      <g transform={`translate(${Math.round(step * 2)} 0)`}>
        <P x={left + 2} y={45} w={5} h={2} c={L.shoes} />
      </g>
      <g transform={`translate(${Math.round(-step * 2)} 0)`}>
        <P x={left + w - 7} y={45} w={5} h={2} c={L.shoes} />
      </g>
    </>
  ) : (
    <>
      <g transform={`translate(${Math.round(step * 2)} 0)`}>
        <P x={left + 1} y={30} w={6} h={15} c={L.pants} />
        <P x={left + 5} y={31} w={1} h={14} c={L.pantsShade} />
        <P x={left + 1} y={45} w={6} h={2} c={L.shoes} />
      </g>
      <g transform={`translate(${Math.round(-step * 2)} 0)`}>
        <P x={left + w - 7} y={30} w={6} h={15} c={L.pants} />
        <P x={left + w - 2} y={31} w={1} h={14} c={L.pantsShade} />
        <P x={left + w - 7} y={45} w={6} h={2} c={L.shoes} />
      </g>
    </>
  );

  const torso = (
    <>
      <P x={4} y={13} w={4} h={2} c={L.skinShade} />
      <P x={left} y={14} w={w} h={16} c={L.top} />
      <P x={left} y={14} w={1} h={16} c={L.topShade} />
      <P x={left + w - 1} y={14} w={1} h={16} c={L.topShade} />
      {L.outfit === "thobe" ? (
        <>
          <P x={5} y={15} w={2} h={1} c={L.topShade} />
          <P x={6} y={16} w={1} h={6} c={L.topShade} />
          <P x={5} y={17} c={C.thobeDeep} />
          <P x={5} y={19} c={C.thobeDeep} />
        </>
      ) : null}
      {L.outfit === "scrubs" ? (
        <>
          <P x={4} y={14} w={4} h={2} c={L.topShade} />
          <P x={5} y={16} w={2} h={1} c={L.topShade} />
          <P x={left + 2} y={21} w={4} h={3} c={L.topShade} />
        </>
      ) : null}
      {L.outfit === "coat" ? (
        <>
          {/* scrubs visible under an open white coat */}
          <P x={3} y={14} w={6} h={16} c={L.pants} />
          <P x={4} y={14} w={4} h={2} c={L.pantsShade} />
          <P x={2} y={14} w={1} h={16} c={C.coatShade} />
          <P x={9} y={14} w={1} h={16} c={C.coatShade} />
          <P x={left + 1} y={22} w={3} h={3} c={C.coatShade} />
          <P x={left + w - 4} y={22} w={3} h={3} c={C.coatShade} />
        </>
      ) : null}
      {L.outfit === "uniform" ? (
        <>
          <P x={left} y={22} w={w} h={2} c={C.reflect} />
          <P x={4} y={14} w={4} h={2} c={L.topShade} />
          <P x={left + 2} y={16} w={4} h={3} c={L.topShade} />
          <P x={left + w - 6} y={16} w={4} h={3} c={L.topShade} />
        </>
      ) : null}
      {L.stethoscope ? (
        <>
          <P x={2} y={14} w={1} h={7} c={C.steth} />
          <P x={9} y={14} w={1} h={5} c={C.steth} />
          <P x={9} y={19} w={2} h={1} c={C.steth} />
          <P x={10} y={20} w={2} h={2} c="#9aa3b0" />
          <P x={2} y={21} w={2} h={1} c={C.steth} />
        </>
      ) : null}
      {L.badge ? <P x={left + w - 5} y={17} w={3} h={4} c={L.badge} /> : null}
    </>
  );

  const shoulderY = 15;
  const body = (
    <g transform={`translate(0 ${bob}) rotate(${pose.lean ?? 0} 6 30)`}>
      {torso}
      <Arm
        x={left}
        y={shoulderY}
        angle={pose.rightArm}
        sleeve={L.outfit === "coat" ? C.coat : L.top}
        sleeveShade={L.outfit === "coat" ? C.coatShade : L.topShade}
        skin={L.skin}
        sleeveLen={sleeveLen}
        hand={pose.rightHand}
      />
      <Arm
        x={left + w}
        y={shoulderY}
        angle={pose.leftArm}
        sleeve={L.outfit === "coat" ? C.coat : L.top}
        sleeveShade={L.outfit === "coat" ? C.coatShade : L.topShade}
        skin={L.skin}
        sleeveLen={sleeveLen}
        hand={pose.leftHand}
      />
      <g transform={`rotate(${pose.headTilt ?? 0} 6 13)`}>
        <Head look={L} face={pose.face} turn={pose.headTurn ?? 0} />
      </g>
    </g>
  );

  return (
    <g transform={`translate(${x} ${y})${flip ? " scale(-1 1) translate(-12 0)" : ""}`}>
      {legs}
      {body}
    </g>
  );
};

/** Position of a hand in person-local coordinates (for objects that leave the hand). */
export const handPos = (side: "right" | "left", angle: number, slim = false) => {
  const left = slim ? -1 : -2;
  const w = slim ? 14 : 16;
  const sx = side === "right" ? left : left + w;
  const rad = (angle * Math.PI) / 180;
  return { x: sx - Math.sin(rad) * 14, y: 15 + Math.cos(rad) * 14 };
};

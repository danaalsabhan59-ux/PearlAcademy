import React from "react";
import { blinkAt, breathAt, flap, kf, prog } from "../animations/anim";
import { FATHER, Finjan, Phone, SON1, SON2 } from "../characters/cast";
import { handPos, Person, Pose } from "../characters/Person";
import { Layer } from "../components/Stage";
import { BEATS as B } from "../data/timeline";
import { HomeBackWall, HomeForeground, HomeRoom } from "../environments/Home";

/** Seated head positions (art px). Feet reach the floor at y ≈ 124. */
export const POS = {
  son1: { x: 66, y: 72 },
  father: { x: 100, y: 72 },
  son2: { x: 140, y: 73 },
};

/** 8:30 PM in minutes; the clock creeps forward through the home chapter. */
export const clockMinutesAt = (t: number) => 20 * 60 + 30 + Math.max(0, t - 9) * 0.35;

export const droopAt = (t: number) => prog(t, B.handWeakens, 1.6);

/** Single source of truth for the father's pose in every home shot. */
export const fatherPose = (t: number): Pose => {
  const tremble = t > B.handWeakens && t < B.cupSlips ? Math.sin(t * 40) * 3 * prog(t, B.handWeakens, 1) : 0;
  const rightArm =
    t < B.armTest
      ? kf(t, [
          [0, -45],
          [B.cupLift, -45],
          [B.cupLift + 0.7, -66],
          [B.cupLift + 2.0, -66],
          [B.cupLift + 2.6, -45],
          [B.handWeakens, -45],
          [B.cupSlips - 0.1, -28],
          [B.cupSlips + 0.5, 2],
        ]) + tremble
      : kf(t, [
          [B.armTest, 2],
          [B.armsUp, 2],
          [B.armsUp + 0.6, 168],
          [B.armDrift, 168],
          [B.armDrift + 1.2, 120],
          [B.armDrift + 2.4, 30],
          [B.speechTest, 6],
        ]);
  const leftArm = kf(t, [
    [0, 30],
    [B.armsUp, 30],
    [B.armsUp + 0.6, 192],
    [B.speechTest - 0.6, 192],
    [B.speechTest + 0.2, 30],
  ]);
  const droop = droopAt(t);
  const speaking = (t > B.fatherTriesToSpeak && t < B.faceCloseUp) || (t > B.speechTest && t < B.beFast);
  const turn = t > B.fatherTurns && t < B.fatherTurns + 1.6 ? -1 : 0;
  return {
    face: {
      mouth: speaking ? "talk" : t > B.son2Smiles && t < B.son2Smiles + 2.5 ? "smile" : "neutral",
      open: speaking && flap(t, 6),
      droop,
      look: turn ? -1 : 0,
      blink: blinkAt(t, 0),
      worried: t > B.cupImpact,
    },
    rightArm,
    leftArm,
    seated: true,
    lean: -6 * prog(t, B.handWeakens + 0.5, 2),
    headTilt: -5 * droop,
    headTurn: turn,
    breath: breathAt(t, 0),
    rightHand: t < B.cupSlips ? <Finjan /> : null,
  };
};

export const son1Pose = (t: number, standing: boolean): Pose => {
  const gesture = t > B.sonGestures && t < B.sonGestures + 1.6;
  const asking = t > B.armTest && t < B.armsUp;
  const onPhone = t > B.phoneDial - 0.5;
  const turned = t > B.son1Turns;
  return {
    face: {
      mouth: asking ? "talk" : turned ? "worried" : t > B.son2Smiles && t < B.son2Smiles + 2 ? "smile" : "neutral",
      open: asking && flap(t, 7),
      look: turned ? 1 : -1,
      blink: blinkAt(t, 1),
      worried: turned,
    },
    rightArm: gesture ? 118 : asking ? 150 : -30,
    leftArm: onPhone ? 163 : asking ? 210 : 30,
    seated: !standing,
    headTurn: turned ? 1 : -1,
    lean: turned && !standing ? 5 * prog(t, B.son1Turns, 0.6) : 0,
    breath: breathAt(t, 1),
    leftHand: onPhone ? <Phone /> : null,
  };
};

export const son2Pose = (t: number): Pose => {
  const supporting = t > B.phoneDial;
  const alarmed = t > B.cupImpact;
  return {
    face: {
      mouth: alarmed ? "worried" : t > B.son2Smiles && t < B.son2Smiles + 3 ? "smile" : "neutral",
      look: alarmed ? -1 : -1,
      blink: blinkAt(t, 2),
      worried: alarmed,
    },
    rightArm: supporting ? 118 : -30,
    leftArm: 30,
    seated: true,
    headTurn: -1,
    lean: supporting ? -10 : 0,
    breath: breathAt(t, 2),
  };
};

/** The full living room with the family, as a set of parallax layers. */
export const HomeSet: React.FC<{
  t: number;
  son1Standing?: boolean;
  clockGlint?: number;
  clockHighlight?: number;
  lightsFlash?: number;
}> = ({ t, son1Standing = false, clockGlint = 0, clockHighlight = 0, lightsFlash = 0 }) => {
  const fPose = fatherPose(t);
  const fallStart = B.cupSlips;
  const fallDur = B.cupImpact - B.cupSlips;
  const hand = handPos("right", -28);
  const start = { x: POS.father.x + hand.x, y: POS.father.y + hand.y };
  const fall = Math.min(1, Math.max(0, (t - fallStart) / fallDur));
  const landed = t >= B.cupImpact;
  const cupX = start.x - fall * 5;
  const cupY = start.y + fall * fall * (126 - start.y);
  const since = t - B.cupImpact;
  const k = 1 - Math.exp(-Math.max(0, since) * 8);
  const son2X = t > B.phoneDial ? POS.son2.x - 10 * prog(t, B.phoneDial, 1.2) : POS.son2.x;

  return (
    <>
      <Layer depth={0.7}>
        <HomeBackWall
          t={t}
          clockMinutes={clockMinutesAt(t)}
          clockGlint={clockGlint}
          clockHighlight={clockHighlight}
          lightsFlash={lightsFlash}
        />
      </Layer>
      <Layer depth={1}>
        <HomeRoom t={t} tvDim={t > B.cupImpact ? -0.02 : 0} />
        <Person x={son1Standing ? POS.son1.x - 6 : POS.son1.x} y={son1Standing ? 76 : POS.son1.y} look={SON1} pose={son1Pose(t, son1Standing)} />
        <Person x={son2X} y={POS.son2.y} look={SON2} pose={son2Pose(t)} />
        <Person x={POS.father.x} y={POS.father.y} look={FATHER} pose={fPose} />
        {/* falling and broken finjan, spilled coffee */}
        {landed ? (
          <>
            <ellipse cx={cupX} cy={127} rx={2 + 6 * k} ry={1 + 1.4 * k} fill="#5a3216" opacity={0.85} />
            {[[-1, -0.6], [1, -0.8], [-0.6, -0.3], [0.9, -0.2], [0.3, -1]].map(([vx, vy], i) => (
              <rect
                key={i}
                x={Math.round(cupX + vx * 9 * k)}
                y={Math.round(127 + vy * 3 * k + k * 2)}
                width={i % 2 ? 2 : 1}
                height={1}
                fill="#f6f2e9"
              />
            ))}
          </>
        ) : t >= fallStart ? (
          <g transform={`translate(${cupX} ${cupY}) rotate(${-fall * 220})`}>
            <Finjan />
          </g>
        ) : null}
      </Layer>
      <Layer depth={1.25}>
        <HomeForeground />
      </Layer>
    </>
  );
};

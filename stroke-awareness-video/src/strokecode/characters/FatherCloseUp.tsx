import React from "react";
import { C } from "../styles/palette";
import { P } from "./Person";

/**
 * Detailed close-up of the father's face, drawn on a 60×60 art grid.
 * The character's RIGHT side is the viewer's LEFT: that is the weak side.
 */
export const FatherCloseUp: React.FC<{
  /** 0..1 right-sided facial droop. */
  droop: number;
  /** 0..1 attempt to smile (only the unaffected side lifts). */
  smile: number;
  /** Mouth open (failed speech attempt). */
  open: boolean;
  blink: boolean;
  worried?: boolean;
}> = ({ droop, smile, open, blink, worried }) => {
  const checks: React.ReactNode[] = [];
  for (let y = 4; y < 60; y += 2) {
    for (let x = 6; x < 54; x += 2) {
      const inFace = x >= 17 && x <= 42 && y >= 13 && y <= 52;
      if (!inFace) checks.push(<P key={`${x}-${y}`} x={x + ((y / 2) % 2)} y={y} c={C.shemaghRed} />);
    }
  }
  const d = Math.round(droop * 2); // up to 2 px of sag on the weak side
  const lift = Math.round(smile * 3); // unaffected side lifts up to 3 px
  const weakLift = Math.round(smile * (1 - droop) * 3);

  // mouth row and corner positions
  const my = 41;
  const leftCornerY = my + d - weakLift; // viewer-left = weak side
  const rightCornerY = my - lift;

  return (
    <>
      {/* shemagh + agal */}
      <P x={12} y={2} w={36} h={4} c={C.thobe} />
      <P x={6} y={6} w={48} h={54} c={C.thobe} />
      {checks}
      <P x={10} y={8} w={40} h={3} c={C.agal} />
      <P x={10} y={11} w={3} h={2} c={C.agal} />
      <P x={47} y={11} w={3} h={2} c={C.agal} />

      {/* face */}
      <P x={17} y={13} w={26} h={40} c={C.skin} />
      <P x={17} y={13} w={2} h={40} c={C.skinShade} />
      <P x={41} y={13} w={2} h={40} c={C.skinShade} />
      {/* forehead wrinkles */}
      <P x={22} y={16} w={6} h={1} c={C.skinShade} />
      <P x={32} y={16} w={6} h={1} c={C.skinShade} />
      <P x={25} y={18} w={10} h={1} c={C.skinShade} />

      {/* brows */}
      {worried ? (
        <>
          <P x={20} y={22} w={2} h={1} c={C.hairGrey} />
          <P x={22} y={21} w={5} h={1} c={C.hairGrey} />
          <P x={33} y={21} w={5} h={1} c={C.hairGrey} />
          <P x={38} y={22} w={2} h={1} c={C.hairGrey} />
        </>
      ) : (
        <>
          <P x={20} y={21} w={7} h={2} c={C.hairGrey} />
          <P x={33} y={21} w={7} h={2} c={C.hairGrey} />
        </>
      )}

      {/* eyes: the weak (viewer-left) eye has a heavier lid */}
      {blink ? (
        <>
          <P x={21} y={26} w={6} h={1} c={C.skinDeep} />
          <P x={33} y={26} w={6} h={1} c={C.skinDeep} />
        </>
      ) : (
        <>
          <P x={21} y={25} w={6} h={3} c={C.eyeWhite} />
          <P x={23} y={25} w={3} h={3} c={C.eye} />
          <P x={21} y={25} w={6} h={Math.min(2, 1 + Math.floor(d / 2))} c={C.skinShade} />
          <P x={33} y={25} w={6} h={3} c={C.eyeWhite} />
          <P x={35} y={25} w={3} h={3} c={C.eye} />
          <P x={33} y={24} w={6} h={1} c={C.skinShade} />
        </>
      )}
      <P x={21} y={29 + d} w={5} h={1} c={C.skinShade} />
      <P x={34} y={29} w={5} h={1} c={C.skinShade} />

      {/* nose */}
      <P x={29} y={27} w={3} h={8} c={C.skinShade} />
      <P x={27} y={34} w={7} h={2} c={C.skinShade} />
      {/* nasolabial fold: flattened on the weak side */}
      <P x={23} y={35 + d} w={1} h={3} c={droop > 0.3 ? C.skin : C.skinShade} />
      <P x={37} y={35} w={1} h={4} c={C.skinShade} />

      {/* grey beard + moustache */}
      <P x={17} y={38} w={26} h={16} c={C.hairGrey} />
      <P x={17} y={38} w={2} h={16} c={C.hairGreyShade} />
      <P x={41} y={38} w={2} h={16} c={C.hairGreyShade} />
      <P x={19} y={54} w={22} h={2} c={C.hairGrey} />
      <P x={23} y={56} w={14} h={1} c={C.hairGreyShade} />
      <P x={24} y={37} w={12} h={3} c={C.hairGreyShade} />

      {/* mouth: a line from the weak corner to the strong corner */}
      {open ? (
        <>
          <P x={25} y={my} w={10} h={3 + Math.round(d / 2)} c={C.mouthOpen} />
          <P x={25} y={my + 3} w={3} h={d} c={C.mouthOpen} />
          <P x={28} y={my + 2} w={4} h={1} c="#9b3a32" />
        </>
      ) : (
        <>
          <P x={24} y={leftCornerY} w={2} h={1} c={C.mouth} />
          <P x={26} y={Math.round((leftCornerY + my) / 2)} w={2} h={1} c={C.mouth} />
          <P x={28} y={my} w={4} h={1} c={C.mouth} />
          <P x={32} y={Math.round((rightCornerY + my) / 2)} w={2} h={1} c={C.mouth} />
          <P x={34} y={rightCornerY} w={2} h={1} c={C.mouth} />
        </>
      )}

      {/* thobe collar */}
      <P x={14} y={56} w={32} h={4} c={C.thobe} />
      <P x={29} y={56} w={2} h={4} c={C.thobeShade} />
    </>
  );
};

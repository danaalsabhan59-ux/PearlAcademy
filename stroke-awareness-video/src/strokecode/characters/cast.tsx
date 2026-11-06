import React from "react";
import { C } from "../styles/palette";
import { Look, P } from "./Person";

/** Father, ~60: red shemagh, grey beard, white thobe. */
export const FATHER: Look = {
  skin: C.skin,
  skinShade: C.skinShade,
  headwear: "shemagh",
  headColor: C.thobe,
  headAccent: C.shemaghRed,
  hair: C.hairGrey,
  brows: C.hairGrey,
  beard: C.hairGrey,
  beardShade: C.hairGreyShade,
  wrinkles: true,
  outfit: "thobe",
  top: C.thobe,
  topShade: C.thobeShade,
  pants: C.thobe,
  pantsShade: C.thobeShade,
  shoes: C.sandal,
};

/** Son 1, ~23: white ghutra, short black beard, white thobe. */
export const SON1: Look = {
  skin: C.skinLight,
  skinShade: C.skin,
  headwear: "ghutra",
  headColor: C.thobe,
  hair: C.hairBlack,
  brows: C.hairBlack,
  beard: C.hairBlack,
  beardShade: "#2c221d",
  outfit: "thobe",
  top: C.thobe,
  topShade: C.thobeShade,
  pants: C.thobe,
  pantsShade: C.thobeShade,
  shoes: C.sandal,
};

/** Son 2, ~18: no headwear, styled black hair, clean-shaven, light grey thobe. */
export const SON2: Look = {
  skin: C.skinLight,
  skinShade: C.skin,
  headwear: "hairQuiff",
  headColor: C.hairBlack,
  hair: C.hairBlack,
  brows: C.hairBlack,
  outfit: "thobe",
  top: C.thobeGrey,
  topShade: C.thobeGreyShade,
  pants: C.thobeGrey,
  pantsShade: C.thobeGreyShade,
  shoes: "#3b3b44",
  slim: true,
};

/** Emergency physician: white coat over teal scrubs, stethoscope. */
export const ED_DOCTOR: Look = {
  skin: C.skin,
  skinShade: C.skinShade,
  headwear: "hair",
  headColor: C.hairBlack,
  hair: C.hairBlack,
  brows: C.hairBlack,
  beard: "#2a201b",
  beardShade: "#1e1714",
  outfit: "coat",
  top: C.coat,
  topShade: C.coatShade,
  pants: C.scrubsTeal,
  pantsShade: C.scrubsTealShade,
  shoes: C.shoe,
  stethoscope: true,
  badge: "#3fc1c9",
};

/** Emergency nurse: navy hijab and navy scrubs. */
export const NURSE: Look = {
  skin: C.skinLight,
  skinShade: C.skin,
  headwear: "hijab",
  headColor: C.hijabNavy,
  headAccent: "#151a30",
  hair: C.hairBlack,
  brows: C.hairBlack,
  outfit: "scrubs",
  top: C.scrubsNavy,
  topShade: C.scrubsNavyShade,
  pants: C.scrubsNavy,
  pantsShade: C.scrubsNavyShade,
  shoes: "#e8e8e8",
  badge: "#ffd38a",
  slim: true,
};

/** Stroke team physician: maroon hijab, white coat over grey scrubs. */
export const STROKE_DOCTOR: Look = {
  skin: C.skin,
  skinShade: C.skinShade,
  headwear: "hijab",
  headColor: C.hijabMaroon,
  headAccent: "#4f1827",
  hair: C.hairBlack,
  brows: C.hairBlack,
  glasses: true,
  outfit: "coat",
  top: C.coat,
  topShade: C.coatShade,
  pants: C.scrubsGrey,
  pantsShade: "#555c6a",
  shoes: C.shoe,
  badge: C.red,
  slim: true,
};

/** Paramedic: navy uniform with reflective band. */
export const PARAMEDIC: Look = {
  skin: C.skin,
  skinShade: C.skinShade,
  headwear: "hair",
  headColor: C.hairBlack,
  hair: C.hairBlack,
  brows: C.hairBlack,
  beard: "#2a201b",
  beardShade: "#1e1714",
  outfit: "uniform",
  top: C.uniform,
  topShade: C.uniformShade,
  pants: C.uniform,
  pantsShade: C.uniformShade,
  shoes: C.shoe,
};

/** Second paramedic: clean-shaven, cap. */
export const PARAMEDIC2: Look = {
  ...PARAMEDIC,
  headwear: "cap",
  headColor: C.uniformShade,
  beard: undefined,
  skin: C.skinLight,
  skinShade: C.skin,
};

/** CT technologist: purple scrubs, cap, glasses. */
export const CT_TECH: Look = {
  skin: C.skinLight,
  skinShade: C.skin,
  headwear: "cap",
  headColor: C.scrubsPurpleShade,
  hair: C.hairBlack,
  brows: C.hairBlack,
  glasses: true,
  outfit: "scrubs",
  top: C.scrubsPurple,
  topShade: C.scrubsPurpleShade,
  pants: C.scrubsPurple,
  pantsShade: C.scrubsPurpleShade,
  shoes: "#e8e8e8",
};

// ------------------------------------------------------------------- props
export const Finjan: React.FC = () => (
  <>
    <P x={-2} y={-3} w={4} h={3} c="#f6f2e9" />
    <P x={-2} y={-3} w={4} h={1} c="#7a4a22" />
    <P x={-1} y={0} w={2} h={1} c="#d8d0c0" />
    <P x={1} y={-2} w={1} h={2} c="#c9a24a" />
  </>
);

export const Phone: React.FC<{ glow?: boolean }> = ({ glow = true }) => (
  <>
    <P x={-1} y={-4} w={3} h={6} c="#1f222b" />
    <P x={0} y={-3} w={1} h={4} c={glow ? "#7fd3ff" : "#2c3340"} />
  </>
);

export const Clipboard: React.FC = () => (
  <>
    <P x={-3} y={-2} w={6} h={8} c="#7a5a3a" />
    <P x={-2} y={-1} w={4} h={6} c="#f2f2f2" />
    <P x={-1} y={0} w={2} h={1} c="#555" />
    <P x={-1} y={2} w={3} h={1} c="#555" />
    <P x={-1} y={4} w={2} h={1} c="#555" />
  </>
);

export const PenLight: React.FC<{ on?: boolean }> = ({ on }) => (
  <>
    <P x={0} y={-4} w={1} h={5} c="#c0c6d0" />
    {on ? <circle cx={0.5} cy={-5} r={1.6} fill="#fff6c8" opacity={0.85} /> : null}
  </>
);

export const Glucometer: React.FC<{ done?: boolean }> = ({ done }) => (
  <>
    <P x={-2} y={-4} w={5} h={7} c="#3d4a66" />
    <P x={-1} y={-3} w={3} h={3} c={done ? "#8ef08e" : "#bfe7ff"} />
    <P x={0} y={3} w={1} h={2} c="#ddd" />
  </>
);

/** Side-view patient lying on a stretcher, head on the left. Width ~52, height ~22. */
export const LyingPatient: React.FC<{ x: number; y: number; droop?: boolean; armLift?: number }> = ({
  x,
  y,
  droop = true,
  armLift = 0,
}) => (
  <g transform={`translate(${x} ${y})`}>
    {/* pillow */}
    <P x={0} y={5} w={12} h={4} c="#e9eef5" />
    {/* head in profile (facing up / right), grey hair and beard */}
    <P x={2} y={-2} w={9} h={8} c={C.skin} />
    <P x={2} y={-3} w={7} h={3} c={C.hairGrey} />
    <P x={1} y={-1} w={2} h={6} c={C.hairGrey} />
    <P x={8} y={2} w={4} h={4} c={C.hairGrey} />
    <P x={9} y={1} w={2} h={1} c={C.hairGreyShade} />
    <P x={10} y={-2} w={2} h={2} c={C.skinShade} />
    <P x={7} y={-1} w={1} h={1} c={droop ? C.skinShade : C.eye} />
    {droop ? <P x={7} y={0} c={C.eye} /> : null}
    {/* body under blanket */}
    <P x={11} y={3} w={8} h={5} c={C.thobe} />
    <P x={18} y={2} w={34} h={7} c="#7fa6d6" />
    <P x={18} y={2} w={34} h={1} c="#a8c6ea" />
    <P x={50} y={1} w={3} h={8} c="#6f95c4" />
    {/* the weak (right) arm resting on the blanket */}
    <g transform={`rotate(${-armLift} 16 4)`}>
      <P x={16} y={3} w={12} h={2} c={C.thobe} />
      <P x={28} y={3} w={3} h={2} c={C.skin} />
    </g>
  </g>
);

/** Stretcher frame (side view). Patient sits on top at (x+2, y-9). */
export const Stretcher: React.FC<{ x: number; y: number; wheelPhase?: number }> = ({ x, y, wheelPhase = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    <P x={0} y={0} w={58} h={3} c="#c8ced8" />
    <P x={0} y={3} w={58} h={1} c="#8b93a3" />
    <P x={4} y={4} w={2} h={10} c="#8b93a3" />
    <P x={52} y={4} w={2} h={10} c="#8b93a3" />
    <P x={4} y={9} w={50} h={2} c="#8b93a3" />
    <P x={-2} y={-6} w={2} h={9} c="#8b93a3" />
    {[5, 53].map((wx) => (
      <g key={wx}>
        <P x={wx - 2} y={14} w={4} h={4} c="#22252d" />
        <P x={wx - (wheelPhase % 2 ? 0 : 1)} y={15 + (wheelPhase % 2 ? 0 : 1)} w={wheelPhase % 2 ? 1 : 2} h={wheelPhase % 2 ? 2 : 1} c="#777" />
      </g>
    ))}
  </g>
);

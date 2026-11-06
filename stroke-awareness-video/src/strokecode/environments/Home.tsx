import React from "react";
import { P } from "../characters/Person";
import { C } from "../styles/palette";

/** Wall clock. `minutes` = minutes after midnight (8:30 PM = 20*60+30). */
export const WallClock: React.FC<{ x: number; y: number; minutes: number; glint?: number; highlight?: number }> = ({
  x,
  y,
  minutes,
  glint = 0,
  highlight = 0,
}) => {
  const minAngle = (minutes % 60) * 6;
  const hourAngle = ((minutes / 60) % 12) * 30;
  return (
    <g transform={`translate(${x} ${y})`}>
      {highlight > 0 ? <circle r={13} fill="none" stroke={C.amber} strokeWidth={1} opacity={highlight} /> : null}
      <circle r={10} fill="#5a3b22" />
      <circle r={9} fill="#f4ead2" />
      {Array.from({ length: 12 }, (_, i) => (
        <g key={i} transform={`rotate(${i * 30})`}>
          <P x={-0.5} y={-8} w={1} h={i % 3 === 0 ? 2 : 1} c="#5a3b22" />
        </g>
      ))}
      <g transform={`rotate(${hourAngle})`}>
        <P x={-0.5} y={-5} w={1} h={5} c="#1d1d1d" />
      </g>
      <g transform={`rotate(${minAngle})`}>
        <P x={-0.5} y={-7.5} w={1} h={7.5} c="#1d1d1d" />
      </g>
      <P x={-1} y={-1} w={2} h={2} c={C.red} />
      {glint > 0 ? (
        <>
          <ellipse cx={-3} cy={-4} rx={3.5} ry={1.2} fill="#fff" opacity={0.75 * glint} transform="rotate(-30 -3 -4)" />
          <circle r={14 + 6 * (1 - glint)} fill="none" stroke={C.red} strokeWidth={0.6} opacity={glint * 0.8} />
        </>
      ) : null}
    </g>
  );
};

/** Original abstract football on the TV: pitch, two teams of dots, a ball. */
export const TvMatch: React.FC<{ t: number; x: number; y: number; w: number; h: number; dim?: number }> = ({
  t,
  x,
  y,
  w,
  h,
  dim = 0,
}) => {
  const players = Array.from({ length: 8 }, (_, i) => {
    const px = x + 3 + ((i * 11) % (w - 6)) + Math.sin(t * 1.4 + i * 1.7) * 3;
    const py = y + 4 + ((i * 7) % (h - 8)) + Math.cos(t * 1.1 + i) * 2;
    return <P key={i} x={Math.round(px)} y={Math.round(py)} w={1} h={2} c={i < 4 ? "#ff5d5d" : "#f4f4f4"} />;
  });
  const bx = x + w / 2 + Math.sin(t * 1.9) * (w / 3);
  const by = y + h / 2 + Math.cos(t * 1.3) * (h / 4);
  return (
    <>
      <P x={x} y={y} w={w} h={h} c="#2f8f3a" />
      {Array.from({ length: Math.floor(w / 6) }, (_, i) => (
        <P key={i} x={x + i * 6} y={y} w={3} h={h} c="#38a046" />
      ))}
      <P x={x + Math.floor(w / 2)} y={y} w={1} h={h} c="#cfeccf" o={0.7} />
      <P x={x} y={y + Math.floor(h / 2) - 3} w={2} h={6} c="#e8e8e8" o={0.8} />
      <P x={x + w - 2} y={y + Math.floor(h / 2) - 3} w={2} h={6} c="#e8e8e8" o={0.8} />
      {players}
      <P x={Math.round(bx)} y={Math.round(by)} c="#fff" />
      <P x={x} y={y} w={w} h={3} c="#0b0d12" o={0.75} />
      <P x={x + 2} y={y + 1} w={4} h={1} c="#ff5d5d" />
      <P x={x + 7} y={y + 1} w={4} h={1} c="#f4f4f4" />
      <P x={x} y={y} w={w} h={h} c="#ffffff" o={0.04 + 0.04 * Math.sin(t * 11) + dim} />
    </>
  );
};

/** Back wall, window, lamp and clock — the far parallax layer. */
export const HomeBackWall: React.FC<{ t: number; clockMinutes: number; clockGlint?: number; clockHighlight?: number; lightsFlash?: number }> = ({
  t,
  clockMinutes,
  clockGlint = 0,
  clockHighlight = 0,
  lightsFlash = 0,
}) => {
  const flashColor = Math.floor(t * 4) % 2 === 0 ? "#ff2a3a" : "#2a6bff";
  return (
    <>
      <P x={-20} y={-20} w={220} h={140} c="#3b2a22" />
      {Array.from({ length: 22 }, (_, i) => (
        <P key={i} x={-20 + i * 10} y={14} w={1} h={106} c="#35251e" />
      ))}
      {/* Najdi cornice */}
      <P x={-20} y={8} w={220} h={5} c="#5e4230" />
      {Array.from({ length: 28 }, (_, i) => (
        <g key={i}>
          <P x={-20 + i * 8 + 3} y={9} w={2} h={1} c="#c9a066" />
          <P x={-20 + i * 8 + 2} y={10} w={4} h={1} c="#c9a066" />
          <P x={-20 + i * 8 + 3} y={11} w={2} h={1} c="#c9a066" />
        </g>
      ))}
      {/* window */}
      <P x={8} y={24} w={36} h={40} c="#5a3d26" />
      <P x={11} y={27} w={30} h={34} c="#0d1534" />
      {[[15, 31], [33, 35], [20, 50], [36, 54], [27, 40]].map(([sx, sy], i) => (
        <P key={i} x={sx} y={sy} c="#e8e8ff" o={0.45 + 0.45 * Math.sin(t * 2 + i)} />
      ))}
      <circle cx={31} cy={34} r={3.5} fill="#f3e9b5" />
      <circle cx={32.8} cy={32.8} r={3} fill="#0d1534" />
      <P x={25} y={27} w={2} h={34} c="#5a3d26" />
      <P x={11} y={43} w={30} h={2} c="#5a3d26" />
      {lightsFlash > 0 ? <P x={11} y={27} w={30} h={34} c={flashColor} o={0.6 * lightsFlash} /> : null}
      {/* ceiling lamp and warm light cone */}
      <P x={89} y={-20} w={1} h={34} c="#2a1d16" />
      <P x={83} y={14} w={13} h={5} c={C.amber} />
      <P x={85} y={19} w={9} h={1} c={C.amberSoft} />
      <polygon points="84,20 95,20 140,118 40,118" fill={C.amberSoft} opacity={0.09} />
      <WallClock x={132} y={36} minutes={clockMinutes} glint={clockGlint} highlight={clockHighlight} />
      {/* framed calligraphy panel */}
      <P x={150} y={60} w={24} h={16} c="#5a3d26" />
      <P x={151} y={61} w={22} h={14} c="#e7dcc2" />
      <P x={154} y={66} w={16} h={1} c="#3b2a22" />
      <P x={156} y={68} w={12} h={2} c="#3b2a22" />
      <P x={158} y={71} w={8} h={1} c="#3b2a22" />
    </>
  );
};

/** Floor, rug, TV cabinet and sofa — the main layer behind the characters. */
export const HomeRoom: React.FC<{ t: number; tvDim?: number }> = ({ t, tvDim = 0 }) => (
  <>
    {/* floor */}
    <P x={-20} y={118} w={220} h={82} c="#6b4a33" />
    {Array.from({ length: 16 }, (_, i) => (
      <P key={i} x={-20 + i * 16} y={118} w={1} h={82} c="#5c3f2b" />
    ))}
    <P x={-20} y={150} w={220} h={1} c="#5c3f2b" />
    {/* Sadu rug */}
    <P x={30} y={136} w={146} h={34} c="#9e2a2b" />
    <P x={30} y={138} w={146} h={2} c="#f0e6d0" />
    <P x={30} y={166} w={146} h={2} c="#f0e6d0" />
    <P x={30} y={152} w={146} h={2} c="#1f1a1a" />
    {Array.from({ length: 18 }, (_, i) => (
      <g key={i}>
        <P x={33 + i * 8} y={144} w={2} h={1} c="#f0e6d0" />
        <P x={32 + i * 8} y={145} w={4} h={1} c="#f0e6d0" />
        <P x={33 + i * 8} y={146} w={2} h={1} c="#f0e6d0" />
        <P x={32 + i * 8} y={158} w={2} h={2} c="#e0b13a" />
        <P x={36 + i * 8} y={158} w={2} h={2} c="#1f1a1a" />
      </g>
    ))}
    {/* TV cabinet + TV */}
    <P x={2} y={96} w={46} h={24} c="#5b3a26" />
    <P x={2} y={96} w={46} h={2} c="#7a5236" />
    <P x={6} y={102} w={17} h={13} c="#4a2f1f" />
    <P x={27} y={102} w={17} h={13} c="#4a2f1f" />
    <P x={22} y={92} w={6} h={4} c="#111" />
    <P x={4} y={66} w={42} h={27} c="#111318" />
    <TvMatch t={t} x={6} y={68} w={38} h={23} dim={tvDim} />
    {/* sofa */}
    <P x={50} y={88} w={9} h={32} c="#7a2530" />
    <P x={171} y={88} w={9} h={32} c="#7a2530" />
    <P x={56} y={74} w={118} h={28} c="#a33b46" />
    {[0, 1, 2, 3].map((i) => (
      <P key={i} x={58 + i * 29} y={76} w={26} h={22} c="#b8474f" />
    ))}
    <P x={56} y={100} w={118} h={20} c="#8c2f39" />
    <P x={56} y={100} w={118} h={2} c="#c4545d" />
    <P x={56} y={118} w={118} h={2} c="#5e1d26" />
  </>
);

/** Foreground: coffee table with dallah, and a plant (strong parallax). */
export const HomeForeground: React.FC = () => (
  <>
    <P x={78} y={128} w={64} h={5} c="#7a5236" />
    <P x={78} y={128} w={64} h={1} c="#946645" />
    <P x={81} y={133} w={3} h={10} c="#5b3a26" />
    <P x={136} y={133} w={3} h={10} c="#5b3a26" />
    {/* dallah */}
    <P x={88} y={118} w={7} h={10} c="#d4a73a" />
    <P x={89} y={116} w={5} h={2} c="#e8c25a" />
    <P x={90} y={113} w={3} h={3} c="#d4a73a" />
    <P x={95} y={120} w={5} h={1} c="#d4a73a" />
    <P x={99} y={119} w={1} h={1} c="#d4a73a" />
    <P x={85} y={121} w={3} h={4} c="#b8892a" />
    {/* tray with cups and dates */}
    <P x={104} y={125} w={30} h={3} c="#c8c0b0" />
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <P x={107 + i * 5} y={122} w={3} h={3} c="#f6f2e9" />
        <P x={107 + i * 5} y={122} w={3} h={1} c="#7a4a22" />
      </g>
    ))}
    {[0, 1, 2, 3].map((i) => (
      <P key={i} x={123 + i * 2} y={123} w={2} h={2} c="#5a2a12" />
    ))}
    {/* plant in the right foreground corner */}
    <P x={168} y={150} w={14} h={14} c="#6b4a33" />
    <P x={166} y={148} w={18} h={3} c="#7c5a40" />
    {[[-6, -18], [-2, -26], [3, -22], [7, -14], [-9, -10]].map(([dx, dy], i) => (
      <g key={i}>
        <P x={174 + dx} y={148 + dy} w={4} h={-dy} c={i % 2 ? "#2f6b3a" : "#3c8248"} />
      </g>
    ))}
  </>
);

/** Exterior: Najdi-style house at night, street. Door opens with `door` 0..1. */
export const HouseExterior: React.FC<{ t: number; door: number; lights: number }> = ({ t, door, lights }) => {
  const flashColor = Math.floor(t * 4) % 2 === 0 ? "#ff2a3a" : "#2a6bff";
  return (
    <>
      {["#0a0f2a", "#0e1434", "#121a3e", "#172048", "#1b2552"].map((c, i) => (
        <P key={c} x={-20} y={-20 + i * 24} w={220} h={24} c={c} />
      ))}
      {[[12, 8], [44, 20], [70, 6], [150, 16], [170, 4], [120, 26], [96, 12]].map(([sx, sy], i) => (
        <P key={i} x={sx} y={sy} c="#e8e8ff" o={0.4 + 0.6 * Math.abs(Math.sin(t + i))} />
      ))}
      <circle cx={30} cy={22} r={6} fill="#f3e9b5" />
      <circle cx={33} cy={20} r={5} fill="#0e1434" />
      {/* house */}
      <P x={40} y={50} w={150} h={84} c="#c9a57a" />
      <P x={40} y={50} w={150} h={3} c="#b08c62" />
      {Array.from({ length: 15 }, (_, i) => (
        <g key={i}>
          <P x={42 + i * 10} y={44} w={6} h={6} c="#c9a57a" />
          <P x={44 + i * 10} y={41} w={2} h={3} c="#c9a57a" />
        </g>
      ))}
      {[52, 150].map((wx) => (
        <g key={wx}>
          <P x={wx} y={64} w={18} h={20} c="#ffd27a" />
          <P x={wx + 8} y={64} w={2} h={20} c="#8a6a4a" />
          <P x={wx - 2} y={84} w={22} h={2} c="#8a6a4a" />
        </g>
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <P key={i} x={46 + i * 16} y={110} w={8} h={2} c="#b08c62" />
      ))}
      <P x={96} y={84} w={30} h={50} c="#5b3a26" />
      <P x={99} y={87} w={24} h={47} c="#ffcf7a" />
      <P x={99} y={87} w={Math.round(24 * (1 - door))} h={47} c="#7a5236" />
      {/* street */}
      <P x={-20} y={134} w={220} h={8} c="#8a8a90" />
      <P x={-20} y={142} w={220} h={58} c="#2a2a33" />
      {Array.from({ length: 8 }, (_, i) => (
        <P key={i} x={i * 28 - 6} y={166} w={14} h={2} c="#d8d8d8" />
      ))}
      {lights > 0 ? <P x={-20} y={-20} w={220} h={220} c={flashColor} o={0.1 * lights} /> : null}
    </>
  );
};

/** Ambulance (side view, facing left). Generic markings, no real organisation branding. */
export const Ambulance: React.FC<{ x: number; y: number; t: number; moving: boolean; rearOpen: number }> = ({
  x,
  y,
  t,
  moving,
  rearOpen,
}) => {
  const red = Math.floor(t * 5) % 2 === 0;
  const spoke = moving ? Math.floor(t * 20) % 2 : 0;
  return (
    <g transform={`translate(${Math.round(x)} ${y})`}>
      <circle cx={34} cy={0} r={24} fill={red ? "#ff2a3a" : "#2a6bff"} opacity={0.18} />
      <P x={0} y={14} w={16} h={22} c="#f4f4f0" />
      <P x={3} y={16} w={10} h={8} c="#7fb4d9" />
      <P x={16} y={6} w={56} h={30} c="#f4f4f0" />
      <P x={0} y={26} w={72} h={4} c={C.red} />
      <P x={0} y={34} w={72} h={3} c="#c9c9c2" />
      <text x={44} y={21} fontSize={6} fontFamily="Cairo" fontWeight={800} fill={C.red} textAnchor="middle">
        إسعاف
      </text>
      <P x={30} y={3} w={8} h={3} c={red ? "#ff3b3b" : "#7a1a1a"} />
      <P x={40} y={3} w={8} h={3} c={red ? "#1a2f7a" : "#3b7bff"} />
      <P x={0} y={28} w={2} h={3} c="#ffe28a" />
      {/* rear doors */}
      <P x={72 - 2} y={8} w={2} h={26} c="#bdbdb5" />
      <P x={72} y={8} w={Math.round(10 * rearOpen)} h={26} c="#e8e8e2" o={rearOpen > 0 ? 1 : 0} />
      {[14, 60].map((wx) => (
        <g key={wx}>
          <P x={wx - 5} y={34} w={10} h={8} c="#151515" />
          <P x={wx - 2} y={36} w={4} h={4} c="#8a8a8a" />
          <P x={wx - (spoke ? 0 : 1)} y={37 + (spoke ? -1 : 0)} w={spoke ? 1 : 3} h={spoke ? 3 : 1} c="#151515" />
        </g>
      ))}
    </g>
  );
};

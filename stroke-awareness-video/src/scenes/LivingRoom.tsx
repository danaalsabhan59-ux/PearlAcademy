import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { blinkAt, ev, keyframes, lineStart, mouthFor, progress, scene } from "../anim";
import { Father, fatherRightHand, Finjan, Son } from "../pixel/characters";
import { ART_H, ART_W, PixelCanvas, R } from "../pixel/Px";
import { timeline } from "../timeline";

const FATHER = { x: 70, y: 66 };

// ------------------------------------------------------------------- props
const Window: React.FC<{ t: number; sirenGlow: number }> = ({ t, sirenGlow }) => {
  const flash = Math.floor(t * 4) % 2 === 0 ? "#ff2a3a" : "#2a6bff";
  return (
    <>
      <R x={14} y={16} w={9} h={60} c="#7a2f3a" />
      <R x={83} y={16} w={9} h={60} c="#7a2f3a" />
      <R x={16} y={16} w={2} h={60} c="#5e2430" />
      <R x={87} y={16} w={2} h={60} c="#5e2430" />
      <R x={24} y={20} w={58} h={48} c="#5a4632" />
      <R x={27} y={23} w={52} h={42} c="#101a42" />
      {[[33, 28], [45, 40], [70, 46], [38, 55], [60, 30], [52, 58]].map(([sx, sy], i) => (
        <R key={i} x={sx} y={sy} c="#e8e8ff" o={0.5 + 0.5 * Math.sin(t * 2 + i)} />
      ))}
      <circle cx={68} cy={32} r={5} fill="#f3e9b5" />
      <circle cx={70.5} cy={30.5} r={4.3} fill="#101a42" />
      <R x={52} y={23} w={2} h={42} c="#5a4632" />
      <R x={27} y={43} w={52} h={2} c="#5a4632" />
      {sirenGlow > 0 ? <R x={27} y={23} w={52} h={42} c={flash} o={0.55 * sirenGlow} /> : null}
    </>
  );
};

const Clock: React.FC<{ t: number; highlight: number }> = ({ t, highlight }) => {
  const minute = t * 24;
  const hour = t * 2;
  return (
    <g transform="translate(138 32)">
      {highlight > 0 ? (
        <circle r={11 + Math.sin(t * 8) * 1.5} fill="none" stroke="#ffd166" strokeWidth={1.5} opacity={highlight} />
      ) : null}
      <circle r={8} fill="#5a4632" />
      <circle r={7} fill="#f4ecd8" />
      <g transform={`rotate(${minute})`}>
        <R x={-0.5} y={-6} w={1} h={6} c="#222" />
      </g>
      <g transform={`rotate(${hour})`}>
        <R x={-0.5} y={-4} w={1} h={4} c="#c73a3a" />
      </g>
      <R x={-1} y={-1} w={2} h={2} c="#222" />
    </g>
  );
};

const SaduRug: React.FC = () => {
  const cells: React.ReactNode[] = [];
  for (let i = 0; i < 25; i++) {
    const x = 34 + i * 8;
    cells.push(
      <g key={i}>
        <R x={x + 3} y={146} w={2} h={1} c="#f0e6d0" />
        <R x={x + 2} y={147} w={4} h={1} c="#f0e6d0" />
        <R x={x + 3} y={148} w={2} h={1} c="#f0e6d0" />
        <R x={x + 1} y={156} w={2} h={2} c="#1f1a1a" />
        <R x={x + 5} y={156} w={2} h={2} c="#e0b13a" />
        <R x={x + 3} y={160} w={2} h={1} c="#f0e6d0" />
        <R x={x + 2} y={161} w={4} h={1} c="#f0e6d0" />
        <R x={x + 3} y={162} w={2} h={1} c="#f0e6d0" />
      </g>,
    );
  }
  return (
    <>
      <R x={30} y={138} w={204} h={30} c="#9e2a2b" />
      <R x={30} y={140} w={204} h={2} c="#f0e6d0" />
      <R x={30} y={152} w={204} h={2} c="#1f1a1a" />
      <R x={30} y={164} w={204} h={2} c="#f0e6d0" />
      {cells}
    </>
  );
};

const Tv: React.FC<{ t: number; goal: number }> = ({ t, goal }) => {
  const players = Array.from({ length: 10 }, (_, i) => {
    const team = i < 5 ? "#e63946" : "#f1faee";
    const px = 222 + ((i * 13) % 60) + Math.sin(t * 1.3 + i) * 6;
    const py = 50 + ((i * 7) % 30) + Math.cos(t * 1.1 + i * 2) * 4;
    return <R key={i} x={Math.round(px)} y={Math.round(py)} w={2} h={3} c={team} />;
  });
  // Ball drifts around midfield, then flies into the goal on the right.
  const shot = progress(t, ev("goalScored") - 1.2, 1.0);
  const bx = 248 + Math.sin(t * 1.7) * 14 * (1 - shot) + shot * 36;
  const by = 63 + Math.cos(t * 1.3) * 8 * (1 - shot);
  const flash = goal > 0 && Math.floor(t * 6) % 2 === 0;
  return (
    <>
      <R x={240} y={94} w={16} h={3} c="#111" />
      <R x={204} y={38} w={88} h={56} c="#111318" />
      <R x={207} y={41} w={82} h={47} c="#2f8f3a" />
      {[0, 1, 2, 3, 4].map((i) => (
        <R key={i} x={207 + i * 18} y={41} w={9} h={47} c="#38a046" />
      ))}
      <R x={247} y={41} w={1} h={47} c="#d8f0d8" o={0.8} />
      <circle cx={248} cy={64} r={7} fill="none" stroke="#d8f0d8" strokeWidth={0.8} opacity={0.8} />
      <R x={284} y={56} w={5} h={16} c="#e8e8e8" o={0.85} />
      <R x={207} y={56} w={5} h={16} c="#e8e8e8" o={0.85} />
      {players}
      <R x={Math.round(bx)} y={Math.round(by)} w={2} h={2} c="#fff" />
      <R x={207} y={41} w={82} h={6} c="#0b0d12" o={0.8} />
      <R x={210} y={42} w={10} h={4} c="#e63946" />
      <R x={222} y={42} w={10} h={4} c="#f1faee" />
      <text x={286} y={45.8} fontSize={4} fill="#fff" textAnchor="end" fontFamily="Cairo">
        {goal > 0 || t > ev("goalScored") + 1.5 ? "1 - 0" : "0 - 0"}
      </text>
      {goal > 0 ? (
        <>
          <R x={207} y={41} w={82} h={47} c={flash ? "#ffd166" : "#ffffff"} o={0.35 * goal} />
          <text
            x={248}
            y={71}
            fontSize={16}
            fill="#ffd166"
            stroke="#1b1b22"
            strokeWidth={1.2}
            paintOrder="stroke"
            textAnchor="middle"
            fontFamily="Cairo"
            fontWeight={800}
            opacity={goal}
          >
            هدف!
          </text>
        </>
      ) : null}
      <R x={204} y={38} w={88} h={56} c="#ffffff" o={0.04 + 0.03 * Math.sin(t * 9)} />
    </>
  );
};

// ------------------------------------------------------------------- scene
export const LivingRoom: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const goalAt = ev("goalScored");
  const strokeAt = ev("strokeStart");
  const dropAt = ev("cupDrop");
  const standAt = ev("sonStands");
  const droopAt = ev("faceDroop");
  const armDropAt = ev("armDrop");
  const fast = scene("fast");
  const call = scene("call");
  const goal = t >= goalAt && t < goalAt + 2.4 ? 1 - progress(t, goalAt + 1.9, 0.5) : 0;

  // ------------------------------------------------------------ father pose
  const armTestUp = lineStart("s_arms") + 0.7;
  const rightArm = keyframes(t, [
    [0, 40],
    [goalAt, 40],
    [goalAt + 0.3, 70],
    [goalAt + 1.4, 40],
    [dropAt - 0.05, 40],
    [dropAt + 0.25, 4],
    [armTestUp, 4],
    [armTestUp + 0.6, 190],
    [armDropAt, 186],
    [armDropAt + 1.6, 6],
  ]);
  const leftArm = keyframes(t, [
    [0, 10],
    [goalAt, 10],
    [goalAt + 0.3, 150],
    [goalAt + 1.4, 10],
    [armTestUp, 10],
    [armTestUp + 0.6, 170],
    [lineStart("n4"), 170],
    [lineStart("n4") + 0.8, 12],
  ]);
  const slump = keyframes(t, [
    [strokeAt, 0],
    [strokeAt + 2.0, 0.55],
    [armTestUp, 0.55],
    [armTestUp + 0.5, 0.25],
    [armDropAt, 0.25],
    [armDropAt + 1.5, 0.7],
  ]);
  const fatherPose = {
    mouth: mouthFor("father", t, frame),
    blink: t > strokeAt ? false : blinkAt(t, 0),
    droop: t >= droopAt ? 1 : 0,
    slump,
    leftArm,
    rightArm,
    holdingCup: t < dropAt,
  };

  // --------------------------------------------------------------- son pose
  const walk = progress(t, standAt + 0.3, 1.3, (x) => x);
  const inCall = t >= call.start;
  const sonX = inCall ? 112 : 178 - walk * 80;
  const sitting = t < standAt + 0.3;
  const jumping = goal > 0 && t < goalAt + 1.6;
  const sonPose = {
    mouth: mouthFor("son", t, frame),
    blink: blinkAt(t, 1),
    sitting,
    walkPhase: walk > 0 && walk < 1 ? t * 14 : null,
    leftArm: jumping ? 170 : sitting ? 10 : inCall ? 10 : 55,
    rightArm: jumping ? 190 : inCall ? 166 : sitting ? -10 : 8,
    phone: inCall,
    worried: t > strokeAt,
  };
  const jumpY = jumping ? -Math.abs(Math.sin((t - goalAt) * 9)) * 4 : 0;
  const sonY = (sitting ? 110 : 93) + jumpY;

  // -------------------------------------------------------------- the cup
  const hand = fatherRightHand(FATHER.x, FATHER.y, 40);
  const fall = Math.min(1, Math.max(0, (t - dropAt) / 0.35));
  const landed = t >= dropAt + 0.35;
  const cupX = hand.x + fall * 6;
  const cupY = hand.y + fall * fall * (126 - hand.y);
  const sinceLand = t - (dropAt + 0.35);
  const shards = [
    [-1, -0.6],
    [1, -0.8],
    [-0.6, -0.3],
    [0.8, -0.2],
    [0.2, -1],
    [-1.2, -0.1],
  ].map(([vx, vy], i) => {
    const k = 1 - Math.exp(-Math.max(0, sinceLand) * 7);
    const x = cupX + vx * 10 * k;
    const y = 127 + vy * 3 * k + (k * k * 2);
    return <R key={i} x={Math.round(x)} y={Math.round(y)} w={i % 2 ? 2 : 1} h={1} c="#f4f1ea" />;
  });
  const puddle = progress(t, dropAt + 0.35, 1.2);

  // ----------------------------------------------------------- the camera
  const n = (id: string) => lineStart(id);
  const camKeys: [number, number, number, number][] = [
    [fast.start - 0.2, 1, 160, 90],
    [fast.start + 0.8, 1.25, 110, 95],
    [n("n2") + 0.2, 1.25, 110, 95],
    [n("n2") + 1.4, 2.6, 77, 76],
    [n("n3") + 0.2, 2.6, 77, 76],
    [n("n3") + 1.2, 1.7, 84, 92],
    [n("n4") + 0.2, 1.7, 84, 92],
    [n("n4") + 1.2, 2.4, 77, 76],
    [n("n5") + 0.2, 2.4, 77, 76],
    [n("n5") + 1.4, 1.35, 175, 70],
    [fast.end - 0.6, 1.35, 175, 70],
    [call.start + 0.6, 1.15, 125, 98],
  ];
  const cam = (idx: number) => keyframes(t, camKeys.map((k) => [k[0], k[idx]] as [number, number]));
  const scale = t < fast.start - 0.2 ? 1 : cam(1);
  const half = { w: ART_W / 2 / scale, h: ART_H / 2 / scale };
  const cx = Math.min(ART_W - half.w, Math.max(half.w, t < fast.start - 0.2 ? 160 : cam(2)));
  const cy = Math.min(ART_H - half.h, Math.max(half.h, t < fast.start - 0.2 ? 90 : cam(3)));
  const shake = landed && sinceLand < 0.25 ? Math.sin(sinceLand * 90) * (1 - sinceLand / 0.25) * 1.5 : 0;

  // Siren lights visible through the window near the end of the call.
  const siren = timeline.sfx.find((s) => s.id === "siren");
  const sirenGlow = siren ? progress(t, siren.start, 2.5) : 0;
  const clockHighlight =
    t >= n("n5") && t < fast.end ? 1 - progress(t, fast.end - 0.8, 0.6) : 0;

  return (
    <PixelCanvas>
      <g transform={`translate(${160 + shake} 90) scale(${scale}) translate(${-cx} ${-cy})`}>
        {/* walls and floor */}
        <R x={0} y={0} w={320} h={122} c="#2d2540" />
        <R x={0} y={104} w={320} h={18} c="#3a2f52" />
        <R x={0} y={104} w={320} h={2} c="#4c3e6b" />
        <R x={0} y={122} w={320} h={58} c="#6b4a33" />
        {Array.from({ length: 20 }, (_, i) => (
          <R key={i} x={i * 16} y={122} w={1} h={58} c="#5c3f2b" />
        ))}
        <R x={0} y={150} w={320} h={1} c="#5c3f2b" />
        <defs>
          <radialGradient id="lampGlow">
            <stop offset="0%" stopColor="#ffd38a" stopOpacity={0.22} />
            <stop offset="100%" stopColor="#ffd38a" stopOpacity={0} />
          </radialGradient>
        </defs>
        <circle cx={191} cy={46} r={50} fill="url(#lampGlow)" />
        <Window t={t} sirenGlow={sirenGlow} />
        <Clock t={t} highlight={clockHighlight} />
        <SaduRug />

        {/* majlis sofa */}
        <R x={18} y={88} w={10} h={34} c="#7a2530" />
        <R x={170} y={88} w={10} h={34} c="#7a2530" />
        <R x={26} y={82} w={146} h={16} c="#a33b46" />
        {[0, 1, 2, 3, 4].map((i) => (
          <R key={i} x={28 + i * 29} y={84} w={26} h={12} c="#b8474f" />
        ))}
        <R x={26} y={96} w={146} h={26} c="#8c2f39" />
        <R x={26} y={96} w={146} h={2} c="#c4545d" />

        {/* lamp */}
        <R x={190} y={50} w={2} h={72} c="#3b2b1f" />
        <R x={184} y={40} w={14} h={11} c="#e8c27a" />
        <R x={186} y={120} w={10} h={2} c="#3b2b1f" />

        {/* TV */}
        <R x={198} y={97} w={102} h={25} c="#5b3a26" />
        <R x={198} y={97} w={102} h={2} c="#7a5236" />
        <R x={210} y={104} w={24} h={12} c="#4a2f1f" />
        <R x={264} y={104} w={24} h={12} c="#4a2f1f" />
        <Tv t={t} goal={goal} />

        {/* coffee table with dallah and dates */}
        <R x={102} y={128} w={46} h={4} c="#7a5236" />
        <R x={104} y={132} w={3} h={8} c="#5b3a26" />
        <R x={143} y={132} w={3} h={8} c="#5b3a26" />
        <R x={112} y={120} w={7} h={8} c="#d4a73a" />
        <R x={113} y={118} w={5} h={2} c="#e8c25a" />
        <R x={119} y={121} w={4} h={1} c="#d4a73a" />
        <R x={114} y={116} w={3} h={2} c="#d4a73a" />
        <R x={128} y={125} w={14} h={3} c="#c8c0b0" />
        {[0, 1, 2, 3].map((i) => (
          <R key={i} x={130 + i * 3} y={124} w={2} h={2} c="#5a2a12" />
        ))}

        {/* son's floor cushion */}
        <R x={172} y={134} w={26} h={6} c="#2b7a4b" />

        <Father x={FATHER.x} y={FATHER.y} pose={fatherPose} />
        <Son x={sonX} y={sonY} pose={sonPose} />

        {/* falling / broken finjan */}
        {puddle > 0 ? (
          <ellipse cx={cupX} cy={128} rx={2 + puddle * 7} ry={1 + puddle * 1.6} fill="#5a3216" opacity={0.85} />
        ) : null}
        {t >= dropAt && !landed ? (
          <g transform={`translate(${cupX} ${cupY}) rotate(${fall * 200})`}>
            <Finjan />
          </g>
        ) : null}
        {landed ? shards : null}
      </g>
    </PixelCanvas>
  );
};

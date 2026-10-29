import React from "react";
import { Easing, useCurrentFrame, useVideoConfig } from "remotion";
import { blinkAt, ev, mouthFor, progress } from "../anim";
import { Paramedic, Son } from "../pixel/characters";
import { PixelCanvas, R } from "../pixel/Px";

const Ambulance: React.FC<{ x: number; t: number; moving: boolean; doorOpen: number }> = ({
  x,
  t,
  moving,
  doorOpen,
}) => {
  const red = Math.floor(t * 5) % 2 === 0;
  const spoke = moving ? Math.floor(t * 20) % 2 : 0;
  return (
    <g transform={`translate(${Math.round(x)} 100)`}>
      {/* light glow */}
      <circle cx={30} cy={0} r={22} fill={red ? "#ff2a3a" : "#2a6bff"} opacity={0.18} />
      {/* body */}
      <R x={0} y={6} w={58} h={30} c="#f4f4f0" />
      <R x={58} y={14} w={16} h={22} c="#f4f4f0" />
      <R x={60} y={16} w={10} h={8} c="#7fb4d9" />
      <R x={0} y={24} w={74} h={4} c="#d62828" />
      <R x={0} y={34} w={74} h={3} c="#c9c9c2" />
      {/* side door (slides open) */}
      <R x={34} y={9} w={18} h={24} c={doorOpen > 0 ? "#3a3a40" : "#e8e8e2"} />
      <R x={34 + doorOpen * 18} y={9} w={1} h={24} c="#b8b8b0" />
      <text x={17} y={20} fontSize={6} fontFamily="Cairo" fontWeight={800} fill="#d62828" textAnchor="middle">
        إسعاف
      </text>
      {/* light bar */}
      <R x={20} y={3} w={8} h={3} c={red ? "#ff3b3b" : "#7a1a1a"} />
      <R x={30} y={3} w={8} h={3} c={red ? "#1a2f7a" : "#3b7bff"} />
      <R x={72} y={28} w={2} h={3} c="#ffe28a" />
      {/* wheels */}
      {[12, 58].map((wx) => (
        <g key={wx}>
          <R x={wx - 5} y={34} w={10} h={8} c="#151515" />
          <R x={wx - 2} y={36} w={4} h={4} c="#8a8a8a" />
          <R x={wx - (spoke ? 0 : 1)} y={37 + (spoke ? -1 : 0)} w={spoke ? 1 : 3} h={spoke ? 3 : 1} c="#151515" />
        </g>
      ))}
    </g>
  );
};

const House: React.FC<{ doorOpen: number }> = ({ doorOpen }) => (
  <>
    <R x={150} y={52} w={150} h={78} c="#c9a57a" />
    <R x={150} y={52} w={150} h={3} c="#b08c62" />
    {Array.from({ length: 15 }, (_, i) => (
      <g key={i}>
        <R x={152 + i * 10} y={46} w={6} h={6} c="#c9a57a" />
        <R x={154 + i * 10} y={43} w={2} h={3} c="#c9a57a" />
      </g>
    ))}
    {[170, 262].map((wx) => (
      <g key={wx}>
        <R x={wx} y={66} w={16} h={18} c="#ffd27a" />
        <R x={wx + 7} y={66} w={2} h={18} c="#8a6a4a" />
        <R x={wx - 2} y={84} w={20} h={2} c="#8a6a4a" />
      </g>
    ))}
    {Array.from({ length: 8 }, (_, i) => (
      <R key={i} x={156 + i * 18} y={110} w={8} h={2} c="#b08c62" />
    ))}
    <R x={208} y={86} w={28} h={44} c="#5b3a26" />
    <R x={211} y={89} w={22} h={41} c={doorOpen > 0 ? "#ffcf7a" : "#7a5236"} />
    <R x={211} y={89} w={Math.round(22 * (1 - doorOpen))} h={41} c="#7a5236" />
    <R x={214} y={92} w={8} h={8} c="#6b4428" o={1 - doorOpen} />
  </>
);

export const Street: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const arrive = ev("ambulanceArrives");
  const doorAt = ev("doorOpens");
  const drive = progress(t, arrive, 2.8, Easing.out(Easing.cubic));
  const ambX = -90 + drive * 120;
  const door = progress(t, doorAt, 0.5);
  const houseDoor = progress(t, doorAt - 0.8, 0.6);
  const walk = progress(t, doorAt + 0.5, 1.6, (x) => x);
  const medX = 72 + walk * 98;
  const flash = Math.floor(t * 5) % 2 === 0 ? "#ff2a3a" : "#2a6bff";

  return (
    <PixelCanvas>
      {/* night sky */}
      {["#0b1030", "#0f1538", "#131a42", "#18204c", "#1d2656"].map((c, i) => (
        <R key={c} x={0} y={i * 20} w={320} h={20} c={c} />
      ))}
      {[[20, 12], [60, 30], [100, 8], [130, 24], [250, 14], [290, 30], [200, 6], [80, 50]].map(
        ([sx, sy], i) => <R key={i} x={sx} y={sy} c="#e8e8ff" o={0.4 + 0.6 * Math.abs(Math.sin(t + i))} />,
      )}
      <circle cx={42} cy={22} r={7} fill="#f3e9b5" />
      <circle cx={45} cy={20} r={6} fill="#0b1030" />
      {/* distant buildings */}
      <R x={0} y={70} w={60} h={60} c="#141a36" />
      <R x={60} y={84} w={50} h={46} c="#10152e" />
      <R x={110} y={76} w={40} h={54} c="#141a36" />
      {[[10, 80], [30, 92], [70, 96], [120, 88], [132, 104]].map(([wx, wy], i) => (
        <R key={i} x={wx} y={wy} w={4} h={4} c="#ffd27a" o={0.7} />
      ))}
      {/* palm */}
      <R x={133} y={70} w={4} h={60} c="#5b3a26" />
      {[-1, 1].map((d) => (
        <g key={d}>
          <R x={d > 0 ? 136 : 122} y={66} w={14} h={3} c="#2f6b3a" />
          <R x={d > 0 ? 140 : 118} y={69} w={10} h={2} c="#2f6b3a" />
        </g>
      ))}
      <House doorOpen={houseDoor} />
      {/* street */}
      <R x={0} y={130} w={320} h={8} c="#8a8a90" />
      <R x={0} y={138} w={320} h={42} c="#2a2a33" />
      {Array.from({ length: 10 }, (_, i) => (
        <R key={i} x={i * 36 + 4} y={160} w={18} h={2} c="#d8d8d8" />
      ))}

      {houseDoor > 0.5 ? (
        <Son
          x={217}
          y={95}
          pose={{
            mouth: mouthFor("son", t, frame),
            blink: blinkAt(t, 1),
            sitting: false,
            walkPhase: null,
            leftArm: 20,
            rightArm: -20,
            phone: false,
            worried: true,
          }}
        />
      ) : null}
      <Ambulance x={ambX} t={t} moving={drive > 0 && drive < 0.98} doorOpen={door} />
      {door > 0.8 ? (
        <Paramedic
          x={medX}
          y={95}
          mouth={mouthFor("paramedic", t, frame)}
          blink={blinkAt(t, 2)}
          walkPhase={walk > 0 && walk < 1 ? t * 12 : null}
        />
      ) : null}

      {/* emergency lights washing over the street */}
      {drive > 0 ? <R x={0} y={0} w={320} h={180} c={flash} o={0.08} /> : null}
    </PixelCanvas>
  );
};

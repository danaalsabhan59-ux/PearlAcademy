import React from "react";
import { P } from "../characters/Person";
import { C } from "../styles/palette";

const PIXEL_FONT = "'Press Start 2P', monospace";

export const PixelText: React.FC<{
  x: number;
  y: number;
  size: number;
  fill: string;
  anchor?: "start" | "middle" | "end";
  children: React.ReactNode;
  opacity?: number;
}> = ({ x, y, size, fill, anchor = "start", children, opacity }) => (
  <text x={x} y={y} fontSize={size} fill={fill} fontFamily={PIXEL_FONT} textAnchor={anchor} opacity={opacity}>
    {children}
  </text>
);

/** ECG-like waveform drawn as pixel steps, scrolling with time. */
export const Waveform: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  t: number;
  color: string;
  kind: "ecg" | "pleth";
  speed?: number;
}> = ({ x, y, w, h, t, color, kind, speed = 24 }) => {
  const pts: React.ReactNode[] = [];
  for (let i = 0; i < w; i++) {
    const s = (i + t * speed) % 24;
    let v: number;
    if (kind === "ecg") {
      v = s > 10 && s < 11 ? -0.9 : s >= 11 && s < 12 ? 0.6 : s > 6 && s < 8 ? -0.15 : s > 15 && s < 18 ? -0.2 : 0;
    } else {
      v = -Math.max(0, Math.sin((s / 24) * Math.PI * 2)) * 0.7;
    }
    pts.push(<P key={i} x={x + i} y={Math.round(y + h / 2 + v * (h / 2))} c={color} />);
  }
  return <>{pts}</>;
};

/** Emergency department: cool blue corridor with nurses' station, CT door, alert light. */
export const EDCorridor: React.FC<{ t: number; alert: number; ctReady: number }> = ({ t, alert, ctReady }) => {
  const pulse = alert * (0.5 + 0.5 * Math.sin(t * 5));
  return (
    <>
      <P x={-20} y={-20} w={220} h={136} c="#1a2c4a" />
      <P x={-20} y={84} w={220} h={32} c="#203658" />
      <P x={-20} y={84} w={220} h={2} c="#2c4a72" />
      {/* ceiling light strips */}
      {[20, 80, 140].map((lx) => (
        <g key={lx}>
          <P x={lx} y={0} w={26} h={3} c="#cfefff" />
          <polygon points={`${lx},3 ${lx + 26},3 ${lx + 40},60 ${lx - 14},60`} fill="#9fd8ff" opacity={0.05} />
        </g>
      ))}
      {/* floor */}
      <P x={-20} y={116} w={220} h={84} c="#2b3e5c" />
      {Array.from({ length: 12 }, (_, i) => (
        <P key={i} x={-20 + i * 20} y={116} w={1} h={84} c="#253755" />
      ))}
      <P x={-20} y={140} w={220} h={1} c="#253755" />
      <P x={-20} y={170} w={220} h={1} c="#253755" />
      {/* CT door + sign */}
      <P x={132} y={46} w={40} h={70} c="#344f78" />
      <P x={135} y={50} w={16} h={66} c="#3f5d8a" />
      <P x={153} y={50} w={16} h={66} c="#3f5d8a" />
      <P x={140} y={70} w={6} h={10} c="#9fd8ff" o={0.4} />
      <P x={158} y={70} w={6} h={10} c="#9fd8ff" o={0.4} />
      <P x={138} y={32} w={28} h={11} c="#0e1730" />
      <PixelText x={152} y={40.5} size={6} fill={C.ice} anchor="middle">
        CT
      </PixelText>
      <circle cx={170} cy={37} r={2.2} fill={ctReady > 0.5 ? C.green : "#555"} />
      {/* alert beacon */}
      <P x={86} y={10} w={10} h={6} c="#3a2a1a" />
      <P x={87} y={11} w={8} h={4} c={alert > 0 ? C.amber : "#5a4a3a"} />
      {alert > 0 ? <circle cx={91} cy={13} r={14} fill={C.amber} opacity={0.18 * pulse} /> : null}
      {/* nurses' station */}
      <P x={0} y={86} w={72} h={30} c="#e7ecf2" />
      <P x={0} y={86} w={72} h={3} c="#c3ccd8" />
      <P x={0} y={100} w={72} h={1} c="#c3ccd8" />
    </>
  );
};

/** Large monitor on the nurses' station. Content passed as children (art coords inside). */
export const StationMonitor: React.FC<{ x: number; y: number; w: number; h: number; children?: React.ReactNode; flash?: number }> = ({
  x,
  y,
  w,
  h,
  children,
  flash = 0,
}) => (
  <g transform={`translate(${x} ${y})`}>
    <P x={w / 2 - 2} y={h} w={4} h={6} c="#2b2f38" />
    <P x={-2} y={-2} w={w + 4} h={h + 4} c="#11141b" />
    <P x={0} y={0} w={w} h={h} c="#06101e" />
    {flash > 0 ? <P x={0} y={0} w={w} h={h} c={C.red} o={0.25 * flash} /> : null}
    {children}
  </g>
);

/** Resuscitation / assessment bay with curtain and wall monitor. */
export const ResusBay: React.FC = () => (
  <>
    <P x={-20} y={-20} w={220} h={130} c="#1d3150" />
    <P x={-20} y={0} w={220} h={3} c="#2c4a72" />
    <P x={20} y={0} w={140} h={3} c="#cfefff" />
    <polygon points="20,3 160,3 190,110 -10,110" fill="#9fd8ff" opacity={0.05} />
    {/* curtain on the left */}
    <P x={-20} y={4} w={34} h={104} c="#4f7fa8" />
    {Array.from({ length: 6 }, (_, i) => (
      <P key={i} x={-18 + i * 6} y={4} w={2} h={104} c="#426e94" />
    ))}
    {/* wall gas panel */}
    <P x={150} y={28} w={24} h={14} c="#c9d2de" />
    <P x={153} y={31} w={4} h={4} c="#3fa34d" />
    <P x={160} y={31} w={4} h={4} c="#e8e8e8" />
    <P x={167} y={31} w={4} h={4} c="#2c6fd1" />
    {/* floor */}
    <P x={-20} y={110} w={220} h={90} c="#2b3e5c" />
    {Array.from({ length: 12 }, (_, i) => (
      <P key={i} x={-20 + i * 20} y={110} w={1} h={90} c="#253755" />
    ))}
  </>
);

/** Bedside monitor with waveforms and labels only — no invented numbers. */
export const BedsideMonitor: React.FC<{ x: number; y: number; t: number; on: number }> = ({ x, y, t, on }) => (
  <g transform={`translate(${x} ${y})`}>
    <P x={18} y={-14} w={2} h={14} c="#5b6372" />
    <P x={-2} y={-2} w={44} h={32} c="#11141b" />
    <P x={0} y={0} w={40} h={28} c="#04101a" />
    {on > 0 ? (
      <g opacity={on}>
        <PixelText x={2} y={6} size={3.4} fill={C.green}>
          HR
        </PixelText>
        <Waveform x={11} y={1} w={27} h={7} t={t} color={C.green} kind="ecg" />
        <PixelText x={2} y={15} size={3.4} fill={C.ice}>
          SpO2
        </PixelText>
        <Waveform x={15} y={10} w={23} h={7} t={t} color={C.ice} kind="pleth" />
        <PixelText x={2} y={24} size={3.4} fill={C.amber}>
          BP
        </PixelText>
        <P x={11} y={21} w={Math.round(((t * 6) % 27) + 1)} h={1} c={C.amber} />
      </g>
    ) : null}
  </g>
);

/** CT suite background: control-room window and floor. */
export const CTSuite: React.FC = () => (
  <>
    <P x={-20} y={-20} w={220} h={130} c="#1b2c48" />
    <P x={-20} y={0} w={220} h={3} c="#2c4a72" />
    <P x={40} y={0} w={60} h={3} c="#cfefff" />
    <P x={6} y={18} w={58} h={36} c="#2a3e5e" />
    <P x={9} y={21} w={52} h={30} c="#0e2238" />
    <P x={-20} y={110} w={220} h={90} c="#2b3e5c" />
    {Array.from({ length: 12 }, (_, i) => (
      <P key={i} x={-20 + i * 20} y={110} w={1} h={90} c="#253755" />
    ))}
    {/* couch pedestal */}
    <P x={56} y={104} w={44} h={14} c="#c3cad4" />
    <P x={56} y={104} w={44} h={2} c="#e9edf2" />
  </>
);

/** Window glass drawn over whatever is behind it (the technologist). */
export const CTWindowGlass: React.FC = () => (
  <>
    <P x={9} y={21} w={52} h={30} c="#9fd8ff" o={0.1} />
    <P x={12} y={23} w={10} h={1} c="#ffffff" o={0.25} />
    <P x={34} y={21} w={1} h={30} c="#2a3e5e" />
  </>
);

/** Couch top that slides into the gantry. */
export const CTCouch: React.FC<{ x: number }> = ({ x }) => (
  <>
    <P x={x} y={100} w={70} h={4} c="#e9edf2" />
    <P x={x} y={103} w={70} h={1} c="#aab3bf" />
  </>
);

/** Gantry seen from the side, drawn in front of the couch. */
export const CTGantry: React.FC<{ t: number; scanning: number }> = ({ t, scanning }) => (
  <>
    <P x={118} y={30} w={30} h={86} c="#e9edf2" />
    <P x={114} y={44} w={4} h={58} c="#d6dce4" />
    <P x={148} y={44} w={4} h={58} c="#d6dce4" />
    <P x={118} y={30} w={30} h={3} c="#ffffff" />
    <P x={146} y={30} w={2} h={86} c="#c3cad4" />
    <P x={114} y={92} w={4} h={14} c="#1a2233" />
    {/* rotating-scan indicator light band */}
    <P x={126} y={40} w={14} h={62} c="#1a2233" />
    {scanning > 0 ? (
      <P x={126} y={40 + Math.round(((Math.sin(t * 9) + 1) / 2) * 58)} w={14} h={4} c={C.ice} o={scanning} />
    ) : null}
    <P x={126} y={40} w={14} h={62} c={C.ice} o={0.08 + 0.15 * scanning} />
    <P x={122} y={34} w={6} h={3} c={scanning > 0 ? C.green : "#3a4458"} />
    <P x={136} y={34} w={6} h={3} c={C.amber} o={0.7} />
    <P x={112} y={112} w={42} h={4} c="#c3cad4" />
  </>
);

/** Simplified, schematic axial brain slice (illustration, not a scan). */
export const BrainIllustration: React.FC<{ x: number; y: number; sweep: number }> = ({ x, y, sweep }) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={0} rx={22} ry={27} fill="#d8d8d8" />
    <ellipse cx={0} cy={0} rx={19.5} ry={24.5} fill="#8c8c8c" />
    <ellipse cx={0} cy={0} rx={17} ry={22} fill="#a6a6a6" />
    {/* midline, ventricles */}
    <P x={-0.5} y={-22} w={1} h={44} c="#6c6c6c" />
    <path d="M-5 -8 Q-7 0 -4 6 L-2 6 Q-4 0 -2 -8 Z" fill="#3a3a3a" />
    <path d="M5 -8 Q7 0 4 6 L2 6 Q4 0 2 -8 Z" fill="#3a3a3a" />
    {/* gyri hints */}
    {[-12, -6, 6, 12].map((gx) => (
      <path key={gx} d={`M${gx} -18 q2 6 0 12 q-2 6 0 12`} stroke="#949494" strokeWidth={0.6} fill="none" />
    ))}
    <rect x={-24} y={-29 + sweep * 58} width={48} height={1.2} fill={C.ice} opacity={sweep > 0 && sweep < 1 ? 0.8 : 0} />
  </g>
);

export const ReadingRoom: React.FC = () => (
  <>
    <P x={-20} y={-20} w={220} h={220} c="#0d1628" />
    <P x={-20} y={124} w={220} h={76} c="#162238" />
    <P x={10} y={118} w={170} h={8} c="#2a3550" />
    <P x={10} y={118} w={170} h={1} c="#3b4a6c" />
  </>
);

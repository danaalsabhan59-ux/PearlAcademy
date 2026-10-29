/**
 * STROKE CODE — central, frame-exact timeline.
 *
 * Every scene is defined by its start frame and duration in frames. Scenes are
 * contiguous and must total exactly 3600 frames (120 s at 30 fps). Beats inside
 * scenes are given in absolute seconds of the film, matching the storyboard.
 */

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const TOTAL_FRAMES = 3600;

export type SceneId =
  | "s01Opening"
  | "s02Evening"
  | "s03Onset"
  | "s04Signs"
  | "s05Call"
  | "s06CodeStroke"
  | "s07Assessment"
  | "s08CT"
  | "s09Decision"
  | "s10Final";

type SceneDef = { id: SceneId; title: string; durationInFrames: number };

const SCENE_DEFS: SceneDef[] = [
  { id: "s01Opening", title: "01 — The Opening", durationInFrames: 210 },
  { id: "s02Evening", title: "02 — A Normal Evening", durationInFrames: 330 },
  { id: "s03Onset", title: "03 — Sudden Onset", durationInFrames: 360 },
  { id: "s04Signs", title: "04 — Recognizing the Signs", durationInFrames: 540 },
  { id: "s05Call", title: "05 — The Emergency Call", durationInFrames: 360 },
  { id: "s06CodeStroke", title: "06 — Code Stroke Activated", durationInFrames: 390 },
  { id: "s07Assessment", title: "07 — Rapid Assessment", durationInFrames: 480 },
  { id: "s08CT", title: "08 — CT Brain", durationInFrames: 420 },
  { id: "s09Decision", title: "09 — Treatment Decision", durationInFrames: 300 },
  { id: "s10Final", title: "10 — The Final Message", durationInFrames: 210 },
];

export type Scene = SceneDef & { startFrame: number; endFrame: number };

// Start frames are accumulated from integer durations, so there is no drift.
export const SCENES: Scene[] = SCENE_DEFS.reduce<Scene[]>((acc, def) => {
  const startFrame = acc.length ? acc[acc.length - 1].endFrame : 0;
  acc.push({ ...def, startFrame, endFrame: startFrame + def.durationInFrames });
  return acc;
}, []);

const total = SCENES[SCENES.length - 1].endFrame;
if (total !== TOTAL_FRAMES) {
  throw new Error(`STROKE CODE timeline totals ${total} frames, expected ${TOTAL_FRAMES}`);
}

export const scene = (id: SceneId) => SCENES.find((s) => s.id === id)!;
export const sceneStartSec = (id: SceneId) => scene(id).startFrame / FPS;
export const sceneEndSec = (id: SceneId) => scene(id).endFrame / FPS;

/** Frames the incoming scene cross-fades over the outgoing one (no black gaps). */
export const CROSSFADE_FRAMES = 12;

/** Key story beats, in absolute seconds. Edit here to retime actions + sounds together. */
export const BEATS = {
  // S01
  ecgStart: 0.4,
  titleLine1: 1.4,
  titleLine2: 2.6,
  titleLine3: 3.8,
  ecgToClock: 6.0,
  // S02
  lkwLabel: 9.5,
  fatherTurns: 10.5,
  sonGestures: 11.5,
  son2Smiles: 13.0,
  cupLift: 14.5,
  // S03
  handWeakens: 18.0,
  cupSlips: 21.0,
  cupImpact: 21.8,
  son1Turns: 23.0,
  fatherTriesToSpeak: 26.0,
  // S04
  faceCloseUp: 30.0,
  smileAttempt: 31.2,
  armTest: 35.0,
  armsUp: 36.4,
  armDrift: 37.6,
  speechTest: 40.0,
  beFast: 44.0,
  // S05
  phoneDial: 48.3,
  callConnected: 50.6,
  msgSuspected: 51.2,
  msgLkw: 52.6,
  supportWide: 54.0,
  ambulanceArrives: 56.0,
  paramedicsOut: 57.4,
  blueTransition: 59.2,
  // S06
  preAlert: 60.4,
  codeStroke: 63.6,
  teamMobilizes: 65.5,
  stretcherIn: 68.5,
  // S07
  abcs: 73.0,
  glucose: 77.0,
  neuro: 81.0,
  nihssLkw: 85.0,
  // S08
  ctTableIn: 89.6,
  ctScanning: 92.2,
  ctReading: 96.0,
  ctaNote: 99.5,
  // S09
  decisionInputs: 103.4,
  pathways: 105.8,
  safetyCaption: 108.2,
  // S10
  endTitle: 113.4,
  endMessage: 114.6,
  endCall: 116.4,
  timeIsBrain: 117.8,
} as const;

export type Beat = keyof typeof BEATS;

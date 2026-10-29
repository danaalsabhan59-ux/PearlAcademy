import { BEATS, sceneEndSec, sceneStartSec } from "./timeline";

/**
 * Sound design for STROKE CODE. Instrumental music and non-vocal effects only.
 * Levels are linear gain (0–1). Times are absolute seconds of the film.
 */
export const LEVELS = {
  master: 1,
  music: 0.55,
  sfx: 0.9,
};

export type MusicCue = {
  id: string;
  src: string;
  start: number;
  end: number;
  volume: number;
  fadeIn: number;
  fadeOut: number;
  loop?: boolean;
};

export const MUSIC: MusicCue[] = [
  // Warm, calm home evening — cut hard when the cup hits the floor.
  { id: "warm", src: "sc/music/warm.mp3", start: 5.6, end: BEATS.cupImpact, volume: 0.75, fadeIn: 1.4, fadeOut: 0.05 },
  // Tension under symptom recognition and the call.
  { id: "tension", src: "audio/music/tension.mp3", start: 27.0, end: sceneEndSec("s05Call") + 0.3, volume: 0.6, fadeIn: 3.0, fadeOut: 0.6 },
  // Urgent but controlled hospital pulse.
  { id: "hospital", src: "sc/music/hospital.mp3", start: sceneStartSec("s06CodeStroke"), end: sceneStartSec("s10Final") + 0.6, volume: 0.62, fadeIn: 0.8, fadeOut: 1.2 },
  // Hopeful, serious resolution.
  { id: "resolve", src: "sc/music/resolve.mp3", start: sceneStartSec("s10Final") - 0.4, end: 120, volume: 0.8, fadeIn: 0.6, fadeOut: 0.8 },
];

export type SfxCue = {
  id: string;
  src: string;
  start: number;
  /** Omit to play the file once to its end. */
  end?: number;
  volume: number;
  loop?: boolean;
  fadeIn?: number;
  fadeOut?: number;
};

export const SFX: SfxCue[] = [
  { id: "ecg-beeps", src: "sc/sfx/ecg-beeps.mp3", start: BEATS.ecgStart, end: BEATS.ecgToClock + 0.6, volume: 0.45, fadeOut: 0.6 },
  { id: "title-swell", src: "sc/sfx/whoosh.mp3", start: BEATS.titleLine2 - 0.5, volume: 0.35 },
  { id: "tv-ambience", src: "sc/sfx/tv-ambience.mp3", start: 7.0, end: BEATS.cupImpact, loop: true, volume: 0.22, fadeIn: 1.0, fadeOut: 0.05 },
  { id: "cup", src: "audio/sfx/cup-crash.mp3", start: BEATS.cupImpact, volume: 0.95 },
  { id: "clock-tick", src: "sc/sfx/clock-tick.mp3", start: BEATS.cupImpact + 0.4, end: sceneEndSec("s05Call") - 0.4, loop: true, volume: 0.45, fadeIn: 0.8, fadeOut: 1.0 },
  { id: "befast-chime", src: "sc/sfx/ui-chime.mp3", start: BEATS.beFast + 0.2, volume: 0.4 },
  { id: "phone", src: "audio/sfx/phone-call.mp3", start: BEATS.phoneDial - 0.15, volume: 0.6 },
  { id: "siren", src: "audio/sfx/siren.mp3", start: BEATS.supportWide - 1.0, end: sceneEndSec("s05Call") + 0.4, volume: 0.55, fadeIn: 0.5, fadeOut: 0.8 },
  { id: "whoosh-hospital", src: "sc/sfx/whoosh.mp3", start: BEATS.blueTransition, volume: 0.5 },
  { id: "pre-alert", src: "sc/sfx/monitor-alert.mp3", start: BEATS.preAlert + 0.2, volume: 0.45 },
  { id: "code-stroke-alert", src: "sc/sfx/code-alert.mp3", start: BEATS.codeStroke, volume: 0.55 },
  { id: "monitor", src: "sc/sfx/monitor-beep.mp3", start: BEATS.abcs, end: BEATS.ctTableIn - 0.5, loop: true, volume: 0.3, fadeIn: 0.4, fadeOut: 0.6 },
  { id: "glucometer", src: "sc/sfx/glucometer.mp3", start: BEATS.glucose + 2.3, volume: 0.5 },
  { id: "ct-hum", src: "sc/sfx/ct-ambience.mp3", start: sceneStartSec("s08CT"), end: BEATS.ctReading + 0.4, volume: 0.5, fadeIn: 0.6, fadeOut: 0.6 },
  { id: "decision-chime", src: "sc/sfx/ui-chime.mp3", start: BEATS.pathways, volume: 0.35 },
  { id: "final-hit", src: "sc/sfx/final-hit.mp3", start: BEATS.timeIsBrain, volume: 0.6 },
];

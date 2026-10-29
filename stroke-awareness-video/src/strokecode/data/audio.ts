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
  /** Temporary level reductions so key effects stay clear. */
  duck?: { start: number; end: number; level: number }[];
};

/**
 * "Ticking clock" tension score modelled on the reference video: continuous drone,
 * heartbeat booms, ticking pulse, rising sweeps and sparse 8-bit blips; 120 BPM
 * (scripts/generate_strokecode_tension.py). Intro booms follow the ECG beeps; the
 * music cuts just before the cup lands, rebuilds, peaks on CODE STROKE ACTIVATED
 * (63.6 s) and ends on TIME IS BRAIN. Stem levels are balanced to the reference's
 * spectral balance. Earlier scores remain available: sc/music/{drums,bass,synths,fx}.mp3
 * (electronic) and sc/music/chip-*.mp3 (chiptune).
 */
const alert = {
  start: BEATS.codeStroke,
  end: BEATS.codeStroke + 3.2,
  level: 0.55,
};
export const MUSIC: MusicCue[] = [
  {
    id: "tension-drone",
    src: "sc/music/tension-drone.mp3",
    start: 0,
    end: 120,
    volume: 0.3,
    fadeIn: 0,
    fadeOut: 0,
  },
  {
    id: "tension-pulse",
    src: "sc/music/tension-pulse.mp3",
    start: 0,
    end: 120,
    volume: 1.0,
    fadeIn: 0,
    fadeOut: 0,
  },
  {
    id: "tension-fx",
    src: "sc/music/tension-fx.mp3",
    start: 0,
    end: 120,
    volume: 0.6,
    fadeIn: 0,
    fadeOut: 0,
  },
  {
    id: "tension-blips",
    src: "sc/music/tension-blips.mp3",
    start: 0,
    end: 120,
    volume: 0.9,
    fadeIn: 0,
    fadeOut: 0,
    duck: [alert],
  },
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
  {
    id: "ecg-beeps",
    src: "sc/sfx/ecg-beeps.mp3",
    start: BEATS.ecgStart,
    end: BEATS.ecgToClock + 0.6,
    volume: 0.45,
    fadeOut: 0.6,
  },
  {
    id: "title-swell",
    src: "sc/sfx/whoosh.mp3",
    start: BEATS.titleLine2 - 0.5,
    volume: 0.35,
  },
  {
    id: "tv-ambience",
    src: "sc/sfx/tv-ambience.mp3",
    start: 7.0,
    end: BEATS.cupImpact,
    volume: 0.22,
    fadeIn: 1.0,
    fadeOut: 0.05,
  },
  {
    id: "cup",
    src: "audio/sfx/cup-crash.mp3",
    start: BEATS.cupImpact,
    volume: 0.95,
  },
  {
    id: "clock-tick",
    src: "sc/sfx/clock-tick.mp3",
    start: BEATS.cupImpact + 0.8, // on the 120 BPM grid
    end: sceneEndSec("s05Call") - 0.4,
    volume: 0.55,
    fadeIn: 0.8,
    fadeOut: 1.0,
  },
  {
    id: "befast-chime",
    src: "sc/sfx/ui-chime.mp3",
    start: BEATS.beFast + 0.2,
    volume: 0.4,
  },
  {
    id: "phone",
    src: "audio/sfx/phone-call.mp3",
    start: BEATS.phoneDial - 0.15,
    volume: 0.6,
  },
  {
    id: "siren",
    src: "audio/sfx/siren.mp3",
    start: BEATS.supportWide - 1.0,
    end: sceneEndSec("s05Call") + 0.4,
    volume: 0.55,
    fadeIn: 0.5,
    fadeOut: 0.8,
  },
  {
    id: "whoosh-hospital",
    src: "sc/sfx/whoosh.mp3",
    start: BEATS.blueTransition,
    volume: 0.5,
  },
  {
    id: "pre-alert",
    src: "sc/sfx/monitor-alert.mp3",
    start: BEATS.preAlert + 0.2,
    volume: 0.45,
  },
  {
    id: "code-stroke-alert",
    src: "sc/sfx/code-alert.mp3",
    start: BEATS.codeStroke,
    volume: 0.7,
  },
  {
    id: "monitor",
    src: "sc/sfx/monitor-beep.mp3",
    start: BEATS.abcs,
    end: BEATS.ctTableIn - 0.5,
    volume: 0.3,
    fadeIn: 0.4,
    fadeOut: 0.6,
  },
  {
    id: "glucometer",
    src: "sc/sfx/glucometer.mp3",
    start: BEATS.glucose + 2.3,
    volume: 0.5,
  },
  {
    id: "ct-hum",
    src: "sc/sfx/ct-ambience.mp3",
    start: sceneStartSec("s08CT"),
    end: BEATS.ctReading + 0.4,
    volume: 0.5,
    fadeIn: 0.6,
    fadeOut: 0.6,
  },
  {
    id: "decision-chime",
    src: "sc/sfx/ui-chime.mp3",
    start: BEATS.pathways,
    volume: 0.35,
  },
  {
    id: "final-hit",
    src: "sc/sfx/final-hit.mp3",
    start: BEATS.timeIsBrain,
    volume: 0.6,
  },
];

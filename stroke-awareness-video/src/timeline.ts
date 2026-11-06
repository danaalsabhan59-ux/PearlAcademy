import dialogueJson from "./data/dialogue.json";
import voicesJson from "./data/voices.generated.json";

// ---------------------------------------------------------------- data types
export type SpeakerId = "father" | "son" | "narrator" | "paramedic";

export type Anchor = {
  line?: string;
  scene?: string;
  /** Anchor to the start (default) or end of the line / scene. */
  edge?: "start" | "end";
  /** Seconds added to the anchor point (may be negative). */
  offset?: number;
};

type LineSpec = {
  id: string;
  speaker: SpeakerId;
  text: string;
  display?: string;
  pauseBefore?: number;
};

type SceneSpec = {
  id: string;
  title: string;
  padStart: number;
  padEnd: number;
  lines: LineSpec[];
};

type SfxSpec = {
  id: string;
  src: string;
  from: Anchor;
  to?: Anchor;
  loop?: boolean;
  volume: number;
  fadeIn?: number;
  fadeOut?: number;
  duck?: boolean;
};

export type Dialogue = {
  title: string;
  fps: number;
  characters: Record<SpeakerId, { name: string; color: string; voice: string }>;
  scenes: SceneSpec[];
  sfx: SfxSpec[];
  music: {
    calm: { src: string; volume: number };
    tension: { src: string; volume: number };
    tensionSections: { from: Anchor; to: Anchor }[];
    fadeIn: number;
    fadeOut: number;
    crossfade: number;
  };
  ducking: { level: number; attack: number; release: number };
  visualEvents: Record<string, Anchor>;
};

type VoiceEntry = {
  file: string;
  duration: number;
  hash: string;
  words: { text: string; start: number; end: number }[];
};

export const dialogue = dialogueJson as unknown as Dialogue;
const voices = (voicesJson as unknown as { lines: Record<string, VoiceEntry> }).lines;

// ------------------------------------------------------------ resolved types
export type Word = { text: string; start: number; end: number };

export type TimedLine = LineSpec & {
  scene: string;
  start: number;
  end: number;
  /** Path under public/, or null if the voice has not been generated yet. */
  audio: string | null;
  /** Word timings relative to the video start (from Edge TTS word boundaries). */
  words: Word[];
};

export type TimedScene = { id: string; title: string; start: number; end: number };

export type TimedSfx = SfxSpec & { start: number; end: number | null };

export type Timeline = {
  scenes: TimedScene[];
  lines: TimedLine[];
  sfx: TimedSfx[];
  tension: { start: number; end: number }[];
  events: Record<string, number>;
  duration: number;
  missingVoices: string[];
};

// Rough speaking speed used only for preview timing when a voice is missing.
const estimateSeconds = (text: string) =>
  Math.max(1.2, text.split(/\s+/).length / 2.3 + 0.3);

export const buildTimeline = (): Timeline => {
  const scenes: TimedScene[] = [];
  const lines: TimedLine[] = [];
  const missingVoices: string[] = [];

  let cursor = 0;
  for (const scene of dialogue.scenes) {
    const sceneStart = cursor;
    cursor += scene.padStart;
    for (const line of scene.lines) {
      cursor += line.pauseBefore ?? 0;
      const voice = voices[line.id];
      if (!voice) missingVoices.push(line.id);
      const duration = voice ? voice.duration : estimateSeconds(line.text);
      const start = cursor;
      lines.push({
        ...line,
        scene: scene.id,
        start,
        end: start + duration,
        audio: voice ? voice.file : null,
        words: (voice?.words ?? []).map((w) => ({
          text: w.text,
          start: start + w.start,
          end: start + w.end,
        })),
      });
      cursor += duration;
    }
    cursor += scene.padEnd;
    scenes.push({ id: scene.id, title: scene.title, start: sceneStart, end: cursor });
  }

  const resolve = (a: Anchor): number => {
    const target = a.line
      ? lines.find((l) => l.id === a.line)
      : scenes.find((s) => s.id === a.scene);
    if (!target) {
      throw new Error(`dialogue.json: unknown anchor ${JSON.stringify(a)}`);
    }
    return (a.edge === "end" ? target.end : target.start) + (a.offset ?? 0);
  };

  const events = Object.fromEntries(
    Object.entries(dialogue.visualEvents).map(([k, a]) => [k, resolve(a)]),
  );

  return {
    scenes,
    lines,
    sfx: dialogue.sfx.map((s) => ({
      ...s,
      start: resolve(s.from),
      end: s.to ? resolve(s.to) : null,
    })),
    tension: dialogue.music.tensionSections.map((s) => ({
      start: resolve(s.from),
      end: resolve(s.to),
    })),
    events,
    duration: cursor,
    missingVoices,
  };
};

export const timeline = buildTimeline();

// -------------------------------------------------------------- audio maths
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/**
 * Gain envelope for a time window [start, end] with fades: 0 outside,
 * ramps in over `fadeIn` and out over `fadeOut`.
 */
export const windowGain = (
  t: number,
  start: number,
  end: number,
  fadeIn: number,
  fadeOut: number,
) => {
  const a = fadeIn > 0 ? clamp01((t - start) / fadeIn) : t >= start ? 1 : 0;
  const b = fadeOut > 0 ? clamp01((end - t) / fadeOut) : t <= end ? 1 : 0;
  return Math.min(a, b);
};

/**
 * Audio ducking: returns 1 when nobody is talking, and smoothly drops to
 * `ducking.level` while any dialogue line is playing.
 */
export const duckGain = (t: number, tl: Timeline = timeline) => {
  const { level, attack, release } = dialogue.ducking;
  let speaking = 0;
  for (const line of tl.lines) {
    if (t < line.start - attack || t > line.end + release) continue;
    speaking = Math.max(
      speaking,
      windowGain(t, line.start - attack, line.end + release, attack, release),
    );
  }
  return 1 - (1 - level) * speaking;
};

/** 0..1 amount of "tension" music at time t (cross-faded). */
export const tensionAmount = (t: number, tl: Timeline = timeline) => {
  const xf = dialogue.music.crossfade;
  return tl.tension.reduce(
    (acc, s) => Math.max(acc, windowGain(t, s.start, s.end, xf, xf)),
    0,
  );
};

export const lineAt = (t: number, tl: Timeline = timeline) =>
  tl.lines.find((l) => t >= l.start && t <= l.end) ?? null;

/**
 * Is `speaker` producing sound at time t? Uses Edge TTS word timings when
 * available so mouths close in the gaps between words.
 */
export const isTalking = (speaker: SpeakerId, t: number, tl: Timeline = timeline) => {
  const line = lineAt(t, tl);
  if (!line || line.speaker !== speaker) return false;
  if (line.words.length === 0) return true;
  return line.words.some((w) => t >= w.start - 0.03 && t <= w.end + 0.03);
};

export const sceneAt = (t: number, tl: Timeline = timeline) =>
  tl.scenes.find((s) => t >= s.start && t < s.end) ?? tl.scenes[tl.scenes.length - 1];

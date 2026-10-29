# STROKE CODE — اليوم العالمي للسكتة الدماغية

A 120-second, 1080×1920 (9:16) cinematic pixel-art awareness film for World Stroke Day (29 October),
built with Remotion + React + TypeScript for the Emergency Medicine Club and the Student Council,
College of Medicine, Majmaah University.

- **Composition id:** `StrokeCode` — 3600 frames @ 30 fps
- **No human voices:** no dialogue, narration or TTS. Instrumental music and synthesised effects only.
- **Understandable with sound off:** all information is on screen (captions, labels, UI).

## Install

```bash
cd stroke-awareness-video
npm i
```

Node 20+ is required. Rendering uses Remotion's bundled Chrome Headless Shell and ffmpeg.

## Preview in the browser

```bash
npm run sc:preview          # opens Remotion Studio → choose "StrokeCode"
```

The Studio preview runs the same code as the export, frame for frame. To check layout safe zones,
set the `showSafeZones` prop to `true` in the Studio props panel.

## Export

```bash
npm run sc:render           # out/stroke-code-world-stroke-day.mp4        (H.264 + AAC 320 kbps)
npm run sc:render:muted     # out/stroke-code-world-stroke-day-muted.mp4  (H.264, no audio track)
npm run sc:qc               # verifies 120 s / 3600 frames / 1080×1920 / codecs / audio not silent
```

If a machine has fewer CPU cores, add `-- --concurrency=2`.

## Editing

| What | Where |
| --- | --- |
| Scene order and durations (must total 3600 frames — enforced at start-up) | `src/strokecode/data/timeline.ts` → `SCENE_DEFS` |
| Story beats (when the cup falls, when labels appear, …) in seconds | `src/strokecode/data/timeline.ts` → `BEATS` |
| All on-screen Arabic / English text | `src/strokecode/data/text.json` |
| Music cues, sound effects, volume levels | `src/strokecode/data/audio.ts` |
| Logos (files keep these names) | `public/logos/` |
| Characters | `src/strokecode/characters/` (`cast.tsx` = looks, `Person.tsx` = rig) |
| Sets | `src/strokecode/environments/` |
| Scenes | `src/strokecode/scenes/` |
| Regenerate the synthesised audio (needs `pip install numpy`) | `npm run sc:audio` |

Sounds and actions both read from `BEATS`, so moving a beat keeps picture and sound in sync.

## Structure

```
src/strokecode/
  compositions/StrokeCode.tsx   main 120 s composition, cross-fades, persistent logos + HUD
  scenes/                       S01–S05 (home), S06–S10 (hospital), family.tsx = shared poses
  characters/                   pixel rig, cast, father close-up, stretcher patient, props
  environments/                 living room, street, ED, resus bay, CT suite, reading room
  components/                   layout, logo header, HUD, captions, labels, bubbles, parallax stage
  animations/anim.ts            deterministic frame-based easing / keyframes
  audio/Score.tsx               music + SFX mixing
  data/                         timeline, text, audio config
  styles/                       palette, fonts
public/logos  public/sc/sfx  public/sc/music  public/fonts
```

See also `STROKE_CODE_ASSETS.md` (assets & licences) and `STROKE_CODE_QC.md` (quality-control report).

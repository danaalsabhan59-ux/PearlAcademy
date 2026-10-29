# STROKE CODE — Assets & Licensing Manifest

Every asset used by the `StrokeCode` composition, its origin and its licence.

## Official logos (supplied by the organisers)

| File | Organisation | Handling |
| --- | --- | --- |
| `public/logos/majmaah-university.jpg` | جامعة المجمعة — كلية الطب | Byte-identical copy of the supplied file (MD5 `9bf126cf…`). Shown complete, `object-fit: contain`, original aspect ratio, no recolouring or cropping. |
| `public/logos/emergency-medicine-club.jpg` | Emergency Club — نادي طب الطوارئ | Byte-identical copy (MD5 `edc5eb0e…`). Same handling. |
| `public/logos/student-council.jpg` | المجلس الطلابي — كلية الطب | Byte-identical copy (MD5 `9bfb76a4…`). Same handling. |

The supplied files are JPEGs with white / light backgrounds (no transparency), so they sit on white cards.
Use of the logos is under the authority of the organisers; they are not covered by any open licence.

## Fonts

| Font | Use | Licence | Source |
| --- | --- | --- | --- |
| Cairo (700, 800; Arabic + Latin subsets) | All Arabic text | SIL Open Font License 1.1 | `@fontsource/cairo` (npm) → `public/fonts/` |
| Press Start 2P (400) | English pixel labels | SIL Open Font License 1.1 | `@fontsource/press-start-2p` (npm) → `public/fonts/` |

## Pixel art, characters, environments, UI

All original, written as React/SVG code in `src/strokecode/` (characters, environments, components).
No third-party sprites, images or footage. The football on the TV is abstract original pixel animation (no broadcast).
The brain CT image is a **schematic illustration** drawn in code (`BrainIllustration`), labelled on screen as an illustration, not patient data.
The reference video was used only for style study; no frames, characters or assets were copied.

## Music and sound effects

All audio is **synthesised from scratch** (oscillators, filtered noise, envelopes, algorithmic reverb) by
`scripts/generate_sfx.py` and `scripts/generate_strokecode_audio.py`. No samples, no vocals, no speech, no TTS.

| File | Description |
| --- | --- |
| `public/sc/music/warm.mp3` | Warm D-major pad + felt-piano arpeggio (home evening) |
| `public/audio/music/tension.mp3` | Low drone, pulse and string-like swells (symptoms → call) |
| `public/sc/music/hospital.mp3` | A-minor 100 bpm pulse, urgent but controlled (hospital) |
| `public/sc/music/resolve.mp3` | Hopeful, serious resolution (end card) |
| `public/sc/sfx/ecg-beeps.mp3` | Monitor beeps under the opening ECG line |
| `public/sc/sfx/whoosh.mp3` | Transition swell |
| `public/sc/sfx/tv-ambience.mp3` | Distant crowd roar/claps from the TV (filtered noise — no voices) |
| `public/audio/sfx/cup-crash.mp3` | Ceramic coffee cup hitting the floor |
| `public/sc/sfx/clock-tick.mp3` | Clock ticking motif |
| `public/sc/sfx/ui-chime.mp3` | Soft bell for BE FAST / decision board |
| `public/audio/sfx/phone-call.mp3` | DTMF 9-9-7, ringback, pick-up click (no speech) |
| `public/audio/sfx/siren.mp3` | Approaching ambulance siren |
| `public/sc/sfx/monitor-alert.mp3` | Pre-alert monitor beeps |
| `public/sc/sfx/code-alert.mp3` | Non-vocal two-tone Code Stroke alert |
| `public/sc/sfx/monitor-beep.mp3` | Bedside monitor beeps |
| `public/sc/sfx/glucometer.mp3` | Glucometer double beep |
| `public/sc/sfx/ct-ambience.mp3` | CT room fan/hum, couch motor, gantry spin |
| `public/sc/sfx/final-hit.mp3` | Final cinematic low hit + shimmer |

## Software

| Package | Licence |
| --- | --- |
| Remotion | Remotion License — free for individuals, non-profits and companies up to 3 employees; larger organisations need a company licence. Student-club, non-commercial use typically qualifies for the free tier; confirm at remotion.dev/license. |
| React, TypeScript | MIT / Apache-2.0 |
| numpy (audio generation only) | BSD-3-Clause |

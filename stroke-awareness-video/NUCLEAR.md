# «الإشعاع النووي | هل يمكن أن يصل إلينا؟» — Emergency Medicine Club, Majmaah University

A scientific awareness documentary built in Remotion as code.
- **Format:** 120 s, 1080×1920, 30 fps, H.264 MP4.
- **Composition id:** `NuclearAwareness`.
- **Final file:** `out/nuclear/nuclear_radiation_awareness_EMC.mp4`.

## Commands

```bash
python3 scripts/generate_nuclear_voice.py      # Arabic narration (Edge TTS ar-SA-HamedNeural, +8%) + word timings
cd scripts && python3 generate_nuclear_ambience.py   # ambience bed aligned to the scenes (needs numpy)
npx remotion render NuclearAwareness out/nuclear/nuclear_radiation_awareness_EMC.mp4 \
  --codec=h264 --crf=14 --x264-preset=slow --image-format=png --pixel-format=yuv420p --audio-codec=aac
```

- **Studio:** open `NuclearAwareness` in Remotion Studio.
- **Header comparison:** set the `headerStyle` prop to `"plates"` to compare the optional white-plate header.

## Structure

The brief's folders are mapped onto Remotion's layout. Remotion serves assets from `public/`, so the asset folders live there.

| Brief | Here |
| --- | --- |
| `src/scenes/` | `src/nuclear/scenes/` (S1Question … S7Finale) |
| `src/components/` | `src/nuclear/components/`: PersistentInstitutionalHeader, Text (subtitles, keywords, tags), Earth, MapLayer, Callout, Icons |
| `src/animations/` | `src/nuclear/animations/`: procedural noise, procedural planet, fictional terrain map |
| `src/audio/` | `src/nuclear/audio/NuclearAudio.tsx` |
| `assets/logos/` | `public/nuclear/logos/` (+ `logos.json` with ratios) |
| `assets/fonts/` | `public/nuclear/fonts/` (IBM Plex Sans Arabic, SIL OFL) |
| `assets/sfx/` | `public/nuclear/sfx/` (+ `SOURCES.json`) |
| narration | `public/nuclear/voice/s1…s7.mp3` + `*.words.json` |
| `output/` | `out/nuclear/` |

**Timing:**
- Scene lengths follow the real narration: a lead-in, the voice, then a short tail (`src/nuclear/data/timeline.ts`).
- The total is enforced at exactly 3600 frames.
- On-screen keywords and subtitles are triggered by the spoken words' timings (`src/nuclear/data/words.ts`).
- Subtitles are whole phrases of at most 2 lines.

**Institutional header:** `PersistentInstitutionalHeader` is rendered once, outside every scene, above all layers and transitions, for all 3600 frames.
- **Order (right → left):** Majmaah University, Emergency Medicine Club, Student Council.
- **Treatment:** original files, original colours and proportions, with no glow or motion.

## Logos

| File | Source | Handling |
| --- | --- | --- |
| `majmaah-university.png` | Transparent PNG from the club's zip (`شعار كلية الطب.png`) | Fully transparent margin trimmed; resized to 900 px high |
| `student-council.png` | Transparent PNG from the club's zip (`شعار المجلس الطلابي.png`) | Same |
| `emergency-medicine-club.png` | The club's original JPEG supplied earlier (MD5 `edc5eb0e…`) | Empty white margin trimmed. The white background belongs to the original file. No transparent version was supplied. |

> The zip attached to this brief is byte-identical to the Basira zip (MD5 `a9aed4d8…`).
> It contains the **Basira** logo instead of the Emergency Medicine Club logo, so the Emergency Club logo comes from the earlier upload.
> A transparent PNG of the Emergency Club logo would make the header more uniform.

## Content safeguards

- **No place names:** no country is named, and the planet and the map are procedural and fictional. Labels say «منشأة نووية افتراضية» and «خريطة افتراضية توضيحية — لا تمثل حدثاً حقيقياً».
- **No explosion:** the facility damage is a hairline crack with symbolic particles seeping out. There are no sirens and no alarming music.
- **Honest labels on the particles:** they are labelled «الجسيمات الملوّنة تمثيل بصري فقط — الإشعاع لا يُرى».
- **No measurements:**
  - The survey meter shows abstract bars and the analysis screen shows an unlabeled curve.
  - The screen is labelled «شاشة توضيحية — لا تعرض قياسات حقيقية».
  - There are no numbers, no units, no dates and no alerts anywhere.
- **Official bodies:** they appear as text only, with no logos.
- **Disclaimer:** «محتوى توعوي افتراضي لا يشير إلى وجود خطر إشعاعي حالي.»

## Scientific review

Sources checked on 2026-11-06:
- **CDC Radiation Emergencies (cdc.gov) — reachable:**
  - It lists a nuclear power plant accident (which "could release radioactive material over an area") separately from a nuclear detonation.
  - It says fallout is "radioactive materials that can be carried long distances by the wind".
  - It says released radioactive materials can contaminate "air, water, surfaces, plants and soil".
  - It says that during an emergency people should "stay tuned" to official information.
- **NRRC (nrrc.gov.sa) — reachable:** the official name «هيئة الرقابة النووية والإشعاعية» is confirmed.
- **WHO (who.int):** reachable for general background only (ionizing radiation fact sheet).
- **IAEA (iaea.org):** the site refused automated access (HTTP 403).

**Not confirmed in the fetched pages:** these points are standard radiation-protection science but were not quoted from the pages above, so **human scientific review before publishing** is recommended:
- rain washing particles out of the air;
- dilution with distance;
- the weather and release factors;
- "deposition does not necessarily make drinking water or food unsafe".

## Audio

- **Narration:** Microsoft Edge neural TTS, voice `ar-SA-HamedNeural` (male, Modern Standard Arabic), rate +8% so the full, unshortened script fits 120 s. Voice is the loudest layer.
- **Ambience:** original, synthesised by `scripts/generate_nuclear_ambience.py`:
  - space drone with soft pulses;
  - distant hum;
  - wind;
  - rain;
  - flowing water;
  - lab room tone with gentle UI blips.
- **Transition sweeps:** softened Mixkit effects (Mixkit Sound Effects Free License), listed in `public/nuclear/sfx/SOURCES.json`.
- **Music:** none.

# الذكاء الاصطناعي في الطب | أدوات تغيّر طريقة تعلّمك — نادي بصيرة

## Vertical mobile version + poster (current deliverables)

| File | What |
| --- | --- |
| `out/basirah/basirah-ai-mobile.mp4` | Composition `BasiraMobile`: 1080×1920, 30 fps, 1800 frames (60 s). Sound effects only, with no music and no voices |
| `out/basirah/basirah-ai-poster.png` | Poster page 1 (the six tool sections), 1080×1920 (`BasiraPosterTools`) |
| `out/basirah/basirah-ai-poster-2-prompts.png` | Poster page 2 (ready-made prompts + responsible use) (`BasiraPosterPrompts`) |
| `out/basirah/*@2x.png` | Both pages at 2160×3840 |
| `out/basirah/basirah-ai-poster.pdf` | Both pages, lossless, 2160×3840 at 300 dpi |
| `out/basirah/basirah-ai-poster-source.zip` | Editable poster source (`src/basira/poster/`, shared theme, icons, logos, fonts) |

```bash
npm run basira:mobile:render   # vertical video (pass --browser-executable etc. after --)
npm run basira:poster          # poster PNGs (see src/basira/poster/README.md for 2× + PDF)
npm run basira:mobile:sfx      # regenerate the soft sound effects (needs numpy)
```

**Vertical layout** (`src/basira/mobile/`):
- **Top:** a small logo bar (y 160–246), then the tool name and tagline.
- **Middle:** the interactive panel (920×767).
- **Bottom:** one short benefit at a time.
- **Safe zones:** content stays inside x ≤ 990 and y ≤ 1560, clear of the Reels/TikTok caption area and icon rail.
- Set the `showSafeZones` prop to see the guides.

**Varied tool transitions:**
- **Morph:** card → chat window, infographic → lecture page, answer line → search bar.
- **3D flip:** NotebookLM, flashcards.
- **Iris:** Canva + Gamma.
- **Zoom-through:** clinical training.

**Motion details:**
- Letter-by-letter Arabic typing (grapheme-safe, letters stay joined) for the chat question and answers, the search query and the clinical dialogue.
- An opening PDF with highlighted lines.
- A search pointer that clicks a study.
- Flashcard flip.
- Lecture → slides → app.

**Tool logos:** the official logos supplied by the club are in `public/basira/tool-logos/`: ChatGPT, Claude, Perplexity, Elicit, Quizlet, Canva and Gamma.
- **Handling:** the files keep their original colours and proportions; only the transparent margins are trimmed.
- **Where they appear:** in the video's intro cards and tool header, and in the poster's section headings. They are rendered by `src/basira/components/ToolLogos.tsx`.
- **Plates:** dark logos sit on a white plate and the white Canva logo on a navy plate.
- **Missing logos:** NotebookLM and Anki keep their previous icon + name. The supplied `NotebookLM.png` contains only five white circles, not the NotebookLM logo, and no Anki logo was supplied. Add the correct files to `tool-logos/` and `logos.json`, then map them in `TOOL_MARKS`.

**Audio:** sound effects only, with no music and no voices.
- **Source:** professional recorded effects from **Mixkit** (`public/basira/audio/mixkit/`), used under the *Mixkit Sound Effects Free License*: free for commercial and non-commercial projects, with no attribution required.
- **Sources list:** `public/basira/audio/mixkit/SOURCES.json` gives each file's Mixkit ID, title and original URL.
- **Preparation:** each file has its leading silence trimmed, a short fade-out and peak normalisation.
- **Softened copies:** the video uses `public/basira/audio/mixkit-soft/`, with a gentle low-pass, a 10 ms fade-in and −4 dB. The cue list is sparse (27 quiet cues, with no repeats back-to-back), and the final mix is about −28 LUFS (+7 dB in `scripts/finish_basira_mobile.sh`).
- **Placement:** in `src/basira/mobile/MobileAudio.tsx`, each sound is placed so its peak lands on its visual event: whoosh/sweep on transitions, typing on typed text, paper on slides, page turn on the flashcard flip, a software sound when the PDF opens, a mouse click for the search pointer, a confirmation for correct answers, a check sound for steps, a UI zoom for the title, and a short intro-transition sweep for the closing logo.
- The earlier synthesised effects (`m-*.mp3`) are kept but no longer used.

---

## Original landscape version

A 60-second Arabic motion-graphics video (1920×1080, 30 fps, 1800 frames) for Basira Club,
built entirely in code with Remotion, React, TypeScript, SVG and CSS. The only external
assets are the three official logos.

- **Composition id:** `BasiraAI`
- **No voice-over.** Original electronic music and UI sound effects are synthesised in code.

## Commands

```bash
npm i
npm run basira:preview     # Remotion Studio → "BasiraAI"
npm run basira:render      # out/basira-ai-in-medicine.mp4 (PNG frames, x264 CRF 14 slow, AAC 320k, mastered to -14 LUFS)
npm run basira:audio       # regenerate music + sound effects (needs: pip install numpy)
```

Everything is bundled locally (fonts, logos, audio), so rendering works offline once
`npm i` has been run. To pass extra render flags, call `npx remotion render BasiraAI …`
directly, then `bash scripts/master_audio.sh out/basira-ai-in-medicine.mp4`.

## Scenes (frame-exact — `src/basira/data/timeline.ts`)

| # | Time | Scene | Frames |
| --- | --- | --- | --- |
| 1 | 00:00–00:05 | Intro: particles form a heart, title, eight tool cards | 0–149 |
| 2 | 00:05–00:13 | ChatGPT: chat → MCQ → OSCE → infographic | 150–389 |
| 3 | 00:13–00:21 | Claude + Claude Code: lecture → slides → interactive app | 390–629 |
| 4 | 00:21–00:29 | NotebookLM: PDFs → workspace → outputs + knowledge map | 630–869 |
| 5 | 00:29–00:36 | Perplexity + Elicit: search → papers → evidence table | 870–1079 |
| 6 | 00:36–00:43 | Anki + Quizlet: 3D flashcard flip → spaced-repetition calendar | 1080–1289 |
| 7 | 00:43–00:50 | Canva + Gamma: crowded slide → redesigned → three examples | 1290–1499 |
| 8 | 00:50–00:55 | AI clinical training: virtual patient + reasoning steps | 1500–1649 |
| 9 | 00:55–01:00 | Closing: tool network → message → Basira logo | 1650–1799 |

**Transitions are carried by elements.** One glass panel is shared by scenes 2–8 and
morphs from each scene's last element into the next scene's first element:
the ChatGPT card from the intro becomes the chat window, the infographic becomes the lecture
page, the answer line becomes the search bar, a table row becomes the flashcard, the calendar
becomes the slide, the poster becomes the patient card, and the panel finally collapses into
the network's centre node (`src/basira/data/layout.ts`).

## Editing

| What | Where |
| --- | --- |
| All on-screen text (Arabic + tool names) | `src/basira/data/text.json` |
| Scene durations (total enforced = 1800 frames) | `src/basira/data/timeline.ts` |
| Panel morph shapes between scenes | `src/basira/data/layout.ts` |
| Colours, font, animation helpers | `src/basira/theme.ts` |
| Logo bar, glass panel, Arabic kinetic text, side column | `src/basira/components/Frame.tsx` |
| Icons (SVG) | `src/basira/components/Icons.tsx` |
| Scene content | `src/basira/scenes/Scenes1.tsx`, `Scenes2.tsx` |
| Sound-effect cue sheet (frame-accurate) | `src/basira/audio/BasiraAudio.tsx` |

## Assets

| Asset | Source / licence |
| --- | --- |
| `public/basira/logos/*.png` | The organisers' official logos, resized to 900 px (proportions, colours and transparency unchanged). Shown on white plates in the top bar. |
| IBM Plex Sans Arabic | SIL Open Font License, via `@fontsource/ibm-plex-sans-arabic` |
| Music + sound effects | Original, synthesised by `scripts/generate_basira_audio.py`. No samples, no vocals. Free to publish. |
| Tool names | Shown as plain text with generic icons; no third-party logos are used. |

## Content notes

- The research scene uses **illustrative placeholder studies**, labelled on screen
  «بيانات توضيحية — ليست دراسات حقيقية». No real references or results are invented.
- The clinical scene is labelled «حالة تدريبية — ليست تشخيصًا طبيًا». The patient is fictional and
  has no personal data.
- Arabic is rendered right-to-left. Kinetic text animates whole words (never single letters),
  so letters stay joined, and English tool names are isolated with `<bdi>` so they don't
  change the sentence direction.

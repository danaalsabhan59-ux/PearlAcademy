# الذكاء الاصطناعي في الطب | أدوات تغيّر طريقة تعلّمك — نادي بصيرة

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

# basirah-ai-poster-source — «دليلك لأدوات الذكاء الاصطناعي في الطب»

Editable source of the two-page poster. It uses the same design system as the
vertical video (`BasiraMobile`): same background, colours, IBM Plex Sans Arabic,
glass cards, icons and official logos.

| File | What to edit |
| --- | --- |
| `poster.json` | All text: title, subtitle, the six tool sections, prompts, responsible-use note |
| `Poster.tsx` | Layout and styling (`PosterTools` = page 1, `PosterPrompts` = page 2) |
| `../theme.ts` | Colours and font (shared with the video) |
| `../components/Icons.tsx` | SVG icons (shared with the video) |

## Export (inside the Remotion project)

```bash
npx remotion still BasiraPosterTools   out/basirah/basirah-ai-poster.png              --image-format=png
npx remotion still BasiraPosterPrompts out/basirah/basirah-ai-poster-2-prompts.png    --image-format=png
npx remotion still BasiraPosterTools   out/basirah/basirah-ai-poster@2x.png           --image-format=png --scale=2
npx remotion still BasiraPosterPrompts out/basirah/basirah-ai-poster-2-prompts@2x.png --image-format=png --scale=2
```

The PDF is built from the 2× pages (lossless, 2160×3840 at 300 dpi) with `img2pdf`.

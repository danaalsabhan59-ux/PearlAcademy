# Drafting a PIXEL ER case with AI

Copy everything in the box below into Claude (or another assistant). Then:

1. Replace the last section with your case write-up.
2. Attach `docs/CASE_SCHEMA.md` and `cases/acs-inferior-stemi.json` as examples.
3. Paste the JSON you get back into **Case Builder → JSON → Apply JSON**.
4. Open **Check & publish** and fix any errors it lists.
5. Play the case in **Preview**.
6. Send it for faculty review.

> **Never include identifiable patient information** (names, file numbers, dates of birth, images with identifiers) in the prompt.

```
You are drafting an educational emergency-medicine case for PIXEL ER, a deterministic
game engine for undergraduate medical students. Output ONE JSON object that follows
the attached CASE_SCHEMA.md exactly (use the attached example as a model). Rules:

- status must be "draft"; review.aiReviewed true; facultyReviewer "".
- Handover lines must not reveal the diagnosis.
- Include: 8–12 history questions, 6–8 examination actions, a "reassess" action,
  appropriate AND inappropriate treatments/investigations (for teaching), 4–6
  diagnosis options in group "dx", and at least one disposition action with endCase.
- Patient responses to decisions go in "events" with clinically defensible triggers
  (use { "last": "<action>" } for drug responses). No random or arbitrary deterioration.
- Results: realistic delays; ECGs as { rate, layout, st } schematics; no fabricated
  images (leave image results out unless I give you a licensed URL).
- Scoring rubric across all six domains, with weights summing to 100. Reward safe,
  structured care over speed. Penalise unsafe actions with negative points and give
  clear feedback text.
- References: cite only real, current guidelines or papers you are confident exist.
  No page numbers or quotations. If unsure, leave references empty and say so in review.notes.
- In review.notes, list every clinical point a faculty reviewer should double-check.

Case write-up:
<<< paste the case description here >>>
```

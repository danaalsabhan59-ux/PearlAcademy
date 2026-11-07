# PIXEL ER case format (schemaVersion 1)

A case is one JSON object. The engine (`src/core.js`) interprets it, so adding a case never needs a code change.
`validateCase()` checks every rule below; the Case Builder runs it live, and `tests/engine.test.js` runs it on every file in `cases/`.

## Top level

| Field | Type | Notes |
|---|---|---|
| `schemaVersion` | `1` | |
| `id` | string | lowercase, `a-z0-9-_`. File name must be `<id>.json`. Also keys saved progress. |
| `title`, `tagline`, `category`, `difficulty` | string | |
| `durationMin`, `maxXP` | number | XP awarded = score% × maxXP |
| `objectives` | string[] | |
| `status` | `draft` · `ai_reviewed` · `faculty_review` · `faculty_approved` · `scheduled` · `published` · `archived` | `scheduled`/`published` require `review.facultyReviewer` |
| `review` | `{ lastReviewed, aiReviewed, facultyReviewer, notes }` | |
| `schedule` | `{ publishAt, closeAt }` | ISO date-times; live between them, archive after `closeAt` |
| `setting` | `{ timeLimitMin, scene }` | simulated minutes; `scene` is `resus` (only scene so far) |
| `patient` | `{ name, age, sex, sprite, chiefComplaint, background }` | sprite: `adult_m adult_f elder_m elder_f child` |
| `handover` | `{ by: "paramedic" \| "nurse", lines: string[] }` | never reveal the diagnosis |
| `initial` | `{ vitals, state, flags, monitorAttached }` | vitals: `hr sbp dbp rr spo2 temp gcs glucose` |
| `stateText` | `{ stable, improving, unchanged, deteriorating, critical }` | what *Reassess* reports |
| `actions` | Action[] | see below |
| `events` | Event[] | see below |
| `endings` | Ending[] | first match wins; last one should be unconditional |
| `scoring` | `{ weights, rubric }` | weights per domain must sum to 100 |
| `teaching` | `{ keyPoints: string[], pearls: string[] }` | |
| `references` | `{ text, url, date }[]` | only sources actually consulted |

## Action

```json
{ "id": "tx_fluids", "category": "treatment", "label": "0.9% saline 250 mL IV bolus", "time": 5,
  "requires": { "done": "tx_iv" }, "requiresText": "You need IV access first.",
  "response": "250 mL bolus running in.", "repeatable": true,
  "effects": { "flags": ["fluids"], "unflags": [], "vitals": { "sbp": 110 }, "state": "improving" },
  "result": { "type": "labs", "delay": 30, "labs": [{ "name": "Hb", "value": "14", "unit": "g/dL", "ref": "13–17", "flag": "" }], "text": "" },
  "group": "dx", "endCase": false, "station": "nurse", "speaker": "Nurse" }
```

* `category` → station: `history`, `exam`, `reassess` → patient · `treatment`, `procedure` → nurse / crash cart · `investigation`, `diagnosis`, `disposition` → workstation. `station` overrides it.
* `time` — simulated minutes the action takes. Results arrive `result.delay` minutes after ordering.
* Actions can be done once unless `repeatable` (reassess is repeatable by default). Actions sharing a `group` are mutually exclusive.
* `result.type`: `text` · `labs` · `ecg` (`{ rate, layout: "standard12"|"right", st: { lead: mm } }`; drawn as a labelled schematic) · `image` (`{ url, alt, credit, license }`; license required).
* `endCase: true` ends the case and picks an ending.

## Event

```json
{ "id": "ev_gtn_drop", "when": { "last": "tx_gtn" }, "delay": 2, "speaker": "Nurse",
  "message": "BP has dropped to 82/50…", "effects": { "vitals": { "sbp": 82, "dbp": 50 }, "state": "deteriorating", "flags": ["hypotension"], "endCase": false } }
```

Fires **once**, `delay` minutes after `when` first becomes true. This is how the patient responds to decisions. Every transition should have a clinically defensible reason.

## Conditions

Used by `requires`, `when`, `appliesIf`:

| Condition | True when |
|---|---|
| `{ "done": "a" }` / `{ "notDone": "a" }` | action a was / wasn't done |
| `{ "last": "a" }` | a is the most recent action (use for "response to this drug") |
| `{ "flag": "f" }` / `{ "noFlag": "f" }` | flag set / not set (`monitor`, `timeout` are built in) |
| `{ "before": ["a","b"] }` | a done, and b not done or done later |
| `{ "after": ["a","b"] }` | a done (again) after b |
| `{ "within": ["a", 10] }` | a done within 10 min of arrival |
| `{ "withinAfter": ["a","b", 15] }` | b done within 15 min after a |
| `{ "count": ["a", ">=", 2] }` | a done ≥ 2 times |
| `{ "vital": ["sbp", "<", 90] }` | current vital comparison |
| `{ "state": "critical" }` | current patient state |
| `{ "time": [">=", 30] }` | clock comparison |
| `{ "all": [...] }` · `{ "any": [...] }` · `{ "not": {...} }` | combinators |

## Scoring

Domains: `assessment reasoning investigations management safety reassessment` (default weights 20/20/15/25/15/5).

Rubric item: `{ id, domain, points, when, good, missed, countInMax?, appliesIf? }`.
* Positive points add to the domain's maximum. They are earned when `when` is true, otherwise `missed` is shown.
* Negative points are penalties, applied when `when` is true. `missed` is the feedback text.
* `countInMax: false` is for partial credit (e.g. a near-correct diagnosis).
* `appliesIf` is for items that only make sense on some paths (excluded from the maximum otherwise).
* Domain score = earned ÷ max, clamped 0–1, then weighted. Domains with nothing to score give their weight to the others.

The score depends only on the action log (`sim.S.history`), so a server can recompute it with `PXCore.replay(case, history).score()`.

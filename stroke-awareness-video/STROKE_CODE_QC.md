# STROKE CODE — Quality-Control Report

## Update — new score, official university logo, export quality

| Check | Result |
| --- | --- |
| Soundtrack | ✅ Original electronic score, 4 stems; measured tempo 127.7 BPM (target 127.2); no vocals |
| Energy curve | ✅ music RMS rises from −18.6 dB (intro) to −13.7 (home), −13.1 (signs and call) and −12.2 (CODE STROKE peak), holding to the end |
| CODE STROKE peak | ✅ strongest drum onset at 63.595 s (scene beat 63.6 s); level jumps +21 dB; the alert tone dominates its band (45 % of energy vs 7 % later) |
| Cup impact | ✅ music cuts 150 ms before impact; crash peak −0.2 dBFS vs groove peak −4.6 dBFS just before |
| Clock ticks / siren / alerts | ✅ ticks every second after the cup; siren band energy rises ×5 in the ambulance shots; all effects use their original `BEATS` timings |
| Loudness | ✅ −14.9 LUFS integrated, true peak −0.6 dBFS, no clipped samples |
| University logo | ✅ extracted from the official PDF (vector, not redrawn); every background pixel in the rendered PNG frames is exactly #FFFFFF; in the decoded H.264 file the mean is 254.98 (only a few pixels next to logo edges drop to 250–254 from H.264 colour compression) |
| All three logos visible | ✅ checked on 14 frames from 0 s to 119.96 s |
| Export | ✅ 1080×1920, 30 fps, 3600 frames, 120.000 s, H.264 High (CRF 12, x264 slow, lossless PNG frames instead of JPEG), AAC 320 kbps |
| Small Arabic text | ✅ role tags, notes and disclaimers raised to 30–34 px with higher contrast; wording unchanged |
| Timing / story / characters / medical text | ✅ unchanged (only audio, logo, font sizes and encoder settings were edited) |

Final files (rendered and verified in this environment):

- `out/stroke-code-world-stroke-day.mp4` (H.264 + AAC 320 kbps, ~25 MB)
- `out/stroke-code-world-stroke-day-muted.mp4` (the same video stream, no audio track)

`out/` is git-ignored. Rebuild with `npm run sc:render`, then `npm run sc:qc`.

## Technical checks (`npm run sc:qc` + ffmpeg analysis)

| Check | Result |
| --- | --- |
| Duration | ✅ 120.000 s |
| Frame count | ✅ 3600 (counted by decoding every frame) |
| Resolution / aspect | ✅ 1080 × 1920, 9:16 |
| Frame rate | ✅ 30 fps |
| Codecs | ✅ H.264 video, AAC audio; muted version has no audio track |
| Timeline integrity | ✅ 10 scenes, contiguous integer frame ranges, total enforced = 3600 at start-up (`timeline.ts`) |
| Black gaps | ✅ `blackdetect` (≥ 0.1 s) finds none; scene changes are 12-frame cross-dissolves |
| First / last frame | ✅ frame 0 = navy screen with the three logos; frame 3599 = full end card (TIME IS BRAIN, 997, logos) |
| Audio present | ✅ mean −21.7 dB, peak −3.3 dB; no second of the film peaks below −35 dBFS |
| Clock-tick motif | ✅ a tick transient every second from 22 s to 59 s (an earlier render had a 1-s dropout at a runtime loop seam; fixed by pre-rendering the looped beds) |
| Music cut on cup impact | ✅ level drops from about −20 dB to about −39 dB within 0.8 s of 21.8 s, leaving the impact and the ticking |
| Determinism | ✅ every animation is a pure function of the frame number (no timers, no `Math.random`) |

## Content checks

| Check | Result |
| --- | --- |
| Three official logos visible in every scene | ✅ persistent header, above all scenes and transitions (contact sheet: `docs/stroke-code-contact-sheet.jpg`) |
| Logos unaltered | ✅ byte-identical copies; `object-fit: contain`, original aspect ratio, no crop or recolour |
| Logos never overlap medical text, faces or actions | ✅ the header occupies its own band (y 40–236); the stage starts at y 586 |
| Title hierarchy | ✅ اليوم العالمي للسكتة الدماغية → STROKE CODE → كل دقيقة تفرق |
| Arabic rendering | ✅ Cairo font bundled locally; RTL containers; English terms in separate LTR elements; reviewed in stills from every scene, with no clipping or overlap |
| No human voices | ✅ no dialogue, narration or TTS; tones and filtered noise only (`scripts/generate_*`) |
| Understandable muted | ✅ every beat has an on-screen caption or label; speech failure is shown as broken, unreadable glyphs |
| Character consistency | ✅ one rig and one look per character (`cast.tsx`); all home shots read poses from one function (`family.tsx`) |
| Right-sided weakness | ✅ always the father's right side (viewer's left in front views): eyelid, mouth corner and nasolabial fold in the close-up; right hand drops the cup; right arm drifts in the arm test; right arm on the stretcher in the neuro exam |
| Every scene animated | ✅ ECG draw, camera moves, parallax, TV football, cup fall and break, arm raise and drift, smile attempt, phone dialling, ambulance drive-in, staff walking, stretcher transport, monitor waveforms, CT couch into the bore, rotating gantry light, scan sweep, decision board build |
| Safe zones | ✅ 60 px side margins; all text inside y 40–1780 (`showSafeZones` prop draws guides) |

## Medical accuracy review

The storyboard follows mainstream acute-stroke guidance (for example, AHA/ASA guidance on early management
of acute ischaemic stroke, and the BE FAST public-recognition aid). Points built in deliberately:

- Symptoms are **sudden** and one-sided; there is no seizure, collapse or cardiac arrest.
- BE FAST is shown as a recognition aid. Balance and Eyes are listed with Arabic explanations; only F/A/S are marked
  as observed. The caption «علامة واحدة تكفي» avoids implying that all signs must appear together.
- The family calls 997 immediately and gives **no food, water or medication** (stated on screen). The father
  does not walk or drive.
- Code Stroke is shown as a coordinated assessment pathway: an EMS pre-alert, a team assembling and CT readiness.
  There is no CPR or defibrillation.
- Assessment: ABCs + vital signs, **point-of-care glucose** (to exclude mimics), a focused neurological exam / NIHSS,
  and confirmation of **Last Known Well** (8:30 PM).
- **No invented clinical numbers**: the monitor shows waveforms and labels only, the glucometer shows "CHECKED",
  and the NIHSS card shows checked items with no score.
- Non-contrast CT is framed as excluding haemorrhage and guiding the decision; the CT image is a labelled **schematic
  illustration**, not a patient scan, and shows no findings. CTA is mentioned only "when large-vessel occlusion is
  suspected, per medical assessment".
- Treatment is limited to ischaemic stroke, as two pathways: IV thrombolysis "for eligible patients · after excluding
  haemorrhage" and mechanical thrombectomy "for selected cases · large-vessel occlusion". The safety caption states
  that treatment depends on stroke type, imaging, time and eligibility. No outcome is promised.

### Items to confirm with a clinical reviewer before publication

1. **Emergency number:** 997 (Saudi Red Crescent) is used throughout. 911 is the unified number in several regions.
   Confirm which number(s) the campaign should show.
2. Wording of «علامة واحدة تكفي» ("one sign is enough"): it is accurate as public advice to call, but confirm it suits the club's style.
3. NIHSS item labels are abbreviated in English (LOC, Gaze, Visual, Face, Arm, Leg, Ataxia, Sensory, Language,
   Dysarthria, Neglect). They are listed without scores.
4. The Arabic labels on the decision board («في السكتة الإقفارية (الجلطة)», «بعد استبعاد النزيف»,
   «انسداد وعاء دموي كبير») should be checked for preferred local terminology.

## Known limitations

- The logo files are JPEGs with built-in white margins, so each logo appears inside a white card at 196 px. Tighter
  crops would make them larger, but cropping was not permitted. Supplying transparent PNGs would allow a cleaner header.
- I checked the audio with level and spectral analysis, not by listening. Please give the mix a listen before publication.

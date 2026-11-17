# Emergency Medicine Club – Scientific Research Portfolio (2026–2027)

**Deliverables:**
- `EM_Club_Research_Portfolio_2026-2027_Condensed.pdf` – condensed edition (18 pages, one page per proposal; build with `python3 src/build_brief.py`)
- `EM_Club_Research_Portfolio_2026-2027.pdf` – full edition (81 pages)

14 evidence-based research proposals for the Emergency Medicine Club, Majmaah University – College of Medicine, prepared for the Faculty Supervisor. Contents:

1. Scientific exploration and research-gap identification (global, Saudi, Majmaah)
2. 14 proposals, each with the same 17 sections and a ruled area for the supervisor's comments
3. Prioritisation matrix (10 criteria, each scored 1–5) and the top five projects
4. Implementation roadmap: approval (IRB) pathway, team roles, 12-month timeline, milestones
5. Quality-control review and the portfolio's limitations
6. Consolidated list of verified references, with clickable DOI and PubMed links
7. Overall supervisor feedback and research-selection pages

## Rebuilding the PDF

```bash
cd research-portfolio/src
python3 build.py            # writes ../EM_Club_Research_Portfolio_2026-2027.pdf
```

Requires `reportlab` and the Caladea/Carlito fonts (`fonts-crosextra-caladea`, `fonts-crosextra-carlito`).

- `src/refs.py` – reference database. Entries that could not be fully verified carry a `note`.
- `src/proposals_a.py`, `src/proposals_b.py` – proposal content. Write citations as `[n]`, indexed into each proposal's `refs` list. The build renumbers them in order of first appearance.
- `src/sections.py` – exploration, prioritisation scores, roadmap and quality-control content.
- `src/build.py` – layout: cover, header and footer, table of contents, bookmarks and supervisor boxes.

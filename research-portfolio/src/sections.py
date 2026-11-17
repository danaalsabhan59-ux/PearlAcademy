# -*- coding: utf-8 -*-
"""Front- and back-matter content: exploration (Phase 1), prioritisation
(Phase 4), implementation roadmap (Phase 5) and quality control (Phase 7)."""

PREFACE = [
    "This portfolio presents fourteen research proposals developed for the Emergency Medicine Club of the College of Medicine, Majmaah University, for the academic year 2026-2027. It is intended to support the Faculty Supervisor in selecting a small number of projects for student-led research, and to give student teams a methodologically sound starting point.",
    "The work followed a staged process: (1) scientific exploration of the global, Saudi and regional research landscape to identify genuine gaps; (2) development of fourteen proposals using an identical seventeen-part structure; (3) prioritisation using a transparent scoring matrix; (4) an implementation roadmap; and (5) a scientific and editorial quality-control review. Every proposal ends with a dedicated space for the Faculty Supervisor's handwritten comments, and a final section is provided for overall feedback and project selection.",
    "<b>Important distinction.</b> Statements in the <i>Background</i> and <i>Research Gap</i> sections are supported by cited, verified literature. Research questions, objectives, methods, sample-size estimates and feasibility judgements are <i>proposals</i> by the author of this portfolio and must be refined by each team with its supervisor and a biostatistician. Expected outcomes are described as possibilities, not established facts.",
    "<b>Data-protection principle.</b> No student should access medical records, collect identifiable patient data, or approach patients for any project before written approval from the relevant Research Ethics Committee/Institutional Review Board and the participating institution has been obtained.",
]

EXPLORATION_METHOD = [
    "The exploration aimed to identify problems that are (a) important to emergency care, (b) supported by published evidence, (c) not already answered in the Saudi or Majmaah context, and (d) realistically researchable by undergraduate students within one academic year.",
    "Sources prioritised were PubMed/MEDLINE and PubMed Central records, publisher pages of peer-reviewed journals, Cochrane-style systematic reviews, WHO publications, Saudi Vision 2030 programme documents, and Saudi journals (e.g., Saudi Medical Journal, Saudi Journal of Emergency Medicine). Literature from approximately the last seven years was prioritised, while landmark studies and guidelines (e.g., PECARN 2009, Sepsis-3 2016) were retained where they define current practice.",
]

ACCESS_DISCLOSURE = (
    "<b>Disclosure of database access.</b> During preparation (November 2026) the working environment did not permit direct programmatic access to the PubMed E-utilities or Crossref APIs, and subscription databases (Scopus, Web of Science, Embase) were not accessible. Literature was therefore identified and verified through web searches that retrieved PubMed/PMC records, DOAJ entries, publisher pages and institutional repositories. Each reference was checked for title, authors, journal, year and DOI/PMID; any element that could not be confirmed is explicitly flagged in the reference list rather than guessed. Teams should re-run structured searches in PubMed, Scopus and Web of Science (available through the Saudi Digital Library) before finalising protocols, particularly to confirm the gaps marked as 'to be confirmed by formal search'."
)

GLOBAL_LANDSCAPE = [
    ("Emergency department crowding and flow",
     "Systematic reviews identify non-urgent visits, inpatient boarding and bed shortages as major studied causes of crowding, with well-established adverse consequences for patients (Hoot and Aronsky, 2008; Morley et al., 2018). Boarding duration has been associated with higher mortality (Singer et al., 2011)."),
    ("Time-critical cardiovascular and neurological emergencies",
     "Bystander CPR before EMS arrival is associated with higher 30-day survival after OHCA (Hasselqvist-Ax et al., 2015). Stroke remained the second-leading cause of death worldwide in 2019 (GBD 2019 Stroke Collaborators, 2021), and patient delay is a key barrier to reperfusion (Moser et al., 2006)."),
    ("Sepsis and early risk stratification",
     "Sepsis accounted for an estimated 11.0 million deaths in 2017 (Rudd et al., 2020). The best bedside tool for early ED risk stratification remains debated (Freund et al., 2017; Evans et al., 2021)."),
    ("Trauma and injury prevention",
     "WHO calls for strengthened road-safety data and prevention, including restraint use (WHO, 2023). In paediatric head trauma, validated decision rules can reduce unnecessary CT and radiation (Kuppermann et al., 2009; Pearce et al., 2012)."),
    ("Workforce, education and patient safety",
     "Burnout is common among emergency physicians (Zhang et al., 2020). Simulation-based education improves knowledge and skills (Cook et al., 2011), and ED return visits are widely used as a safety indicator (Rising et al., 2014)."),
    ("Artificial intelligence and digital health",
     "Large language models are being evaluated for triage; current evidence suggests promising recognition of high-acuity cases but a tendency to over-triage and performance below trained professionals (Masanneck et al., 2024; Arslan et al., 2025)."),
]

SAUDI_LANDSCAPE = [
    ("Health system transformation",
     "Vision 2030's Health Sector Transformation Program prioritises restructuring, digitalisation and improved access to care, providing a policy context for EMS, ED efficiency and digital-health research."),
    ("Out-of-hospital cardiac arrest",
     "The Saudi OHCA registry (SOHAR) reported 3,671 cases in 2019-2022, with 82.6% at home and survival to discharge of 2.9% (Alabdali et al., 2024)."),
    ("ED utilisation and length of stay",
     "A national analysis of 1.57 million ED visits identified predictors of prolonged length of stay (Alharbi et al., 2023). Single-centre studies report a high proportion of non-urgent visits (Al-Otmy et al., 2020)."),
    ("Prehospital care and EMS awareness",
     "About two-thirds of adults in a 2022 national survey were aware of the EMS number; app-based requests were less frequently answered within 8 minutes (Aljabri and Albinali, 2022). In stroke, not using an ambulance and living outside Riyadh city were associated with late arrival (Al Khathaami et al., 2018)."),
    ("Trauma",
     "A systematic review highlighted inconsistent road-traffic data and recommended regional hospital-based sentinel surveillance (Mansuri et al., 2015)."),
    ("Workforce and education",
     "Saudi ED burnout studies are mostly single-region or resident-focused (Alqahtani et al., 2019; Jamjoom et al., 2024); disaster simulation for medical students has been evaluated in small pre-post studies (Doumi et al., 2024)."),
]

REGIONAL_LANDSCAPE = [
    "Two local studies were identified and deliberately <b>not duplicated</b>: a 2023 survey of BLS awareness among the general population of the Al-Majma'ah region (Almutairi et al., 2023) and a 2025 survey of stroke risk-factor and warning-sign knowledge among rural Majmaah residents (Al-Maymuni and Sirajudeen, 2025). Instead, Proposals 1 and 12 build on these findings by testing an intervention (objective CPR performance) and measuring real-world behaviour (actual stroke prehospital delay).",
    "Majmaah is a non-metropolitan governorate on a major highway corridor north of Riyadh with surrounding rural communities. This context motivates regional projects on road traffic injuries, rural EMS awareness, prehospital stroke delay, heat-related illness among outdoor workers and the operational performance of regional (secondary) EDs, where most published Saudi data come from tertiary centres.",
]

# Gap summary rows: (No., short topic, what is known, what remains unknown, gap level, evidence status)
GAP_TABLE = [
    (1, "Lay CPR/AED training", "Local CPR knowledge gaps documented (2023)", "Objective skill gain and 3-month retention after brief training", "Local", "Literature-supported; confirm"),
    (2, "Heat illness in outdoor workers", "Saudi KAP data in pilgrims/military", "KAP of civilian outdoor workers in Majmaah", "Local", "Proposed opportunity"),
    (3, "Simulation vs. case-based teaching", "Simulation > no intervention", "Head-to-head RCT in Saudi students", "Global + local", "Literature-supported"),
    (4, "Disaster triage preparedness", "Small single-site pre-post data", "Multicentre objective triage competence", "National", "Literature-supported; confirm"),
    (5, "997 and Asefny awareness", "Pandemic-period national survey", "Post-pandemic urban-rural comparison, barriers", "National", "Literature-supported"),
    (6, "ED staff burnout", "Single-region / resident studies", "Multicentre physicians + nurses; operational correlates", "National", "Literature-supported"),
    (7, "Non-urgent ED visits (SR)", "Several single-centre estimates", "Pooled, quality-appraised national estimate", "National", "Confirm in PROSPERO"),
    (8, "ED length of stay and boarding", "National aggregate; tertiary data", "Patient-level data from regional hospitals", "Regional", "Literature-supported"),
    (9, "Sepsis triage scores", "International and tertiary Saudi data", "qSOFA vs. NEWS2 vs. SIRS in regional EDs", "National / regional", "Literature-supported"),
    (10, "Paediatric head CT and PECARN", "PECARN validated; regional over-use", "Actual PECARN adherence in Riyadh Region", "National / regional", "Literature-supported; confirm"),
    (11, "Road traffic injuries", "Tertiary-centre data; call for sentinel data", "Injury profile and restraint use near Majmaah", "Regional", "Supported by published recommendation"),
    (12, "Stroke prehospital delay", "Riyadh city delay data; local knowledge gaps", "Actual delays from non-metropolitan areas", "Regional", "Literature-supported"),
    (13, "72-hour return visits", "Frequency and broad causes in tertiary centres", "Structured preventability review, regional ED", "Regional", "Literature-supported"),
    (14, "LLM triage (CTAS)", "LLM triage with MTS/ESI; small Saudi study", "CTAS vignettes; LLMs vs. nurses vs. interns; Arabic", "Global + national", "Literature-supported"),
]

NOT_SELECTED = [
    ("Another community CPR or stroke-awareness survey in Majmaah", "Already published locally (2023 and 2025); converted into an intervention study (Proposal 1) and a patient-level delay study (Proposal 12)."),
    ("Analysis of the national OHCA registry (SOHAR) or SRCA dispatch data", "Scientifically valuable but requires data-sharing agreements beyond student access. Feasible alternative: collaborate with registry investigators, or use Proposal 5 to study the public side of EMS activation."),
    ("Point-of-care ultrasound diagnostic accuracy study", "Requires credentialed sonographers and prospective patient recruitment; better suited to residents. Alternative: a student-led systematic review of POCUS accuracy for a specific ED indication."),
    ("Prehospital delay in acute coronary syndrome", "Would substantially overlap with Proposal 12 in methods and population; the stroke study was preferred because of an identified local knowledge gap."),
    ("Mobile stroke unit or tele-stroke evaluation", "Requires infrastructure not currently available to the club; may be revisited if a regional programme is established."),
]

# --- Prioritisation (Phase 4) ---------------------------------------------
CRITERIA = [
    ("SIG", "Scientific significance", "5 = addresses a major clinical or public-health problem with clear potential to change practice or policy; 1 = marginal relevance."),
    ("NOV", "Novelty / research gap", "5 = clearly documented gap at the relevant level; 1 = question already well answered."),
    ("FEA", "Feasibility for medical students", "5 = students can perform all core tasks with standard supervision; 1 = requires specialised clinical skills or resources."),
    ("CST", "Estimated cost", "5 = negligible cost; 1 = substantial funding required."),
    ("TIM", "Time required", "5 = can be completed within 6 months; 1 = more than 15 months."),
    ("ACC", "Access to participants or data", "5 = participants/data directly accessible; 1 = depends on external institutions with uncertain access."),
    ("ETH", "Ethical and administrative complexity", "5 = minimal (anonymous survey or published data); 1 = multiple IRBs, record access or vulnerable participants."),
    ("PUB", "Publication potential", "5 = likely of interest to indexed international journals; 1 = limited."),
    ("KSA", "Relevance to Saudi Arabia", "5 = directly addresses national priorities or local burden; 1 = limited local relevance."),
    ("CLB", "Suitability for the EM Club", "5 = strong EM focus, engages many members, builds core skills; 1 = weak fit."),
]

# scores in criteria order: SIG NOV FEA CST TIM ACC ETH PUB KSA CLB
SCORES = {
    1: [4, 4, 5, 4, 4, 5, 5, 4, 5, 5],
    2: [4, 4, 4, 5, 5, 3, 4, 3, 5, 3],
    3: [4, 3, 4, 3, 3, 5, 4, 4, 3, 5],
    4: [4, 3, 4, 5, 4, 3, 4, 4, 5, 4],
    5: [4, 4, 4, 5, 4, 4, 5, 4, 5, 4],
    6: [4, 3, 3, 5, 4, 3, 3, 4, 4, 3],
    7: [4, 4, 5, 5, 4, 5, 5, 4, 5, 4],
    8: [4, 3, 3, 4, 3, 2, 2, 4, 4, 3],
    9: [5, 3, 3, 4, 3, 2, 2, 4, 4, 4],
    10: [4, 4, 3, 4, 3, 2, 2, 4, 4, 4],
    11: [5, 3, 3, 4, 3, 2, 2, 4, 5, 4],
    12: [5, 4, 2, 4, 2, 2, 2, 4, 5, 4],
    13: [4, 3, 3, 4, 3, 2, 2, 3, 4, 3],
    14: [4, 5, 4, 5, 4, 4, 4, 5, 4, 5],
}


def priority(total):
    if total >= 40:
        return "High"
    if total >= 34:
        return "Moderate"
    return "Lower"


TOP5 = [
    (1, "Hands-only CPR and AED training (quasi-experimental)",
     "Highest combined score; objective outcomes; builds directly on a published Majmaah survey; immediate community benefit; engages many club members as trainers and assessors."),
    (7, "Non-urgent ED visits in Saudi Arabia (systematic review)",
     "No patient contact or IRB complexity; teaches evidence-synthesis skills; strong publication potential; can start immediately while other approvals are pending."),
    (14, "LLMs vs. clinicians for CTAS triage (vignette study)",
     "Highly novel and timely; no patient data; low cost; strong publication interest; develops AI literacy."),
    (5, "Awareness and use of 997 and Asefny (national survey)",
     "National relevance; urban-rural comparison important for the Majmaah region; low cost; results useful for public-awareness campaigns."),
    (4, "Disaster and mass-casualty triage preparedness (multicentre survey)",
     "National relevance in a mass-gathering country; objective vignette outcome; creates an inter-university collaboration network. Ranked above Proposal 2 (equal total score) because of higher club suitability and collaboration value."),
]

PRIORITY_NOTES = [
    "Scores are the author's structured judgement based on the evidence and feasibility analysis in each proposal; they are intended to support, not replace, the Faculty Supervisor's decision. Cost, time and ethical complexity are scored so that a higher score is always more favourable, allowing a simple unweighted total out of 50.",
    "Classification: <b>High priority</b> = total 40-50; <b>Moderate priority</b> = 34-39; <b>Lower priority</b> = 33 or below. 'Lower priority' reflects lower feasibility for a first student project (mainly due to hospital record access and approvals), <b>not</b> lower scientific value.",
    "<b>Recommendation for clinical research:</b> none of the hospital-based clinical projects (Proposals 8-13) appears in the top five, because each depends on hospital IRB approval and record access. It is nevertheless recommended that the club select one clinical 'flagship' project - Proposal 11 (road traffic injuries) is the highest-scoring - and begin the approval process early, in parallel with the top-five projects, so that clinical research capacity is developed.",
]

# --- Implementation roadmap (Phase 5) -------------------------------------
SELECTION_STEPS = [
    "<b>Supervisor review (Weeks 1-2):</b> The Faculty Supervisor reviews this portfolio, records comments on each proposal and completes the final selection section.",
    "<b>Selection meeting (Week 3):</b> Club board and supervisor agree on 3-5 projects, balancing the top-five ranking with at least one clinical project and the availability of faculty co-supervisors.",
    "<b>Co-supervisor matching (Week 3-4):</b> Each selected project is assigned a content-expert faculty co-supervisor (e.g., EM, paediatrics, neurology, community medicine, medical education).",
    "<b>Feasibility confirmation (Week 4):</b> For hospital-based projects, an informal enquiry to the hospital research office confirms data availability before investing in a full protocol.",
]

RECRUIT_STEPS = [
    "Open call to all club members with a short application (motivation, year, previous research, available hours per week, preferred project).",
    "Selection criteria: commitment, mix of academic years (senior students for leadership; junior students for continuity), and complementary skills (writing, statistics, data collection, design).",
    "Each team signs a short team charter: roles, expected hours, authorship criteria (ICMJE), communication channels and deadlines.",
]

TEAM_ROLES = [
    ("Faculty Research Supervisor", "1 (+1 content co-supervisor)", "Scientific oversight; approves protocol and tools; signs ethics applications; ensures integrity and safety; final manuscript approval."),
    ("Student Research Lead", "1", "Coordinates the team; maintains timeline and documentation; main contact with supervisor and ethics office; drafts protocol and manuscript sections."),
    ("Literature Review Team", "2-3", "Structured searches, reference management (Zotero/EndNote), evidence tables, introduction and discussion drafting."),
    ("Data Collection Team", "3-6", "Recruitment, consent, questionnaire administration or approved record extraction; data-quality checks; adherence to confidentiality."),
    ("Statistical Analysis Support", "1-2 students + biostatistician", "Data cleaning, analysis plan execution under biostatistician guidance (SPSS/R/Jamovi), tables and figures."),
    ("Biostatistician (consultant)", "1 (shared)", "Confirms sample size and analysis plan before ethics submission; reviews results."),
]

TRAINING = [
    "Research ethics and Good Clinical Practice (e.g., an accredited online GCP or human-subjects research course; certificates are commonly requested by ethics committees).",
    "Literature searching and reference management (PubMed, Saudi Digital Library, Zotero/EndNote).",
    "Study design and critical appraisal basics; reporting guidelines (STROBE, CONSORT, STARD, PRISMA).",
    "Questionnaire design, translation and validation; data-collection standard operating procedures.",
    "Data management and confidentiality (de-identification, secure storage, password protection).",
    "Introductory statistics with SPSS, R or Jamovi; project-specific training (e.g., BLS instructor certification for Proposal 1; AIS/ISS coding for Proposal 11; PECARN application for Proposal 10).",
]

IRB_STEPS = [
    ("1", "Protocol finalisation", "Complete protocol, tools, consent forms (Arabic/English), data-management plan, biostatistician sign-off."),
    ("2", "Departmental/scientific review", "Supervisor and department (or college research unit) review for scientific merit."),
    ("3", "University ethics submission", "Submit to the Majmaah University Research Ethics Committee with GCP certificates and supervisor endorsement."),
    ("4", "Institutional approvals", "For Ministry of Health hospitals: submission to the relevant MOH/health-cluster IRB and hospital administration; for other universities: local approval or facilitation letters."),
    ("5", "Registration (where applicable)", "Register trials (Proposal 3) in a recognised registry; register the systematic review (Proposal 7) in PROSPERO."),
    ("6", "Start of data collection", "Only after all written approvals are received and filed. Any protocol change requires an amendment approval."),
]

# Gantt: (task, start_month, end_month) with months 1..12
GANTT = [
    ("Project selection and team formation", 1, 1),
    ("Training (GCP, methods, tools)", 1, 2),
    ("Literature review and protocol writing", 1, 3),
    ("Tool development, translation, pilot", 2, 3),
    ("Ethics/IRB submission and approval", 3, 5),
    ("Data collection", 5, 8),
    ("Data cleaning and analysis", 8, 9),
    ("Abstract and poster preparation", 9, 10),
    ("Manuscript writing and internal review", 9, 11),
    ("Journal submission and dissemination", 11, 12),
]

MILESTONES = [
    ("M1", "Month 1", "Teams formed; team charters signed", "Team list; charter; project folder"),
    ("M2", "Month 2", "Training completed", "GCP certificates; search strategy"),
    ("M3", "Month 3", "Protocol approved by supervisor and biostatistician", "Final protocol; tools; consent forms"),
    ("M4", "Month 5", "Ethics/IRB approval obtained", "Approval letters filed"),
    ("M5", "Month 8", "Data collection completed", "Locked, de-identified dataset; data log"),
    ("M6", "Month 9", "Analysis completed", "Results tables and figures"),
    ("M7", "Month 10", "Abstract submitted to a conference", "Abstract; poster"),
    ("M8", "Month 12", "Manuscript submitted to a peer-reviewed journal", "Submitted manuscript; final report to supervisor"),
]

SAMPLE_TIMELINE_P1 = [
    ("Weeks 1-4", "Form team (lead, 2 literature, 5 trainers/assessors, 1 analysis); BLS instructor refreshers; literature review."),
    ("Weeks 5-8", "Write protocol; adapt questionnaire; confirm feedback manikins; biostatistician review."),
    ("Weeks 9-14", "Ethics submission and approval; college recruitment permissions."),
    ("Weeks 15-18", "Recruitment; baseline test, training and immediate post-test sessions."),
    ("Weeks 19-30", "Three-month retention testing (rolling); data entry and cleaning."),
    ("Weeks 31-36", "Analysis; abstract submission; manuscript drafting."),
    ("Weeks 37-40", "Supervisor review; journal submission; report to club and university."),
]

QC_CHECKS = [
    ("Are all 14 proposals genuine research opportunities?", "Yes. Each gap was checked against published literature; two topics already studied in Majmaah were redesigned to avoid duplication.", "Gaps not fully confirmable by web search are labelled 'confirm by formal search'."),
    ("Are the research questions clear?", "Yes. One focused question per proposal, structured with PICO/PECO or an appropriate framework.", "-"),
    ("Are the objectives measurable?", "Yes. Primary objectives specify a measurable outcome; 3-4 secondary objectives each.", "-"),
    ("Is the study design appropriate?", "Yes. Designs include RCT, quasi-experimental, retrospective cohort, prospective cross-sectional, diagnostic accuracy and systematic review; rationale given for each.", "Cross-sectional design used only where prevalence/association is the aim."),
    ("Is the methodology realistic for medical students?", "Yes, with supervision. Clinical judgement tasks (e.g., preventability, reference standards) are assigned to qualified physicians.", "Hospital-based projects flagged as approval-dependent."),
    ("Are research gaps supported by literature?", "Yes, with explicit distinction between literature-supported gaps and proposed local opportunities.", "-"),
    ("Are Saudi-specific claims sourced?", "Yes. Saudi statistics are quoted only from verified sources (e.g., SOHAR, Ada'a analysis).", "Unverifiable figures were removed."),
    ("Are references authentic and verifiable?", "Yes. All 54 references verified for title, authors, journal, year and DOI/PMID/URL.", "Three entries carry notes where an element (DOI or full author list) could not be confirmed."),
    ("Are there unnecessary duplicates?", "No. Overlapping ideas (ACS delay, repeat KAP surveys) were excluded.", "-"),
    ("Are ethical considerations adequate?", "Yes. Each proposal specifies approvals, consent, confidentiality, risks and special considerations.", "-"),
    ("Are the proposals sufficiently diverse?", "Yes. Topics span resuscitation, environmental emergencies, education, preparedness, EMS, workforce, crowding, sepsis, paediatrics, trauma, stroke, patient safety and AI.", "-"),
    ("Does every proposal include supervisor comment lines?", "Yes. Seven full-width ruled lines plus decision boxes under each proposal.", "-"),
    ("Is the PDF readable and professionally formatted?", "Checked by rendering every page to images and reviewing layout.", "-"),
    ("Are all hyperlinks functional?", "DOI links use the standard https://doi.org resolver; table of contents and bookmarks are internal links.", "Links depend on publisher availability."),
    ("Are tables and text aligned with no cut-off content?", "Checked visually on rendered pages; tables wrap text within cells.", "-"),
]

PORTFOLIO_LIMITATIONS = [
    "Literature identification relied on web-search retrieval of PubMed/PMC, DOAJ and publisher records because direct API and subscription database access was unavailable; some relevant studies (particularly in non-indexed Saudi journals or recent publications) may have been missed.",
    "Research gaps marked 'confirm by formal search' should be checked with a reproducible search strategy before protocol submission.",
    "Sample-size estimates are preliminary and rely on stated assumptions; they must be recalculated by a biostatistician using pilot or published data.",
    "Feasibility judgements (e.g., access to hospital records, availability of manikins or simulators) are based on typical arrangements and must be confirmed locally.",
    "Prioritisation scores involve judgement; the Faculty Supervisor may weight criteria differently.",
]

FEEDBACK_SECTIONS = [
    ("General Comments", 9),
    ("Suggested Modifications to the Portfolio", 9),
    ("Final Recommendations", 8),
]

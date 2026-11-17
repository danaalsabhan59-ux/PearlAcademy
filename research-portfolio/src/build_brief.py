# -*- coding: utf-8 -*-
"""Condensed (one page per proposal) edition of the research portfolio.

Usage:  python3 build_brief.py [output.pdf]
"""
import os
import sys

from reportlab.lib.units import cm
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import NextPageTemplate, PageBreak, Spacer, Table, TableStyle

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build as B  # noqa: E402
import sections as S  # noqa: E402

B.COVER_TAGLINE = "Condensed edition • One page per proposal • Priority ranking"
B.COVER_DOC = "Condensed proposals for supervisor review and selection"

# Short texts. [n] refers to the 'refs' list of each entry (verified sources in refs.py).
BRIEF = {
    1: dict(
        bg="Bystander CPR before EMS arrival is associated with higher survival after out-of-hospital cardiac arrest [1]. In the Saudi national registry (SOHAR, 2019-2022), 82.6% of arrests occurred at home and survival to discharge was 2.9% [2].",
        gap="A 2023 Majmaah survey documented gaps in BLS knowledge and confidence [3], but objective, manikin-measured CPR skill gain and three-month retention after brief training have not been assessed locally.",
        methods="Non-health students and staff (target 70-80). Feedback-manikin CPR and AED testing before, immediately after and 3 months after a 45-minute session.",
        refs=["hasselqvist2015", "sohar2024", "almutairi2023"]),
    2: dict(
        bg="Reported ICU mortality is 26.5% in exertional and 63.2% in classic heatstroke [1]. Saudi heat-illness research has focused mainly on Hajj pilgrims and military personnel [2].",
        gap="No published study of heat-illness knowledge and practices among civilian outdoor workers in Majmaah was identified (proposed local opportunity; confirm by formal search).",
        methods="Interviewer-administered multilingual questionnaire at worksites, with employer permission (target about 420 workers).",
        refs=["bouchama2022", "aljohani2023"]),
    3: dict(
        bg="Technology-enhanced simulation has large effects on knowledge and skills compared with no intervention [1]. Evidence comparing simulation with active teaching methods is smaller and heterogeneous [2].",
        gap="No randomised comparison of simulation and case-based teaching for acute emergencies among Saudi medical students was identified.",
        methods="Clinical-year students randomised 1:1 (about 50 per arm), same content and time in both arms; blinded OSCE at 1 and 8 weeks.",
        refs=["cook2011", "mcgaghie2011"]),
    4: dict(
        bg="Saudi Arabia hosts very large mass gatherings such as Hajj, which require extensive health preparedness [1]. In a small Saudi pre-post study of 32 medical students, disaster simulation raised self-reported confidence from 40.7% to 59.4% [2].",
        gap="No multicentre assessment of objective mass-casualty triage competence among Saudi final-year students and interns was identified.",
        methods="Online survey with START-based triage vignettes across at least six medical colleges (target 600-650 respondents).",
        refs=["memish2014", "doumi2024"]),
    5: dict(
        bg="In a 2022 national survey, 66% of adults knew the EMS number; ambulances arrived within 8 minutes for 53.6% of 997 calls versus 35.5% of Asefny requests [1]. Not arriving by ambulance and living outside Riyadh city were linked to late stroke arrival [2].",
        gap="No post-pandemic national study comparing urban and rural awareness and use of 997 and Asefny, including barriers to calling, was identified.",
        methods="Mixed-mode survey (online plus field collection in rural areas) with regional and urban-rural quotas (target about 820 adults).",
        refs=["aljabri2022", "alkhathaami2018", "althumairi2020"]),
    6: dict(
        bg="About 40% of emergency physicians experience high emotional exhaustion and depersonalisation [1]. In the Aseer region, 88.7% of ED physicians and nurses had high emotional exhaustion [2].",
        gap="Saudi studies are mostly single-region or limited to residents [2, 3]; multicentre data covering physicians and nurses, and operational drivers such as boarding, are lacking.",
        methods="Anonymous online Copenhagen Burnout Inventory survey across 8-10 EDs in several regions (target 500-600 staff).",
        refs=["zhang2020", "alqahtani2019", "jamjoom2024"]),
    7: dict(
        bg="Non-urgent visits are among the most studied causes of ED crowding [1]. In a western Saudi tertiary ED, 78.5% of non-life-threatening visits were non-urgent [2].",
        gap="Saudi estimates vary widely in definitions and settings, and no pooled, quality-appraised national synthesis was identified (check PROSPERO before registration).",
        methods="PRISMA 2020 systematic review and random-effects meta-analysis of Saudi studies [3]. No patient contact required.",
        refs=["hoot2008", "alotmy2020", "page2021"]),
    8: dict(
        bg="Longer ED boarding is associated with higher mortality [1]. A national analysis of 1.57 million Saudi ED visits identified shift, season, severity and hospital type as predictors of prolonged length of stay [2].",
        gap="Patient-level data on length of stay and boarding from secondary hospitals outside major cities are scarce; existing Saudi data are national aggregates or from tertiary centres [2, 3].",
        methods="Retrospective review of 500-800 adult ED visits over 12 months, after IRB and hospital approval.",
        refs=["singer2011", "alharbi2023", "alqahtani2017"]),
    9: dict(
        bg="Sepsis caused an estimated 11.0 million deaths in 2017 [1]. qSOFA predicted ED mortality better than SIRS in one cohort (AUROC 0.80 vs 0.65) [2], but the 2021 Surviving Sepsis Campaign guidelines advise against using qSOFA alone for screening [3].",
        gap="No head-to-head comparison of qSOFA, NEWS2 and SIRS at triage in a Saudi regional hospital was identified; Saudi data come from tertiary centres [4].",
        methods="Retrospective accuracy study of about 540-810 adults with suspected infection; ROC curve comparison of the three scores.",
        refs=["rudd2020", "freund2017", "evans2021", "almutary2020"]),
    10: dict(
        bg="The PECARN rules identify children at very low risk after head trauma in whom CT can usually be avoided [1]. Childhood head CT carries a small radiation-related cancer risk [2]. In Qatar, more than 45% of paediatric head CTs for minor injury were not indicated [3].",
        gap="No Saudi study measuring actual PECARN adherence and CT use in Riyadh Region EDs was identified (confirm by formal search).",
        methods="Retrospective review of 400-500 children with head trauma and GCS 14-15; blinded PECARN classification by two reviewers.",
        refs=["kuppermann2009", "pearce2012", "elmoheen2021"]),
    11: dict(
        bg="WHO calls for better road-safety data and prevention, including restraint use [1]. A Saudi systematic review recommended hospital-based surveillance of road crashes in all regions [2]. In Riyadh, outcomes improved after seat-belt detection cameras were introduced [3].",
        gap="No published profile of injury patterns, restraint use and outcomes for crash victims in the Majmaah area was identified.",
        methods="Retrospective review of road traffic crash victims over 24 months (about 400-1,000 cases), including Injury Severity Score calculation.",
        refs=["who2023road", "mansuri2015", "albabtain2022"]),
    12: dict(
        bg="Intravenous thrombolysis is recommended within 4.5 hours of stroke onset [1]. In Riyadh, about 56% of stroke patients arrived after 4.5 hours; not using an ambulance and living outside Riyadh city predicted delay [2]. Only about 26% of rural Majmaah residents could name five or more stroke risk factors [3].",
        gap="Actual prehospital delays and EMS use among stroke patients from non-metropolitan governorates have not been measured.",
        methods="Prospective structured interviews of 200-250 stroke patients or caregivers, plus record review.",
        refs=["powers2019", "alkhathaami2018", "almaymuni2025"]),
    13: dict(
        bg="Return visits within 72 hours are a common ED quality indicator, although the 72-hour threshold has been debated [1]. In a Saudi university hospital, about 1.2% of return visits led to admission [2].",
        gap="No structured preventability review of return visits resulting in admission in a regional Saudi ED was identified.",
        methods="Retrospective cohort of ED discharges; two-physician preventability review of returns that led to admission.",
        refs=["rising2014", "alshahrani2020"]),
    14: dict(
        bg="In a vignette study, the best large language models matched untrained doctors but not trained raters, and tended to over-triage [1]. In another, LLMs recognised high-acuity cases more often than nurses, with similar overall accuracy [2].",
        gap="No CTAS-based study comparing current LLMs with Saudi triage nurses and interns, including Arabic vignettes, was identified.",
        methods="120-150 standardised vignettes (no patient data) rated by LLMs, nurses and interns against an expert consensus reference.",
        refs=["masanneck2024", "arslan2025", "alomari2025"]),
}

LBL = ParagraphStyle("lbl", fontName="Head-Bold", fontSize=9.3, leading=12, textColor=B.TEAL)
VAL = ParagraphStyle("val", fontName="Body", fontSize=9.9, leading=13.2, textColor=B.TEXT)
REF = ParagraphStyle("bref", parent=B.ST["ref"], fontSize=8.5, leading=11, spaceAfter=2)


def field_table(rows):
    data = [[B.P_(k, LBL), B.P_(v, VAL)] for k, v in rows]
    t = Table(data, colWidths=[3.3 * cm, B.CONTENT_W - 3.3 * cm])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 0), (-1, -2), 0.4, B.RULE),
        ("LEFTPADDING", (0, 0), (-1, -1), 4), ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4.5),
    ]))
    return t


def page_for(p):
    b = BRIEF[p["id"]]
    tot = sum(S.SCORES[p["id"]])
    out = [B.Anchor("Proposal %d: %s" % (p["id"], p["short"]), 0, "p%d" % p["id"])]
    banner = Table([[B.P_('<font name="Head-Bold" size="8.5" color="#8FD3CF">RESEARCH PROPOSAL %02d</font>' % p["id"], "body_left")],
                    [B.P_(p["title"], ParagraphStyle("bt", fontName="Head-Bold", fontSize=13, leading=16.5,
                                                     textColor=B.colors.white))]],
                   colWidths=[B.CONTENT_W])
    banner.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), B.NAVY),
        ("LEFTPADDING", (0, 0), (-1, -1), 11), ("RIGHTPADDING", (0, 0), (-1, -1), 11),
        ("TOPPADDING", (0, 0), (0, 0), 8), ("BOTTOMPADDING", (0, 0), (0, 0), 0),
        ("TOPPADDING", (0, 1), (0, 1), 2), ("BOTTOMPADDING", (0, -1), (-1, -1), 10),
        ("LINEBELOW", (0, -1), (-1, -1), 3, B.TEAL),
    ]))
    out.append(banner)
    pr = S.priority(tot)
    meta = Table([[B.P_("<b>Level</b><br/>%s" % p["level"], "tcell"),
                   B.P_("<b>Study design</b><br/>%s" % p["design_short"], "tcell"),
                   B.P_("<b>Priority score</b><br/>%d / 50 – %s" % (tot, pr), "tcell")]],
                 colWidths=[B.CONTENT_W * 0.30, B.CONTENT_W * 0.42, B.CONTENT_W * 0.28])
    meta.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), B.TEAL_LT), ("LINEAFTER", (0, 0), (1, 0), 0.6, B.colors.white),
        ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5)]))
    out += [meta, Spacer(1, 5)]
    out.append(field_table([
        ("Background", B.style_cits(b["bg"])),
        ("Research gap", B.style_cits(b["gap"])),
        ("Research question", "<i>%s</i>" % p["question"]),
        ("Primary objective", p["primary"]),
        ("Population and methods", B.style_cits(b["methods"])),
    ]))
    out.append(Spacer(1, 4))
    out.append(B.P_("Key references", LBL))
    for i, k in enumerate(b["refs"], start=1):
        out.append(B.P_(B.fmt_ref(k, i), REF))
    out.append(Spacer(1, 6))
    out.append(B.SupervisorBox("Faculty Supervisor’s Comments & Suggested Modifications — Proposal %d" % p["id"],
                               n_lines=5, line_gap=23))
    out.append(PageBreak())
    return out


def story():
    st = [NextPageTemplate("main"), PageBreak()]
    # Overview
    st.append(B.Anchor("Portfolio at a Glance", 0, "overview"))
    st.append(B.P_("Portfolio at a Glance", "h1"))
    st.append(B.Rule())
    st.append(B.P_("This condensed edition presents fourteen research proposals for the Emergency Medicine Club, one page each: title, background, research gap, research question, primary objective, population and methods, key references and space for the Faculty Supervisor's comments. The proposals were selected after a review of global, Saudi and Majmaah literature, and every reference was checked for title, authors, journal, year and identifier. Sample sizes are preliminary estimates to be confirmed with a biostatistician. The full edition, with complete methods, statistics, ethics and an implementation roadmap, is available for the projects that are selected."))
    st.append(B.callout("<b>Data-protection principle.</b> No student will access medical records, collect identifiable data or approach patients before written approval from the relevant ethics committee/IRB and the participating institution.",
                        bg=B.colors.HexColor("#FDF3E7"), border=B.colors.HexColor("#C77B1A")))
    st.append(Spacer(1, 8))
    rows = []
    for p in B.PROPOSALS:
        tot = sum(S.SCORES[p["id"]])
        rows.append((str(p["id"]), p["short"], p["level"], p["design_short"], "%d" % tot, S.priority(tot)))
    st.append(B.data_table(["No.", "Proposal", "Level", "Design", "Score /50", "Priority"], rows,
                           [1.0 * cm, 5.9 * cm, 2.9 * cm, 3.4 * cm, 1.6 * cm, 1.8 * cm], center_cols=(0, 4, 5), pad=3))
    st.append(PageBreak())
    # Prioritisation
    st.append(B.Anchor("Prioritisation and Top Five Projects", 0, "priority"))
    st.append(B.P_("Prioritisation and Top Five Projects", "h1"))
    st.append(B.Rule())
    st.append(B.P_("Each proposal was scored 1-5 on ten criteria, where 5 is always most favourable (e.g., lowest cost). High priority = 40-50; Moderate = 34-39; Lower = 33 or below. A lower score reflects lower feasibility for a first student project, mainly because of hospital approvals, not lower scientific value.", "small"))
    st.append(Spacer(1, 5))
    hdr = ["No."] + [c[0] for c in S.CRITERIA] + ["Total", "Priority"]
    rows = [[str(p["id"])] + [str(x) for x in S.SCORES[p["id"]]] + [str(sum(S.SCORES[p["id"]])), S.priority(sum(S.SCORES[p["id"]]))]
            for p in B.PROPOSALS]
    w_sc = (B.CONTENT_W - 1.0 * cm - 1.3 * cm - 2.0 * cm) / 10
    mt = B.data_table(hdr, rows, [1.0 * cm] + [w_sc] * 10 + [1.3 * cm, 2.0 * cm], center_cols=tuple(range(13)), pad=2.5)
    extra = []
    for i, p in enumerate(B.PROPOSALS, start=1):
        pr = S.priority(sum(S.SCORES[p["id"]]))
        extra.append(("BACKGROUND", (12, i), (12, i), {"High": B.colors.HexColor("#D5EFEC"),
                                                       "Moderate": B.colors.HexColor("#FFF2D6"),
                                                       "Lower": B.colors.HexColor("#F3E1E1")}[pr]))
    mt.setStyle(TableStyle(extra))
    st.append(mt)
    st.append(Spacer(1, 4))
    st.append(B.P_("SIG significance; NOV novelty; FEA feasibility; CST cost; TIM time; ACC access to participants/data; ETH ethical/administrative complexity; PUB publication potential; KSA relevance to Saudi Arabia; CLB suitability for the club.", "small"))
    st.append(Spacer(1, 6))
    st.append(B.P_("Recommended for first consideration", "h2"))
    st.append(B.data_table(["Rank", "Proposal", "Why"],
                           [(str(i + 1), "<b>%d.</b> %s" % (n, t), r.split(";")[0].split(". ")[0] + ".")
                            for i, (n, t, r) in enumerate(S.TOP5)],
                           [1.2 * cm, 5.6 * cm, B.CONTENT_W - 6.8 * cm], center_cols=(0,), pad=3))
    st.append(Spacer(1, 4))
    st.append(B.P_("In addition, one hospital-based clinical project - preferably Proposal 11 (road traffic injuries), the highest-scoring clinical proposal - should begin the approval process early.", "small"))
    st.append(PageBreak())
    for p in B.PROPOSALS:
        st += page_for(p)
    # Final selection
    st.append(B.Anchor("Supervisor Feedback and Research Selection", 0, "final"))
    st.append(B.P_("Overall Supervisor Feedback and Research Selection", "h1"))
    st.append(B.Rule())
    st.append(B.P_("Approved research ideas", "h3"))
    st.append(B.selection_table(["Proposal No.", "Student lead / team", "Co-supervisor", "Conditions or modifications"], 5))
    st.append(Spacer(1, 8))
    st.append(B.P_("Rejected or postponed ideas", "h3"))
    st.append(B.selection_table(["Proposal No.", "Decision (rejected / postponed)", "Reason", "Revisit date"], 4))
    st.append(Spacer(1, 10))
    st.append(B.SupervisorBox("General Comments and Final Recommendations", n_lines=5, line_gap=24, decision=False,
                              signature=True))
    return st


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "..",
                                                             "EM_Club_Research_Portfolio_2026-2027_Condensed.pdf")
    for pid, b in BRIEF.items():
        for k in b["refs"]:
            assert k in B.REFS, (pid, k)
    doc = B.PortfolioDoc(out)
    doc.multiBuild(story(), canvasmaker=B.NumberedCanvas)
    print("written", os.path.abspath(out))


if __name__ == "__main__":
    main()

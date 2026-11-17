# -*- coding: utf-8 -*-
"""Condensed portfolio of 20 survey and systematic-review ideas (one page each).

Usage:  python3 build_ideas.py [output.pdf]
"""
import os
import re
import sys

from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import NextPageTemplate, PageBreak, Spacer, Table, TableStyle

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build as B  # noqa: E402
import build_brief as BB  # noqa: E402
import sections as S  # noqa: E402
from ideas20 import IDEAS, TOP5, SR, SURVEY  # noqa: E402

B.COVER_TAGLINE = "Cross-sectional surveys • Systematic reviews • One page per idea"
B.COVER_DOC = "20 research ideas for supervisor review and selection"
B.COVER_SUB = "20 Research Ideas: Surveys and Systematic Reviews"

CIT = re.compile(r"\[(\d+(?:\s*,\s*\d+)*)\]")


def renumber(idea):
    order = []
    for f in (idea["bg"], idea["gap"], idea["methods"]):
        for m in CIT.finditer(f):
            for n in m.group(1).split(","):
                n = int(n)
                if n not in order:
                    order.append(n)
    for n in range(1, len(idea["refs"]) + 1):
        if n not in order:
            order.append(n)
    mp = {o: i + 1 for i, o in enumerate(order)}
    sub = lambda t: CIT.sub(lambda m: "[" + ", ".join(str(x) for x in sorted(mp[int(n)] for n in m.group(1).split(","))) + "]", t)  # noqa: E731
    d = dict(idea)
    for k in ("bg", "gap", "methods"):
        d[k] = B.style_cits(sub(idea[k]))
    d["refs"] = [idea["refs"][o - 1] for o in order]
    return d


def page_for(i):
    tot = sum(i["scores"])
    pr = S.priority(tot)
    out = [B.Anchor("Idea %d: %s" % (i["id"], i["topic"]), 1, "i%d" % i["id"])]
    banner = Table([[B.P_('<font name="Head-Bold" size="8.5" color="#8FD3CF">RESEARCH IDEA %02d • %s</font>'
                          % (i["id"], i["type"].upper()), "body_left")],
                    [B.P_(i["title"], ParagraphStyle("bt", fontName="Head-Bold", fontSize=13, leading=16.5,
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
    meta = Table([[B.P_("<b>Topic</b><br/>%s" % i["topic"], "tcell"),
                   B.P_("<b>Study design</b><br/>%s" % i["type"], "tcell"),
                   B.P_("<b>Priority score</b><br/>%d / 50 – %s" % (tot, pr), "tcell")]],
                 colWidths=[B.CONTENT_W * 0.36, B.CONTENT_W * 0.36, B.CONTENT_W * 0.28])
    meta.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), B.TEAL_LT), ("LINEAFTER", (0, 0), (1, 0), 0.6, B.colors.white),
        ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5)]))
    out += [meta, Spacer(1, 5)]
    out.append(BB.field_table([
        ("Background", i["bg"]),
        ("Research gap", i["gap"]),
        ("Research question", "<i>%s</i>" % i["question"]),
        ("Primary objective", i["objective"]),
        ("Population and methods" if i["type"] == SURVEY else "Review methods", i["methods"]),
    ]))
    out.append(Spacer(1, 4))
    out.append(B.P_("Key references", BB.LBL))
    for n, k in enumerate(i["refs"], start=1):
        out.append(B.P_(B.fmt_ref(k, n), BB.REF))
    out.append(Spacer(1, 6))
    out.append(B.SupervisorBox("Faculty Supervisor’s Comments & Suggested Modifications — Idea %d" % i["id"],
                               n_lines=5, line_gap=23))
    out.append(PageBreak())
    return out


def story():
    ideas = [renumber(i) for i in IDEAS]
    st = [NextPageTemplate("main"), PageBreak()]
    st.append(B.Anchor("Portfolio at a Glance", 0, "overview"))
    st.append(B.P_("Portfolio at a Glance", "h1"))
    st.append(B.Rule())
    st.append(B.P_("This portfolio presents twenty research ideas limited to the two designs most feasible for medical students: <b>cross-sectional surveys</b> (Ideas 1-10) and <b>systematic reviews</b> (Ideas 11-20). Each idea was chosen after checking the literature for existing Saudi studies (for surveys) or existing systematic reviews (for reviews); topics already well covered were excluded. Every reference was verified for title, authors, journal, year and identifier; entries with an element that could not be confirmed carry a note. Sample sizes are preliminary and must be confirmed with a biostatistician."))
    st.append(B.data_table(["Design", "Why it is feasible", "Main requirement"], [
        ("<b>Cross-sectional survey</b>", "No hospital records; online or face-to-face questionnaire; low cost; 4-6 months.", "University ethics approval; validated, piloted questionnaire; adequate response."),
        ("<b>Systematic review</b>", "No participants; desk-based; usually exempt from ethics review; 5-7 months.", "PROSPERO registration; PRISMA 2020 methods; two independent reviewers."),
    ], [3.6 * B.cm, 6.6 * B.cm, B.CONTENT_W - 10.2 * B.cm]))
    st.append(Spacer(1, 6))
    st.append(B.callout("<b>Note.</b> Gaps were identified through web searches of PubMed/PMC, DOAJ and publisher records; direct database access (PubMed API, Scopus, Web of Science) was unavailable. Before registration or ethics submission, each team should confirm the gap with a formal search, including PROSPERO for systematic reviews.", bg=B.GREY_LT, border=B.NAVY2))
    st.append(PageBreak())

    st.append(B.Anchor("Summary and Prioritisation", 0, "priority"))
    st.append(B.P_("Summary and Prioritisation", "h1"))
    st.append(B.Rule())
    st.append(B.P_("Scored 1-5 on ten criteria (5 = most favourable): SIG significance, NOV novelty, FEA feasibility, CST cost, TIM time, ACC access, ETH ethical complexity, PUB publication potential, KSA Saudi relevance, CLB club suitability. High = 40-50; Moderate = 34-39.", "small"))
    st.append(Spacer(1, 4))
    hdr = ["No.", "Idea", "Design"] + [c[0] for c in S.CRITERIA] + ["Total"]
    rows = []
    for i in ideas:
        rows.append([str(i["id"]), i["topic"], "Survey" if i["type"] == SURVEY else "Review"]
                    + [str(x) for x in i["scores"]] + [str(sum(i["scores"]))])
    w_sc = 0.85 * cm
    w_name = B.CONTENT_W - 0.9 * cm - 1.3 * cm - 10 * w_sc - 1.1 * cm
    mt = B.data_table(hdr, rows, [0.9 * cm, w_name, 1.3 * cm] + [w_sc] * 10 + [1.1 * cm],
                      center_cols=tuple([0, 2] + list(range(3, 14))), pad=2)
    extra = []
    for r, i in enumerate(ideas, start=1):
        pr = S.priority(sum(i["scores"]))
        extra.append(("BACKGROUND", (13, r), (13, r), {"High": B.colors.HexColor("#D5EFEC"),
                                                       "Moderate": B.colors.HexColor("#FFF2D6"),
                                                       "Lower": B.colors.HexColor("#F3E1E1")}[pr]))
    extra.append(("LINEBELOW", (0, 10), (-1, 10), 1.2, B.NAVY))
    extra += [("LEFTPADDING", (0, 0), (-1, 0), 1.5), ("RIGHTPADDING", (0, 0), (-1, 0), 1.5)]
    mt.setStyle(TableStyle(extra))
    st.append(mt)
    st.append(Spacer(1, 8))
    st.append(B.P_("Recommended for first consideration", "h2"))
    byid = {i["id"]: i for i in ideas}
    st.append(B.data_table(["Rank", "Idea", "Why"],
                           [(str(r + 1), "<b>%d.</b> %s (%s, %d/50)" % (n, byid[n]["topic"],
                                                                         "survey" if byid[n]["type"] == SURVEY else "review",
                                                                         sum(byid[n]["scores"])), why)
                            for r, (n, why) in enumerate(TOP5)],
                           [1.2 * cm, 6.0 * cm, B.CONTENT_W - 7.2 * cm], center_cols=(0,), pad=3))
    st.append(B.P_("The top five mix two surveys and three systematic reviews, so that different team skills are used and at least one project can start immediately without ethics approval.", "small"))
    st.append(PageBreak())

    st.append(B.Anchor("Part A - Cross-Sectional Surveys (Ideas 1-10)", 0, "partA"))
    for i in ideas[:10]:
        st += page_for(i)
    st.append(B.Anchor("Part B - Systematic Reviews (Ideas 11-20)", 0, "partB"))
    for i in ideas[10:]:
        st += page_for(i)

    st.append(B.Anchor("Supervisor Feedback and Selection", 0, "final"))
    st.append(B.P_("Overall Supervisor Feedback and Research Selection", "h1"))
    st.append(B.Rule())
    st.append(B.P_("Approved research ideas", "h3"))
    st.append(B.selection_table(["Idea No.", "Student lead / team", "Co-supervisor", "Conditions or modifications"], 5))
    st.append(Spacer(1, 8))
    st.append(B.P_("Rejected or postponed ideas", "h3"))
    st.append(B.selection_table(["Idea No.", "Decision (rejected / postponed)", "Reason", "Revisit date"], 4))
    st.append(Spacer(1, 10))
    st.append(B.SupervisorBox("General Comments and Final Recommendations", n_lines=5, line_gap=24, decision=False))
    return st


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "..",
                                                             "EM_Club_20_Research_Ideas_Surveys_and_Reviews.pdf")
    for i in IDEAS:
        for k in i["refs"]:
            assert k in B.REFS, (i["id"], k)
        assert len(i["scores"]) == 10
    doc = B.PortfolioDoc(out)
    doc.multiBuild(story(), canvasmaker=B.NumberedCanvas)
    print("written", os.path.abspath(out))


if __name__ == "__main__":
    main()

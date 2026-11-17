# -*- coding: utf-8 -*-
"""Build the Emergency Medicine Club Scientific Research Portfolio PDF.

Usage:  python3 build.py [output.pdf]
"""
import os
import re
import sys

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas as rl_canvas
from reportlab.platypus import (BaseDocTemplate, CondPageBreak, Flowable, Frame, KeepTogether,
                                ListFlowable, ListItem, NextPageTemplate, PageBreak, PageTemplate,
                                Paragraph, Spacer, Table, TableStyle)
from reportlab.platypus.tableofcontents import TableOfContents

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from refs import REFS, ref_url  # noqa: E402
import proposals_a  # noqa: E402
import proposals_b  # noqa: E402
import sections as S  # noqa: E402

PROPOSALS = proposals_a.P + proposals_b.P

# ---------------------------------------------------------------- fonts ----
FD = "/usr/share/fonts/truetype/crosextra/"
pdfmetrics.registerFont(TTFont("Body", FD + "Caladea-Regular.ttf"))
pdfmetrics.registerFont(TTFont("Body-Bold", FD + "Caladea-Bold.ttf"))
pdfmetrics.registerFont(TTFont("Body-Italic", FD + "Caladea-Italic.ttf"))
pdfmetrics.registerFont(TTFont("Body-BoldItalic", FD + "Caladea-BoldItalic.ttf"))
pdfmetrics.registerFont(TTFont("Head", FD + "Carlito-Regular.ttf"))
pdfmetrics.registerFont(TTFont("Head-Bold", FD + "Carlito-Bold.ttf"))
pdfmetrics.registerFont(TTFont("Head-Italic", FD + "Carlito-Italic.ttf"))
pdfmetrics.registerFont(TTFont("Head-BoldItalic", FD + "Carlito-BoldItalic.ttf"))
from reportlab.pdfbase.pdfmetrics import registerFontFamily  # noqa: E402
registerFontFamily("Body", normal="Body", bold="Body-Bold", italic="Body-Italic", boldItalic="Body-BoldItalic")
registerFontFamily("Head", normal="Head", bold="Head-Bold", italic="Head-Italic", boldItalic="Head-BoldItalic")

# --------------------------------------------------------------- colours ---
NAVY = colors.HexColor("#14284B")
NAVY2 = colors.HexColor("#22406E")
TEAL = colors.HexColor("#1A8A87")
TEAL_LT = colors.HexColor("#E6F3F2")
GREY_LT = colors.HexColor("#F3F5F8")
GREY = colors.HexColor("#8A96A6")
RULE = colors.HexColor("#C5CDD8")
TEXT = colors.HexColor("#1E2329")
LINK = "#127A77"

PAGE_W, PAGE_H = A4
COVER_TAGLINE = "Research gaps \u2022 Study designs \u2022 Prioritisation matrix \u2022 Implementation roadmap"
COVER_DOC = "Proposals for supervisor review and research selection"
LM = RM = 2.2 * cm
TM = 2.5 * cm
BM = 2.2 * cm
CONTENT_W = PAGE_W - LM - RM

# ---------------------------------------------------------------- styles ---
ST = {}
ST["body"] = ParagraphStyle("body", fontName="Body", fontSize=10.5, leading=14.6, textColor=TEXT,
                            alignment=TA_JUSTIFY, spaceAfter=5)
ST["body_left"] = ParagraphStyle("body_left", parent=ST["body"], alignment=TA_LEFT)
ST["small"] = ParagraphStyle("small", parent=ST["body"], fontSize=9.2, leading=12.2, alignment=TA_LEFT, spaceAfter=0)
ST["tcell"] = ParagraphStyle("tcell", fontName="Body", fontSize=8.9, leading=11.4, textColor=TEXT)
ST["tcell_c"] = ParagraphStyle("tcell_c", parent=ST["tcell"], alignment=TA_CENTER)
ST["thead"] = ParagraphStyle("thead", fontName="Head-Bold", fontSize=9, leading=11.2, textColor=colors.white)
ST["thead_c"] = ParagraphStyle("thead_c", parent=ST["thead"], alignment=TA_CENTER)
ST["h1"] = ParagraphStyle("h1", fontName="Head-Bold", fontSize=20, leading=24, textColor=NAVY, spaceBefore=0,
                          spaceAfter=10)
ST["h2"] = ParagraphStyle("h2", fontName="Head-Bold", fontSize=13.5, leading=17, textColor=NAVY, spaceBefore=10,
                          spaceAfter=5)
ST["h3"] = ParagraphStyle("h3", fontName="Head-Bold", fontSize=11.5, leading=14, textColor=TEAL, spaceBefore=8,
                          spaceAfter=3)
ST["psec"] = ParagraphStyle("psec", fontName="Head-Bold", fontSize=11.3, leading=14, textColor=NAVY,
                            spaceBefore=9, spaceAfter=3)
ST["label"] = ParagraphStyle("label", fontName="Head-Bold", fontSize=9.5, leading=12, textColor=TEAL)
ST["ref"] = ParagraphStyle("ref", fontName="Body", fontSize=9.3, leading=12.3, textColor=TEXT, leftIndent=16,
                           firstLineIndent=-16, spaceAfter=3.5, alignment=TA_LEFT)
ST["toc0"] = ParagraphStyle("toc0", fontName="Head-Bold", fontSize=11, leading=15, textColor=NAVY, leftIndent=0,
                            spaceBefore=5)
ST["toc1"] = ParagraphStyle("toc1", fontName="Body", fontSize=9.6, leading=12.6, textColor=TEXT, leftIndent=18,
                            firstLineIndent=0, spaceBefore=1.5, rightIndent=26)
for _k in ("h3", "label"):
    ST[_k].keepWithNext = 1
ST["callout"] = ParagraphStyle("callout", parent=ST["body"], fontSize=10, leading=14, alignment=TA_LEFT, spaceAfter=0)


def P_(text, style="body"):
    return Paragraph(text, ST[style] if isinstance(style, str) else style)


def bullets(items, style="body_left", bullet_color=TEAL, left=14):
    return ListFlowable([ListItem(P_(t, style), leftIndent=left, value="circle") for t in items],
                        bulletType="bullet", start="•", bulletFontName="Head-Bold", bulletColor=bullet_color,
                        bulletFontSize=9, leftIndent=left, spaceBefore=0, spaceAfter=4)


def numbered(items, style="body_left"):
    return ListFlowable([ListItem(P_(t, style), leftIndent=18) for t in items], bulletType="1",
                        bulletFontName="Head-Bold", bulletColor=TEAL, bulletFontSize=10, leftIndent=18,
                        spaceAfter=4)


def callout(text, bg=TEAL_LT, border=TEAL):
    t = Table([[P_(text, "callout")]], colWidths=[CONTENT_W])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("LINEBEFORE", (0, 0), (0, -1), 3, border),
        ("LEFTPADDING", (0, 0), (-1, -1), 10), ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    return t


def data_table(header, rows, widths, header_bg=NAVY, zebra=True, center_cols=(), font_style="tcell",
               repeat=1, pad=4):
    data = [[P_(h, "thead_c" if i in center_cols else "thead") for i, h in enumerate(header)]] if header else []
    for r in rows:
        data.append([c if isinstance(c, Flowable) else P_(str(c), "tcell_c" if i in center_cols else font_style)
                     for i, c in enumerate(r)])
    t = Table(data, colWidths=widths, repeatRows=repeat if header else 0)
    sty = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 0), (-1, -1), 0.4, RULE),
        ("LEFTPADDING", (0, 0), (-1, -1), 5), ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), pad), ("BOTTOMPADDING", (0, 0), (-1, -1), pad + 0.5),
        ("BOX", (0, 0), (-1, -1), 0.6, RULE),
    ]
    if header:
        sty += [("BACKGROUND", (0, 0), (-1, 0), header_bg), ("VALIGN", (0, 0), (-1, 0), "MIDDLE")]
    if zebra:
        start = 1 if header else 0
        for i in range(start, len(data)):
            if (i - start) % 2 == 1:
                sty.append(("BACKGROUND", (0, i), (-1, i), GREY_LT))
    t.setStyle(TableStyle(sty))
    return t


# ------------------------------------------------------- custom flowables --
class SupervisorBox(Flowable):
    """Ruled area for handwritten supervisor comments (printer-friendly)."""

    def __init__(self, title, n_lines=7, line_gap=26, decision=True, signature=True, width=CONTENT_W):
        super().__init__()
        self.title = title
        self.n_lines = n_lines
        self.line_gap = line_gap
        self.decision = decision
        self.signature = signature
        self.width = width
        self.header_h = 24
        self.decision_h = 26 if decision else 0
        self.sig_h = 34 if signature else 8
        self.height = self.header_h + self.decision_h + 12 + n_lines * line_gap + self.sig_h

    def wrap(self, aw, ah):
        return self.width, self.height

    def draw(self):
        c = self.canv
        w, h = self.width, self.height
        c.saveState()
        c.setStrokeColor(TEAL)
        c.setLineWidth(1)
        c.roundRect(0, 0, w, h, 4, stroke=1, fill=0)
        # header band
        c.setFillColor(TEAL_LT)
        p = c.beginPath()
        p.moveTo(0, h - self.header_h)
        p.lineTo(0, h - 4)
        p.arcTo(0, h - 8, 8, h, startAng=180, extent=-90)
        p.lineTo(w - 4, h)
        p.arcTo(w - 8, h - 8, w, h, startAng=90, extent=-90)
        p.lineTo(w, h - self.header_h)
        p.close()
        c.drawPath(p, stroke=0, fill=1)
        c.setStrokeColor(TEAL)
        c.line(0, h - self.header_h, w, h - self.header_h)
        c.setFillColor(NAVY)
        c.setFont("Head-Bold", 11)
        c.drawString(10, h - self.header_h + 8, self.title)
        y = h - self.header_h
        if self.decision:
            y -= 18
            c.setFont("Head-Bold", 9.5)
            c.setFillColor(NAVY)
            c.drawString(10, y, "Decision:")
            opts = ["Approved", "Approved with modifications", "Postponed", "Not approved"]
            x = 62
            c.setFont("Head", 9.5)
            c.setStrokeColor(NAVY)
            c.setLineWidth(0.8)
            for o in opts:
                c.rect(x, y - 1.5, 9, 9, stroke=1, fill=0)
                c.drawString(x + 13, y, o)
                x += 13 + c.stringWidth(o, "Head", 9.5) + 22
            y -= 8
        y -= 12
        c.setStrokeColor(colors.HexColor("#9AA6B4"))
        c.setLineWidth(0.6)
        for i in range(self.n_lines):
            y -= self.line_gap
            c.line(10, y, w - 10, y)
        if self.signature:
            y -= 24
            c.setFont("Head", 9.5)
            c.setFillColor(NAVY)
            c.drawString(10, y, "Supervisor signature:")
            sw = c.stringWidth("Supervisor signature:", "Head", 9.5)
            c.line(10 + sw + 6, y - 2, w * 0.58, y - 2)
            c.drawString(w * 0.62, y, "Date:")
            c.line(w * 0.62 + 30, y - 2, w - 10, y - 2)
        c.restoreState()


class Rule(Flowable):
    def __init__(self, width=CONTENT_W, color=TEAL, thickness=1.2, space=4):
        super().__init__()
        self.width, self.color, self.thickness, self.space = width, color, thickness, space

    def wrap(self, aw, ah):
        return self.width, self.thickness + 2 * self.space

    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(self.thickness)
        self.canv.line(0, self.space, self.width, self.space)


class Anchor(Flowable):
    """Zero-size flowable that registers a TOC entry + PDF bookmark."""

    def __init__(self, text, level, key):
        super().__init__()
        self.text, self.level, self.key = text, level, key

    def wrap(self, aw, ah):
        return 0, 0

    def draw(self):
        pass


# --------------------------------------------------------- doc template ----
class PortfolioDoc(BaseDocTemplate):
    def __init__(self, filename, **kw):
        super().__init__(filename, pagesize=A4, leftMargin=LM, rightMargin=RM, topMargin=TM, bottomMargin=BM,
                         title="Emergency Medicine Club - Scientific Research Portfolio",
                         author="Emergency Medicine Club, College of Medicine, Majmaah University",
                         subject="14 Evidence-Based Research Proposals (Academic Year 2026-2027)",
                         keywords="emergency medicine, research proposals, Saudi Arabia, Majmaah University",
                         **kw)
        frame = Frame(LM, BM, CONTENT_W, PAGE_H - TM - BM, id="main", leftPadding=0, rightPadding=0,
                      topPadding=0, bottomPadding=0)
        self.addPageTemplates([
            PageTemplate(id="cover", frames=[frame], onPage=draw_cover),
            PageTemplate(id="main", frames=[frame]),
        ])

    def afterFlowable(self, fl):
        if isinstance(fl, Anchor):
            self.canv.bookmarkPage(fl.key)
            self.canv.addOutlineEntry(re.sub("<[^>]+>", "", fl.text), fl.key, level=fl.level, closed=False)
            self.notify("TOCEntry", (fl.level, fl.text, self.page, fl.key))


class NumberedCanvas(rl_canvas.Canvas):
    def __init__(self, *a, **kw):
        super().__init__(*a, **kw)
        self._saved = []

    def showPage(self):
        self._saved.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        total = len(self._saved)
        for st in self._saved:
            self.__dict__.update(st)
            if self._pageNumber > 1:
                self.draw_decor(total)
            super().showPage()
        super().save()

    def draw_decor(self, total):
        self.saveState()
        # header
        y = PAGE_H - 1.45 * cm
        self.setFont("Head-Bold", 8.6)
        self.setFillColor(NAVY)
        self.drawString(LM, y, "EMERGENCY MEDICINE CLUB")
        self.setFont("Head", 8.6)
        self.setFillColor(GREY)
        self.drawString(LM + self.stringWidth("EMERGENCY MEDICINE CLUB", "Head-Bold", 8.6) + 6, y,
                        "Scientific Research Portfolio")
        self.drawRightString(PAGE_W - RM, y, "Majmaah University – College of Medicine")
        self.setStrokeColor(TEAL)
        self.setLineWidth(0.9)
        self.line(LM, y - 6, PAGE_W - RM, y - 6)
        # footer
        fy = 1.25 * cm
        self.setStrokeColor(RULE)
        self.setLineWidth(0.5)
        self.line(LM, fy + 10, PAGE_W - RM, fy + 10)
        self.setFont("Head", 8.5)
        self.setFillColor(GREY)
        self.drawString(LM, fy, "Academic Year 2026–2027  |  Prepared for the Emergency Medicine Club Faculty Supervisor")
        self.setFillColor(NAVY)
        self.setFont("Head-Bold", 8.5)
        self.drawRightString(PAGE_W - RM, fy, "Page %d of %d" % (self._pageNumber, total))
        self.restoreState()


def draw_cover(c, doc):
    c.saveState()
    # navy block
    top_h = PAGE_H * 0.56
    c.setFillColor(NAVY)
    c.rect(0, PAGE_H - top_h, PAGE_W, top_h, stroke=0, fill=1)
    # subtle teal band
    c.setFillColor(TEAL)
    c.rect(0, PAGE_H - top_h - 6, PAGE_W, 6, stroke=0, fill=1)
    # ECG-style trace (single subtle line)
    c.setStrokeColor(colors.HexColor("#3E8FA0"))
    c.setLineWidth(1.4)
    base = PAGE_H - top_h + 62
    pts = [(0, base), (PAGE_W * 0.52, base), (PAGE_W * 0.55, base + 10), (PAGE_W * 0.57, base - 8),
           (PAGE_W * 0.595, base + 46), (PAGE_W * 0.62, base - 26), (PAGE_W * 0.645, base + 6),
           (PAGE_W * 0.67, base), (PAGE_W, base)]
    p = c.beginPath()
    p.moveTo(*pts[0])
    for pt in pts[1:]:
        p.lineTo(*pt)
    c.drawPath(p, stroke=1, fill=0)
    # text on navy
    x = 2.4 * cm
    c.setFillColor(colors.HexColor("#8FD3CF"))
    c.setFont("Head-Bold", 11)
    c.drawString(x, PAGE_H - 3.0 * cm, "MAJMAAH UNIVERSITY  •  COLLEGE OF MEDICINE")
    c.setFillColor(colors.white)
    c.setFont("Head-Bold", 34)
    c.drawString(x, PAGE_H - 5.6 * cm, "Emergency Medicine Club")
    c.setFont("Head", 25)
    c.drawString(x, PAGE_H - 7.0 * cm, "Scientific Research Portfolio")
    c.setStrokeColor(TEAL)
    c.setLineWidth(2.2)
    c.line(x, PAGE_H - 7.75 * cm, x + 4.2 * cm, PAGE_H - 7.75 * cm)
    c.setFillColor(colors.HexColor("#D6E4F0"))
    c.setFont("Head", 16)
    c.drawString(x, PAGE_H - 8.9 * cm, "14 Evidence-Based Research Proposals")
    c.setFont("Head-Italic", 11.5)
    c.setFillColor(colors.HexColor("#AFC3D8"))
    c.drawString(x, PAGE_H - 9.8 * cm, COVER_TAGLINE)
    # details block
    rows = [("Institution", "Majmaah University – College of Medicine"),
            ("Prepared for", "Emergency Medicine Club Faculty Supervisor"),
            ("Academic Year", "2026–2027"),
            ("Document", COVER_DOC)]
    y = PAGE_H - top_h - 2.4 * cm
    for k, v in rows:
        c.setFont("Head-Bold", 9.5)
        c.setFillColor(TEAL)
        c.drawString(x, y, k.upper())
        c.setFont("Body", 13.5)
        c.setFillColor(NAVY)
        c.drawString(x, y - 17, v)
        y -= 1.65 * cm
    # footer
    c.setStrokeColor(RULE)
    c.setLineWidth(0.6)
    c.line(x, 2.6 * cm, PAGE_W - 2.4 * cm, 2.6 * cm)
    c.setFont("Head", 9)
    c.setFillColor(GREY)
    c.drawString(x, 2.0 * cm, "Confidential working document for academic review. Printer-friendly layout with space for handwritten feedback.")
    c.restoreState()


# -------------------------------------------------------------- helpers ----
CIT_RE = re.compile(r"\[(\d+(?:\s*,\s*\d+)*)\]")


def renumber(p):
    """Renumber a proposal's citations by order of first appearance."""
    fields = []
    fields += p["background"]
    fields += [p["gap"], p["question"], p["design"], p["design_why"]]
    fields += p["methods"]
    fields += [p["stats"], p["sample"], p["ethics"], p["impact"], p["publication"]]
    order = []
    for f in fields:
        for m in CIT_RE.finditer(f):
            for n in m.group(1).split(","):
                n = int(n)
                if n not in order:
                    order.append(n)
    for n in range(1, len(p["refs"]) + 1):
        if n not in order:
            order.append(n)
    mapping = {old: new + 1 for new, old in enumerate(order)}

    def sub(text):
        return CIT_RE.sub(lambda m: "[" + ", ".join(str(x) for x in sorted(mapping[int(n)] for n in m.group(1).split(","))) + "]", text)

    for k in ["gap", "question", "design", "design_why", "stats", "sample", "ethics", "impact", "publication"]:
        p[k] = sub(p[k])
    p["background"] = [sub(t) for t in p["background"]]
    p["methods"] = [sub(t) for t in p["methods"]]
    p["refs"] = [p["refs"][old - 1] for old in order]
    # style citations
    for k in ["gap", "question", "design", "design_why", "stats", "sample", "ethics", "impact", "publication"]:
        p[k] = style_cits(p[k])
    p["background"] = [style_cits(t) for t in p["background"]]
    p["methods"] = [style_cits(t) for t in p["methods"]]
    return p


def style_cits(t):
    return CIT_RE.sub(lambda m: '<font color="%s">[%s]</font>' % (LINK, m.group(1)), t)


def fmt_ref(key, num=None):
    r = REFS[key]
    parts = [r["authors"], " " + r["title"] + ".", " <i>" + r["journal"] + "</i>."]
    yd = " " + r["year"]
    if r.get("details"):
        yd += ";" + r["details"]
    parts.append(yd + ".")
    ids = []
    if r.get("doi"):
        ids.append('DOI: <a href="https://doi.org/%s" color="%s">%s</a>' % (r["doi"], LINK, r["doi"]))
    if r.get("pmid"):
        ids.append('PMID: <a href="https://pubmed.ncbi.nlm.nih.gov/%s/" color="%s">%s</a>' % (r["pmid"], LINK, r["pmid"]))
    if not r.get("doi") and r.get("url"):
        ids.append('URL: <a href="%s" color="%s">%s</a>' % (r["url"], LINK, r["url"]))
    if ids:
        parts.append(" " + "; ".join(ids) + ".")
    if r.get("note"):
        parts.append(' <font color="#8A5A00"><i>Note: %s</i></font>' % r["note"])
    txt = "".join(parts)
    if num is not None:
        txt = '<font name="Head-Bold" color="#14284B">%d.</font>&nbsp;&nbsp;' % num + txt
    return txt


def author_year_key(key):
    r = REFS[key]
    return (re.sub(r"[^A-Za-z]", "", r["authors"].split(",")[0]).lower(), r["year"])


# ------------------------------------------------------------- story -------
def h2(text):
    return [CondPageBreak(3.5 * cm), P_(text, "h2")]


def heading(text, level, key, style):
    return [Anchor(text, level, key), P_(text, style)]


def build_story():
    story = []
    # cover (drawn by page template)
    story.append(NextPageTemplate("main"))
    story.append(PageBreak())

    # Preface
    story += heading("Preface and Notes for the Reviewer", 0, "preface", "h1")
    story.append(Rule())
    for t in S.PREFACE[:2]:
        story.append(P_(t))
    story.append(Spacer(1, 4))
    story.append(callout(S.PREFACE[2]))
    story.append(Spacer(1, 8))
    story.append(callout(S.PREFACE[3], bg=colors.HexColor("#FDF3E7"), border=colors.HexColor("#C77B1A")))
    story.append(Spacer(1, 10))
    story.append(P_("Document structure", "h3"))
    story.append(data_table(["Part", "Content"], [
        ("Section 1", "Scientific exploration and identification of research gaps (global, Saudi, regional)"),
        ("Section 2", "Fourteen research proposals, each with seventeen standard elements and a supervisor comment area"),
        ("Section 3", "Research prioritisation matrix and top-five recommendations"),
        ("Section 4", "Implementation roadmap, approval pathway, timeline and milestones"),
        ("Section 5", "Quality-control review and limitations of this portfolio"),
        ("Section 6", "Consolidated reference list (all references verified, with clickable links)"),
        ("Section 7", "Overall supervisor feedback and research selection"),
    ], [2.6 * cm, CONTENT_W - 2.6 * cm]))
    story.append(PageBreak())

    # TOC
    story.append(P_("Table of Contents", "h1"))
    story.append(Rule())
    toc = TableOfContents()
    toc.levelStyles = [ST["toc0"], ST["toc1"]]
    toc.dotsMinLevel = 0
    story.append(toc)
    story.append(PageBreak())

    # Executive summary
    story += heading("Executive Summary", 0, "exec", "h1")
    story.append(Rule())
    story.append(P_("This portfolio proposes fourteen research projects selected after a structured review of the global, Saudi and regional emergency medicine literature. The projects are deliberately diverse in topic and design (randomised and quasi-experimental studies, retrospective cohorts, prospective cross-sectional and diagnostic accuracy studies, surveys and a systematic review) and span local (university and Majmaah community), national and clinical levels, including innovative work on simulation, digital health and artificial intelligence."))
    story.append(P_("Based on a transparent ten-criterion scoring matrix, the five projects recommended for first consideration are <b>Proposal 1</b> (hands-only CPR and AED training), <b>Proposal 7</b> (systematic review of non-urgent ED visits), <b>Proposal 14</b> (large language models versus clinicians for CTAS triage), <b>Proposal 5</b> (awareness and use of 997 and the Asefny application) and <b>Proposal 4</b> (disaster triage preparedness). It is also recommended that one hospital-based clinical project, preferably <b>Proposal 11</b> (road traffic injuries), begins the approval process early."))
    story.append(Spacer(1, 4))
    rows = []
    for p in PROPOSALS:
        tot = sum(S.SCORES[p["id"]])
        rows.append((str(p["id"]), p["short"], p["level"], p["design_short"], "%d / 50" % tot, S.priority(tot)))
    story.append(data_table(["No.", "Proposal (short title)", "Level", "Design", "Score", "Priority"], rows,
                            [1.0 * cm, 5.9 * cm, 2.9 * cm, 3.4 * cm, 1.6 * cm, 1.8 * cm], center_cols=(0, 4, 5), pad=2.5))
    story.append(PageBreak())

    # Section 1 - exploration
    story += heading("1. Scientific Exploration and Identification of Research Gaps", 0, "s1", "h1")
    story.append(Rule())
    story.extend(h2("1.1 Approach and sources"))
    for t in S.EXPLORATION_METHOD:
        story.append(P_(t))
    story.append(callout(S.ACCESS_DISCLOSURE, bg=GREY_LT, border=NAVY2))
    story.extend(h2("1.2 Global research landscape in emergency medicine"))
    story.append(data_table(["Domain", "Key evidence and open questions"],
                            [(f"<b>{a}</b>", b) for a, b in S.GLOBAL_LANDSCAPE],
                            [4.2 * cm, CONTENT_W - 4.2 * cm]))
    story.extend(h2("1.3 Saudi Arabian research landscape"))
    story.append(data_table(["Domain", "Key evidence and open questions"],
                            [(f"<b>{a}</b>", b) for a, b in S.SAUDI_LANDSCAPE],
                            [4.2 * cm, CONTENT_W - 4.2 * cm]))
    story.extend(h2("1.4 Regional and university context (Majmaah)"))
    for t in S.REGIONAL_LANDSCAPE:
        story.append(P_(t))
    story.append(CondPageBreak(6 * cm))
    story.extend(h2("1.5 Summary of identified research gaps"))
    story.append(P_("The table summarises, for each selected topic, what is already known, what remains unanswered, the level of the gap and the strength of supporting evidence. 'Literature-supported' indicates that published studies document the boundaries of current knowledge; 'proposed opportunity' indicates a plausible local gap that requires preliminary confirmation; 'confirm' indicates that a formal database search should verify the absence of prior studies."))
    story.append(data_table(["No.", "Topic", "Already known", "Remains unanswered", "Gap level", "Evidence status"],
                            [(str(a), b, c, d, e, f) for a, b, c, d, e, f in S.GAP_TABLE],
                            [0.9 * cm, 3.0 * cm, 3.6 * cm, 4.0 * cm, 2.1 * cm, 3.0 * cm], center_cols=(0,)))
    story.extend(h2("1.6 Topics considered but not selected"))
    story.append(data_table(["Topic considered", "Reason and feasible alternative"],
                            S.NOT_SELECTED, [5.2 * cm, CONTENT_W - 5.2 * cm]))
    story.extend(h2("1.7 Distribution of the final fourteen proposals"))
    story.append(data_table(["Portfolio category", "Proposals"], [
        ("A. University / local-level research", "1, 2, 3 (plus regional hospital studies 8, 10, 13 conducted locally)"),
        ("B. Saudi national-level research", "4, 5, 6, 7"),
        ("C. Clinical and emergency medicine research", "8, 9, 10, 11, 12, 13"),
        ("D. Innovative and emerging research", "1 and 3 (simulation-based education), 4 (preparedness), 5 (digital health), 14 (artificial intelligence)"),
    ], [6.2 * cm, CONTENT_W - 6.2 * cm]))
    story.append(P_("Representation is intentionally not equal: clinical topics are numerous because emergency department practice offers many important questions, whereas innovative projects were included only where a genuine, feasible gap exists.", "small"))
    story.append(PageBreak())

    # Section 2 - proposals
    story += heading("2. Research Proposals", 0, "s2", "h1")
    story.append(Rule())
    story.append(P_("Each proposal follows the same seventeen-part structure: (1) title; (2) background; (3) research gap; (4) research question; (5) objectives; (6) hypothesis; (7) study design; (8) population; (9) methodology; (10) statistical analysis; (11) sample size; (12) feasibility; (13) ethics; (14) expected outcomes and impact; (15) limitations; (16) publication potential; (17) references. A ruled area for the Faculty Supervisor's comments follows every proposal."))
    story.append(P_("Citations in square brackets refer to the numbered reference list at the end of each proposal. All sample sizes are preliminary and must be confirmed with a qualified biostatistician; no student should access identifiable patient data before all approvals are obtained."))
    story.append(PageBreak())

    for p in PROPOSALS:
        story += proposal_story(renumber(dict(p)))

    # Section 3 - prioritisation
    story += heading("3. Research Prioritisation Matrix", 0, "s3", "h1")
    story.append(Rule())
    story.extend(h2("3.1 Scoring criteria"))
    story.append(P_("Each proposal was scored from 1 to 5 on ten criteria. To allow a simple unweighted total, all criteria are oriented so that <b>5 is the most favourable</b> score (for example, 5 for cost means the lowest cost)."))
    story.append(data_table(["Code", "Criterion", "Scoring anchor (5 = most favourable)"],
                            [(a, b, c) for a, b, c in S.CRITERIA], [1.3 * cm, 4.3 * cm, CONTENT_W - 5.6 * cm]))
    story.append(PageBreak())
    story.extend(h2("3.2 Prioritisation matrix"))
    hdr = ["No.", "Proposal"] + [c[0] for c in S.CRITERIA] + ["Total", "Priority"]
    rows = []
    for p in PROPOSALS:
        sc = S.SCORES[p["id"]]
        tot = sum(sc)
        rows.append([str(p["id"]), p["short"]] + [str(x) for x in sc] + [str(tot), S.priority(tot)])
    w_num = 0.85 * cm
    w_sc = 0.92 * cm
    w_tot = 1.1 * cm
    w_pr = 1.75 * cm
    w_name = CONTENT_W - w_num - 10 * w_sc - w_tot - w_pr
    mt = data_table(hdr, rows, [w_num, w_name] + [w_sc] * 10 + [w_tot, w_pr],
                    center_cols=tuple([0] + list(range(2, 14))))
    extra = []
    for i, p in enumerate(PROPOSALS, start=1):
        pr = S.priority(sum(S.SCORES[p["id"]]))
        col = {"High": colors.HexColor("#D5EFEC"), "Moderate": colors.HexColor("#FFF2D6"),
               "Lower": colors.HexColor("#F3E1E1")}[pr]
        extra.append(("BACKGROUND", (13, i), (13, i), col))
        extra.append(("BACKGROUND", (12, i), (12, i), colors.HexColor("#E9EDF3")))
    mt.setStyle(TableStyle(extra))
    story.append(mt)
    story.append(Spacer(1, 6))
    story.append(P_("Legend: SIG significance; NOV novelty; FEA feasibility; CST cost; TIM time; ACC access; ETH ethical/administrative complexity; PUB publication potential; KSA relevance to Saudi Arabia; CLB suitability for the club. Maximum total = 50.", "small"))
    story.append(Spacer(1, 6))
    story.extend(h2("3.3 Interpretation and classification"))
    for t in S.PRIORITY_NOTES:
        story.append(P_(t))
    story.append(CondPageBreak(7 * cm))
    story.extend(h2("3.4 Top five projects recommended for first consideration"))
    story.append(data_table(["Rank", "Proposal", "Rationale"],
                            [(str(i + 1), "<b>%d.</b> %s" % (n, t), r) for i, (n, t, r) in enumerate(S.TOP5)],
                            [1.2 * cm, 5.2 * cm, CONTENT_W - 6.4 * cm], center_cols=(0,)))
    story.append(PageBreak())

    # Section 4 - roadmap
    story += heading("4. Implementation Roadmap", 0, "s4", "h1")
    story.append(Rule())
    story.append(callout("<b>Essential rule:</b> Students must not collect identifiable data, approach patients or access medical records for any project until written approval has been obtained from the Majmaah University Research Ethics Committee and, where applicable, from the Ministry of Health/health-cluster IRB and the participating institution. Approval letters should be filed in the project folder before the first data point is collected.",
                         bg=colors.HexColor("#FDF3E7"), border=colors.HexColor("#C77B1A")))
    story.extend(h2("4.1 Selecting the final research projects"))
    story.append(numbered(S.SELECTION_STEPS))
    story.extend(h2("4.2 Recruiting student research teams"))
    story.append(bullets(S.RECRUIT_STEPS))
    story.extend(h2("4.3 Recommended team composition and roles"))
    story.append(P_("A team of 7-12 students per project is recommended, depending on data-collection workload, with clear roles and authorship expectations agreed at the start."))
    story.append(data_table(["Role", "Number", "Responsibilities"], S.TEAM_ROLES,
                            [4.2 * cm, 3.1 * cm, CONTENT_W - 7.3 * cm]))
    story.extend(h2("4.4 Required training for participating students"))
    story.append(bullets(S.TRAINING))
    story.append(CondPageBreak(8 * cm))
    story.extend(h2("4.5 Ethics (IRB) and institutional approval pathway"))
    story.append(data_table(["Step", "Stage", "Actions"], S.IRB_STEPS,
                            [1.2 * cm, 4.2 * cm, CONTENT_W - 5.4 * cm], center_cols=(0,)))
    story.append(P_("All Saudi studies must comply with the Saudi Law of Ethics of Research on Living Creatures and its implementing regulations, guidance of the National Committee of Bioethics, and the requirements of each institutional ethics committee, including applicable personal data protection requirements.", "small"))
    story.append(PageBreak())
    story.extend(h2("4.6 Suggested twelve-month timeline"))
    story.append(P_("The timeline below applies to a typical survey or record-based project; systematic reviews may finish earlier, while multi-site clinical projects may require longer for approvals."))
    story.append(gantt())
    story.append(Spacer(1, 8))
    story.extend(h2("4.7 Milestones and deliverables"))
    story.append(data_table(["ID", "Target", "Milestone", "Deliverable"], S.MILESTONES,
                            [1.1 * cm, 2.0 * cm, 6.3 * cm, CONTENT_W - 9.4 * cm], center_cols=(0, 1)))
    story.append(CondPageBreak(7 * cm))
    story.extend(h2("4.8 Sample timeline for a student project (Proposal 1)"))
    story.append(data_table(["Period", "Activities"], S.SAMPLE_TIMELINE_P1, [2.6 * cm, CONTENT_W - 2.6 * cm]))
    story.append(PageBreak())

    # Section 5 - QC
    story += heading("5. Quality-Control Review and Limitations", 0, "s5", "h1")
    story.append(Rule())
    story.append(P_("Before generation of this document, a scientific and editorial review was conducted against the fifteen checks below. Problems identified during the review (e.g., duplication of existing Majmaah studies, unverifiable statistics, inconsistent citation numbering) were corrected."))
    nref = len(used_refs())
    nnote = sum(1 for k in used_refs() if REFS[k].get("note"))
    qc = []
    for i, (q, s, a) in enumerate(S.QC_CHECKS, start=1):
        s = s.replace("All 54 references", "All %d unique references" % nref)
        a = a.replace("Three entries", "%d entries" % nnote)
        qc.append((str(i), q, s, a))
    story.append(data_table(["No.", "Check", "Result", "Note / action"], qc,
                            [0.9 * cm, 4.6 * cm, 6.6 * cm, CONTENT_W - 12.1 * cm], center_cols=(0,)))
    story.extend(h2("5.1 Limitations of this portfolio"))
    story.append(bullets(S.PORTFOLIO_LIMITATIONS))
    story.append(PageBreak())

    # Section 6 - consolidated references
    story += heading("6. Consolidated Reference List", 0, "s6", "h1")
    story.append(Rule())
    story.append(P_("All unique references cited in this portfolio, in alphabetical order. Each was verified for title, authors, journal, year and identifier; links resolve through the DOI system, PubMed or the official publisher/organisation website.", "small"))
    story.append(Spacer(1, 6))
    for i, k in enumerate(sorted(used_refs(), key=author_year_key), start=1):
        story.append(P_(fmt_ref(k, i), "ref"))
    story.append(PageBreak())

    # Section 7 - final feedback
    story += heading("7. Overall Supervisor Feedback and Research Selection", 0, "s7", "h1")
    story.append(Rule())
    story.append(P_("This section is reserved for the Faculty Supervisor's overall evaluation of the portfolio and final project selection."))
    for title, n in S.FEEDBACK_SECTIONS[:2]:
        story.append(Spacer(1, 6))
        story.append(SupervisorBox(title, n_lines=n, line_gap=27, decision=False, signature=False))
    story.append(PageBreak())
    story.extend(h2("Approved Research Ideas"))
    story.append(selection_table(["Proposal No.", "Student lead / team", "Co-supervisor", "Conditions or modifications"], 7))
    story.append(Spacer(1, 12))
    story.extend(h2("Rejected or Postponed Ideas"))
    story.append(selection_table(["Proposal No.", "Decision (rejected / postponed)", "Reason", "Revisit date"], 6))
    story.append(PageBreak())
    title, n = S.FEEDBACK_SECTIONS[2]
    story.append(SupervisorBox(title, n_lines=n, line_gap=27, decision=False, signature=False))
    story.append(Spacer(1, 18))
    story.append(signoff_table())
    return story


def selection_table(header, n):
    rows = [["", "", "", ""] for _ in range(n)]
    data = [[P_(h, "thead") for h in header]] + rows
    widths = [2.6 * cm, 4.6 * cm, 3.6 * cm, CONTENT_W - 10.8 * cm]
    t = Table(data, colWidths=widths, rowHeights=[None] + [30] * n)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("GRID", (0, 0), (-1, -1), 0.6, colors.HexColor("#9AA6B4")),
        ("VALIGN", (0, 0), (-1, 0), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, 0), 5), ("BOTTOMPADDING", (0, 0), (-1, 0), 5),
    ]))
    return t


def signoff_table():
    data = [[P_("<b>Faculty Supervisor name:</b>", "tcell"), ""],
            [P_("<b>Signature:</b>", "tcell"), ""],
            [P_("<b>Date of review:</b>", "tcell"), ""],
            [P_("<b>Received by (Club President):</b>", "tcell"), ""]]
    t = Table(data, colWidths=[5.6 * cm, CONTENT_W - 5.6 * cm], rowHeights=[30] * 4)
    t.setStyle(TableStyle([
        ("LINEBELOW", (1, 0), (1, -1), 0.6, colors.HexColor("#9AA6B4")),
        ("VALIGN", (0, 0), (-1, -1), "BOTTOM"),
        ("BOX", (0, 0), (-1, -1), 0.8, TEAL),
        ("BACKGROUND", (0, 0), (0, -1), TEAL_LT),
    ]))
    return t


def gantt():
    months = ["M%d" % i for i in range(1, 13)]
    hdr = [P_("Activity", "thead")] + [P_(m, "thead_c") for m in months]
    data = [hdr]
    for task, s, e in S.GANTT:
        data.append([P_(task, "tcell")] + ["" for _ in months])
    w_task = 6.4 * cm
    w_m = (CONTENT_W - w_task) / 12
    t = Table(data, colWidths=[w_task] + [w_m] * 12, repeatRows=1)
    sty = [("BACKGROUND", (0, 0), (-1, 0), NAVY),
           ("GRID", (0, 0), (-1, -1), 0.4, RULE),
           ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
           ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4)]
    for i, (task, s, e) in enumerate(S.GANTT, start=1):
        sty.append(("BACKGROUND", (s, i), (e, i), TEAL))
        if i % 2 == 0:
            sty.append(("BACKGROUND", (0, i), (0, i), GREY_LT))
    t.setStyle(TableStyle(sty))
    return t


_USED = None


def used_refs():
    global _USED
    if _USED is None:
        seen = []
        for p in PROPOSALS:
            for k in p["refs"]:
                if k not in seen:
                    seen.append(k)
        _USED = seen
    return _USED


def section_head(num, text):
    return [CondPageBreak(3.2 * cm), P_('<font color="#1A8A87">%d.</font>&nbsp; %s' % (num, text), "psec")]


def proposal_story(p):
    out = []
    key = "p%d" % p["id"]
    out.append(Anchor("Proposal %d: %s" % (p["id"], p["short"]), 1, key))
    # banner
    banner = Table([[P_('<font name="Head-Bold" size="9" color="#8FD3CF">RESEARCH PROPOSAL %02d</font>' % p["id"],
                        "body_left")],
                    [P_('<font name="Head-Bold" size="14.5" color="#FFFFFF">%s</font>' % p["title"],
                        ParagraphStyle("bt", fontName="Head-Bold", fontSize=14.5, leading=18.5,
                                       textColor=colors.white))]],
                   colWidths=[CONTENT_W])
    banner.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), NAVY),
        ("LEFTPADDING", (0, 0), (-1, -1), 12), ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (0, 0), 10), ("BOTTOMPADDING", (0, -1), (-1, -1), 12),
        ("TOPPADDING", (0, 1), (0, 1), 2), ("BOTTOMPADDING", (0, 0), (0, 0), 0),
        ("LINEBELOW", (0, -1), (-1, -1), 3, TEAL),
    ]))
    out.append(banner)
    meta = Table([[P_("<b>Research level</b><br/>%s" % p["level"], "tcell"),
                   P_("<b>Portfolio category</b><br/>%s" % p["category"], "tcell"),
                   P_("<b>Study design</b><br/>%s" % p["design_short"], "tcell")]],
                 colWidths=[CONTENT_W * 0.27, CONTENT_W * 0.40, CONTENT_W * 0.33])
    meta.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), TEAL_LT),
        ("LINEAFTER", (0, 0), (1, 0), 0.6, colors.white),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8), ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    out.append(meta)
    out.append(Spacer(1, 4))

    out.extend(section_head(1, "Research Title"))
    out.append(P_("<i>%s</i>" % p["title"], "body_left"))

    out.extend(section_head(2, "Research Background"))
    for t in p["background"]:
        out.append(P_(t))

    out.extend(section_head(3, "Identified Research Gap"))
    out.append(P_(p["gap"]))
    out.append(P_('<font name="Head-Bold" color="#1A8A87">Gap classification:</font> %s' % p["gap_type"], "body_left"))

    out.extend(section_head(4, "Research Question"))
    out.append(callout('<i>%s</i><br/><font name="Head-Bold" size="8.8" color="#1A8A87">Framework: %s</font>'
                       % (p["question"], p["framework"])))
    out.append(Spacer(1, 3))

    out.extend(section_head(5, "Research Objectives"))
    out.append(P_('<font name="Head-Bold" color="#14284B">Primary objective.</font> ' + p["primary"]))
    out.append(P_('<font name="Head-Bold" color="#14284B">Secondary objectives.</font>', "body_left"))
    out.append(numbered(p["secondary"]))

    out.extend(section_head(6, "Research Hypothesis"))
    if p.get("hypothesis"):
        h0, h1 = p["hypothesis"]
        out.append(P_("<b>%s</b>%s" % (h0[:3], h0[3:]), "body_left"))
        out.append(P_("<b>%s</b>%s" % (h1[:3], h1[3:]), "body_left"))
    else:
        out.append(P_(p.get("hypothesis_note", "Not applicable (descriptive study).")))

    out.extend(section_head(7, "Type of Research / Study Design"))
    out.append(P_("<b>Design:</b> " + p["design"]))
    out.append(P_("<b>Rationale:</b> " + p["design_why"]))

    out.extend(section_head(8, "Study Population"))
    pop = p["population"]
    inc = "<br/>".join("• " + x for x in pop["inclusion"])
    exc = "<br/>".join("• " + x for x in pop["exclusion"])
    out.append(data_table(None, [
        ("<b>Target population</b>", pop["target"]),
        ("<b>Study setting</b>", pop["setting"]),
        ("<b>Inclusion criteria</b>", inc),
        ("<b>Exclusion criteria</b>", exc),
        ("<b>Sampling method</b>", pop["sampling"]),
    ], [3.6 * cm, CONTENT_W - 3.6 * cm]))

    out.extend(section_head(9, "Proposed Methodology"))
    out.append(bullets(p["methods"]))

    out.extend(section_head(10, "Statistical Analysis"))
    out.append(P_(p["stats"]))

    out.extend(section_head(11, "Estimated Sample Size"))
    out.append(P_(p["sample"]))
    out.append(P_("<i>Preliminary estimate only; the final sample size must be calculated with a qualified biostatistician using pilot or published parameters.</i>", "small"))

    out.extend(section_head(12, "Feasibility Assessment"))
    out.append(data_table(["Aspect", "Assessment"], p["feasibility"], [4.0 * cm, CONTENT_W - 4.0 * cm]))

    out.extend(section_head(13, "Ethical Considerations"))
    out.append(P_(p["ethics"]))

    out.extend(section_head(14, "Expected Outcomes and Impact"))
    out.append(P_(p["impact"]))

    out.extend(section_head(15, "Limitations and Potential Challenges"))
    out.append(bullets(p["limitations"]))

    out.extend(section_head(16, "Publication Potential"))
    out.append(P_(p["publication"]))

    out.extend(section_head(17, "Scientific References"))
    for i, k in enumerate(p["refs"], start=1):
        out.append(P_(fmt_ref(k, i), "ref"))

    out.append(Spacer(1, 10))
    box = SupervisorBox("Faculty Supervisor’s Comments & Suggested Modifications — Proposal %d" % p["id"],
                        n_lines=7, line_gap=26)
    out.append(KeepTogether([box]))
    out.append(PageBreak())
    return out


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), "..",
                                                             "EM_Club_Research_Portfolio_2026-2027.pdf")
    # sanity checks
    for p in PROPOSALS:
        for k in p["refs"]:
            assert k in REFS, (p["id"], k)
        assert len(p["refs"]) >= 3, p["id"]
    unused = set(REFS) - set(used_refs())
    if unused:
        print("WARNING: defined but unused refs:", unused)
    doc = PortfolioDoc(out)
    doc.multiBuild(build_story(), canvasmaker=NumberedCanvas)
    print("written", os.path.abspath(out))


if __name__ == "__main__":
    main()

# -*- coding: utf-8 -*-
"""Research ideas grouped by emergency medicine subspecialty, written for the
Emergency Medicine Club president. Short, plain-language edition.

Usage:  python3 build_subspecialty.py [output.pdf]
"""
import os
import re
import sys

from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (CondPageBreak, KeepTogether, NextPageTemplate, PageBreak, Spacer, Table,
                                TableStyle)

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build as B  # noqa: E402

B.COVER_SUB = "Research Ideas by Emergency Medicine Subspecialty"
B.COVER_TAGLINE = "24 ideas • Where the gaps are • Who each idea suits"
B.COVER_FOR = "President, Emergency Medicine Club"
B.COVER_DOC = "Research ideas for discussion and selection"
B.COVER_FOOT = "Prepared for the Emergency Medicine Club, Majmaah University. For internal discussion."
B.FOOTER_TEXT = "Emergency Medicine Club  |  Research ideas 2026–2027"

S, R, C = "Students", "Residents", "Consultants"

# Each idea: title, suits, design, approval, question, why (with {ref} keys), notes.
AREAS = [
    dict(name="Resuscitation and Cardiac Arrest",
         intro="Saudi Arabia now has a national cardiac arrest registry, but regional evidence is still scattered, and we know little about why bystanders hold back.",
         ideas=[
             dict(title="Survival after out-of-hospital cardiac arrest in the Gulf: a systematic review and meta-analysis",
                  suits=[S, R], design="Systematic review", approval="Not needed (published data)",
                  question="What are the pooled rates of bystander CPR, return of circulation and survival after cardiac arrest in GCC countries?",
                  why="The only regional review is a scoping review of studies up to 2019 and gives no pooled numbers {batt2021}. Since then the Saudi registry has reported 2.9% survival to discharge {sohar2024}.",
                  notes="About 6 months. Register on PROSPERO first."),
             dict(title="Why people hesitate to give CPR to a stranger: gender, legal and cultural barriers in Saudi Arabia",
                  suits=[S], design="Cross-sectional survey", approval="University ethics committee",
                  question="How many adults would hesitate to do CPR on someone of the opposite sex, and why?",
                  why="Saudi surveys measure CPR knowledge and general willingness {alsabri2024}. None asks about the opposite-sex victim or fear of legal trouble. In a US survey, fear of being accused of inappropriate touching was the main reason men gave for not helping a woman {shelton2024}.",
                  notes="Online survey, around 400 adults, short scenarios with male and female victims."),
         ]),
    dict(name="EMS, Disaster and Environmental Medicine",
         intro="EMS and disaster medicine is a Saudi fellowship. Much of the published prehospital data comes from Riyadh city, and smaller governorates such as Majmaah are rarely studied.",
         ideas=[
             dict(title="Prehospital delay and ambulance use in stroke patients from governorates outside Riyadh city",
                  suits=[R, C], design="Prospective cross-sectional", approval="Hospital ethics committee (MOH)",
                  question="How long do stroke patients from smaller governorates take to reach hospital, and does arriving by ambulance shorten the delay?",
                  why="In Riyadh, about 56% of stroke patients arrived after 4.5 hours, and living outside the city predicted delay {alkhathaami2018}. Actual delays for patients from the smaller governorates have not been measured.",
                  notes="200 to 250 patients or caregivers interviewed within 72 hours of admission. Recruitment is the slow part."),
             dict(title="Awareness and use of 997 and the Asefny app: urban versus rural adults",
                  suits=[S], design="Cross-sectional survey", approval="University ethics committee",
                  question="Do rural residents know and use 997 and Asefny less than urban residents?",
                  why="The latest national figure (66% knew the EMS number) comes from a survey run during COVID-19 and does not compare rural with urban areas {aljabri2022}.",
                  notes="Online plus face-to-face in villages; around 800 adults."),
             dict(title="Mass-casualty triage skills of final-year medical students and interns across Saudi colleges",
                  suits=[S], design="Multicentre survey with triage cases", approval="University ethics committee",
                  question="How many final-year students and interns triage standard mass-casualty cases correctly?",
                  why="Saudi evidence comes from small single-site studies, such as a simulation study of 32 students {doumi2024}. The Kingdom's mass gatherings make this a practical question {memish2014}.",
                  notes="15 to 20 START triage cases online; collaborators in at least six colleges."),
             dict(title="Heat illness knowledge and prevention among outdoor workers in Majmaah",
                  suits=[S], design="Cross-sectional survey", approval="University ethics committee + employer permission",
                  question="Do outdoor workers recognise heatstroke and know what to do?",
                  why="Saudi heat-illness research has focused on pilgrims and military personnel {aljohani2023}. Heatstroke carries high ICU mortality {bouchama2022}.",
                  notes="Interview-based, in several languages; around 420 workers."),
         ]),
    dict(name="Paediatric Emergency Medicine",
         intro="Paediatric EM is a Saudi fellowship. Two well-known problems lack local data: overuse of head CT and diabetic ketoacidosis at first diagnosis.",
         ideas=[
             dict(title="Head CT use and PECARN rule adherence in children with minor head injury",
                  suits=[R], design="Retrospective cohort", approval="Hospital ethics committee (MOH)",
                  question="How many low-risk children by PECARN still get a head CT?",
                  why="PECARN identifies children who can safely skip CT {kuppermann2009}. In Qatar, more than 45% of paediatric head CTs for minor injury were not indicated {elmoheen2021}. We found no Saudi audit of actual practice.",
                  notes="400 to 500 children over two years; a paediatric EM supervisor is needed."),
             dict(title="Diabetic ketoacidosis at diagnosis of type 1 diabetes in Saudi children: a meta-analysis",
                  suits=[S], design="Systematic review", approval="Not needed (published data)",
                  question="How often do Saudi children present in DKA at diagnosis, and is it improving?",
                  why="A 2012 international review placed Saudi Arabia among the highest rates in the world {ushersmith2012}. There is no updated Saudi pooled estimate.",
                  notes="About 6 months; include time trends."),
         ]),
    dict(name="Toxicology and Envenomation",
         intro="Toxicology is a recognised subspecialty internationally. Scorpion and snake bites are a local problem, but the evidence is thin.",
         ideas=[
             dict(title="Snakebite outcomes and antivenom use in the Arabian Peninsula: a systematic review",
                  suits=[S, R], design="Systematic review", approval="Not needed (published data)",
                  question="How often do snakebite patients develop systemic toxicity, receive antivenom, or die?",
                  why="The only regional synthesis is a 2023 scoping review (28 studies, 16,602 cases) with no pooled outcomes {alsahabi2023}.",
                  notes="About 6 months."),
             dict(title="First aid for scorpion stings: what residents of Majmaah and nearby villages know and do",
                  suits=[S], design="Cross-sectional survey", approval="University ethics committee",
                  question="Do residents know the correct first aid for a scorpion sting and when to go to hospital?",
                  why="Saudi scorpion studies are hospital-based {alhelail2024}. We found no community survey of first-aid knowledge or harmful traditional practices.",
                  notes="Around 400 adults; face-to-face in villages."),
         ]),
    dict(name="Emergency Ultrasound (POCUS)",
         intro="Saudi studies show emergency physicians use ultrasound but face training and workflow barriers. Nobody has looked at department-level credentialing and quality review.",
         ideas=[
             dict(title="POCUS credentialing, image archiving and quality review in Saudi emergency departments",
                  suits=[C], design="National survey of ED directors", approval="University ethics committee",
                  question="How many Saudi EDs have a formal process for credentialing doctors in POCUS and reviewing their scans?",
                  why="Saudi studies ask individual doctors about knowledge and barriers {almulhim2024} {abuguyan2024}. None describes department policies.",
                  notes="One respondent per ED (director or ultrasound lead); needs consultant networks to reach them."),
         ]),
    dict(name="Critical Care and Sepsis in the ED",
         intro="Critically ill patients sometimes wait in the ED for an ICU bed or a transfer. Saudi data come from tertiary centres.",
         ideas=[
             dict(title="qSOFA, NEWS2 or SIRS at triage: which predicts death in suspected infection?",
                  suits=[R], design="Retrospective accuracy study", approval="Hospital ethics committee (MOH)",
                  question="Which triage score best predicts in-hospital death in adults with suspected infection at a regional hospital?",
                  why="A Riyadh study found NEWS sensitive but not specific {almutary2020}. The 2021 sepsis guidelines advise against using qSOFA alone {evans2021}. No head-to-head comparison exists from a regional Saudi hospital.",
                  notes="540 to 810 patients; ROC analysis."),
             dict(title="ED boarding of critically ill patients and mortality in a regional hospital",
                  suits=[R, C], design="Retrospective cohort", approval="Hospital ethics committee (MOH)",
                  question="Is longer ED boarding before ICU admission or transfer linked to higher mortality outside tertiary centres?",
                  why="At a tertiary centre in Riyadh, longer boarding before ICU admission was linked to higher mortality {alqahtani2017}. Regional hospitals rely on transfers and have not been studied.",
                  notes="12 to 24 months of ICU admissions and transfers."),
         ]),
    dict(name="Geriatric Emergency Medicine",
         intro="Saudi ED research on older patients has focused mainly on falls. Delirium has not been studied.",
         ideas=[
             dict(title="How often is delirium present, and missed, in older patients in a Saudi ED?",
                  suits=[R], design="Prospective cross-sectional", approval="Hospital ethics committee (MOH)",
                  question="What proportion of patients aged 65 and over have delirium on the 4AT, and how many were recognised by the treating team?",
                  why="We found no Saudi ED delirium study; local work has looked at falls {aleid2023}. Elsewhere, delirium detection dropped back once dedicated screeners left {megedbook2024}.",
                  notes="About 300 consecutive patients; residents can be trained on the 4AT in under an hour."),
         ]),
    dict(name="Pain and Haematological Emergencies",
         intro="Sickle cell disease is common in Saudi Arabia, and delayed pain relief is a known problem worldwide.",
         ideas=[
             dict(title="Time to first analgesia for sickle cell pain crises in the ED: a meta-analysis",
                  suits=[S], design="Systematic review", approval="Not needed (published data)",
                  question="How long do patients in a sickle cell pain crisis wait for their first analgesic, and what causes delay?",
                  why="Guidelines call for rapid analgesia {brandow2020}. A 2025 study found a median of 65 minutes with ESI 2 triage against 178 minutes with ESI 3 {abuhaimed2025}. No review has pooled this.",
                  notes="About 6 months."),
             dict(title="Sickle cell patients' own experience of ED pain management and stigma",
                  suits=[S, R], design="Cross-sectional survey", approval="Hospital ethics committee (clinic recruitment)",
                  question="How do adults with sickle cell disease rate their last ED visit for a pain crisis?",
                  why="Saudi studies on sickle cell pain management in the ED surveyed doctors and nurses. We found none that asks patients directly.",
                  notes="250 to 350 adults through haematology clinics and support groups."),
         ]),
    dict(name="ED Operations, Quality and Patient Safety",
         intro="Crowding, boarding and return visits are core ED quality issues. National data exist; patient-level regional data do not.",
         ideas=[
             dict(title="Return visits within 72 hours that end in admission: how many were preventable?",
                  suits=[R, C], design="Retrospective cohort with case review", approval="Hospital ethics committee (MOH)",
                  question="What proportion of 72-hour returns admitted to hospital were judged preventable by two reviewers?",
                  why="Saudi studies describe return rates and broad causes in tertiary hospitals {alshahrani2020}. None applies a structured preventability review in a regional ED. The 72-hour cut-off itself is debated {rising2014}.",
                  notes="Needs two consultant reviewers; non-punitive, coordinated with the quality department."),
             dict(title="Length of stay and boarding in a regional ED: what drives the delays?",
                  suits=[R], design="Retrospective cohort", approval="Hospital ethics committee (MOH)",
                  question="Which patient and system factors predict an ED stay longer than 4 hours?",
                  why="A national analysis of 1.57 million visits found shift, season, acuity and hospital type predicted longer stays {alharbi2023}, but did not look at patient-level detail in regional hospitals. Boarding is linked to mortality {singer2011}.",
                  notes="500 to 800 visits sampled across a year."),
             dict(title="Does Ramadan change ED attendance? A systematic review and meta-analysis",
                  suits=[S], design="Systematic review", approval="Not needed (published data)",
                  question="Do ED visit numbers and presentation patterns change during Ramadan?",
                  why="The existing reviews are narrative and searched a single database {beshyah2023}. Individual studies disagree.",
                  notes="About 6 months; locally relevant and quick to start."),
             dict(title="Non-urgent ED visits in Saudi Arabia: a meta-analysis",
                  suits=[S], design="Systematic review", approval="Not needed (published data)",
                  question="What share of Saudi ED visits are non-urgent, and why do patients come?",
                  why="Single-centre studies report very different figures, for example 78.5% of non-life-threatening visits in one western hospital {alotmy2020}. There is no pooled estimate.",
                  notes="About 6 months."),
         ]),
    dict(name="Palliative and End-of-Life Care in the ED",
         intro="Some patients die in the ED before they are admitted. Saudi research on do-not-resuscitate decisions consists of attitude surveys, not audits of practice.",
         ideas=[
             dict(title="End-of-life care for patients who die in the ED: code status, timing and palliative input",
                  suits=[R, C], design="Retrospective record review", approval="Hospital ethics committee (MOH)",
                  question="For patients who die in the ED, how often is code status documented before death, and how often is palliative care involved?",
                  why="Saudi studies of DNR describe clinicians' attitudes {madadin2019}. We found no audit of what actually happens to dying patients in the ED.",
                  notes="All ED deaths over 1 to 2 years; sensitive topic, so involve the hospital ethics office early."),
         ]),
    dict(name="Education, Artificial Intelligence and Workforce",
         intro="AI triage tools are being tested worldwide. Burnout and violence affect ED staff, but Saudi evidence is mostly from single regions.",
         ideas=[
             dict(title="AI language models versus triage nurses and interns for CTAS triage",
                  suits=[S, R], design="Comparative study using written cases", approval="University ethics committee",
                  question="Do current AI models assign CTAS levels as accurately as experienced triage nurses and interns?",
                  why="Studies abroad used other triage systems and found AI tends to over-triage {masanneck2024} {arslan2025}. A Riyadh study compared one chatbot with physicians {alomari2025}. None compared AI with nurses and interns using CTAS.",
                  notes="120 to 150 written cases; no patient data involved."),
             dict(title="Burnout among ED physicians and nurses across Saudi regions",
                  suits=[R], design="Multicentre survey", approval="University + each hospital",
                  question="How common is burnout among ED staff, and is it linked to boarding, night shifts and violence?",
                  why="About 40% of emergency physicians show high emotional exhaustion worldwide {zhang2020}. Saudi studies cover single regions {alqahtani2019} or residents only {jamjoom2024}.",
                  notes="500 to 600 staff across 8 to 10 EDs."),
             dict(title="Violence against ED staff in Saudi Arabia: a meta-analysis",
                  suits=[S], design="Systematic review", approval="Not needed (published data)",
                  question="What is the pooled prevalence of verbal and physical violence against Saudi ED staff?",
                  why="A 2025 Saudi review covered all settings and did not pool results {alhomoud2025}. Globally, 61.9% of health workers report exposure {liu2019}.",
                  notes="About 6 months."),
         ]),
]

PICKS = [
    ("Students, starting now", "Ideas 1 (cardiac arrest review) and 15 (sickle cell analgesia review): no ethics approval, publishable, about 6 months each. Idea 2 (CPR barriers survey) needs only university approval."),
    ("Residents", "Idea 14 (delirium in older patients) and Idea 7 (PECARN audit): clear gaps, a single site is enough, strong clinical value."),
    ("Consultants", "Idea 11 (POCUS credentialing) and Idea 17 (preventable return visits): need senior access and reviewers, and give results the department can act on."),
]

# ---------------------------------------------------------------- styles --
T = B.colors
ST = dict(
    intro=ParagraphStyle("intro", fontName="Body", fontSize=10.4, leading=14.6, textColor=B.TEXT, spaceAfter=6),
    area=ParagraphStyle("area", fontName="Head-Bold", fontSize=15, leading=19, textColor=B.NAVY, spaceBefore=4,
                        spaceAfter=2),
    areaintro=ParagraphStyle("areaintro", fontName="Body-Italic", fontSize=10, leading=13.6, textColor=T.HexColor("#3D4651"),
                             spaceAfter=6),
    ctitle=ParagraphStyle("ctitle", fontName="Head-Bold", fontSize=11.3, leading=14.2, textColor=B.NAVY),
    cmeta=ParagraphStyle("cmeta", fontName="Head", fontSize=8.8, leading=11.5, textColor=B.TEAL),
    cbody=ParagraphStyle("cbody", fontName="Body", fontSize=9.6, leading=12.9, textColor=B.TEXT),
    ref=ParagraphStyle("ref2", parent=B.ST["ref"], fontSize=8.8, leading=11.4, spaceAfter=3),
)

REF_ORDER = []


def cite(text):
    def rep(m):
        k = m.group(1)
        if k not in REF_ORDER:
            REF_ORDER.append(k)
        return '<font color="%s">[%d]</font>' % (B.LINK, REF_ORDER.index(k) + 1)
    out = re.sub(r"\{(\w+)\}", rep, text)
    return out.replace("] <font", "]<font").replace("]</font> <font", "]</font><font")


def card(n, idea):
    lab = lambda s: '<font name="Head-Bold" color="#14284B">%s</font> ' % s  # noqa: E731
    rows = [
        [B.P_('<font color="#1A8A87">%d.</font> %s' % (n, idea["title"]), ST["ctitle"])],
        [B.P_("Suits: <b>%s</b> &nbsp;•&nbsp; Design: %s &nbsp;•&nbsp; Approval: %s"
              % (" / ".join(idea["suits"]), idea["design"], idea["approval"]), ST["cmeta"])],
        [B.P_(lab("Question.") + idea["question"], ST["cbody"])],
        [B.P_(lab("Why it is open.") + cite(idea["why"]), ST["cbody"])],
        [B.P_(lab("Practical notes.") + idea["notes"], ST["cbody"])],
    ]
    t = Table(rows, colWidths=[B.CONTENT_W])
    t.setStyle(TableStyle([
        ("LINEBEFORE", (0, 0), (0, -1), 3, B.TEAL),
        ("BACKGROUND", (0, 0), (-1, -1), T.HexColor("#F7F9FB")),
        ("LEFTPADDING", (0, 0), (-1, -1), 10), ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 1.5), ("BOTTOMPADDING", (0, 0), (-1, -1), 1.5),
        ("TOPPADDING", (0, 0), (0, 0), 7), ("BOTTOMPADDING", (0, -1), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 1), (0, 1), 4),
    ]))
    return KeepTogether([t, Spacer(1, 8)])


def story():
    st = [NextPageTemplate("main"), PageBreak()]
    # page 2: short note + overview table
    st.append(B.Anchor("About this document", 0, "about"))
    st.append(B.P_("About this document", "h1"))
    st.append(B.Rule())
    st.append(B.P_("This is a list of 24 research ideas for the club, grouped by emergency medicine subspecialty. Each one targets a question we could not find answered in the published literature, either in Saudi Arabia or at all.", ST["intro"]))
    st.append(B.P_("<b>How the subspecialties were chosen.</b> We started with the two Saudi EM fellowships (paediatric EM, and EMS and disaster medicine) and added areas recognised internationally: resuscitation, toxicology, emergency ultrasound, critical care, geriatrics, palliative care, ED operations and quality, and education and AI. For each one, we searched for Saudi and international studies and kept only the questions that are still open.", ST["intro"]))
    st.append(B.P_("<b>Who each idea suits.</b> <i>Students</i>: surveys and systematic reviews that need a supervisor but no hospital records. <i>Residents</i>: studies on ED patients or records, which need hospital ethics approval. <i>Consultants</i>: multicentre or department-level work that needs senior access.", ST["intro"]))
    st.append(B.P_("<b>Before starting any idea</b>, the team should confirm the gap with a formal PubMed and Scopus search (and PROSPERO for reviews). Our searches were done through web search, without direct database access. No one should touch patient records before ethics approval.", ST["intro"]))
    st.append(Spacer(1, 4))
    rows = []
    n = 0
    for a in AREAS:
        for i in a["ideas"]:
            n += 1
            rows.append((str(n), i["title"], a["name"], " / ".join(i["suits"])))
    st.append(B.data_table(["No.", "Idea", "Subspecialty", "Suits"], rows,
                           [0.9 * cm, 8.6 * cm, 4.4 * cm, B.CONTENT_W - 13.9 * cm], center_cols=(0,), pad=2.6))
    st.append(Spacer(1, 14))
    st.append(CondPageBreak(8 * cm))
    st.append(B.Anchor("Where to start", 0, "start"))
    st.append(B.P_("Where to start", ST["area"]))
    st.append(B.Rule(thickness=0.9, space=2))
    st.append(B.P_("If the club wants a few projects running this year, these are the easiest to launch for each group.", ST["areaintro"]))
    st.append(B.data_table(None, [("<b>%s</b>" % a, b) for a, b in PICKS], [4.0 * cm, B.CONTENT_W - 4.0 * cm], pad=5))
    st.append(PageBreak())

    # ideas by area
    n = 0
    for a in AREAS:
        st.append(CondPageBreak(7 * cm))
        st.append(B.Anchor(a["name"], 0, "a%d" % AREAS.index(a)))
        st.append(B.P_(a["name"], ST["area"]))
        st.append(B.Rule(thickness=0.9, space=2))
        st.append(B.P_(a["intro"], ST["areaintro"]))
        for i in a["ideas"]:
            n += 1
            st.append(card(n, i))
        st.append(Spacer(1, 6))

    # references
    st.append(PageBreak())
    st.append(B.Anchor("References", 0, "refs"))
    st.append(B.P_("References", ST["area"]))
    st.append(B.Rule(thickness=0.9, space=2))
    st.append(Spacer(1, 4))
    for k_i, k in enumerate(REF_ORDER, start=1):
        st.append(B.P_(B.fmt_ref(k, k_i), ST["ref"]))
    return st


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "..",
                                                             "EM_Research_Ideas_by_Subspecialty.pdf")
    for a in AREAS:
        for i in a["ideas"]:
            for k in re.findall(r"\{(\w+)\}", i["why"]):
                assert k in B.REFS, k
    # build twice so reference numbering is stable (cite() fills REF_ORDER while building the story)
    doc = B.PortfolioDoc(out)
    doc.multiBuild(story(), canvasmaker=B.NumberedCanvas)
    print("written", os.path.abspath(out), "ideas:", sum(len(a["ideas"]) for a in AREAS), "refs:", len(REF_ORDER))


if __name__ == "__main__":
    main()

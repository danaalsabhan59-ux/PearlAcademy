# -*- coding: utf-8 -*-
"""Verified reference database for the EM Club Research Portfolio.

Every entry below was checked (title, authors, journal, year, DOI/PMID)
against publisher pages, PubMed/PMC records, DOAJ or institutional
repositories via web search in November 2026. Where an element could not
be confirmed (e.g., a DOI was not located), it is explicitly flagged in the
'note' field rather than guessed.
"""

REFS = {
    "hasselqvist2015": dict(
        authors="Hasselqvist-Ax I, Riva G, Herlitz J, et al.",
        title="Early cardiopulmonary resuscitation in out-of-hospital cardiac arrest",
        journal="N Engl J Med", year="2015", details="372(24):2307-2315",
        doi="10.1056/NEJMoa1405796"),
    "sohar2024": dict(
        authors="Alabdali A, Alghamdi A, Binhotan M, Alshibani A, Alharbi M, Alghaith A, et al.",
        title="Epidemiology and outcomes of out of hospital cardiac arrest in Saudi Arabia: findings from the Saudi Out of Hospital Cardiac Arrest Registry (SOHAR)",
        journal="Resusc Plus", year="2024", details="17:100516",
        doi="10.1016/j.resplu.2023.100516", pmid="38076387"),
    "almutairi2023": dict(
        authors="Almutairi et al.",
        title="Awareness, knowledge, and attitudes regarding basic life support among the general population in the Al-Majma'ah region, Saudi Arabia",
        journal="Cureus", year="2023", details="15(11):e48613",
        doi="10.7759/cureus.48613", pmid="38084172",
        note="Full author list available on the PMC record (PMC10710765)."),
    "panchal2020": dict(
        authors="Panchal AR, Bartos JA, Cabañas JG, et al.",
        title="Part 3: Adult basic and advanced life support: 2020 American Heart Association Guidelines for Cardiopulmonary Resuscitation and Emergency Cardiovascular Care",
        journal="Circulation", year="2020", details="142(16 Suppl 2):S366-S468",
        doi="10.1161/CIR.0000000000000916"),
    "greif2021": dict(
        authors="Greif R, Lockey A, Breckwoldt J, et al.",
        title="European Resuscitation Council Guidelines 2021: Education for resuscitation",
        journal="Resuscitation", year="2021", details="161:388-407",
        doi="10.1016/j.resuscitation.2021.02.016"),
    "cheng2018": dict(
        authors="Cheng A, Nadkarni VM, Mancini MB, et al.",
        title="Resuscitation education science: educational strategies to improve outcomes from cardiac arrest: a scientific statement from the American Heart Association",
        journal="Circulation", year="2018", details="138(6):e82-e122",
        doi="10.1161/CIR.0000000000000583"),
    "mcgaghie2011": dict(
        authors="McGaghie WC, Issenberg SB, Cohen ER, Barsuk JH, Wayne DB.",
        title="Does simulation-based medical education with deliberate practice yield better results than traditional clinical education? A meta-analytic comparative review of the evidence",
        journal="Acad Med", year="2011", details="86(6):706-711",
        doi="10.1097/ACM.0b013e318217e119", pmid="21512370"),
    "cook2011": dict(
        authors="Cook DA, Hatala R, Brydges R, Zendejas B, Szostek JH, Wang AT, Erwin PJ, Hamstra SJ.",
        title="Technology-enhanced simulation for health professions education: a systematic review and meta-analysis",
        journal="JAMA", year="2011", details="306(9):978-988",
        doi="10.1001/jama.2011.1234"),
    "alkhathaami2018": dict(
        authors="Al Khathaami AM, Mohammad YO, Alibrahim FS, Jradi HA.",
        title="Factors associated with late arrival of acute stroke patients to emergency department in Saudi Arabia",
        journal="SAGE Open Med", year="2018", details="6:2050312118776719",
        doi="10.1177/2050312118776719", pmid="29844910"),
    "almaymuni2025": dict(
        authors="Al-Maymuni BA, Sirajudeen MS.",
        title="Knowledge of stroke risk factors and warning signs among the residents of Majmaah, Saudi Arabia: a cross-sectional study",
        journal="J Clin Diagn Res", year="2025", details="",
        url="https://library.kab.ac.ug/Record/doaj-art-7973e52e57eb40678ca812dcc45c1e08",
        note="DOI not located during verification; link is the DOAJ-indexed record. Confirm the DOI on the JCDR website before citing."),
    "aroor2017": dict(
        authors="Aroor S, Singh R, Goldstein LB.",
        title="BE-FAST (Balance, Eyes, Face, Arm, Speech, Time): reducing the proportion of strokes missed using the FAST mnemonic",
        journal="Stroke", year="2017", details="48(2):479-481",
        doi="10.1161/STROKEAHA.116.015169", pmid="28082668"),
    "gbdstroke2021": dict(
        authors="GBD 2019 Stroke Collaborators (Feigin VL, et al.).",
        title="Global, regional, and national burden of stroke and its risk factors, 1990-2019: a systematic analysis for the Global Burden of Disease Study 2019",
        journal="Lancet Neurol", year="2021", details="20(10):795-820",
        doi="10.1016/S1474-4422(21)00252-0", pmid="34487721"),
    "powers2019": dict(
        authors="Powers WJ, Rabinstein AA, Ackerson T, et al.",
        title="Guidelines for the early management of patients with acute ischemic stroke: 2019 update to the 2018 guidelines",
        journal="Stroke", year="2019", details="50(12):e344-e418",
        doi="10.1161/STR.0000000000000211"),
    "moser2006": dict(
        authors="Moser DK, Kimble LP, Alberts MJ, et al.",
        title="Reducing delay in seeking treatment by patients with acute coronary syndrome and stroke: a scientific statement from the American Heart Association",
        journal="Circulation", year="2006", details="114(2):168-182",
        doi="10.1161/CIRCULATIONAHA.106.176040", pmid="16801458"),
    "doumi2024": dict(
        authors="Doumi R, Alassaf W, Aljahany M, Aldobeaban S, Mirghani HA, BinSaleh Y, Ibrahim SF.",
        title="The effectiveness and benefits of disaster simulation training for undergraduate medical students in Saudi Arabia",
        journal="Adv Med Educ Pract", year="2024", details="15:707-714",
        doi="10.2147/AMEP.S453879"),
    "memish2014": dict(
        authors="Memish ZA, Zumla A, Alhakeem RF, et al.",
        title="Hajj: infectious disease surveillance and control",
        journal="Lancet", year="2014", details="383(9934):2073-2082",
        doi="10.1016/S0140-6736(14)60381-0"),
    "hstp": dict(
        authors="Saudi Vision 2030.",
        title="Health Sector Transformation Program (Vision Realization Program)",
        journal="Official programme webpage", year="accessed 2026", details="",
        url="https://www.vision2030.gov.sa/en/explore/programs/health-sector-transformation-program"),
    "aljabri2022": dict(
        authors="Aljabri D, Albinali H.",
        title="Public awareness and use of 997 emergency medical service phone number during the COVID-19 pandemic",
        journal="Front Public Health", year="2022", details="10:937202",
        doi="10.3389/fpubh.2022.937202"),
    "althumairi2020": dict(
        authors="Althumairi A, Alnasser Z, Alsadeq S, Al-Kahtani N, Aljaffary A.",
        title="Mobile ambulatory application Asafny and traditional phone request 997: a comparative cross-sectional study",
        journal="Open Access Emerg Med", year="2020", details="12:471-480",
        doi="10.2147/OAEM.S279969"),
    "alqahtani2019": dict(
        authors="Alqahtani AM, Awadalla NJ, Alsaleem SA, Alsamghan AS, Alsaleem MA.",
        title="Burnout syndrome among emergency physicians and nurses in Abha and Khamis Mushait cities, Aseer region, southwestern Saudi Arabia",
        journal="ScientificWorldJournal", year="2019", details="2019:4515972",
        doi="10.1155/2019/4515972", pmid="30906233"),
    "zhang2020": dict(
        authors="Zhang Q, Mu MC, He Y, Cai ZL, Li ZC.",
        title="Burnout in emergency medicine physicians: a meta-analysis and systematic review",
        journal="Medicine (Baltimore)", year="2020", details="99(32):e21462",
        doi="10.1097/MD.0000000000021462", pmid="32769876"),
    "kristensen2005": dict(
        authors="Kristensen TS, Borritz M, Villadsen E, Christensen KB.",
        title="The Copenhagen Burnout Inventory: a new tool for the assessment of burnout",
        journal="Work Stress", year="2005", details="19(3):192-207",
        doi="10.1080/02678370500297720"),
    "jamjoom2024": dict(
        authors="Jamjoom RS, et al.",
        title="Assessment of burnout among emergency medicine residents in Saudi Arabia: a cross-sectional survey",
        journal="Saudi J Emerg Med", year="2024", details="5(2):110-118",
        doi="10.24911/SJEMed.72-1696899190",
        note="Co-author list should be confirmed on the journal page."),
    "uscherpines2013": dict(
        authors="Uscher-Pines L, Pines J, Kellermann A, Gillen E, Mehrotra A.",
        title="Emergency department visits for nonurgent conditions: systematic literature review",
        journal="Am J Manag Care", year="2013", details="19(1):47-59",
        pmid="23379744",
        url="https://www.ajmc.com/journals/issue/2013/2013-1-vol19-n1/emergency-department-visits-for-nonurgent-conditions-systematic-literature-review"),
    "alyasin2014": dict(
        authors="Alyasin A, Douglas C.",
        title="Reasons for non-urgent presentations to the emergency department in Saudi Arabia",
        journal="Int Emerg Nurs", year="2014", details="22(4):220-225",
        doi="10.1016/j.ienj.2014.03.001"),
    "alotmy2020": dict(
        authors="Al-Otmy SS, Abduljabbar AZ, Al-Raddadi RM, Farahat F.",
        title="Factors associated with non-urgent visits to the emergency department in a tertiary care centre, western Saudi Arabia: cross-sectional study",
        journal="BMJ Open", year="2020", details="10(10):e035951",
        doi="10.1136/bmjopen-2019-035951"),
    "page2021": dict(
        authors="Page MJ, McKenzie JE, Bossuyt PM, et al.",
        title="The PRISMA 2020 statement: an updated guideline for reporting systematic reviews",
        journal="BMJ", year="2021", details="372:n71",
        doi="10.1136/bmj.n71"),
    "hoot2008": dict(
        authors="Hoot NR, Aronsky D.",
        title="Systematic review of emergency department crowding: causes, effects, and solutions",
        journal="Ann Emerg Med", year="2008", details="52(2):126-136",
        doi="10.1016/j.annemergmed.2008.03.014", pmid="18433933"),
    "morley2018": dict(
        authors="Morley C, Unwin M, Peterson GM, Stankovich J, Kinsman L.",
        title="Emergency department crowding: a systematic review of causes, consequences and solutions",
        journal="PLoS One", year="2018", details="13(8):e0203316",
        doi="10.1371/journal.pone.0203316", pmid="30161242"),
    "singer2011": dict(
        authors="Singer AJ, Thode HC Jr, Viccellio P, Pines JM.",
        title="The association between length of emergency department boarding and mortality",
        journal="Acad Emerg Med", year="2011", details="18(12):1324-1329",
        doi="10.1111/j.1553-2712.2011.01236.x"),
    "alharbi2023": dict(
        authors="Alharbi AA, Muhayya M, Alkhudairy R, Alhussain AA, Muaddi MA, Alqassim AY, AlOmar RS, Alabdulaali MK.",
        title="The pattern of emergency department length of stay in Saudi Arabia: an epidemiological nationwide analysis of secondary surveillance data",
        journal="Front Public Health", year="2023", details="11:1265707",
        doi="10.3389/fpubh.2023.1265707"),
    "alqahtani2017": dict(
        authors="Al-Qahtani S, Alsultan A, Haddad S, et al.",
        title="The association of duration of boarding in the emergency room and the outcome of patients admitted to the intensive care unit",
        journal="BMC Emerg Med", year="2017", details="17:34",
        doi="10.1186/s12873-017-0143-4"),
    "sepsis3": dict(
        authors="Singer M, Deutschman CS, Seymour CW, et al.",
        title="The Third International Consensus Definitions for Sepsis and Septic Shock (Sepsis-3)",
        journal="JAMA", year="2016", details="315(8):801-810",
        doi="10.1001/jama.2016.0287", pmid="26903338"),
    "evans2021": dict(
        authors="Evans L, Rhodes A, Alhazzani W, et al.",
        title="Surviving Sepsis Campaign: international guidelines for management of sepsis and septic shock 2021",
        journal="Crit Care Med", year="2021", details="49(11):e1063-e1143",
        doi="10.1097/CCM.0000000000005337", pmid="34605781"),
    "rudd2020": dict(
        authors="Rudd KE, Johnson SC, Agesa KM, et al.",
        title="Global, regional, and national sepsis incidence and mortality, 1990-2017: analysis for the Global Burden of Disease Study",
        journal="Lancet", year="2020", details="395(10219):200-211",
        doi="10.1016/S0140-6736(19)32989-7", pmid="31954465"),
    "freund2017": dict(
        authors="Freund Y, Lemachatti N, Krastinova E, et al.",
        title="Prognostic accuracy of Sepsis-3 criteria for in-hospital mortality among patients with suspected infection presenting to the emergency department",
        journal="JAMA", year="2017", details="317(3):301-308",
        doi="10.1001/jama.2016.20329"),
    "almutary2020": dict(
        authors="Almutary A, Althunayyan S, Alenazi K, et al.",
        title="National Early Warning Score (NEWS) as prognostic triage tool for septic patients",
        journal="Infect Drug Resist", year="2020", details="13:3843-3851",
        doi="10.2147/IDR.S275390"),
    "stard2015": dict(
        authors="Bossuyt PM, Reitsma JB, Bruns DE, et al.",
        title="STARD 2015: an updated list of essential items for reporting diagnostic accuracy studies",
        journal="BMJ", year="2015", details="351:h5527",
        doi="10.1136/bmj.h5527", pmid="26511519"),
    "kuppermann2009": dict(
        authors="Kuppermann N, Holmes JF, Dayan PS, et al.",
        title="Identification of children at very low risk of clinically-important brain injuries after head trauma: a prospective cohort study",
        journal="Lancet", year="2009", details="374(9696):1160-1170",
        doi="10.1016/S0140-6736(09)61558-0"),
    "babl2017": dict(
        authors="Babl FE, Borland ML, Phillips N, et al.",
        title="Accuracy of PECARN, CATCH, and CHALICE head injury decision rules in children: a prospective cohort study",
        journal="Lancet", year="2017", details="389(10087):2393-2402",
        doi="10.1016/S0140-6736(17)30555-X"),
    "pearce2012": dict(
        authors="Pearce MS, Salotti JA, Little MP, et al.",
        title="Radiation exposure from CT scans in childhood and subsequent risk of leukaemia and brain tumours: a retrospective cohort study",
        journal="Lancet", year="2012", details="380(9840):499-505",
        doi="10.1016/S0140-6736(12)60815-0"),
    "elmoheen2021": dict(
        authors="Elmoheen A, Salem W, Bashir K.",
        title="Reducing unnecessary CT scan of the head for minor paediatric head injuries at the emergency department",
        journal="BMJ Open Qual", year="2021", details="10(1):e000973",
        doi="10.1136/bmjoq-2020-000973"),
    "mansuri2015": dict(
        authors="Mansuri FA, Al-Zalabani AH, Zalat MM, Qabshawi RI.",
        title="Road safety and road traffic accidents in Saudi Arabia: a systematic review of existing evidence",
        journal="Saudi Med J", year="2015", details="36(4):418-424",
        doi="10.15537/smj.2015.4.10003"),
    "who2023road": dict(
        authors="World Health Organization.",
        title="Global status report on road safety 2023",
        journal="Geneva: WHO", year="2023", details="ISBN 978-92-4-008651-7",
        url="https://www.who.int/publications/i/item/9789240086517"),
    "albabtain2022": dict(
        authors="Al Babtain I, Alabdulkarim A, Alquwaiee G, Alsuwaid S, Alrushid E, Albalawi M.",
        title="Outcomes of road traffic accidents before and after the implementation of a seat belt detection system: a comparative retrospective study in Riyadh",
        journal="Cureus", year="2022", details="14(7):e27298",
        doi="10.7759/cureus.27298"),
    "alshahrani2020": dict(
        authors="Alshahrani M, Katbi F, Bahamdan Y, Alsaihati A, Alsubaie A, Althawadi D, Perlas-Asonto L.",
        title="Frequency, causes, and outcomes of return visits to the emergency department within 72 hours: a retrospective observational study",
        journal="J Multidiscip Healthc", year="2020", details="13:2003-2010",
        doi="10.2147/JMDH.S282192"),
    "rising2014": dict(
        authors="Rising KL, Victor TW, Hollander JE, Carr BG.",
        title="Patient returns to the emergency department: the time-to-return curve",
        journal="Acad Emerg Med", year="2014", details="21(8):864-871",
        doi="10.1111/acem.12442", pmid="25154879"),
    "masanneck2024": dict(
        authors="Masanneck L, Schmidt L, Seifert A, et al.",
        title="Triage performance across large language models, ChatGPT, and untrained doctors in emergency medicine: comparative study",
        journal="J Med Internet Res", year="2024", details="26:e53297",
        doi="10.2196/53297", pmid="38875696"),
    "arslan2025": dict(
        authors="Arslan B, Nuhoglu C, Satici MO, Altinbilek E.",
        title="Evaluating LLM-based generative AI tools in emergency triage: a comparative study of ChatGPT Plus, Copilot Pro, and triage nurses",
        journal="Am J Emerg Med", year="2025", details="",
        doi="10.1016/j.ajem.2024.12.024"),
    "alomari2025": dict(
        authors="Alomari LM, Alshammari MM, Arbaeen AO, Alshehri RA, Almalki HS.",
        title="Safety and accuracy of AI in triaging patients in the emergency department",
        journal="Int J Emerg Med", year="2025", details="",
        doi="10.1186/s12245-025-01069-x",
        note="Author list taken from a repository record; confirm on the publisher page."),
    "bullard2017": dict(
        authors="Bullard MJ, Musgrave E, Warren D, et al.; CTAS National Working Group.",
        title="Revisions to the Canadian Emergency Department Triage and Acuity Scale (CTAS) guidelines 2016",
        journal="CJEM", year="2017", details="19(S2):S18-S27",
        doi="10.1017/cem.2017.365"),
    "bouchama2022": dict(
        authors="Bouchama A, Abuyassin B, Lehe C, et al.",
        title="Classic and exertional heatstroke",
        journal="Nat Rev Dis Primers", year="2022", details="8(1):8",
        doi="10.1038/s41572-021-00334-6", pmid="35115565"),
    "aljohani2023": dict(
        authors="AlJohani RA, Marzook NT.",
        title="Knowledge, attitudes, and practices of military personnel regarding heat-related illness",
        journal="Cureus", year="2023", details="15(12):e49821",
        doi="10.7759/cureus.49821", pmid="38164297"),
    "bukhari2023": dict(
        authors="Bukhari HA.",
        title="A systematic review on outcomes of patients with heatstroke and heat exhaustion",
        journal="Open Access Emerg Med", year="2023", details="15:343-354",
        doi="10.2147/OAEM.S419028"),
}


def ref_url(r):
    if r.get("doi"):
        return "https://doi.org/" + r["doi"]
    if r.get("url"):
        return r["url"]
    if r.get("pmid"):
        return "https://pubmed.ncbi.nlm.nih.gov/%s/" % r["pmid"]
    return None

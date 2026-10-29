import React from "react";
import { blinkAt, breathAt, kf, outBack, prog, window01 } from "../animations/anim";
import {
  Clipboard,
  CT_TECH,
  ED_DOCTOR,
  Glucometer,
  LyingPatient,
  NURSE,
  PARAMEDIC,
  PenLight,
  SON1,
  Stretcher,
  STROKE_DOCTOR,
} from "../characters/cast";
import { Look, P, Person, Pose } from "../characters/Person";
import { AR_FONT, MedLabel, PX_FONT, TopCaption, Viewport } from "../components/Layout";
import { artToScreen, Layer, Stage } from "../components/Stage";
import text from "../data/text.json";
import { BEATS as B, sceneEndSec, sceneStartSec } from "../data/timeline";
import {
  BedsideMonitor,
  BrainIllustration,
  CTCouch,
  CTGantry,
  CTSuite,
  CTWindowGlass,
  CT_BORE,
  EDCorridor,
  PixelText,
  ReadingRoom,
  ResusBay,
  StationMonitor,
} from "../environments/Hospital";
import { C } from "../styles/palette";

const still = (t: number, seed: number, extra: Partial<Pose> = {}): Pose => ({
  face: { mouth: "neutral", blink: blinkAt(t, seed) },
  rightArm: -12,
  leftArm: 12,
  breath: breathAt(t, seed),
  ...extra,
});

/** Small Arabic role tag floating above a character (screen space). */
const RoleTag: React.FC<{ x: number; y: number; label: string; color: string; opacity: number }> = ({
  x,
  y,
  label,
  color,
  opacity,
}) => (
  <div
    dir="rtl"
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `translate(-50%, -100%) translateY(${(1 - opacity) * 10}px)`,
      opacity,
      background: color,
      color: "#fff",
      fontFamily: AR_FONT,
      fontWeight: 800,
      fontSize: 26,
      padding: "2px 12px",
      whiteSpace: "nowrap",
      boxShadow: "3px 3px 0 rgba(0,0,0,0.5)",
      zIndex: 15,
    }}
  >
    {label}
  </div>
);

const Cart: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <P x={0} y={0} w={18} h={14} c="#c9d2de" />
    <P x={0} y={0} w={18} h={2} c="#e9eef5" />
    <P x={2} y={4} w={14} h={3} c="#8b93a3" />
    <P x={2} y={9} w={14} h={3} c="#8b93a3" />
    <P x={3} y={-4} w={6} h={4} c="#2c6fd1" />
    <P x={11} y={-3} w={4} h={3} c={C.red} />
    <P x={1} y={14} w={3} h={3} c="#22252d" />
    <P x={14} y={14} w={3} h={3} c="#22252d" />
  </g>
);

const walker = (t: number, start: number, dur: number, from: number, to: number) => {
  const p = prog(t, start, dur, (x) => x);
  return { x: from + (to - from) * p, walk: p > 0 && p < 1 ? t * 11 : null };
};

// ===================================================================== S06
export const S06CodeStroke: React.FC<{ t: number }> = ({ t }) => {
  const code = t >= B.codeStroke;
  const codeIn = prog(t, B.codeStroke, 0.5, outBack);
  const cam =
    t < B.codeStroke + 0.4
      ? { scale: kf(t, [[sceneStartSec("s06CodeStroke"), 2.3], [B.codeStroke, 2.5]]), cx: 36, cy: 72 }
      : { scale: kf(t, [[B.codeStroke + 0.4, 2.5], [B.teamMobilizes, 1.0], [sceneEndSec("s06CodeStroke"), 1.08]]), cx: kf(t, [[B.codeStroke + 0.4, 36], [B.teamMobilizes, 90]]), cy: kf(t, [[B.codeStroke + 0.4, 72], [B.teamMobilizes, 92]]) };

  const doc = walker(t, B.teamMobilizes, 2.0, -24, 58);
  const nurse = walker(t, B.teamMobilizes + 0.3, 2.2, 200, 104);
  const stroke = walker(t, B.teamMobilizes + 0.8, 1.8, 150, 128);
  const stretcher = walker(t, B.stretcherIn, 2.4, -90, 6);
  const ctReady = prog(t, B.teamMobilizes + 1.4, 0.2);
  const tag = (start: number) => window01(t, start, sceneEndSec("s06CodeStroke") + 1, 0.3);
  const screen = (ax: number, ay: number) => {
    const p = artToScreen(ax, ay, cam);
    return { x: Math.min(860, Math.max(220, p.x)), y: Math.max(700, p.y) };
  };
  const docPose: Pose = still(t, 5, { walk: doc.walk });
  const handover = t > B.stretcherIn + 2.4;

  return (
    <>
      {code ? (
        <TopCaption en title={<span style={{ color: C.red }}>{text.s06.code}</span>} opacity={codeIn} />
      ) : (
        <TopCaption en title={<span style={{ fontSize: 30, color: C.amber }}>{text.s06.preAlertTag}</span>} sub={text.s06.preAlertAr} opacity={prog(t, B.preAlert, 0.4)} />
      )}
      <Viewport border={code ? C.red : C.navy500}>
        <Stage {...cam}>
          <Layer depth={0.9}>
            <EDCorridor t={t} alert={code ? 1 : 0} ctReady={ctReady} />
            <StationMonitor x={8} y={56} w={56} h={28} flash={code ? 0.5 + 0.5 * Math.sin(t * 6) : 0}>
              {code ? (
                <>
                  <PixelText x={28} y={11} size={5} fill={C.red} anchor="middle">CODE STROKE</PixelText>
                  <PixelText x={28} y={20} size={4.2} fill="#fff" anchor="middle">ACTIVATED</PixelText>
                </>
              ) : t > B.preAlert ? (
                <>
                  <PixelText x={3} y={6} size={2.6} fill={C.amber}>{text.s06.preAlertTag}</PixelText>
                  <PixelText x={28} y={15} size={4} fill={C.red} anchor="middle" opacity={Math.floor(t * 3) % 2 ? 1 : 0.55}>SUSPECTED</PixelText>
                  <PixelText x={28} y={22} size={3.6} fill={C.red} anchor="middle" opacity={Math.floor(t * 3) % 2 ? 1 : 0.55}>ACUTE STROKE</PixelText>
                </>
              ) : null}
            </StationMonitor>
          </Layer>
          <Layer depth={1}>
            {t > B.teamMobilizes ? <Person x={stroke.x} y={93} look={STROKE_DOCTOR} pose={still(t, 6, { walk: stroke.walk, leftArm: 150, leftHand: <P x={-1} y={-3} w={3} h={4} c={C.red} o={0.6 + 0.4 * Math.sin(t * 8)} /> })} /> : null}
            {t > B.teamMobilizes ? <Person x={doc.x} y={93} look={ED_DOCTOR} pose={docPose} /> : null}
            {t > B.teamMobilizes ? (
              <>
                <Cart x={nurse.x - 22} y={125} />
                <Person x={nurse.x} y={93} look={NURSE} pose={still(t, 7, { walk: nurse.walk, rightArm: -60 })} />
              </>
            ) : null}
            {t > B.stretcherIn ? (
              <>
                <Stretcher x={stretcher.x} y={126} wheelPhase={Math.floor(t * 12)} />
                <LyingPatient x={stretcher.x + 2} y={117} />
                <Person
                  x={stretcher.x - 16}
                  y={93}
                  look={PARAMEDIC}
                  pose={still(t, 8, {
                    walk: stretcher.walk,
                    leftArm: handover ? 140 : -50,
                    leftHand: handover ? <P x={-2} y={-4} w={4} h={5} c="#7fd3ff" /> : null,
                  })}
                />
              </>
            ) : null}
          </Layer>
        </Stage>
        {code ? (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: 64,
              background: C.red,
              opacity: 0.85 * codeIn,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: PX_FONT,
              fontSize: 30,
              color: "#fff",
            }}
          >
            {text.s06.code}
          </div>
        ) : null}
      </Viewport>
      {t > B.teamMobilizes ? (
        <>
          <RoleTag {...screen(doc.x + 6, 88)} label={text.s06.roles.edPhysician} color={C.teal} opacity={tag(B.teamMobilizes + 1.0)} />
          <RoleTag {...screen(nurse.x + 6, 88)} label={text.s06.roles.nurse} color={C.navy500} opacity={tag(B.teamMobilizes + 1.4)} />
          <RoleTag {...screen(stroke.x + 6, 78)} label={text.s06.roles.strokeTeam} color={C.redDeep} opacity={tag(B.teamMobilizes + 1.8)} />
          <RoleTag {...screen(152, 28)} label={text.s06.roles.ct} color="#2f7d4a" opacity={tag(B.teamMobilizes + 1.6)} />
          <RoleTag {...screen(stretcher.x - 10, 88)} label={text.s06.roles.paramedics} color={C.uniform} opacity={tag(B.stretcherIn + 2.4)} />
        </>
      ) : null}
      <MedLabel ar={text.s06.explain} opacity={prog(t, B.teamMobilizes + 0.5, 0.5)} />
    </>
  );
};

// ===================================================================== S07
const NihssCard: React.FC<{ t: number }> = ({ t }) => (
  <div
    style={{
      position: "absolute",
      left: 24,
      top: 24,
      width: 290,
      background: "rgba(6,10,26,0.92)",
      boxShadow: `0 0 0 4px ${C.ice}`,
      padding: "14px 16px",
      opacity: prog(t, B.nihssLkw - 0.2, 0.4),
    }}
  >
    <div style={{ fontFamily: PX_FONT, fontSize: 22, color: C.ice, marginBottom: 10 }}>NIHSS</div>
    {text.s07.nihssRows.map((row, i) => {
      const done = t > B.neuro + 0.4 + i * 0.6;
      return (
        <div key={row} style={{ display: "flex", justifyContent: "space-between", fontFamily: PX_FONT, fontSize: 13, color: "#fff", lineHeight: "22px" }}>
          <span>{row}</span>
          <span style={{ color: done ? C.green : C.grey }}>{done ? "■" : "□"}</span>
        </div>
      );
    })}
  </div>
);

export const S07Assessment: React.FC<{ t: number }> = ({ t }) => {
  const step = t < B.glucose ? 0 : t < B.neuro ? 1 : t < B.nihssLkw ? 2 : 3;
  const labels = [
    { en: text.s07.abcs, ar: text.s07.abcsAr, start: B.abcs },
    { en: text.s07.glucose, ar: text.s07.glucoseAr, start: B.glucose },
    { en: text.s07.neuro, ar: text.s07.neuroAr, start: B.neuro },
    { en: text.s07.lkw, ar: text.s07.lkwAr, start: B.nihssLkw },
  ];
  const label = labels[step];
  const ends = [B.glucose, B.neuro, B.nihssLkw, sceneEndSec("s07Assessment") + 0.3];
  const cam = {
    scale: kf(t, [[B.abcs, 1.15], [B.glucose, 1.3], [B.neuro, 1.3], [B.neuro + 0.6, 1.45], [B.nihssLkw, 1.45], [B.nihssLkw + 0.8, 1.15]]),
    cx: kf(t, [[B.abcs, 96], [B.glucose, 96], [B.neuro, 80], [B.nihssLkw, 80], [B.nihssLkw + 0.8, 104]]),
    cy: kf(t, [[B.abcs, 92], [B.glucose, 98], [B.neuro, 100], [B.nihssLkw + 0.8, 92]]),
  };
  const monitorOn = prog(t, B.abcs + 1.0, 0.5);
  const glucoseDone = t > B.glucose + 2.3;
  const armLift = t > B.neuro + 0.6 ? kf(t, [[B.neuro + 0.6, 0], [B.neuro + 1.2, 38], [B.neuro + 1.8, 38], [B.neuro + 3.2, 4]]) : 0;
  const lkwChip = prog(t, B.nihssLkw + 0.8, 0.4, outBack);

  const docPose: Pose = still(t, 5, {
    leftArm: step === 0 ? 62 : step === 2 ? 70 : 20,
    rightArm: step === 0 ? 30 : -12,
    leftHand: step === 2 ? <PenLight on={Math.floor(t * 2) % 2 === 0} /> : null,
  });
  const nursePose: Pose = still(t, 7, {
    rightArm: step === 0 ? -58 : step === 1 ? -62 : -15,
    rightHand: step === 1 ? <Glucometer done={glucoseDone} /> : null,
  });
  const strokeX = walker(t, B.nihssLkw - 1.0, 1.4, 200, 128);

  return (
    <>
      <TopCaption en title={<span style={{ fontSize: label.en.length > 22 ? 28 : 36 }}>{label.en}</span>} opacity={window01(t, label.start, ends[step] + 0.4, 0.25)} />
      <Viewport>
        <Stage {...cam}>
          <Layer depth={0.85}>
            <ResusBay />
            <BedsideMonitor x={118} y={30} t={t} on={monitorOn} />
          </Layer>
          <Layer depth={1}>
            {/* staff stand behind the stretcher, at the bedside */}
            <Person x={50} y={80} look={ED_DOCTOR} pose={docPose} />
            <Person x={98} y={81} look={NURSE} pose={nursePose} />
            {t > B.nihssLkw - 1.0 ? (
              <Person x={strokeX.x} y={80} look={STROKE_DOCTOR} pose={still(t, 6, { walk: strokeX.walk, rightArm: -40, rightHand: <Clipboard /> })} />
            ) : null}
            {t > B.nihssLkw ? (
              <Person x={152} y={80} look={SON1} pose={still(t, 1, { face: { mouth: "worried", worried: true, blink: blinkAt(t, 1), look: -1 }, headTurn: -1 })} />
            ) : null}
            <Stretcher x={50} y={124} />
            <LyingPatient x={52} y={115} armLift={armLift} />
          </Layer>
        </Stage>
        {step === 1 ? (
          <div
            style={{
              position: "absolute",
              left: 24,
              top: 24,
              width: 230,
              background: "rgba(6,10,26,0.92)",
              boxShadow: `0 0 0 4px ${glucoseDone ? C.green : C.ice}`,
              padding: "14px",
              textAlign: "center",
              opacity: prog(t, B.glucose + 0.6, 0.3),
            }}
          >
            <div style={{ fontFamily: PX_FONT, fontSize: 20, color: C.ice }}>GLUCOSE</div>
            <div style={{ fontFamily: PX_FONT, fontSize: 18, color: glucoseDone ? C.green : C.grey, marginTop: 10 }}>
              {glucoseDone ? `✓ ${text.s07.checked}` : "· · ·"}
            </div>
          </div>
        ) : null}
        {step >= 2 ? <NihssCard t={t} /> : null}
        {step === 3 ? (
          <div
            style={{
              position: "absolute",
              right: 24,
              bottom: 24,
              background: C.amber,
              color: "#14101f",
              padding: "12px 18px",
              textAlign: "center",
              opacity: lkwChip,
              transform: `scale(${0.7 + 0.3 * lkwChip})`,
              boxShadow: "5px 5px 0 rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ fontFamily: PX_FONT, fontSize: 16 }}>LAST KNOWN WELL</div>
            <div style={{ fontFamily: PX_FONT, fontSize: 34, marginTop: 8 }}>8:30 PM</div>
          </div>
        ) : null}
      </Viewport>
      <MedLabel ar={label.ar} opacity={window01(t, label.start + 0.3, ends[step] + 0.4, 0.25)} color={C.navy500} />
    </>
  );
};

// ===================================================================== S08
export const S08CT: React.FC<{ t: number }> = ({ t }) => {
  const reading = t >= B.ctReading;
  const slide = prog(t, B.ctTableIn, 2.4);
  const scanning = t > B.ctScanning && !reading ? prog(t, B.ctScanning, 0.4) : 0;
  const couchX = 14 + slide * 64;
  const sweep = reading ? ((t - B.ctReading) / 2.2) % 1 : 0;
  const tech: Look = CT_TECH;

  return (
    <>
      <TopCaption en title={<span style={{ color: C.ice }}>{text.s08.ct}</span>} opacity={prog(t, sceneStartSec("s08CT") + 0.3, 0.4)} />
      <Viewport>
        {!reading ? (
          <Stage scale={kf(t, [[sceneStartSec("s08CT"), 1.15], [B.ctReading, 1.3]])} cx={96} cy={86}>
            <Layer depth={0.85}>
              <CTSuite />
              <clipPath id="ctWindow">
                <rect x={9} y={21} width={52} height={30} />
              </clipPath>
              <g clipPath="url(#ctWindow)">
                <Person x={30} y={27} look={tech} pose={still(t, 9, { leftArm: 40, rightArm: -40, face: { mouth: "neutral", blink: blinkAt(t, 9), look: 1 } })} />
                <P x={10} y={42} w={50} h={9} c="#3b4a66" />
                <P x={14} y={36} w={12} h={7} c="#0a1830" />
                <P x={15} y={37} w={10} h={5} c={C.ice} o={0.4 + 0.3 * scanning} />
              </g>
              <CTWindowGlass />
            </Layer>
            <Layer depth={1}>
              <clipPath id="boreClip">
                <rect x={-20} y={0} width={CT_BORE.cx + 20} height={180} />
              </clipPath>
              <g clipPath="url(#boreClip)">
                <CTCouch x={couchX} />
                {/* patient lies head-first towards the gantry (mirrored: head on the right) */}
                <g transform={`translate(${couchX + 66} 0) scale(-1 1)`}>
                  <LyingPatient x={0} y={81} />
                </g>
              </g>
              <CTGantry t={t} scanning={scanning} />
            </Layer>
          </Stage>
        ) : (
          <Stage scale={1} cx={90} cy={90}>
            <ReadingRoom />
            <P x={34} y={20} w={112} h={84} c="#11141b" />
            <P x={37} y={23} w={106} h={78} c="#000" />
            <BrainIllustration x={90} y={60} sweep={sweep} />
            <PixelText x={40} y={30} size={3} fill={C.grey}>AXIAL</PixelText>
            <PixelText x={140} y={97} size={3} fill={C.grey} anchor="end">ILLUSTRATION</PixelText>
            <P x={86} y={104} w={8} h={14} c="#2b2f38" />
            <Person x={12} y={110} look={STROKE_DOCTOR} pose={still(t, 6, { face: { mouth: "neutral", blink: blinkAt(t, 6), look: 1 }, headTurn: 1, leftArm: 140 })} />
            <Person x={156} y={110} look={ED_DOCTOR} pose={still(t, 5, { face: { mouth: "neutral", blink: blinkAt(t, 5), look: -1 }, headTurn: -1 })} />
          </Stage>
        )}
      </Viewport>
      {reading ? (
        <div
          dir="rtl"
          style={{ position: "absolute", left: 0, right: 0, top: 1440, textAlign: "center", fontFamily: AR_FONT, fontWeight: 700, fontSize: 26, color: C.grey, opacity: prog(t, B.ctReading + 0.3, 0.4) }}
        >
          {text.s08.illustration}
        </div>
      ) : null}
      <MedLabel
        ar={reading ? text.s08.caption : undefined}
        note={t > B.ctaNote ? text.s08.cta : undefined}
        opacity={prog(t, B.ctReading + 0.2, 0.4)}
      />
    </>
  );
};

// ===================================================================== S09
export const S09Decision: React.FC<{ t: number }> = ({ t }) => {
  const inputs = text.s09.inputs;
  const pathA = prog(t, B.pathways, 0.5, outBack);
  const pathB = prog(t, B.pathways + 0.4, 0.5, outBack);
  const card = (title: string, ar: string, note: string, a: number, color: string) => (
    <div
      style={{
        flex: 1,
        background: "rgba(10,16,40,0.95)",
        boxShadow: `0 0 0 4px ${color}`,
        padding: "18px 14px",
        textAlign: "center",
        opacity: a,
        transform: `scale(${0.7 + 0.3 * a})`,
      }}
    >
      <div style={{ fontFamily: PX_FONT, fontSize: 19, color, lineHeight: 1.5 }}>{title}</div>
      <div dir="rtl" style={{ fontFamily: AR_FONT, fontWeight: 800, fontSize: 36, color: "#fff", marginTop: 8 }}>
        {ar}
      </div>
      <div dir="rtl" style={{ fontFamily: AR_FONT, fontWeight: 700, fontSize: 26, color: C.grey, marginTop: 4 }}>
        {note}
      </div>
    </div>
  );
  return (
    <>
      <TopCaption title={text.s09.title} opacity={prog(t, sceneStartSec("s09Decision") + 0.2, 0.4)} />
      <Viewport>
        <Stage>
          <ReadingRoom />
          <Person x={14} y={118} look={STROKE_DOCTOR} pose={still(t, 6, { leftArm: 150, face: { mouth: "neutral", blink: blinkAt(t, 6), look: 1 }, headTurn: 1 })} />
          <Person x={154} y={118} look={ED_DOCTOR} pose={still(t, 5, { face: { mouth: "neutral", blink: blinkAt(t, 5), look: -1 }, headTurn: -1 })} />
        </Stage>
        <div style={{ position: "absolute", left: 40, right: 40, top: 36, display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", gap: 16 }}>
            {inputs.map((inp, i) => {
              const a = prog(t, B.decisionInputs + i * 0.3, 0.4, outBack);
              return (
                <div
                  key={inp.en}
                  style={{
                    flex: 1,
                    background: C.navy600,
                    boxShadow: `0 0 0 3px ${C.ice}`,
                    padding: "12px 6px",
                    textAlign: "center",
                    opacity: a,
                    transform: `translateY(${(1 - a) * -20}px)`,
                  }}
                >
                  <div style={{ fontFamily: PX_FONT, fontSize: 16, color: C.ice }}>{inp.en}</div>
                  <div dir="rtl" style={{ fontFamily: AR_FONT, fontWeight: 800, fontSize: 30, color: "#fff" }}>
                    {inp.ar}
                  </div>
                </div>
              );
            })}
          </div>
          <svg width={820} height={60} viewBox="0 0 820 60" style={{ opacity: prog(t, B.decisionInputs + 1.0, 0.4) }}>
            {[137, 410, 683].map((x) => (
              <path key={x} d={`M${x} 0 L410 52`} stroke={C.ice} strokeWidth={4} strokeDasharray="10 8" strokeDashoffset={-t * 40} fill="none" />
            ))}
          </svg>
          <div dir="rtl" style={{ fontFamily: AR_FONT, fontWeight: 800, fontSize: 32, color: C.amberSoft, textAlign: "center", opacity: prog(t, B.pathways - 0.4, 0.3) }}>
            {text.s09.ischemicOnly}
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {card(text.s09.ivt, text.s09.ivtAr, text.s09.ivtNote, pathA, C.teal)}
            {card(text.s09.evt, text.s09.evtAr, text.s09.evtNote, pathB, C.amber)}
          </div>
        </div>
      </Viewport>
      <MedLabel ar={text.s09.safety} opacity={prog(t, B.safetyCaption, 0.5)} />
    </>
  );
};

// ===================================================================== S10
export const S10Final: React.FC<{ t: number }> = ({ t }) => {
  const a = (at: number) => prog(t, at, 0.6);
  const pulse = 1 + 0.03 * Math.sin(t * 6);
  return (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: 330,
        bottom: 150,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 26,
        textAlign: "center",
      }}
    >
      <div style={{ fontFamily: AR_FONT, fontWeight: 800, fontSize: 48, color: C.white, opacity: a(B.endTitle) }}>{text.s10.line1}</div>
      <div dir="ltr" style={{ fontFamily: PX_FONT, fontSize: 64, color: C.red, textShadow: `0 0 24px ${C.redGlow}, 5px 5px 0 #000`, opacity: a(B.endTitle + 0.2) }}>
        {text.s10.line2}
      </div>
      <div style={{ height: 10 }} />
      <div style={{ fontFamily: AR_FONT, fontWeight: 800, fontSize: 64, lineHeight: 1.35, color: "#fff", opacity: a(B.endMessage) }}>
        {text.s10.messageA}
        <br />
        <span style={{ color: C.amberSoft }}>{text.s10.messageB}</span>
      </div>
      <div style={{ fontFamily: AR_FONT, fontWeight: 800, fontSize: 42, color: "#dfe6f5", opacity: a(B.endCall) }}>{text.s10.action}</div>
      <div dir="ltr" style={{ fontFamily: PX_FONT, fontSize: 120, color: C.red, textShadow: `8px 8px 0 ${C.redDeep}`, opacity: a(B.endCall + 0.3), transform: `scale(${pulse})` }}>
        {text.s10.number}
      </div>
      <div dir="ltr" style={{ fontFamily: PX_FONT, fontSize: 52, color: "#fff", letterSpacing: 2, opacity: a(B.timeIsBrain), textShadow: `0 0 20px ${C.redGlow}` }}>
        {text.s10.final}
      </div>
    </div>
  );
};

import React from "react";
import { AbsoluteFill } from "remotion";
import { blinkAt, flap, kf, outBack, prog, window01 } from "../animations/anim";
import { FatherCloseUp } from "../characters/FatherCloseUp";
import { PARAMEDIC, PARAMEDIC2, SON1 } from "../characters/cast";
import { Stretcher } from "../characters/cast";
import { Person } from "../characters/Person";
import { AR_FONT, Bubble, BrokenSpeech, LAYOUT, MedLabel, PX_FONT, TopCaption, Viewport } from "../components/Layout";
import { artToScreen, Layer, Stage } from "../components/Stage";
import text from "../data/text.json";
import { BEATS as B, sceneEndSec, sceneStartSec } from "../data/timeline";
import { Ambulance, HouseExterior } from "../environments/Home";
import { C } from "../styles/palette";
import { droopAt, HomeSet, POS } from "./family";

// ===================================================================== S01
export const S01Opening: React.FC<{ t: number }> = ({ t }) => {
  const W = 1080;
  const baseY = 1080;
  // ECG trace drawn left→right by a moving red light, then collapsing into a point.
  const draw = prog(t, B.ecgStart, 4.2, (x) => x);
  const collapse = prog(t, B.ecgToClock, 0.9);
  const target = { x: 540, y: LAYOUT.viewport.top + LAYOUT.viewport.size / 2 };
  const pts: [number, number][] = [];
  for (let x = 40; x <= W - 40; x += 6) {
    const s = (x - 40) % 240;
    const v = s > 100 && s < 112 ? -90 : s >= 112 && s < 124 ? 60 : s > 70 && s < 88 ? -14 : s > 150 && s < 172 ? -18 : 0;
    pts.push([x, baseY + v]);
  }
  const visibleX = 40 + draw * (W - 80);
  const shown = pts
    .filter(([x]) => x <= visibleX)
    .map(([x, y]) => [x + (target.x - x) * collapse, y + (target.y - y) * collapse] as [number, number]);
  const head = shown[shown.length - 1] ?? [40, baseY];
  const l1 = prog(t, B.titleLine1, 0.8);
  const l2 = prog(t, B.titleLine2, 0.9, outBack);
  const l3 = prog(t, B.titleLine3, 0.8);
  const titleOut = 1 - prog(t, B.ecgToClock - 0.2, 0.7);

  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }} shapeRendering="crispEdges">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        {shown.length > 1 ? (
          <>
            <polyline points={shown.map((p) => p.join(",")).join(" ")} fill="none" stroke={C.redGlow} strokeWidth={10} opacity={0.35} filter="url(#glow)" />
            <polyline points={shown.map((p) => p.join(",")).join(" ")} fill="none" stroke={C.red} strokeWidth={6} />
          </>
        ) : null}
        <circle cx={head[0]} cy={head[1]} r={10 + 4 * Math.sin(t * 10)} fill={C.redGlow} opacity={t > B.ecgStart ? 0.9 : 0} filter="url(#glow)" />
        <rect x={head[0] - 6} y={head[1] - 6} width={12} height={12} fill="#fff" opacity={t > B.ecgStart ? 1 : 0} />
      </svg>
      <div
        dir="rtl"
        style={{
          position: "absolute",
          top: 560,
          left: 60,
          right: 60,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 22,
          opacity: titleOut,
          textAlign: "center",
        }}
      >
        <div style={{ fontFamily: AR_FONT, fontWeight: 800, fontSize: 62, color: C.white, opacity: l1, transform: `translateY(${(1 - l1) * 20}px)` }}>
          {text.title.line1}
        </div>
        <div
          dir="ltr"
          style={{
            fontFamily: PX_FONT,
            fontSize: 78,
            whiteSpace: "nowrap",
            color: C.red,
            textShadow: `0 0 28px ${C.redGlow}, 6px 6px 0 #000`,
            opacity: l2,
            transform: `scale(${0.8 + 0.2 * l2})`,
            letterSpacing: 2,
          }}
        >
          {text.title.line2}
        </div>
      </div>
      <div
        dir="rtl"
        style={{
          position: "absolute",
          top: 1180,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: AR_FONT,
          fontWeight: 800,
          fontSize: 66,
          color: C.amberSoft,
          opacity: l3 * titleOut,
          transform: `translateY(${(1 - l3) * 20}px)`,
        }}
      >
        {text.title.line3}
      </div>
    </AbsoluteFill>
  );
};

// ===================================================================== S02
export const S02Evening: React.FC<{ t: number }> = ({ t }) => {
  const s = sceneStartSec("s02Evening");
  // Start on the clock (continuing the ECG point), pull out to wide, then push in slowly.
  const pull = prog(t, s, 1.3);
  const push = prog(t, s + 1.6, 9.4);
  const scale = 2.6 + (1 - 2.6) * pull + 0.28 * push;
  const cx = 132 + (90 - 132) * pull + 8 * push;
  const cy = 36 + (92 - 36) * pull + 6 * push;
  const glint = 1 - prog(t, s, 1.4);
  const lkw = window01(t, B.lkwLabel, sceneEndSec("s03Onset") - 9, 0.5);
  return (
    <>
      <TopCaption
        en
        title={<span style={{ color: C.amberSoft }}>{text.s02.lkwTime}</span>}
        sub={
          <span>
            <span style={{ color: C.white }}>{text.s02.lkwLabel}</span>
          </span>
        }
        opacity={lkw}
      />
      <Viewport>
        <Stage scale={scale} cx={cx} cy={cy}>
          <HomeSet t={t} clockGlint={glint} clockHighlight={lkw * 0.8} />
        </Stage>
      </Viewport>
      <MedLabel en={text.s02.lkwTag} opacity={lkw * 0.9} color={C.navy500} />
    </>
  );
};

// ===================================================================== S03
export const S03Onset: React.FC<{ t: number }> = ({ t }) => {
  const impact = t >= B.cupImpact;
  const since = t - B.cupImpact;
  const shake = impact && since < 0.3 ? Math.sin(since * 80) * (1 - since / 0.3) * 1.2 : 0;
  // Medium shot on the father and son 1; nudge down to follow the cup, then back.
  const cam = {
    scale: kf(t, [[18, 1.55], [B.cupSlips, 1.7], [B.cupImpact + 0.5, 1.7], [B.son1Turns + 0.4, 1.8]]),
    cx: kf(t, [[18, 102], [B.cupSlips, 98], [B.son1Turns, 94]]),
    cy: kf(t, [[18, 96], [B.cupSlips, 104], [B.cupImpact + 0.6, 104], [B.son1Turns + 0.5, 98]]),
  };
  const sat = impact ? 0.55 : 1;
  const weak = window01(t, B.handWeakens + 0.4, B.fatherTriesToSpeak, 0.4);
  const speak = window01(t, B.fatherTriesToSpeak, sceneEndSec("s03Onset") + 0.4, 0.3);
  const head = artToScreen(POS.father.x + 12, POS.father.y - 2, cam);
  return (
    <>
      <TopCaption title={text.s03.weakHand} titleColor={C.amberSoft} opacity={weak} />
      <TopCaption title={`«${text.s03.caption}»`} opacity={speak} />
      <Viewport border={impact ? C.redDeep : undefined}>
        <Stage {...cam} shakeX={shake} filter={`saturate(${sat})`}>
          <HomeSet t={t} />
        </Stage>
      </Viewport>
      <Bubble x={Math.min(head.x, 560)} y={head.y - 170} opacity={speak} width={380}>
        <BrokenSpeech t={t} count={9} />
      </Bubble>
    </>
  );
};

// ===================================================================== S04
const BeFastStrip: React.FC<{ t: number }> = ({ t }) => {
  const items = text.s04.beFast;
  const observed = new Set(["F", "A", "S"]);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 14,
        padding: "0 36px",
        background: "rgba(6,10,26,0.72)",
      }}
    >
      {items.map((it, i) => {
        const appear = prog(t, B.beFast + 0.15 + i * 0.22, 0.35);
        const hot = observed.has(it.letter);
        const pulse = hot ? 0.5 + 0.5 * Math.sin((t - B.beFast) * 5) : 0;
        return (
          <div
            key={it.letter}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 22,
              height: 104,
              padding: "0 22px",
              background: hot ? `rgba(229,36,59,${0.82 + 0.1 * pulse})` : "rgba(26,38,80,0.92)",
              boxShadow: hot ? `0 0 0 4px #fff` : `0 0 0 3px ${C.navy500}`,
              opacity: appear,
              transform: `translateX(${(1 - appear) * -60}px)`,
            }}
          >
            <div style={{ fontFamily: PX_FONT, fontSize: 52, color: "#fff", width: 66, textAlign: "center" }}>{it.letter}</div>
            <div style={{ fontFamily: PX_FONT, fontSize: 22, color: hot ? "#fff" : C.ice, width: 190 }}>{it.en}</div>
            <div dir="rtl" style={{ flex: 1, fontFamily: AR_FONT, fontWeight: 800, fontSize: 36, color: "#fff", textAlign: "right" }}>
              {it.ar}
            </div>
            <div style={{ width: 40, fontSize: 34, color: "#fff", textAlign: "center" }}>{hot ? "✓" : ""}</div>
          </div>
        );
      })}
    </div>
  );
};

export const S04Signs: React.FC<{ t: number }> = ({ t }) => {
  const faceShot = t < B.armTest;
  const armShot = t >= B.armTest && t < B.speechTest;
  const speechShot = t >= B.speechTest && t < B.beFast;
  const strip = t >= B.beFast;

  const smile = kf(t, [[B.smileAttempt, 0], [B.smileAttempt + 0.8, 1], [B.smileAttempt + 2.6, 1], [B.armTest - 0.3, 0.2]]);
  const closeCam = faceShot
    ? { scale: kf(t, [[B.faceCloseUp, 0.96], [B.armTest, 1.04]]), cx: 30, cy: 32 }
    : { scale: kf(t, [[B.speechTest, 0.98], [B.beFast, 1.06]]), cx: 30, cy: 34 };
  const armCam = { scale: kf(t, [[B.armTest, 1.65], [B.speechTest, 1.8]]), cx: 98, cy: 92 };
  const askBubble = window01(t, B.armTest + 0.1, B.armsUp + 0.9, 0.25);
  const son1Head = artToScreen(POS.son1.x + 4, POS.son1.y - 4, armCam);

  const label = faceShot
    ? { en: text.s04.faceEn, ar: text.s04.faceAr, start: B.smileAttempt + 0.4, end: B.armTest }
    : armShot
      ? { en: text.s04.armEn, ar: text.s04.armAr, start: B.armDrift + 0.4, end: B.speechTest }
      : speechShot
        ? { en: text.s04.speechEn, ar: text.s04.speechAr, start: B.speechTest + 0.6, end: B.beFast }
        : null;

  return (
    <>
      {strip ? (
        <TopCaption
          title={text.s04.actNow}
          sub={<span style={{ color: C.amberSoft }}>{text.s04.notAllNeeded}</span>}
          opacity={prog(t, B.beFast + 1.2, 0.5)}
        />
      ) : (
        <TopCaption
          en
          title={<span style={{ color: C.red }}>{faceShot ? "F" : armShot ? "A" : "S"}</span>}
          sub={<span style={{ color: C.white }}>{text.s04.observed}</span>}
          opacity={prog(t, B.faceCloseUp + 0.2, 0.4)}
        />
      )}
      <Viewport border={C.redDeep}>
        {faceShot || speechShot ? (
          <svg viewBox="0 0 60 60" width="100%" height="100%" shapeRendering="crispEdges" style={{ display: "block", background: "#3b2a22" }}>
            <g transform={`translate(30 ${closeCam.cy}) scale(${closeCam.scale}) translate(-30 ${-closeCam.cy})`}>
              <FatherCloseUp
                droop={droopAt(t)}
                smile={faceShot ? smile : 0}
                open={speechShot && flap(t, 6)}
                blink={blinkAt(t, 0)}
                worried
              />
            </g>
          </svg>
        ) : (
          <Stage {...armCam} filter="saturate(0.6)">
            <HomeSet t={t} />
          </Stage>
        )}
        {strip ? (
          <>
            <Stage scale={1.15} cx={98} cy={95} filter="saturate(0.4) brightness(0.6)">
              <HomeSet t={t} />
            </Stage>
            <BeFastStrip t={t} />
          </>
        ) : null}
      </Viewport>
      {armShot ? (
        <Bubble x={Math.max(110, son1Head.x - 160)} y={son1Head.y - 150} opacity={askBubble}>
          «{text.s04.raiseArms}»
        </Bubble>
      ) : null}
      {speechShot ? (
        <Bubble x={560} y={640} opacity={prog(t, B.speechTest + 0.3, 0.3)} tail="left" width={360}>
          <BrokenSpeech t={t} count={8} />
        </Bubble>
      ) : null}
      {label ? <MedLabel en={label.en} ar={label.ar} opacity={window01(t, label.start, label.end + 0.2, 0.3)} /> : null}
    </>
  );
};

// ===================================================================== S05
const PhoneCloseUp: React.FC<{ t: number }> = ({ t }) => {
  const digits = "997".slice(0, Math.max(0, Math.min(3, Math.floor((t - B.phoneDial) / 0.28) + 1)));
  const connected = t >= B.callConnected;
  const ring = !connected && t > B.phoneDial + 1.0;
  return (
    <div style={{ position: "absolute", inset: 0, background: "#2a1d18", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* pixel hand + phone */}
      <svg viewBox="0 0 90 90" width="100%" height="100%" shapeRendering="crispEdges" style={{ position: "absolute", inset: 0 }}>
        <rect x={0} y={0} width={90} height={90} fill="#3b2a22" />
        <rect x={56} y={56} width={34} height={34} fill={SON1.skin} />
        <rect x={52} y={62} width={8} height={6} fill={SON1.skin} />
        <rect x={52} y={70} width={8} height={6} fill={SON1.skin} />
        <rect x={52} y={78} width={8} height={6} fill={SON1.skin} />
        <rect x={64} y={56} width={26} height={2} fill={SON1.skinShade} />
        <rect x={66} y={58} width={24} height={32} fill={C.thobe} />
        <rect x={24} y={8} width={34} height={70} fill="#1a1d24" />
        <rect x={26} y={12} width={30} height={60} fill={connected ? "#0f3b2a" : "#0b1630"} />
      </svg>
      <div
        dir="rtl"
        style={{
          position: "absolute",
          left: 260,
          top: 120,
          width: 300,
          height: 600,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          paddingTop: 40,
          color: "#fff",
          fontFamily: AR_FONT,
        }}
      >
        <div style={{ fontSize: 34, fontWeight: 800 }}>{connected ? "● متصل" : text.s05.dialing}</div>
        <div dir="ltr" style={{ fontFamily: PX_FONT, fontSize: 64, letterSpacing: 4 }}>
          {digits}
        </div>
        <div style={{ fontSize: 40, fontWeight: 800, color: "#ff8a8a" }}>{text.s05.service}</div>
        {ring ? (
          <div dir="ltr" style={{ fontFamily: PX_FONT, fontSize: 30, color: C.ice }}>
            {"• ".repeat(1 + (Math.floor(t * 3) % 3))}
          </div>
        ) : null}
        {[
          { at: B.msgSuspected, msg: text.s05.msgSuspected, color: C.red },
          { at: B.msgLkw, msg: text.s05.msgLkw, color: C.navy500 },
        ].map(({ at, msg, color }) => {
          const a = prog(t, at, 0.35, outBack);
          return (
            <div
              key={msg}
              style={{
                marginTop: 8,
                background: color,
                padding: "10px 16px",
                fontSize: 30,
                fontWeight: 800,
                lineHeight: 1.35,
                textAlign: "center",
                opacity: a,
                transform: `scale(${0.6 + 0.4 * a})`,
                boxShadow: "4px 4px 0 rgba(0,0,0,0.5)",
              }}
            >
              {msg}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const S05Call: React.FC<{ t: number }> = ({ t }) => {
  const phoneShot = t < B.supportWide;
  const wide = t >= B.supportWide && t < B.ambulanceArrives;
  const street = t >= B.ambulanceArrives;
  const drive = prog(t, B.ambulanceArrives, 1.5, (x) => 1 - Math.pow(1 - x, 3));
  const walk = prog(t, B.paramedicsOut, 1.6, (x) => x);
  const blue = prog(t, B.blueTransition, 0.8);
  const sirenLights = prog(t, B.supportWide + 0.5, 1.5);

  return (
    <>
      {phoneShot ? (
        <TopCaption title="اتصل بالإسعاف فورًا" sub={<span dir="ltr" style={{ fontFamily: PX_FONT, color: C.red, fontSize: 40 }}>997</span>} opacity={prog(t, B.phoneDial - 0.2, 0.4)} />
      ) : wide ? (
        <TopCaption title={text.s05.support} titleColor={C.amberSoft} opacity={prog(t, B.supportWide, 0.4)} />
      ) : (
        <TopCaption title={text.s05.onTheWay} opacity={1 - blue} />
      )}
      <Viewport>
        {phoneShot ? <PhoneCloseUp t={t} /> : null}
        {wide ? (
          <Stage scale={1.35} cx={100} cy={94} filter="saturate(0.6)">
            <HomeSet t={t} son1Standing lightsFlash={sirenLights} />
          </Stage>
        ) : null}
        {street ? (
          <Stage scale={1 + 0.1 * walk} cx={100} cy={100}>
            <Layer depth={0.85}>
              <HouseExterior t={t} door={prog(t, B.paramedicsOut + 0.4, 0.6)} lights={drive} />
            </Layer>
            <Layer depth={1}>
              <Ambulance x={200 - drive * 184} y={98} t={t} moving={drive > 0 && drive < 0.98} rearOpen={prog(t, B.paramedicsOut - 0.4, 0.4)} />
              {t > B.paramedicsOut ? (
                <>
                  <Stretcher x={70 + walk * 26} y={118} wheelPhase={Math.floor(t * 12)} />
                  <Person x={64 + walk * 26} y={88} look={PARAMEDIC} pose={{ face: { mouth: "neutral", blink: blinkAt(t, 3) }, rightArm: -20, leftArm: 20, walk: walk < 1 ? t * 12 : null }} />
                  <Person x={130 + walk * 26} y={88} look={PARAMEDIC2} pose={{ face: { mouth: "neutral", blink: blinkAt(t, 4) }, rightArm: -20, leftArm: 20, walk: walk < 1 ? t * 12 + 1 : null }} />
                </>
              ) : null}
            </Layer>
          </Stage>
        ) : null}
        {blue > 0 ? <div style={{ position: "absolute", inset: 0, background: "#1e5fbf", opacity: blue * 0.85 }} /> : null}
      </Viewport>
    </>
  );
};

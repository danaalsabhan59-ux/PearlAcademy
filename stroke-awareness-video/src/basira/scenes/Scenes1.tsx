import React from "react";
import { cardRect } from "../data/layout";
import text from "../data/text.json";
import { scene } from "../data/timeline";
import { Card, Kinetic, Typewriter } from "../components/Frame";
import { Cards, Chat, Check, Code, Doc, HeartPulse, Notebook, Palette, Search, Stethoscope, User } from "../components/Icons";
import { lerp, pop, ramp, T } from "../theme";

const AR: React.CSSProperties = { fontFamily: T.font, direction: "rtl" };

// =================================================================== INTRO
const heartPoint = (u: number) => {
  // classic parametric heart, u in [0, 2π)
  const x = 16 * Math.sin(u) ** 3;
  const y = -(13 * Math.cos(u) - 5 * Math.cos(2 * u) - 2 * Math.cos(3 * u) - Math.cos(4 * u));
  return { x, y };
};

const INTRO_ICONS = [Chat, Code, Notebook, Search, Doc, Cards, Cards, Palette];

export const Intro: React.FC<{ f: number }> = ({ f }) => {
  const s = scene("intro");
  const lf = f - s.start;
  const cx = 960;
  const cy = 300;
  const gather = ramp(lf, 0, 34);
  const dots = Array.from({ length: 70 }, (_, i) => {
    const target = heartPoint((i / 70) * Math.PI * 2);
    const sx = (i * 397) % 1920;
    const sy = 160 + ((i * 251) % 900);
    const x = lerp(sx, cx + target.x * 8.5, gather);
    const y = lerp(sy, cy + target.y * 8.5, gather);
    return <circle key={i} cx={x} cy={y} r={2.6} fill={i % 2 ? T.cyan : T.teal} opacity={0.4 + 0.6 * gather} />;
  });
  const glow = ramp(lf, 30, 12);
  const ecg = ramp(lf, 34, 20);
  const fadeOthers = ramp(lf, 118, 20);
  const tools = text.intro.tools;
  return (
    <>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: 1 - 0.6 * fadeOthers }}>
        <defs>
          <filter id="glowF" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>
        {glow > 0 ? <circle cx={cx} cy={cy - 6} r={150} fill={T.cyan} opacity={0.12 * glow} filter="url(#glowF)" /> : null}
        {dots}
        <polyline
          points={`${cx - 110},${cy} ${cx - 50},${cy} ${cx - 30},${cy - 45} ${cx - 5},${cy + 50} ${cx + 18},${cy - 25} ${cx + 32},${cy} ${cx + 110},${cy}`}
          fill="none"
          stroke={T.white}
          strokeWidth={5}
          strokeLinejoin="round"
          strokeDasharray={420}
          strokeDashoffset={420 * (1 - ecg)}
        />
      </svg>
      <div style={{ position: "absolute", top: 420, left: 0, right: 0, textAlign: "center", opacity: 1 - fadeOthers }}>
        <Kinetic text={text.intro.question} frame={f} start={s.start + 22} size={38} weight={500} color={T.muted} stagger={2} />
        <Kinetic
          text={text.intro.title}
          frame={f}
          start={s.start + 46}
          size={92}
          weight={700}
          color={T.white}
          stagger={4}
          style={{ textShadow: "0 0 40px rgba(0,217,255,0.35)" }}
        />
        <Kinetic text={text.intro.subtitle} frame={f} start={s.start + 72} size={46} weight={600} color={T.cyan} stagger={3} />
      </div>
      {tools.map((name, i) => {
        const r = cardRect(i);
        const p = pop(f, s.start + 56 + i * 5, 13, 170);
        const Icon = INTRO_ICONS[i];
        const isFirst = i === 0;
        const hl = isFirst ? ramp(lf, 112, 14) : 0;
        return (
          <Card
            key={name}
            glow={hl}
            style={{
              left: r.x,
              top: r.y,
              width: r.w,
              height: r.h,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              opacity: Math.min(1, p) * (isFirst ? 1 : 1 - fadeOthers),
              transform: `translateY(${(1 - p) * 120}px) scale(${0.6 + 0.4 * p + 0.06 * hl})`,
            }}
          >
            <Icon size={44} color={i % 2 ? T.teal : T.cyan} />
            <span dir="ltr" style={{ fontWeight: 700, fontSize: 25, color: T.white }}>
              {name}
            </span>
          </Card>
        );
      })}
    </>
  );
};

// ================================================================= CHATGPT
export const ChatGPTContent: React.FC<{ lf: number; f: number }> = ({ lf, f }) => {
  const t = text.chatgpt;
  const chatOut = ramp(lf, 112, 14);
  const thinking = lf > 52 && lf < 68;
  const mcqIn = pop(f, scene("chatgpt").start + 116, 15, 150);
  const mcqOut = ramp(lf, 168, 12);
  const correct = lf > 148;
  const osce = pop(f, scene("chatgpt").start + 170, 15, 150);
  const osceOut = ramp(lf, 198, 10);
  const info = pop(f, scene("chatgpt").start + 202, 14, 150);
  return (
    <div style={{ position: "absolute", inset: 0, ...AR }}>
      {/* window chrome */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 70, borderBottom: "1px solid rgba(0,217,255,0.2)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 30px" }}>
        <div style={{ display: "flex", gap: 10 }}>
          {[T.bad, T.warn, T.good].map((c) => (
            <div key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c, opacity: 0.8 }} />
          ))}
        </div>
        <span dir="ltr" style={{ fontWeight: 600, fontSize: 24, color: T.muted }}>
          ChatGPT
        </span>
      </div>
      {/* chat */}
      <div style={{ opacity: 1 - chatOut, transform: `translateY(${-chatOut * 60}px)` }}>
        <div
          style={{
            position: "absolute",
            top: 120,
            right: 36,
            maxWidth: 760,
            padding: "22px 30px",
            borderRadius: "22px 22px 6px 22px",
            background: "rgba(0,217,255,0.16)",
            border: "1px solid rgba(0,217,255,0.4)",
            fontSize: 40,
            fontWeight: 600,
            color: T.white,
            opacity: lf > 16 ? 1 : 0,
          }}
        >
          <Typewriter text={t.question} frame={lf} start={18} perFrame={1.3} />
        </div>
        {thinking ? (
          <div style={{ position: "absolute", top: 300, left: 40, display: "flex", gap: 10 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ width: 14, height: 14, borderRadius: 7, background: T.cyan, opacity: 0.3 + 0.7 * Math.abs(Math.sin((lf + i * 4) / 5)) }} />
            ))}
          </div>
        ) : null}
        <div style={{ position: "absolute", top: 290, left: 36, right: 90, display: "flex", flexDirection: "column", gap: 34 }}>
          {t.answer.map((line, i) => {
            const a = pop(f, scene("chatgpt").start + 68 + i * 9, 16, 160);
            return (
              <div key={line} style={{ display: "flex", alignItems: "center", gap: 16, opacity: Math.min(1, a), transform: `translateX(${(1 - a) * -40}px)` }}>
                <div style={{ width: 12, height: 12, borderRadius: 6, background: T.teal, flexShrink: 0 }} />
                <Typewriter text={line} frame={lf} start={68 + i * 10} perFrame={2.6} caret={false} style={{ fontSize: 38, fontWeight: 500, color: T.text }} />
              </div>
            );
          })}
        </div>
      </div>
      {/* MCQ */}
      {lf > 112 && lf < 182 ? (
        <div style={{ position: "absolute", top: 100, left: 40, right: 40, opacity: Math.min(1, mcqIn) * (1 - mcqOut), transform: `scale(${0.9 + 0.1 * mcqIn})` }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: T.cyan, marginBottom: 10 }}>{t.mcqLabel}</div>
          <div style={{ fontSize: 38, fontWeight: 700, color: T.white, marginBottom: 30 }}>{t.mcqQuestion}</div>
          {t.mcqOptions.map((o, i) => {
            const good = i === t.mcqCorrect;
            const a = pop(f, scene("chatgpt").start + 124 + i * 5, 16, 170);
            return (
              <div
                key={o}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "18px 24px",
                  marginBottom: 20,
                  borderRadius: 16,
                  border: `1.5px solid ${correct && good ? T.good : "rgba(255,255,255,0.15)"}`,
                  background: correct && good ? "rgba(59,227,154,0.15)" : "rgba(255,255,255,0.04)",
                  opacity: Math.min(1, a) * (correct && !good ? 0.45 : 1),
                  fontSize: 34,
                  fontWeight: 500,
                  color: T.text,
                }}
              >
                <span style={{ width: 40, height: 40, borderRadius: 20, border: `2px solid ${correct && good ? T.good : T.muted}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {correct && good ? <Check size={26} color={T.good} stroke={3} draw={ramp(lf, 148, 8)} /> : null}
                </span>
                {o}
              </div>
            );
          })}
        </div>
      ) : null}
      {/* OSCE station */}
      {lf > 168 && lf < 210 ? (
        <Card style={{ top: 140, left: 120, right: 120, padding: "30px 36px", opacity: Math.min(1, osce) * (1 - osceOut), transform: `rotate(${(1 - osce) * -4}deg) translateY(${(1 - osce) * 60}px)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
            <Stethoscope size={46} color={T.cyan} />
            <span style={{ fontSize: 34, fontWeight: 700, color: T.cyan }}>{t.osceLabel}</span>
          </div>
          <div style={{ fontSize: 34, fontWeight: 700, color: T.white, marginBottom: 20 }}>{t.osceTask}</div>
          {t.osceSteps.map((st, i) => (
            <div key={st} style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30, color: T.text, marginBottom: 10 }}>
              <Check size={30} color={T.good} stroke={2.6} draw={ramp(lf, 178 + i * 6, 6)} />
              {st}
            </div>
          ))}
        </Card>
      ) : null}
      {/* infographic */}
      {lf > 198 ? (
        <Card style={{ top: 110, left: 200, right: 200, bottom: 60, padding: 30, opacity: Math.min(1, info), transform: `scale(${0.85 + 0.15 * info})` }}>
          <div style={{ textAlign: "center", fontSize: 36, fontWeight: 700, color: T.white }}>{t.infoTitle}</div>
          <div style={{ display: "flex", justifyContent: "center", margin: "20px 0" }}>
            <HeartPulse size={150} color={T.bad} stroke={1.6} draw={ramp(lf, 204, 16)} />
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            {t.infoItems.map((it, i) => (
              <div key={it} style={{ flex: 1, padding: "16px 10px", borderRadius: 14, background: i === 1 ? "rgba(255,92,122,0.18)" : "rgba(0,217,255,0.12)", textAlign: "center", fontSize: 28, fontWeight: 700, color: T.white }}>
                {it}
                <div style={{ height: 6, margin: "12px 18px 0", borderRadius: 3, background: "rgba(255,255,255,0.25)" }} />
                <div style={{ height: 6, margin: "8px 30px 0", borderRadius: 3, background: "rgba(255,255,255,0.15)" }} />
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
};

// ================================================================== CLAUDE
const DOC_LINES = 9;
export const ClaudeContent: React.FC<{ lf: number; f: number }> = ({ lf, f }) => {
  const t = text.claude;
  const toSlides = ramp(lf, 58, 40);
  const toApp = ramp(lf, 112, 34);
  // document paragraph blocks → three slides (3 blocks each)
  const docRect = (i: number) => ({ x: 270, y: 170 + i * 62, w: 420 - (i % 3) * 60, h: 22 });
  const slideOrigin = (k: number) => ({ x: 650 - k * 310, y: 260 });
  const blockInSlide = (i: number) => {
    const k = Math.floor(i / 3);
    const j = i % 3;
    const o = slideOrigin(k);
    return { x: o.x + 30, y: o.y + 90 + j * 40, w: 200 - j * 40, h: 14 };
  };
  const tile = (k: number) => ({ x: 520 - (k % 2) * 420, y: 200 + Math.floor(k / 2) * 270, w: 380, h: 240 });
  const tileIcons = [Check, Cards, HeartPulse, User];
  const codeFlash = lf > 100 && lf < 150 ? ramp(lf, 100, 8) * (1 - ramp(lf, 140, 10)) : 0;
  return (
    <div style={{ position: "absolute", inset: 0, ...AR }}>
      {/* the lecture document page */}
      <Card style={{ left: 240, top: 60, width: 480, height: 690, opacity: 1 - toSlides, transform: `scale(${1 - 0.2 * toSlides})` }}>
        <div style={{ padding: "26px 30px", display: "flex", alignItems: "center", gap: 14 }}>
          <Doc size={40} color={T.cyan} />
          <span style={{ fontSize: 28, fontWeight: 700, color: T.white }}>{t.docTitle}</span>
        </div>
      </Card>
      {/* paragraph blocks travel from the page into the slides */}
      {Array.from({ length: DOC_LINES }, (_, i) => {
        const a = docRect(i);
        const b = blockInSlide(i);
        const p = toSlides;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: lerp(a.x, b.x, p),
              top: lerp(a.y, b.y, p),
              width: lerp(a.w, b.w, p),
              height: lerp(a.h, b.h, p),
              borderRadius: 6,
              background: i % 3 === 0 ? T.cyan : "rgba(255,255,255,0.35)",
              opacity: (lf > 8 ? 1 : 0) * (1 - toApp),
            }}
          />
        );
      })}
      {/* slides */}
      {[0, 1, 2].map((k) => {
        const o = slideOrigin(k);
        const tl = tile(k);
        const a = pop(f, scene("claude").start + 64 + k * 6, 15, 150);
        return (
          <Card
            key={k}
            glow={toApp * 0.6}
            style={{
              left: lerp(o.x, tl.x, toApp),
              top: lerp(o.y, tl.y, toApp),
              width: lerp(290, tl.w, toApp),
              height: lerp(190, tl.h, toApp),
              opacity: Math.min(1, a) * Math.max(toSlides, toApp),
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 8, background: k === 1 ? T.teal : T.cyan, opacity: 1 - toApp }} />
            <div style={{ padding: "26px 24px", fontSize: 26, fontWeight: 700, color: T.white, opacity: 1 - toApp }}>{t.slides[k]}</div>
          </Card>
        );
      })}
      {/* app: header + four tiles (the fourth grows from the centre) */}
      <div style={{ position: "absolute", top: 70, left: 100, right: 100, display: "flex", alignItems: "center", justifyContent: "space-between", opacity: toApp }}>
        <span style={{ fontSize: 36, fontWeight: 700, color: T.white }}>{t.appTitle}</span>
        <div style={{ width: 180, height: 14, borderRadius: 7, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
          <div style={{ width: `${ramp(lf, 150, 60) * 100}%`, height: "100%", background: T.good }} />
        </div>
      </div>
      {[0, 1, 2, 3].map((k) => {
        const tl = tile(k);
        const Icon = tileIcons[k];
        const a = k === 3 ? pop(f, scene("claude").start + 128, 14, 150) : toApp;
        const beat = 1 + 0.05 * Math.max(0, Math.sin((lf - 150) / 5)) * (k === 2 && lf > 150 ? 1 : 0);
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: tl.x,
              top: tl.y,
              width: tl.w,
              height: tl.h,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              opacity: Math.min(1, a),
              transform: `scale(${(k === 3 ? 0.6 + 0.4 * Math.min(1, a) : 1) * beat})`,
              border: k === 3 ? `1.5px solid rgba(0,217,255,${0.3 * Math.min(1, a)})` : "none",
              borderRadius: 20,
              background: k === 3 ? "rgba(255,255,255,0.07)" : "transparent",
            }}
          >
            <Icon size={70} color={k % 2 ? T.teal : T.cyan} stroke={1.8} />
            <span style={{ fontSize: 30, fontWeight: 700, color: T.white }}>{t.appTiles[k]}</span>
          </div>
        );
      })}
      {/* Claude Code: code lines flash while the slides become an app */}
      {codeFlash > 0 ? (
        <div dir="ltr" style={{ position: "absolute", left: 40, bottom: 40, fontFamily: "monospace", fontSize: 22, color: T.teal, opacity: codeFlash, lineHeight: 1.5 }}>
          <div>{"<Quiz questions={cardio} />"}</div>
          <div>{"<Flashcards deck=\"heart\" />"}</div>
          <div>{"<CaseSimulator case={virtual} />"}</div>
        </div>
      ) : null}
      {codeFlash > 0 ? (
        <div style={{ position: "absolute", right: 40, bottom: 40, display: "flex", alignItems: "center", gap: 10, opacity: codeFlash }}>
          <Code size={36} color={T.cyan} />
          <span dir="ltr" style={{ fontSize: 24, fontWeight: 700, color: T.cyan }}>
            Claude Code
          </span>
        </div>
      ) : null}
    </div>
  );
};

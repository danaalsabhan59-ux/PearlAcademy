import { SceneId } from "../data/timeline";

/**
 * The silent film's script — no narration; the text IS the story.
 * Each card is read on screen; `dur` is natural reading time (s), scaled to fit 90 s exactly.
 * Words between *asterisks* are highlighted in amber.
 * `own: true` = the scene draws this text itself (myth/fact, steps, closing), so the typography layer skips it.
 * `cues` anchor the scene's animation beats (same keys the narrated version uses) to a card + offset (s).
 */
export type Card = { id: string; text: string; dur: number; own?: boolean; big?: boolean };
export type ScenePlan = { id: SceneId; chapter: string; lead: number; cards: Card[]; cues: Record<string, [string, number]> };

export const PLAN: ScenePlan[] = [
  {
    id: "s1",
    chapter: "السؤال",
    lead: 0.8,
    cards: [
      { id: "a1", text: "كلما سمعنا عن *حادث نووي*…", dur: 3.4 },
      { id: "a2", text: "هل يمكن أن *يصل إلينا*؟", dur: 3.8, big: true },
      { id: "a3", text: "حتى لو وقع على بُعد *مئات الكيلومترات*؟", dur: 4.2 },
    ],
    cues: { حادث: ["a1", 0], هل: ["a2", 0], مئات: ["a3", 0.3], وكيف: ["a3", 1.8] },
  },
  {
    id: "s2",
    chapter: "المنشأة",
    lead: 0.6,
    cards: [
      { id: "b1", text: "تضرُّر منشأة نووية…", dur: 2.8 },
      { id: "b2", text: "لا يعني *انفجاراً نووياً*", dur: 3.4, big: true },
      { id: "b3", text: "لكن في بعض الحوادث قد *تتسرب مواد مشعة* إلى البيئة", dur: 4.6 },
      { id: "b4", text: "بحسب نوع المنشأة ومدى الضرر", dur: 3.2 },
    ],
    cues: { انفجار: ["b2", 0], الحوادث: ["b3", 0], تتسرب: ["b3", 1.0] },
  },
  {
    id: "s3",
    chapter: "الانتقال",
    lead: 0.6,
    cards: [
      { id: "c1", text: "خرافة: الإشعاع سحابة تحملها الرياح", dur: 3.4, own: true },
      { id: "c2", text: "حقيقة: مواد مشعة ≠ الإشعاع نفسه", dur: 4.4, own: true },
      { id: "c3", text: "*الرياح* قد تحملها لمسافات طويلة", dur: 3.8 },
      { id: "c4", text: "و*الأمطار* قد تُرسّبها على الأرض والمياه", dur: 4.2 },
    ],
    cues: { هل: ["c1", 0], ليس: ["c1", 1.9], ينتقل: ["c2", 0], "تحمل#1": ["c3", 0], "الرياح#1": ["c3", 0], لمسافات: ["c3", 1.6], الأمطار: ["c4", 0], تُرسّب: ["c4", 0.4] },
  },
  {
    id: "s4",
    chapter: "المسافة",
    lead: 0.6,
    cards: [
      { id: "d1", text: "الابتعاد عن المصدر يقلّل التعرض *عادةً*", dur: 3.8 },
      { id: "d2", text: "لكن المسافة *ليست العامل الوحيد*", dur: 3.4, big: true },
      { id: "d3", text: "ما الذي يحدد *الانتشار*؟", dur: 5.6 },
    ],
    cues: { ابتعدنا: ["d1", 0], لكن: ["d2", 0], فاتجاه: ["d3", 0.6], وسرعتها: ["d3", 1.5], وكمية: ["d3", 2.5], والظروف: ["d3", 3.6], كلها: ["d3", 5.4] },
  },
  {
    id: "s5",
    chapter: "الماء والغذاء",
    lead: 2.0,
    cards: [
      { id: "e1", text: "قد تصل المواد المترسبة إلى *التربة والمياه والمحاصيل*", dur: 4.8 },
      { id: "e2", text: "لكن ذلك *لا يعني بالضرورة* أن ماء الشرب أو الطعام غير آمن", dur: 6.0 },
    ],
    cues: { ترسبت: ["e1", -1.8], التربة: ["e1", 1.0], والمياه: ["e1", 1.8], والمحاصيل: ["e1", 2.6], الزراعية: ["e1", 3.2], لكن: ["e2", 0] },
  },
  {
    id: "s6",
    chapter: "القياس",
    lead: 0.6,
    cards: [
      { id: "f1", text: "الخطر *لا تحدده الشائعات*", dur: 3.0, big: true },
      { id: "f2", text: "بل *أجهزة الرصد* والقياسات العلمية", dur: 3.6 },
      { id: "f3", text: "وتُعلنه *الجهات الرسمية*", dur: 3.6 },
    ],
    cues: { الخطر: ["f1", 0], الشائعات: ["f1", 0.5], بل: ["f2", 0], أجهزة: ["f2", 0.3], والقياسات: ["f2", 1.6], الرسمية: ["f3", 0.3], هيئة: ["f3", 1.1] },
  },
  {
    id: "s7",
    chapter: "ماذا أفعل؟",
    lead: 0.8,
    cards: [
      { id: "g1", text: "عند صدور تنبيه رسمي: ادخل · ابقَ في الداخل · تابع التعليمات", dur: 6.0, own: true },
      { id: "g2", text: "ليس كل حادث نووي *كارثة*", dur: 2.8, big: true },
      { id: "g3", text: "الوعي يبدأ من المعلومة الموثوقة", dur: 6.4, own: true },
    ],
    cues: { تنبيه: ["g1", 0], ادخل: ["g1", 1.1], "وابقَ": ["g1", 2.2], وتابع: ["g1", 3.3], فليس: ["g2", 0], والوعي: ["g3", 0] },
  },
];

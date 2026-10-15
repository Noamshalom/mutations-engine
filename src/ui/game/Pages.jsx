// Page pieces: headings, the segmented switch, the rule demos, the four-combinations lesson, the guide, the shape picker.
import React, { useState } from "react";
import { TRAITS } from "../../engine/creatures.js";
import { SK } from "../../engine/extended/skeletons.js";
import { traitEdge, hiddenFeats } from "../../engine/extended/rules.js";
import { SKEL_HE } from "../../engine/extended/generator.js";
import { FONT, HA, btn, btnS, closeBtn, linkBtn } from "../theme.js";
import { Creature } from "../Creature.jsx";
import { BeingBox } from "./Beings.jsx";
import { TreeView } from "./TreeView.jsx";

export const H2 = ({ children }) => <h2 style={{ fontSize: 18, fontWeight: 800, margin: "22px 0 8px", fontFamily: FONT, borderTop: `1px solid ${HA.line}`, paddingTop: 14 }}>{children}</h2>;
export const P = ({ children, style }) => <p style={{ fontSize: 14.5, color: "#333", lineHeight: 1.7, margin: "0 0 8px", ...style }}>{children}</p>;
export function Seg({ value, onChange, options }) {
  return (<div style={{ display: "inline-flex", border: `1.5px solid ${HA.ink}`, borderRadius: 7, overflow: "hidden" }}>
    {options.map(([v, lab]) => <button key={v} onClick={() => onChange(v)} style={{ background: value === v ? HA.ink : "#fff", color: value === v ? "#fff" : HA.ink, border: "none", padding: "6px 14px", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>{lab}</button>)}
  </div>);
}
export const DEMO_TRAITS = ["sail", "horn", "claws", "tail"];
export const DEMO_GOOD = { a: ["sail", "horn"], b: ["sail"], c: ["claws"], d: ["tail"] };
export const DEMO_BAD = { a: ["sail", "horn"], b: ["claws"], c: ["sail"], d: ["tail"] };
export function DemoTree({ feats, good, note }) {
  const sk = SK.s4; const tEdge = {}; DEMO_TRAITS.forEach((t) => { tEdge[t] = traitEdge(sk, feats, t); });
  const marks = {}; if (good) DEMO_TRAITS.forEach((t) => { (marks[tEdge[t]] = marks[tEdge[t]] || []).push(t); });
  return (<div style={{ flex: "1 1 260px", minWidth: 240, background: HA.panel, border: `1px solid ${HA.line}`, borderRadius: 8, padding: "8px 8px 10px" }}>
    <TreeView sk={sk} mode="morph" featsAt={(l) => feats[l]} leafStroke={() => (good ? HA.green : HA.hint)} marks={marks} innerFeats={good ? hiddenFeats(sk, feats, tEdge, DEMO_TRAITS) : null}
      ring={good ? null : ["a", "c"]} ringColor={TRAITS.sail.color} maxW={340} />
    <div style={{ textAlign: "center", margin: "6px 0 4px", fontSize: 13.5, fontWeight: 800, color: good ? HA.green : HA.red }}>{good ? "נכון ✓" : "לא נכון ✗"}</div>
    <div style={{ fontSize: 12.5, color: "#444", lineHeight: 1.55, textAlign: "center" }}>{note}</div>
  </div>);
}
export const FOUR = [[["spots", "horn", "tail"], "גם קרן וגם זנב"], [["spots", "horn"], "רק קרן"], [["spots", "tail"], "רק זנב"], [["spots"], "בלי שניהם"]];
export function FourRule() {
  return (<div style={{ background: HA.panel, border: `1px solid ${HA.line}`, borderRadius: 8, padding: 12, margin: "0 0 14px" }}>
    <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>כלל ארבעת הצירופים</div>
    <P>לא לכל אוסף יצורים יש עץ מתאים. כל איבר משתנה על קו אחד, כלומר חותך את העץ לשני חלקים. שני חיתוכים מחלקים את העץ לשלושה חלקים לכל היותר, ובכל חלק לכל היצורים אותו צירוף של שני האיברים. לכן אם שני איברים מופיעים בכל ארבעת הצירופים, אין עץ מתאים.</P>
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {FOUR.map(([f, lab]) => <div key={lab} style={{ flex: "1 1 110px", minWidth: 110, background: "#fff", border: `1px solid ${HA.line}`, borderRadius: 7, padding: "6px 4px", textAlign: "center" }}><div style={{ display: "flex", justifyContent: "center" }}><Creature t={f} size={54} /></div><div style={{ fontSize: 12.5, fontWeight: 700, marginTop: 2 }}>{lab}</div></div>)}
    </div>
    <P style={{ margin: "8px 0 0", fontSize: 13.5, color: HA.sub }}>ארבעת אלה לא יכולים לשבת יחד באותו עץ. כדי להוכיח שאין עץ, מספיק להצביע על שני איברים ועל ארבעה יצורים כאלה.</P>
  </div>);
}

const GUIDE_PZ = { traits: DEMO_TRAITS, letters: { sail: ["A", "G"], horn: ["C", "T"], claws: ["T", "A"], tail: ["G", "C"] } };
export function Guide({ onClose }) {
  const [i, setI] = useState(0);
  const steps = [
    { title: "החוק", body: (<>
      <P>רואים רק את היצורים שבקצוות העץ. היצורים שבתוך העץ נסתרים. צריך לשבץ כל יצור בקצה הנכון.</P>
      <P><b>כל איבר משתנה פעם אחת בדיוק בכל העץ.</b> כלומר יש קו אחד שמפריד בין כל מי שיש לו את האיבר לבין כל מי שאין לו. גם איבר שיש לכולם חוץ מאחד משתנה פעם אחת: על הקו של האחד.</P>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <DemoTree feats={DEMO_GOOD} good note="המפרש משתנה רק בקו האמצעי." />
        <DemoTree feats={DEMO_BAD} note="שני בעלי המפרש בשני צדי העץ. אין קו אחד שמפריד אותם." />
      </div></>) },
    { title: "ציור או דנ\"א", body: (<>
      <P>אותה חידה אפשר לראות בשתי דרכים, ומחליפים ביניהן במתג <b>ציור / דנ"א</b> שליד שם השלב, בכל רגע.</P>
      <P>בתצוגת דנ"א כל יצור הוא רצף קצר. כל איבר הוא עמדה ברצף: אות אחת כשהאיבר חסר, אות אחרת כשהוא קיים. החוק זהה: כל עמדה משתנה פעם אחת בדיוק.</P>
      <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", background: HA.panel, border: `1px solid ${HA.line}`, borderRadius: 8, padding: 10 }}>
        {[["sail", "horn"], ["sail"], ["claws"], ["tail"]].map((f, k) => <div key={k} style={{ display: "flex", alignItems: "center", gap: 6 }}><BeingBox pz={GUIDE_PZ} mode="morph" feats={f} box={56} /><span style={{ color: HA.sub }}>=</span><BeingBox pz={GUIDE_PZ} mode="dna" feats={f} box={56} /></div>)}
      </div>
      <P style={{ fontSize: 13, color: HA.sub, margin: "8px 0 0" }}>חלק מהשלבים נפתחים ישר בתצוגת דנ"א. אפשר תמיד לחזור לציור.</P></>) },
    { title: "הכלים שלכם", body: (<>
      <P><b>הקשה על איבר</b> מסמנת את כל היצורים שיש להם אותו, על הלוח ובמאגר. הם חייבים לשבת בצד אחד של קו אחד.</P>
      <P><b>טבלת הנתונים</b> (כפתור מעל הלוח) מראה לכל יצור אילו איברים יש לו. בדנ"א היא הופכת לרצפים זה מתחת לזה. שם הכי קל לראות מי דומה למי, ולמצוא סתירות.</P>
      <P><b>רמז</b> ממלא משבצת או מסמן משבצת שלא מתאימה. <b>בדיקה</b> צובעת כל איבר בירוק או באדום ומסבירה למה.</P>
      <P>בשלבים מתקדמים יש גם חלק שני, להניח כל איבר על הקו שבו הוא משתנה, ויש חידות שאין להן עץ מתאים בכלל. שם לוחצים על <b>אין עץ מתאים</b> ומוכיחים: שני איברים וארבעה יצורים שמראים את כל ארבעת הצירופים.</P></>) },
  ];
  const st = steps[i];
  return (<div style={{ background: "#fff", border: `2px solid ${HA.ink}`, borderRadius: 10, padding: "14px 16px 12px", margin: "0 0 18px", boxShadow: "0 6px 24px rgba(0,0,0,.08)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
      <div style={{ fontSize: 11.5, letterSpacing: 3, color: HA.hint, fontWeight: 800, flex: 1 }}>איך משחקים · {i + 1} מתוך {steps.length}</div>
      <button onClick={onClose} style={closeBtn}>✕</button>
    </div>
    <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 8px", fontFamily: FONT }}>{st.title}</h2>
    {st.body}
    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12, flexWrap: "wrap" }}>
      {i > 0 && <button onClick={() => setI(i - 1)} style={{ ...btnS("#fff", HA.ink), border: `1.5px solid ${HA.line}` }}>הקודם</button>}
      {i < steps.length - 1 ? <button onClick={() => setI(i + 1)} style={btn(HA.accent, "#fff")}>הבא</button> : <button onClick={onClose} style={btn(HA.green, "#fff")}>למשחק</button>}
      <button onClick={onClose} style={linkBtn}>דלג</button>
      <div style={{ display: "flex", gap: 5, marginInlineStart: "auto" }}>{steps.map((_, k) => <span key={k} style={{ width: 9, height: 9, borderRadius: 5, background: k === i ? HA.hint : HA.line }} />)}</div>
    </div>
  </div>);
}
// ---- shape picker, for levels where the tree shape is not given ----
export function SkelPicker({ pz, mode, onPick }) {
  return (<div>
    <P>אלה היצורים. איזו צורת עץ מתאימה להם? חשבו איזה איבר משותף בדיוק לשניים, ואיזה בדיוק לשלושה.</P>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "8px 0 14px" }}>{pz.tiles.map((t) => <div key={t.id} style={{ background: "#fff", border: `2px solid ${HA.line}`, borderRadius: 7, padding: 3 }}><BeingBox pz={pz} mode={mode} feats={t.feats} box={66} /></div>)}</div>
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      {["s6c", "s6s"].map((name) => <button key={name} onClick={() => onPick(name)} style={{ flex: "1 1 240px", background: HA.panel, border: `2px solid ${HA.line}`, borderRadius: 8, padding: 8, cursor: "pointer", fontFamily: FONT }}>
        <TreeView sk={SK[name]} mode="morph" featsAt={() => null} leafStroke={() => "#6b6459"} maxW={300} />
        <div style={{ fontSize: 14.5, fontWeight: 800, color: HA.ink, marginTop: 6 }}>{SKEL_HE[name]}</div>
      </button>)}
    </div>
  </div>);
}

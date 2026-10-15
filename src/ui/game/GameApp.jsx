// The extended game: levels, view switch, guide, progress.
import React, { useState, useMemo, useEffect } from "react";

import { SK } from "../../engine/extended/skeletons.js";
import { genPuzzle, STAGES, freeStage } from "../../engine/extended/generator.js";
import { FONT, HA, btnS } from "../theme.js";
import { H2, P, Seg, DemoTree, FourRule, Guide, SkelPicker, DEMO_GOOD, DEMO_BAD } from "./Pages.jsx";
import { LeafBoard } from "./LeafBoard.jsx";

const loadDone = () => { try { const a = JSON.parse(localStorage.getItem("mut-ext-done") || "[]"); return Array.isArray(a) ? a : []; } catch (e) { return []; } };
const saveDone = (a) => { try { localStorage.setItem("mut-ext-done", JSON.stringify(a)); } catch (e) {} };
const guideSeen = () => { try { return localStorage.getItem("mut-ext-guide") === "1"; } catch (e) { return false; } };
const markGuide = () => { try { localStorage.setItem("mut-ext-guide", "1"); } catch (e) {} };

export function GameApp() {
  const [mode, setMode] = useState("morph");
  const [idx, setIdx] = useState(0); // idx === STAGES.length means free play
  const [n, setN] = useState(0);
  const [seed0] = useState(() => Math.floor(Math.random() * 1e9));
  const [done, setDone] = useState(loadDone);
  const [guide, setGuide] = useState(() => !guideSeen());
  const [chosenSkel, setChosenSkel] = useState(null);
  const free = idx >= STAGES.length;
  const stage = useMemo(() => (free ? freeStage(seed0 + n * 31 + 5) : STAGES[idx]), [free, idx, n, seed0]);
  const pz = useMemo(() => genPuzzle(stage, seed0 + idx * 1009 + n * 17), [stage, seed0, idx, n]);
  useEffect(() => { setMode(stage.view || "morph"); setChosenSkel(null); }, [idx, n]); // eslint-disable-line
  const closeGuide = () => { setGuide(false); markGuide(); };
  const boardSk = stage.chooseSkel ? (chosenSkel ? SK[chosenSkel] : null) : (pz ? pz.sk : null);
  const win = () => { if (!free && !done.includes(idx)) { const d = [...done, idx]; setDone(d); saveDone(d); } };
  const next = () => { if (free) setN(n + 1); else { setIdx(idx + 1); setN(0); } };
  const pill = (on, ok) => ({ minWidth: 34, height: 34, borderRadius: 17, border: `1.5px solid ${on ? HA.ink : ok ? HA.green : HA.line}`, background: on ? HA.ink : ok ? "#eaf4ec" : "#fff", color: on ? "#fff" : ok ? HA.green : HA.ink, fontWeight: 800, fontSize: 13.5, cursor: "pointer", fontFamily: FONT, padding: "0 10px" });
  return (<div dir="rtl" style={{ background: HA.bg, minHeight: "100vh", color: HA.ink, fontFamily: FONT }}>
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "22px 16px 60px" }}>
      <div style={{ borderBottom: `2px solid ${HA.ink}`, paddingBottom: 8, marginBottom: 12 }}>
        <div style={{ fontSize: 11.5, letterSpacing: 3, color: HA.hint, fontWeight: 800 }}>הגרסה המורחבת</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}><h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: "-0.01em", fontFamily: FONT, flex: 1 }}>מוטציות</h1><button onClick={() => setGuide(true)} style={{ ...btnS("#fff", HA.ink), border: `1.5px solid ${HA.ink}` }}>איך משחקים?</button></div>
        <P style={{ margin: "4px 0 0", color: "#444" }}>רואים רק את היצורים שבקצוות העץ. שחזרו את העץ כך שכל איבר משתנה פעם אחת בדיוק.</P>
      </div>
      {guide && <Guide onClose={closeGuide} />}

      <H2>החוק</H2>
      <P>בתוך העץ מסתתרים יצורים שאי אפשר לראות. רואים רק את היצורים שבקצוות, וצריך לשבץ כל אחד מהם בקצה הנכון.</P>
      <P><b>כל איבר משתנה פעם אחת בדיוק בכל העץ.</b> כלומר יש קו אחד שמפריד בין כל היצורים שיש להם את האיבר לבין כל היצורים שאין להם אותו.</P>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "10px 0 4px" }}>
        <DemoTree feats={DEMO_GOOD} good note="המפרש משתנה רק בקו האמצעי, וכל איבר אחר משתנה בקו אחד. הדמויות הדהויות הן היצורים הנסתרים." />
        <DemoTree feats={DEMO_BAD} note="שני בעלי המפרש יושבים בשני צדי העץ. אין קו אחד שמפריד אותם מהשאר, ולכן המפרש היה צריך להשתנות פעמיים." />
      </div>

      <H2>ציור או דנ"א</H2>
      <P>אותה חידה אפשר לראות בשתי דרכים. בתצוגת דנ"א כל איבר הוא עמדה ברצף קצר: אות אחת כשהאיבר חסר, ואות אחרת כשהוא קיים. החוק נשאר זהה: כל עמדה משתנה פעם אחת בדיוק. אפשר להחליף תצוגה בכל רגע, גם באמצע חידה.</P>

      <div style={{ marginTop: 26, borderTop: `2px solid ${HA.ink}`, paddingTop: 14 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
          {STAGES.map((s, i) => <button key={i} onClick={() => { setIdx(i); setN(0); }} style={pill(idx === i, done.includes(i))}>{i + 1}</button>)}
          <button onClick={() => { setIdx(STAGES.length); setN(0); }} style={pill(free, false)}>חופשי</button>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 11.5, letterSpacing: 3, color: HA.hint, fontWeight: 800 }}>{free ? "משחק חופשי" : `שלב ${idx + 1} מתוך ${STAGES.length}`}</div>
            <h2 style={{ fontSize: 23, fontWeight: 800, margin: "3px 0 2px", fontFamily: FONT }}>{stage.title}</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 3 }}><Seg value={mode} onChange={setMode} options={[["morph", "ציור"], ["dna", "דנ\"א"]]} /><span style={{ fontSize: 11.5, color: HA.sub }}>תצוגה: אותה חידה, שתי דרכים</span></div>
        </div>
        {stage.note && <P style={{ color: "#444" }}>{stage.note}</P>}
        {stage.teach && <FourRule />}
        {!pz ? <P style={{ color: HA.red }}>לא הצלחנו להכין חידה. נסו שוב.</P>
          : stage.chooseSkel && !chosenSkel ? <SkelPicker pz={pz} mode={mode} onPick={setChosenSkel} />
          : <LeafBoard key={idx + "-" + n + "-" + (chosenSkel || "")} stage={stage} pz={pz} sk={boardSk} mode={mode} onWin={win} onNext={next} onNew={() => setN(n + 1)} onChangeSkel={stage.chooseSkel ? () => setChosenSkel(null) : undefined} />}
        {!free && idx === STAGES.length - 1 && done.includes(idx) && <P style={{ marginTop: 14, color: HA.sub }}>סיימתם את כל השלבים. במשחק החופשי יש חידות חדשות בלי סוף.</P>}
      </div>
    </div>
  </div>);
}

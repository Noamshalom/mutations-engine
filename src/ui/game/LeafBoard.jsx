// The board of one level: placing creatures, the edge task, hints, checking, the no-tree proof.
import React, { useState, useMemo } from "react";
import { TRAITS, sameSet } from "../../engine/creatures.js";
import { traitEdge, hiddenFeats, proofValid, completion } from "../../engine/extended/rules.js";

import { FONT, INK, HA, btn, btnS, closeBtn, linkBtn, toggleIn } from "../theme.js";
import { BeingBox, TraitChip, traitLabel } from "./Beings.jsx";
import { TreeView } from "./TreeView.jsx";
import { DataTable, Combos } from "./DataTable.jsx";

export function LeafBoard({ stage, pz, sk: skProp, mode, onWin, onNext, onNew, onChangeSkel }) {
  const sk = skProp || pz.sk; const D = mode === "dna";
  const twoParts = !!stage.edgeTask;
  const skelFits = useMemo(() => (stage.chooseSkel ? !!completion(sk, pz, {}) : true), [sk, pz, stage.chooseSkel]);
  const [place, setPlace] = useState({}); const [sel, setSel] = useState(null); const [checked, setChecked] = useState(false);
  const [phase, setPhase] = useState("leaves"); // leaves, edges, done, proof
  const [focusT, setFocusT] = useState(null);
  const [edgeAt, setEdgeAt] = useState({}); const [selT, setSelT] = useState(null); const [edgeChecked, setEdgeChecked] = useState(false);
  const [proofOpen, setProofOpen] = useState(false); const [pT, setPT] = useState([]); const [pR, setPR] = useState([]); const [proofMsg, setProofMsg] = useState(null);
  const [badLeaf, setBadLeaf] = useState(null); const [hintMsg, setHintMsg] = useState(null); const [showTable, setShowTable] = useState(!!stage.conflict && stage.conflict !== "no");
  const [edgeBanner, setEdgeBanner] = useState(false);

  const tile = (id) => pz.tiles.find((t) => t.id === id);
  const featsAt = (l) => (place[l] ? tile(place[l]).feats : null);
  const filled = sk.leafIds.every((l) => place[l]);
  const leafFeats = filled ? Object.fromEntries(sk.leafIds.map((l) => [l, featsAt(l)])) : null;
  const tEdge = {}; if (filled) pz.traits.forEach((t) => { tEdge[t] = traitEdge(sk, leafFeats, t); });
  const leavesOK = filled && pz.traits.every((t) => tEdge[t] >= 0);
  const allPlaced = pz.traits.every((t) => edgeAt[t] != null);
  const edgesOK = allPlaced && pz.traits.every((t) => edgeAt[t] === tEdge[t]);
  const won = phase === "done" || phase === "proof";
  const tray = pz.tiles.filter((t) => !Object.values(place).includes(t.id));
  const canClaim = stage.conflict && stage.conflict !== "no";

  const tapLeaf = (l) => {
    if (phase !== "leaves") return;
    setChecked(false); setBadLeaf(null); setHintMsg(null);
    if (sel) { setPlace({ ...place, [l]: sel }); setSel(null); return; }
    if (place[l]) { const p = { ...place }; delete p[l]; setPlace(p); }
  };
  const tapChip = (t) => {
    if (phase === "edges") { setEdgeChecked(false); setHintMsg(null); if (edgeAt[t] != null) { const e = { ...edgeAt }; delete e[t]; setEdgeAt(e); setSelT(t); } else setSelT(selT === t ? null : t); return; }
    setFocusT(focusT === t ? null : t);
  };
  const tapEdge = (i) => { if (phase !== "edges" || !selT) return; setEdgeAt({ ...edgeAt, [selT]: i }); setSelT(null); setEdgeChecked(false); };
  const doCheck = () => {
    setHintMsg(null); setBadLeaf(null);
    if (phase === "leaves") {
      setChecked(true);
      if (leavesOK) { setFocusT(null); setProofOpen(false); if (stage.edgeTask) { setPhase("edges"); setEdgeBanner(true); } else { setPhase("done"); onWin(); } }
      else setFocusT(pz.traits.find((t) => tEdge[t] < 0) || null);
      return;
    }
    if (phase === "edges") { setEdgeChecked(true); if (edgesOK) { setSelT(null); setPhase("done"); onWin(); } }
  };
  const checkProof = () => {
    if (pT.length !== 2 || pR.length !== 4) { setProofMsg("count"); return; }
    if (proofValid(pz, pT, pR)) { setProofMsg(null); setPhase("proof"); onWin(); } else setProofMsg("no");
  };
  const doHint = () => {
    setBadLeaf(null);
    if (phase === "edges") { const t = pz.traits.find((x) => edgeAt[x] !== tEdge[x]); if (t) { setEdgeAt({ ...edgeAt, [t]: tEdge[t] }); setSelT(null); setEdgeChecked(false); } return; }
    if (pz.conflict) {
      if (!proofOpen) { setHintMsg("לא מצליחים לסדר? אולי אין כאן עץ מתאים בכלל. לחצו על \"אין עץ מתאים\" וחפשו הוכחה."); return; }
      const v = pz.violation; setProofMsg(null);
      if (!sameSet(pT, v.traits)) { const need = v.traits.find((t) => !pT.includes(t)); setPT([...pT.filter((t) => v.traits.includes(t)), need]); } else setPR(v.rows);
      return;
    }
    if (proofOpen) { setHintMsg("כאן אין הוכחה, כי יש עץ מתאים. סגרו את החלון וחזרו לשבץ."); return; }
    if (stage.chooseSkel && !skelFits) { setHintMsg("על העץ שבחרתם אין שום שיבוץ שמקיים את החוק. החליפו עץ."); return; }
    const comp = completion(sk, pz, place);
    if (comp) { const l = sk.leafIds.find((x) => !place[x]); if (l) { setPlace({ ...place, [l]: comp[l] }); setSel(null); setChecked(false); } else setHintMsg("הכול במקום. לחצו על בדיקה."); return; }
    for (const l of Object.keys(place)) { const p = { ...place }; delete p[l]; if (completion(sk, pz, p)) { setBadLeaf(l); setHintMsg("המשבצת המסומנת באדום לא מתאימה. הקישו עליה כדי לפנות אותה."); return; } }
    setHintMsg("כמה משבצות לא מתאימות. פנו חלק מהן והתחילו מזוג שנבדל בדבר אחד בלבד.");
  };

  const shownT = phase === "edges" ? selT : focusT;
  const ring = shownT ? sk.leafIds.filter((l) => featsAt(l) && featsAt(l).includes(shownT)) : null;
  const ringColor = shownT ? (D ? INK : TRAITS[shownT].color) : INK;
  const marks = {}; const markSrc = phase === "done" ? tEdge : phase === "edges" ? edgeAt : null;
  if (markSrc) pz.traits.forEach((t) => { const i = markSrc[t]; if (i != null && i >= 0) (marks[i] = marks[i] || []).push(t); });
  const badMarks = phase === "edges" && edgeChecked ? pz.traits.filter((t) => edgeAt[t] != null && edgeAt[t] !== tEdge[t]) : null;
  const inner = phase === "done" ? hiddenFeats(sk, leafFeats, tEdge, pz.traits) : null;
  const hotEdge = phase === "done" && focusT && tEdge[focusT] >= 0 ? tEdge[focusT] : null;
  const leafStroke = (l) => (badLeaf === l ? HA.red : !place[l] ? "#6b6459" : phase !== "leaves" ? HA.green : HA.hint);
  const chipState = (t) => (phase === "leaves" && checked && filled ? (tEdge[t] >= 0 ? "ok" : "bad") : phase === "done" ? "ok" : null);

  const howto = phase === "edges"
    ? (D ? "הרצפים במקום. עכשיו הניחו כל עמדה על הקו שבו היא משתנה: בחרו עמדה, ואז הקישו על קו." : "היצורים במקום. עכשיו הניחו כל איבר על הקו שבו הוא משתנה: בחרו איבר, ואז הקישו על קו.")
    : (D ? "שבצו את הרצפים בקצוות העץ. כל עמדה צריכה להשתנות פעם אחת בדיוק בכל העץ." : "שבצו את היצורים בקצוות העץ. כל איבר צריך להשתנות פעם אחת בדיוק בכל העץ.");
  const focusText = !focusT || phase === "edges" ? null
    : checked && filled && tEdge[focusT] < 0 ? "אין קו אחד שמפריד בין המסומנים לבין כל השאר. כאן נדרש יותר משינוי אחד."
    : (checked && filled) || phase === "done" ? "קו אחד מפריד בין המסומנים לבין כל השאר."
    : D ? `מסומנים הרצפים שיש להם ${pz.letters[focusT][1]} בעמדה הזו.` : "מסומנים היצורים שיש להם את האיבר הזה.";

  return (<div>
    {twoParts && !won && <div style={{ display: "inline-block", fontSize: 12, fontWeight: 800, letterSpacing: 1, color: phase === "edges" ? HA.green : HA.hint, border: `1.5px solid ${phase === "edges" ? HA.green : HA.hint}`, borderRadius: 14, padding: "3px 10px", marginBottom: 8 }}>{phase === "edges" ? "חלק 2 מתוך 2: איברים על הקווים" : "חלק 1 מתוך 2: שיבוץ היצורים"}</div>}
    {phase === "edges" && edgeBanner && <div style={{ background: "#eaf4ec", border: `2px solid ${HA.green}`, borderRadius: 8, padding: "12px 14px", margin: "0 0 12px", display: "flex", gap: 10, alignItems: "flex-start" }}>
      <div style={{ flex: 1, fontSize: 15, color: "#24523a", lineHeight: 1.6 }}><b>{D ? "הרצפים במקום!" : "היצורים במקום!"}</b> זה היה החלק הראשון. עכשיו החלק השני: {D ? "הניחו כל עמדה על הקו שבו היא משתנה. בחרו עמדה למטה, ואז הקישו על קו בעץ." : "הניחו כל איבר על הקו שבו הוא משתנה. בחרו איבר למטה, ואז הקישו על קו בעץ."}</div>
      <button onClick={() => setEdgeBanner(false)} style={closeBtn}>✕</button>
    </div>}
    {!won && <p style={{ fontSize: 14.5, color: "#444", lineHeight: 1.6, margin: "0 0 10px" }}>{howto}</p>}
    <div style={{ display: "flex", gap: 8, alignItems: "center", margin: "0 0 8px", flexWrap: "wrap" }}>
      <button onClick={() => setShowTable(!showTable)} style={{ ...btnS(showTable ? HA.ink : "#fff", showTable ? "#fff" : HA.ink), border: `1.5px solid ${HA.ink}` }}>{showTable ? "הסתר טבלה" : D ? "טבלת הרצפים" : "טבלת הנתונים"}</button>
      {stage.chooseSkel && onChangeSkel && !won && <button onClick={onChangeSkel} style={{ ...btnS("#fff", HA.ink), border: `1.5px solid ${HA.line}` }}>החלף עץ</button>}
      <span style={{ fontSize: 12.5, color: HA.sub }}>{D ? "הטבלה מראה את כל הרצפים זה מתחת לזה." : "הטבלה מראה לכל יצור אילו איברים יש לו."}</span>
    </div>
    {showTable && !proofOpen && <div style={{ background: HA.panel, border: `1px solid ${HA.line}`, borderRadius: 8, padding: 8, marginBottom: 8 }}><DataTable pz={pz} mode={mode} /></div>}
    <div style={{ background: HA.panel, border: `1px solid ${HA.line}`, borderRadius: 8, padding: 6 }}>
      <TreeView sk={sk} pz={pz} mode={mode} featsAt={featsAt} leafStroke={leafStroke} onLeaf={phase === "leaves" ? tapLeaf : undefined}
        onEdge={phase === "edges" ? tapEdge : undefined} edgeHint={phase === "edges" && !!selT} marks={marks} badMarks={badMarks} onMark={phase === "edges" ? tapChip : undefined}
        hotEdge={hotEdge} hotColor={ringColor} innerFeats={inner} ring={ring} ringColor={ringColor} focusT={shownT} />
    </div>

    <div style={{ fontSize: 12.5, color: HA.sub, margin: "10px 2px 6px" }}>{phase === "edges" ? (D ? "העמדות. מה שכבר על קו מופיע דהוי, והקשה מחזירה אותו." : "האיברים. מה שכבר על קו מופיע דהוי, והקשה מחזירה אותו.") : (D ? "העמדות בחידה. הקשה מסמנת למי יש את האות השנייה." : "האיברים בחידה. הקשה מסמנת למי יש את האיבר.")}</div>
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {pz.traits.map((t) => <TraitChip key={t} pz={pz} mode={mode} t={t} state={chipState(t)} active={shownT === t} dim={phase === "edges" && edgeAt[t] != null} onClick={() => tapChip(t)} />)}
    </div>
    {focusText && <div style={{ fontSize: 13, color: "#444", margin: "6px 2px 0", lineHeight: 1.5 }}><b>{traitLabel(pz, mode, focusT)}:</b> {focusText}</div>}

    {phase === "leaves" && <>
      <div style={{ fontSize: 12.5, color: HA.sub, margin: "12px 2px 6px" }}>{D ? "מאגר הרצפים" : "מאגר היצורים"} {tray.length > 0 && !sel && Object.keys(place).length === 0 ? <span style={{ color: HA.hint, fontWeight: 700 }}>בחרו מהמאגר, ואז הקישו על משבצת</span> : null}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", minHeight: 78, alignItems: "center" }}>
        {tray.length === 0 ? <span style={{ color: "#bbb", fontSize: 12 }}>הכול שובץ</span> : tray.map((t) => { const rg = focusT && t.feats.includes(focusT);
          return <button key={t.id} onClick={() => setSel(sel === t.id ? null : t.id)} style={{ background: sel === t.id ? "#fbf7ee" : "#fff", border: `2px solid ${sel === t.id ? HA.hint : HA.line}`, borderRadius: 7, padding: 3, cursor: "pointer", boxShadow: rg ? `0 0 0 3px ${ringColor}` : sel === t.id ? `0 0 0 3px ${HA.hint}22` : "none" }}><BeingBox pz={pz} mode={mode} feats={t.feats} box={66} focusT={focusT} /></button>; })}
      </div>
    </>}

    {proofOpen && !won && <div style={{ background: "#fbf6ea", border: `1px solid ${HA.hint}55`, borderRadius: 8, padding: 12, margin: "12px 0" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 13.5, fontWeight: 700, flex: 1, color: "#6b5320" }}>{D ? "הוכיחו שאין עץ: בחרו 2 עמדות ו-4 רצפים שמראים את כל ארבעת הצירופים." : "הוכיחו שאין עץ: בחרו 2 איברים ו-4 יצורים שמראים את כל ארבעת הצירופים."}</span>
        <button onClick={() => { setProofOpen(false); setProofMsg(null); }} style={closeBtn}>✕</button>
      </div>
      <DataTable pz={pz} mode={mode} selT={pT} selR={pR} onT={(t) => { setPT(toggleIn(pT, t, 2)); setProofMsg(null); }} onR={(id) => { setPR(toggleIn(pR, id, 4)); setProofMsg(null); }} />
      <Combos pz={pz} mode={mode} pT={pT} pR={pR} />
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10, flexWrap: "wrap" }}>
        <button onClick={checkProof} style={btnS(HA.green, "#fff")}>בדיקת ההוכחה</button>
        <button onClick={doHint} style={{ ...btnS("#fff", HA.hint), border: `1.5px solid ${HA.hint}` }}>רמז</button>
        {proofMsg === "count" && <span style={{ fontSize: 13, color: HA.red }}>{D ? "צריך לבחור בדיוק 2 עמדות ו-4 רצפים." : "צריך לבחור בדיוק 2 איברים ו-4 יצורים."}</span>}
        {proofMsg === "no" && <span style={{ fontSize: 13, color: HA.red }}>חסר צירוף. אם לא מוצאים הוכחה, אולי בכל זאת יש עץ.</span>}
      </div>
    </div>}

    <div style={{ display: "flex", gap: 8, margin: "12px 2px", flexWrap: "wrap", alignItems: "center" }}>
      {!won && <button onClick={doCheck} disabled={phase === "leaves" ? !filled : !allPlaced} style={btnS((phase === "leaves" ? filled : allPlaced) ? HA.green : "#e9e6df", (phase === "leaves" ? filled : allPlaced) ? "#fff" : "#aca89f")}>בדיקה</button>}
      {!won && !proofOpen && <button onClick={doHint} style={{ ...btnS("#fff", HA.hint), border: `1.5px solid ${HA.hint}` }}>רמז</button>}
      {!won && canClaim && phase === "leaves" && !proofOpen && <button onClick={() => { setProofOpen(true); setHintMsg(null); }} style={{ ...btnS("#fff", HA.red), border: `1.5px solid ${HA.red}` }}>אין עץ מתאים</button>}
      {won && <button onClick={onNext} style={btn(HA.accent, "#fff")}>{stage.free ? "עוד חידה" : "המשך"}</button>}
      <button onClick={onNew} style={linkBtn}>חידה חדשה בשלב הזה</button>
      {!won && !stage.free && <button onClick={onNext} style={linkBtn}>דלג</button>}
    </div>
    {phase === "leaves" && checked && filled && !leavesOK && <div style={{ color: HA.red, fontSize: 13.5, margin: "0 2px 10px" }}>{D ? "יש עמדה אדומה: אין קו אחד שמפריד בין שתי האותיות שלה." : "יש איבר אדום: אין קו אחד שמפריד בין מי שיש לו אותו לבין כל השאר."}{stage.conflict === "yes" ? " ואולי אין כאן עץ מתאים בכלל?" : ""}{stage.chooseSkel && !skelFits && !pz.conflict ? " על העץ הזה אין שום שיבוץ שמקיים את החוק. נסו את העץ השני." : ""}</div>}
    {phase === "edges" && edgeChecked && !edgesOK && <div style={{ color: HA.red, fontSize: 13.5, margin: "0 2px 10px" }}>יש סימון על קו לא נכון. חיתוך של הקו צריך להפריד בין המסומנים לבין כל השאר.</div>}
    {hintMsg && <div style={{ background: "#fbf6ea", border: `1px solid ${HA.hint}44`, borderRadius: 6, padding: "10px 12px", fontSize: 13.5, color: "#6b5320", lineHeight: 1.6, margin: "0 0 12px" }}>{hintMsg}</div>}
    {phase === "done" && <div style={{ background: "#eaf4ec", border: `1px solid ${HA.green}55`, borderRadius: 8, padding: "10px 12px", fontSize: 14, color: "#24523a", lineHeight: 1.65, margin: "0 0 12px" }}>
      <b>יפה, העץ נכון.</b> {D ? "כל עמדה משתנה פעם אחת בדיוק, והמספר שלה מסומן על הקו שבו היא משתנה." : "כל איבר משתנה פעם אחת בדיוק, והצבע שלו מסומן על הקו שבו הוא משתנה."} הדמויות הדהויות הן היצורים הנסתרים שבתוך העץ. הקישו על {D ? "עמדה" : "איבר"} כדי לראות את הקו שלו.
    </div>}
    {phase === "proof" && <div style={{ background: "#eaf4ec", border: `1px solid ${HA.green}55`, borderRadius: 8, padding: "10px 12px", fontSize: 14, color: "#24523a", lineHeight: 1.65, margin: "0 0 12px" }}>
      <b>נכון, אין עץ מתאים.</b> {D ? "שתי העמדות האלה" : "שני האיברים האלה"} מופיעים בכל ארבעת הצירופים. שני חיתוכים מחלקים עץ לשלושה חלקים לכל היותר, ולכן ארבעה צירופים לא יכולים להתקיים יחד.
      <Combos pz={pz} mode={mode} pT={pT} pR={pR} />
    </div>}

  </div>);
}

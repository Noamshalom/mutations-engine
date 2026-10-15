// The sequence tool: input, analysis, matrix view, tree drawing, exports.
import React, { useState, useMemo } from "react";
import { genPuzzle } from "../../engine/extended/generator.js";
import { parseSequences, analyzeMatrix, newickOf } from "../../engine/phylogeny/analyze.js";
import { layoutRooted, layoutUnrooted } from "../../engine/phylogeny/layout.js";
import { FONT, MONO, INK, HA, NUC, btn, btnS, linkBtn } from "../theme.js";
import { seqOf } from "../game/Beings.jsx";
import { H2, P, Seg } from "../game/Pages.jsx";
import { STR, EX_LECTURE, EX_CONFLICT } from "./strings.js";

function TreeFigure({ res, mode, showAnc, showLabels, lang, svgRef }) {
  const L = layoutRooted(res.tree); const U = mode === "unrooted" ? layoutUnrooted(res.tree) : null;
  const lay = U || L; const unit = U ? 150 : 110, unitY = U ? 150 : 90; const pad = 70;
  const W = lay.w * unit + pad * 2, H = lay.h * unitY + pad * 2 + (showAnc ? 30 : 0);
  const P = (nd) => [pad + lay.pos[nd.id][0] * unit, pad + lay.pos[nd.id][1] * unitY];
  const tag = (j) => `${j + 1}: ${res.columns[j].refLetter}→${res.columns[j].derived}`;
  return (<svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${W} ${H}`} width={W} style={{ maxWidth: "100%", height: "auto", display: "block", fontFamily: FONT, background: "#fff" }}>
    {lay.edges.map((e, i) => { const [x1, y1] = P(e.a), [x2, y2] = P(e.b); const mx = (x1 + x2) / 2, my = (y1 + y2) / 2; const ang = Math.atan2(y2 - y1, x2 - x1); const nx = -Math.sin(ang), ny = Math.cos(ang);
      return (<g key={i}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#8a8378" strokeWidth={3} strokeLinecap="round" />
        {showLabels && e.labels.map((j, k) => { const off = (k - (e.labels.length - 1) / 2) * 30; const dx = Math.cos(ang) * off, dy = Math.sin(ang) * off; const w = 34 + 8 * String(j + 1).length;
          return (<g key={j} transform={`translate(${mx + dx + nx * 0},${my + dy + ny * 0})`}><title>{tag(j)}</title><rect x={-w / 2} y={-15} width={w} height={30} rx={5} fill="#fff" stroke={HA.hint} strokeWidth={1.6} /><text x={0} y={-1} textAnchor="middle" fontSize={12} fontWeight={800} fill={HA.ink} fontFamily={MONO}>{j + 1}</text><text x={0} y={11} textAnchor="middle" fontSize={8.5} fill={HA.sub} fontFamily={MONO}>{res.columns[j].refLetter}→{res.columns[j].derived}</text></g>); })}
      </g>); })}
    {lay.nodes.map((nd) => { const [x, y] = P(nd); const leaf = nd.name != null;
      return (<g key={nd.id}>{leaf ? <><rect x={x - 26} y={y - 13} width={52} height={26} rx={6} fill="#fff" stroke={nd.name === res.rows[res.ref].name ? HA.hint : HA.ink} strokeWidth={2} /><text x={x} y={y + 4.5} textAnchor="middle" fontSize={12.5} fontWeight={800} fill={HA.ink}>{nd.name.length > 7 ? nd.name.slice(0, 6) + "…" : nd.name}</text></>
        : <circle cx={x} cy={y} r={5.5} fill="#5b554c" />}
        {showAnc && nd.seq && <text x={x} y={y + (leaf ? 27 : -10)} textAnchor="middle" fontSize={10.5} fontFamily={MONO} fill={leaf ? HA.ink : HA.sub} letterSpacing={0.5}>{nd.seq.length > 18 ? nd.seq.slice(0, 16) + "…" : nd.seq}</text>}
      </g>); })}
  </svg>);
}

function MatrixView({ res, t }) {
  const v = res.violation; const wcols = v ? [v.j, v.l] : []; const wrows = v ? Object.values(v.rows) : [];
  const hdr = (c) => c.type === "trivial" ? "#ece9e2" : c.type === "nonbinary" ? "#f6d9d5" : wcols.includes(c.j) ? "#f6e3b4" : "#fff";
  return (<div style={{ overflowX: "auto" }}>
    <table dir="ltr" style={{ borderCollapse: "separate", borderSpacing: 2, fontFamily: MONO, fontSize: 13 }}>
      <thead><tr><th /><th />{res.columns.map((c) => <th key={c.j} title={c.type === "trivial" ? t.colTrivial : c.type === "nonbinary" ? t.colNB : ""} style={{ background: hdr(c), border: `1px solid ${HA.line}`, borderRadius: 4, minWidth: 26, height: 24, fontWeight: 800, color: c.type === "ok" ? HA.ink : HA.sub }}>{c.j + 1}</th>)}</tr></thead>
      <tbody>{res.rows.map((r, i) => <tr key={i}>
        <td style={{ fontFamily: FONT, fontWeight: 700, paddingRight: 6, color: HA.ink, whiteSpace: "nowrap" }}>{r.name}</td>
        <td style={{ fontFamily: FONT, fontSize: 10.5, color: HA.hint, paddingRight: 6, whiteSpace: "nowrap" }}>{i === res.ref ? t.rowRef : wrows.includes(i) ? "●" : ""}</td>
        {res.columns.map((c) => { const L = r.seq[c.j]; const derived = c.type === "ok" && L === c.derived; const hot = wrows.includes(i) && wcols.includes(c.j);
          return <td key={c.j} style={{ textAlign: "center", minWidth: 26, height: 24, borderRadius: 4, background: hot ? "#f6e3b4" : c.type !== "ok" ? "#f7f5f0" : derived ? NUC[L] + "22" : "#fff", border: `1px solid ${hot ? HA.hint : HA.line}`, color: c.type !== "ok" ? "#b3aea3" : NUC[L] || HA.ink, fontWeight: derived ? 800 : 500 }}>{L}</td>; })}
      </tr>)}</tbody>
    </table>
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12, color: HA.sub, marginTop: 6, fontFamily: FONT }}>
      <span><span style={{ display: "inline-block", width: 12, height: 12, background: "#ece9e2", border: `1px solid ${HA.line}`, verticalAlign: "middle", marginInlineEnd: 4 }} />{t.colTrivial}</span>
      {res.nonbinary && res.nonbinary.length > 0 && <span><span style={{ display: "inline-block", width: 12, height: 12, background: "#f6d9d5", border: `1px solid ${HA.line}`, verticalAlign: "middle", marginInlineEnd: 4 }} />{t.colNB}</span>}
      {v && <span><span style={{ display: "inline-block", width: 12, height: 12, background: "#f6e3b4", border: `1px solid ${HA.hint}`, verticalAlign: "middle", marginInlineEnd: 4 }} />{t.colWit} / {t.rowWit}</span>}
    </div>
  </div>);
}

export function SequenceTool({ lang }) {
  const t = STR[lang];
  const [text, setText] = useState(EX_LECTURE); const [refName, setRefName] = useState("E"); const [dropNB, setDropNB] = useState(false);
  const [res, setRes] = useState(null); const [mode, setMode] = useState("rooted"); const [showAnc, setShowAnc] = useState(false); const [showLabels, setShowLabels] = useState(true); const [showLog, setShowLog] = useState(false); const [copied, setCopied] = useState(false);
  const svgRef = React.useRef(null);
  const names = useMemo(() => parseSequences(text).map((r) => r.name), [text]);
  const run = () => { const rows = parseSequences(text); const ri = Math.max(0, names.indexOf(refName)); const r = analyzeMatrix(rows, ri, dropNB); r.rows = rows; setRes(r); setCopied(false); };
  const randomFromGame = () => { const st = { skel: ["s5", "s6c", "s6s"][Math.floor(Math.random() * 3)], pend: 3, extra: 1, conflict: "maybe" }; const pz = genPuzzle(st, Math.floor(Math.random() * 1e9)); if (!pz) return; setText(pz.tiles.map((tl, i) => `>${lang === "he" ? "יצור" : "creature"}${i + 1}\n${seqOf(pz, tl.feats).join("")}`).join("\n")); setRes(null); };
  const dlSvg = () => { if (!svgRef.current) return; const blob = new Blob([svgRef.current.outerHTML], { type: "image/svg+xml" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "perfect-phylogeny.svg"; a.click(); };
  const copyNewick = () => { if (!res || !res.tree) return; navigator.clipboard.writeText(newickOf(res.tree)).then(() => setCopied(true)); };
  const errText = (e) => e === "empty" ? t.errEmpty : e[0] === "len" ? t.errLen + e[1] : e[0] === "chars" ? t.errChars + e[1] : e[0] === "nonbinary" ? t.errNB + e[1] + ". " + t.errNBhint : String(e);
  const box = { background: HA.panel, border: `1px solid ${HA.line}`, borderRadius: 8, padding: 12 };
  const lab = { fontSize: 12.5, color: HA.sub, margin: "0 0 4px", fontWeight: 700 };
  return (<div dir={t.dir}>
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: 240 }}><h2 style={{ fontSize: 23, fontWeight: 800, margin: "0 0 4px", fontFamily: FONT }}>{t.title}</h2><P>{t.sub}</P></div>
    </div>
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "stretch" }}>
      <div style={{ ...box, flex: "1 1 300px" }}>
        <div style={lab}>{t.input}</div>
        <textarea dir="ltr" value={text} onChange={(e) => { setText(e.target.value); setRes(null); }} placeholder={t.placeholder} spellCheck={false} style={{ width: "100%", boxSizing: "border-box", height: 170, fontFamily: MONO, fontSize: 13.5, border: `1.5px solid ${HA.line}`, borderRadius: 6, padding: 8, resize: "vertical" }} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
          <button onClick={() => { setText(EX_LECTURE); setRefName("E"); setRes(null); }} style={{ ...btnS("#fff", HA.ink), border: `1.5px solid ${HA.line}` }}>{t.exLecture}</button>
          <button onClick={() => { setText(EX_CONFLICT); setRes(null); }} style={{ ...btnS("#fff", HA.ink), border: `1.5px solid ${HA.line}` }}>{t.exConflict}</button>
          <button onClick={randomFromGame} style={{ ...btnS("#fff", HA.ink), border: `1.5px solid ${HA.line}` }}>{t.exRandom}</button>
          <button onClick={() => { setText(""); setRes(null); }} style={linkBtn}>{t.clear}</button>
        </div>
      </div>
      <div style={{ ...box, flex: "0 1 240px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div><div style={lab}>{t.ref}</div><select value={names.includes(refName) ? refName : names[0] || ""} onChange={(e) => setRefName(e.target.value)} style={{ width: "100%", fontFamily: FONT, fontSize: 13.5, padding: 6, border: `1.5px solid ${HA.line}`, borderRadius: 6, background: "#fff" }}>{names.map((nm, i) => <option key={i} value={nm}>{nm}</option>)}</select></div>
        <label style={{ fontSize: 13, display: "flex", gap: 6, alignItems: "flex-start", cursor: "pointer" }}><input type="checkbox" checked={dropNB} onChange={(e) => setDropNB(e.target.checked)} style={{ marginTop: 3 }} />{t.dropNB}</label>
        <button onClick={run} style={{ ...btn(HA.accent, "#fff"), marginTop: "auto" }}>{t.run}</button>
      </div>
    </div>

    {res && res.errors.length > 0 && <div style={{ background: "#fbeeec", border: `1px solid ${HA.red}55`, borderRadius: 8, padding: "10px 12px", margin: "12px 0", color: "#7a2a22", fontSize: 14, lineHeight: 1.6 }}>{res.errors.map((e, i) => <div key={i}>{errText(e)}</div>)}</div>}

    {res && !res.errors.length && <>
      {res.tree ? <div style={{ background: "#eaf4ec", border: `1px solid ${HA.green}55`, borderRadius: 8, padding: "10px 12px", margin: "12px 0", color: "#24523a", fontSize: 14, lineHeight: 1.6 }}><b>{t.okTitle}.</b> {t.okText(res.used.length, res.columns.filter((c) => c.type === "trivial").length)} <span style={{ color: HA.sub }}>{t.theoremNote}</span></div>
        : <div style={{ background: "#fbf6ea", border: `1px solid ${HA.hint}66`, borderRadius: 8, padding: "10px 12px", margin: "12px 0", color: "#6b5320", fontSize: 14, lineHeight: 1.6 }}>
          <b>{t.badTitle}.</b> {t.badText(res.violation.j + 1, res.violation.l + 1)}
          <div style={{ fontWeight: 700, marginTop: 8 }}>{t.witness}:</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
            {[["11", t.both], ["10", `${t.onlyJ} ${t.posWord} ${res.violation.j + 1}`], ["01", `${t.onlyL} ${t.posWord} ${res.violation.l + 1}`], ["00", t.none]].map(([k, lb]) => { const i = res.violation.rows[k]; const r = res.rows[i];
              return <div key={k} style={{ flex: "1 1 120px", background: "#fff", border: `1.5px solid ${HA.green}`, borderRadius: 7, padding: "6px 8px" }}><div style={{ fontSize: 11.5, color: HA.sub, fontWeight: 700 }}>{lb}</div><div style={{ fontWeight: 800 }}>{r.name}</div><div dir="ltr" style={{ fontFamily: MONO, fontSize: 13 }}><span style={{ color: NUC[r.seq[res.violation.j]] || HA.ink }}>{r.seq[res.violation.j]}</span> <span style={{ color: NUC[r.seq[res.violation.l]] || HA.ink }}>{r.seq[res.violation.l]}</span></div></div>; })}
          </div>
          <div style={{ color: HA.sub, marginTop: 6 }}>{t.theoremNote}</div>
        </div>}

      <H2>{t.matrix}</H2>
      <MatrixView res={res} t={t} />

      {res.tree && <>
        <H2>{t.tree}</H2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
          <Seg value={mode} onChange={setMode} options={[["rooted", t.rooted], ["unrooted", t.unrooted]]} />
          <label style={{ fontSize: 13, display: "flex", gap: 5, alignItems: "center", cursor: "pointer" }}><input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} />{t.labels}</label>
          <label style={{ fontSize: 13, display: "flex", gap: 5, alignItems: "center", cursor: "pointer" }}><input type="checkbox" checked={showAnc} onChange={(e) => setShowAnc(e.target.checked)} />{t.ancestral}</label>
          <button onClick={dlSvg} style={linkBtn}>{t.dlSvg}</button>
          <button onClick={copyNewick} style={linkBtn}>{copied ? t.copied : t.copyNewick}</button>
        </div>
        <div style={{ ...box, overflowX: "auto" }}><TreeFigure res={res} mode={mode} showAnc={showAnc} showLabels={showLabels} lang={lang} svgRef={svgRef} /></div>
        <div style={{ fontSize: 12.5, color: HA.sub, marginTop: 6 }}>{t.legend}</div>
        <div style={{ marginTop: 10 }}><button onClick={() => setShowLog(!showLog)} style={linkBtn}>{t.log}: {showLog ? t.logHide : t.logShow}</button>
          {showLog && <pre dir="ltr" style={{ background: HA.panel, border: `1px solid ${HA.line}`, borderRadius: 6, padding: 10, fontSize: 12, whiteSpace: "pre-wrap", fontFamily: MONO, marginTop: 6 }}>{res.log.join("\n")}</pre>}</div>
      </>}
    </>}
  </div>);
}

// The data table (creatures against traits; an alignment in the DNA view) and the four configuration boxes.
import React from "react";
import { TRAITS } from "../../engine/creatures.js";
import { FONT, MONO, HA, NUC } from "../theme.js";
import { BeingBox, traitLabel } from "./Beings.jsx";

export function DataTable({ pz, mode, selT, selR, onT, onR }) {
  const dna = mode === "dna"; const pick = !!onT; const Tag = pick ? "button" : "div";
  const head = (on) => ({ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, width: 44, minHeight: 38, justifyContent: "center", background: on ? "#f6e3b4" : "#fff", border: `1.5px solid ${on ? HA.hint : HA.line}`, borderRadius: 6, padding: "3px 1px", fontFamily: FONT, fontSize: 10, fontWeight: 700, color: HA.ink, cursor: pick ? "pointer" : "default", lineHeight: 1.15, boxSizing: "border-box" });
  return (<div style={{ overflowX: "auto" }}>
    <table dir={dna ? "ltr" : "rtl"} style={{ borderCollapse: "separate", borderSpacing: 3, margin: "0 auto", fontFamily: FONT }}>
      <thead><tr><th />{pz.traits.map((t, i) => <th key={t} style={{ padding: 0 }}><Tag onClick={pick ? () => onT(t) : undefined} style={head(selT && selT.includes(t))}>{dna ? <span style={{ fontSize: 13, fontFamily: MONO }}>{i + 1}</span> : <><span style={{ width: 13, height: 13, borderRadius: 3, background: TRAITS[t].color }} /><span>{TRAITS[t].he}</span></>}</Tag></th>)}</tr></thead>
      <tbody>{pz.tiles.map((tl) => { const on = selR && selR.includes(tl.id);
        return (<tr key={tl.id}>
          <td style={{ padding: 0 }}><Tag onClick={pick ? () => onR(tl.id) : undefined} style={{ background: on ? "#f6e3b4" : "#fff", border: `1.5px solid ${on ? HA.hint : HA.line}`, borderRadius: 6, padding: 1, cursor: pick ? "pointer" : "default", display: "block" }}><BeingBox pz={pz} mode={mode} feats={tl.feats} box={40} /></Tag></td>
          {pz.traits.map((t) => { const has = tl.feats.includes(t); const hot = selT && selT.includes(t); const L = pz.letters[t][has ? 1 : 0];
            return <td key={t} style={{ textAlign: "center", background: on && hot ? "#f6e3b4" : on || hot ? "#fbf3df" : "#fff", border: `1px solid ${HA.line}`, borderRadius: 5, width: 44, height: 40, padding: 0 }}>
              {dna ? <b style={{ color: NUC[L], fontFamily: MONO, fontSize: 16 }}>{L}</b> : has ? <span style={{ display: "inline-block", width: 15, height: 15, borderRadius: 8, background: TRAITS[t].color, verticalAlign: "middle" }} /> : <span style={{ color: "#c9c4b8", fontWeight: 800 }}>·</span>}
            </td>; })}
        </tr>); })}</tbody>
    </table>
  </div>);
}
export function Combos({ pz, mode, pT, pR }) {
  if (pT.length !== 2) return null;
  const dna = mode === "dna"; const [y, z] = pT; const rows = pR.map((id) => pz.tiles.find((t) => t.id === id));
  const name = (t, on) => dna ? `${traitLabel(pz, mode, t)}: ${pz.letters[t][on ? 1 : 0]}` : TRAITS[t].he;
  const lab = (a, b) => dna ? `${name(y, a)}, ${name(z, b)}` : a && b ? `גם ${name(y)} וגם ${name(z)}` : a ? `רק ${name(y)}` : b ? `רק ${name(z)}` : "בלי שניהם";
  return (<div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "10px 0 2px" }}>
    {[[1, 1], [1, 0], [0, 1], [0, 0]].map(([a, b]) => { const g = rows.filter((r) => r.feats.includes(y) === !!a && r.feats.includes(z) === !!b);
      return (<div key={"" + a + b} style={{ flex: "1 1 130px", minWidth: 130, background: "#fff", border: `1.5px solid ${g.length ? HA.green : HA.line}`, borderRadius: 7, padding: "6px 8px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: g.length ? HA.green : HA.sub, marginBottom: 4 }}>{lab(a, b)}</div>
        <div style={{ display: "flex", gap: 4, minHeight: 36, alignItems: "center" }}>{g.length ? g.map((r) => <BeingBox key={r.id} pz={pz} mode={mode} feats={r.feats} box={36} />) : <span style={{ fontSize: 12, color: "#b3aea3" }}>חסר</span>}</div>
      </div>); })}
  </div>);
}

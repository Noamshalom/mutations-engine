// Small presentational pieces: a creature or its DNA sequence, and the trait chips.
import React from "react";
import { TRAITS } from "../../engine/creatures.js";
import { Creature } from "../Creature.jsx";
import { FONT, MONO, INK, HA, NUC } from "../theme.js";

export const seqOf = (pz, feats) => pz.traits.map((t) => pz.letters[t][feats.includes(t) ? 1 : 0]);
export const traitLabel = (pz, mode, t) => (mode === "dna" && pz ? "עמדה " + (pz.traits.indexOf(t) + 1) : TRAITS[t].he);
export function SeqCard({ seq, size, focus }) {
  const cols = 3, gap = 4, cw = 36; const rows = Math.max(1, Math.ceil(seq.length / cols));
  const ch = Math.min(36, (112 - (rows - 1) * gap) / rows);
  const x0 = (120 - (cols * cw + (cols - 1) * gap)) / 2, y0 = (120 - (rows * ch + (rows - 1) * gap)) / 2;
  return (<svg viewBox="0 0 120 120" width={size} height={size} style={{ display: "block" }}>
    {seq.map((L, i) => { const x = x0 + (i % cols) * (cw + gap), y = y0 + Math.floor(i / cols) * (ch + gap);
      return <g key={i}><rect x={x} y={y} width={cw} height={ch} rx={5} fill={NUC[L] + "22"} stroke={focus === i ? INK : NUC[L] + "77"} strokeWidth={focus === i ? 4 : 1.5} /><text x={x + cw / 2} y={y + ch / 2 + Math.min(27, ch * 0.8) * 0.36} textAnchor="middle" fontSize={Math.min(27, ch * 0.8)} fontWeight={800} fill={NUC[L]} fontFamily={MONO}>{L}</text></g>; })}
  </svg>);
}
export function BeingBox({ pz, mode, feats, box, focusT }) {
  if (mode === "dna" && pz) return <SeqCard seq={seqOf(pz, feats)} size={box} focus={focusT ? pz.traits.indexOf(focusT) : -1} />;
  return <div style={{ width: box, height: box, display: "flex", justifyContent: "center" }}><Creature t={feats} size={box * 0.8333} /></div>;
}
export function BeingSvg({ pz, mode, feats, x, y, box, focusT, opacity }) {
  const dna = mode === "dna" && pz;
  return (<g transform={`translate(${dna ? x : x + box * 0.0833},${y})`} opacity={opacity == null ? 1 : opacity}>
    {dna ? <SeqCard seq={seqOf(pz, feats)} size={box} focus={focusT ? pz.traits.indexOf(focusT) : -1} /> : <Creature t={feats} size={box * 0.8333} />}
  </g>);
}
export function TraitChip({ pz, mode, t, state, active, dim, onClick }) {
  const dna = mode === "dna" && pz; const col = dna ? INK : TRAITS[t].color;
  return (<button onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: active ? "#fbf3df" : "#fff", color: HA.ink, border: `2px solid ${col}`, boxShadow: active ? `0 0 0 3px ${HA.hint}44` : "none", borderRadius: 6, padding: "5px 9px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: FONT, opacity: dim ? 0.45 : 1 }}>
    {!dna && <span style={{ width: 12, height: 12, borderRadius: 3, background: col }} />}
    {traitLabel(pz, mode, t)}
    {dna && <span dir="ltr" style={{ fontFamily: MONO, fontWeight: 800 }}><span style={{ color: NUC[pz.letters[t][0]] }}>{pz.letters[t][0]}</span><span style={{ color: HA.sub }}>/</span><span style={{ color: NUC[pz.letters[t][1]] }}>{pz.letters[t][1]}</span></span>}
    {state === "ok" && <span style={{ color: HA.green, fontWeight: 800 }}>✓</span>}
    {state === "bad" && <span style={{ color: HA.red, fontWeight: 800 }}>✗</span>}
  </button>);
}

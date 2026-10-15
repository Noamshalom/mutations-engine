// The tree on the board: skeleton, ends, hidden vertices, trait markers on edges.
import React from "react";
import { TRAITS } from "../../engine/creatures.js";
import { LEAF, MINI } from "../../engine/extended/skeletons.js";
import { FONT, MONO, INK, HA } from "../theme.js";
import { BeingSvg } from "./Beings.jsx";

export function TreeView({ sk, pz, mode, featsAt, leafStroke, onLeaf, onEdge, edgeHint, marks, badMarks, onMark, hotEdge, hotColor, innerFeats, ring, ringColor, focusT, maxW }) {
  const P = (id) => [sk.px[id], sk.py[id]]; const dna = mode === "dna" && pz;
  return (<svg viewBox={`0 0 ${sk.W} ${sk.H}`} width={sk.W} style={{ width: "100%", maxWidth: maxW || sk.W, height: "auto", display: "block", margin: "0 auto" }}>
    {sk.edges.map(([a, b], i) => { const [x1, y1] = P(a), [x2, y2] = P(b); const hot = hotEdge === i;
      return (<g key={"e" + i} onClick={onEdge ? () => onEdge(i) : undefined} style={{ cursor: onEdge ? "pointer" : "default" }}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={hot ? hotColor : edgeHint ? HA.hint : "#8a8378"} strokeWidth={hot ? 7 : edgeHint ? 5 : 3} strokeLinecap="round" />
        {onEdge && <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth={36} pointerEvents="stroke" />}
      </g>); })}
    {sk.innerIds.map((p) => { const [x, y] = P(p); const f = innerFeats ? innerFeats[p] : null;
      return f ? <g key={p} style={{ pointerEvents: "none" }}><rect x={x - MINI / 2} y={y - MINI / 2} width={MINI} height={MINI} rx={7} fill="#fbfaf7" stroke="#b9b2a5" strokeWidth={1.6} strokeDasharray="4 3" /><BeingSvg pz={pz} mode={mode} feats={f} x={x - MINI / 2} y={y - MINI / 2} box={MINI} focusT={focusT} opacity={0.6} /></g>
        : <circle key={p} cx={x} cy={y} r={6.5} fill="#8a8378" style={{ pointerEvents: "none" }} />; })}
    {sk.leafIds.map((l) => { const [cx, cy] = P(l); const x = cx - LEAF / 2, y = cy - LEAF / 2; const f = featsAt(l);
      return (<g key={l} onClick={onLeaf ? () => onLeaf(l) : undefined} style={{ cursor: onLeaf ? "pointer" : "default" }}>
        {ring && ring.includes(l) && <rect x={x - 5} y={y - 5} width={LEAF + 10} height={LEAF + 10} rx={12} fill="none" stroke={ringColor} strokeWidth={4} />}
        <rect x={x} y={y} width={LEAF} height={LEAF} rx={8} fill={f ? "#fff" : "#e6e2d8"} stroke={leafStroke(l)} strokeWidth={f ? 2.4 : 3} strokeDasharray={f ? "0" : "6 4"} />
        {f ? <BeingSvg pz={pz} mode={mode} feats={f} x={x} y={y} box={LEAF} focusT={focusT} /> : <text x={cx} y={cy + 10} textAnchor="middle" fontSize={28} fontWeight={800} fill="#7d7669">?</text>}
      </g>); })}
    {marks && sk.edges.map(([a, b], i) => { const ts = marks[i] || []; if (!ts.length) return null;
      const [x1, y1] = P(a), [x2, y2] = P(b); const t0 = sk.isLeaf[a] ? 0.62 : sk.isLeaf[b] ? 0.38 : 0.5; const len = Math.hypot(x2 - x1, y2 - y1) || 1;
      return ts.map((t, j) => { const off = (j - (ts.length - 1) / 2) * 21; const mx = x1 + (x2 - x1) * t0 + ((x2 - x1) / len) * off, my = y1 + (y2 - y1) * t0 + ((y2 - y1) / len) * off; const bad = badMarks && badMarks.includes(t);
        return (<g key={t} onClick={onMark ? () => onMark(t) : undefined} style={{ cursor: onMark ? "pointer" : "default" }}>
          <rect x={mx - 10} y={my - 10} width={20} height={20} rx={5} fill={dna ? "#fff" : TRAITS[t].color} stroke={bad ? HA.red : dna ? INK : "#fff"} strokeWidth={bad ? 3.5 : 2} />
          {dna && <text x={mx} y={my + 4.5} textAnchor="middle" fontSize={13} fontWeight={800} fill={INK} fontFamily={MONO}>{pz.traits.indexOf(t) + 1}</text>}
        </g>); }); })}
  </svg>);
}

// The creature: one parametric SVG, drawn from a list of trait ids.
import React from "react";
import { TRAITS } from "../engine/creatures.js";
import { INK, BODY, SKIN } from "./theme.js";

export function Creature({ t, size }) {
  const has = (f) => t.includes(f); const c = (f) => TRAITS[f].color; const sw = 2.4;
  return (<svg viewBox="0 -18 120 144" width={size} height={size * 144 / 120} style={{ display: "block" }}>
    {has("tail") && <path d="M52 94 L68 94 L62 122 L58 122 Z" fill={c("tail")} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />}
    {has("sail") && <g fill={c("sail")} stroke={INK} strokeWidth={2.6} strokeLinejoin="round"><path d="M34 44 L34 20 Q60 6 86 20 L86 44 Z" /><path d="M46 30 V44 M60 24 V44 M74 30 V44" stroke={INK} strokeWidth={1.6} opacity={0.5} /></g>}
    {has("flippers") ? <g fill={c("flippers")} stroke={INK} strokeWidth={sw}><ellipse cx={22} cy={70} rx={11} ry={18} transform="rotate(-24 22 70)" /><ellipse cx={98} cy={70} rx={11} ry={18} transform="rotate(24 98 70)" /></g>
      : <g fill={SKIN} stroke={INK} strokeWidth={sw}><ellipse cx={30} cy={60} rx={7.5} ry={10} /><ellipse cx={90} cy={60} rx={7.5} ry={10} /></g>}
    <g fill={SKIN} stroke={INK} strokeWidth={sw}><ellipse cx={40} cy={98} rx={8} ry={10} /><ellipse cx={80} cy={98} rx={8} ry={10} /></g>
    {has("claws") && <g fill={c("claws")} stroke={INK} strokeWidth={1.4}><path d="M33 106 l-3 11 l6 -2 Z" /><path d="M40 108 l0 12 l5 -4 Z" /><path d="M47 106 l3 11 l-6 -2 Z" /><path d="M73 106 l-3 11 l6 -2 Z" /><path d="M80 108 l0 12 l5 -4 Z" /><path d="M87 106 l3 11 l-6 -2 Z" /></g>}
    {has("spikes") && <g fill={c("spikes")} stroke={INK} strokeWidth={2.4} strokeLinejoin="round"><path d="M36 52 L26 30 L48 42 Z" /><path d="M60 46 L52 22 L68 22 Z" /><path d="M84 52 L94 30 L72 42 Z" /></g>}
    <ellipse cx={60} cy={68} rx={38} ry={31} fill={BODY} stroke={INK} strokeWidth={3} />
    {has("stripes") && <g stroke={c("stripes")} strokeWidth={2.8} fill="none" strokeLinecap="round"><path d="M28 62 Q60 52 92 62" /><path d="M26 72 Q60 64 94 72" /><path d="M30 82 Q60 76 90 82" /></g>}
    {has("spots") && <g fill={c("spots")} stroke={INK} strokeWidth={1}><circle cx={46} cy={60} r={4.5} /><circle cx={74} cy={62} r={4.5} /><circle cx={60} cy={76} r={4.5} /><circle cx={44} cy={80} r={4} /><circle cx={76} cy={80} r={4} /></g>}
    {has("eye3") && <g><circle cx={60} cy={68} r={9} fill="#fff" stroke={c("eye3")} strokeWidth={3} /><circle cx={60} cy={68} r={3.4} fill={INK} /></g>}
    <circle cx={60} cy={28} r={14} fill={SKIN} stroke={INK} strokeWidth={3} />
    {has("crest") && <g fill={c("crest")} stroke={INK} strokeWidth={2} strokeLinejoin="round"><path d="M49 16 L40 -14 L54 12 Z" /><path d="M71 16 L80 -14 L66 12 Z" /></g>}
    {has("horn") && <path d="M60 -6 L52 18 L68 18 Z" fill={c("horn")} stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />}
    {has("barbels") && <g><g stroke={INK} strokeWidth={3.2} strokeLinecap="round" fill="none"><path d="M50 20 q-9 -12 -16 -14" /><path d="M70 20 q9 -12 16 -14" /></g><circle cx={33} cy={4} r={4.5} fill={c("barbels")} stroke={INK} strokeWidth={2} /><circle cx={87} cy={4} r={4.5} fill={c("barbels")} stroke={INK} strokeWidth={2} /></g>}
    <circle cx={54} cy={28} r={4.2} fill="#fff" stroke={INK} strokeWidth={1.6} /><circle cx={54.6} cy={28.6} r={2.4} fill={INK} /><circle cx={53.6} cy={27.4} r={0.9} fill="#fff" />
    <circle cx={66} cy={28} r={4.2} fill="#fff" stroke={INK} strokeWidth={1.6} /><circle cx={66.6} cy={28.6} r={2.4} fill={INK} /><circle cx={65.6} cy={27.4} r={0.9} fill="#fff" />
    {has("beak") ? <path d="M55 33 L65 33 L60 48 Z" fill={c("beak")} stroke={INK} strokeWidth={1.8} strokeLinejoin="round" /> : <path d="M56 35 q4 2.5 8 0" stroke={INK} strokeWidth={1.8} fill="none" strokeLinecap="round" />}
  </svg>);
}

// Body parts ("traits") of the creatures, and small helpers shared by every part of the engine.

export const TRAITS = {
  horn: { he: "קרן", en: "horn", color: "#e0932e" }, sail: { he: "מפרש", en: "sail", color: "#7f9bb0" }, spikes: { he: "קוצים", en: "spikes", color: "#d0503f" },
  barbels: { he: "מחושים", en: "barbels", color: "#c026a8" }, flippers: { he: "סנפירים", en: "flippers", color: "#2ba0a0" }, tail: { he: "זנב", en: "tail", color: "#8a63d6" },
  eye3: { he: "עין שלישית", en: "third eye", color: "#7b4fb0" }, stripes: { he: "פסים", en: "stripes", color: "#2f6b45" }, spots: { he: "נקודות", en: "spots", color: "#f0b429" },
  crest: { he: "ציצית", en: "crest", color: "#e0348f" }, claws: { he: "טפרים", en: "claws", color: "#c2410c" }, beak: { he: "מקור", en: "beak", color: "#0e9f6e" },
};
export const FEAT_IDS = Object.keys(TRAITS);

/** Canonical key of a creature: its sorted trait list joined by commas. */
export const keyOf = (s) => [...s].sort().join(",");
/** Number of traits in which two creatures differ (symmetric difference). */
export const distance = (a, b) => { let d = 0; for (const x of a) if (!b.includes(x)) d++; for (const x of b) if (!a.includes(x)) d++; return d; };
/** True when two creatures differ in exactly one trait: one line of the daily game may join them. */
export const sd1 = (a, b) => distance(a, b) === 1;
export const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x));

/** Small deterministic PRNG, so a puzzle can be reproduced from its seed. */
export function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
/** Fisher-Yates shuffle with a supplied random source. */
export const shuffleWith = (arr, R) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

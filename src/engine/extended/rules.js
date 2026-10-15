// The rule of the extended game, and everything derived from it.
// A placement of creatures on the ends of a skeleton is correct iff every trait is a *split* of the tree: there is a
// single edge whose removal separates exactly the ends that carry the trait from the rest. This is the perfect
// phylogeny condition, checked against the rule itself rather than against a stored solution, so symmetric
// placements are accepted.

import { sameSet } from "../creatures.js";

/** The edge on which trait t changes exactly once, or -1 when no single edge separates the carriers from the rest. */
export function traitEdge(sk, leafFeats, t) {
  const has = sk.leafIds.filter((l) => leafFeats[l].includes(t));
  if (!has.length || has.length === sk.leafIds.length) return -1;
  for (let i = 0; i < sk.edges.length; i++) if (sameSet(has, sk.leafA[i]) || sameSet(has, sk.leafB[i])) return i;
  return -1;
}

/** The hidden creatures at the internal vertices, once every trait sits on its edge. */
export function hiddenFeats(sk, leafFeats, tEdge, traits) {
  const out = {}; sk.innerIds.forEach((p) => { out[p] = []; });
  traits.forEach((t) => { const i = tEdge[t]; if (i == null || i < 0) return;
    const has = sk.leafIds.filter((l) => leafFeats[l].includes(t)); const hasIsA = sameSet(has, sk.leafA[i]);
    sk.innerIds.forEach((p) => { if (sk.sideA[i].has(p) === hasIsA) out[p].push(t); }); });
  return out;
}

/** Four-gamete witness: two traits and four creatures showing both / only the first / only the second / neither, or null. */
export function findViolation(tiles, traits) {
  for (let i = 0; i < traits.length; i++) for (let j = i + 1; j < traits.length; j++) {
    const y = traits[i], z = traits[j]; const pick = {};
    tiles.forEach((tl) => { const k = (tl.feats.includes(y) ? "1" : "0") + (tl.feats.includes(z) ? "1" : "0"); if (!pick[k]) pick[k] = tl.id; });
    if (Object.keys(pick).length === 4) return { traits: [y, z], rows: [pick["11"], pick["10"], pick["01"], pick["00"]] };
  }
  return null;
}
/** True when the two chosen traits and four chosen creatures really exhibit all four configurations. */
export function proofValid(pz, pT, pR) {
  if (pT.length !== 2 || pR.length !== 4) return false;
  const s = new Set(pR.map((id) => { const f = pz.tiles.find((t) => t.id === id).feats; return (f.includes(pT[0]) ? "1" : "0") + (f.includes(pT[1]) ? "1" : "0"); }));
  return s.size === 4;
}

/** A complete rule-satisfying placement that keeps what is already on the board, or null. Backtracking over at most 6! placements. */
export function completion(sk, pz, place) { const used = new Set(Object.values(place)); const free = pz.tiles.filter((t) => !used.has(t.id)); const empty = sk.leafIds.filter((l) => !place[l]);
  const featsOf = (id) => pz.tiles.find((t) => t.id === id).feats; const cur = { ...place }; let out = null;
  (function rec(k, left) {
    if (out) return;
    if (k === empty.length) { const lf = {}; sk.leafIds.forEach((l) => { lf[l] = featsOf(cur[l]); }); if (pz.traits.every((t) => traitEdge(sk, lf, t) >= 0)) out = { ...cur }; return; }
    for (let i = 0; i < left.length; i++) { cur[empty[k]] = left[i].id; rec(k + 1, left.filter((_, j) => j !== i)); if (out) return; }
  })(0, free);
  return out;
}

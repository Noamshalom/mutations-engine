// Fairness check for a daily puzzle: exactly one solution, and a solver that never guesses reaches it.
//
// A puzzle passes only if (1) every full solution is the same tree, up to swapping two end creatures that hang
// on the same creature (the drawing mirrored), and (2) a solver that never guesses reaches it. The solver keeps,
// for every position, the set of creatures that could still sit there, and applies three rules until nothing changes:
//   support: a creature stays in a position only if every neighbouring position still has an option exactly one step away
//   single:  a position left with one option is settled, and that tray creature leaves every other position
//   pair:    two positions left with the same two options take both, and those two leave every other position
// When the rules stall, the only allowed choice is a free one: every option must lead to the same tree.

import { FEAT_IDS, keyOf } from "../creatures.js";
import { adjOf, edgesOf } from "./tree.js";

const fairDist = (a, b) => { let d = 0; for (const x of a) if (!b.includes(x)) d++; for (const x of b) if (!a.includes(x)) d++; return d; };
const fairSet = (k) => (k ? k.split(",") : []);
const fairFlip = (s, f) => (s.includes(f) ? s.filter((x) => x !== f) : [...s, f]).sort();
export function fairModel(g) {
  const adj = adjOf(g.nodes); const ids = g.nodes.map((n) => n.id);
  const special = new Set([g.joker, g.s6, g.s3]);
  const tiles = [...ids.filter((id) => !special.has(id)).map((id) => g.fs[id]), ...g.imps].map(keyOf);
  return { adj, ids, tiles, edges: edgesOf(g.nodes), J: g.joker, S6: g.s6, S3: g.s3, opts6: g.opts6.map(keyOf), opts3: g.opts3.map(keyOf) };
}
const fairIsTile = (M, s) => s !== M.J && s !== M.S6 && s !== M.S3;
// canonical form: a tree is its set of lines, each line joining two creatures. Swapping mirror branches of the drawing gives the same set.
function fairCanon(M, sol) { return M.edges.map(([a, b]) => [sol[a], sol[b]].sort().join("~")).sort().join("|"); }
// every full solution, as canonical keys (stops after CAP)
export function fairSolutions(M, CAP) {
  const { adj, ids, J } = M; const start = ids.find((x) => x !== J);
  const order = []; const seen = new Set([start]); const q = [start];
  while (q.length) { const u = q.shift(); order.push(u); for (const v of adj[u]) if (!seen.has(v)) { seen.add(v); q.push(v); } }
  const ord = order.filter((x) => x !== J);
  const domOf = (s) => (s === M.S6 ? M.opts6 : s === M.S3 ? M.opts3 : M.tiles);
  const as = {}; const used = new Set(); const keys = new Set(); let raw = 0;
  (function rec(i) {
    if (raw > CAP) return;
    if (i === ord.length) {
      const nb = adj[J].map((n) => fairSet(as[n])); const xs = new Set();
      for (const f of FEAT_IDS) { const X = fairFlip(nb[0], f); if (nb.every((s) => fairDist(X, s) === 1)) xs.add(keyOf(X)); }
      for (const x of xs) { raw++; keys.add(fairCanon(M, { ...as, [J]: x })); } return;
    }
    const s = ord[i]; const tile = fairIsTile(M, s);
    for (const v of domOf(s)) {
      if (tile && used.has(v)) continue; const vs = fairSet(v);
      if (adj[s].some((n) => as[n] != null && fairDist(vs, fairSet(as[n])) !== 1)) continue;
      as[s] = v; if (tile) used.add(v); rec(i + 1); delete as[s]; if (tile) used.delete(v);
    }
  })(0);
  return keys;
}
function fairPropagate(M, D, st) {
  let changed = true;
  while (changed) {
    changed = false; st.rounds++;
    for (const s of M.ids) for (const v of [...D[s]]) {
      const vs = fairSet(v);
      for (const n of M.adj[s]) { let sup = false; for (const w of D[n]) if (fairDist(vs, fairSet(w)) === 1) { sup = true; break; } if (!sup) { D[s].delete(v); changed = true; st.support++; break; } }
    }
    const tileSlots = M.ids.filter((s) => fairIsTile(M, s));
    for (const s of tileSlots) if (D[s].size === 1) { const v = [...D[s]][0]; for (const t of tileSlots) if (t !== s && D[t].delete(v)) { changed = true; st.single++; } }
    for (let i = 0; i < tileSlots.length; i++) for (let j = i + 1; j < tileSlots.length; j++) {
      const a = D[tileSlots[i]], b = D[tileSlots[j]];
      if (a.size !== 2 || b.size !== 2 || ![...a].every((v) => b.has(v))) continue;
      for (const t of tileSlots) if (t !== tileSlots[i] && t !== tileSlots[j]) for (const v of a) if (D[t].delete(v)) { changed = true; st.pair++; }
    }
    if (M.ids.some((s) => D[s].size === 0)) return false;
  }
  return true;
}
// when the rules stall, the only allowed choice is a free one: every option leads to the same tree, just drawn mirrored
function fairFinish(M, D, st, depth) {
  if (!fairPropagate(M, D, st)) return null;
  const open = M.ids.filter((s) => D[s].size > 1);
  if (!open.length) return new Set([fairCanon(M, Object.fromEntries(M.ids.map((s) => [s, [...D[s]][0]])))]);
  if (depth > 3) return null;
  // look for a slot where every option ends in the same tree; any slot that needs a real guess is skipped
  for (const s of open) {
    const out = new Set(); let fine = true;
    for (const v of D[s]) {
      const D2 = {}; M.ids.forEach((t) => (D2[t] = new Set(D[t]))); D2[s] = new Set([v]);
      const r = fairFinish(M, D2, st, depth + 1); if (!r) { fine = false; break; } r.forEach((k) => out.add(k)); if (out.size > 1) { fine = false; break; }
    }
    if (fine) { st.swaps++; return out; }
  }
  return null;
}
export function fairDeduce(M) {
  const st = { rounds: 0, support: 0, single: 0, pair: 0, swaps: 0 };
  const D = {}; M.ids.forEach((s) => (D[s] = new Set(s === M.S6 ? M.opts6 : s === M.S3 ? M.opts3 : s === M.J ? [] : M.tiles)));
  for (const n of M.adj[M.J]) for (const v of D[n]) for (const f of FEAT_IDS) D[M.J].add(keyOf(fairFlip(fairSet(v), f)));
  const r = fairFinish(M, D, st, 0);
  return { ok: !!r && r.size === 1, st };
}
export function puzzleIsFair(g) {
  const M = fairModel(g);
  if (fairSolutions(M, 60).size !== 1) return false;
  return fairDeduce(M).ok;
}

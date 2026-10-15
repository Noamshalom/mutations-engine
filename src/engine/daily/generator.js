// Generator of the daily puzzle: an unrooted tree with 12 positions, where every line joins two creatures
// that differ in exactly one body part. Nine positions are filled from a tray of 14 creatures (5 of them impostors),
// one position ("build") is constructed by the player, and two positions ("choose") offer candidate lists.
//
// generate(seed) is deterministic, so every player gets the same puzzle on a given day; without a seed it is random.
// A candidate puzzle is accepted only if it has a single solution (up to mirror symmetry) that the deduction-only
// solver in fairness.js reaches without guessing. Generation can take several seconds per puzzle.

import { FEAT_IDS, keyOf, sd1, mulberry32 } from "../creatures.js";
import { adjOf } from "./tree.js";
import { puzzleIsFair } from "./fairness.js";

// seedable randomness: generate(seed) makes every random call deterministic, so all players get the same daily puzzle
let RNG = Math.random;
const shuffle = (a) => shuf(a);
const rnd = (n) => Math.floor(RNG() * n);
function genTree(n) { for (let A = 0; A < 1400; A++) { let nodes = [{ id: 0, parent: null, children: [] }]; while (nodes.length < n) { const c = nodes.filter((x) => x.children.length < 3); const p = c[rnd(c.length)]; const id = nodes.length; nodes.push({ id, parent: p.id, children: [] }); p.children.push(id); } if (!nodes.some((x) => x.children.length >= 2)) continue; const fe = shuffle(FEAT_IDS).slice(0, n - 1); let k = 0; const ef = {}; for (const nd of nodes) if (nd.parent !== null) ef[nd.id] = fe[k++]; const fs = {}; (function d(id, acc) { fs[id] = acc; for (const c of nodes[id].children) d(c, [...acc, ef[c]]); })(0, []); return { nodes, fs }; } return null; }
function genNoEmpty(n) { const T = genTree(n); if (!T) return null; const allEdge = new Set(); T.nodes.forEach((nd) => T.fs[nd.id].forEach((f) => allEdge.add(f))); const spare = FEAT_IDS.filter((f) => !allEdge.has(f)); if (spare.length < 1) return null; const base = shuffle(spare).slice(0, Math.min(2, spare.length)); const fs2 = {}; T.nodes.forEach((nd) => (fs2[nd.id] = [...base, ...T.fs[nd.id]].sort())); return { nodes: T.nodes, fs: fs2 }; }
function countU(nodes, pile, nReal, CAP) { const adj = adjOf(nodes); const N = nodes.length; const order = nodes.map((n) => n.id); const idpos = {}; order.forEach((id, i) => (idpos[id] = i)); const as = new Array(N).fill(-1); const us = new Array(pile.length).fill(false); let total = 0; (function rec(k) { if (total > CAP) return; if (k === N) { total++; return; } const nid = order[k]; for (let ci = 0; ci < pile.length; ci++) { if (us[ci]) continue; let ok = true; for (const nb of adj[nid]) { const bi = idpos[nb]; if (bi < k && !sd1(pile[ci], pile[as[nb]])) { ok = false; break; } } if (!ok) continue; as[nid] = ci; us[ci] = true; rec(k + 1); us[ci] = false; as[nid] = -1; } })(0); return total; }
function jokerUnique(nodes, fs, J) { const adj = adjOf(nodes); const nb = adj[J].map((x) => fs[x]); const AF = [...new Set(nodes.flatMap((n) => fs[n.id]))]; const cand = new Set(); for (const s of nb) for (const f of AF) { const a = s.includes(f) ? s.filter((x) => x !== f) : [...s, f]; cand.add(a.sort().join(",")); } let c = 0; for (const k of cand) { const X = k ? k.split(",") : []; if (nb.every((s) => sd1(X, s))) c++; } return c; }
function nearMissU(nodes, fs, S) { const adj = adjOf(nodes); const truth = fs[S]; const nbrs = adj[S].map((nb) => fs[nb]); const AF = [...new Set(nodes.flatMap((n) => fs[n.id]))]; const cand = []; const seen = new Set([keyOf(truth)]); for (const f of AF) for (const g of [null, ...truth]) { if (truth.includes(f)) continue; /* adding a part the creature already has would repeat it, and look identical on screen */ const X = (g == null ? [...truth, f] : [...truth.filter((x) => x !== g), f]).sort(); const key = X.join(","); if (seen.has(key)) continue; seen.add(key); if (!nbrs.every((nb) => sd1(X, nb))) cand.push(X); } return shuffle(cand); }
function combined(nodes, fs, joker, s6, s3, warehouse, nImpFrom, opts6, opts3, CAP) { const adj = adjOf(nodes); const special = new Set([joker, s6, s3]); const normal = nodes.filter((n) => !special.has(n.id)); const order = normal.map((n) => n.id); const as = {}; const used = new Array(warehouse.length).fill(false); let total = 0, usingImp = 0; const cons = (nid, set) => { for (const nb of adj[nid]) { if (special.has(nb)) continue; if (as[nb] != null && !sd1(set, warehouse[as[nb]])) return false; } return true; }; const uniqOpt = (node, opts) => { let ch = 0, ss = null; for (const opt of opts) { if (adj[node].every((nb) => special.has(nb) ? true : sd1(opt, warehouse[as[nb]]))) { ch++; ss = opt; } } return ch === 1 ? ss : (ch === 0 ? false : "multi"); }; (function rec(k) { if (total > CAP) return; if (k === order.length) { const v6 = uniqOpt(s6, opts6); if (v6 === false || v6 === "multi") return; const v3 = uniqOpt(s3, opts3); if (v3 === false || v3 === "multi") return; const jnb = adj[joker].map((nb) => nb === s6 ? v6 : nb === s3 ? v3 : special.has(nb) ? null : warehouse[as[nb]]).filter((x) => x != null); const AF = [...new Set(nodes.flatMap((n) => fs[n.id]).concat(...warehouse))]; const cand = new Set(); for (const s of jnb) for (const f of AF) { const a = s.includes(f) ? s.filter((x) => x !== f) : [...s, f]; cand.add(a.sort().join(",")); } let build = 0; for (const key of cand) { const X = key ? key.split(",") : []; if (jnb.every((s) => sd1(X, s))) build++; } if (build < 1) return; total++; if (Object.values(as).some((ci) => ci >= nImpFrom)) usingImp++; return; } const nid = order[k]; for (let ci = 0; ci < warehouse.length; ci++) { if (used[ci]) continue; if (!cons(nid, warehouse[ci])) continue; as[nid] = ci; used[ci] = true; rec(k + 1); used[ci] = false; delete as[nid]; } })(0); return { total, usingImp }; }

function generateCore() {
  const N = 12, SYM = 2;
  for (let a = 0; a < 300; a++) {
    const T = genNoEmpty(N); if (!T) continue; const { nodes, fs } = T; const reals = nodes.map((n) => fs[n.id]);
    if (countU(nodes, reals, reals.length, 8) > 6) continue;
    const adj = adjOf(nodes); const inner = nodes.filter((x) => adj[x.id].length >= 2); const picks = shuffle(inner);
    let J = null, S6 = null, S3 = null;
    for (const x of picks) if (jokerUnique(nodes, fs, x.id) === 1) { J = x.id; break; } if (J == null) continue;
    for (const x of picks) if (x.id !== J && !adj[J].includes(x.id)) { S6 = x.id; break; } if (S6 == null) continue;
    for (const x of picks) if (x.id !== J && x.id !== S6) { S3 = x.id; break; } if (S3 == null) continue;
    const nm6 = nearMissU(nodes, fs, S6), nm3 = nearMissU(nodes, fs, S3); if (nm6.length < 5 || nm3.length < 2) continue;
    const rk = reals.map(keyOf);

    // impostor pool: must connect to at least one real (tempting), distinct from reals
    const AF = [...new Set(reals.flat())]; const seen = new Set(rk); const pool = [];
    for (const R of reals) for (const b of AF) { if (R.includes(b)) continue;
      for (const c of [null, ...R]) { const S = (c == null ? [...R, b] : [...R.filter((x) => x !== c), b]).sort();
        const k = keyOf(S); if (seen.has(k)) continue; seen.add(k);
        if (!reals.some((r) => sd1(r, S))) continue; pool.push(S); } }
    const sizes = reals.map((r) => r.length); const minS = Math.min(...sizes), maxS = Math.max(...sizes);
    const baseC = pool.filter((S) => S.length === minS), maxC = pool.filter((S) => S.length === maxS), otherC = pool.filter((S) => S.length !== minS && S.length !== maxS);
    if (baseC.length < 2 || maxC.length < 2 || otherC.length < 1) continue;

    const special = new Set([J, S6, S3]); const normal = nodes.filter((x) => !special.has(x.id));
    for (let t = 0; t < 25; t++) {
      const c6 = nm6.filter((o) => !rk.includes(keyOf(o))); if (c6.length < 5) break;
      const opts6 = shuffle([fs[S6], ...c6.slice(0, 5)]);
      const usedK = new Set([...rk, ...opts6.map(keyOf)]);
      const c3 = nm3.filter((o) => !usedK.has(keyOf(o))); if (c3.length < 2) break;
      const opts3 = shuffle([fs[S3], ...c3.slice(0, 2)]);
      // 5 impostors: 2 base-sized, 2 max-sized, 1 other. Never a slider candidate: a creature must not appear both in a slider and in the tray.
      const optK = new Set([...opts6.map(keyOf), ...opts3.map(keyOf)]);
      const bC = baseC.filter((S) => !optK.has(keyOf(S))), mC = maxC.filter((S) => !optK.has(keyOf(S))), oC = otherC.filter((S) => !optK.has(keyOf(S)));
      if (bC.length < 2 || mC.length < 2 || oC.length < 1) continue;
      const imps = [...shuffle(bC).slice(0, 2), ...shuffle(mC).slice(0, 2), shuffle(oC)[0]];
      const impK = imps.map(keyOf);
      if (new Set([...rk, ...impK]).size !== reals.length + 5) continue;
      const warehouse = [...normal.map((x) => fs[x.id]), ...imps];
      const { total, usingImp } = combined(nodes, fs, J, S6, S3, warehouse, normal.length, opts6, opts3, SYM + 1);
      if (total >= 1 && total <= SYM && usingImp === 0) {
        const cand = { nodes, fs, joker: J, s6: S6, s3: S3, opts6, opts3, jokerFeats: fs[J], truth6: fs[S6], truth3: fs[S3], imps };
        if (puzzleIsFair(cand)) return cand; // one tree only, and reachable without guessing
      }
    }
  }
  return null;
}
// seed given: deterministic puzzle (daily). no seed: fresh random puzzle (endless mode).
export function generate(seed) { RNG = seed == null ? Math.random : mulberry32(seed); try { return generateCore(); } finally { RNG = Math.random; } }

function shuf(a) { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(RNG() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

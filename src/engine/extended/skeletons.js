// The four shapes of unrooted binary trees with four to six leaves. Up to six leaves these are all the shapes
// there are (one with four, one with five, two with six), so the same skeletons serve every puzzle of a given size.
// Each skeleton is pre-processed once: the two sides of every edge, the internal edges, the pendant edge of each
// leaf, the cherries (pairs of leaves attached to the same hidden vertex), and screen coordinates for drawing.

export const UX = 105, UY = 78, LEAF = 84, MINI = 46, TPAD = 12;

export function buildSkeleton(def) {
  const leafIds = Object.keys(def.leaves), innerIds = Object.keys(def.inner); const all = [...leafIds, ...innerIds];
  const pos = { ...def.leaves, ...def.inner };
  const adj = {}; all.forEach((n) => { adj[n] = []; });
  def.edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
  // sideA[i]: every vertex that stays connected to the first endpoint of edge i when that edge is cut
  const sideA = def.edges.map(([a, b]) => { const seen = new Set([a]); const q = [a]; while (q.length) { const u = q.shift(); for (const v of adj[u]) { if (u === a && v === b) continue; if (!seen.has(v)) { seen.add(v); q.push(v); } } } return seen; });
  const leafA = sideA.map((s) => leafIds.filter((l) => s.has(l)));
  const leafB = sideA.map((s) => leafIds.filter((l) => !s.has(l)));
  const isLeaf = {}; all.forEach((n) => { isLeaf[n] = leafIds.includes(n); });
  const internal = []; const edgeOfLeaf = {};
  def.edges.forEach(([a, b], i) => { if (isLeaf[a]) edgeOfLeaf[a] = i; else if (isLeaf[b]) edgeOfLeaf[b] = i; else internal.push(i); });
  const byInner = {}; leafIds.forEach((l) => { const p = adj[l][0]; (byInner[p] = byInner[p] || []).push(l); });
  const cherries = Object.values(byInner).filter((g) => g.length === 2);
  const xs = all.map((n) => pos[n][0]), ys = all.map((n) => pos[n][1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const px = {}, py = {}; all.forEach((n) => { px[n] = TPAD + LEAF / 2 + (pos[n][0] - minX) * UX; py[n] = TPAD + LEAF / 2 + (pos[n][1] - minY) * UY; });
  const W = (maxX - minX) * UX + LEAF + TPAD * 2, H = (maxY - minY) * UY + LEAF + TPAD * 2;
  return { leafIds, innerIds, edges: def.edges, adj, sideA, leafA, leafB, isLeaf, internal, edgeOfLeaf, cherries, px, py, W, H };
}
export const SK = {
  s4: buildSkeleton({ leaves: { a: [0, 0], b: [0, 2], c: [3, 0], d: [3, 2] }, inner: { u: [0.9, 1], v: [2.1, 1] }, edges: [["a", "u"], ["b", "u"], ["u", "v"], ["c", "v"], ["d", "v"]] }),
  s5: buildSkeleton({ leaves: { a: [0, 0.4], b: [0, 2.4], c: [2, 0], d: [4, 0.4], e: [4, 2.4] }, inner: { u: [0.9, 1.4], v: [2, 1.4], w: [3.1, 1.4] }, edges: [["a", "u"], ["b", "u"], ["u", "v"], ["c", "v"], ["v", "w"], ["d", "w"], ["e", "w"]] }),
  s6c: buildSkeleton({ leaves: { a: [0, 0.5], b: [0, 2.5], c: [1.7, 0], d: [2.7, 3], e: [4.4, 0.5], f: [4.4, 2.5] }, inner: { u: [0.8, 1.5], v: [1.7, 1.5], w: [2.7, 1.5], x: [3.6, 1.5] }, edges: [["a", "u"], ["b", "u"], ["u", "v"], ["c", "v"], ["v", "w"], ["d", "w"], ["w", "x"], ["e", "x"], ["f", "x"]] }),
  s6s: buildSkeleton({ leaves: { a: [1.2, 0], b: [2.8, 0], c: [0, 1.7], d: [0.7, 3.7], e: [4, 1.7], f: [3.3, 3.7] }, inner: { m: [2, 1.85], u: [2, 0.75], v: [1, 2.4], w: [3, 2.4] }, edges: [["a", "u"], ["b", "u"], ["u", "m"], ["m", "v"], ["c", "v"], ["d", "v"], ["m", "w"], ["e", "w"], ["f", "w"]] }),
};

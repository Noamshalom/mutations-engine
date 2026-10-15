// Tree layouts for drawing: a layered rooted diagram, and Felsenstein's equal-angle layout for the unrooted view
// (each subtree receives an angular sector proportional to its number of leaves). The unrooted layout first
// contracts non-taxon vertices of degree two, merging their edge labels.

export function layoutRooted(tree) {
  const pos = {}; let x = 0; const nodes = [], edges = [];
  const walk = (nd, depth) => { nodes.push(nd); if (!nd.kids.length) { pos[nd.id] = [x++, depth]; return; } nd.kids.forEach((k) => { walk(k.node, depth + 1); edges.push({ a: nd, b: k.node, labels: k.labels }); }); pos[nd.id] = [nd.kids.reduce((s, k) => s + pos[k.node.id][0], 0) / nd.kids.length, depth]; };
  walk(tree, 0);
  return { pos, nodes, edges, w: Math.max(1, x - 1), h: Math.max(1, ...Object.values(pos).map((p) => p[1])) };
}
export function layoutUnrooted(tree) {
  // undirected graph, contract non-taxon vertices of degree 2, then Felsenstein's equal-angle layout
  const adj = {}, nodes = {}; const addE = (a, b, labels) => { (adj[a.id] = adj[a.id] || []).push({ to: b.id, labels }); (adj[b.id] = adj[b.id] || []).push({ to: a.id, labels }); };
  const walk = (nd) => { nodes[nd.id] = nd; adj[nd.id] = adj[nd.id] || []; nd.kids.forEach((k) => { addE(nd, k.node, k.labels); walk(k.node); }); }; walk(tree);
  let changed = true;
  while (changed) { changed = false; for (const id of Object.keys(adj)) { if (nodes[id].name == null && adj[id].length === 2) { const [p, q] = adj[id]; adj[p.to] = adj[p.to].filter((e) => e.to !== id); adj[q.to] = adj[q.to].filter((e) => e.to !== id); const labels = p.labels.concat(q.labels); adj[p.to].push({ to: q.to, labels }); adj[q.to].push({ to: p.to, labels }); delete adj[id]; delete nodes[id]; changed = true; break; } } }
  const ids = Object.keys(adj); const leafCount = {};
  const countLeaves = (id, from) => { const kids = adj[id].filter((e) => e.to !== from); if (!kids.length) return (leafCount[id + "|" + from] = 1); return (leafCount[id + "|" + from] = kids.reduce((s, e) => s + countLeaves(e.to, id), 0)); };
  const center = ids.find((id) => nodes[id].name == null && adj[id].length >= 3) || ids.find((id) => nodes[id].name == null) || ids[0];
  const total = countLeaves(center, null); const pos = {}; const edges = [];
  const place = (id, from, x, y, a0, a1) => { pos[id] = [x, y]; const kids = adj[id].filter((e) => e.to !== from); let a = a0; kids.forEach((e) => { const span = (a1 - a0) * (leafCount[e.to + "|" + id] / Math.max(1, leafCount[id + "|" + from] || total)); const mid = a + span / 2; place(e.to, id, x + Math.cos(mid), y + Math.sin(mid), a, a + span); edges.push({ a: nodes[id], b: nodes[e.to], labels: e.labels }); a += span; }); };
  place(center, null, 0, 0, -Math.PI / 2, 1.5 * Math.PI);
  const xs = Object.values(pos).map((p) => p[0]), ys = Object.values(pos).map((p) => p[1]);
  const mnx = Math.min(...xs), mny = Math.min(...ys);
  Object.keys(pos).forEach((id) => { pos[id] = [pos[id][0] - mnx, pos[id][1] - mny]; });
  return { pos, nodes: Object.values(nodes), edges, w: Math.max(0.5, Math.max(...xs) - mnx), h: Math.max(0.5, Math.max(...ys) - mny) };
}

// Adjacency helpers for the daily puzzle's tree (nodes carry a parent id and a children list).

export const adjOf = (nodes) => { const adj = {}; nodes.forEach((n) => (adj[n.id] = [])); nodes.filter((n) => n.parent != null).forEach((n) => { adj[n.parent].push(n.id); adj[n.id].push(n.parent); }); return adj; };
export const edgesOf = (nodes) => nodes.filter((n) => n.parent != null).map((n) => [n.parent, n.id]);

// Perfect phylogeny from DNA sequences (the sequence tool's algorithm).
// Input: n sequences of equal length over {A,C,G,T} (or 0/1); every column must have at most two letters.
// Step 0 re-encodes every column relative to a reference taxon; columns with identical carrier sets are merged into
// classes; the four-gamete test is run on every pair of classes and yields a certificate when it fails; otherwise the
// recursive construction from the containment theorem builds the rooted tree, single-child vertices are contracted,
// and ancestral sequences are reconstructed by flipping each edge's sites.

/** FASTA, "name sequence" pairs, or bare sequences, one per line. */
export function parseSequences(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length);
  const rows = []; let cur = null;
  for (const l of lines) {
    if (l.startsWith(">")) { cur = { name: l.slice(1).trim() || "S" + (rows.length + 1), seq: "" }; rows.push(cur); continue; }
    const parts = l.split(/[\s,;\t]+/);
    if (cur && parts.length === 1) { cur.seq += parts[0]; continue; }
    if (parts.length >= 2) rows.push({ name: parts[0], seq: parts.slice(1).join("") }); else rows.push({ name: "S" + (rows.length + 1), seq: parts[0] });
    cur = null;
  }
  rows.forEach((r) => { r.seq = r.seq.toUpperCase(); });
  return rows;
}
const ALPH = "ACGT01";

/** Validation, Step 0, character classes, four-gamete test with certificate, construction, log, ancestral sequences. */
export function analyzeMatrix(rows, refIndex, dropNonBinary) {
  const n = rows.length; const errors = [];
  if (!n) return { errors: ["empty"] };
  const m = rows[0].seq.length;
  const bad = rows.filter((r) => r.seq.length !== m).map((r) => r.name);
  if (bad.length) errors.push(["len", bad.join(", ")]);
  rows.forEach((r, i) => { if ([...r.seq].some((c) => !ALPH.includes(c))) errors.push(["chars", i + 1]); });
  if (errors.length) return { errors, n, m };
  const ref = rows[refIndex] || rows[0];
  const columns = [];
  for (let j = 0; j < m; j++) {
    const states = [...new Set(rows.map((r) => r.seq[j]))];
    const c = { j, states, refLetter: ref.seq[j] };
    if (states.length === 1) c.type = "trivial";
    else if (states.length > 2) c.type = "nonbinary";
    else { c.type = "ok"; c.derived = states.find((s) => s !== ref.seq[j]); c.O = rows.map((r, i) => (r.seq[j] === c.derived ? i : -1)).filter((i) => i >= 0); }
    columns.push(c);
  }
  const nonbinary = columns.filter((c) => c.type === "nonbinary").map((c) => c.j + 1);
  if (nonbinary.length && !dropNonBinary) return { errors: [["nonbinary", nonbinary.join(", ")]], n, m, columns };
  const used = columns.filter((c) => c.type === "ok");
  // character classes: columns with identical O sets mutate on the same edge
  const classes = []; const byKey = {};
  used.forEach((c) => { const k = c.O.join(","); if (!byKey[k]) { byKey[k] = { key: k, O: c.O, cols: [] }; classes.push(byKey[k]); } byKey[k].cols.push(c.j); });
  // four-gamete / laminarity test over classes (equal classes are trivially laminar)
  let violation = null;
  outer: for (let a = 0; a < classes.length; a++) for (let b = a + 1; b < classes.length; b++) {
    const A = new Set(classes[a].O), B = new Set(classes[b].O);
    const both = classes[a].O.find((i) => B.has(i)); if (both == null) continue;
    const onlyA = classes[a].O.find((i) => !B.has(i)); const onlyB = classes[b].O.find((i) => !A.has(i));
    if (onlyA == null || onlyB == null) continue;
    const none = rows.findIndex((_, i) => !A.has(i) && !B.has(i)); // the reference taxon always qualifies
    violation = { j: classes[a].cols[0], l: classes[b].cols[0], rows: { "11": both, "10": onlyA, "01": onlyB, "00": none } };
    break outer;
  }
  const log = [];
  let tree = null;
  if (!violation) {
    let idc = 0; const node = (name) => ({ id: "n" + idc++, name: name == null ? null : name, kids: [] });
    const build = (taxa, cls, depth) => {
      const pad = "  ".repeat(depth);
      if (!cls.length) { const r = node(null); taxa.forEach((i) => r.kids.push({ node: node(rows[i].name), labels: [] })); log.push(pad + `base: no characters left for {${taxa.map((i) => rows[i].name).join(",")}}, star tree`); return r; }
      const best = cls.reduce((x, y) => (y.O.length > x.O.length ? y : x));
      const P = new Set(best.O); const Q = taxa.filter((i) => !P.has(i));
      const L1 = cls.filter((c) => c !== best && c.O.every((i) => P.has(i)));
      const L2 = cls.filter((c) => c !== best && !c.O.some((i) => P.has(i)));
      log.push(pad + `choose sites {${best.cols.map((j) => j + 1).join(",")}} with the largest O = {${best.O.map((i) => rows[i].name).join(",")}}; P = O, Q = {${Q.map((i) => rows[i].name).join(",") || "∅"}}; ${L1.length} classes inside P, ${L2.length} classes disjoint from P`);
      const T1 = build(best.O, L1, depth + 1);
      const T2 = Q.length ? build(Q, L2, depth + 1) : node(null);
      T2.kids.push({ node: T1, labels: best.cols });
      return T2;
    };
    log.push(`Step 0: reference taxon ${ref.name}; ${used.length} variable binary columns in ${classes.length} classes; ${columns.filter((c) => c.type === "trivial").length} constant columns dropped`);
    tree = build(rows.map((_, i) => i), classes, 0);
    // contract non-taxon vertices with a single child (they carry no information)
    const contract = (nd) => { nd.kids = nd.kids.map((k) => { let ch = k.node; let labels = k.labels; while (ch.name == null && ch.kids.length === 1) { labels = labels.concat(ch.kids[0].labels); ch = ch.kids[0].node; } contract(ch); return { node: ch, labels }; }); return nd; };
    while (tree.name == null && tree.kids.length === 1) { tree = tree.kids[0].node; }
    contract(tree);
    // reconstructed sequences: root = reference row, each edge flips its sites to the derived letter
    const assign = (nd, seq) => { nd.seq = seq; nd.kids.forEach((k) => { const s = seq.split(""); k.labels.forEach((j) => { s[j] = columns[j].derived; }); assign(k.node, s.join("")); }); };
    assign(tree, ref.seq);
  }
  return { errors: [], n, m, columns, used, classes, violation, tree, log, ref: refIndex, nonbinary };
}


/** Newick serialisation with the mutating sites annotated on branches. */
export function newickOf(tree) { const rec = (nd) => (nd.kids.length ? "(" + nd.kids.map((k) => rec(k.node) + (k.labels.length ? "[&sites=" + k.labels.map((j) => j + 1).join("|") + "]" : "")).join(",") + ")" : nd.name.replace(/[\s,;:()]/g, "_")); return rec(tree) + ";"; }

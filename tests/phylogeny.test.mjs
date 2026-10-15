// The sequence tool's algorithm on the two built-in examples.
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseSequences, analyzeMatrix, newickOf } from "../src/engine/phylogeny/analyze.js";

const LECTURE = ">A\nGCTA\n>B\nACTA\n>C\nACTG\n>D\nATCG\n>E\nACCG";
const CONFLICT = ">A\nGCTA\n>B\nACTA\n>C\nACTG\n>D\nATCA\n>E\nACCG";

test("parser accepts FASTA, pairs and bare sequences", () => {
  assert.deepEqual(parseSequences(">x\nAC\nGT\ny AAAA\nCCCC").map((r) => [r.name, r.seq]), [["x", "ACGT"], ["y", "AAAA"], ["S3", "CCCC"]]);
});

test("the lecture example has a perfect phylogeny, rooted at E", () => {
  const rows = parseSequences(LECTURE); const res = analyzeMatrix(rows, 4, false);
  assert.deepEqual(res.errors, []);
  assert.equal(res.violation, null);
  assert.ok(res.tree);
  // O-sets after step 0 with reference E: site1 {A}, site2 {D}, site3 {A,B,C}, site4 {A,B}
  const O = res.used.map((c) => c.O.map((i) => rows[i].name).join(""));
  assert.deepEqual(O, ["A", "D", "ABC", "AB"]);
  // the construction splits on site 3 first
  assert.match(res.log[1], /sites \{3\}/);
  // the reconstructed root is the reference sequence, and A's leaf carries its own sequence
  assert.equal(res.tree.seq, "ACCG");
  const find = (nd) => (nd.name === "A" ? nd : nd.kids.map((k) => find(k.node)).find(Boolean));
  assert.equal(find(res.tree).seq, "GCTA");
  assert.match(newickOf(res.tree), /^\(.*\);$/);
});

test("changing D's fourth letter breaks the four-gamete test on sites 3 and 4", () => {
  const rows = parseSequences(CONFLICT); const res = analyzeMatrix(rows, 4, false);
  assert.ok(res.violation);
  assert.deepEqual([res.violation.j, res.violation.l].sort(), [2, 3]);
  const w = res.violation.rows; const names = Object.fromEntries(Object.entries(w).map(([k, i]) => [k, rows[i].name]));
  assert.deepEqual(names, { "11": "A", "10": "C", "01": "D", "00": "E" });
  assert.equal(res.tree, null);
});

test("non-binary columns are reported, and can be dropped", () => {
  const rows = parseSequences(">A\nACGT\n>B\nCCGT\n>C\nGCGA");
  assert.equal(analyzeMatrix(rows, 0, false).errors[0][0], "nonbinary");
  const res = analyzeMatrix(rows, 0, true);
  assert.deepEqual(res.errors, []); assert.ok(res.tree);
});

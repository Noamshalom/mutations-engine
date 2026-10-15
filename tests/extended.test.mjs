// The extended puzzles: every generated puzzle obeys the rule or carries a valid four-gamete certificate,
// and when the shape is to be chosen, the data admit exactly one of the two six-leaf shapes.
import { test } from "node:test";
import assert from "node:assert/strict";
import { SK } from "../src/engine/extended/skeletons.js";
import { genPuzzle, STAGES, freeStage } from "../src/engine/extended/generator.js";
import { traitEdge, hiddenFeats, completion, proofValid } from "../src/engine/extended/rules.js";

test("the four skeletons have distinct splits", () => {
  for (const sk of Object.values(SK)) {
    const splits = new Set(sk.edges.map((_, i) => [sk.leafA[i].slice().sort().join(), sk.leafB[i].slice().sort().join()].sort().join("|")));
    assert.equal(splits.size, sk.edges.length);
  }
});

test("every level produces consistent puzzles (40 per level)", () => {
  STAGES.forEach((stage, si) => {
    for (let s = 0; s < 40; s++) {
      const pz = genPuzzle(stage, 7000 * si + 13 * s + 1);
      assert.ok(pz, `level ${si + 1} seed ${s}: a puzzle was generated`);
      const keys = new Set(pz.tiles.map((t) => t.feats.slice().sort().join()));
      assert.equal(keys.size, pz.tiles.length, "creatures are pairwise distinct");
      const sol = completion(pz.sk, pz, {});
      if (pz.conflict) {
        assert.equal(sol, null, "a conflicting puzzle has no placement at all");
        assert.ok(proofValid(pz, pz.violation.traits, pz.violation.rows), "the recorded certificate is valid");
      } else {
        assert.ok(sol, "a consistent puzzle has a placement");
        const lf = {}; pz.sk.leafIds.forEach((l) => { lf[l] = pz.tiles.find((t) => t.id === sol[l]).feats; });
        const te = {}; pz.traits.forEach((t) => { te[t] = traitEdge(pz.sk, lf, t); assert.ok(te[t] >= 0, `trait ${t} has an edge`); });
        // hidden ancestors differ across every edge by exactly the traits assigned to it
        const all = { ...lf, ...hiddenFeats(pz.sk, lf, te, pz.traits) };
        pz.sk.edges.forEach(([a, b], i) => {
          const d = pz.traits.filter((t) => all[a].includes(t) !== all[b].includes(t)).length;
          const on = pz.traits.filter((t) => te[t] === i).length;
          assert.equal(d, on);
        });
      }
      if (stage.chooseSkel) {
        const other = pz.skelName === "s6c" ? "s6s" : "s6c";
        assert.equal(completion(SK[other], pz, {}), null, "the other shape never fits the data");
      }
    }
  });
});

test("free play puzzles are consistent too", () => {
  for (let s = 0; s < 30; s++) {
    const st = freeStage(5 + 31 * s); const pz = genPuzzle(st, 999 + 17 * s);
    assert.ok(pz);
    assert.equal(!!completion(pz.sk, pz, {}), !pz.conflict);
  }
});

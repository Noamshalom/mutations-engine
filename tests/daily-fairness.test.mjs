// Every daily puzzle the generator produces must pass the fairness check: a single solution (up to mirror
// symmetry) that the deduction-only solver reaches without guessing. Generation takes a few seconds per puzzle,
// so only a handful are generated here.
//
// The seeds below are test seeds only. They are deliberately far from any seed the live site uses, because a
// seed fully determines a puzzle: publishing the site's seeds would publish its future puzzles.
import { test } from "node:test";
import assert from "node:assert/strict";
import { generate } from "../src/engine/daily/generator.js";
import { puzzleIsFair } from "../src/engine/daily/fairness.js";
import { keyOf, sd1 } from "../src/engine/creatures.js";

const TEST_SEEDS = [910001, 910002, 910003];

for (const seed of TEST_SEEDS) {
  test(`daily puzzle from seed ${seed} is fair and well formed`, { timeout: 120000 }, () => {
    const g = generate(seed);
    assert.ok(g, "generator returned a puzzle");
    assert.equal(g.nodes.length, 12, "twelve positions");
    assert.equal(g.imps.length, 5, "five impostors");
    assert.equal(g.opts6.length, 6, "six candidates for the first choose position");
    assert.equal(g.opts3.length, 3, "three candidates for the second choose position");
    // no creature carries a trait twice (the duplicate-trait bug), and all tray creatures are distinct
    const all = [...g.nodes.map((n) => g.fs[n.id]), ...g.imps, ...g.opts6, ...g.opts3];
    for (const c of all) assert.equal(new Set(c).size, c.length, "no duplicated trait in " + keyOf(c));
    const trayKeys = [...g.nodes.filter((n) => ![g.joker, g.s6, g.s3].includes(n.id)).map((n) => keyOf(g.fs[n.id])), ...g.imps.map(keyOf)];
    assert.equal(new Set(trayKeys).size, trayKeys.length, "tray creatures are pairwise distinct");
    // every line of the solution joins two creatures that differ in exactly one trait
    for (const n of g.nodes) if (n.parent != null) assert.ok(sd1(g.fs[n.id], g.fs[n.parent]), "neighbours differ by one trait");
    // the fairness check accepts the puzzle (the generator already ran it; this re-checks the finished puzzle)
    assert.equal(puzzleIsFair(g), true, "unique solution, reachable by deduction alone");
  });
}

test("the same seed always gives the same puzzle", { timeout: 120000 }, () => {
  const a = generate(910001), b = generate(910001);
  assert.deepEqual(a.nodes.map((n) => keyOf(a.fs[n.id])), b.nodes.map((n) => keyOf(b.fs[n.id])));
});

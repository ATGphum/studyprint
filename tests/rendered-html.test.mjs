import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { allCodes, getCompatibility, isStudyCode } from "../app/compatibility.js";

const root = new URL("../", import.meta.url);

test("ships the complete Studyprint experience", async () => {
  const [page, layout, css] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/layout.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
  ]);

  assert.match(page, /STUDYPRINT/);
  assert.match(page, /const questions: Question\[\] = \[/);
  assert.equal((page.match(/axis: \"(?:company|energy|rhythm|momentum)\"/g) ?? []).length, 16);
  assert.match(page, /getCompatibility/);
  assert.match(page, /navigator\.share/);
  assert.match(page, /That code is not valid/);
  assert.match(page, /preference-strength percentages are intentionally hidden/);
  assert.match(page, /Balanced · code uses/);
  assert.doesNotMatch(page, /scoresFromCode/);
  assert.match(page, /onKeyDown/);
  assert.match(page, /ArrowLeft/);
  assert.match(page, /quizHeadingRef/);
  assert.match(page, /Share result/);
  assert.doesNotMatch(page, /match score/);
  assert.match(page, /\?type=/);
  assert.match(layout, /Find your four-letter study code/);
  assert.match(layout, /og\.png/);
  assert.match(css, /@media \(max-width: 640px\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.doesNotMatch(page, /_sites-preview|codex-preview|SkeletonPreview/);
});

test("defines every possible four-letter archetype", async () => {
  const page = await readFile(new URL("app/page.tsx", root), "utf8");
  const codes = ["A", "C"].flatMap((one) =>
    ["Q", "T"].flatMap((two) =>
      ["S", "F"].flatMap((three) => ["O", "P"].map((four) => `${one}${two}${three}${four}`)),
    ),
  );

  for (const code of codes) assert.match(page, new RegExp(`${code}:`));
});

test("uses a symmetric compatibility model with explicit working agreements", () => {
  const soloPlanner = getCompatibility("AQSO", "AQSO");
  const complementarySprint = getCompatibility("AQSO", "AQSP");
  const contrastingPair = getCompatibility("AQSO", "CTFP");
  const reverseContrastingPair = getCompatibility("CTFP", "AQSO");

  assert.equal(soloPlanner.agreementCount, 0);
  assert.equal(complementarySprint.agreementCount, 1);
  assert.equal(contrastingPair.setupCost, reverseContrastingPair.setupCost);
  assert.equal(contrastingPair.agreementCount, 4);
  assert.deepEqual(contrastingPair.notes, reverseContrastingPair.notes);
  assert.ok(contrastingPair.setupCost > complementarySprint.setupCost);
  assert.match(complementarySprint.summary, /checkpoint|organiser|sprinter/i);
  assert.match(getCompatibility("AQSP", "AQSP").summary, /mid-point deadline/i);
  assert.throws(() => getCompatibility("AQSO", "NOPE"), /valid four-letter/);
  assert.equal(allCodes().length, 16);
  assert.equal(isStudyCode("CTFO"), true);
  assert.equal(isStudyCode("CFTO"), false);
});

test("keeps all 256 possible pairings symmetric, bounded, and actionable", () => {
  const codes = allCodes();

  for (const first of codes) {
    for (const second of codes) {
      const forward = getCompatibility(first, second);
      const reverse = getCompatibility(second, first);

      assert.equal(forward.setupCost, reverse.setupCost, `${first}/${second} setup cost changed with order`);
      assert.equal(forward.agreementCount, reverse.agreementCount, `${first}/${second} agreement count changed with order`);
      assert.deepEqual(forward.notes, reverse.notes, `${first}/${second} guidance changed with order`);
      assert.ok(forward.setupCost >= 0 && forward.setupCost <= 6, `${first}/${second} setup cost escaped its defined range`);
      assert.ok(forward.agreementCount >= 0 && forward.agreementCount <= 4);
      assert.equal(forward.dimensions.length, 4);
      if (forward.agreementCount === 0) {
        assert.match(forward.summary, /line up naturally/);
      } else {
        assert.match(forward.summary, /^Your best starting point: /);
      }
      assert.ok(forward.label.length > 0);
    }
  }
});

test("does not present the compatibility heuristic as a precise percentage", async () => {
  const page = await readFile(new URL("app/page.tsx", root), "utf8");
  assert.doesNotMatch(page, /fit \/ 100|% match/);
  assert.match(page, /agreements?/);
});

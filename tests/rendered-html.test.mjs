import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

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

import { assertEquals } from "@std/assert";

import {
  collectTypographyIssues,
  normalizeTypographyForFile,
} from "./typography-guard.ts";

Deno.test("normalizeTypographyForFile() normalizes all Markdown prose", () => {
  const source = [
    "# Phiphi’s notes",
    "",
    "Use “quotes” and ’apostrophes’ in docs.",
    "",
    "```ts",
    "const label = “still normalized in markdown”;",
    "```",
  ].join("\n");

  const normalized = normalizeTypographyForFile("README.md", source);

  assertEquals(
    normalized,
    [
      "# Phiphi's notes",
      "",
      "Use \"quotes\" and 'apostrophes' in docs.",
      "",
      "```ts",
      'const label = "still normalized in markdown";',
      "```",
    ].join("\n"),
  );
});

Deno.test("normalizeTypographyForFile() normalizes slash comments only", () => {
  const source = [
    "// Lume’s plugin still runs here.",
    'const title = "Phiphi’s site";',
    "const value = 1; // keep this comment’s apostrophe ASCII",
    "/** Repo’s docs stay normalized. */",
    "const copy = `Template strings keep Phiphi’s prose untouched.`;",
  ].join("\n");

  const normalized = normalizeTypographyForFile("example.ts", source);

  assertEquals(
    normalized,
    [
      "// Lume's plugin still runs here.",
      'const title = "Phiphi’s site";',
      "const value = 1; // keep this comment's apostrophe ASCII",
      "/** Repo's docs stay normalized. */",
      "const copy = `Template strings keep Phiphi’s prose untouched.`;",
    ].join("\n"),
  );
});

Deno.test("normalizeTypographyForFile() normalizes hash and markup comments", () => {
  const shellSource = [
    "# Deploy’s friendly note",
    'echo "Phiphi’s site"',
    "build # Worker’s log line",
  ].join("\n");
  const markupSource = [
    "<!-- Design system’s note -->",
    "<div>Phiphi’s site</div>",
  ].join("\n");

  assertEquals(
    normalizeTypographyForFile("script.sh", shellSource),
    [
      "# Deploy's friendly note",
      'echo "Phiphi’s site"',
      "build # Worker's log line",
    ].join("\n"),
  );
  assertEquals(
    normalizeTypographyForFile("template.xsl.template", markupSource),
    [
      "<!-- Design system's note -->",
      "<div>Phiphi’s site</div>",
    ].join("\n"),
  );
});

Deno.test("collectTypographyIssues() reports smart typography positions", () => {
  const source = "Phiphi’s docs\nSecond “line”";

  assertEquals(
    collectTypographyIssues("README.md", source),
    [
      {
        character: "’",
        column: 7,
        filePath: "README.md",
        line: 1,
      },
      {
        character: "“",
        column: 8,
        filePath: "README.md",
        line: 2,
      },
      {
        character: "”",
        column: 13,
        filePath: "README.md",
        line: 2,
      },
    ],
  );
});

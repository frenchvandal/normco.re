import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import { enhancePostContent } from "./post-outline.ts";

describe("enhancePostContent()", () => {
  it("adds stable ids to h2 and h3 headings and returns an outline", () => {
    const result = enhancePostContent(
      "<p>Intro</p><h2>Alpha Section</h2><p>Body</p><h3>Nested Topic</h3>",
    );

    assertEquals(result.outline, [
      { id: "alpha-section", level: 2, text: "Alpha Section" },
      { id: "nested-topic", level: 3, text: "Nested Topic" },
    ]);
    assertEquals(result.html.includes('id="alpha-section"'), true);
    assertEquals(result.html.includes('id="nested-topic"'), true);
  });

  it("keeps explicit ids and deduplicates repeated headings", () => {
    const result = enhancePostContent(
      '<h2 id="overview">Overview</h2><h2>Overview</h2><h3>Overview</h3>',
    );

    assertEquals(result.outline, [
      { id: "overview", level: 2, text: "Overview" },
      { id: "overview-2", level: 2, text: "Overview" },
      { id: "overview-3", level: 3, text: "Overview" },
    ]);
  });

  it("sanitizes invalid explicit ids and falls back to deterministic ids", () => {
    const result = enhancePostContent(
      '<h2 id="-facilisis-">如何把 facilisis 落地</h2><h2>2026 Release Notes</h2><h3>纯中文标题</h3>',
    );

    assertEquals(result.outline, [
      { id: "facilisis", level: 2, text: "如何把 facilisis 落地" },
      {
        id: "section-2026-release-notes",
        level: 2,
        text: "2026 Release Notes",
      },
      { id: "section-a3d79299", level: 3, text: "纯中文标题" },
    ]);
    assertEquals(result.html.includes('id="facilisis"'), true);
    assertEquals(result.html.includes('id="section-2026-release-notes"'), true);
    assertEquals(result.html.includes('id="section-a3d79299"'), true);
  });

  it("ignores empty headings", () => {
    const result = enhancePostContent("<h2> </h2><p>Body</p>");

    assertEquals(result.outline, []);
    assertEquals(result.html.includes("<h2"), true);
  });
});

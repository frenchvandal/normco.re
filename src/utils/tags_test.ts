import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import { getTagColor, getTagSlug, getTagUrl } from "./tags.ts";

describe("tags taxonomy utilities", () => {
  it("slugifies tag labels for taxonomy routes", () => {
    assertEquals(getTagSlug("Alibaba Cloud"), "alibaba-cloud");
    assertEquals(getTagSlug("Crème brûlée"), "creme-brulee");
  });

  it("returns stable deterministic colors for a given tag", () => {
    assertEquals(getTagColor("design"), getTagColor("design"));
    assertEquals(getTagColor("github-actions"), getTagColor("github-actions"));
  });

  it("builds localized tag URLs with the plural basename", () => {
    assertEquals(getTagUrl("design", "en"), "/tags/design/");
    assertEquals(getTagUrl("design", "fr"), "/fr/tags/design/");
    assertEquals(getTagUrl("design", "zhHans"), "/zh-hans/tags/design/");
  });
});

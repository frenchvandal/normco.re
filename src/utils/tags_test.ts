import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import { getAntdTagColor, getTagColor, getTagSlug, getTagUrl } from "./tags.ts";

describe("tags taxonomy utilities", () => {
  it("slugifies tag labels for taxonomy routes", () => {
    assertEquals(getTagSlug("Alibaba Cloud"), "alibaba-cloud");
    assertEquals(getTagSlug("Crème brûlée"), "creme-brulee");
  });

  it("keeps the shared tag accent restrained and consistent", () => {
    assertEquals(getTagColor("design"), "blue");
    assertEquals(getTagColor("github-actions"), "blue");
    assertEquals(getTagColor("design"), getAntdTagColor("design"));
  });

  it("keeps the Ant Design tag accent aligned with the editorial tag accent", () => {
    assertEquals(getAntdTagColor("design"), "blue");
    assertEquals(getAntdTagColor("github-actions"), "blue");
    assertEquals(getAntdTagColor("design"), getTagColor("design"));
  });

  it("builds localized tag URLs with the plural basename", () => {
    assertEquals(getTagUrl("design", "en"), "/tags/design/");
    assertEquals(getTagUrl("design", "fr"), "/fr/tags/design/");
    assertEquals(getTagUrl("design", "zhHans"), "/zh-hans/tags/design/");
  });
});

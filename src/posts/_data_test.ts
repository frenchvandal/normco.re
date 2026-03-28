import { assert, assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import { jsonLd, layout, type } from "./_data.ts";

describe("src/posts/_data.ts", () => {
  it("exports the post type and layout", () => {
    assertEquals(type, "post");
    assertEquals(layout, "layouts/post.tsx");
  });

  it("exports BlogPosting structured data", () => {
    assert(jsonLd && typeof jsonLd === "object");
    const data = jsonLd as unknown as Record<string, unknown>;
    assertEquals(data["@type"], "BlogPosting");
    assertEquals(data.mainEntityOfPage, "=url");
    assertEquals(data.datePublished, "=date");
    assertEquals(data.dateModified, "=update_date || =date");
  });
});

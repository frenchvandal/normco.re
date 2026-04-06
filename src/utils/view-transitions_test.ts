import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import { resolvePostTitleViewTransitionName } from "./view-transitions.ts";

describe("resolvePostTitleViewTransitionName()", () => {
  it("builds a stable transition name for canonical post routes", () => {
    assertEquals(
      resolvePostTitleViewTransitionName("/posts/hello-world/"),
      "post-title-posts-hello-world",
    );
  });

  it("keeps localized post routes distinct", () => {
    assertEquals(
      resolvePostTitleViewTransitionName("/fr/posts/bonjour-le-monde/"),
      "post-title-fr-posts-bonjour-le-monde",
    );
  });

  it("ignores non-post-detail routes", () => {
    assertEquals(resolvePostTitleViewTransitionName("/posts/"), undefined);
    assertEquals(resolvePostTitleViewTransitionName("/about/"), undefined);
  });

  it("normalizes unsafe path characters", () => {
    assertEquals(
      resolvePostTitleViewTransitionName("/posts/Hello, World!/"),
      "post-title-posts-hello-world",
    );
  });
});

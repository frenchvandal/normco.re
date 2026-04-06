import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import {
  renderViewTransitionNameAttribute,
  resolvePostTitleViewTransitionAttributes,
  resolvePostTitleViewTransitionName,
  VIEW_TRANSITION_NAME_ATTRIBUTE,
} from "./view-transitions.ts";

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

  it("exposes a shared data-attribute contract for post title transitions", () => {
    assertEquals(
      resolvePostTitleViewTransitionAttributes("/posts/hello-world/"),
      {
        [VIEW_TRANSITION_NAME_ATTRIBUTE]: "post-title-posts-hello-world",
      },
    );
  });
});

describe("renderViewTransitionNameAttribute()", () => {
  it("serializes the shared data attribute for HTML renderers", () => {
    assertEquals(
      renderViewTransitionNameAttribute("post-title-posts-hello-world"),
      ' data-view-transition-name="post-title-posts-hello-world"',
    );
  });

  it("omits the attribute when no transition name exists", () => {
    assertEquals(renderViewTransitionNameAttribute(undefined), "");
  });
});

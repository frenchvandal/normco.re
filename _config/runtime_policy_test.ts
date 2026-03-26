import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import {
  isImageAsset,
  isScriptAsset,
  isStylesheetAsset,
  SCOPED_UPDATE_MATCHERS,
  shouldRunPostBuildTasks,
} from "./runtime_policy.ts";

describe("runtime policy", () => {
  it("skips post-build tasks during serve mode", () => {
    assertEquals(shouldRunPostBuildTasks(true), false);
    assertEquals(shouldRunPostBuildTasks(false), true);
  });

  it("defines scoped update matchers for styles, scripts, and images", () => {
    assertEquals(SCOPED_UPDATE_MATCHERS.length, 3);
    assertEquals(isStylesheetAsset("/style.css"), true);
    assertEquals(isStylesheetAsset("/posts/example.md"), false);
    assertEquals(isScriptAsset("/scripts/header-client.js"), true);
    assertEquals(isScriptAsset("/scripts/sw.ts"), false);
    assertEquals(isImageAsset("/static/logo.svg"), true);
    assertEquals(isImageAsset("/api/posts/index.json"), false);
  });
});

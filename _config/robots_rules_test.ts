import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import { buildRobotsRules } from "./robots_rules.ts";

describe("buildRobotsRules()", () => {
  it("keeps offline disallow rules aligned with the supported language set", () => {
    const offlineRules = buildRobotsRules()
      .filter((rule): rule is { disallow: string } =>
        typeof rule.disallow === "string" && rule.disallow.includes("offline")
      )
      .map((rule) => rule.disallow);

    assertEquals(offlineRules, [
      "/offline",
      "/offline/",
      "/offline.html",
      "/fr/offline",
      "/fr/offline/",
      "/zh-hans/offline",
      "/zh-hans/offline/",
      "/zh-hant/offline",
      "/zh-hant/offline/",
    ]);
  });
});

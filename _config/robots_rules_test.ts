import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import { buildRobotsRules, ROBOTS_CONTENT_SIGNAL } from "./robots_rules.ts";

describe("buildRobotsRules()", () => {
  it("keeps offline disallow rules aligned with the supported language set", () => {
    const offlineDisallows = buildRobotsRules()
      .flatMap((rule) =>
        Array.isArray(rule.disallow) ? rule.disallow : rule.disallow ?? []
      )
      .filter((path) => path.includes("offline"));

    assertEquals(offlineDisallows, [
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

  it("declares one grouped wildcard rule followed by the content signal", () => {
    const rules = buildRobotsRules();
    const wildcardRule = rules.find((rule) => rule.userAgent === "*");

    assertEquals(wildcardRule?.allow, "/");
    assertEquals(rules.at(-1), { contentSignal: ROBOTS_CONTENT_SIGNAL });
    assertEquals(
      rules.every((rule) => rule.sitemap === undefined),
      true,
      "the Sitemap line is owned by the sitemap plugin",
    );
  });
});

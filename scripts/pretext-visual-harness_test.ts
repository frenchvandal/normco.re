import { assertEquals, assertStringIncludes, assertThrows } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import {
  buildPretextVisualHarnessScenarios,
  buildPretextVisualHarnessStem,
  resolvePlaywrightChromiumExecutablePath,
  resolveStaticSiteContentType,
  resolveStaticSiteRelativePath,
} from "./pretext-visual-harness.ts";
import { withTempDir, writeTextTree } from "../test/temp_fs.ts";

describe("buildPretextVisualHarnessScenarios()", () => {
  it("covers the public routes, the browser probe route, four languages, and both viewports", () => {
    const scenarios = buildPretextVisualHarnessScenarios();

    assertEquals(scenarios.length, 40);
    assertEquals(
      scenarios.filter((scenario) => scenario.routeKind === "archive").length,
      8,
    );
    assertEquals(
      scenarios.filter((scenario) => scenario.routeKind === "probe").length,
      8,
    );
    assertEquals(
      scenarios.filter((scenario) => scenario.language === "zhHans").length,
      10,
    );
    assertEquals(
      scenarios.filter((scenario) => scenario.viewportId === "desktop").length,
      20,
    );
    assertEquals(
      scenarios.find((scenario) => scenario.stem === "tag-fr-mobile")?.pathname,
      "/fr/tags/software/",
    );
    assertEquals(
      scenarios.find((scenario) => scenario.stem === "post-zh-hans-desktop")
        ?.pathname,
      "/zh-hans/posts/alibaba-cloud-oss-cdn-deployment/",
    );
    assertEquals(
      scenarios.find((scenario) => scenario.stem === "probe-en-desktop")
        ?.pathname,
      "/pretext/probe/",
    );
  });
});

describe("buildPretextVisualHarnessStem()", () => {
  it("uses stable route, language-code, and viewport identifiers", () => {
    assertEquals(
      buildPretextVisualHarnessStem("archive", "zhHant", "desktop"),
      "archive-zh-hant-desktop",
    );
  });
});

describe("resolveStaticSiteRelativePath()", () => {
  it("maps clean URLs and explicit assets into _site-relative file paths", () => {
    assertEquals(resolveStaticSiteRelativePath("/"), "index.html");
    assertEquals(resolveStaticSiteRelativePath("/posts"), "posts/index.html");
    assertEquals(
      resolveStaticSiteRelativePath("/fr/posts/"),
      "fr/posts/index.html",
    );
    assertEquals(
      resolveStaticSiteRelativePath("/styles/blog-antd.css"),
      "styles/blog-antd.css",
    );
  });

  it("rejects traversal attempts even when they are URL-encoded", () => {
    assertThrows(
      () => resolveStaticSiteRelativePath("/../../secret.txt"),
      Error,
      "Refusing to serve path outside the static output",
    );
    assertThrows(
      () => resolveStaticSiteRelativePath("/%2e%2e/%2e%2e/secret.txt"),
      Error,
      "Refusing to serve path outside the static output",
    );
  });
});

describe("resolveStaticSiteContentType()", () => {
  it("returns useful content-types for html and css assets", () => {
    assertStringIncludes(
      resolveStaticSiteContentType("index.html"),
      "text/html",
    );
    assertStringIncludes(
      resolveStaticSiteContentType("styles/blog-antd.css"),
      "text/css",
    );
  });
});

describe("resolvePlaywrightChromiumExecutablePath()", () => {
  it("prefers the headless-shell executable when both Chromium layouts exist", async () => {
    await withTempDir("pretext-harness-browser-", async (rootDir) => {
      await writeTextTree(rootDir, {
        "chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing":
          "",
        "chromium_headless_shell-1217/chrome-headless-shell-mac-arm64/chrome-headless-shell":
          "",
      });

      assertEquals(
        await resolvePlaywrightChromiumExecutablePath(rootDir),
        `${rootDir}/chromium_headless_shell-1217/chrome-headless-shell-mac-arm64/chrome-headless-shell`,
      );
    });
  });
});

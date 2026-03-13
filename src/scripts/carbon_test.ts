import { assert, assertEquals, assertNotMatch, assertThrows } from "jsr/assert";
import {
  CARBON_COMPONENTS_BASE_URL,
  getCarbonComponentUrl,
  SELECTIVE_CARBON_COMPONENTS,
} from "./carbon.js";

Deno.test("carbon bootstrap uses browser-resolvable Carbon module URLs", () => {
  assertEquals(CARBON_COMPONENTS_BASE_URL, "/scripts/carbon-vendor");
  assertNotMatch(
    CARBON_COMPONENTS_BASE_URL,
    /(?:https?:\/\/|npm\/|jsr:|node:)/,
  );
  // 10 entries (cds-button removed in P5-S21, cds-switcher* removed in P5-S22, low-ROI editorial primitives removed in P5-S20)
  assertEquals(SELECTIVE_CARBON_COMPONENTS.length, 10);
  const entryUrls = new Set<string>();

  for (const { modulePath } of SELECTIVE_CARBON_COMPONENTS) {
    const moduleUrl = getCarbonComponentUrl(modulePath);
    entryUrls.add(moduleUrl);

    assert(
      moduleUrl === `/scripts/carbon-vendor/${modulePath}`,
      `Expected local self-hosted module URL for ${modulePath}`,
    );
    assert(
      !moduleUrl.includes("http://") &&
        !moduleUrl.includes("https://") &&
        !moduleUrl.includes("npm/") &&
        !moduleUrl.includes("jsr:") &&
        !moduleUrl.includes("node:"),
      `Unexpected non-browser import prefix in URL for ${modulePath}`,
    );
  }

  assertEquals(entryUrls.size, SELECTIVE_CARBON_COMPONENTS.length);
  assert(
    !SELECTIVE_CARBON_COMPONENTS.some(({ selector }) =>
      selector === "cds-link" || selector === "cds-tag" ||
      selector === "cds-breadcrumb" || selector === "cds-breadcrumb-item" ||
      selector === "cds-button" || selector === "cds-switcher" ||
      selector === "cds-switcher-item"
    ),
    "Expected low-ROI editorial Carbon primitives, cds-button, and cds-switcher* to be removed from selective bootstrap",
  );
});

Deno.test("carbon bootstrap rejects invalid component module paths", () => {
  assertThrows(
    () => getCarbonComponentUrl(""),
    Error,
    "Invalid path",
  );
});

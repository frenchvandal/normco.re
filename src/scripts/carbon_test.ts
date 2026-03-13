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
  // 13 entries (no duplicates after P5-S20 cleanup)
  assertEquals(SELECTIVE_CARBON_COMPONENTS.length, 13);
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
      selector === "cds-breadcrumb" || selector === "cds-breadcrumb-item"
    ),
    "Expected low-ROI editorial Carbon primitives to be removed from selective bootstrap",
  );
});

Deno.test("carbon bootstrap rejects invalid component module paths", () => {
  assertThrows(
    () => getCarbonComponentUrl(""),
    Error,
    "Invalid path",
  );
});

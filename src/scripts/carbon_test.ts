import { assert, assertEquals, assertMatch, assertNotMatch } from "jsr/assert";
import {
  CARBON_COMPONENTS_BASE_URL,
  getCarbonComponentUrl,
  SELECTIVE_CARBON_COMPONENTS,
} from "./carbon.js";

Deno.test("carbon bootstrap uses browser-resolvable Carbon module URLs", () => {
  assertMatch(
    CARBON_COMPONENTS_BASE_URL,
    /https:\/\/unpkg\.com\/@carbon\/web-components@2\.50\.0\/es\/components/,
  );
  assertNotMatch(CARBON_COMPONENTS_BASE_URL, /(?:npm\/|jsr:|node:)/);
  assertEquals(SELECTIVE_CARBON_COMPONENTS.length, 17);

  for (const { modulePath } of SELECTIVE_CARBON_COMPONENTS) {
    const moduleUrl = getCarbonComponentUrl(modulePath);

    assert(
      moduleUrl.startsWith("https://"),
      `Expected HTTPS module URL for ${modulePath}`,
    );
    assert(
      moduleUrl.endsWith("?module"),
      `Expected ?module suffix for ${modulePath}`,
    );
    assert(
      !moduleUrl.includes("npm/") &&
        !moduleUrl.includes("jsr:") &&
        !moduleUrl.includes("node:"),
      `Unexpected non-browser import prefix in URL for ${modulePath}`,
    );
  }
});

import { assert, assertEquals, assertMatch } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import {
  CARBON_COMPONENTS_BASE_URL,
  getCarbonComponentUrl,
  SELECTIVE_CARBON_COMPONENTS,
} from "./carbon.js";

const EXPECTED_COMPONENT_MODULE_PATHS = [
  "ui-shell/header.js",
  "ui-shell/header-menu-button.js",
  "ui-shell/header-nav.js",
  "ui-shell/header-nav-item.js",
  "ui-shell/header-global-action.js",
  "ui-shell/header-panel.js",
  "ui-shell/switcher.js",
  "ui-shell/switcher-item.js",
  "button/button.js",
  "link/link.js",
  "tag/tag.js",
  "breadcrumb/breadcrumb.js",
  "breadcrumb/breadcrumb-item.js",
  "copy-button/copy-button.js",
  "ui-shell/side-nav.js",
  "ui-shell/side-nav-items.js",
  "ui-shell/side-nav-link.js",
] as const;

describe("carbon bootstrap", () => {
  it("uses browser-compatible Carbon module URLs", () => {
    assertMatch(
      CARBON_COMPONENTS_BASE_URL,
      /https:\/\/cdn\.jsdelivr\.net\/npm\/@carbon\/web-components@2\.50\.0\/es\/components/,
    );
    const resolvedPaths = new Set(
      SELECTIVE_CARBON_COMPONENTS.map(({ modulePath }) => modulePath),
    );

    assertEquals(resolvedPaths.size, EXPECTED_COMPONENT_MODULE_PATHS.length);

    for (const componentPath of EXPECTED_COMPONENT_MODULE_PATHS) {
      assert(
        resolvedPaths.has(componentPath),
        `Missing Carbon component import path: ${componentPath}`,
      );
      assert(
        getCarbonComponentUrl(componentPath).startsWith(
          CARBON_COMPONENTS_BASE_URL,
        ),
        `Unexpected Carbon module URL for: ${componentPath}`,
      );
    }
  });
});

import {
  assertEquals,
  assertNotEquals,
  assertStringIncludes,
} from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import layoutStyles from "../styles/layout.css" with { type: "text" };
import postStyles from "../styles/components/post.css" with { type: "text" };
import postMobileToolsScript from "../scripts/post-mobile-tools.js" with {
  type: "text",
};

import {
  FEATURE_RAIL_BREAKPOINT,
  HEADER_NAV_BREAKPOINT,
  PAGEHEAD_CONTEXT_BREAKPOINT,
  POST_MOBILE_TOOLS_MAX_WIDTH,
  POST_MOBILE_TOOLS_MEDIA_QUERY,
  POST_RAIL_BREAKPOINT,
} from "./layout-breakpoints.ts";

describe("layout breakpoints", () => {
  it("keeps the intentionally different viewport and rail thresholds named", () => {
    assertEquals(POST_RAIL_BREAKPOINT, FEATURE_RAIL_BREAKPOINT);
    assertNotEquals(HEADER_NAV_BREAKPOINT, FEATURE_RAIL_BREAKPOINT);
    assertEquals(
      POST_MOBILE_TOOLS_MEDIA_QUERY,
      `(max-width: ${POST_MOBILE_TOOLS_MAX_WIDTH})`,
    );
  });

  it("keeps layout CSS and the mobile tools script aligned with the shared values", () => {
    assertStringIncludes(
      layoutStyles,
      `@container (min-width: ${PAGEHEAD_CONTEXT_BREAKPOINT})`,
    );
    assertStringIncludes(
      layoutStyles,
      `@container (min-width: ${FEATURE_RAIL_BREAKPOINT})`,
    );
    assertStringIncludes(
      layoutStyles,
      `@media (min-width: ${HEADER_NAV_BREAKPOINT})`,
    );
    assertStringIncludes(
      postStyles,
      `@media ${POST_MOBILE_TOOLS_MEDIA_QUERY}`,
    );
    assertStringIncludes(
      postMobileToolsScript,
      `const POST_MOBILE_TOOLS_MAX_WIDTH = "${POST_MOBILE_TOOLS_MAX_WIDTH}";`,
    );
    assertStringIncludes(
      postMobileToolsScript,
      "const MOBILE_MEDIA_QUERY = `(max-width: ${POST_MOBILE_TOOLS_MAX_WIDTH})`;",
    );
  });
});

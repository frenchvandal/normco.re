import {
  assertEquals,
  assertNotEquals,
  assertStringIncludes,
} from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import blogAntdStyles from "../styles/blog-antd.css" with { type: "text" };
import layoutStyles from "../styles/layout.css" with { type: "text" };
import postStyles from "../styles/components/post.css" with { type: "text" };
import aboutStyles from "../styles/components/about.css" with { type: "text" };
import headerStyles from "../styles/components/header.css" with {
  type: "text",
};
import postMobileToolsScript from "../scripts/post-mobile-tools.js" with {
  type: "text",
};
import aboutContactToggletipsScript from "../scripts/about-contact-toggletips.js" with {
  type: "text",
};
import headerClientInitScript from "../scripts/header-client/init.js" with {
  type: "text",
};

import {
  ABOUT_PICTOGRAM_TABLET_MAX_WIDTH,
  FEATURE_RAIL_BREAKPOINT,
  GALLERY_FOUR_COLUMN_BREAKPOINT,
  GALLERY_THREE_COLUMN_BREAKPOINT,
  GALLERY_TWO_COLUMN_MAX_WIDTH,
  HEADER_NAV_BREAKPOINT,
  HEADER_NAV_MAX_WIDTH,
  MOBILE_VIEWPORT_MAX_WIDTH,
  MOBILE_VIEWPORT_MEDIA_QUERY,
  PAGEHEAD_CONTEXT_BREAKPOINT,
  POST_MOBILE_TOOLS_MAX_WIDTH,
  POST_MOBILE_TOOLS_MEDIA_QUERY,
  POST_RAIL_BREAKPOINT,
  STORY_GRID_TWO_COLUMN_BREAKPOINT,
  STORY_GRID_TWO_COLUMN_CONTAINER_QUERY,
  STORY_GRID_TWO_COLUMN_MEDIA_QUERY,
} from "./layout-breakpoints.ts";

describe("layout breakpoints", () => {
  it("keeps the intentionally different viewport and rail thresholds named", () => {
    assertEquals(POST_RAIL_BREAKPOINT, FEATURE_RAIL_BREAKPOINT);
    assertNotEquals(HEADER_NAV_BREAKPOINT, FEATURE_RAIL_BREAKPOINT);
    assertNotEquals(STORY_GRID_TWO_COLUMN_BREAKPOINT, FEATURE_RAIL_BREAKPOINT);
    assertEquals(
      POST_MOBILE_TOOLS_MEDIA_QUERY,
      `(max-width: ${POST_MOBILE_TOOLS_MAX_WIDTH})`,
    );
    assertEquals(
      STORY_GRID_TWO_COLUMN_MEDIA_QUERY,
      `(min-width: ${STORY_GRID_TWO_COLUMN_BREAKPOINT})`,
    );
    assertEquals(
      STORY_GRID_TWO_COLUMN_CONTAINER_QUERY,
      `(min-width: ${STORY_GRID_TWO_COLUMN_BREAKPOINT})`,
    );
    assertEquals(
      MOBILE_VIEWPORT_MEDIA_QUERY,
      `(max-width: ${MOBILE_VIEWPORT_MAX_WIDTH})`,
    );
  });

  it("keeps layout CSS and the mobile tools script aligned with the shared values", () => {
    assertStringIncludes(
      blogAntdStyles,
      `@media ${STORY_GRID_TWO_COLUMN_MEDIA_QUERY}`,
    );
    assertStringIncludes(
      blogAntdStyles,
      `@container ${STORY_GRID_TWO_COLUMN_CONTAINER_QUERY}`,
    );
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

  it("aligns the archive layout max-width with the shared header-nav threshold", () => {
    assertStringIncludes(
      blogAntdStyles,
      `@media (max-width: ${HEADER_NAV_MAX_WIDTH})`,
    );
  });

  it("aligns the gallery column escalation with the shared gallery thresholds", () => {
    assertStringIncludes(
      blogAntdStyles,
      `@media (min-width: ${GALLERY_THREE_COLUMN_BREAKPOINT})`,
    );
    assertStringIncludes(
      blogAntdStyles,
      `@media (min-width: ${GALLERY_FOUR_COLUMN_BREAKPOINT})`,
    );
    assertStringIncludes(
      blogAntdStyles,
      `@media (min-width: ${STORY_GRID_TWO_COLUMN_BREAKPOINT}) and (max-width: ${GALLERY_TWO_COLUMN_MAX_WIDTH})`,
    );
  });

  it("aligns the about pictogram tablet range with the shared bounds", () => {
    assertStringIncludes(
      aboutStyles,
      `@media (min-width: ${STORY_GRID_TWO_COLUMN_BREAKPOINT}) and (max-width: ${ABOUT_PICTOGRAM_TABLET_MAX_WIDTH})`,
    );
  });

  it("aligns mobile-viewport CSS surfaces with the shared mobile threshold", () => {
    assertStringIncludes(
      layoutStyles,
      `@media ${MOBILE_VIEWPORT_MEDIA_QUERY}`,
    );
    assertStringIncludes(
      aboutStyles,
      `@media ${MOBILE_VIEWPORT_MEDIA_QUERY}`,
    );
    assertStringIncludes(
      headerStyles,
      `@media ${MOBILE_VIEWPORT_MEDIA_QUERY}`,
    );
  });

  it("aligns the JS mobile-viewport literals with the shared TS constant", () => {
    assertStringIncludes(
      aboutContactToggletipsScript,
      `const MOBILE_MEDIA_QUERY = "${MOBILE_VIEWPORT_MEDIA_QUERY}";`,
    );
    assertStringIncludes(
      headerClientInitScript,
      `const MOBILE_PANEL_MEDIA_QUERY = "${MOBILE_VIEWPORT_MEDIA_QUERY}";`,
    );
  });
});

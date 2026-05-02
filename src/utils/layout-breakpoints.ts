export const PAGEHEAD_CONTEXT_BREAKPOINT = "52rem";
export const STORY_GRID_TWO_COLUMN_BREAKPOINT = "48rem";
export const STORY_GRID_TWO_COLUMN_MEDIA_QUERY =
  `(min-width: ${STORY_GRID_TWO_COLUMN_BREAKPOINT})`;
export const STORY_GRID_TWO_COLUMN_CONTAINER_QUERY =
  `(min-width: ${STORY_GRID_TWO_COLUMN_BREAKPOINT})`;
export const HEADER_NAV_BREAKPOINT = "64rem";
// Complement of HEADER_NAV_BREAKPOINT used by the archive layout to relax
// padding and switch the sticky nav presentation when the header collapses.
export const HEADER_NAV_MAX_WIDTH = "63.999rem";
export const FEATURE_RAIL_BREAKPOINT = "66rem";
export const POST_RAIL_BREAKPOINT = FEATURE_RAIL_BREAKPOINT;
// Keep the post mobile tools query on the classic max-width syntax so Safari
// reliably applies the floating controls and loader gate on narrow viewports.
export const POST_MOBILE_TOOLS_MAX_WIDTH = "65.99rem";
export const POST_MOBILE_TOOLS_MEDIA_QUERY =
  `(max-width: ${POST_MOBILE_TOOLS_MAX_WIDTH})`;
// Shared mobile-viewport threshold consumed by the footer column stack, the
// header drawer panel, the about contact toggletip → modal flip, and the
// header-client mobile panel runtime. Keep aligned with both CSS literals and
// the JS string constants.
export const MOBILE_VIEWPORT_MAX_WIDTH = "47.999rem";
export const MOBILE_VIEWPORT_MEDIA_QUERY =
  `(max-width: ${MOBILE_VIEWPORT_MAX_WIDTH})`;
// Gallery column escalation:
//   < 48rem            → 1 column (implicit)
//   48rem  – 71.999rem → 2 columns (GALLERY_TWO_COLUMN_MAX_WIDTH)
//   72rem  – 89.999rem → 3 columns (GALLERY_THREE_COLUMN_BREAKPOINT)
//   90rem +            → 4 columns (GALLERY_FOUR_COLUMN_BREAKPOINT)
// The 72rem and 90rem breakpoints also gate the archive nav layout switch.
export const GALLERY_TWO_COLUMN_MAX_WIDTH = "71.999rem";
export const GALLERY_THREE_COLUMN_BREAKPOINT = "72rem";
export const GALLERY_FOUR_COLUMN_BREAKPOINT = "90rem";
// Tablet range for the about pictogram frame. Pairs with
// STORY_GRID_TWO_COLUMN_BREAKPOINT (`48rem` min) to bound the medium-width
// pictogram layout.
export const ABOUT_PICTOGRAM_TABLET_MAX_WIDTH = "75.999rem";

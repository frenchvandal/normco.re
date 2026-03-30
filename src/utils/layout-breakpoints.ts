export const PAGEHEAD_CONTEXT_BREAKPOINT = "52rem";
export const HEADER_NAV_BREAKPOINT = "64rem";
export const FEATURE_RAIL_BREAKPOINT = "66rem";
export const POST_RAIL_BREAKPOINT = FEATURE_RAIL_BREAKPOINT;
// Keep the post mobile tools query on the classic max-width syntax so Safari
// reliably applies the floating controls and loader gate on narrow viewports.
export const POST_MOBILE_TOOLS_MAX_WIDTH = "65.99rem";
export const POST_MOBILE_TOOLS_MEDIA_QUERY =
  `(max-width: ${POST_MOBILE_TOOLS_MAX_WIDTH})`;

import type { Options as PurgeCssOptions } from "lume/plugins/purgecss.ts";

export const PURGECSS_CONTENT_EXTENSIONS = [
  ".html",
  ".js",
  ".xml",
  ".xsl",
] as const;

const PURGECSS_SAFE_SELECTOR_PATTERNS = [
  /\[aria-(?:checked|current|expanded)="(?:true|page)"\]/,
  /\[data-copy-notice-state="(?:copied|error)"\]/,
  /data-post-mobile-tools-ready/,
  /\[data-search-notification-tone="(?:info|warning)"\]/,
  /\[data-(?:color-mode|theme-preference)=/,
  /feed-copy-control--(?:copied|error)/,
  /pagefind-ui__(?:hidden|suppressed)/,
  /site-popover--open/,
] as const;

const PURGECSS_SAFE_KEYFRAMES = ["ph-spin"] as const;

export function createPurgeCssOptions(): PurgeCssOptions {
  return {
    contentExtensions: [...PURGECSS_CONTENT_EXTENSIONS],
    options: {
      safelist: {
        standard: [...PURGECSS_SAFE_SELECTOR_PATTERNS],
        keyframes: [...PURGECSS_SAFE_KEYFRAMES],
      },
    },
  };
}

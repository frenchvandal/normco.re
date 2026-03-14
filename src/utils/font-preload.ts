/**
 * Identifies critical font files from the google_fonts plugin output and
 * returns their URLs for `<link rel="preload">` injection.
 *
 * Instead of hardcoding font file paths (which depend on the naming convention
 * of the google_fonts plugin and may change), this module discovers font pages
 * at build time and selects the subset most critical for initial rendering.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert/equals";
 *
 * const urls = [
 *   "/fonts/ibm-plexsans-100-normal-400-latin.woff2",
 *   "/fonts/ibm-plexsans-100-normal-600-latin.woff2",
 *   "/fonts/ibm-plexsans-100-normal-400-latin-ext.woff2",
 *   "/fonts/ibm-plexmono-100-normal-400-latin.woff2",
 * ];
 *
 * const critical = selectCriticalFontUrls(urls);
 * assertEquals(critical, [
 *   "/fonts/ibm-plexsans-100-normal-400-latin.woff2",
 *   "/fonts/ibm-plexsans-100-normal-600-latin.woff2",
 * ]);
 * ```
 */
export function selectCriticalFontUrls(
  fontUrls: ReadonlyArray<string>,
): ReadonlyArray<string> {
  return fontUrls.filter((url) => CRITICAL_FONT_PATTERN.test(url)).sort();
}

// Matches IBM Plex Sans, latin subset (not latin-ext), weights 400 and 600.
// These are the only fonts needed above the fold: body text (400) and headings
// (600). Mono and italic variants load lazily via @font-face when needed.
const CRITICAL_FONT_PATTERN =
  /\/ibm-plex.*sans.*-(?:normal|regular)-(?:400|600)-latin\.woff2$/;

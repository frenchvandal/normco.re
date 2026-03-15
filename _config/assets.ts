/** Asset registration — scripts, stylesheets, and static files. */

import type Site from "lume/core/site.ts";

/** Register all site assets so Lume discovers them before processors run. */
export function registerAssets(site: Site): void {
  // Main stylesheet (Sass entry point — compiled to /style.css by Lume Sass plugin)
  site.add("/style.scss");

  // Client-side scripts
  site.add("/scripts/theme-toggle.js");
  site.add("/scripts/disclosure-controls.js");
  site.add("/scripts/anti-flash.js");
  site.add("/scripts/language-preference.js");
  site.add("/scripts/feed-copy.js");
  site.add("/scripts/post-code-copy.js");
  site.add("/scripts/link-prefetch-intent.js");
  site.add("/scripts/sw-register.js");
  site.add("/scripts/archive-year-nav.js");
  site.add("/scripts/pagefind-lazy-init.js");

  // Service worker — served from root, not /scripts/
  site.add("/scripts/sw.js", "/sw.js");

  // XSLT stylesheets for XML feed/sitemap rendering
  site.add("/feed.xsl");
  site.add("/sitemap.xsl");
}

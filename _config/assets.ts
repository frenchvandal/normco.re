/** Asset registration — scripts, stylesheets, and static files. */

import type Site from "lume/core/site.ts";

/** Register all site assets so Lume discovers them before processors run. */
export function registerAssets(site: Site): void {
  // Pure static files (favicons, PWA icons, QR codes, etc.) live under
  // /src/static and are copied verbatim to the site root. Ignore the source
  // folder during the normal scan so the extension-based image add below does
  // not emit duplicate /static/* copies.
  site.ignore("/static");
  site.copy("/static", ".");

  // Editorial images referenced from Markdown posts.
  site.add([
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".avif",
    ".gif",
    ".svg",
  ]);

  // Main stylesheet entry point.
  site.add("/style.css");

  // Client-side scripts
  site.add("/scripts/header-client.js");
  site.add("/scripts/about-contact-toggletips.js");
  site.add("/scripts/language-preference.js");
  site.add("/scripts/feed-copy.js");
  site.add("/scripts/post-code-copy.js");
  site.add("/scripts/surface-controls.js");
  site.add("/scripts/link-prefetch-intent.js");
  site.add("/scripts/sw-register.js");

  // Service worker — served from root, not /scripts/
  site.add("/scripts/sw.js", "/sw.js");
}

import type Site from "lume/core/site.ts";

export function registerAssets(site: Site): void {
  // Pure static files (favicons, PWA icons, QR codes, etc.) live under
  // /src/static and are copied verbatim to the site root. Ignore the source
  // folder during the normal scan so the extension-based image add below does
  // not emit duplicate /static/* copies.
  site.ignore("/static");
  site.ignore("/blog/client/node_modules");
  site.copy("/static", ".");

  site.add([
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".avif",
    ".gif",
    ".svg",
  ]);

  site.add("/style.css");
  site.add("/styles/blog-antd.css");

  site.add("/scripts/header-client.js");
  site.add("/scripts/header-client/init.js");
  site.add("/scripts/header-client/search.js");
  site.add("/scripts/header-client/theme.js");
  site.add("/scripts/about-contact-toggletips.js");
  site.add("/scripts/language-preference.js");
  site.add("/scripts/feed-copy.js");
  site.add("/scripts/post-code-copy.js");
  site.add("/scripts/surface-controls.js");
  site.add("/scripts/link-prefetch-intent.js");
  site.add("/scripts/sw-register.js");
  site.add("/blog/client/archive-main.tsx", "/scripts/blog-antd-archive.js");

  // The service worker must be served from the site root to control the whole
  // origin, so its built asset is remapped out of `/scripts/`.
  site.add("/scripts/sw.js", "/sw.js");
}

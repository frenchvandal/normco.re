import type Site from "lume/core/site.ts";

const OPTIMIZED_ROOT_IMAGE_ASSETS = [
  "android-chrome-192x192.png",
  "android-chrome-512x512.png",
  "apple-touch-icon-120x120.png",
  "apple-touch-icon-152x152.png",
  "apple-touch-icon-167x167.png",
  "apple-touch-icon.png",
  "favicon.svg",
] as const;

export function registerAssets(site: Site): void {
  // Pure static files live under /src/static. Route the icons that influence
  // the critical path through Lume's optimization pipeline while keeping the
  // rest copied to the same public URLs.
  site.ignore("/static");
  site.ignore("/blog/client/node_modules");

  site.copy("/static/contact", "/contact");
  site.copy("/static/favicon.ico", "/favicon.ico");
  site.add("/static/icons/simpleicons/rss.svg", "/icons/simpleicons/rss.svg");

  for (const asset of OPTIMIZED_ROOT_IMAGE_ASSETS) {
    site.add(`/static/${asset}`, `/${asset}`);
  }

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
  site.add("/scripts/post-mobile-tools-loader.js");
  site.add("/scripts/post-mobile-tools.js");
  site.add("/scripts/pretext-browser-probe.js");
  site.add("/scripts/link-prefetch-intent.js");
  site.add("/scripts/sw-register.js");

  // The service worker must be served from the site root to control the whole
  // origin, so its built asset is remapped out of `/scripts/`.
  site.add("/scripts/sw.js", "/sw.js");
}

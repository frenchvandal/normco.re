// @ts-check
/// <reference lib="webworker" />

/** @type {ServiceWorkerGlobalScope} */
const sw = /** @type {ServiceWorkerGlobalScope} */ (
  /** @type {unknown} */ (self)
);

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const SW_URL = new URL(sw.location.href);
const SW_VERSION = SW_URL.searchParams.get("v") ?? "__SW_VERSION__";
const SW_DEBUG_LEVEL = SW_URL.searchParams.get("debug") ?? "off";
const STATIC_CACHE = `static-${SW_VERSION}`;
const PAGE_CACHE = `pages-${SW_VERSION}`;
const FEED_CACHE = `feeds-${SW_VERSION}`;

const OFFLINE_URL_BY_LANGUAGE = {
  en: "/offline/",
  fr: "/fr/offline/",
  zhHans: "/zh-hans/offline/",
  zhHant: "/zh-hant/offline/",
};

const OFFLINE_FALLBACK_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Offline — normco.re</title>
  </head>
  <body>
    <main>
      <h1>Offline</h1>
      <p>The site is temporarily unavailable. Please retry when a connection is restored.</p>
      <p><a href="/">Back to home</a></p>
    </main>
  </body>
</html>`;

const STATIC_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/favicon.svg",
  "/apple-touch-icon-120x120.png",
  "/apple-touch-icon-152x152.png",
  "/apple-touch-icon-167x167.png",
  "/apple-touch-icon.png",
  "/android-chrome-192x192.png",
  "/android-chrome-512x512.png",
  "/style.css",
  "/scripts/header-client.js",
  "/scripts/header-client/init.js",
  "/scripts/header-client/search.js",
  "/scripts/header-client/theme.js",
  "/scripts/language-preference.js",
  "/scripts/feed-copy.js",
  "/scripts/post-code-copy.js",
  "/scripts/surface-controls.js",
  "/scripts/link-prefetch-intent.js",
  "/atom.xml",
  "/rss.xml",
  "/feed.json",
  "/discovery/",
  "/sitemap.xml",
  "/fr/atom.xml",
  "/fr/rss.xml",
  "/fr/feed.json",
  "/fr/discovery/",
  "/zh-hans/atom.xml",
  "/zh-hans/rss.xml",
  "/zh-hans/feed.json",
  "/zh-hans/discovery/",
  "/zh-hant/atom.xml",
  "/zh-hant/rss.xml",
  "/zh-hant/feed.json",
  "/zh-hant/discovery/",
  OFFLINE_URL_BY_LANGUAGE.en,
  OFFLINE_URL_BY_LANGUAGE.fr,
  OFFLINE_URL_BY_LANGUAGE.zhHans,
  OFFLINE_URL_BY_LANGUAGE.zhHant,
];

const FEED_TTL_MS = 30 * 60 * 1000;
const HTML_CONTENT_TYPE = "text/html; charset=UTF-8";
const TEXT_CONTENT_TYPE = "text/plain; charset=UTF-8";

const KNOWN_BOT_PATTERN =
  /Googlebot|Bingbot|DuckDuckBot|YandexBot|Baiduspider|Applebot|PetalBot/i;

// ---------------------------------------------------------------------------
// Logging
// ---------------------------------------------------------------------------

/**
 * @param {string} event
 * @param {Record<string, unknown>} [details]
 * @returns {void}
 */
function logSw(event, details = {}) {
  if (SW_DEBUG_LEVEL !== "summary" && SW_DEBUG_LEVEL !== "verbose") {
    return;
  }

  console.info("[SW]", event, {
    version: SW_VERSION,
    debug: SW_DEBUG_LEVEL,
    ...details,
  });
}

// ---------------------------------------------------------------------------
// Lifecycle: install → activate → message
// ---------------------------------------------------------------------------

/**
 * Populates the static cache without aborting installation if one request
 * fails transiently. `Cache.addAll()` rejects the whole batch on the first
 * network error, which makes service worker installation unnecessarily brittle.
 *
 * @returns {Promise<void>}
 */
async function precacheStaticAssets() {
  const cache = await caches.open(STATIC_CACHE);
  /** @type {{ url: string; error: string }[]} */
  const failures = [];

  await Promise.all(
    STATIC_ASSETS.map(async (url) => {
      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        await cache.put(url, response.clone());
      } catch (error) {
        failures.push({
          url,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }),
  );

  logSw("install: precache complete", {
    cachedAssets: STATIC_ASSETS.length - failures.length,
    failedAssets: failures,
  });
}

sw.addEventListener(
  "install",
  /** @param {ExtendableEvent} event */ (event) => {
    logSw("install", {
      staticCache: STATIC_CACHE,
      assets: STATIC_ASSETS.length,
    });

    event.waitUntil((async () => {
      await precacheStaticAssets();
      await sw.skipWaiting();
    })());
  },
);

sw.addEventListener(
  "activate",
  /** @param {ExtendableEvent} event */ (event) => {
    logSw("activate", {
      staticCache: STATIC_CACHE,
      pageCache: PAGE_CACHE,
      feedCache: FEED_CACHE,
    });

    event.waitUntil((async () => {
      const keys = await caches.keys();
      const staleKeys = keys.filter((key) =>
        ![STATIC_CACHE, PAGE_CACHE, FEED_CACHE].includes(key)
      );

      logSw("activate: pruning stale caches", {
        staleKeys,
        cacheCountBefore: keys.length,
      });

      await Promise.all(staleKeys.map((key) => caches.delete(key)));
      await sw.clients.claim();
    })());
  },
);

sw.addEventListener(
  "message",
  /** @param {ExtendableMessageEvent} event */ (event) => {
    if (event.data?.type === "SKIP_WAITING") {
      logSw("message: SKIP_WAITING");
      void sw.skipWaiting();
    }
  },
);

// ---------------------------------------------------------------------------
// Fetch: routing and cache strategies
// ---------------------------------------------------------------------------

/**
 * @param {Request} request
 * @returns {boolean}
 */
function shouldBypassRequest(request) {
  const userAgent = request.headers.get("user-agent") ?? "";

  if (KNOWN_BOT_PATTERN.test(userAgent)) {
    return true;
  }

  if (request.method !== "GET") {
    return true;
  }

  const url = new URL(request.url);

  if (url.origin !== sw.location.origin) {
    return true;
  }

  return false;
}

/**
 * @param {string} pathname
 * @returns {"en" | "fr" | "zhHans" | "zhHant"}
 */
function resolveLanguageByPathname(pathname) {
  if (pathname.startsWith("/fr/")) {
    return "fr";
  }

  if (pathname.startsWith("/zh-hans/")) {
    return "zhHans";
  }

  if (pathname.startsWith("/zh-hant/")) {
    return "zhHant";
  }

  return "en";
}

/**
 * @param {string|null} cachedAtHeader
 * @returns {number}
 */
function parseCachedAtHeader(cachedAtHeader) {
  const parsed = Number(cachedAtHeader ?? "0");
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Cache-first strategy for static assets (CSS, JS, images, fonts).
 *
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);

  if (cached !== undefined) {
    return cached;
  }

  const response = await fetch(request);

  if (response.ok) {
    await cache.put(request, response.clone());
  }

  return response;
}

/**
 * Network-first strategy for HTML pages with multilingual offline fallback.
 *
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function networkFirstPage(request) {
  const cache = await caches.open(PAGE_CACHE);

  try {
    const response = await fetch(request);

    if (response.ok) {
      await cache.put(request, response.clone());
    }

    return response;
  } catch {
    const cached = await cache.match(request);

    if (cached !== undefined) {
      return cached;
    }

    const requestUrl = new URL(request.url);
    const staticCache = await caches.open(STATIC_CACHE);
    const fallbackLanguage = resolveLanguageByPathname(requestUrl.pathname);
    const offlinePath = OFFLINE_URL_BY_LANGUAGE[fallbackLanguage] ??
      OFFLINE_URL_BY_LANGUAGE.en;
    const offlinePage = await staticCache.match(offlinePath);

    if (offlinePage !== undefined) {
      return offlinePage;
    }

    return new Response(OFFLINE_FALLBACK_HTML, {
      headers: { "content-type": HTML_CONTENT_TYPE },
      status: 503,
      statusText: "Service Unavailable",
    });
  }
}

/**
 * Stale-while-revalidate strategy for feeds with a 30-minute TTL.
 *
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function staleWhileRevalidateFeed(request) {
  const cache = await caches.open(FEED_CACHE);
  const cached = await cache.match(request);

  const refreshPromise = fetch(request)
    .then(async (networkResponse) => {
      if (networkResponse.ok) {
        const headers = new Headers(networkResponse.headers);
        headers.set("x-sw-cached-at", Date.now().toString());

        const body = await networkResponse.clone().blob();
        await cache.put(
          request,
          new Response(body, {
            status: networkResponse.status,
            statusText: networkResponse.statusText,
            headers,
          }),
        );
      }

      return networkResponse;
    })
    .catch(() => undefined);

  if (cached !== undefined) {
    const cachedAt = parseCachedAtHeader(cached.headers.get("x-sw-cached-at"));
    const isFresh = Date.now() - cachedAt < FEED_TTL_MS;

    if (!isFresh) {
      await refreshPromise;
    } else {
      void refreshPromise;
    }

    return cached;
  }

  const networkResponse = await refreshPromise;

  if (networkResponse !== undefined) {
    return networkResponse;
  }

  return new Response("Feed unavailable while offline.", {
    status: 503,
    statusText: "Service Unavailable",
    headers: { "content-type": TEXT_CONTENT_TYPE },
  });
}

sw.addEventListener("fetch", /** @param {FetchEvent} event */ (event) => {
  const { request } = event;

  if (SW_DEBUG_LEVEL === "verbose") {
    logSw("fetch", {
      method: request.method,
      destination: request.destination,
      mode: request.mode,
      url: request.url,
    });
  }

  if (shouldBypassRequest(request)) {
    return;
  }

  const url = new URL(request.url);

  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request));
    return;
  }

  const isFeedRoute = url.pathname.endsWith("/atom.xml") ||
    url.pathname.endsWith("/rss.xml") ||
    url.pathname.endsWith("/feed.json");

  if (isFeedRoute) {
    event.respondWith(staleWhileRevalidateFeed(request));
    return;
  }

  if (url.pathname.startsWith("/pagefind/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  const isStaticAsset = url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.endsWith(".avif") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".jpeg");

  if (isStaticAsset) {
    event.respondWith(cacheFirst(request));
  }
});

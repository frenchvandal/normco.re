// @ts-check
/// <reference lib="webworker" />

import { SITE_NAME } from "../utils/site-identity.ts";
import { fetchWithTimeout } from "./shared/network-utils.js";
import { PRECACHED_SCRIPT_ASSET_URLS } from "../utils/script-assets.ts";

/** @type {ServiceWorkerGlobalScope} */
const sw = /** @type {ServiceWorkerGlobalScope} */ (
  /** @type {unknown} */ (self)
);

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const SW_URL = new URL(sw.location.href);
const SW_VERSION = SW_URL.searchParams.get("v") ?? "__SW_VERSION__";
const STATIC_CACHE = `static-${SW_VERSION}`;
const PAGE_CACHE = `pages-${SW_VERSION}`;
const FEED_CACHE = `feeds-${SW_VERSION}`;
const PAGEFIND_CACHE = `pagefind-${SW_VERSION}`;
const ALLOWED_SW_DEBUG_LEVELS = new Set(["off", "summary", "verbose"]);

/**
 * @param {string | null} value
 * @returns {"off" | "summary" | "verbose"}
 */
function resolveSwDebugLevel(value) {
  return typeof value === "string" && ALLOWED_SW_DEBUG_LEVELS.has(value)
    ? /** @type {"off" | "summary" | "verbose"} */ (value)
    : "off";
}

const SW_DEBUG_LEVEL = resolveSwDebugLevel(SW_URL.searchParams.get("debug"));

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
    <title>Offline — ${SITE_NAME}</title>
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
  "/critical/about.css",
  "/critical/archive.css",
  "/critical/home.css",
  "/critical/post.css",
  "/critical/syndication.css",
  "/critical/tag.css",
  ...PRECACHED_SCRIPT_ASSET_URLS,
  "/feed.atom",
  "/feed.xml",
  "/feed.json",
  "/sitemap.xml",
  "/fr/feed.atom",
  "/fr/feed.xml",
  "/fr/feed.json",
  "/zh-hans/feed.atom",
  "/zh-hans/feed.xml",
  "/zh-hans/feed.json",
  "/zh-hant/feed.atom",
  "/zh-hant/feed.xml",
  "/zh-hant/feed.json",
  OFFLINE_URL_BY_LANGUAGE.en,
  OFFLINE_URL_BY_LANGUAGE.fr,
  OFFLINE_URL_BY_LANGUAGE.zhHans,
  OFFLINE_URL_BY_LANGUAGE.zhHant,
];

const HTML_CONTENT_TYPE = "text/html; charset=UTF-8";
const TEXT_CONTENT_TYPE = "text/plain; charset=UTF-8";
const PRECACHE_FETCH_TIMEOUT_MS = 8_000;
const STATIC_FETCH_TIMEOUT_MS = 5_000;
const PAGE_NETWORK_TIMEOUT_MS = 5_000;
const FEED_NETWORK_TIMEOUT_MS = 5_000;
const FEED_CACHE_TTL_MS = 30 * 60 * 1_000;
const PAGEFIND_NETWORK_TIMEOUT_MS = 3_000;

// Hashed Pagefind asset filenames carry the content hash inside the basename
// (`<lang>_<hash>.pf_meta`, `.pf_fragment`, `.pf_index`), so a content change
// always produces a new URL — `cacheFirst` is safe. Stable-named runtime files
// (`pagefind.js`, `pagefind-entry.json`, `pagefind-ui.js`, `wasm.<lang>.pagefind`,
// etc.) keep the same URL across deploys, so they need network-first refresh.
const HASHED_PAGEFIND_PATTERN = /\.pf_(?:meta|fragment|index)$/;

const KNOWN_BOT_PATTERN =
  /Googlebot|Bingbot|DuckDuckBot|YandexBot|Baiduspider|Applebot|PetalBot/i;
const LOCAL_DEVELOPMENT_HOST_PATTERN =
  /^(localhost|127(?:\.\d{1,3}){3}|\[::1\]|0\.0\.0\.0)$/i;
const IS_LOCAL_DEVELOPMENT_HOST = LOCAL_DEVELOPMENT_HOST_PATTERN.test(
  SW_URL.hostname,
);

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
        const response = await fetchWithTimeout(
          url,
          undefined,
          PRECACHE_FETCH_TIMEOUT_MS,
        );

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
    if (IS_LOCAL_DEVELOPMENT_HOST) {
      logSw("install: localhost detected -> skipping precache");
      event.waitUntil(sw.skipWaiting());
      return;
    }

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
    if (IS_LOCAL_DEVELOPMENT_HOST) {
      event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
        await sw.registration.unregister();
      })());
      return;
    }

    logSw("activate", {
      staticCache: STATIC_CACHE,
      pageCache: PAGE_CACHE,
      feedCache: FEED_CACHE,
      pagefindCache: PAGEFIND_CACHE,
    });

    event.waitUntil((async () => {
      if (
        sw.registration.navigationPreload &&
        typeof sw.registration.navigationPreload.enable === "function"
      ) {
        try {
          await sw.registration.navigationPreload.enable();
          logSw("activate: navigation preload enabled");
        } catch (error) {
          logSw("activate: navigation preload unavailable", {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      const keys = await caches.keys();
      const staleKeys = keys.filter((key) =>
        ![STATIC_CACHE, PAGE_CACHE, FEED_CACHE, PAGEFIND_CACHE].includes(key)
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

  const response = await fetchWithTimeout(
    request,
    undefined,
    STATIC_FETCH_TIMEOUT_MS,
  );

  if (response.ok) {
    await cache.put(request, response.clone());
  }

  return response;
}

/**
 * Cache-first strategy for hashed Pagefind assets (`.pf_meta`, `.pf_fragment`,
 * `.pf_index`). Their filenames embed a content hash, so a stale cache entry
 * only ever wins when the URL hasn't changed.
 *
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function cacheFirstPagefind(request) {
  const cache = await caches.open(PAGEFIND_CACHE);
  const cached = await cache.match(request);

  if (cached !== undefined) {
    return cached;
  }

  const response = await fetchWithTimeout(
    request,
    undefined,
    STATIC_FETCH_TIMEOUT_MS,
  );

  if (response.ok) {
    await cache.put(request, response.clone());
  }

  return response;
}

/**
 * Network-first strategy for stable-named Pagefind runtime assets
 * (`pagefind.js`, `pagefind-entry.json`, `pagefind-ui.{js,css}`,
 * `wasm.<lang>.pagefind`, …). Their filenames stay the same across rebuilds so
 * a deploy can change their bytes — refresh from the network with a short
 * timeout and fall back to the cached copy when offline.
 *
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function networkFirstPagefind(request) {
  const cache = await caches.open(PAGEFIND_CACHE);

  try {
    const response = await fetchWithTimeout(
      request,
      undefined,
      PAGEFIND_NETWORK_TIMEOUT_MS,
    );

    if (response.ok) {
      await cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    const cached = await cache.match(request);

    if (cached !== undefined) {
      return cached;
    }

    throw error;
  }
}

/**
 * Network-first strategy for HTML pages with multilingual offline fallback.
 *
 * @param {Request} request
 * @param {Promise<Response | undefined> | undefined} preloadResponsePromise
 * @returns {Promise<Response>}
 */
async function networkFirstPage(request, preloadResponsePromise) {
  const cache = await caches.open(PAGE_CACHE);

  try {
    const preloadedResponse = preloadResponsePromise === undefined
      ? undefined
      : await preloadResponsePromise.catch(() => undefined);

    if (preloadedResponse instanceof Response) {
      if (preloadedResponse.ok) {
        await cache.put(request, preloadedResponse.clone());
      }

      return preloadedResponse;
    }

    const response = await fetchWithTimeout(
      request,
      undefined,
      PAGE_NETWORK_TIMEOUT_MS,
    );

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

  const refreshPromise = fetchWithTimeout(
    request,
    undefined,
    FEED_NETWORK_TIMEOUT_MS,
  )
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
    const cachedAt = Number.parseInt(
      cached.headers.get("x-sw-cached-at") ?? "",
      10,
    );
    const cacheAge = Number.isFinite(cachedAt)
      ? Date.now() - cachedAt
      : Number.POSITIVE_INFINITY;

    if (cacheAge <= FEED_CACHE_TTL_MS) {
      return cached;
    }

    const networkResponse = await refreshPromise;

    if (networkResponse !== undefined) {
      return networkResponse;
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

  if (IS_LOCAL_DEVELOPMENT_HOST) {
    return;
  }

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
    event.respondWith(
      networkFirstPage(
        request,
        "preloadResponse" in event ? event.preloadResponse : undefined,
      ),
    );
    return;
  }

  const isFeedRoute = url.pathname.endsWith("/feed.atom") ||
    url.pathname.endsWith("/feed.xml") ||
    url.pathname.endsWith("/feed.json");

  if (isFeedRoute) {
    event.respondWith(staleWhileRevalidateFeed(request));
    return;
  }

  if (url.pathname.startsWith("/pagefind/")) {
    if (HASHED_PAGEFIND_PATTERN.test(url.pathname)) {
      event.respondWith(cacheFirstPagefind(request));
    } else {
      event.respondWith(networkFirstPagefind(request));
    }
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

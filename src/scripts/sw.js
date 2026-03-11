// @ts-check
/// <reference lib="webworker" />

/** @type {ServiceWorkerGlobalScope} */
const sw = /** @type {ServiceWorkerGlobalScope} */ (
  /** @type {unknown} */ (self)
);

const SW_QUERY = new URL(sw.location.href).searchParams;
const SW_VERSION = SW_QUERY.get("v") ?? "dev";
const SW_DEBUG_LEVEL = SW_QUERY.get("debug") ?? "off";
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
  `/style.css?v=${SW_VERSION}`,
  `/scripts/theme-toggle.js?v=${SW_VERSION}`,
  `/scripts/anti-flash.js?v=${SW_VERSION}`,
  `/scripts/language-preference.js?v=${SW_VERSION}`,
  `/scripts/feed-copy.js?v=${SW_VERSION}`,
  "/feed.xml",
  "/feed.json",
  "/fr/feed.xml",
  "/fr/feed.json",
  "/zh-hans/feed.xml",
  "/zh-hans/feed.json",
  "/zh-hant/feed.xml",
  "/zh-hant/feed.json",
  OFFLINE_URL_BY_LANGUAGE.en,
  OFFLINE_URL_BY_LANGUAGE.fr,
  OFFLINE_URL_BY_LANGUAGE.zhHans,
  OFFLINE_URL_BY_LANGUAGE.zhHant,
];

const FEED_TTL_MS = 30 * 60 * 1000;
const MAX_PREDICTED_ROUTES = 3;
const MIN_TRANSITION_HITS = 2;
const MAX_TRACKED_ROUTES = 60;
const MAX_TRANSITIONS_PER_ROUTE = 12;

/** @type {Map<string, Map<string, number>>} */
const navigationTransitions = new Map();

// Secondary UA-based safeguard. Most search engine crawlers (including
// Googlebot) bypass service workers entirely at the browser level, so this
// check is belt-and-suspenders rather than the primary defense. Do not rely
// on this alone for cache isolation — HTTPS is the real guard against
// in-transit modification.
const KNOWN_BOT_PATTERN =
  /Googlebot|Bingbot|DuckDuckBot|YandexBot|Baiduspider|Applebot|PetalBot/i;

function isSwDebugEnabled() {
  return SW_DEBUG_LEVEL === "summary" || SW_DEBUG_LEVEL === "verbose";
}

/**
 * @param {string} event
 * @param {Record<string, unknown>} [details]
 * @returns {void}
 */
function logSw(event, details = {}) {
  if (!isSwDebugEnabled()) {
    return;
  }

  console.info("[SW]", event, {
    version: SW_VERSION,
    debug: SW_DEBUG_LEVEL,
    ...details,
  });
}

/**
 * Normalizes the route key used by the predictive preloading model.
 *
 * @param {URL} url
 * @returns {string}
 */
function getRouteKey(url) {
  return `${url.pathname}${url.search}`;
}

/**
 * Prunes transition history to keep memory usage bounded.
 *
 * @param {string} fromRoute
 * @param {Map<string, number>} transitionsFromRoute
 * @returns {void}
 */
function pruneTransitionHistory(fromRoute, transitionsFromRoute) {
  if (transitionsFromRoute.size > MAX_TRANSITIONS_PER_ROUTE) {
    const sortedTransitions = Array.from(transitionsFromRoute.entries())
      .sort(([, leftHits], [, rightHits]) => rightHits - leftHits)
      .slice(0, MAX_TRANSITIONS_PER_ROUTE);

    navigationTransitions.set(fromRoute, new Map(sortedTransitions));
  }

  if (navigationTransitions.size > MAX_TRACKED_ROUTES) {
    const trackedRoutes = Array.from(navigationTransitions.entries());

    for (
      const [staleRoute] of trackedRoutes.slice(
        0,
        trackedRoutes.length - MAX_TRACKED_ROUTES,
      )
    ) {
      navigationTransitions.delete(staleRoute);
    }
  }
}

/**
 * Stores the observed navigation transition from one route to another.
 *
 * @param {string} fromRoute
 * @param {string} toRoute
 * @returns {void}
 */
function recordNavigationTransition(fromRoute, toRoute) {
  const transitionsFromRoute = navigationTransitions.get(fromRoute) ??
    new Map();
  const currentHitCount = transitionsFromRoute.get(toRoute) ?? 0;

  transitionsFromRoute.set(toRoute, currentHitCount + 1);
  navigationTransitions.set(fromRoute, transitionsFromRoute);
  pruneTransitionHistory(fromRoute, transitionsFromRoute);
}

/**
 * Returns the most likely next routes for a given route.
 *
 * @param {string} route
 * @returns {ReadonlyArray<string>}
 */
function getPredictedRoutes(route) {
  const transitionsFromRoute = navigationTransitions.get(route);

  if (transitionsFromRoute === undefined) {
    return [];
  }

  const rankedRoutes = Array.from(transitionsFromRoute.entries())
    .filter(([, hits]) => hits >= MIN_TRANSITION_HITS)
    .sort(([, leftHits], [, rightHits]) => rightHits - leftHits)
    .slice(0, MAX_PREDICTED_ROUTES)
    .map(([nextRoute]) => nextRoute);

  return rankedRoutes;
}

/**
 * Preloads predicted pages using the page cache.
 *
 * @param {URL} currentUrl
 * @returns {Promise<void>}
 */
async function preloadPredictedPages(currentUrl) {
  const currentRoute = getRouteKey(currentUrl);
  const predictedRoutes = getPredictedRoutes(currentRoute);

  if (predictedRoutes.length === 0) {
    return;
  }

  const pageCache = await caches.open(PAGE_CACHE);

  await Promise.all(predictedRoutes.map(async (predictedRoute) => {
    if (predictedRoute === currentRoute) {
      return;
    }

    const predictedUrl = new URL(predictedRoute, sw.location.origin);
    const predictedRequest = new Request(predictedUrl.toString(), {
      method: "GET",
      mode: "same-origin",
      credentials: "same-origin",
      headers: { accept: "text/html" },
    });

    const cachedResponse = await pageCache.match(predictedRequest);

    if (cachedResponse !== undefined) {
      return;
    }

    try {
      const networkResponse = await fetch(predictedRequest);

      if (networkResponse.ok) {
        await pageCache.put(predictedRequest, networkResponse.clone());
        logSw("predictive-preload: cached", { route: predictedRoute });
      }
    } catch {
      logSw("predictive-preload: skipped (network failure)", {
        route: predictedRoute,
      });
    }
  }));
}

sw.addEventListener(
  "install",
  /** @param {ExtendableEvent} event */ (event) => {
    logSw("install", {
      staticCache: STATIC_CACHE,
      assets: STATIC_ASSETS.length,
    });
    event.waitUntil((async () => {
      const cache = await caches.open(STATIC_CACHE);
      await cache.addAll(STATIC_ASSETS);
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

/**
 * Returns true when the current request should bypass Service Worker caching.
 *
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

  const ignoredSearchParams = [
    /^utm_/,
    /^fbclid$/,
    /^gclid$/,
    /^mc_eid$/,
    /^mc_cid$/,
  ];

  for (const [key] of url.searchParams.entries()) {
    if (ignoredSearchParams.some((pattern) => pattern.test(key))) {
      return true;
    }
  }

  return false;
}

/**
 * Resolves language by pathname prefix.
 *
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
 * Uses cache-first for static immutable assets.
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
 * Uses network-first for HTML navigation with offline fallback.
 *
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function networkFirstPage(request) {
  const cache = await caches.open(PAGE_CACHE);
  const requestUrl = new URL(request.url);
  const refererHeader = request.headers.get("referer");

  if (refererHeader !== null && URL.canParse(refererHeader)) {
    const refererUrl = new URL(refererHeader);

    if (refererUrl.origin === requestUrl.origin) {
      recordNavigationTransition(
        getRouteKey(refererUrl),
        getRouteKey(requestUrl),
      );
    }
  }

  try {
    const response = await fetch(request);

    if (response.ok) {
      await cache.put(request, response.clone());
      void preloadPredictedPages(requestUrl);
    }

    return response;
  } catch {
    const cached = await cache.match(request);

    if (cached !== undefined) {
      return cached;
    }

    const staticCache = await caches.open(STATIC_CACHE);
    const fallbackLanguage = resolveLanguageByPathname(requestUrl.pathname);
    const offlinePath = OFFLINE_URL_BY_LANGUAGE[fallbackLanguage] ??
      OFFLINE_URL_BY_LANGUAGE.en;
    const offlinePage = await staticCache.match(offlinePath);

    if (offlinePage !== undefined) {
      return offlinePage;
    }

    return new Response(OFFLINE_FALLBACK_HTML, {
      headers: { "content-type": "text/html; charset=utf-8" },
      status: 503,
      statusText: "Service Unavailable",
    });
  }
}

/**
 * Uses stale-while-revalidate for feeds with a soft TTL.
 *
 * Feed responses are cached with a custom `x-sw-cached-at` header and served
 * until the TTL expires. No content-integrity verification is performed beyond
 * what HTTPS provides — a compromised network could inject a malicious feed
 * response that remains cached until eviction. The HTTPS transport is the
 * primary guard against in-transit modification.
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
    const cachedAt = Number(cached.headers.get("x-sw-cached-at") ?? "0");
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
    headers: { "content-type": "text/plain; charset=utf-8" },
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
  const isStaticAsset = url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.endsWith(".avif") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".jpeg");

  const isFeedRoute = url.pathname.endsWith("/feed.xml") ||
    url.pathname.endsWith("/feed.json");

  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request));
    return;
  }

  if (isFeedRoute) {
    event.respondWith(staleWhileRevalidateFeed(request));
    return;
  }

  if (isStaticAsset) {
    event.respondWith(cacheFirst(request));
  }
});

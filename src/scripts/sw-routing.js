// @ts-check
/// <reference lib="webworker" />

/** @type {ServiceWorkerGlobalScope & { __swRuntime?: Record<string, unknown> }} */
const sw =
  /** @type {ServiceWorkerGlobalScope & { __swRuntime?: Record<string, unknown> }} */ (
    /** @type {unknown} */ (self)
  );

const runtime = sw.__swRuntime;

if (runtime === undefined) {
  throw new Error("SW runtime is not initialized. Load /sw-core.js first.");
}

const {
  SW_DEBUG_LEVEL,
  STATIC_CACHE,
  PAGE_CACHE,
  FEED_CACHE,
  FEED_TTL_MS,
  OFFLINE_URL_BY_LANGUAGE,
  OFFLINE_FALLBACK_HTML,
  KNOWN_BOT_PATTERN,
  logSw,
  getRouteKey,
  recordNavigationTransition,
  preloadPredictedPages,
} = /** @type {{
  SW_DEBUG_LEVEL: string;
  STATIC_CACHE: string;
  PAGE_CACHE: string;
  FEED_CACHE: string;
  FEED_TTL_MS: number;
  OFFLINE_URL_BY_LANGUAGE: Record<"en" | "fr" | "zhHans" | "zhHant", string>;
  OFFLINE_FALLBACK_HTML: string;
  KNOWN_BOT_PATTERN: RegExp;
  logSw: (event: string, details?: Record<string, unknown>) => void;
  getRouteKey: (url: URL) => string;
  recordNavigationTransition: (fromRoute: string, toRoute: string) => void;
  preloadPredictedPages: (currentUrl: URL) => Promise<void>;
}} */
  (runtime);

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

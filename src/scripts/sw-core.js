// @ts-check
/// <reference lib="webworker" />

/** @type {ServiceWorkerGlobalScope & { __swRuntime?: Record<string, unknown> }} */
const sw =
  /** @type {ServiceWorkerGlobalScope & { __swRuntime?: Record<string, unknown> }} */ (
    /** @type {unknown} */ (self)
  );

const SW_URL = new URL(sw.location.href);
const SW_QUERY = SW_URL.searchParams;
const SW_VERSION = SW_QUERY.get("v") ?? "__SW_VERSION__";
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
  "/style.css",
  "/scripts/theme-toggle.js",
  "/scripts/anti-flash.js",
  "/scripts/language-preference.js",
  "/scripts/feed-copy.js",
  "/scripts/post-code-copy.js",
  "/scripts/link-prefetch-intent.js",
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
const BLOCKED_EFFECTIVE_CONNECTION_TYPES = ["slow-2g", "2g"];
/**
 * @typedef {{
 *   readonly saveData?: boolean;
 *   readonly effectiveType?: string;
 * }} NetworkInformationLike
 */

/** @type {Map<string, Map<string, number>>} */
const navigationTransitions = new Map();

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
 * @param {URL} url
 * @returns {string}
 */
function getRouteKey(url) {
  return `${url.pathname}${url.search}`;
}

/**
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
 * @param {string} route
 * @returns {ReadonlyArray<string>}
 */
function getPredictedRoutes(route) {
  const transitionsFromRoute = navigationTransitions.get(route);

  if (transitionsFromRoute === undefined) {
    return [];
  }

  return Array.from(transitionsFromRoute.entries())
    .filter(([, hits]) => hits >= MIN_TRANSITION_HITS)
    .sort(([, leftHits], [, rightHits]) => rightHits - leftHits)
    .slice(0, MAX_PREDICTED_ROUTES)
    .map(([nextRoute]) => nextRoute);
}

/**
 * @returns {boolean}
 */
function shouldPreloadPredictedPages() {
  const navigatorWithConnection =
    /** @type {WorkerNavigator & { readonly connection?: unknown }} */ (
      sw.navigator
    );
  const connectionCandidate = navigatorWithConnection.connection;

  if (
    typeof connectionCandidate !== "object" || connectionCandidate === null
  ) {
    return true;
  }

  const connection =
    /** @type {NetworkInformationLike} */ (connectionCandidate);
  const effectiveType = connection.effectiveType;

  if (connection.saveData) {
    logSw("predictive-preload: disabled (Save-Data enabled)");
    return false;
  }

  if (
    typeof effectiveType === "string" &&
    BLOCKED_EFFECTIVE_CONNECTION_TYPES.includes(effectiveType)
  ) {
    logSw("predictive-preload: disabled (slow effectiveType)", {
      effectiveType,
    });
    return false;
  }

  return true;
}

/**
 * @param {URL} currentUrl
 * @returns {Promise<void>}
 */
async function preloadPredictedPages(currentUrl) {
  if (!shouldPreloadPredictedPages()) {
    return;
  }

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

sw.__swRuntime = {
  sw,
  SW_VERSION,
  SW_DEBUG_LEVEL,
  STATIC_CACHE,
  PAGE_CACHE,
  FEED_CACHE,
  OFFLINE_URL_BY_LANGUAGE,
  OFFLINE_FALLBACK_HTML,
  STATIC_ASSETS,
  FEED_TTL_MS,
  KNOWN_BOT_PATTERN,
  logSw,
  getRouteKey,
  recordNavigationTransition,
  preloadPredictedPages,
};

import type Lume from "lume/mod.ts";

/**
 * Service Worker Generator
 *
 * Generates a service worker that provides offline support and faster repeat visits.
 *
 * Features:
 * - Pre-caches all pages and static assets (CSS, JS, fonts, images, uploads, pagefind)
 * - Network-first strategy for navigation (always fresh HTML, offline fallback)
 * - Cache-first strategy for versioned assets (CSS, JS)
 * - Stale-while-revalidate for images, fonts, and pagefind (fast loads, background updates)
 * - Automatic cache invalidation on new builds via versioned cache names
 * - Notifies clients when a new version is activated (for update toasts)
 * - Supports prefetch requests from the client
 *
 * The cache version is tied to the buildId (git commit SHA or timestamp),
 * ensuring users get fresh content after each deployment.
 */
export const layout = false;
export const url = "/sw.js";
export const contentType = "application/javascript";

interface ServiceWorkerData extends Lume.Data {
  buildId?: string;
  search: Lume.Data["search"];
}

const collectCoreAssets = (search: Lume.Data["search"]): string[] => {
  // Start with critical assets that are always present
  // Pagefind files are generated after build, so we add them manually
  // /offline/ is the fallback page for navigation failures
  const assets = new Set<string>([
    "/",
    "/offline/",
    "/pagefind/pagefind-ui.css",
    "/pagefind/pagefind-ui.js",
    "/pagefind/pagefind.js",
  ]);

  // Add all pages
  for (const page of search.pages()) {
    if (page.url) {
      assets.add(page.url);
    }
  }

  // Add static assets (CSS, JS, fonts, images, uploads, pagefind)
  // Patterns must match the output file paths
  const assetPatterns = [
    "/*.css",
    "/js/*.js",
    "/fonts/**/*",
    "/*.png",
    "/*.ico",
    "/*.svg",
    "/*.webp",
    "/**/*.woff",
    "/**/*.woff2",
    "/pagefind/*.css",
    "/pagefind/*.js",
    "/uploads/**/*",
  ];

  for (const pattern of assetPatterns) {
    for (const file of search.files(pattern)) {
      assets.add(file);
    }
  }

  return Array.from(assets).sort();
};

export default function (
  { buildId, search }: ServiceWorkerData,
): string {
  const version = buildId ?? "dev";
  const coreAssets = collectCoreAssets(search);

  return `/**
 * Service Worker for normco.re
 *
 * Caching strategies:
 * - Navigation (HTML): network-first (fresh content, offline fallback)
 * - CSS, JS: cache-first (consistent versioned assets)
 * - Images, fonts, pagefind: stale-while-revalidate (fast loads, background updates)
 *
 * Cache invalidation: new builds create a new versioned cache,
 * old caches are deleted on activation.
 */

const CACHE_PREFIX = "normcore-assets";
const CACHE_VERSION = "${version}";
const CACHE_NAME = \`\${CACHE_PREFIX}-\${CACHE_VERSION}\`;
const CORE_ASSETS = ${JSON.stringify(coreAssets)};
const OFFLINE_URL = "/offline/";

/**
 * Checks if request is for pagefind search assets.
 */
const isPagefindRequest = (url) => url.pathname.startsWith("/pagefind/");

/**
 * Determines if a request should be cached.
 * Only caches same-origin GET requests for assets, pagefind, and uploads.
 */
const isCacheableRequest = (request, url) => {
  if (request.method !== "GET") {
    return false;
  }

  if (url.origin !== self.location.origin) {
    return false;
  }

  const destinations = new Set(["style", "script", "image", "font"]);
  if (destinations.has(request.destination)) {
    return true;
  }

  // Also cache pagefind and uploads
  return url.pathname.startsWith("/pagefind/") ||
    url.pathname.startsWith("/uploads/");
};

/**
 * Determines if a request should use stale-while-revalidate.
 * Used for images and fonts where showing stale content briefly is acceptable.
 */
const shouldUseStaleWhileRevalidate = (request) => {
  const { destination } = request;
  return destination === "image" || destination === "font";
};

/**
 * Cache-first strategy: return cached response if available, otherwise fetch.
 * Used for static assets that rarely change within a build version.
 * Gracefully handles network errors by returning cached content when available.
 */
const cacheFirst = async (request) => {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Network failed and no cache available - rethrow
    throw error;
  }
};

/**
 * Stale-while-revalidate strategy: return cached response immediately,
 * then update cache in the background from network.
 * Best for assets where freshness is nice but not critical (images, fonts, pagefind).
 */
const staleWhileRevalidate = async (request) => {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  // Fetch in background to update cache
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  // Return cached immediately if available, otherwise wait for network
  if (cached) {
    return cached;
  }

  const response = await fetchPromise;
  if (response) {
    return response;
  }

  return new Response("Offline", { status: 503 });
};

/**
 * Network-first strategy: fetch from network, fall back to cache if offline.
 * Used for navigation to ensure users see fresh content when online.
 * Supports an optional fallback URL (e.g., offline page) when both network and cache fail.
 */
const networkFirst = async (request, fallbackUrl) => {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    if (fallbackUrl) {
      const fallback = await cache.match(fallbackUrl);
      if (fallback) {
        return fallback;
      }
    }
    throw error;
  }
};

// Message handler for skipWaiting and prefetch requests from client
self.addEventListener("message", (event) => {
  const { data } = event;
  if (!data || typeof data !== "object") {
    return;
  }

  if (data.type === "skipWaiting") {
    self.skipWaiting();
    return;
  }

  if (data.type === "prefetch" && Array.isArray(data.urls)) {
    const urls = data.urls
      .map((url) => {
        try {
          return new URL(url, self.location.origin);
        } catch {
          return null;
        }
      })
      .filter((url) => url && url.origin === self.location.origin)
      .map((url) => url.pathname);

    if (!urls.length) {
      return;
    }

    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) =>
        Promise.all(
          urls.map(async (url) => {
            try {
              const response = await fetch(url);
              if (response.ok) {
                await cache.put(url, response.clone());
              }
            } catch {
              // Ignore prefetch failures
            }
          }),
        )
      ),
    );
  }
});

// Install: pre-cache all core assets and activate immediately
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).then(() =>
      self.skipWaiting()
    ),
  );
});

// Activate: clean up old caches and notify clients of update
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) =>
            key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME
          )
          .map((key) => caches.delete(key)),
      )
    ).then(() => self.clients.claim()).then(() => {
      // Notify all clients that a new version is active
      self.clients.matchAll({ type: "window" }).then((clients) => {
        for (const client of clients) {
          client.postMessage({ type: "SW_UPDATED", version: CACHE_VERSION });
        }
      });
    }),
  );
});

// Fetch: route requests to appropriate caching strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Navigation: network-first with offline fallback
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, OFFLINE_URL));
    return;
  }

  const url = new URL(request.url);

  // Pagefind: stale-while-revalidate for fast search
  if (isPagefindRequest(url)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Cacheable assets: choose strategy based on type
  if (isCacheableRequest(request, url)) {
    if (shouldUseStaleWhileRevalidate(request)) {
      // Images and fonts: stale-while-revalidate for fast loads with background updates
      event.respondWith(staleWhileRevalidate(request));
    } else {
      // CSS, JS: cache-first for consistent versioned assets
      event.respondWith(cacheFirst(request));
    }
  }
});
`;
}

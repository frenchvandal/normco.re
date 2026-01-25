/**
 * Service Worker
 * Caches core assets and refreshes cache on new builds.
 */
export const layout = false;
export const url = "/sw.js";
export const contentType = "application/javascript";

export default function ({ buildId }: Lume.Data) {
  const version = buildId || "dev";

  return `const CACHE_PREFIX = "normcore-assets";
const CACHE_VERSION = "${version}";
const CACHE_NAME = \`\${CACHE_PREFIX}-\${CACHE_VERSION}\`;
const CORE_ASSETS = [
  "/",
  "/styles.css",
  "/js/main.js",
  "/favicon.png",
  "/pagefind/pagefind-ui.css",
  "/pagefind/pagefind-ui.js",
];

const isCacheableRequest = (request) => {
  if (request.method !== "GET") {
    return false;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return false;
  }

  const destinations = new Set(["style", "script", "image", "font"]);
  if (destinations.has(request.destination)) {
    return true;
  }

  return url.pathname.startsWith("/pagefind/");
};

const cacheFirst = async (request) => {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
  }
  return response;
};

const networkFirst = async (request) => {
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
    throw error;
  }
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).then(() =>
      self.skipWaiting()
    ),
  );
});

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
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isCacheableRequest(request)) {
    event.respondWith(cacheFirst(request));
  }
});
`;
}

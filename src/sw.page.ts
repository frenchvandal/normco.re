import type Lume from "lume/mod.ts";

/**
 * Service Worker
 * Caches core assets and refreshes cache on new builds.
 */
export const layout = false;
export const url = "/sw.js";
export const contentType = "application/javascript";

interface ServiceWorkerData extends Lume.Data {
  buildId?: string;
  search: Lume.Data["search"];
}

const collectCoreAssets = (search: Lume.Data["search"]): string[] => {
  const assets = new Set<string>(["/", "/offline/"]);

  for (const page of search.pages()) {
    if (!page.url) {
      continue;
    }

    assets.add(page.url);
  }

  return Array.from(assets).sort();
};

export default function (
  { buildId, search }: ServiceWorkerData,
): string {
  const version = buildId ?? "dev";
  const coreAssets = collectCoreAssets(search);

  return `const CACHE_PREFIX = "normcore-assets";
const CACHE_VERSION = "${version}";
const CACHE_NAME = \`\${CACHE_PREFIX}-\${CACHE_VERSION}\`;
const CORE_ASSETS = ${JSON.stringify(coreAssets)};
const OFFLINE_URL = "/offline/";

const isPagefindRequest = (url) => url.pathname.startsWith("/pagefind/");
const isCacheableRequest = (request, url) => {
  if (request.method !== "GET") {
    return false;
  }

  if (url.origin !== self.location.origin) {
    return false;
  }

  const destinations = new Set(["style", "script", "image", "font"]);
  return destinations.has(request.destination);
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

const staleWhileRevalidate = async (request) => {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    return cached;
  }

  const response = await fetchPromise;
  if (response) {
    return response;
  }

  return new Response("Offline", { status: 503 });
};

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
    event.respondWith(networkFirst(request, OFFLINE_URL));
    return;
  }

  const url = new URL(request.url);
  if (isPagefindRequest(url)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  if (isCacheableRequest(request, url)) {
    event.respondWith(cacheFirst(request));
  }
});
`;
}

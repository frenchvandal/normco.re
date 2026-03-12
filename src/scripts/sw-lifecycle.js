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
  STATIC_CACHE,
  PAGE_CACHE,
  FEED_CACHE,
  STATIC_ASSETS,
  logSw,
} = /** @type {{
  STATIC_CACHE: string;
  PAGE_CACHE: string;
  FEED_CACHE: string;
  STATIC_ASSETS: ReadonlyArray<string>;
  logSw: (event: string, details?: Record<string, unknown>) => void;
}} */
  (runtime);

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

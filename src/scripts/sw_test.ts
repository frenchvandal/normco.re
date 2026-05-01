import { assertEquals, assertExists } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import SCRIPT_SOURCE from "./sw.js" with { type: "text" };
import { SITE_NAME } from "../utils/site-identity.ts";

type ListenerMap = Map<string, EventListenerOrEventListenerObject>;

type CacheStore = {
  match(request: string | { url?: string }): Promise<Response | undefined>;
  put(_request: string | { url?: string }, _response: Response): Promise<void>;
};

type ServiceWorkerRegistrationStub = {
  navigationPreload?: {
    enable(): Promise<void>;
  };
  unregister(): Promise<boolean>;
};

const EVALUABLE_SCRIPT_SOURCE = SCRIPT_SOURCE.replace(
  /import \{ SITE_NAME \} from "\.\.\/utils\/site-identity\.ts";\nimport \{ fetchWithTimeout \} from "\.\/shared\/network-utils\.js";\nimport \{ PRECACHED_SCRIPT_ASSET_URLS \} from "\.\.\/utils\/script-assets\.ts";\n\n/,
  `const PRECACHED_SCRIPT_ASSET_URLS = [];

function createTimeoutSignal(timeoutMs, upstreamSignal) {
  const existingSignal = upstreamSignal ?? undefined;
  const abortSignalConstructor = globalThis.AbortSignal;
  const timeoutFactory = abortSignalConstructor?.timeout;
  const anyFactory = abortSignalConstructor?.any;

  if (typeof timeoutFactory === "function") {
    const timeoutSignal = timeoutFactory.call(
      abortSignalConstructor,
      timeoutMs,
    );

    if (existingSignal === undefined) {
      return { signal: timeoutSignal, cleanup() {} };
    }

    if (typeof anyFactory === "function") {
      return {
        signal: anyFactory.call(abortSignalConstructor, [
          existingSignal,
          timeoutSignal,
        ]),
        cleanup() {},
      };
    }
  }

  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  const abortFromUpstream = () => {
    controller.abort();
  };

  if (existingSignal !== undefined) {
    if (existingSignal.aborted) {
      abortFromUpstream();
    } else {
      existingSignal.addEventListener("abort", abortFromUpstream, {
        once: true,
      });
    }
  }

  return {
    signal: controller.signal,
    cleanup() {
      globalThis.clearTimeout(timeoutId);

      if (existingSignal !== undefined && !existingSignal.aborted) {
        existingSignal.removeEventListener("abort", abortFromUpstream);
      }
    },
  };
}

async function fetchWithTimeout(input, init, timeoutMs) {
  const { signal, cleanup } = createTimeoutSignal(
    timeoutMs,
    init?.signal ?? undefined,
  );

  try {
    const requestInit = init === undefined ? { signal } : { ...init, signal };
    return await fetch(input, requestInit);
  } finally {
    cleanup();
  }
}

`,
);

function createRuntime(
  {
    fetchImpl,
    cacheStores,
    cacheKeys,
    onCacheDelete,
    serviceWorkerUrl = "https://normco.re/sw.js?v=test&debug=off",
    registration = {
      unregister() {
        return Promise.resolve(true);
      },
    },
  }: {
    fetchImpl: (
      input: string | { url?: string },
      init?: RequestInit,
    ) => Promise<Response>;
    cacheStores: Record<string, CacheStore>;
    cacheKeys?: ReadonlyArray<string>;
    onCacheDelete?: (cacheName: string) => void;
    serviceWorkerUrl?: string;
    registration?: ServiceWorkerRegistrationStub;
  },
) {
  const listeners: ListenerMap = new Map();
  const selfObject = {
    location: new URL(serviceWorkerUrl),
    registration,
    clients: {
      claim() {
        return Promise.resolve();
      },
    },
    skipWaiting() {
      return Promise.resolve();
    },
    addEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
    ) {
      listeners.set(type, listener);
    },
  };
  const cachesObject = {
    open(name: string) {
      const cache = cacheStores[name] ?? {
        match() {
          return Promise.resolve(undefined);
        },
        put() {
          return Promise.resolve();
        },
      };

      return Promise.resolve(cache);
    },
    keys() {
      return Promise.resolve(
        cacheKeys === undefined ? Object.keys(cacheStores) : [...cacheKeys],
      );
    },
    delete(name: string) {
      onCacheDelete?.(name);
      return Promise.resolve(true);
    },
  };

  const evaluateScript = new Function(
    "self",
    "caches",
    "fetch",
    "Response",
    "Headers",
    "URL",
    "console",
    "Date",
    "SITE_NAME",
    EVALUABLE_SCRIPT_SOURCE,
  );

  evaluateScript(
    selfObject,
    cachesObject,
    fetchImpl,
    Response,
    Headers,
    URL,
    console,
    Date,
    SITE_NAME,
  );

  return {
    getFetchListener() {
      const listener = listeners.get("fetch");
      if (typeof listener !== "function") {
        throw new Error("Missing fetch listener");
      }

      return listener as unknown as (event: {
        request: {
          url: string;
          method: string;
          mode: string;
          destination: string;
          headers: Headers;
        };
        preloadResponse?: Promise<Response | undefined>;
        respondWith(promise: Promise<Response>): void;
      }) => void;
    },
    getActivateListener() {
      const listener = listeners.get("activate");
      if (typeof listener !== "function") {
        throw new Error("Missing activate listener");
      }

      return listener as unknown as (event: {
        waitUntil(promise: Promise<void>): void;
      }) => void;
    },
  };
}

describe("sw.js", () => {
  it("returns the localized offline page when navigation fails offline", async () => {
    const runtime = createRuntime({
      fetchImpl() {
        return Promise.reject(new Error("offline"));
      },
      cacheStores: {
        "static-test": {
          match(request) {
            const key = typeof request === "string"
              ? request
              : request.url ?? "";
            return Promise.resolve(
              key === "/fr/offline/"
                ? new Response("FR offline page", { status: 200 })
                : undefined,
            );
          },
          put() {
            return Promise.resolve();
          },
        },
        "pages-test": {
          match() {
            return Promise.resolve(undefined);
          },
          put() {
            return Promise.resolve();
          },
        },
      },
    });
    const listener = runtime.getFetchListener();
    let responsePromise: Promise<Response> | undefined;

    listener({
      request: {
        url: "https://normco.re/fr/posts/example/",
        method: "GET",
        mode: "navigate",
        destination: "document",
        headers: new Headers({ "user-agent": "Mozilla/5.0" }),
      },
      respondWith(promise) {
        responsePromise = promise;
      },
    });

    assertExists(
      responsePromise,
      "Expected service worker fetch handler to call respondWith().",
    );
    const response = await responsePromise;
    assertEquals(await response.text(), "FR offline page");
  });

  it("returns canonical content-type headers for inline offline fallbacks", async () => {
    const runtime = createRuntime({
      fetchImpl() {
        return Promise.reject(new Error("offline"));
      },
      cacheStores: {
        "static-test": {
          match() {
            return Promise.resolve(undefined);
          },
          put() {
            return Promise.resolve();
          },
        },
        "pages-test": {
          match() {
            return Promise.resolve(undefined);
          },
          put() {
            return Promise.resolve();
          },
        },
        "feeds-test": {
          match() {
            return Promise.resolve(undefined);
          },
          put() {
            return Promise.resolve();
          },
        },
      },
    });
    const listener = runtime.getFetchListener();
    let pageResponsePromise: Promise<Response> | undefined;
    let feedResponsePromise: Promise<Response> | undefined;

    listener({
      request: {
        url: "https://normco.re/posts/example/",
        method: "GET",
        mode: "navigate",
        destination: "document",
        headers: new Headers({ "user-agent": "Mozilla/5.0" }),
      },
      respondWith(promise) {
        pageResponsePromise = promise;
      },
    });

    listener({
      request: {
        url: "https://normco.re/feed.xml",
        method: "GET",
        mode: "cors",
        destination: "document",
        headers: new Headers({ "user-agent": "Mozilla/5.0" }),
      },
      respondWith(promise) {
        feedResponsePromise = promise;
      },
    });

    assertExists(
      pageResponsePromise,
      "Expected page request to call respondWith().",
    );
    assertExists(
      feedResponsePromise,
      "Expected feed request to call respondWith().",
    );
    const pageResponse = await pageResponsePromise;
    const feedResponse = await feedResponsePromise;

    assertEquals(
      pageResponse.headers.get("content-type"),
      "text/html; charset=UTF-8",
    );
    assertEquals(
      feedResponse.headers.get("content-type"),
      "text/plain; charset=UTF-8",
    );
  });

  it("serves stale cached feeds immediately while refreshing in the background", async () => {
    let resolveFeedFetch: ((response: Response) => void) | undefined;
    let cachePutCount = 0;
    const cachedAt = Date.now().toString();
    const runtime = createRuntime({
      fetchImpl() {
        return new Promise<Response>((resolve) => {
          resolveFeedFetch = resolve;
        });
      },
      cacheStores: {
        "feeds-test": {
          match(request) {
            const key = typeof request === "string"
              ? request
              : request.url ?? "";
            return Promise.resolve(
              key === "https://normco.re/feed.xml"
                ? new Response("<rss>cached</rss>", {
                  status: 200,
                  headers: {
                    "content-type": "application/rss+xml; charset=UTF-8",
                    "x-sw-cached-at": cachedAt,
                  },
                })
                : undefined,
            );
          },
          put() {
            cachePutCount += 1;
            return Promise.resolve();
          },
        },
      },
    });
    const listener = runtime.getFetchListener();
    let responsePromise: Promise<Response> | undefined;

    listener({
      request: {
        url: "https://normco.re/feed.xml",
        method: "GET",
        mode: "cors",
        destination: "document",
        headers: new Headers({ "user-agent": "Mozilla/5.0" }),
      },
      respondWith(promise) {
        responsePromise = promise;
      },
    });

    assertExists(
      responsePromise,
      "Expected stale feed request to call respondWith().",
    );

    let timeoutId = 0;
    const resolutionState = await Promise.race([
      responsePromise.then(() => "resolved"),
      new Promise<"pending">((resolve) => {
        timeoutId = setTimeout(() => resolve("pending"), 20);
      }),
    ]);
    clearTimeout(timeoutId);
    assertEquals(resolutionState, "resolved");

    const response = await responsePromise;
    assertEquals(await response.text(), "<rss>cached</rss>");
    assertEquals(cachePutCount, 0);

    resolveFeedFetch?.(
      new Response("<rss>fresh</rss>", {
        status: 200,
        headers: { "content-type": "application/rss+xml; charset=UTF-8" },
      }),
    );

    await new Promise((resolve) => setTimeout(resolve, 0));
    assertEquals(cachePutCount, 1);
  });

  it("waits for a fresh response when the cached feed TTL has expired", async () => {
    let resolveFeedFetch: ((response: Response) => void) | undefined;
    let cachePutCount = 0;
    const runtime = createRuntime({
      fetchImpl() {
        return new Promise<Response>((resolve) => {
          resolveFeedFetch = resolve;
        });
      },
      cacheStores: {
        "feeds-test": {
          match(request) {
            const key = typeof request === "string"
              ? request
              : request.url ?? "";
            return Promise.resolve(
              key === "https://normco.re/feed.xml"
                ? new Response("<rss>cached</rss>", {
                  status: 200,
                  headers: {
                    "content-type": "application/rss+xml; charset=UTF-8",
                    "x-sw-cached-at": "0",
                  },
                })
                : undefined,
            );
          },
          put() {
            cachePutCount += 1;
            return Promise.resolve();
          },
        },
      },
    });
    const listener = runtime.getFetchListener();
    let responsePromise: Promise<Response> | undefined;

    listener({
      request: {
        url: "https://normco.re/feed.xml",
        method: "GET",
        mode: "cors",
        destination: "document",
        headers: new Headers({ "user-agent": "Mozilla/5.0" }),
      },
      respondWith(promise) {
        responsePromise = promise;
      },
    });

    assertExists(
      responsePromise,
      "Expected expired feed request to call respondWith().",
    );

    let timeoutId = 0;
    const resolutionState = await Promise.race([
      responsePromise.then(() => "resolved"),
      new Promise<"pending">((resolve) => {
        timeoutId = setTimeout(() => resolve("pending"), 20);
      }),
    ]);
    clearTimeout(timeoutId);
    assertEquals(resolutionState, "pending");

    resolveFeedFetch?.(
      new Response("<rss>fresh</rss>", {
        status: 200,
        headers: { "content-type": "application/rss+xml; charset=UTF-8" },
      }),
    );

    const response = await responsePromise;
    assertEquals(await response.text(), "<rss>fresh</rss>");
    assertEquals(cachePutCount, 1);
  });

  it("bypasses crawler requests without intercepting them", () => {
    const runtime = createRuntime({
      fetchImpl() {
        return Promise.resolve(new Response("", { status: 200 }));
      },
      cacheStores: {},
    });
    const listener = runtime.getFetchListener();
    let intercepted = false;

    listener({
      request: {
        url: "https://normco.re/",
        method: "GET",
        mode: "navigate",
        destination: "document",
        headers: new Headers({ "user-agent": "Googlebot/2.1" }),
      },
      respondWith() {
        intercepted = true;
      },
    });

    assertEquals(intercepted, false);
  });

  it("serves cached stable-named Pagefind assets while offline", async () => {
    const runtime = createRuntime({
      fetchImpl() {
        return Promise.reject(new Error("offline"));
      },
      cacheStores: {
        "pagefind-test": {
          match(request) {
            const key = typeof request === "string"
              ? request
              : request.url ?? "";
            return Promise.resolve(
              key === "https://normco.re/pagefind/pagefind-entry.json"
                ? new Response('{"cached":true}', { status: 200 })
                : undefined,
            );
          },
          put() {
            return Promise.resolve();
          },
        },
      },
    });
    const listener = runtime.getFetchListener();
    let responsePromise: Promise<Response> | undefined;

    listener({
      request: {
        url: "https://normco.re/pagefind/pagefind-entry.json",
        method: "GET",
        mode: "cors",
        destination: "script",
        headers: new Headers({ "user-agent": "Mozilla/5.0" }),
      },
      respondWith(promise) {
        responsePromise = promise;
      },
    });

    assertExists(
      responsePromise,
      "Expected cached pagefind request to call respondWith().",
    );
    const response = await responsePromise;
    assertEquals(await response.text(), '{"cached":true}');
  });

  it("serves hashed Pagefind index assets from the cache without hitting the network", async () => {
    let fetchCalls = 0;
    const runtime = createRuntime({
      fetchImpl() {
        fetchCalls += 1;
        return Promise.resolve(
          new Response("network-fragment", { status: 200 }),
        );
      },
      cacheStores: {
        "pagefind-test": {
          match(request) {
            const key = typeof request === "string"
              ? request
              : request.url ?? "";
            return Promise.resolve(
              key === "https://normco.re/pagefind/index/en_97a2b88.pf_index"
                ? new Response("cached-index", { status: 200 })
                : undefined,
            );
          },
          put() {
            return Promise.resolve();
          },
        },
      },
    });
    const listener = runtime.getFetchListener();
    let responsePromise: Promise<Response> | undefined;

    listener({
      request: {
        url: "https://normco.re/pagefind/index/en_97a2b88.pf_index",
        method: "GET",
        mode: "cors",
        destination: "",
        headers: new Headers({ "user-agent": "Mozilla/5.0" }),
      },
      respondWith(promise) {
        responsePromise = promise;
      },
    });

    assertExists(
      responsePromise,
      "Expected hashed pagefind asset to call respondWith().",
    );
    const response = await responsePromise;
    assertEquals(await response.text(), "cached-index");
    assertEquals(fetchCalls, 0);
  });

  it("refreshes stable-named Pagefind assets from the network when online", async () => {
    let fetchCalls = 0;
    let cachePutCount = 0;
    const runtime = createRuntime({
      fetchImpl() {
        fetchCalls += 1;
        return Promise.resolve(
          new Response("fresh-runtime", { status: 200 }),
        );
      },
      cacheStores: {
        "pagefind-test": {
          match() {
            return Promise.resolve(
              new Response("stale-runtime", { status: 200 }),
            );
          },
          put() {
            cachePutCount += 1;
            return Promise.resolve();
          },
        },
      },
    });
    const listener = runtime.getFetchListener();
    let responsePromise: Promise<Response> | undefined;

    listener({
      request: {
        url: "https://normco.re/pagefind/pagefind.js",
        method: "GET",
        mode: "cors",
        destination: "script",
        headers: new Headers({ "user-agent": "Mozilla/5.0" }),
      },
      respondWith(promise) {
        responsePromise = promise;
      },
    });

    assertExists(
      responsePromise,
      "Expected stable-named pagefind asset to call respondWith().",
    );
    const response = await responsePromise;
    assertEquals(await response.text(), "fresh-runtime");
    assertEquals(fetchCalls, 1);
    assertEquals(cachePutCount, 1);
  });

  it("prunes stale caches but keeps the Pagefind cache version intact during activation", async () => {
    const deletedKeys: string[] = [];
    const runtime = createRuntime({
      fetchImpl() {
        return Promise.resolve(new Response("", { status: 200 }));
      },
      cacheStores: {},
      cacheKeys: [
        "static-test",
        "pages-test",
        "feeds-test",
        "pagefind-test",
        "pagefind-old",
        "static-old",
      ],
      onCacheDelete(name) {
        deletedKeys.push(name);
      },
    });
    const listener = runtime.getActivateListener();
    let activationPromise: Promise<void> | undefined;

    listener({
      waitUntil(promise) {
        activationPromise = promise;
      },
    });

    assertExists(
      activationPromise,
      "Expected activate handler to call waitUntil().",
    );
    await activationPromise;

    assertEquals(deletedKeys.sort(), ["pagefind-old", "static-old"]);
  });

  it("passes an abort signal to timed network requests", async () => {
    const fetchSignals: AbortSignal[] = [];
    const runtime = createRuntime({
      fetchImpl(_input, init) {
        if (init?.signal != null) {
          fetchSignals.push(init.signal);
        }

        return Promise.resolve(new Response("<html></html>", { status: 200 }));
      },
      cacheStores: {
        "pages-test": {
          match() {
            return Promise.resolve(undefined);
          },
          put() {
            return Promise.resolve();
          },
        },
      },
    });
    const listener = runtime.getFetchListener();
    let responsePromise: Promise<Response> | undefined;

    listener({
      request: {
        url: "https://normco.re/posts/example/",
        method: "GET",
        mode: "navigate",
        destination: "document",
        headers: new Headers({ "user-agent": "Mozilla/5.0" }),
      },
      respondWith(promise) {
        responsePromise = promise;
      },
    });

    assertExists(
      responsePromise,
      "Expected timed network request to call respondWith().",
    );
    await responsePromise;
    assertEquals(fetchSignals.length, 1);
    assertEquals(fetchSignals[0]?.aborted, false);
  });

  it("bypasses all fetch interception on localhost service workers", () => {
    const runtime = createRuntime({
      fetchImpl() {
        return Promise.resolve(new Response("", { status: 200 }));
      },
      cacheStores: {},
      serviceWorkerUrl: "http://localhost:3000/sw.js?v=test&debug=off",
    });
    const listener = runtime.getFetchListener();
    let intercepted = false;

    listener({
      request: {
        url: "http://localhost:3000/scripts/post-mobile-tools.js",
        method: "GET",
        mode: "cors",
        destination: "script",
        headers: new Headers({ "user-agent": "Mozilla/5.0" }),
      },
      respondWith() {
        intercepted = true;
      },
    });

    assertEquals(intercepted, false);
  });

  it("enables navigation preload during activation when supported", async () => {
    let enableCalls = 0;
    const runtime = createRuntime({
      fetchImpl() {
        return Promise.resolve(new Response("", { status: 200 }));
      },
      cacheStores: {},
      registration: {
        navigationPreload: {
          enable() {
            enableCalls += 1;
            return Promise.resolve();
          },
        },
        unregister() {
          return Promise.resolve(true);
        },
      },
    });
    const listener = runtime.getActivateListener();
    let activationPromise: Promise<void> | undefined;

    listener({
      waitUntil(promise) {
        activationPromise = promise;
      },
    });

    assertExists(
      activationPromise,
      "Expected activate handler to call waitUntil().",
    );
    await activationPromise;
    assertEquals(enableCalls, 1);
  });

  it("uses the navigation preload response for navigations when available", async () => {
    let fetchCalls = 0;
    let cachePutCount = 0;
    const runtime = createRuntime({
      fetchImpl() {
        fetchCalls += 1;
        return Promise.resolve(
          new Response("<html>network</html>", {
            status: 200,
          }),
        );
      },
      cacheStores: {
        "pages-test": {
          match() {
            return Promise.resolve(undefined);
          },
          put() {
            cachePutCount += 1;
            return Promise.resolve();
          },
        },
      },
    });
    const listener = runtime.getFetchListener();
    let responsePromise: Promise<Response> | undefined;

    listener({
      request: {
        url: "https://normco.re/posts/example/",
        method: "GET",
        mode: "navigate",
        destination: "document",
        headers: new Headers({ "user-agent": "Mozilla/5.0" }),
      },
      preloadResponse: Promise.resolve(
        new Response("<html>preloaded</html>", { status: 200 }),
      ),
      respondWith(promise) {
        responsePromise = promise;
      },
    });

    assertExists(
      responsePromise,
      "Expected preload-backed navigation to call respondWith().",
    );
    const response = await responsePromise;
    assertEquals(await response.text(), "<html>preloaded</html>");
    assertEquals(fetchCalls, 0);
    assertEquals(cachePutCount, 1);
  });
});

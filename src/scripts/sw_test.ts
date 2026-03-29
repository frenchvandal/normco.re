import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import SCRIPT_SOURCE from "./sw.js" with { type: "text" };
import { SITE_NAME } from "../utils/site-identity.ts";

type ListenerMap = Map<string, EventListenerOrEventListenerObject>;

type CacheStore = {
  match(request: string | { url?: string }): Promise<Response | undefined>;
  put(_request: string | { url?: string }, _response: Response): Promise<void>;
};

const EVALUABLE_SCRIPT_SOURCE = SCRIPT_SOURCE.replace(
  'import { SITE_NAME } from "../utils/site-identity.ts";\n\n',
  "",
);

function createRuntime(
  {
    fetchImpl,
    cacheStores,
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
    serviceWorkerUrl?: string;
    registration?: { unregister: () => Promise<boolean> };
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
      return Promise.resolve(Object.keys(cacheStores));
    },
    delete() {
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
        respondWith(promise: Promise<Response>): void;
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

    const response = await responsePromise!;
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
        url: "https://normco.re/rss.xml",
        method: "GET",
        mode: "cors",
        destination: "document",
        headers: new Headers({ "user-agent": "Mozilla/5.0" }),
      },
      respondWith(promise) {
        feedResponsePromise = promise;
      },
    });

    const pageResponse = await pageResponsePromise!;
    const feedResponse = await feedResponsePromise!;

    assertEquals(
      pageResponse.headers.get("content-type"),
      "text/html; charset=UTF-8",
    );
    assertEquals(
      feedResponse.headers.get("content-type"),
      "text/plain; charset=UTF-8",
    );
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

  it("serves cached Pagefind assets while offline", async () => {
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

    const response = await responsePromise!;
    assertEquals(await response.text(), '{"cached":true}');
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

    await responsePromise!;
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
});

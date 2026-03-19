import { assertEquals } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import SCRIPT_SOURCE from "./sw.js" with { type: "text" };

type ListenerMap = Map<string, EventListenerOrEventListenerObject>;

type CacheStore = {
  match(request: string | { url?: string }): Promise<Response | undefined>;
  put(_request: string | { url?: string }, _response: Response): Promise<void>;
};

function createRuntime(
  {
    fetchImpl,
    cacheStores,
  }: {
    fetchImpl: (input: string | { url?: string }) => Promise<Response>;
    cacheStores: Record<string, CacheStore>;
  },
) {
  const listeners: ListenerMap = new Map();
  const selfObject = {
    location: new URL("https://normco.re/sw.js?v=test&debug=off"),
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
    SCRIPT_SOURCE,
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
});

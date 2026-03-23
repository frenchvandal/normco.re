import { describe, it } from "@std/testing/bdd";
import { assertEquals, assertRejects } from "@std/assert";

import type Site from "lume/core/site.ts";

import otel from "./otel.ts";

type SiteEventHandler = (event?: unknown) => void;
type RequestHandler = (req: Request) => Promise<Response>;
type Middleware = (
  req: Request,
  next: RequestHandler,
  info: Deno.ServeHandlerInfo,
) => Promise<Response>;

interface DebugCollectionItem {
  title: string;
  details?: string | number;
  context?: string;
  text?: string;
  items?: DebugCollectionItem[];
}

interface DebugCollection {
  name: string;
  icon?: string;
  empty?: string;
  contexts?: Record<string, { background: string }>;
  items: DebugCollectionItem[];
}

interface StubDebugBar {
  buildItems: DebugCollectionItem[];
  collection(name: string): DebugCollection;
  buildItem(title?: string, context?: string): DebugCollectionItem;
}

interface StubServer {
  addEventListener(
    type: "start",
    listener: () => void,
    options?: { once?: boolean },
  ): void;
  useFirst(...middleware: Middleware[]): void;
}

interface StubSite {
  addEventListener(type: string, fn: SiteEventHandler): void;
  debugBar?: StubDebugBar;
  getServer(): StubServer;
}

type MockedEnv = Readonly<Record<string, string | undefined>>;

function createStubDebugBar() {
  const collections = new Map<string, DebugCollection>();
  const buildItems: DebugCollectionItem[] = [];

  const debugBar: StubDebugBar = {
    buildItems,
    collection(name: string): DebugCollection {
      const existing = collections.get(name);

      if (existing) {
        return existing;
      }

      const created: DebugCollection = {
        name,
        items: [],
      };
      collections.set(name, created);
      return created;
    },
    buildItem(title = "Untitled", context = "info"): DebugCollectionItem {
      const item: DebugCollectionItem = { context, title };
      buildItems.push(item);
      return item;
    },
  };

  return { buildItems, collections, debugBar };
}

function createStubSite(withDebugBar = true) {
  const siteListeners = new Map<string, SiteEventHandler[]>();
  const startListeners: Array<{ listener: () => void; once: boolean }> = [];
  const middlewares: Middleware[] = [];
  const debugData = createStubDebugBar();

  const server: StubServer = {
    addEventListener(
      _type: "start",
      listener: () => void,
      options?: { once?: boolean },
    ): void {
      startListeners.push({ listener, once: options?.once ?? false });
    },
    useFirst(...middleware: Middleware[]): void {
      middlewares.unshift(...middleware);
    },
  };

  const site: StubSite = {
    addEventListener(type: string, fn: SiteEventHandler): void {
      const listeners = siteListeners.get(type) ?? [];
      listeners.push(fn);
      siteListeners.set(type, listeners);
    },
    ...(withDebugBar ? { debugBar: debugData.debugBar } : {}),
    getServer(): StubServer {
      return server;
    },
  };

  function triggerSiteEvent(type: string, event?: unknown): void {
    const listeners = siteListeners.get(type) ?? [];

    for (const listener of listeners) {
      listener(event);
    }
  }

  function triggerServerStart(): void {
    for (const item of [...startListeners]) {
      item.listener();
    }

    for (let index = startListeners.length - 1; index >= 0; index -= 1) {
      if (startListeners[index]?.once) {
        startListeners.splice(index, 1);
      }
    }
  }

  return {
    buildItems: debugData.buildItems,
    collections: debugData.collections,
    middlewares,
    site,
    siteListeners,
    startListeners,
    triggerServerStart,
    triggerSiteEvent,
  };
}

async function withMockedEnv(
  env: MockedEnv,
  callback: () => void | Promise<void>,
): Promise<void> {
  const originalGet = Deno.env.get;
  Deno.env.get = (name: string): string | undefined => env[name];

  try {
    await callback();
  } finally {
    Deno.env.get = originalGet;
  }
}

async function captureConsoleLogs(
  callback: () => void | Promise<void>,
): Promise<string[]> {
  const originalLog = console.log;
  const entries: string[] = [];
  console.log = (...data: unknown[]): void => {
    entries.push(data.map((value) => String(value)).join(" "));
  };

  try {
    await callback();
  } finally {
    console.log = originalLog;
  }

  return entries;
}

function getRegisteredMiddleware(
  env: ReturnType<typeof createStubSite>,
): Middleware {
  const middleware = env.middlewares[0];

  if (!middleware) {
    throw new Error("Expected middleware to be registered");
  }

  return middleware;
}

describe("otel()", () => {
  it("returns a site plugin function", () => {
    const plugin = otel();
    assertEquals(typeof plugin, "function");
  });

  it("plugin function accepts one argument (site)", () => {
    const plugin = otel();
    assertEquals(plugin.length, 1);
  });

  it("registers lifecycle listeners and middleware hook without throwing", () => {
    const env = createStubSite();
    const plugin = otel({ logRequests: false });
    plugin(env.site as unknown as Site);

    assertEquals((env.siteListeners.get("beforeBuild")?.length ?? 0) > 0, true);
    assertEquals((env.siteListeners.get("afterBuild")?.length ?? 0) > 0, true);
    assertEquals(
      (env.siteListeners.get("beforeUpdate")?.length ?? 0) > 0,
      true,
    );
    assertEquals((env.siteListeners.get("afterUpdate")?.length ?? 0) > 0, true);
    assertEquals(env.startListeners.length, 1);

    env.triggerSiteEvent("beforeBuild");
    env.triggerSiteEvent("afterBuild");
    env.triggerSiteEvent("beforeUpdate", {
      files: new Set(["/index.page.tsx"]),
    });
    env.triggerSiteEvent("afterUpdate");

    env.triggerServerStart();
    assertEquals(env.middlewares.length, 1);
  });

  it("refreshes the development debug bar on build events", () => {
    const env = createStubSite();
    const plugin = otel({ logRequests: false, mode: "development" });
    plugin(env.site as unknown as Site);

    env.triggerSiteEvent("beforeBuild");

    assertEquals(
      env.collections.get("OpenTelemetry")?.icon,
      "activity",
    );
    assertEquals(
      env.collections.get("OpenTelemetry")?.items?.[0]?.title,
      "Mode",
    );
    assertEquals(
      env.collections.get("OpenTelemetry")?.items?.[0]?.details,
      "development",
    );
    assertEquals(
      env.buildItems[0]?.title.includes("OpenTelemetry"),
      true,
    );
  });

  it("uses production mode in Deploy runtime even when debug bar exists", async () => {
    const env = createStubSite();
    const plugin = otel({
      ignore: [],
      logRequests: false,
    });

    await withMockedEnv({
      DENO_DEPLOY: "true",
      DENO_DEPLOYMENT_ID: "abc123",
    }, async () => {
      plugin(env.site as unknown as Site);
      env.triggerSiteEvent("beforeBuild");
      env.triggerServerStart();

      const middleware = env.middlewares[0];

      if (!middleware) {
        throw new Error("Expected middleware to be registered");
      }

      await middleware(
        new Request("https://example.test/posts/hello"),
        () => Promise.resolve(new Response("ok", { status: 200 })),
        {} as Deno.ServeHandlerInfo,
      );
    });

    assertEquals(
      env.collections.get("OpenTelemetry")?.items?.[0]?.details,
      "production",
    );
    assertEquals(env.collections.has("Requests"), false);
  });

  it("tracks requests and exposes them in the Requests debug collection", async () => {
    const env = createStubSite();
    const plugin = otel({
      ignore: [],
      logRequests: false,
      mode: "development",
    });
    plugin(env.site as unknown as Site);
    env.triggerServerStart();

    const middleware = getRegisteredMiddleware(env);

    await middleware(
      new Request("https://example.test/posts/hello"),
      () => Promise.resolve(new Response("ok", { status: 200 })),
      {} as Deno.ServeHandlerInfo,
    );

    assertEquals(env.collections.get("Requests")?.icon, "arrows-clockwise");
    assertEquals(
      env.collections.get("Requests")?.items?.[0]?.title,
      "Recent requests",
    );
    assertEquals(
      env.collections.get("Requests")?.items?.[1]?.title,
      "Route counters",
    );
    assertEquals(
      env.collections.get("Requests")?.items?.[0]?.items?.[0]?.title,
      "GET /posts/hello",
    );
  });

  it("normalizes request routes with URLPattern definitions in development mode", async () => {
    const env = createStubSite();
    const plugin = otel({
      ignore: [],
      logRequests: false,
      mode: "development",
      routes: [new URLPattern({ pathname: "/posts/:slug" })],
    });
    plugin(env.site as unknown as Site);
    env.triggerServerStart();

    const middleware = getRegisteredMiddleware(env);

    await middleware(
      new Request("https://example.test/posts/hello-world"),
      () => Promise.resolve(new Response("ok", { status: 200 })),
      {} as Deno.ServeHandlerInfo,
    );

    assertEquals(
      env.collections.get("Requests")?.items?.[0]?.items?.[0]?.title,
      "GET /posts/:slug",
    );
    assertEquals(
      env.collections.get("Requests")?.items?.[1]?.items?.[0]?.title,
      "GET /posts/:slug",
    );
  });

  it("skips ignored static asset requests from in-memory request tracking", async () => {
    const env = createStubSite();
    const plugin = otel({
      logRequests: false,
      mode: "development",
    });
    plugin(env.site as unknown as Site);
    env.triggerServerStart();

    const middleware = getRegisteredMiddleware(env);

    await middleware(
      new Request("https://example.test/style.css"),
      () => Promise.resolve(new Response("body", { status: 200 })),
      {} as Deno.ServeHandlerInfo,
    );

    assertEquals(env.collections.has("Requests"), false);
  });

  it("records thrown handler errors as 500 request entries in development mode", async () => {
    const env = createStubSite();
    const plugin = otel({
      ignore: [],
      logRequests: false,
      mode: "development",
      routes: [new URLPattern({ pathname: "/api/:resource" })],
    });
    plugin(env.site as unknown as Site);
    env.triggerServerStart();

    const middleware = getRegisteredMiddleware(env);

    await assertRejects(
      () =>
        middleware(
          new Request("https://example.test/api/failure"),
          () => Promise.reject(new Error("boom")),
          {} as Deno.ServeHandlerInfo,
        ),
      Error,
      "boom",
    );

    const recentRequest = env.collections.get("Requests")?.items?.[0]?.items
      ?.[0];
    const routeCounter = env.collections.get("Requests")?.items?.[1]?.items
      ?.[0];
    const routeStatus = routeCounter?.items?.[0];

    assertEquals(recentRequest?.title, "GET /api/:resource");
    assertEquals(recentRequest?.context, "error");
    assertEquals(recentRequest?.text, "boom");
    assertEquals(routeCounter?.title, "GET /api/:resource");
    assertEquals(routeStatus?.title, "500");
    assertEquals(routeStatus?.context, "error");
  });

  it("logs missing OTEL_DENO when instrumentation is not enabled", async () => {
    const env = createStubSite();
    const plugin = otel({ logRequests: false, mode: "development" });

    const entries = await captureConsoleLogs(() =>
      withMockedEnv({}, () => {
        plugin(env.site as unknown as Site);
      })
    );

    assertEquals(
      entries.some((entry) =>
        entry.includes(
          "Missing expected OTEL environment variable: OTEL_DENO",
        )
      ),
      true,
    );
  });

  it("does not log env warnings when expected OTEL variables are set", async () => {
    const env = createStubSite();
    const plugin = otel({ logRequests: false, mode: "development" });

    const entries = await captureConsoleLogs(() =>
      withMockedEnv({
        OTEL_DENO: "true",
        OTEL_EXPORTER_OTLP_ENDPOINT: "http://localhost:4318",
        OTEL_EXPORTER_OTLP_PROTOCOL: "http/json",
        OTEL_SERVICE_NAME: "my-site",
      }, () => {
        plugin(env.site as unknown as Site);
      })
    );

    assertEquals(entries.length, 0);
  });

  it("treats blank OTEL values as missing", async () => {
    const env = createStubSite();
    const plugin = otel({ logRequests: false, mode: "development" });

    const entries = await captureConsoleLogs(() =>
      withMockedEnv({
        OTEL_DENO: "true",
        OTEL_EXPORTER_OTLP_ENDPOINT: "http://localhost:4318",
        OTEL_EXPORTER_OTLP_PROTOCOL: "http/json",
        OTEL_SERVICE_NAME: "  ",
      }, () => {
        plugin(env.site as unknown as Site);
      })
    );

    assertEquals(
      entries.some((entry) =>
        entry.includes(
          "Missing expected OTEL environment variable: OTEL_SERVICE_NAME",
        )
      ),
      true,
    );
  });
});

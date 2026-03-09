import { merge } from "lume/core/utils/object.ts";

import { metrics, SpanStatusCode, trace } from "npm/opentelemetry-api";
import type { Span } from "npm/opentelemetry-api";

// ---------------------------------------------------------------------------
// Types — self-contained, no dependency on lume/core/server.ts so this file
// can be extracted as a standalone ESM module later.
// ---------------------------------------------------------------------------

type RequestHandler = (req: Request) => Promise<Response>;
type Middleware = (
  req: Request,
  next: RequestHandler,
  info: Deno.ServeHandlerInfo,
) => Promise<Response>;
/** Event callback signature accepted by this plugin lifecycle hooks. */
export type OTelSiteEventHandler = (event?: unknown) => void;

type OTelReadEnv = (name: string) => string | undefined;
type DebugBarRefreshKind = "build" | "request";

/** Debug bar item model used by the plugin collections. */
export interface OTelDebugBarItem {
  /** Human-readable item title shown in the debug bar. */
  title: string;
  /** Optional numeric or textual detail shown at the right side. */
  details?: string | number;
  /** Optional visual context key mapped to collection contexts. */
  context?: string;
  /** Optional long-form text details. */
  text?: string;
  /** Optional nested items for grouped details. */
  items?: OTelDebugBarItem[];
}

/** Debug bar collection model used by the plugin collections. */
export interface OTelDebugBarCollection {
  /** Optional icon name displayed by the debug bar UI. */
  icon?: string;
  /** Empty-state message shown when `items` is empty. */
  empty?: string;
  /** Named UI contexts used by item `context` values. */
  contexts?: Record<string, { background?: string }>;
  /** Collection items rendered in the debug bar. */
  items: OTelDebugBarItem[];
}

/** Debug bar contract expected by the plugin in development mode. */
export interface OTelDebugBar {
  /** Returns (or creates) a collection by name. */
  collection(name: string): OTelDebugBarCollection;
  /** Appends a status item to the Build collection. */
  buildItem(title?: string, context?: string): OTelDebugBarItem;
}

/** Server contract expected by the plugin to register middleware. */
export interface OTelServer {
  /** Registers a one-time start hook used to install OTEL middleware first. */
  addEventListener(
    type: "start",
    listener: () => void,
    options?: { once?: boolean },
  ): void;
  /** Prepends one or more middleware functions to the request pipeline. */
  useFirst(
    ...middleware: Array<
      (
        req: Request,
        next: (req: Request) => Promise<Response>,
        info: Deno.ServeHandlerInfo,
      ) => Promise<Response>
    >
  ): void;
}

/** Minimal Site contract required by this OpenTelemetry plugin. */
export interface OTelSite {
  /** Registers a plugin lifecycle listener (`beforeBuild`, `afterBuild`, and others). */
  addEventListener(type: string, fn: OTelSiteEventHandler): unknown;
  /** Returns the Lume server instance used to install request middleware. */
  getServer(): OTelServer;
  /** Optional debug bar API available in development mode. */
  debugBar?: OTelDebugBar;
}

function createEnvReader(): OTelReadEnv {
  return (name: string): string | undefined => {
    try {
      return Deno.env.get(name);
    } catch (error) {
      if (error instanceof Deno.errors.NotCapable) {
        return undefined;
      }

      throw error;
    }
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Configuration options for the OpenTelemetry plugin. */
export interface Options {
  /** The name of the tracer and meter (e.g. the service or library name) */
  name: string;

  /** The version of the service */
  version: string;

  /**
   * Whether to record custom error counters and build metrics in addition to
   * Deno's built-in HTTP metrics (request duration, active requests, body
   * sizes).
   */
  recordMetrics: boolean;

  /**
   * Static attributes added to every span (e.g. deployment environment,
   * region). Useful for filtering traces in your backend.
   *
   * @example
   * ```ts ignore
   * // Illustrative only — requires a live Lume site instance to execute.
   * otel({ attributes: { "deployment.environment": "production" } })
   * ```
   */
  attributes?: Record<string, string>;

  /**
   * URLPatterns used to normalize `http.route` to a pattern instead of the
   * raw pathname. First match wins. Without this option every unique URL
   * becomes its own route, causing unbounded cardinality in metrics.
   *
   * @example
   * ```ts ignore
   * // Illustrative only — requires a live Lume site instance to execute.
   * otel({
   *   routes: [
   *     new URLPattern({ pathname: "/posts/:slug" }),
   *     new URLPattern({ pathname: "/tags/:tag" }),
   *   ],
   * })
   * ```
   */
  routes?: URLPattern[];

  /**
   * Requests whose pathname matches any of these patterns are not traced.
   * Defaults to common static asset extensions to avoid noisy, low-value
   * spans. Set to `[]` to disable filtering entirely.
   *
   * @example Trace everything
   * ```ts ignore
   * // Illustrative only — requires a live Lume site instance to execute.
   * otel({ ignore: [] })
   * ```
   *
   * @example Extend the default list
   * ```ts ignore
   * // Illustrative only — requires a live Lume site instance to execute.
   * otel({ ignore: [STATIC_ASSETS_RE, /^\/healthz$/] })
   * ```
   */
  ignore?: RegExp[];

  /**
   * Controls the behaviour of the plugin:
   *
   * - `"auto"` (default): development mode when the Lume debug bar is active
   *   (`lume -s`), production mode otherwise.
   * - `"development"`: force development mode — tracks requests in memory and
   *   displays them in the debug bar regardless of environment.
   * - `"production"`: force production mode — pure OTEL enrichment, no
   *   in-memory tracking. Use this when deploying to Deno Deploy or any
   *   server where the debug bar is not available.
   */
  mode?: "auto" | "development" | "production";

  /**
   * Maximum number of recent requests kept in memory in development mode.
   * Older requests are dropped once the limit is reached.
   * @default 50
   */
  maxRequests?: number;

  /**
   * In development mode, log each request and build event to the terminal
   * using `console.table()` inside the active OTEL span, so logs are
   * automatically linked to their trace when `OTEL_DENO=true`.
   *
   * Build events use `console.groupCollapsed` for collapsible output.
   *
   * Set to `false` to silence terminal output.
   * @default true
   */
  logRequests?: boolean;
}

/**
 * Default regexp that matches common static asset file extensions.
 *
 * ```ts ignore
 * import { assertEquals } from "jsr:@std/assert@1";
 *
 * assertEquals(STATIC_ASSETS_RE.test("/styles.css"), true);
 * assertEquals(STATIC_ASSETS_RE.test("/bundle.js?v=abc"), true);
 * assertEquals(STATIC_ASSETS_RE.test("/fonts/sans.woff2"), true);
 * assertEquals(STATIC_ASSETS_RE.test("/posts/hello"), false);
 * assertEquals(STATIC_ASSETS_RE.test("/"), false);
 * ```
 */
export const STATIC_ASSETS_RE =
  /\.(css|js|mjs|map|ts|jsx|tsx|json|ico|png|jpg|jpeg|gif|webp|svg|avif|woff|woff2|ttf|eot|otf)(\?.*)?$/i;

/**
 * Default option values applied when no override is provided.
 *
 * ```ts ignore
 * // Asserting constant literals would only duplicate the implementation
 * // without adding meaningful coverage. Behavioral defaults are exercised
 * // by the integration tests for each feature they govern.
 * ```
 */
export const defaults: Options = {
  name: "lume",
  version: "1.0.0",
  recordMetrics: true,
  ignore: [STATIC_ASSETS_RE],
  mode: "auto",
  maxRequests: 50,
  logRequests: true,
};

const defaultIgnorePatterns = defaults.ignore ?? [];

function normalizeMaxRequests(value: number | undefined): number {
  const fallback = defaults.maxRequests ?? 50;

  if (value === undefined || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(0, Math.trunc(value));
}

function getUpdateEventFiles(event: unknown): Set<string> | undefined {
  if (
    typeof event === "object" &&
    event !== null &&
    "files" in event &&
    event.files instanceof Set
  ) {
    return event.files as Set<string>;
  }

  return undefined;
}

// ---------------------------------------------------------------------------
// Dev-mode in-memory store
// ---------------------------------------------------------------------------

interface RequestRecord {
  method: string;
  route: string;
  status: number;
  durationMs: number;
  error?: string;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Core middleware — extractable: only depends on @opentelemetry/api
// ---------------------------------------------------------------------------

function createMiddleware(
  options: Options,
  devMode: boolean,
  onRequest?: (record: RequestRecord) => void,
): Middleware {
  const ignorePatterns = options.ignore ?? defaultIgnorePatterns;

  // Deno already collects request duration, active requests, and body sizes
  // automatically. We only add error-specific counters to avoid duplication.
  const meter = options.recordMetrics
    ? metrics.getMeter(options.name, options.version)
    : null;

  const errorCounter = meter?.createCounter("http.server.errors", {
    description: "Number of HTTP error responses (4xx and 5xx)",
    unit: "1",
  });

  const notFoundCounter = meter?.createCounter("http.server.not_found", {
    description: "Number of 404 Not Found responses",
    unit: "1",
  });

  return async (request, next) => {
    const url = new URL(request.url);
    const method = request.method;
    const start = performance.now();

    // Skip tracing for requests matching ignore patterns (e.g. static assets).
    if (ignorePatterns.some((re) => re.test(url.pathname))) {
      return next(request);
    }

    // Normalize the route to a URLPattern pathname (e.g. "/posts/:slug") to
    // prevent unbounded metric cardinality. Falls back to the raw pathname.
    const route = matchRoute(url, options.routes);

    // Deno creates a span per request automatically, but does not add an
    // `http.route` attribute or set the span name to include the route.
    const span = trace.getActiveSpan();

    if (span) {
      span.setAttribute("http.route", route);
      span.updateName(`${method} ${route}`);

      if (options.attributes) {
        for (const [key, value] of Object.entries(options.attributes)) {
          span.setAttribute(key, value);
        }
      }
    }

    let response: Response;

    try {
      response = await next(request);
    } catch (error) {
      const typedError = error instanceof Error
        ? error
        : new Error(String(error));
      const message = typedError.message;
      if (span) {
        span.recordException(typedError);
        span.setStatus({ code: SpanStatusCode.ERROR, message });
      }
      const record: RequestRecord = {
        method,
        route,
        status: 500,
        durationMs: performance.now() - start,
        error: message,
        timestamp: Date.now(),
      };
      if (devMode && options.logRequests) {
        // Called inside the active span: OTEL links this log to the trace.
        console.table(
          [{
            method,
            route,
            status: 500,
            ms: Math.round(record.durationMs),
            error: message,
          }],
          ["method", "route", "status", "ms", "error"],
        );
      }
      onRequest?.(record);
      throw error;
    }

    const { status } = response;
    const durationMs = performance.now() - start;

    // Deno does not set an error status on the span for 5xx responses.
    if (status >= 500 && span) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: `HTTP ${status}` });
    }

    if (status === 404) {
      notFoundCounter?.add(1, {
        "http.request.method": method,
        "http.route": route,
      });
    }

    if (status >= 400) {
      errorCounter?.add(1, {
        "http.request.method": method,
        "http.route": route,
        "http.response.status_code": status,
      });
    }

    const record: RequestRecord = {
      method,
      route,
      status,
      durationMs,
      timestamp: Date.now(),
    };

    if (devMode && options.logRequests) {
      // Called inside the active span: OTEL links this log to the trace.
      console.table(
        [{ method, route, status, ms: Math.round(durationMs) }],
        ["method", "route", "status", "ms"],
      );
    }
    onRequest?.(record);

    return response;
  };
}

function matchRoute(url: URL, routes?: URLPattern[]): string {
  if (routes) {
    for (const pattern of routes) {
      if (pattern.test(url)) {
        return pattern.pathname;
      }
    }
  }
  return url.pathname;
}

// ---------------------------------------------------------------------------
// Debug bar helpers
// ---------------------------------------------------------------------------

function refreshDebugBar(
  site: OTelSite,
  mode: "development" | "production",
  options: Options,
  recentRequests: RequestRecord[],
  counters: Map<string, number>,
  readEnv: OTelReadEnv,
  kind: DebugBarRefreshKind,
) {
  const bar = site.debugBar;
  if (!bar) return;

  if (kind === "build") {
    // --- Build status item -------------------------------------------------
    const otelDeno = readEnv("OTEL_DENO") === "true";

    if (mode === "development" && !otelDeno) {
      bar.buildItem(
        "OpenTelemetry: <code>OTEL_DENO</code> is not set — span enrichment disabled",
        "warn",
      );
    } else {
      bar.buildItem(
        `OpenTelemetry active &mdash; tracer <strong>${options.name}</strong> v${options.version}`,
        "info",
      );
    }
  }

  // --- "OpenTelemetry" collection: config summary --------------------------

  const cfg = bar.collection("OpenTelemetry");
  cfg.icon = "activity";
  cfg.empty = "No OpenTelemetry configuration";
  cfg.items = [];

  cfg.items.push({ title: "Mode", details: mode });

  // Suggest http/json in dev when OTEL is active but protocol is not set.
  const otelDeno = readEnv("OTEL_DENO") === "true";
  if (mode === "development" && otelDeno) {
    const proto = readEnv("OTEL_EXPORTER_OTLP_PROTOCOL");
    if (proto !== "http/json") {
      cfg.items.push({
        title: "Tip: set <code>OTEL_EXPORTER_OTLP_PROTOCOL=http/json</code>",
        text:
          "The default protocol is http/protobuf (binary). In development,\n" +
          "http/json produces human-readable exports easier to inspect locally.",
      });
    }
  }

  if (options.routes?.length) {
    cfg.items.push({
      title: "Route patterns",
      details: options.routes.length,
      items: options.routes.map((p) => ({ title: p.pathname })),
    });
  }

  const ignorePatterns = options.ignore ?? [];
  if (ignorePatterns.length > 0) {
    cfg.items.push({
      title: "Ignore patterns",
      details: ignorePatterns.length,
      items: ignorePatterns.map((re) => ({ title: re.source })),
    });
  }

  if (options.attributes) {
    const attrs = Object.entries(options.attributes);
    if (attrs.length > 0) {
      cfg.items.push({
        title: "Custom span attributes",
        details: attrs.length,
        items: attrs.map(([key, value]) => ({ title: key, details: value })),
      });
    }
  }

  // --- "Requests" collection: dev mode only --------------------------------

  if (mode !== "development") return;

  const req = bar.collection("Requests");
  req.icon = "arrows-clockwise";
  req.empty = "No requests yet";
  req.contexts = {
    error: { background: "error" },
    warn: { background: "warning" },
  };
  req.items = [];

  if (recentRequests.length > 0) {
    req.items.push({
      title: "Recent requests",
      details: recentRequests.length,
      items: [...recentRequests].reverse().map((r) => {
        const context = r.status >= 500
          ? "error"
          : r.status >= 400
          ? "warn"
          : undefined;

        return {
          title: `${r.method} ${r.route}`,
          details: `${r.status} · ${Math.round(r.durationMs)}ms`,
          ...(context ? { context } : {}),
          ...(r.error ? { text: r.error } : {}),
        };
      }),
    });
  }

  if (counters.size > 0) {
    const byRoute = new Map<string, Map<number, number>>();
    for (const [key, count] of counters) {
      const [method, route, statusCode] = key.split("\x00");

      if (!method || !route || !statusCode) {
        continue;
      }

      const status = Number(statusCode);

      if (Number.isNaN(status)) {
        continue;
      }

      const routeKey = `${method} ${route}`;
      const routeCounters = byRoute.get(routeKey);

      if (routeCounters) {
        routeCounters.set(status, count);
        continue;
      }

      byRoute.set(routeKey, new Map([[status, count]]));
    }

    req.items.push({
      title: "Route counters",
      details: byRoute.size,
      items: Array.from(byRoute.entries()).map(([routeKey, statuses]) => {
        const total = Array.from(statuses.values()).reduce((a, b) => a + b, 0);
        return {
          title: routeKey,
          details: `${total} req`,
          items: Array.from(statuses.entries())
            .sort(([a], [b]) => a - b)
            .map(([status, count]) => {
              const context = status >= 500
                ? "error"
                : status >= 400
                ? "warn"
                : undefined;

              return {
                title: String(status),
                details: String(count),
                ...(context ? { context } : {}),
              };
            }),
        };
      }),
    });
  }
}

// ---------------------------------------------------------------------------
// Lume plugin — wraps createMiddleware with site integration and debug bar
// ---------------------------------------------------------------------------

/**
 * OpenTelemetry plugin for Lume.
 *
 * Automatically adapts to the execution context:
 *
 * - **Development** (`lume -s`): tracks requests in memory, logs each request
 *   and build event via `console.table()` (linked to the OTEL span when
 *   `OTEL_DENO=true`), and displays data in the debug bar.
 * - **Production** (Deno Deploy or any server without the debug bar): pure OTEL
 *   enrichment — `http.route`, span name, error status, exception events,
 *   error counters, and build lifecycle spans/metrics. Requires `OTEL_DENO=true`.
 *
 * On **Deno Deploy**, `OTEL_DENO` is enabled automatically by the platform.
 * No additional configuration is needed beyond deploying the application.
 *
 * @example
 * ```ts ignore
 * // The return type is already enforced by TypeScript. Meaningful behavioral
 * // coverage requires a live Site instance and is handled by integration
 * // tests rather than documentation tests.
 * import lume from "lume/mod.ts";
 *
 * const site = lume();
 * site.use(otel());
 * export default site;
 * ```
 */
export function otel(userOptions?: Partial<Options>): (site: OTelSite) => void {
  const options: Options = merge(defaults, userOptions ?? {});
  const readEnv = createEnvReader();

  // In-memory store shared between the middleware and the debug bar updater.
  const recentRequests: RequestRecord[] = [];
  const counters = new Map<string, number>();

  return (site: OTelSite) => {
    // Resolve mode once, at plugin setup time.
    const mode: "development" | "production" = options.mode === "development"
      ? "development"
      : options.mode === "production"
      ? "production"
      : site.debugBar
      ? "development"
      : "production";

    const isDev = mode === "development";
    const shouldLogRequests = isDev && options.logRequests;
    const maxRequests = normalizeMaxRequests(options.maxRequests);

    // -------------------------------------------------------------------------
    // Build lifecycle instrumentation (spans + metrics + console output)
    // -------------------------------------------------------------------------

    const tracer = trace.getTracer(options.name, options.version);
    const buildMeter = options.recordMetrics
      ? metrics.getMeter(options.name, options.version)
      : null;

    const buildDuration = buildMeter?.createHistogram("lume.build.duration", {
      description: "Lume site build or update duration",
      unit: "ms",
    });

    const buildCount = buildMeter?.createCounter("lume.build.count", {
      description: "Number of completed Lume builds",
      unit: "1",
    });

    let buildCounter = 0;
    let buildSpan: Span | undefined;
    let buildStartMs = 0;
    let changedFiles: string[] = [];

    function startBuild(files?: Set<string>) {
      buildStartMs = performance.now();
      changedFiles = files ? Array.from(files) : [];
      buildSpan = tracer.startSpan("lume.build");
    }

    function finishBuild(trigger: "build" | "update") {
      const durationMs = Math.round(performance.now() - buildStartMs);
      buildDuration?.record(durationMs, { "lume.build.trigger": trigger });
      buildCount?.add(1, { "lume.build.trigger": trigger });
      buildCounter++;

      if (shouldLogRequests) {
        const ctx = buildSpan?.spanContext();
        // console.groupCollapsed keeps build logs readable without flooding the terminal.
        console.groupCollapsed(
          `[otel] ${trigger} #${buildCounter} — ${durationMs}ms`,
        );
        console.table(
          [{
            trigger,
            ms: durationMs,
            files: changedFiles.length,
            ...(ctx ? { traceId: ctx.traceId, spanId: ctx.spanId } : {}),
          }],
          ["trigger", "ms", "files", ...(ctx ? ["traceId", "spanId"] : [])],
        );
        if (changedFiles.length > 0) {
          console.table(
            changedFiles.map((file) => ({ file })),
            ["file"],
          );
        }
        console.groupEnd();
      }

      buildSpan?.end();
      buildSpan = undefined;
      changedFiles = [];
    }

    site.addEventListener("beforeBuild", () => startBuild());
    site.addEventListener("afterBuild", () => finishBuild("build"));
    site.addEventListener("beforeUpdate", (event: unknown) => {
      const files = getUpdateEventFiles(event);
      startBuild(files);
    });
    site.addEventListener("afterUpdate", () => finishBuild("update"));

    // -------------------------------------------------------------------------
    // HTTP middleware
    // -------------------------------------------------------------------------

    const onRequest = isDev
      ? (record: RequestRecord) => {
        if (maxRequests > 0) {
          recentRequests.push(record);
          if (recentRequests.length > maxRequests) {
            recentRequests.shift();
          }
        }
        const key = `${record.method}\x00${record.route}\x00${record.status}`;
        counters.set(key, (counters.get(key) ?? 0) + 1);
        refreshDebugBar(
          site,
          mode,
          options,
          recentRequests,
          counters,
          readEnv,
          "request",
        );
      }
      : undefined;

    const server = site.getServer();
    server.addEventListener("start", () => {
      server.useFirst(createMiddleware(options, isDev, onRequest));
    }, { once: true });

    // -------------------------------------------------------------------------
    // Debug bar refresh on build events
    // -------------------------------------------------------------------------

    function onBuildEvent() {
      refreshDebugBar(
        site,
        mode,
        options,
        recentRequests,
        counters,
        readEnv,
        "build",
      );
    }

    site.addEventListener("beforeBuild", onBuildEvent);
    site.addEventListener("beforeUpdate", onBuildEvent);
  };
}

export default otel;

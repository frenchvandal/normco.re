import { merge } from "lume/core/utils/object.ts";
import type Site from "lume/core/site.ts";
import type { Middleware } from "lume/core/server.ts";
import type {
  Collection as DebugBarCollection,
  Item as DebugBarItem,
} from "lume/deps/debugbar.ts";

import { sumOf } from "@std/collections";
import { bold, cyan, dim, green, red, yellow } from "@std/fmt/colors";
import { metrics, SpanStatusCode, trace } from "@opentelemetry/api";
import type { Span } from "@opentelemetry/api";

// ---------------------------------------------------------------------------
// Types
//
// Reuse Lume core types where possible. Keep request records local so this
// module remains easy to extract later as a standalone plugin.
// ---------------------------------------------------------------------------

type OTelReadEnv = (name: string) => string | undefined;
type DebugBarRefreshKind = "build" | "request";
type OTelMode = "development" | "production";
const SUPPORTS_CONSOLE_COLORS = Deno.stdout.isTerminal();

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
 * assertEquals(STATIC_ASSETS_RE.test("/images/card.avif"), true);
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
const OTEL_EXPECTED_ENV_BY_MODE = {
  development: [
    "OTEL_SERVICE_NAME",
    "OTEL_EXPORTER_OTLP_PROTOCOL",
    "OTEL_EXPORTER_OTLP_ENDPOINT",
  ],
  production: [
    "OTEL_SERVICE_NAME",
    "OTEL_EXPORTER_OTLP_ENDPOINT",
  ],
} as const satisfies Record<OTelMode, ReadonlyArray<string>>;

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

function readNonEmptyEnv(
  readEnv: OTelReadEnv,
  name: string,
): string | undefined {
  const value = readEnv(name)?.trim();
  return value ? value : undefined;
}

function getMissingExpectedOtelEnv(
  mode: OTelMode,
  readEnv: OTelReadEnv,
): string[] {
  if (isDeployRuntime(readEnv)) {
    return [];
  }

  if (readNonEmptyEnv(readEnv, "OTEL_DENO") !== "true") {
    return ["OTEL_DENO"];
  }

  return OTEL_EXPECTED_ENV_BY_MODE[mode].filter((name) =>
    readNonEmptyEnv(readEnv, name) === undefined
  );
}

function isDeployRuntime(readEnv: OTelReadEnv): boolean {
  if (readNonEmptyEnv(readEnv, "DENO_DEPLOYMENT_ID")) {
    return true;
  }

  return readNonEmptyEnv(readEnv, "DENO_DEPLOY") === "true";
}

// ---------------------------------------------------------------------------
// Dev-mode in-memory store
// ---------------------------------------------------------------------------

interface RequestRecord {
  traceId?: string;
  spanId?: string;
  sampled?: boolean;
  method: string;
  path: string;
  protocol: string;
  route: string;
  status: number;
  durationMs: number;
  latencyClass?: "slow" | "very slow";
  requestBytes?: number;
  responseBytes?: number;
  userAgent?: string;
  error?: string;
  timestamp: number;
}

type SpanMetadata = Pick<RequestRecord, "traceId" | "spanId" | "sampled">;

function readContentLength(headers: Headers): number | undefined {
  const value = headers.get("content-length");

  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function classifyLatency(durationMs: number): RequestRecord["latencyClass"] {
  if (durationMs >= 1000) {
    return "very slow";
  }

  if (durationMs >= 250) {
    return "slow";
  }

  return undefined;
}

function createIgnorePathMatcher(
  patterns: ReadonlyArray<RegExp>,
): (pathname: string) => boolean {
  if (patterns.length === 0) {
    return () => false;
  }

  if (patterns.length === 1) {
    const pattern = patterns[0];

    if (!pattern) {
      return () => false;
    }

    return (pathname) => pattern.test(pathname);
  }

  return (pathname) => {
    for (const pattern of patterns) {
      if (pattern.test(pathname)) {
        return true;
      }
    }

    return false;
  };
}

function createSpanMetadata(span: Span | undefined): SpanMetadata {
  const spanContext = span?.spanContext();
  const sampled = spanContext
    ? (spanContext.traceFlags & 0x01) === 0x01
    : undefined;

  return {
    ...(spanContext?.traceId ? { traceId: spanContext.traceId } : {}),
    ...(spanContext?.spanId ? { spanId: spanContext.spanId } : {}),
    ...(sampled !== undefined ? { sampled } : {}),
  };
}

function createRequestRecord(
  options: {
    method: string;
    url: URL;
    route: string;
    status: number;
    durationMs: number;
    requestBytes?: number;
    responseBytes?: number;
    userAgent?: string;
    error?: string;
    spanMetadata: SpanMetadata;
  },
): RequestRecord {
  const {
    method,
    url,
    route,
    status,
    durationMs,
    requestBytes,
    responseBytes,
    userAgent,
    error,
    spanMetadata,
  } = options;
  const latencyClass = classifyLatency(durationMs);

  return {
    method,
    path: url.pathname,
    protocol: url.protocol.replace(":", ""),
    ...spanMetadata,
    route,
    status,
    durationMs,
    ...(latencyClass ? { latencyClass } : {}),
    ...(requestBytes !== undefined ? { requestBytes } : {}),
    ...(responseBytes !== undefined ? { responseBytes } : {}),
    ...(userAgent ? { userAgent } : {}),
    ...(error ? { error } : {}),
    timestamp: Date.now(),
  };
}

function colorizeConsoleText(
  value: string,
  formatter: (value: string) => string,
): string {
  return SUPPORTS_CONSOLE_COLORS ? formatter(value) : value;
}

function logMissingExpectedOtelEnv(mode: OTelMode, readEnv: OTelReadEnv): void {
  const missingEnv = getMissingExpectedOtelEnv(mode, readEnv);

  if (missingEnv.length === 0) {
    return;
  }

  const label = colorizeConsoleText("[otel]", (value) => bold(cyan(value)));
  const noun = missingEnv.length === 1
    ? "environment variable"
    : "environment variables";
  const hint = missingEnv.includes("OTEL_DENO")
    ? "Set OTEL_DENO=true to enable Deno OpenTelemetry instrumentation."
    : mode === "development"
    ? "Set them before `deno task serve` to export telemetry locally."
    : "Set them in the runtime environment to export telemetry data.";

  console.log(
    `${label} Missing expected OTEL ${noun}: ${missingEnv.join(", ")}. ${hint}`,
  );
}

function formatRequestStatus(status: number): string {
  const value = String(status);

  if (status >= 500) {
    return colorizeConsoleText(value, (text) => bold(red(text)));
  }

  if (status >= 400) {
    return colorizeConsoleText(value, yellow);
  }

  return colorizeConsoleText(value, green);
}

function formatRequestDuration(durationMs: number): string {
  const rounded = Math.round(durationMs);
  const value = String(rounded);

  if (rounded >= 1000) {
    return colorizeConsoleText(value, red);
  }

  if (rounded >= 250) {
    return colorizeConsoleText(value, yellow);
  }

  return colorizeConsoleText(value, green);
}

function formatRequestMethod(method: string): string {
  return colorizeConsoleText(method, (value) => bold(cyan(value)));
}

function formatRequestRoute(route: string): string {
  return colorizeConsoleText(route, dim);
}

function formatRequestError(message: string): string {
  return colorizeConsoleText(message, red);
}

function normalizeUserAgent(value: string | null): string | undefined {
  if (!value) {
    return undefined;
  }

  return value.length > 120 ? `${value.slice(0, 117)}...` : value;
}

/**
 * Builds a composite counter key for the in-memory request counter `Map`.
 *
 * A null byte (`\x00`) is used as the separator because route strings cannot
 * contain null bytes, making key collisions impossible without a more complex
 * data structure.
 */
function buildCounterKey(
  method: string,
  route: string,
  status: number,
): string {
  return `${method}\x00${route}\x00${status}`;
}

function toRequestDebugItem(record: RequestRecord): DebugBarItem {
  const context = record.status >= 500
    ? "error"
    : record.status >= 400
    ? "warn"
    : undefined;

  const latencySuffix = record.latencyClass ? ` · ${record.latencyClass}` : "";
  const responseBytes = record.responseBytes !== undefined
    ? ` · ${record.responseBytes}B`
    : "";

  const detailsItems: DebugBarItem[] = [
    { title: "Path", details: record.path },
    { title: "Protocol", details: record.protocol },
    ...(record.traceId ? [{ title: "Trace ID", details: record.traceId }] : []),
    ...(record.spanId ? [{ title: "Span ID", details: record.spanId }] : []),
    ...(record.sampled !== undefined
      ? [{ title: "Sampled", details: record.sampled ? "yes" : "no" }]
      : []),
    ...(record.userAgent
      ? [{ title: "User-Agent", details: record.userAgent }]
      : []),
    ...(record.requestBytes !== undefined
      ? [{ title: "Request bytes", details: record.requestBytes }]
      : []),
    ...(record.responseBytes !== undefined
      ? [{ title: "Response bytes", details: record.responseBytes }]
      : []),
  ];

  return {
    title: `${record.method} ${record.route}`,
    details: `${record.status} · ${
      Math.round(record.durationMs)
    }ms${responseBytes}${latencySuffix}`,
    items: detailsItems,
    ...(context ? { context } : {}),
    ...(record.error ? { text: record.error } : {}),
  };
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
  const shouldIgnorePath = createIgnorePathMatcher(ignorePatterns);

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
    const requestBytes = readContentLength(request.headers);
    const userAgent = normalizeUserAgent(request.headers.get("user-agent"));

    // Skip tracing for requests matching ignore patterns (e.g. static assets).
    if (shouldIgnorePath(url.pathname)) {
      return next(request);
    }

    // Normalize the route to a URLPattern pathname (e.g. "/posts/:slug") to
    // prevent unbounded metric cardinality. Falls back to the raw pathname.
    const route = matchRoute(url, options.routes);

    // Deno creates a span per request automatically, but does not add an
    // `http.route` attribute or set the span name to include the route.
    const span = trace.getActiveSpan();
    const spanMetadata = createSpanMetadata(span);

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
      const durationMs = performance.now() - start;
      const record = createRequestRecord({
        method,
        url,
        route,
        status: 500,
        durationMs,
        spanMetadata,
        ...(requestBytes !== undefined ? { requestBytes } : {}),
        ...(userAgent ? { userAgent } : {}),
        error: message,
      });
      if (devMode && options.logRequests) {
        // Called inside the active span: OTEL links this log to the trace.
        console.table(
          [{
            method: formatRequestMethod(method),
            route: formatRequestRoute(route),
            status: formatRequestStatus(500),
            ms: formatRequestDuration(record.durationMs),
            error: formatRequestError(message),
          }],
          ["method", "route", "status", "ms", "error"],
        );
      }
      onRequest?.(record);
      throw error;
    }

    const { status } = response;
    const durationMs = performance.now() - start;
    const responseBytes = readContentLength(response.headers);

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

    const record = createRequestRecord({
      method,
      url,
      route,
      status,
      durationMs,
      spanMetadata,
      ...(requestBytes !== undefined ? { requestBytes } : {}),
      ...(responseBytes !== undefined ? { responseBytes } : {}),
      ...(userAgent ? { userAgent } : {}),
    });

    if (devMode && options.logRequests) {
      // Called inside the active span: OTEL links this log to the trace.
      console.table(
        [{
          method: formatRequestMethod(method),
          route: formatRequestRoute(route),
          status: formatRequestStatus(status),
          ms: formatRequestDuration(durationMs),
        }],
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

function resolveMode(
  requestedMode: Options["mode"] | undefined,
  deployRuntime: boolean,
  hasDebugBar: boolean,
): OTelMode {
  if (requestedMode === "development" || requestedMode === "production") {
    return requestedMode;
  }

  if (deployRuntime) {
    return "production";
  }

  return hasDebugBar ? "development" : "production";
}

// ---------------------------------------------------------------------------
// Debug bar helpers
// ---------------------------------------------------------------------------

function refreshDebugBar(
  site: Site,
  mode: OTelMode,
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

  const cfg: DebugBarCollection = bar.collection("OpenTelemetry");
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

  const req: DebugBarCollection = bar.collection("Requests");
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
      items: [...recentRequests].reverse().map(toRequestDebugItem),
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
        const total = sumOf(statuses.values(), (count) => count);
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
export function otel(userOptions?: Partial<Options>): (site: object) => void {
  const options: Options = merge(defaults, userOptions ?? {});
  const readEnv = createEnvReader();

  // In-memory store shared between the middleware and the debug bar updater.
  const recentRequests: RequestRecord[] = [];
  const counters = new Map<string, number>();

  return (site: object) => {
    const typedSite = site as Site;

    // Resolve mode once, at plugin setup time.
    const deployRuntime = isDeployRuntime(readEnv);
    const mode = resolveMode(
      options.mode,
      deployRuntime,
      typedSite.debugBar !== undefined,
    );

    const isDev = mode === "development";
    logMissingExpectedOtelEnv(mode, readEnv);
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
        const otelLabel = colorizeConsoleText(
          "[otel]",
          (value) => bold(cyan(value)),
        );
        const triggerLabel = colorizeConsoleText(trigger, bold);
        const durationLabel = formatRequestDuration(durationMs);
        // console.groupCollapsed keeps build logs readable without flooding the terminal.
        console.groupCollapsed(
          `${otelLabel} ${triggerLabel} #${buildCounter} — ${durationLabel}ms`,
        );
        console.table(
          [{
            trigger: triggerLabel,
            ms: durationLabel,
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

    typedSite.addEventListener("beforeBuild", () => startBuild());
    typedSite.addEventListener("afterBuild", () => finishBuild("build"));
    typedSite.addEventListener("beforeUpdate", (event: unknown) => {
      const files = getUpdateEventFiles(event);
      startBuild(files);
    });
    typedSite.addEventListener("afterUpdate", () => finishBuild("update"));

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
        const key = buildCounterKey(record.method, record.route, record.status);
        counters.set(key, (counters.get(key) ?? 0) + 1);
        refreshDebugBar(
          typedSite,
          mode,
          options,
          recentRequests,
          counters,
          readEnv,
          "request",
        );
      }
      : undefined;

    // The middleware is registered lazily on the "start" event rather than
    // via `server.use()` directly. This allows getServer() to be called before
    // the server instance is fully initialized. The { once: true } option
    // ensures the listener fires exactly once and is automatically removed,
    // preventing duplicate middleware registrations on hot reloads.
    const server = typedSite.getServer();
    server.addEventListener("start", () => {
      server.useFirst(createMiddleware(options, isDev, onRequest));
    }, { once: true });

    // -------------------------------------------------------------------------
    // Debug bar refresh on build events
    // -------------------------------------------------------------------------

    function onBuildEvent() {
      refreshDebugBar(
        typedSite,
        mode,
        options,
        recentRequests,
        counters,
        readEnv,
        "build",
      );
    }

    typedSite.addEventListener("beforeBuild", onBuildEvent);
    typedSite.addEventListener("beforeUpdate", onBuildEvent);
  };
}

export default otel;

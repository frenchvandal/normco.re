# OpenTelemetry Plugin for Lume

Enriches the HTTP spans that `Deno.serve` creates automatically and adds a
request dashboard to the Lume debug bar during local development.

This document describes the in-repository plugin at `plugins/otel.ts`.

## Requirements

- Deno 2.7.5 or later
- In production: `OTEL_DENO=true` and a configured OTLP exporter. On Deno Deploy
  neither is required—the platform enables them automatically.

## Usage

```ts
// _config.ts
import lume from "lume/mod.ts";
import otelPlugin from "./plugins/otel.ts";

const site = lume();
site.use(otelPlugin());
export default site;
```

## Modes

The plugin detects its execution context and adapts accordingly. You can also
set `mode` explicitly if the default behavior does not suit your setup.

### Development (`lume -s`)

Activated automatically whenever the Lume debug bar is available.

**Terminal output.** Two kinds of structured logs are emitted, both linked to
the active OTEL span when `OTEL_DENO=true`:

_Requests_ — one `console.table()` call per request:

```
┌───────┬────────┬──────────────────┬────────┬────┐
│ (idx) │ method │ route            │ status │ ms │
├───────┼────────┼──────────────────┼────────┼────┤
│     0 │ "GET"  │ "/posts/:slug"   │    200 │ 12 │
└───────┴────────┴──────────────────┴────────┴────┘
```

_Builds_ — one `console.groupCollapsed` entry after each build or hot-reload,
including the `traceId` and `spanId` so you can locate the span in
Grafana/Tempo:

```
▶ [otel] update #3 — 87ms
```

**Debug bar.** Two tabs are added and refreshed on every hot-reload:

- **OpenTelemetry** — active configuration summary
- **Requests** — recent request list and per-route status counters

**Recommended protocol for local OTEL.** If you run `OTEL_DENO=true` locally
(for example with the
[Grafana LGTM stack](https://github.com/grafana/docker-otel-lgtm)), use
`http/json` instead of the default `http/protobuf`. JSON payloads are
human-readable in browser DevTools and network inspectors, which simplifies
debugging the export pipeline itself. Switch back to `http/protobuf` in
production for efficiency.

```bash
OTEL_DENO=true \
OTEL_EXPORTER_OTLP_PROTOCOL=http/json \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 \
deno task serve
```

The debug bar surfaces a reminder when `OTEL_DENO=true` is set but the protocol
is not `http/json`.

### Production (Deno Deploy, standalone Deno server)

Activated automatically whenever the debug bar is unavailable.

On **Deno Deploy**, `OTEL_DENO` is enabled by the platform—no additional
configuration is needed. Traces, metrics, and logs appear in the Deno Deploy
dashboard under the Traces, Metrics, and Logs tabs.

For other environments, set the standard environment variables described under
[Environment Variables](#environment-variables).

The plugin enriches the spans Deno creates automatically for each `Deno.serve`
request:

- A normalized `http.route` attribute (e.g., `/posts/:slug`) when `routes` is
  configured
- A span name matching OTel semantic conventions (`GET /posts/:slug`)
- An `ERROR` span status for 5xx responses
- An exception event on the span whenever the handler throws
- Optional `http.server.errors` and `http.server.not_found` counters
- Optional static attributes on every span

## Options

| Option          | Type                                      | Default                 | Description                                                         |
| --------------- | ----------------------------------------- | ----------------------- | ------------------------------------------------------------------- |
| `name`          | `string`                                  | `"lume"`                | Tracer and meter name                                               |
| `version`       | `string`                                  | `"1.0.0"`               | Service version                                                     |
| `mode`          | `"auto" \| "development" \| "production"` | `"auto"`                | Override mode detection                                             |
| `recordMetrics` | `boolean`                                 | `true`                  | Emit HTTP error counters and build metrics                          |
| `maxRequests`   | `number`                                  | `50`                    | In-memory request buffer size (development only)                    |
| `logRequests`   | `boolean`                                 | `true`                  | Log each request and build event to the terminal (development only) |
| `attributes`    | `Record<string, string>`                  | —                       | Static attributes added to every span                               |
| `routes`        | `URLPattern[]`                            | —                       | Patterns used to normalize `http.route`                             |
| `ignore`        | `RegExp[]`                                | Static asset extensions | Request paths to skip                                               |

### `routes`—Route Normalization

Without this option, every distinct URL becomes a unique `http.route` value,
producing unbounded cardinality in your metrics backend. With `routes`, the
first matching pattern is used instead:

```ts
site.use(otel({
  routes: [
    new URLPattern({ pathname: "/posts/:slug" }),
    new URLPattern({ pathname: "/tags/:tag" }),
  ],
}));
// GET /posts/hello-world  →  span "GET /posts/:slug"
// GET /about              →  span "GET /about"  (no match, falls back to pathname)
```

### `ignore`—Request Filtering

Common static asset extensions are excluded by default. The exported
`STATIC_ASSETS_RE` constant lets you extend or replace the default list:

```ts
import otelPlugin, { STATIC_ASSETS_RE } from "./plugins/otel.ts";

site.use(otelPlugin({
  ignore: [STATIC_ASSETS_RE, /^\/healthz$/, /^\/metrics$/],
}));
```

To trace every request without exception: `otel({ ignore: [] })`

### `attributes`—Custom Span Attributes

```ts
site.use(otel({
  attributes: {
    "deployment.environment": "production",
    "host.region": "eu-west-1",
  },
}));
```

## What the Plugin Adds

The table below shows what Deno instruments automatically versus what this
plugin contributes on top.

| Signal                                         | Deno | This plugin |
| ---------------------------------------------- | ---- | ----------- |
| `http.request.duration` histogram              | ✓    | —           |
| `http.server.active_requests` gauge            | ✓    | —           |
| Request/response body sizes                    | ✓    | —           |
| W3C trace context propagation                  | ✓    | —           |
| `http.route` attribute on the span             | ✗    | ✓           |
| Span name (`GET /posts/:slug`)                 | ✗    | ✓           |
| `ERROR` status on 5xx responses                | ✗    | ✓           |
| Exception recorded on the span                 | ✗    | ✓           |
| `http.server.errors` counter                   | ✗    | ✓ opt.      |
| `http.server.not_found` counter                | ✗    | ✓ opt.      |
| Custom span attributes                         | ✗    | ✓ opt.      |
| `lume.build` span per build/rebuild            | ✗    | ✓           |
| `lume.build.duration` histogram                | ✗    | ✓ opt.      |
| `lume.build.count` counter                     | ✗    | ✓ opt.      |
| `console.table()` per request (linked to span) | ✗    | ✓ dev       |
| Build log with `traceId`/`spanId`              | ✗    | ✓ dev       |
| Recent requests in the debug bar               | ✗    | ✓ dev       |
| Per-route status counters in the debug bar     | ✗    | ✓ dev       |

## Metrics Reference

### HTTP

| Name                    | Type    | Attributes                                                       | Description               |
| ----------------------- | ------- | ---------------------------------------------------------------- | ------------------------- |
| `http.server.errors`    | Counter | `http.request.method`, `http.route`, `http.response.status_code` | All 4xx and 5xx responses |
| `http.server.not_found` | Counter | `http.request.method`, `http.route`                              | 404 responses             |

### Build

| Name                  | Type      | Attributes                               | Description                              |
| --------------------- | --------- | ---------------------------------------- | ---------------------------------------- |
| `lume.build.duration` | Histogram | `lume.build.trigger` (`build`\|`update`) | Build or update duration in milliseconds |
| `lume.build.count`    | Counter   | `lume.build.trigger`                     | Total number of completed builds         |

## Environment Variables

### Deno Deploy

No configuration required. The platform manages all observability settings.

### Local development with OTEL

```bash
OTEL_DENO=true \
OTEL_SERVICE_NAME=my-site \
OTEL_EXPORTER_OTLP_PROTOCOL=http/json \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 \
deno task serve
```

To spin up a local LGTM stack (Grafana, Tempo, Prometheus, Loki):

```bash
docker run --name lgtm -p 3000:3000 -p 4317:4317 -p 4318:4318 --rm -ti \
  docker.io/grafana/otel-lgtm:0.8.1
# Open Grafana at http://localhost:3000  (admin / admin)
```

### Standalone Deno server

| Variable                      | Example                  | Description                                                   |
| ----------------------------- | ------------------------ | ------------------------------------------------------------- |
| `OTEL_DENO`                   | `true`                   | **Required.** Enables Deno's built-in instrumentation         |
| `OTEL_SERVICE_NAME`           | `my-site`                | Service name shown in traces                                  |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | `http://localhost:4318`  | OTLP collector endpoint                                       |
| `OTEL_EXPORTER_OTLP_PROTOCOL` | `http/protobuf`          | Use `http/json` in development, `http/protobuf` in production |
| `OTEL_EXPORTER_OTLP_HEADERS`  | `Authorization=Bearer …` | Authentication headers if required                            |

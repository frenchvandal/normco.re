import { metrics, type Span, trace } from "npm/opentelemetry-api";

/** Minimal structural interface for the subset of the Lume Site API used by this plugin. */
export interface PluginSite {
  /** Registers a listener for a named build lifecycle event. */
  addEventListener(type: string, fn: () => void): void;
}

interface BuildConsoleRecord {
  buildCount: number;
  durationMs: number;
  endTimeIso: string;
  protocol: string;
  serviceName: string;
  spanId: string;
  spanName: string;
  startTimeIso: string;
  traceId: string;
}

/**
 * Lume plugin that instruments the build pipeline with OpenTelemetry.
 *
 * When `OTEL_DENO=true` is set, the plugin exports:
 *
 * - A `lume.build` trace span covering the full build lifecycle
 * - A `lume.build.duration` histogram recording build time in milliseconds
 * - A `lume.build.count` counter incremented on every completed build
 *
 * If `OTEL_EXPORTER_OTLP_PROTOCOL=http/json`, the plugin also prints a
 * structured build record to the console (`console.table` + raw JSON), useful
 * for local development inspection without a full LGTM stack.
 *
 * Without `OTEL_DENO=true`, all OTel calls are no-ops with negligible
 * overhead — the plugin is safe to register unconditionally.
 *
 * @example
 * ```ts ignore
 * // In _config.ts:
 * import otelPlugin from "./plugins/otel.ts";
 * site.use(otelPlugin());
 * ```
 */
export default function otelPlugin(): (site: PluginSite) => void {
  return (site: PluginSite): void => {
    const tracer = trace.getTracer("normcore", "1.0.0");
    const meter = metrics.getMeter("normcore", "1.0.0");
    const otelEnabled = Deno.env.get("OTEL_DENO") === "true";
    const protocol = Deno.env.get("OTEL_EXPORTER_OTLP_PROTOCOL") ??
      "http/json";
    const consoleOutputEnabled = otelEnabled && protocol === "http/json";
    const serviceName = Deno.env.get("OTEL_SERVICE_NAME") ?? "lume build";

    const buildDuration = meter.createHistogram("lume.build.duration", {
      description: "Lume site build duration",
      unit: "ms",
    });

    const buildCount = meter.createCounter("lume.build.count", {
      description: "Number of completed Lume builds",
      unit: "1",
    });

    let buildCounter = 0;
    let buildStartPerformanceMs = 0;
    let buildStartEpochMs = 0;
    let buildSpan: Span | undefined;

    site.addEventListener("beforeBuild", () => {
      buildStartPerformanceMs = performance.now();
      buildStartEpochMs = Date.now();
      buildSpan = tracer.startSpan("lume.build");
    });

    site.addEventListener("afterBuild", () => {
      const durationMs = Math.round(
        performance.now() - buildStartPerformanceMs,
      );
      const endEpochMs = Date.now();
      buildDuration.record(durationMs);
      buildCount.add(1);
      buildCounter += 1;

      if (consoleOutputEnabled && buildSpan) {
        const spanContext = buildSpan.spanContext();
        const buildRecord: BuildConsoleRecord = {
          buildCount: buildCounter,
          durationMs,
          endTimeIso: new Date(endEpochMs).toISOString(),
          protocol,
          serviceName,
          spanId: spanContext.spanId,
          spanName: "lume.build",
          startTimeIso: new Date(buildStartEpochMs).toISOString(),
          traceId: spanContext.traceId,
        };

        console.log("\nOpenTelemetry local record (OTLP http/json):");
        console.table([buildRecord]);
        console.log(JSON.stringify(buildRecord, null, 2));
      }

      buildSpan?.end();
      buildSpan = undefined;
    });
  };
}

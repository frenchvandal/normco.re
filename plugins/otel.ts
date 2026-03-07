import { metrics, type Span, trace } from "npm/opentelemetry-api";

/** Minimal structural interface for the subset of the Lume Site API used by this plugin. */
export interface PluginSite {
  /** Registers a listener for a named build lifecycle event. */
  addEventListener(
    type: string,
    fn: (event?: { files?: Set<string> }) => void,
  ): void;
}

interface BuildConsoleRecord {
  buildCount: number;
  changedFiles: string[];
  durationMs: number;
  endTimeIso: string;
  protocol: string;
  serviceName: string;
  spanId: string;
  spanName: string;
  trigger: "build" | "update";
  startTimeIso: string;
  traceId: string;
}

/**
 * Lume plugin that instruments build and watch updates with OpenTelemetry.
 *
 * When `OTEL_DENO=true` is set, the plugin exports:
 *
 * - A `lume.build` trace span covering each build/update lifecycle
 * - A `lume.build.duration` histogram recording lifecycle time in milliseconds
 * - A `lume.build.count` counter incremented on every completed lifecycle
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
    let changedFiles: Set<string> = new Set();
    let buildSpan: Span | undefined;

    const startLifecycle = (files?: Set<string>): void => {
      buildStartPerformanceMs = performance.now();
      buildStartEpochMs = Date.now();
      changedFiles = files ?? new Set();
      buildSpan = tracer.startSpan("lume.build");
    };

    const finishLifecycle = (trigger: "build" | "update"): void => {
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
          changedFiles: Array.from(changedFiles),
          durationMs,
          endTimeIso: new Date(endEpochMs).toISOString(),
          protocol,
          serviceName,
          spanId: spanContext.spanId,
          spanName: "lume.build",
          trigger,
          startTimeIso: new Date(buildStartEpochMs).toISOString(),
          traceId: spanContext.traceId,
        };

        console.log("\nOpenTelemetry local record (OTLP http/json):");
        console.table([buildRecord]);
        console.log(JSON.stringify(buildRecord, null, 2));
      }

      buildSpan?.end();
      buildSpan = undefined;
      changedFiles = new Set();
    };

    site.addEventListener("beforeBuild", () => {
      startLifecycle();
    });

    site.addEventListener("afterBuild", () => {
      finishLifecycle("build");
    });

    site.addEventListener("beforeUpdate", (event) => {
      startLifecycle(event?.files);
    });

    site.addEventListener("afterUpdate", () => {
      finishLifecycle("update");
    });
  };
}

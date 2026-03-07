import { metrics, type Span, trace } from "npm/opentelemetry-api";

import { readConsoleDebugPolicy } from "./console_debug.ts";

/** Minimal structural interface for the subset of the Lume Site API used by this plugin. */
export interface PluginSite {
  /** Registers a listener for a named build lifecycle event. */
  addEventListener(
    type: string,
    fn: (event?: unknown) => void,
  ): unknown;
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
 * If `OTEL_EXPORTER_OTLP_PROTOCOL=http/json`, the plugin can print structured
 * console diagnostics (`console.table`) controlled by `DEBUG_CONSOLE_LEVEL`
 * (`summary` by default, `verbose` for deeper inspection, `off` to silence).
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
    const readEnv = (name: string): string | undefined => {
      try {
        return Deno.env.get(name);
      } catch (error) {
        if (error instanceof Deno.errors.NotCapable) {
          return undefined;
        }

        throw error;
      }
    };

    const tracer = trace.getTracer("normcore", "1.0.0");
    const meter = metrics.getMeter("normcore", "1.0.0");
    const otelEnabled = readEnv("OTEL_DENO") === "true";
    const protocol = readEnv("OTEL_EXPORTER_OTLP_PROTOCOL") ??
      "http/json";
    const consoleOutputEnabled = otelEnabled && protocol === "http/json";
    const debugPolicy = readConsoleDebugPolicy(readEnv);
    const serviceName = readEnv("OTEL_SERVICE_NAME") ?? "lume build";

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

      if (consoleOutputEnabled && debugPolicy.level === "verbose") {
        console.count("otel:lifecycle");
      }
    };

    const finishLifecycle = (trigger: "build" | "update"): void => {
      const durationMs = Math.round(
        performance.now() - buildStartPerformanceMs,
      );
      const endEpochMs = Date.now();
      buildDuration.record(durationMs);
      buildCount.add(1);
      buildCounter += 1;

      if (consoleOutputEnabled && buildSpan && debugPolicy.level !== "off") {
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

        console.groupCollapsed(
          `OpenTelemetry local record (${trigger}) #${buildCounter}`,
        );
        console.table([buildRecord], [
          "buildCount",
          "trigger",
          "durationMs",
          "changedFiles",
          "serviceName",
          "traceId",
        ]);

        if (debugPolicy.level === "verbose") {
          if (changedFiles.size > 0) {
            console.table(
              Array.from(changedFiles).map((filePath) => ({ filePath })),
              ["filePath"],
            );
          }
          console.dir(buildRecord);

          if (debugPolicy.includeTrace) {
            console.trace("OpenTelemetry lifecycle stack trace");
          }
        }
        console.groupEnd();
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
      const eventValue = event as { files?: Set<string> } | undefined;
      startLifecycle(eventValue?.files);
    });

    site.addEventListener("afterUpdate", () => {
      finishLifecycle("update");
    });
  };
}

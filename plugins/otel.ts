import { metrics, type Span, trace } from "npm/opentelemetry-api";

/** Minimal structural interface for the subset of the Lume Site API used by this plugin. */
export interface PluginSite {
  /** Registers a listener for a named build lifecycle event. */
  addEventListener(type: string, fn: () => void): void;
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

    const buildDuration = meter.createHistogram("lume.build.duration", {
      description: "Lume site build duration",
      unit: "ms",
    });

    const buildCount = meter.createCounter("lume.build.count", {
      description: "Number of completed Lume builds",
      unit: "1",
    });

    let buildStart = 0;
    let buildSpan: Span | undefined;

    site.addEventListener("beforeBuild", () => {
      buildStart = performance.now();
      buildSpan = tracer.startSpan("lume.build");
    });

    site.addEventListener("afterBuild", () => {
      const duration = Math.round(performance.now() - buildStart);
      buildDuration.record(duration);
      buildCount.add(1);
      buildSpan?.end();
      buildSpan = undefined;
    });
  };
}

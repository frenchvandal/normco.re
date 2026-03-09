import { metrics, type Span, trace } from "npm/opentelemetry-api";

import { readConsoleDebugPolicy } from "./console_debug.ts";

const MAX_DEBUG_BAR_RECORDS = 20;

interface OTelDebugBarAction {
  text: string;
  href: string;
}

interface OTelDebugBarItem {
  title: string;
  description?: string;
  actions?: OTelDebugBarAction[];
}

interface OTelDebugBarCollection {
  icon?: string;
  items?: OTelDebugBarItem[];
}

interface OTelDebugBar {
  collection(name: string): OTelDebugBarCollection | undefined;
}

/** Minimal site interface used by the OpenTelemetry plugin. */
export interface OTelPluginSite {
  /** Registers lifecycle listeners consumed by this plugin. */
  addEventListener(type: string, fn: (event?: unknown) => void): unknown;
  /** Optional Lume debug bar API available in development mode. */
  debugBar?: OTelDebugBar;
}

/** Reads an environment variable value used by the plugin runtime. */
export type OTelReadEnv = (name: string) => string | undefined;

type OTelLifecycleTrigger = "build" | "update";

interface BuildRecord {
  buildCount: number;
  changedFiles: string[];
  durationMs: number;
  endTimeIso: string;
  protocol: string;
  serviceName: string;
  spanId: string;
  spanName: string;
  trigger: OTelLifecycleTrigger;
  startTimeIso: string;
  traceId: string;
}

function buildDebugBarDescription(record: BuildRecord): string {
  const changedFiles = record.changedFiles.length === 0
    ? "none"
    : `\n${record.changedFiles.map((filePath) => `- ${filePath}`).join("\n")}`;

  return [
    `Service: ${record.serviceName}`,
    `Protocol: ${record.protocol}`,
    `Span: ${record.spanName}`,
    `Trace ID: ${record.traceId}`,
    `Span ID: ${record.spanId}`,
    `Window: ${record.startTimeIso} → ${record.endTimeIso}`,
    `Changed files (${record.changedFiles.length}): ${changedFiles}`,
  ].join("\n");
}

function toDebugBarItem(record: BuildRecord): OTelDebugBarItem {
  return {
    title: `#${record.buildCount} ${record.trigger} • ${record.durationMs} ms`,
    description: buildDebugBarDescription(record),
  };
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
 * console diagnostics (`console.table`) controlled by `LUME_LOGS` through the
 * shared console debug policy (`debug` -> verbose, `critical` -> off).
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
export default function otelPlugin(
  readEnvArg?: OTelReadEnv,
): (site: OTelPluginSite) => void {
  return (site: OTelPluginSite): void => {
    const readEnv = readEnvArg ?? ((name: string): string | undefined => {
      try {
        return Deno.env.get(name);
      } catch (error) {
        // deno-coverage-ignore Defensive branch triggered only by runtime permission boundaries.
        if (error instanceof Deno.errors.NotCapable) {
          return undefined;
        }

        throw error;
      }
    });

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
    const buildRecords: BuildRecord[] = [];
    let buildSpan: Span | undefined;

    const updateOtelDebugCollection = (): void => {
      const collection = site.debugBar?.collection("OpenTelemetry");

      if (!collection) {
        return;
      }

      collection.icon = "activity";

      if (!otelEnabled) {
        collection.items = [{
          title: "OpenTelemetry disabled",
          description:
            "Set OTEL_DENO=true to collect and display local build lifecycle records",
        }];
        return;
      }

      if (buildRecords.length === 0) {
        collection.items = [{
          title: "No lifecycle record yet",
          description:
            "Run a build or edit a watched file to populate OpenTelemetry records",
        }];
        return;
      }

      collection.items = Array.from(buildRecords).reverse().map(toDebugBarItem);
    };

    const rememberBuildRecord = (record: BuildRecord): void => {
      buildRecords.push(record);

      if (buildRecords.length > MAX_DEBUG_BAR_RECORDS) {
        buildRecords.shift();
      }
    };

    const startLifecycle = (files?: Set<string>): void => {
      buildStartPerformanceMs = performance.now();
      buildStartEpochMs = Date.now();
      changedFiles = files ? new Set(files) : new Set();
      buildSpan = tracer.startSpan("lume.build");

      if (consoleOutputEnabled && debugPolicy.level === "verbose") {
        console.count("otel:lifecycle");
      }
    };

    const finishLifecycle = (trigger: OTelLifecycleTrigger): void => {
      const durationMs = Math.round(
        performance.now() - buildStartPerformanceMs,
      );
      const endEpochMs = Date.now();
      buildDuration.record(durationMs);
      buildCount.add(1);
      buildCounter += 1;

      if (buildSpan) {
        const spanContext = buildSpan.spanContext();
        const buildRecord: BuildRecord = {
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

        rememberBuildRecord(buildRecord);

        if (consoleOutputEnabled && debugPolicy.level !== "off") {
          console.groupCollapsed(
            `OpenTelemetry local record (${trigger}) #${buildCounter} [LUME_LOGS=${debugPolicy.lumeLogs}]`,
          );
          console.table([buildRecord], [
            "buildCount",
            "trigger",
            "durationMs",
            "changedFiles",
            "serviceName",
            "traceId",
          ]);

          // deno-coverage-ignore-start Debug-only diagnostics kept lightweight in tests.
          if (debugPolicy.level === "verbose") {
            if (buildRecord.changedFiles.length > 0) {
              console.table(
                buildRecord.changedFiles.map((filePath) => ({ filePath })),
                ["filePath"],
              );
            }
            console.dir(buildRecord);

            if (debugPolicy.includeTrace) {
              console.trace("OpenTelemetry lifecycle stack trace");
            }
          }
          // deno-coverage-ignore-stop
          console.groupEnd();
        }
      }

      updateOtelDebugCollection();
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

    site.addEventListener("beforeSave", () => {
      updateOtelDebugCollection();
    });
  };
}

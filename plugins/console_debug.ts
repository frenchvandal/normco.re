/** Lume log levels accepted by the `LUME_LOGS` environment variable. */
export type LumeLogLevel =
  | "debug"
  | "info"
  | "warning"
  | "error"
  | "critical";

/** Console verbosity levels for local diagnostics output. */
export type ConsoleDebugLevel = "off" | "summary" | "verbose";

/** Runtime policy that controls how much data is emitted to the console. */
export interface ConsoleDebugPolicy {
  /** Selected verbosity level. */
  level: ConsoleDebugLevel;
  /** Whether stack traces should be emitted for deeper investigations. */
  includeTrace: boolean;
  /** Raw normalized `LUME_LOGS` value used to derive this policy. */
  lumeLogs: LumeLogLevel;
}

const LOG_LEVEL_TO_POLICY = {
  critical: { includeTrace: false, level: "off" },
  debug: { includeTrace: true, level: "verbose" },
  error: { includeTrace: false, level: "summary" },
  info: { includeTrace: false, level: "summary" },
  warning: { includeTrace: false, level: "summary" },
} as const satisfies Record<
  LumeLogLevel,
  Pick<ConsoleDebugPolicy, "includeTrace" | "level">
>;

/**
 * Reads a generic, `LUME_LOGS`-driven console debugging policy.
 *
 * This makes the same entry point reusable by any plugin or utility in this
 * repository without introducing feature-specific environment variables.
 *
 * Mapping used:
 * - `debug` -> `verbose` + stack traces enabled
 * - `info` / `warning` / `error` -> `summary`
 * - `critical` -> `off`
 */
export function readConsoleDebugPolicy(
  readEnv: (name: string) => string | undefined,
): ConsoleDebugPolicy {
  const configuredLogLevel = (readEnv("LUME_LOGS") ?? "info").toLowerCase();

  const lumeLogs: LumeLogLevel = configuredLogLevel === "debug"
    ? "debug"
    : configuredLogLevel === "warning"
    ? "warning"
    : configuredLogLevel === "error"
    ? "error"
    : configuredLogLevel === "critical"
    ? "critical"
    : "info";

  return {
    ...LOG_LEVEL_TO_POLICY[lumeLogs],
    lumeLogs,
  };
}

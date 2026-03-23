export type LumeLogLevel =
  | "debug"
  | "info"
  | "warning"
  | "error"
  | "critical";

export type ConsoleDebugLevel = "off" | "summary" | "verbose";

export interface ConsoleDebugPolicy {
  level: ConsoleDebugLevel;
  includeTrace: boolean;
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

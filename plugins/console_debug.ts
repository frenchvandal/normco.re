/** Console verbosity levels for local debugging output. */
export type ConsoleDebugLevel = "off" | "summary" | "verbose";

/** Runtime policy that controls how much data is emitted to the console. */
export interface ConsoleDebugPolicy {
  /** Selected verbosity level. */
  level: ConsoleDebugLevel;
  /** Whether stack traces should be emitted for verbose investigations. */
  includeTrace: boolean;
}

/**
 * Reads a lightweight, env-driven console debugging policy.
 *
 * `DEBUG_CONSOLE_LEVEL` accepts `off`, `summary`, or `verbose`.
 * `DEBUG_CONSOLE_TRACE=true` enables explicit stack traces in verbose mode.
 */
export function readConsoleDebugPolicy(
  readEnv: (name: string) => string | undefined,
): ConsoleDebugPolicy {
  const configuredLevel = (readEnv("DEBUG_CONSOLE_LEVEL") ?? "summary")
    .toLowerCase();

  const level: ConsoleDebugLevel = configuredLevel === "off"
    ? "off"
    : configuredLevel === "verbose"
    ? "verbose"
    : "summary";

  return {
    includeTrace: readEnv("DEBUG_CONSOLE_TRACE") === "true",
    level,
  };
}

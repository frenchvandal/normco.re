import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";

import { readConsoleDebugPolicy } from "./console_debug.ts";

describe("readConsoleDebugPolicy()", () => {
  it("defaults to info and summary verbosity", () => {
    const policy = readConsoleDebugPolicy(() => undefined);
    assertEquals(policy, {
      includeTrace: false,
      level: "summary",
      lumeLogs: "info",
    });
  });

  it("maps LUME_LOGS levels to generic console policies", () => {
    const debugPolicy = readConsoleDebugPolicy((name) =>
      name === "LUME_LOGS" ? "debug" : undefined
    );
    const criticalPolicy = readConsoleDebugPolicy((name) =>
      name === "LUME_LOGS" ? "critical" : undefined
    );

    assertEquals(debugPolicy, {
      includeTrace: true,
      level: "verbose",
      lumeLogs: "debug",
    });
    assertEquals(criticalPolicy, {
      includeTrace: false,
      level: "off",
      lumeLogs: "critical",
    });
  });

  it("normalizes uppercase log levels and maps warning/error", () => {
    const warningPolicy = readConsoleDebugPolicy((name) =>
      name === "LUME_LOGS" ? "WARNING" : undefined
    );
    const errorPolicy = readConsoleDebugPolicy((name) =>
      name === "LUME_LOGS" ? "ERROR" : undefined
    );

    assertEquals(warningPolicy, {
      includeTrace: false,
      level: "summary",
      lumeLogs: "warning",
    });
    assertEquals(errorPolicy, {
      includeTrace: false,
      level: "summary",
      lumeLogs: "error",
    });
  });

  it("falls back to info policy for unknown values", () => {
    const policy = readConsoleDebugPolicy((name) =>
      name === "LUME_LOGS" ? "chatty" : undefined
    );

    assertEquals(policy, {
      includeTrace: false,
      level: "summary",
      lumeLogs: "info",
    });
  });
});

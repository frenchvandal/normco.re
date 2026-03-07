import { describe, it } from "jsr/testing-bdd";
import { assertEquals } from "jsr/assert";

import { readConsoleDebugPolicy } from "./console_debug.ts";

describe("readConsoleDebugPolicy()", () => {
  it("defaults to summary with trace disabled", () => {
    const policy = readConsoleDebugPolicy(() => undefined);
    assertEquals(policy, { includeTrace: false, level: "summary" });
  });

  it("supports explicit off and verbose levels", () => {
    const offPolicy = readConsoleDebugPolicy((name) =>
      name === "DEBUG_CONSOLE_LEVEL" ? "off" : undefined
    );
    const verbosePolicy = readConsoleDebugPolicy((name) => {
      if (name === "DEBUG_CONSOLE_LEVEL") {
        return "verbose";
      }

      if (name === "DEBUG_CONSOLE_TRACE") {
        return "true";
      }

      return undefined;
    });

    assertEquals(offPolicy, { includeTrace: false, level: "off" });
    assertEquals(verbosePolicy, { includeTrace: true, level: "verbose" });
  });

  it("falls back to summary for unknown level values", () => {
    const policy = readConsoleDebugPolicy((name) =>
      name === "DEBUG_CONSOLE_LEVEL" ? "chatty" : undefined
    );

    assertEquals(policy.level, "summary");
  });
});

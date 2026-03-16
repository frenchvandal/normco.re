import { assertEquals } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import { resolveCurrentDateIso } from "./current-date.ts";

describe("resolveCurrentDateIso()", () => {
  it("prefers Temporal when available", () => {
    assertEquals(
      resolveCurrentDateIso(
        new Date("2026-03-16T12:00:00.000Z"),
        {
          Now: {
            plainDateISO: () => ({ toString: () => "2026-03-20" }),
          },
        },
      ),
      "2026-03-20",
    );
  });

  it("falls back to local Date components when Temporal is unavailable", () => {
    assertEquals(
      resolveCurrentDateIso(new Date("2026-03-16T12:00:00.000Z"), undefined),
      "2026-03-16",
    );
  });
});

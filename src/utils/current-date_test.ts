import { assertEquals } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import { resolveCurrentDateIso } from "./current-date.ts";

const LOCAL_NOON = new Date(2026, 2, 16, 12, 0, 0, 0);

describe("resolveCurrentDateIso()", () => {
  it("prefers Temporal when available", () => {
    assertEquals(
      resolveCurrentDateIso(
        LOCAL_NOON,
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
      resolveCurrentDateIso(LOCAL_NOON, {}),
      "2026-03-16",
    );
  });
});

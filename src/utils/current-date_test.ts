import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import { resolveCurrentDateIso } from "./current-date.ts";

describe("resolveCurrentDateIso()", () => {
  it("returns the provided Temporal plain date", () => {
    const plainDate = {
      toString: () => "2026-03-20",
    } as Temporal.PlainDate;

    assertEquals(
      resolveCurrentDateIso({
        plainDateISO: () => plainDate,
      }),
      "2026-03-20",
    );
  });

  it("uses the runtime Temporal clock by default", () => {
    assertEquals(
      resolveCurrentDateIso(),
      Temporal.Now.plainDateISO().toString(),
    );
  });
});

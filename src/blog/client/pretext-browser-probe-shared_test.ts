import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import {
  buildPretextBrowserProbeDiagnosticsSummary,
  PRETEXT_BROWSER_PROBE_DIAGNOSTIC_TOLERANCE_PX,
  PRETEXT_BROWSER_PROBE_SELECTOR_EXPECTATIONS,
  PRETEXT_BROWSER_PROBE_SURFACES,
  PRETEXT_BROWSER_PROBE_TEXT_TARGETS,
} from "./pretext-browser-probe-shared.ts";

describe("pretext-browser-probe-shared", () => {
  it("keeps selector expectations aligned with the text target catalog", () => {
    for (const surface of PRETEXT_BROWSER_PROBE_SURFACES) {
      assertEquals(
        PRETEXT_BROWSER_PROBE_SELECTOR_EXPECTATIONS[surface.key],
        PRETEXT_BROWSER_PROBE_TEXT_TARGETS[surface.key].map(
          ({ minCount, selector }) => ({
            minCount,
            selector,
          }),
        ),
      );
    }
  });

  it("summarizes height deltas against the default tolerance", () => {
    assertEquals(
      buildPretextBrowserProbeDiagnosticsSummary([
        { heightDelta: 0.25 },
        { heightDelta: -1.5 },
        { heightDelta: 2.75 },
      ]),
      {
        aboveToleranceCount: 2,
        maxAbsHeightDelta: 2.75,
        sampleCount: 3,
      },
    );
  });

  it("accepts a caller-provided tolerance override", () => {
    assertEquals(PRETEXT_BROWSER_PROBE_DIAGNOSTIC_TOLERANCE_PX, 1);
    assertEquals(
      buildPretextBrowserProbeDiagnosticsSummary(
        [{ heightDelta: 1.4 }],
        1.5,
      ),
      {
        aboveToleranceCount: 0,
        maxAbsHeightDelta: 1.4,
        sampleCount: 1,
      },
    );
  });
});

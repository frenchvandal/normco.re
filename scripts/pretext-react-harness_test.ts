import { assert, assertEquals, assertStringIncludes } from "@std/assert";
import { join } from "@std/path";
import { describe, it } from "@std/testing/bdd";

import {
  buildPretextReactHarnessScenarios,
  buildPretextReactHarnessSummaryMarkdown,
  runPretextReactHarness,
} from "./pretext-react-harness.tsx";

describe("buildPretextReactHarnessScenarios()", () => {
  it("covers every targeted React surface across languages and viewports", () => {
    assertEquals(buildPretextReactHarnessScenarios().length, 48);
  });
});

describe("runPretextReactHarness()", () => {
  it("detects a strong runtime signal between with-pretext and without-pretext", async () => {
    const report = await runPretextReactHarness(
      join(Deno.cwd(), ".tmp/deno-tests/pretext-react-harness"),
    );

    assertEquals(report.scenarioCount, 48);
    assertEquals(report.withPretext.textScenarioCount, 40);
    assertEquals(report.withPretext.summaryEligibleScenarioCount, 24);
    assertEquals(report.withPretext.titleVarScenarios, 40);
    assertEquals(report.withoutPretext.titleVarScenarios, 0);
    assertEquals(report.withPretext.summaryVarScenarios, 24);
    assertEquals(report.withoutPretext.summaryVarScenarios, 0);
    assertEquals(report.withPretext.balancedTitleRows, 8);
    assertEquals(report.withoutPretext.balancedTitleRows, 0);
    assertEquals(report.withPretext.balancedSummaryRows, 8);
    assertEquals(report.withoutPretext.balancedSummaryRows, 0);

    const desktopGrid = report.comparisons.find((comparison) =>
      comparison.id === "story-grid-fr-desktop"
    );

    assert(desktopGrid?.kind === "grid");
    assertEquals(desktopGrid.withPretext.balancedTitleRows, 2);
    assertEquals(desktopGrid.withoutPretext.balancedTitleRows, 0);
    assertEquals(desktopGrid.withPretext.summaryVarCardCount, 4);
    assertEquals(desktopGrid.withoutPretext.summaryVarCardCount, 0);
  });
});

describe("buildPretextReactHarnessSummaryMarkdown()", () => {
  it("renders coverage-oriented A/B metrics that are easy to read in CI", async () => {
    const report = await runPretextReactHarness(
      join(Deno.cwd(), ".tmp/deno-tests/pretext-react-harness-summary"),
    );
    const markdown = buildPretextReactHarnessSummaryMarkdown(report);

    assertStringIncludes(markdown, "# Pretext React Harness");
    assertStringIncludes(
      markdown,
      "| Text surfaces with title vars | 40 / 40 | 0 / 40 | +40 |",
    );
    assertStringIncludes(
      markdown,
      "| Text surfaces with summary vars | 24 / 24 | 0 / 24 | +24 |",
    );
    assertStringIncludes(
      markdown,
      "| Grid cards with title vars | 32 / 32 | 0 / 32 | +32 |",
    );
    assertStringIncludes(
      markdown,
      "| Scenario | Title var cards with | Title var cards without | Summary var cards with | Summary var cards without |",
    );
    assertStringIncludes(
      markdown,
      "| story-grid-fr-desktop | 4 | 0 | 4 | 0 |",
    );
    assertStringIncludes(
      markdown,
      "| Scenario | Comparable rows | Balanced title rows with | Balanced title rows without | Balanced summary rows with | Balanced summary rows without |",
    );
    assertStringIncludes(
      markdown,
      "| story-grid-fr-desktop | 2 | 2 | 0 | 2 | 0 |",
    );
  });
});

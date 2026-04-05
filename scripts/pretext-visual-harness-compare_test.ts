import { assertEquals, assertStringIncludes } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import { buildPretextVisualHarnessComparisonSummaryMarkdown } from "./pretext-visual-harness-compare-summary.ts";
import { buildPretextVisualHarnessComparisonReport } from "./pretext-visual-harness-compare.ts";
import type { HarnessReport } from "./pretext-visual-harness.ts";

function createHarnessReport(
  variant: HarnessReport["variant"],
  overrides: Partial<HarnessReport> = {},
): HarnessReport {
  const withPretext = variant === "with-pretext";

  return {
    generatedAt: "2026-04-04T00:00:00.000Z",
    baseUrl: "http://127.0.0.1:4173",
    rootDir: "/repo/_site",
    outputDir: `/repo/.tmp/pretext-harness-compare/${variant}`,
    variant,
    scenarioCount: 3,
    errorCount: 0,
    warningCount: 0,
    issues: [],
    results: [
      {
        stem: "archive-fr-desktop",
        variant,
        routeKind: "archive",
        language: "fr",
        languageCode: "fr",
        languageTag: "fr",
        pathname: "/fr/posts/",
        viewportId: "desktop",
        viewport: { width: 1440, height: 1200 },
        url: "http://127.0.0.1:4173/fr/posts/",
        status: 200,
        documentLanguage: "fr",
        pageTitle: "Archive",
        selectorMetrics: [
          {
            selector: ".blog-antd-archive-timeline__title",
            minCount: 1,
            count: 1,
            samples: [{
              tagName: "h3",
              textLength: 18,
              inlineSize: 320,
              blockSize: 48,
              lineHeight: 24,
              minBlockSize: withPretext ? "48px" : "auto",
              pretextTitleHeight: withPretext ? "48px" : null,
              pretextSummaryHeight: null,
            }],
          },
          {
            selector: ".blog-antd-archive-timeline__summary",
            minCount: 1,
            count: 1,
            samples: [{
              tagName: "p",
              textLength: 72,
              inlineSize: 320,
              blockSize: 72,
              lineHeight: 24,
              minBlockSize: withPretext ? "72px" : "auto",
              pretextTitleHeight: null,
              pretextSummaryHeight: withPretext ? "72px" : null,
            }],
          },
        ],
        cls: {
          value: withPretext ? 0 : 0.0012,
          entries: withPretext ? [] : [{ value: 0.0012, startTime: 120 }],
        },
        responseErrors: [],
        consoleErrors: [],
        pageErrors: [],
        requestFailures: [],
        probeDiagnostics: null,
        screenshotPath: "screenshots/archive-fr-desktop.png",
        durationMs: 321.09,
      },
      {
        stem: "home-en-mobile",
        variant,
        routeKind: "home",
        language: "en",
        languageCode: "en",
        languageTag: "en",
        pathname: "/",
        viewportId: "mobile",
        viewport: { width: 390, height: 844 },
        url: "http://127.0.0.1:4173/",
        status: 200,
        documentLanguage: "en",
        pageTitle: "Home",
        selectorMetrics: [],
        cls: {
          value: 0,
          entries: [],
        },
        responseErrors: [],
        consoleErrors: [],
        pageErrors: [],
        requestFailures: [],
        probeDiagnostics: null,
        screenshotPath: "screenshots/home-en-mobile.png",
        durationMs: 210.11,
      },
      {
        stem: "probe-en-desktop",
        variant,
        routeKind: "probe",
        language: "en",
        languageCode: "en",
        languageTag: "en",
        pathname: "/pretext/probe/",
        viewportId: "desktop",
        viewport: { width: 1440, height: 1200 },
        url: "http://127.0.0.1:4173/pretext/probe/",
        status: 200,
        documentLanguage: "en",
        pageTitle: "Pretext Browser Probe",
        selectorMetrics: [],
        cls: {
          value: 0,
          entries: [],
        },
        responseErrors: [],
        consoleErrors: [],
        pageErrors: [],
        requestFailures: [],
        probeDiagnostics: withPretext
          ? {
            flaggedCount: 1,
            maxAbsDelta: 0.85,
            runtime: "enabled",
            sampleCount: 12,
          }
          : {
            flaggedCount: 4,
            maxAbsDelta: 2.25,
            runtime: "disabled",
            sampleCount: 12,
          },
        screenshotPath: "screenshots/probe-en-desktop.png",
        durationMs: 287.42,
      },
    ],
    ...overrides,
  };
}

describe("buildPretextVisualHarnessComparisonReport()", () => {
  it("collects per-variant totals and aligned scenario comparisons", () => {
    const report = buildPretextVisualHarnessComparisonReport(
      "/repo/.tmp/pretext-harness-compare",
      createHarnessReport("with-pretext"),
      createHarnessReport("without-pretext"),
    );

    assertEquals(report.scenarioCount, 3);
    assertEquals(report.withPretext.sampleCounts, {
      pretextBackedPixelMinBlockSize: 2,
      title: 1,
      summary: 1,
    });
    assertEquals(report.withPretext.probeDiagnostics, {
      flaggedCount: 1,
      maxAbsHeightDelta: 0.85,
      runtimeDisabledScenarioCount: 0,
      runtimeEnabledScenarioCount: 1,
      sampleCount: 12,
      scenarioCount: 1,
    });
    assertEquals(report.withoutPretext.sampleCounts, {
      pretextBackedPixelMinBlockSize: 0,
      title: 0,
      summary: 0,
    });
    assertEquals(report.withPretext.reportPath, "with-pretext/report.json");
    assertEquals(
      report.scenarioComparisons.find((comparison) =>
        comparison.stem === "archive-fr-desktop"
      )?.withPretext.screenshotPath,
      "with-pretext/screenshots/archive-fr-desktop.png",
    );
  });
});

describe("buildPretextVisualHarnessComparisonSummaryMarkdown()", () => {
  it("renders comparative totals and scenario deltas", () => {
    const markdown = buildPretextVisualHarnessComparisonSummaryMarkdown(
      buildPretextVisualHarnessComparisonReport(
        "/repo/.tmp/pretext-harness-compare",
        createHarnessReport("with-pretext"),
        createHarnessReport("without-pretext"),
      ),
    );

    assertStringIncludes(markdown, "# Pretext Visual Harness Comparison");
    assertStringIncludes(
      markdown,
      "| Samples with title vars | 1 | 0 | +1 |",
    );
    assertStringIncludes(
      markdown,
      "| Samples with Pretext-backed pixel min-block-size | 2 | 0 | +2 |",
    );
    assertStringIncludes(
      markdown,
      "| Probe diagnostics flagged (> 1px) | 1 | 4 | -3 |",
    );
    assertStringIncludes(
      markdown,
      "| Probe diagnostics max abs delta | 0.85px | 2.25px | -1.40px |",
    );
    assertStringIncludes(
      markdown,
      "| Public-route max CLS | 0.000000 | 0.001200 | -0.001200 |",
    );
    assertStringIncludes(
      markdown,
      "| Probe-route max CLS | 0.000000 | 0.000000 | 0.000000 |",
    );
    assertStringIncludes(
      markdown,
      "Pretext is visibly active in the reference run",
    );
    assertStringIncludes(
      markdown,
      "The Pretext-enabled variant reduces probe samples above the flag threshold by 3.",
    );
    assertStringIncludes(
      markdown,
      "| archive-fr-desktop | archive | 0.000000 | 0.001200 | 1 / 0 | 1 / 0 | 2 / 0 |",
    );
    assertStringIncludes(
      markdown,
      "| probe-en-desktop | probe | 0.000000 | 0.000000 | 0 / 0 | 0 / 0 | 0 / 0 | 1 / 4 | 0.85px / 2.25px |",
    );
  });
});

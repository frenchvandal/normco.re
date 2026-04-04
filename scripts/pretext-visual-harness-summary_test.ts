import { assertEquals, assertStringIncludes } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import {
  buildPretextVisualHarnessSummaryMarkdown,
  getPretextVisualHarnessSampleCounts,
} from "./pretext-visual-harness-summary.ts";
import type { HarnessReport } from "./pretext-visual-harness.ts";

function createHarnessReport(
  overrides: Partial<HarnessReport> = {},
): HarnessReport {
  return {
    generatedAt: "2026-04-04T00:00:00.000Z",
    baseUrl: "http://127.0.0.1:4173",
    rootDir: "/repo/_site",
    outputDir: "/repo/.tmp/pretext-harness",
    variant: "with-pretext",
    scenarioCount: 2,
    errorCount: 1,
    warningCount: 0,
    issues: [
      {
        severity: "error",
        code: "missing-selector",
        scenarioStem: "archive-fr-desktop",
        message:
          "Selector .post-card-title matched 0 node(s); expected at least 1",
      },
    ],
    results: [
      {
        stem: "archive-fr-desktop",
        variant: "with-pretext",
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
              minBlockSize: "48px",
              pretextTitleHeight: "48px",
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
              minBlockSize: "72px",
              pretextTitleHeight: null,
              pretextSummaryHeight: "72px",
            }],
          },
        ],
        cls: {
          value: 0.001605,
          entries: [{ value: 0.001605, startTime: 123.45 }],
        },
        responseErrors: [],
        consoleErrors: [],
        pageErrors: [],
        requestFailures: [],
        screenshotPath: "screenshots/archive-fr-desktop.png",
        durationMs: 321.09,
      },
      {
        stem: "home-en-mobile",
        variant: "with-pretext",
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
        screenshotPath: "screenshots/home-en-mobile.png",
        durationMs: 210.11,
      },
    ],
    ...overrides,
  };
}

describe("getPretextVisualHarnessSampleCounts()", () => {
  it("counts resolved title vars, summary vars, and Pretext-backed pixel min-block-sizes", () => {
    assertEquals(
      getPretextVisualHarnessSampleCounts(createHarnessReport()),
      {
        pretextBackedPixelMinBlockSize: 2,
        title: 1,
        summary: 1,
      },
    );
  });
});

describe("buildPretextVisualHarnessSummaryMarkdown()", () => {
  it("renders the key metrics, CLS outliers, and issues", () => {
    const markdown = buildPretextVisualHarnessSummaryMarkdown(
      createHarnessReport(),
    );

    assertStringIncludes(markdown, "# Pretext Visual Harness");
    assertStringIncludes(markdown, "| Variant | with-pretext |");
    assertStringIncludes(markdown, "| Scenarios | 2 |");
    assertStringIncludes(markdown, "| Max CLS | 0.001605 |");
    assertStringIncludes(
      markdown,
      "| Samples with Pretext-backed pixel min-block-size | 2 |",
    );
    assertStringIncludes(
      markdown,
      "| archive-fr-desktop | 0.001605 | /fr/posts/ | desktop |",
    );
    assertStringIncludes(
      markdown,
      "| error | missing-selector | archive-fr-desktop | Selector .post-card-title matched 0 node(s); expected at least 1 |",
    );
  });

  it("states clearly when there are no issues and no CLS outliers", () => {
    const baseReport = createHarnessReport();
    const markdown = buildPretextVisualHarnessSummaryMarkdown(
      createHarnessReport({
        errorCount: 0,
        issues: [],
        results: baseReport.results.map((result) => ({
          ...result,
          cls: {
            value: 0,
            entries: [],
          },
          selectorMetrics: [],
        })),
      }),
    );

    assertStringIncludes(markdown, "All scenarios reported `0.000000` CLS.");
    assertStringIncludes(markdown, "No issues were reported.");
  });
});

import { parseArgs } from "@std/cli";
import { isAbsolute, join, normalize } from "@std/path";

import { act, createElement } from "npm/react";
import { createRoot } from "npm/react-dom/client";

import { createUsageError, getErrorMessage } from "./_shared.ts";
import { REPO_ROOT } from "./deno_graph.ts";
import { writeGitHubJobSummary } from "./github-actions.ts";
import { getJSDOM } from "../test/jsdom.ts";
import {
  clearPretextMeasurementCaches,
  PRETEXT_DISABLE_GLOBAL_FLAG,
  PRETEXT_ENGINE,
  PRETEXT_MEASURE_FONT_TOKEN,
} from "../src/blog/client/pretext-story-core.ts";
import { getPretextProbeLanguageFixture } from "../src/blog/client/pretext-probe-fixtures.ts";
import {
  PRETEXT_ARCHIVE_TIMELINE_SUMMARY_SELECTOR,
  PRETEXT_ARCHIVE_TIMELINE_TITLE_SELECTOR,
  PRETEXT_FEATURE_CARD_SUMMARY_SELECTOR,
  PRETEXT_FEATURE_CARD_TITLE_SELECTOR,
  PRETEXT_OUTLINE_LINK_TEXT_SELECTOR,
  PRETEXT_SIGNAL_LIST_TITLE_SELECTOR,
  PRETEXT_STORY_CARD_SUMMARY_CLASS,
  PRETEXT_STORY_CARD_SUMMARY_SELECTOR,
  PRETEXT_STORY_CARD_TITLE_CLASS,
  PRETEXT_STORY_CARD_TITLE_SELECTOR,
} from "../src/blog/client/pretext-selectors.ts";
import { useBalancedStoryGridTextStyles } from "../src/blog/client/pretext-story-grid.ts";
import { usePretextTextStyle } from "../src/blog/client/pretext-story.ts";
import { STORY_GRID_TWO_COLUMN_MEDIA_QUERY } from "../src/utils/layout-breakpoints.ts";
import {
  getLanguageDataCode,
  getLanguageTag,
  type SiteLanguage,
  SUPPORTED_LANGUAGES,
} from "../src/utils/i18n.ts";

type ReactHarnessVariant = "with-pretext" | "without-pretext";
type ReactHarnessViewportId = "mobile" | "desktop";
type TextSurfaceId =
  | "archive-item"
  | "featured-story"
  | "outline-link"
  | "signal-story"
  | "story-card";
type SurfaceId = TextSurfaceId | "story-grid";

type ViewportSpec = Readonly<{
  columns: number;
  featuredSummaryWidth: number;
  featuredTitleWidth: number;
  gridSummaryWidth: number;
  gridTitleWidth: number;
  id: ReactHarnessViewportId;
  outlineWidth: number;
  signalWidth: number;
  storySummaryWidth: number;
  storyTitleWidth: number;
}>;

type TextSurfaceScenario = Readonly<{
  kind: "text";
  language: SiteLanguage;
  surfaceId: TextSurfaceId;
  viewport: ViewportSpec;
}>;

type GridScenario = Readonly<{
  kind: "grid";
  language: SiteLanguage;
  surfaceId: "story-grid";
  viewport: ViewportSpec;
}>;

type ReactHarnessScenario = TextSurfaceScenario | GridScenario;

type TextScenarioMetrics = Readonly<{
  hasSummarySurface: boolean;
  summaryHeight: string | null;
  summaryLines: number | null;
  titleHeight: string | null;
  titleLines: number | null;
}>;

type GridRowMetrics = Readonly<{
  summaryHeights: readonly (string | null)[];
  titleHeights: readonly (string | null)[];
}>;

type GridScenarioMetrics = Readonly<{
  balancedSummaryRows: number;
  balancedTitleRows: number;
  cardCount: number;
  comparableRows: number;
  rowMetrics: readonly GridRowMetrics[];
  summaryCardCount: number;
  summaryVarCardCount: number;
  titleVarCardCount: number;
}>;

type TextScenarioResult = Readonly<{
  id: string;
  kind: "text";
  language: SiteLanguage;
  languageCode: string;
  surfaceId: TextSurfaceId;
  variant: ReactHarnessVariant;
  viewportId: ReactHarnessViewportId;
  metrics: TextScenarioMetrics;
}>;

type GridScenarioResult = Readonly<{
  id: string;
  kind: "grid";
  language: SiteLanguage;
  languageCode: string;
  surfaceId: "story-grid";
  variant: ReactHarnessVariant;
  viewportId: ReactHarnessViewportId;
  metrics: GridScenarioMetrics;
}>;

type ReactHarnessScenarioResult = TextScenarioResult | GridScenarioResult;

type ReactHarnessVariantTotals = Readonly<{
  balancedSummaryRows: number;
  balancedTitleRows: number;
  comparableGridRows: number;
  gridCardCount: number;
  gridSummaryCardCount: number;
  gridSummaryVarCardCount: number;
  gridTitleVarCardCount: number;
  scenarioCount: number;
  summaryEligibleScenarioCount: number;
  summaryVarScenarios: number;
  textScenarioCount: number;
  titleVarScenarios: number;
  variant: ReactHarnessVariant;
}>;

type ReactHarnessComparison =
  | Readonly<{
    id: string;
    kind: "text";
    languageCode: string;
    surfaceId: TextSurfaceId;
    viewportId: ReactHarnessViewportId;
    withPretext: TextScenarioMetrics;
    withoutPretext: TextScenarioMetrics;
  }>
  | Readonly<{
    id: string;
    kind: "grid";
    languageCode: string;
    surfaceId: "story-grid";
    viewportId: ReactHarnessViewportId;
    withPretext: GridScenarioMetrics;
    withoutPretext: GridScenarioMetrics;
  }>;

export type PretextReactHarnessReport = Readonly<{
  comparisons: readonly ReactHarnessComparison[];
  generatedAt: string;
  outputDir: string;
  scenarioCount: number;
  withPretext: ReactHarnessVariantTotals;
  withoutPretext: ReactHarnessVariantTotals;
}>;

type ParsedCliOptions = Readonly<{
  outputDir: string;
}>;

type ReactHarnessSummaryOptions = Readonly<{
  maxComparisonRows?: number;
}>;

const PRETEXT_REACT_HARNESS_USAGE = [
  "Usage: deno run --allow-read --allow-write=.tmp/pretext-react-harness scripts/pretext-react-harness.tsx [options]",
  "",
  "Options:",
  "  --output=<path>    Directory for the React-focused Pretext metrics report",
].join("\n");

const REACT_HARNESS_VIEWPORTS = {
  mobile: {
    columns: 1,
    featuredSummaryWidth: 260,
    featuredTitleWidth: 300,
    gridSummaryWidth: 240,
    gridTitleWidth: 240,
    id: "mobile",
    outlineWidth: 180,
    signalWidth: 200,
    storySummaryWidth: 240,
    storyTitleWidth: 240,
  },
  desktop: {
    columns: 2,
    featuredSummaryWidth: 340,
    featuredTitleWidth: 520,
    gridSummaryWidth: 260,
    gridTitleWidth: 260,
    id: "desktop",
    outlineWidth: 220,
    signalWidth: 240,
    storySummaryWidth: 280,
    storyTitleWidth: 280,
  },
} as const satisfies Record<ReactHarnessViewportId, ViewportSpec>;

const STORY_TITLE_STYLE = {
  fontSize: "2rem",
  fontStyle: "normal",
  fontWeight: "700",
  lineHeight: "2.5rem",
} as const;

const STORY_SUMMARY_STYLE = {
  fontSize: "1rem",
  fontStyle: "normal",
  fontWeight: "400",
  lineHeight: "1.5rem",
} as const;

const SIGNAL_TITLE_STYLE = {
  fontSize: "1.125rem",
  fontStyle: "normal",
  fontWeight: "600",
  lineHeight: "1.5rem",
} as const;

const OUTLINE_TITLE_STYLE = {
  fontSize: "0.95rem",
  fontStyle: "normal",
  fontWeight: "500",
  lineHeight: "1.35rem",
} as const;

const TEXT_SURFACE_FIXTURES = {
  "story-card": {
    summarySelector: PRETEXT_STORY_CARD_SUMMARY_SELECTOR,
    titleSelector: PRETEXT_STORY_CARD_TITLE_SELECTOR,
  },
  "featured-story": {
    summarySelector: PRETEXT_FEATURE_CARD_SUMMARY_SELECTOR,
    titleSelector: PRETEXT_FEATURE_CARD_TITLE_SELECTOR,
  },
  "archive-item": {
    summarySelector: PRETEXT_ARCHIVE_TIMELINE_SUMMARY_SELECTOR,
    titleSelector: PRETEXT_ARCHIVE_TIMELINE_TITLE_SELECTOR,
  },
  "signal-story": {
    titleSelector: PRETEXT_SIGNAL_LIST_TITLE_SELECTOR,
  },
  "outline-link": {
    titleSelector: PRETEXT_OUTLINE_LINK_TEXT_SELECTOR,
  },
} as const satisfies Record<
  TextSurfaceId,
  Readonly<{
    summarySelector?: string;
    titleSelector: string;
  }>
>;

function resolveRepoPath(path: string): string {
  return isAbsolute(path) ? normalize(path) : join(REPO_ROOT, path);
}

function parseCliOptions(args: readonly string[]): ParsedCliOptions {
  const parsed = parseArgs(args, {
    string: ["output"],
    boolean: ["help"],
  });

  if (parsed.help) {
    throw createUsageError("", PRETEXT_REACT_HARNESS_USAGE);
  }

  if (parsed._.length > 0) {
    throw createUsageError(
      `Unexpected positional arguments: ${parsed._.join(" ")}`,
      PRETEXT_REACT_HARNESS_USAGE,
    );
  }

  const outputValue =
    typeof parsed.output === "string" && parsed.output.trim().length > 0
      ? parsed.output.trim()
      : ".tmp/pretext-react-harness";

  return {
    outputDir: resolveRepoPath(outputValue),
  };
}

function buildScenarioId(
  surfaceId: SurfaceId,
  language: SiteLanguage,
  viewportId: ReactHarnessViewportId,
): string {
  return `${surfaceId}-${getLanguageDataCode(language)}-${viewportId}`;
}

export function buildPretextReactHarnessScenarios(): readonly ReactHarnessScenario[] {
  const textSurfaceIds = Object.keys(TEXT_SURFACE_FIXTURES) as TextSurfaceId[];
  const viewportSpecs = Object.values(REACT_HARNESS_VIEWPORTS);
  const scenarios: ReactHarnessScenario[] = [];

  for (const language of SUPPORTED_LANGUAGES) {
    for (const viewport of viewportSpecs) {
      for (const surfaceId of textSurfaceIds) {
        scenarios.push({
          kind: "text",
          language,
          surfaceId,
          viewport,
        });
      }

      scenarios.push({
        kind: "grid",
        language,
        surfaceId: "story-grid",
        viewport,
      });
    }
  }

  return scenarios;
}

function parseStyleNumber(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatSignedDelta(value: number): string {
  return `${value > 0 ? "+" : ""}${value}`;
}

function readStyleVar(
  element: HTMLElement,
  name: string,
): string | null {
  const value = element.style.getPropertyValue(name).trim();
  return value === "" ? null : value;
}

function createMediaQueryList(matches: boolean): MediaQueryList {
  return {
    matches,
    media: STORY_GRID_TWO_COLUMN_MEDIA_QUERY,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return true;
    },
  };
}

function parseCanvasFontSize(font: string): number {
  const match = font.match(/(\d+(?:\.\d+)?)px/);
  const matchedValue = match?.[1];

  if (matchedValue === undefined) {
    return 16;
  }

  const value = Number.parseFloat(matchedValue);
  return Number.isFinite(value) ? value : 16;
}

function measureCanvasCharacterWidth(
  character: string,
  fontSize: number,
): number {
  if (/\s/u.test(character)) {
    return fontSize * 0.32;
  }

  if (/[\u3000-\u30ff\u3400-\u9fff\uf900-\ufaff]/u.test(character)) {
    return fontSize;
  }

  if (/[A-Z0-9]/u.test(character)) {
    return fontSize * 0.62;
  }

  if (/[a-z]/u.test(character)) {
    return fontSize * 0.56;
  }

  if (/[.,;:!?'"`]/u.test(character)) {
    return fontSize * 0.28;
  }

  if (/[-_/\\|()[\]{}]/u.test(character)) {
    return fontSize * 0.36;
  }

  return fontSize * 0.68;
}

function measureCanvasTextWidth(
  text: string,
  font: string,
): number {
  const fontSize = parseCanvasFontSize(font);

  return Array.from(text).reduce(
    (width, character) =>
      width + measureCanvasCharacterWidth(character, fontSize),
    0,
  );
}

class TestCanvasRenderingContext2D {
  font = "16px sans-serif";

  measureText(text: string): TextMetrics {
    return {
      width: Number(measureCanvasTextWidth(text, this.font).toFixed(3)),
    } as TextMetrics;
  }
}

class TestOffscreenCanvas {
  constructor(_width: number, _height: number) {}

  getContext(contextId: string): TestCanvasRenderingContext2D | null {
    return contextId === "2d" ? new TestCanvasRenderingContext2D() : null;
  }
}

function createGlobalPropertySetter<T>(
  key: PropertyKey,
  value: T,
): () => void {
  const hadOwnProperty = Object.prototype.hasOwnProperty.call(globalThis, key);
  const previousValue = Reflect.get(globalThis, key);
  Reflect.set(globalThis, key, value);

  return () => {
    if (hadOwnProperty) {
      Reflect.set(globalThis, key, previousValue);
      return;
    }

    Reflect.deleteProperty(globalThis, key);
  };
}

function isTextComparison(
  comparison: ReactHarnessComparison,
): comparison is Extract<ReactHarnessComparison, { kind: "text" }> {
  return comparison.kind === "text";
}

function isGridComparison(
  comparison: ReactHarnessComparison,
): comparison is Extract<ReactHarnessComparison, { kind: "grid" }> {
  return comparison.kind === "grid";
}

function isBalancedRow(values: readonly (string | null)[]): boolean {
  if (values.length <= 1) {
    return false;
  }

  const resolvedValues = values.filter((value): value is string =>
    value !== null
  );
  return resolvedValues.length === values.length &&
    new Set(resolvedValues).size === 1;
}

function countTitleVarScenarios(
  results: readonly ReactHarnessScenarioResult[],
): number {
  return results.filter((result) =>
    result.kind === "text" && result.metrics.titleHeight !== null
  ).length;
}

function countTextScenarios(
  results: readonly ReactHarnessScenarioResult[],
): number {
  return results.filter((result) => result.kind === "text").length;
}

function countSummaryEligibleScenarios(
  results: readonly ReactHarnessScenarioResult[],
): number {
  return results.filter((result) =>
    result.kind === "text" && result.metrics.hasSummarySurface
  ).length;
}

function countSummaryVarScenarios(
  results: readonly ReactHarnessScenarioResult[],
): number {
  return results.filter((result) =>
    result.kind === "text" && result.metrics.summaryHeight !== null
  ).length;
}

function sumGridMetric(
  results: readonly ReactHarnessScenarioResult[],
  key:
    | "balancedSummaryRows"
    | "balancedTitleRows"
    | "cardCount"
    | "comparableRows"
    | "summaryCardCount"
    | "summaryVarCardCount"
    | "titleVarCardCount",
): number {
  return results.reduce(
    (sum, result) => sum + (result.kind === "grid" ? result.metrics[key] : 0),
    0,
  );
}

function buildVariantTotals(
  results: readonly ReactHarnessScenarioResult[],
  variant: ReactHarnessVariant,
): ReactHarnessVariantTotals {
  return {
    balancedSummaryRows: sumGridMetric(results, "balancedSummaryRows"),
    balancedTitleRows: sumGridMetric(results, "balancedTitleRows"),
    comparableGridRows: sumGridMetric(results, "comparableRows"),
    gridCardCount: sumGridMetric(results, "cardCount"),
    gridSummaryCardCount: sumGridMetric(results, "summaryCardCount"),
    gridSummaryVarCardCount: sumGridMetric(results, "summaryVarCardCount"),
    gridTitleVarCardCount: sumGridMetric(results, "titleVarCardCount"),
    scenarioCount: results.length,
    summaryEligibleScenarioCount: countSummaryEligibleScenarios(results),
    summaryVarScenarios: countSummaryVarScenarios(results),
    textScenarioCount: countTextScenarios(results),
    titleVarScenarios: countTitleVarScenarios(results),
    variant,
  };
}

function buildComparisons(
  withPretextResults: readonly ReactHarnessScenarioResult[],
  withoutPretextResults: readonly ReactHarnessScenarioResult[],
): readonly ReactHarnessComparison[] {
  const withoutPretextById = new Map(
    withoutPretextResults.map((result) => [result.id, result]),
  );

  return withPretextResults.map((withPretext) => {
    const withoutPretext = withoutPretextById.get(withPretext.id);

    if (!withoutPretext) {
      throw new Error(
        `Missing without-pretext result for React harness scenario ${withPretext.id}`,
      );
    }

    if (withPretext.kind === "text" && withoutPretext.kind === "text") {
      return {
        id: withPretext.id,
        kind: "text",
        languageCode: withPretext.languageCode,
        surfaceId: withPretext.surfaceId,
        viewportId: withPretext.viewportId,
        withPretext: withPretext.metrics,
        withoutPretext: withoutPretext.metrics,
      };
    }

    if (withPretext.kind === "grid" && withoutPretext.kind === "grid") {
      return {
        id: withPretext.id,
        kind: "grid",
        languageCode: withPretext.languageCode,
        surfaceId: "story-grid",
        viewportId: withPretext.viewportId,
        withPretext: withPretext.metrics,
        withoutPretext: withoutPretext.metrics,
      };
    }

    throw new Error(
      `Mismatched React harness scenario kinds for ${withPretext.id}: ${withPretext.kind} vs ${withoutPretext.kind}`,
    );
  });
}

function formatReportDelta(withValue: number, withoutValue: number): string {
  return formatSignedDelta(withValue - withoutValue);
}

function formatCoverage(value: number, total: number): string {
  return `${value} / ${total}`;
}

function formatCssLength(value: string | null): string {
  if (value === null) {
    return "-";
  }

  const match = value.trim().match(/^([+-]?(?:\d+|\d*\.\d+))px$/);
  const matchedValue = match?.[1];

  if (matchedValue === undefined) {
    return value;
  }

  const numericValue = Number.parseFloat(matchedValue);

  if (!Number.isFinite(numericValue)) {
    return value;
  }

  const rounded = Number(numericValue.toFixed(1));
  return `${rounded}px`;
}

export function buildPretextReactHarnessSummaryMarkdown(
  report: PretextReactHarnessReport,
  options: ReactHarnessSummaryOptions = {},
): string {
  const maxComparisonRows = options.maxComparisonRows ?? 12;
  const differingTextComparisons = report.comparisons
    .filter(isTextComparison)
    .filter((comparison) =>
      comparison.withPretext.titleHeight !==
        comparison.withoutPretext.titleHeight ||
      comparison.withPretext.summaryHeight !==
        comparison.withoutPretext.summaryHeight
    )
    .slice(0, maxComparisonRows);
  const differingGridComparisons = report.comparisons
    .filter(isGridComparison)
    .filter((comparison) =>
      comparison.withPretext.titleVarCardCount !==
        comparison.withoutPretext.titleVarCardCount ||
      comparison.withPretext.summaryVarCardCount !==
        comparison.withoutPretext.summaryVarCardCount ||
      comparison.withPretext.balancedTitleRows !==
        comparison.withoutPretext.balancedTitleRows ||
      comparison.withPretext.balancedSummaryRows !==
        comparison.withoutPretext.balancedSummaryRows
    )
    .slice(0, maxComparisonRows);

  const lines = [
    "# Pretext React Harness",
    "",
    "| Metric | With Pretext | Without Pretext | Delta |",
    "| --- | --- | --- | --- |",
    `| Generated at | ${report.generatedAt} | ${report.generatedAt} | - |`,
    `| Scenarios | ${report.withPretext.scenarioCount} | ${report.withoutPretext.scenarioCount} | 0 |`,
    `| Text surfaces with title vars | ${
      formatCoverage(
        report.withPretext.titleVarScenarios,
        report.withPretext.textScenarioCount,
      )
    } | ${
      formatCoverage(
        report.withoutPretext.titleVarScenarios,
        report.withoutPretext.textScenarioCount,
      )
    } | ${
      formatReportDelta(
        report.withPretext.titleVarScenarios,
        report.withoutPretext.titleVarScenarios,
      )
    } |`,
    `| Text surfaces with summary vars | ${
      formatCoverage(
        report.withPretext.summaryVarScenarios,
        report.withPretext.summaryEligibleScenarioCount,
      )
    } | ${
      formatCoverage(
        report.withoutPretext.summaryVarScenarios,
        report.withoutPretext.summaryEligibleScenarioCount,
      )
    } | ${
      formatReportDelta(
        report.withPretext.summaryVarScenarios,
        report.withoutPretext.summaryVarScenarios,
      )
    } |`,
    `| Grid cards with title vars | ${
      formatCoverage(
        report.withPretext.gridTitleVarCardCount,
        report.withPretext.gridCardCount,
      )
    } | ${
      formatCoverage(
        report.withoutPretext.gridTitleVarCardCount,
        report.withoutPretext.gridCardCount,
      )
    } | ${
      formatReportDelta(
        report.withPretext.gridTitleVarCardCount,
        report.withoutPretext.gridTitleVarCardCount,
      )
    } |`,
    `| Grid cards with summary vars | ${
      formatCoverage(
        report.withPretext.gridSummaryVarCardCount,
        report.withPretext.gridSummaryCardCount,
      )
    } | ${
      formatCoverage(
        report.withoutPretext.gridSummaryVarCardCount,
        report.withoutPretext.gridSummaryCardCount,
      )
    } | ${
      formatReportDelta(
        report.withPretext.gridSummaryVarCardCount,
        report.withoutPretext.gridSummaryVarCardCount,
      )
    } |`,
    `| Balanced grid title rows | ${report.withPretext.balancedTitleRows} / ${report.withPretext.comparableGridRows} | ${report.withoutPretext.balancedTitleRows} / ${report.withoutPretext.comparableGridRows} | ${
      formatReportDelta(
        report.withPretext.balancedTitleRows,
        report.withoutPretext.balancedTitleRows,
      )
    } |`,
    `| Balanced grid summary rows | ${report.withPretext.balancedSummaryRows} / ${report.withPretext.comparableGridRows} | ${report.withoutPretext.balancedSummaryRows} / ${report.withoutPretext.comparableGridRows} | ${
      formatReportDelta(
        report.withPretext.balancedSummaryRows,
        report.withoutPretext.balancedSummaryRows,
      )
    } |`,
    `| Output dir | ${report.outputDir} | ${report.outputDir} | - |`,
  ];

  lines.push("", "## Interpretation", "");
  lines.push(
    "- The React harness measures the hooks directly: title and summary CSS variables for single-surface probes, and row balancing for `StoryGrid`.",
  );
  lines.push(
    "- In the current repository shape, this is the primary efficacy signal for Pretext because it renders the measurement hooks in a controlled DOM instead of inferring their effect from mostly static route HTML.",
  );
  lines.push(
    `- On this run, the Pretext-enabled variant covers ${
      formatCoverage(
        report.withPretext.titleVarScenarios,
        report.withPretext.textScenarioCount,
      )
    } of text surfaces and ${
      formatCoverage(
        report.withPretext.balancedTitleRows,
        report.withPretext.comparableGridRows,
      )
    } of comparable \`StoryGrid\` rows for titles.`,
  );

  lines.push("", "## Text Surfaces", "");

  if (differingTextComparisons.length === 0) {
    lines.push("No text-surface delta detected between the two variants.");
  } else {
    lines.push(
      "Each measurement is split into explicit `with` and `without` columns so the table remains readable at a glance.",
      "",
    );
    lines.push(
      "| Scenario | Title with | Title without | Summary with | Summary without |",
    );
    lines.push("| --- | --- | --- | --- | --- |");

    for (const comparison of differingTextComparisons) {
      lines.push(
        `| ${comparison.id} | ${
          formatCssLength(comparison.withPretext.titleHeight)
        } | ${formatCssLength(comparison.withoutPretext.titleHeight)} | ${
          formatCssLength(comparison.withPretext.summaryHeight)
        } | ${formatCssLength(comparison.withoutPretext.summaryHeight)} |`,
      );
    }
  }

  lines.push("", "## StoryGrid Variable Coverage", "");

  if (differingGridComparisons.length === 0) {
    lines.push("No StoryGrid delta detected between the two variants.");
  } else {
    lines.push(
      "Card counts are reported in separate `with` and `without` columns; no shorthand like `4 / 0` is used here.",
      "",
    );
    lines.push(
      "| Scenario | Title var cards with | Title var cards without | Summary var cards with | Summary var cards without |",
    );
    lines.push("| --- | --- | --- | --- | --- |");

    for (const comparison of differingGridComparisons) {
      lines.push(
        `| ${comparison.id} | ${comparison.withPretext.titleVarCardCount} | ${comparison.withoutPretext.titleVarCardCount} | ${comparison.withPretext.summaryVarCardCount} | ${comparison.withoutPretext.summaryVarCardCount} |`,
      );
    }

    lines.push("", "## StoryGrid Row Balancing", "");
    lines.push(
      "Single-column mobile probes naturally report `0` balanced rows, because there is no multi-card row to harmonize.",
      "",
    );
    lines.push(
      "| Scenario | Comparable rows | Balanced title rows with | Balanced title rows without | Balanced summary rows with | Balanced summary rows without |",
    );
    lines.push("| --- | --- | --- | --- | --- | --- |");

    for (const comparison of differingGridComparisons) {
      lines.push(
        `| ${comparison.id} | ${comparison.withPretext.comparableRows} | ${comparison.withPretext.balancedTitleRows} | ${comparison.withoutPretext.balancedTitleRows} | ${comparison.withPretext.balancedSummaryRows} | ${comparison.withoutPretext.balancedSummaryRows} |`,
      );
    }
  }

  return lines.join("\n");
}

function buildReport(
  outputDir: string,
  withPretextResults: readonly ReactHarnessScenarioResult[],
  withoutPretextResults: readonly ReactHarnessScenarioResult[],
): PretextReactHarnessReport {
  return {
    comparisons: buildComparisons(withPretextResults, withoutPretextResults),
    generatedAt: new Date().toISOString(),
    outputDir,
    scenarioCount: withPretextResults.length,
    withPretext: buildVariantTotals(withPretextResults, "with-pretext"),
    withoutPretext: buildVariantTotals(
      withoutPretextResults,
      "without-pretext",
    ),
  };
}

function readTextMetrics(root: HTMLElement): TextScenarioMetrics {
  const titleHeight = readStyleVar(root, "--pretext-title-height");
  const summaryHeight = readStyleVar(root, "--pretext-summary-height");
  const titleLines = parseStyleNumber(
    readStyleVar(root, "--pretext-title-lines"),
  );
  const summaryLines = parseStyleNumber(
    readStyleVar(root, "--pretext-summary-lines"),
  );

  return {
    hasSummarySurface: root.querySelector("[class*='__summary']") !== null,
    summaryHeight,
    summaryLines,
    titleHeight,
    titleLines,
  };
}

function readGridMetrics(
  root: HTMLElement,
  columns: number,
): GridScenarioMetrics {
  const cards = Array.from(
    root.querySelectorAll<HTMLElement>("[data-grid-card]"),
  );
  const rowMetrics: GridRowMetrics[] = [];
  let balancedTitleRows = 0;
  let balancedSummaryRows = 0;

  for (let index = 0; index < cards.length; index += columns) {
    const row = cards.slice(index, index + columns);

    if (row.length !== columns || columns <= 1) {
      continue;
    }

    const titleHeights = row.map((card) =>
      readStyleVar(card, "--pretext-title-height")
    );
    const summaryHeights = row.map((card) =>
      readStyleVar(card, "--pretext-summary-height")
    );
    rowMetrics.push({ summaryHeights, titleHeights });

    if (isBalancedRow(titleHeights)) {
      balancedTitleRows += 1;
    }

    if (isBalancedRow(summaryHeights)) {
      balancedSummaryRows += 1;
    }
  }

  return {
    balancedSummaryRows,
    balancedTitleRows,
    cardCount: cards.length,
    comparableRows: rowMetrics.length,
    rowMetrics,
    summaryCardCount:
      cards.filter((card) =>
        card.querySelector(PRETEXT_STORY_CARD_SUMMARY_SELECTOR) !== null
      ).length,
    summaryVarCardCount:
      cards.filter((card) =>
        readStyleVar(card, "--pretext-summary-height") !== null
      ).length,
    titleVarCardCount:
      cards.filter((card) =>
        readStyleVar(card, "--pretext-title-height") !== null
      ).length,
  };
}

function TextSurfaceProbe(
  {
    language,
    surfaceId,
    viewport,
  }: {
    language: SiteLanguage;
    surfaceId: TextSurfaceId;
    viewport: ViewportSpec;
  },
) {
  const fixture = getPretextProbeLanguageFixture(language);
  const selectors = TEXT_SURFACE_FIXTURES[surfaceId];
  const summarySelector = "summarySelector" in selectors
    ? selectors.summarySelector
    : undefined;

  const surfaceConfig = (() => {
    switch (surfaceId) {
      case "story-card":
        return {
          summary: fixture.storySummary,
          summaryStyle: STORY_SUMMARY_STYLE,
          summaryWidth: viewport.storySummaryWidth,
          title: fixture.storyTitle,
          titleStyle: STORY_TITLE_STYLE,
          titleWidth: viewport.storyTitleWidth,
        };
      case "featured-story":
        return {
          summary: fixture.featuredSummary,
          summaryStyle: STORY_SUMMARY_STYLE,
          summaryWidth: viewport.featuredSummaryWidth,
          title: fixture.featuredTitle,
          titleStyle: STORY_TITLE_STYLE,
          titleWidth: viewport.featuredTitleWidth,
        };
      case "archive-item":
        return {
          summary: fixture.archiveSummary,
          summaryStyle: STORY_SUMMARY_STYLE,
          summaryWidth: viewport.storySummaryWidth,
          title: fixture.archiveTitle,
          titleStyle: STORY_TITLE_STYLE,
          titleWidth: viewport.storyTitleWidth,
        };
      case "signal-story":
        return {
          title: fixture.signalTitle,
          titleStyle: SIGNAL_TITLE_STYLE,
          titleWidth: viewport.signalWidth,
        };
      case "outline-link":
        return {
          title: fixture.outlineTitle,
          titleStyle: OUTLINE_TITLE_STYLE,
          titleWidth: viewport.outlineWidth,
        };
    }
  })();

  const measuredText = usePretextTextStyle({
    ...(surfaceConfig.summary
      ? {
        summary: surfaceConfig.summary,
        summarySelector,
      }
      : {}),
    title: surfaceConfig.title,
    titleSelector: selectors.titleSelector,
  });

  const children = [
    createElement(
      "h3",
      {
        className: selectors.titleSelector.slice(1),
        "data-inline-size": surfaceConfig.titleWidth,
        style: surfaceConfig.titleStyle,
      },
      surfaceConfig.title,
    ),
  ];

  if (surfaceConfig.summary && summarySelector) {
    children.push(
      createElement(
        "p",
        {
          className: summarySelector.slice(1),
          "data-inline-size": surfaceConfig.summaryWidth,
          style: surfaceConfig.summaryStyle,
        },
        surfaceConfig.summary,
      ),
    );
  }

  return createElement(
    "article",
    {
      ref: measuredText.ref,
      "data-probe-root": surfaceId,
      style: measuredText.style,
    },
    ...children,
  );
}

function StoryGridProbe(
  { language, viewport }: {
    language: SiteLanguage;
    viewport: ViewportSpec;
  },
) {
  const posts = getPretextProbeLanguageFixture(language).gridPosts;
  const balancedTextStyles = useBalancedStoryGridTextStyles({
    posts,
    summaryVisible: true,
  });

  return createElement(
    "div",
    {
      ref: balancedTextStyles.ref,
      "data-probe-root": "story-grid",
    },
    ...posts.map((story) =>
      createElement(
        "article",
        {
          key: story.url,
          "data-grid-card": true,
          style: balancedTextStyles.styleMap.get(story.url),
        },
        createElement(
          "h3",
          {
            className: PRETEXT_STORY_CARD_TITLE_CLASS,
            "data-inline-size": viewport.gridTitleWidth,
            style: STORY_TITLE_STYLE,
          },
          story.title,
        ),
        story.summary
          ? createElement(
            "p",
            {
              className: PRETEXT_STORY_CARD_SUMMARY_CLASS,
              "data-inline-size": viewport.gridSummaryWidth,
              style: STORY_SUMMARY_STYLE,
            },
            story.summary,
          )
          : null,
      )
    ),
  );
}

async function flushReactWork(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
  });
  await act(async () => {
    await Promise.resolve();
  });
}

async function withReactDomHarness<T>(
  {
    language,
    variant,
    viewport,
  }: {
    language: SiteLanguage;
    variant: ReactHarnessVariant;
    viewport: ViewportSpec;
  },
  run: (container: HTMLElement) => Promise<T>,
): Promise<T> {
  const JSDOM = await getJSDOM();
  const dom = new JSDOM(
    '<!doctype html><html><head></head><body><div id="app"></div></body></html>',
    { url: "http://localhost/" },
  );
  const { window } = dom;
  const restoreGlobalProperties = [
    createGlobalPropertySetter("window", window),
    createGlobalPropertySetter("document", window.document),
    createGlobalPropertySetter("navigator", window.navigator),
    createGlobalPropertySetter("HTMLElement", window.HTMLElement),
    createGlobalPropertySetter("Element", window.Element),
    createGlobalPropertySetter("Node", window.Node),
    createGlobalPropertySetter("Event", window.Event),
    createGlobalPropertySetter("CustomEvent", window.CustomEvent),
    createGlobalPropertySetter("MutationObserver", window.MutationObserver),
    createGlobalPropertySetter("OffscreenCanvas", TestOffscreenCanvas),
    createGlobalPropertySetter(
      "getComputedStyle",
      window.getComputedStyle.bind(window),
    ),
    createGlobalPropertySetter(
      "requestAnimationFrame",
      (callback: FrameRequestCallback) =>
        setTimeout(() => callback(Date.now()), 0),
    ),
    createGlobalPropertySetter("cancelAnimationFrame", clearTimeout),
    createGlobalPropertySetter("IS_REACT_ACT_ENVIRONMENT", true),
  ];

  const previousClientWidthDescriptor = Object.getOwnPropertyDescriptor(
    window.HTMLElement.prototype,
    "clientWidth",
  );
  Object.defineProperty(window.HTMLElement.prototype, "clientWidth", {
    configurable: true,
    get() {
      const inlineSize = this.getAttribute("data-inline-size");
      return inlineSize ? Number.parseInt(inlineSize, 10) : 0;
    },
  });

  class TestResizeObserver {
    disconnect() {}
    observe() {}
    unobserve() {}
  }

  window.matchMedia = (query: string): MediaQueryList =>
    createMediaQueryList(
      query === STORY_GRID_TWO_COLUMN_MEDIA_QUERY
        ? viewport.columns === 2
        : false,
    );
  window.document.documentElement.lang = getLanguageTag(language);
  window.document.documentElement.style.setProperty(
    PRETEXT_MEASURE_FONT_TOKEN,
    '"Noto Sans", "Helvetica Neue", Arial, sans-serif',
  );
  Reflect.set(window, "ResizeObserver", TestResizeObserver);
  const restoreResizeObserver = createGlobalPropertySetter(
    "ResizeObserver",
    TestResizeObserver,
  );

  clearPretextMeasurementCaches(PRETEXT_ENGINE);
  Reflect.set(
    globalThis,
    PRETEXT_DISABLE_GLOBAL_FLAG,
    variant === "without-pretext",
  );
  const container = window.document.getElementById("app");

  if (!(container instanceof window.HTMLElement)) {
    throw new Error("Unable to create the React harness root element");
  }

  try {
    return await run(container);
  } finally {
    Reflect.deleteProperty(globalThis, PRETEXT_DISABLE_GLOBAL_FLAG);
    restoreResizeObserver();

    if (previousClientWidthDescriptor) {
      Object.defineProperty(
        window.HTMLElement.prototype,
        "clientWidth",
        previousClientWidthDescriptor,
      );
    } else {
      Reflect.deleteProperty(window.HTMLElement.prototype, "clientWidth");
    }

    restoreGlobalProperties.reverse().forEach((restore) => restore());
    dom.window.close();
  }
}

async function renderTextScenario(
  scenario: TextSurfaceScenario,
  variant: ReactHarnessVariant,
): Promise<ReactHarnessScenarioResult> {
  return await withReactDomHarness(
    {
      language: scenario.language,
      variant,
      viewport: scenario.viewport,
    },
    async (container) => {
      const root = createRoot(container);

      await act(() => {
        root.render(
          createElement(TextSurfaceProbe, {
            language: scenario.language,
            surfaceId: scenario.surfaceId,
            viewport: scenario.viewport,
          }),
        );
      });
      await flushReactWork();

      const probeRoot = container.querySelector<HTMLElement>(
        "[data-probe-root]",
      );

      if (!probeRoot) {
        throw new Error(
          `Missing React text probe root for ${scenario.surfaceId}`,
        );
      }

      const metrics = readTextMetrics(probeRoot);

      await act(() => {
        root.unmount();
      });

      return {
        id: buildScenarioId(
          scenario.surfaceId,
          scenario.language,
          scenario.viewport.id,
        ),
        kind: "text",
        language: scenario.language,
        languageCode: getLanguageDataCode(scenario.language),
        metrics,
        surfaceId: scenario.surfaceId,
        variant,
        viewportId: scenario.viewport.id,
      };
    },
  );
}

async function renderGridScenario(
  scenario: GridScenario,
  variant: ReactHarnessVariant,
): Promise<ReactHarnessScenarioResult> {
  return await withReactDomHarness(
    {
      language: scenario.language,
      variant,
      viewport: scenario.viewport,
    },
    async (container) => {
      const root = createRoot(container);

      await act(() => {
        root.render(
          createElement(StoryGridProbe, {
            language: scenario.language,
            viewport: scenario.viewport,
          }),
        );
      });
      await flushReactWork();

      const probeRoot = container.querySelector<HTMLElement>(
        "[data-probe-root='story-grid']",
      );

      if (!probeRoot) {
        throw new Error("Missing React StoryGrid probe root");
      }

      const metrics = readGridMetrics(probeRoot, scenario.viewport.columns);

      await act(() => {
        root.unmount();
      });

      return {
        id: buildScenarioId(
          scenario.surfaceId,
          scenario.language,
          scenario.viewport.id,
        ),
        kind: "grid",
        language: scenario.language,
        languageCode: getLanguageDataCode(scenario.language),
        metrics,
        surfaceId: scenario.surfaceId,
        variant,
        viewportId: scenario.viewport.id,
      };
    },
  );
}

async function runVariant(
  scenarios: readonly ReactHarnessScenario[],
  variant: ReactHarnessVariant,
): Promise<readonly ReactHarnessScenarioResult[]> {
  const results: ReactHarnessScenarioResult[] = [];

  for (const scenario of scenarios) {
    results.push(
      scenario.kind === "text"
        ? await renderTextScenario(scenario, variant)
        : await renderGridScenario(scenario, variant),
    );
  }

  return results;
}

export async function runPretextReactHarness(
  outputDir: string,
): Promise<PretextReactHarnessReport> {
  const scenarios = buildPretextReactHarnessScenarios();
  const withPretextResults = await runVariant(scenarios, "with-pretext");
  const withoutPretextResults = await runVariant(scenarios, "without-pretext");

  return buildReport(outputDir, withPretextResults, withoutPretextResults);
}

export async function writePretextReactHarnessOutputs(
  report: PretextReactHarnessReport,
): Promise<string> {
  const reportPath = join(report.outputDir, "report.json");
  const summaryPath = join(report.outputDir, "summary.md");
  const summaryMarkdown = buildPretextReactHarnessSummaryMarkdown(report);

  await Deno.mkdir(report.outputDir, { recursive: true });
  await Deno.writeTextFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  await Deno.writeTextFile(summaryPath, `${summaryMarkdown}\n`);

  return summaryPath;
}

async function publishReactHarnessOutputsToGitHubActions(
  report: PretextReactHarnessReport,
): Promise<void> {
  await writeGitHubJobSummary(
    buildPretextReactHarnessSummaryMarkdown(report),
    Deno.env,
    { mode: "append" },
  );
}

if (import.meta.main) {
  if (Deno.args.includes("--help") || Deno.args.includes("-h")) {
    console.info(PRETEXT_REACT_HARNESS_USAGE);
    Deno.exit(0);
  }

  try {
    const options = parseCliOptions(Deno.args);
    const report = await runPretextReactHarness(options.outputDir);
    const summaryPath = await writePretextReactHarnessOutputs(report);
    const failureMessages: string[] = [];

    try {
      await publishReactHarnessOutputsToGitHubActions(report);
    } catch (error) {
      failureMessages.push(
        `Failed to publish React harness outputs to GitHub Actions: ${
          getErrorMessage(error)
        }`,
      );
    }

    console.info(
      [
        `Pretext React harness captured ${report.scenarioCount} scenario pair(s).`,
        `Report: ${join(report.outputDir, "report.json")}`,
        `Summary: ${summaryPath}`,
        ...failureMessages,
      ].join("\n"),
    );
  } catch (error) {
    console.error(getErrorMessage(error));
    Deno.exit(1);
  }
}

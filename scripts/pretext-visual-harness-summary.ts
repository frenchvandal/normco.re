import type {
  HarnessIssue,
  HarnessReport,
  ScenarioResult,
  SelectorMetric,
} from "./pretext-visual-harness.ts";

type PretextVisualHarnessSummaryOptions = Readonly<{
  maxClsRows?: number;
  maxIssueRows?: number;
}>;

export type PretextVisualHarnessSampleCounts = Readonly<{
  pretextBackedPixelMinBlockSize: number;
  summary: number;
  title: number;
}>;

function formatClsValue(value: number): string {
  return value.toFixed(6);
}

function escapeMarkdownCell(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("|", "\\|")
    .replaceAll("\n", "<br>");
}

function compareClsDescending(
  left: ScenarioResult,
  right: ScenarioResult,
): number {
  if (left.cls.value !== right.cls.value) {
    return right.cls.value - left.cls.value;
  }

  return left.stem.localeCompare(right.stem);
}

function compareIssues(
  left: HarnessIssue,
  right: HarnessIssue,
): number {
  if (left.severity !== right.severity) {
    return left.severity === "error" ? -1 : 1;
  }

  if (left.scenarioStem !== right.scenarioStem) {
    return left.scenarioStem.localeCompare(right.scenarioStem);
  }

  return left.code.localeCompare(right.code);
}

function countSelectorMetricSamples(
  selectorMetrics: ReadonlyArray<SelectorMetric>,
  predicate: (selectorMetric: SelectorMetric) => number,
): number {
  return selectorMetrics.reduce(
    (sampleCount, selectorMetric) => sampleCount + predicate(selectorMetric),
    0,
  );
}

function isResolvedPixelBlockSize(value: string | null): boolean {
  return value !== null && /^[+-]?(?:\d+|\d*\.\d+)px$/.test(value.trim());
}

export function getPretextVisualHarnessMaxCls(report: HarnessReport): number {
  return report.results.reduce(
    (maxValue, result) => Math.max(maxValue, result.cls.value),
    0,
  );
}

export function getPretextVisualHarnessNonZeroClsResults(
  report: HarnessReport,
): ReadonlyArray<ScenarioResult> {
  return [...report.results]
    .filter((result) => result.cls.value > 0)
    .sort(compareClsDescending);
}

export function getPretextVisualHarnessResultSampleCounts(
  result: ScenarioResult,
): PretextVisualHarnessSampleCounts {
  return {
    pretextBackedPixelMinBlockSize: countSelectorMetricSamples(
      result.selectorMetrics,
      (selectorMetric) =>
        selectorMetric.samples.filter((sample) =>
          isResolvedPixelBlockSize(sample.minBlockSize) &&
          (
            sample.pretextTitleHeight !== null ||
            sample.pretextSummaryHeight !== null
          )
        ).length,
    ),
    title: countSelectorMetricSamples(
      result.selectorMetrics,
      (selectorMetric) =>
        selectorMetric.samples.filter((sample) =>
          sample.pretextTitleHeight !== null
        ).length,
    ),
    summary: countSelectorMetricSamples(
      result.selectorMetrics,
      (selectorMetric) =>
        selectorMetric.samples.filter((sample) =>
          sample.pretextSummaryHeight !== null
        ).length,
    ),
  };
}

export function getPretextVisualHarnessSampleCounts(
  report: HarnessReport,
): PretextVisualHarnessSampleCounts {
  return report.results.reduce(
    (counts, result) => {
      const resultCounts = getPretextVisualHarnessResultSampleCounts(result);

      return {
        pretextBackedPixelMinBlockSize: counts.pretextBackedPixelMinBlockSize +
          resultCounts.pretextBackedPixelMinBlockSize,
        title: counts.title + resultCounts.title,
        summary: counts.summary + resultCounts.summary,
      };
    },
    { pretextBackedPixelMinBlockSize: 0, title: 0, summary: 0 },
  );
}

export function buildPretextVisualHarnessSummaryMarkdown(
  report: HarnessReport,
  options: PretextVisualHarnessSummaryOptions = {},
): string {
  const maxClsRows = options.maxClsRows ?? 5;
  const maxIssueRows = options.maxIssueRows ?? 10;
  const maxCls = getPretextVisualHarnessMaxCls(report);
  const nonZeroClsResults = getPretextVisualHarnessNonZeroClsResults(report);
  const sampleCounts = getPretextVisualHarnessSampleCounts(report);
  const topClsResults = nonZeroClsResults.slice(0, maxClsRows);
  const issueRows = [...report.issues].sort(compareIssues).slice(
    0,
    maxIssueRows,
  );
  const lines = [
    "# Pretext Visual Harness",
    "",
    "| Metric | Value |",
    "| --- | --- |",
    `| Generated at | ${escapeMarkdownCell(report.generatedAt)} |`,
    `| Variant | ${escapeMarkdownCell(report.variant)} |`,
    `| Scenarios | ${report.scenarioCount} |`,
    `| Errors | ${report.errorCount} |`,
    `| Warnings | ${report.warningCount} |`,
    `| Max CLS | ${formatClsValue(maxCls)} |`,
    `| Samples with title vars | ${sampleCounts.title} |`,
    `| Samples with summary vars | ${sampleCounts.summary} |`,
    `| Samples with Pretext-backed pixel min-block-size | ${sampleCounts.pretextBackedPixelMinBlockSize} |`,
    `| Base URL | ${escapeMarkdownCell(report.baseUrl)} |`,
    `| Output dir | ${escapeMarkdownCell(report.outputDir)} |`,
    "| Report file | report.json |",
    "| Screenshots dir | screenshots/ |",
  ];

  if (report.rootDir !== undefined) {
    lines.push(`| Static root | ${escapeMarkdownCell(report.rootDir)} |`);
  }

  lines.push("", "## CLS Outliers", "");

  if (topClsResults.length === 0) {
    lines.push("All scenarios reported `0.000000` CLS.");
  } else {
    lines.push("| Scenario | CLS | Route | Viewport |");
    lines.push("| --- | --- | --- | --- |");

    for (const result of topClsResults) {
      lines.push(
        `| ${escapeMarkdownCell(result.stem)} | ${
          formatClsValue(result.cls.value)
        } | ${escapeMarkdownCell(result.pathname)} | ${
          escapeMarkdownCell(result.viewportId)
        } |`,
      );
    }

    if (nonZeroClsResults.length > topClsResults.length) {
      lines.push(
        "",
        `...and ${
          nonZeroClsResults.length - topClsResults.length
        } more non-zero CLS scenario(s).`,
      );
    }
  }

  lines.push("", "## Issues", "");

  if (issueRows.length === 0) {
    lines.push("No harness issue reported.");
  } else {
    lines.push("| Severity | Code | Scenario | Message |");
    lines.push("| --- | --- | --- | --- |");

    for (const issue of issueRows) {
      lines.push(
        `| ${issue.severity} | ${escapeMarkdownCell(issue.code)} | ${
          escapeMarkdownCell(issue.scenarioStem)
        } | ${escapeMarkdownCell(issue.message)} |`,
      );
    }

    if (report.issues.length > issueRows.length) {
      lines.push(
        "",
        `...and ${report.issues.length - issueRows.length} more issue(s).`,
      );
    }
  }

  return lines.join("\n");
}

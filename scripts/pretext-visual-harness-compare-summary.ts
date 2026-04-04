import type {
  PretextVisualHarnessComparisonReport,
  PretextVisualHarnessScenarioComparison,
} from "./pretext-visual-harness-compare.ts";

type PretextVisualHarnessComparisonSummaryOptions = Readonly<{
  maxScenarioRows?: number;
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

function formatSignedDelta(value: number): string {
  return `${value > 0 ? "+" : ""}${value}`;
}

function formatSignedClsDelta(value: number): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(6)}`;
}

type ComparisonVariantKey = "withPretext" | "withoutPretext";

function filterScenarioComparisonsByRouteKind(
  report: PretextVisualHarnessComparisonReport,
  routeKind: PretextVisualHarnessScenarioComparison["routeKind"],
): ReadonlyArray<PretextVisualHarnessScenarioComparison> {
  return report.scenarioComparisons.filter((comparison) =>
    comparison.routeKind === routeKind
  );
}

function filterScenarioComparisonsExcludingRouteKind(
  report: PretextVisualHarnessComparisonReport,
  routeKind: PretextVisualHarnessScenarioComparison["routeKind"],
): ReadonlyArray<PretextVisualHarnessScenarioComparison> {
  return report.scenarioComparisons.filter((comparison) =>
    comparison.routeKind !== routeKind
  );
}

function getScenarioComparisonMaxCls(
  comparisons: ReadonlyArray<PretextVisualHarnessScenarioComparison>,
  variantKey: ComparisonVariantKey,
): number {
  return comparisons.reduce(
    (maxValue, comparison) => Math.max(maxValue, comparison[variantKey].cls),
    0,
  );
}

function buildScenarioDeltaScore(
  comparison: PretextVisualHarnessScenarioComparison,
): number {
  const withCounts = comparison.withPretext.sampleCounts;
  const withoutCounts = comparison.withoutPretext.sampleCounts;

  return Math.abs(
        comparison.withPretext.errorCount -
          comparison.withoutPretext.errorCount,
      ) * 1_000_000 +
    Math.abs(
        comparison.withPretext.warningCount -
          comparison.withoutPretext.warningCount,
      ) * 100_000 +
    Math.abs(comparison.withPretext.cls - comparison.withoutPretext.cls) *
      10_000 +
    Math.abs(
        withCounts.pretextBackedPixelMinBlockSize -
          withoutCounts.pretextBackedPixelMinBlockSize,
      ) * 100 +
    Math.abs(withCounts.title - withoutCounts.title) * 10 +
    Math.abs(withCounts.summary - withoutCounts.summary);
}

function compareScenarioDeltas(
  left: PretextVisualHarnessScenarioComparison,
  right: PretextVisualHarnessScenarioComparison,
): number {
  const scoreDelta = buildScenarioDeltaScore(right) -
    buildScenarioDeltaScore(left);

  if (scoreDelta !== 0) {
    return scoreDelta;
  }

  return left.stem.localeCompare(right.stem);
}

function getDifferingScenarioComparisons(
  report: PretextVisualHarnessComparisonReport,
): ReadonlyArray<PretextVisualHarnessScenarioComparison> {
  return report.scenarioComparisons.filter((comparison) => {
    const withCounts = comparison.withPretext.sampleCounts;
    const withoutCounts = comparison.withoutPretext.sampleCounts;

    return comparison.withPretext.cls !== comparison.withoutPretext.cls ||
      comparison.withPretext.errorCount !==
        comparison.withoutPretext.errorCount ||
      comparison.withPretext.warningCount !==
        comparison.withoutPretext.warningCount ||
      withCounts.pretextBackedPixelMinBlockSize !==
        withoutCounts.pretextBackedPixelMinBlockSize ||
      withCounts.title !== withoutCounts.title ||
      withCounts.summary !== withoutCounts.summary;
  }).sort(compareScenarioDeltas);
}

function buildInterpretationLines(
  report: PretextVisualHarnessComparisonReport,
): ReadonlyArray<string> {
  const lines: string[] = [];
  const probeScenarioComparisons = filterScenarioComparisonsByRouteKind(
    report,
    "probe",
  );
  const publicScenarioComparisons = filterScenarioComparisonsExcludingRouteKind(
    report,
    "probe",
  );
  const titleDelta = report.withPretext.sampleCounts.title -
    report.withoutPretext.sampleCounts.title;
  const summaryDelta = report.withPretext.sampleCounts.summary -
    report.withoutPretext.sampleCounts.summary;
  const pretextBackedPixelMinBlockSizeDelta =
    report.withPretext.sampleCounts.pretextBackedPixelMinBlockSize -
    report.withoutPretext.sampleCounts.pretextBackedPixelMinBlockSize;
  const publicMaxClsDelta = publicScenarioComparisons.length === 0
    ? report.withoutPretext.maxCls - report.withPretext.maxCls
    : getScenarioComparisonMaxCls(publicScenarioComparisons, "withoutPretext") -
      getScenarioComparisonMaxCls(publicScenarioComparisons, "withPretext");

  if (
    titleDelta === 0 &&
    summaryDelta === 0 &&
    pretextBackedPixelMinBlockSizeDelta === 0
  ) {
    lines.push(
      "The comparison did not detect a route-level runtime signal unique to Pretext on this matrix. In the current repository shape, that usually means the public pages under test remain mostly static or do not mount the targeted React surfaces during the run.",
    );
    lines.push(
      "Read the React harness as the primary efficacy signal for Pretext itself; read this browser comparison as a visual-regression and CLS guard for the public routes.",
    );
  } else if (titleDelta > 0 || summaryDelta > 0) {
    lines.push(
      `Pretext is visibly active in the reference run: +${titleDelta} sample(s) with title variables, and +${summaryDelta} sample(s) with summary variables.`,
    );
  } else {
    lines.push(
      "The no-Pretext variant exposes more tracked variables than expected; the runtime flag deserves a closer look.",
    );
  }

  if (pretextBackedPixelMinBlockSizeDelta > 0) {
    lines.push(
      `The Pretext-enabled variant resolves +${pretextBackedPixelMinBlockSizeDelta} sample(s) with a pixel \`min-block-size\` that is genuinely backed by Pretext.`,
    );
  } else if (pretextBackedPixelMinBlockSizeDelta === 0) {
    lines.push(
      "Both variants resolve the same number of pixel `min-block-size` values that are explicitly backed by Pretext on the tracked nodes.",
    );
  } else {
    lines.push(
      "The no-Pretext variant resolves more Pretext-backed pixel `min-block-size` values, which is not the expected behavior.",
    );
  }

  if (probeScenarioComparisons.length > 0 && titleDelta > 0) {
    lines.push(
      "The direct runtime signal comes from the dedicated browser probe route, which mounts the targeted React surfaces explicitly instead of relying on mostly static public-route HTML.",
    );
    lines.push(
      "Read probe-route CLS separately from the public-route guard: the probe is intentionally client-mounted, so its CLS is diagnostic rather than a production UX benchmark.",
    );
  }

  if (publicMaxClsDelta > 0) {
    lines.push(
      `Worst-case public-route CLS improves by ${
        formatClsValue(publicMaxClsDelta)
      } with Pretext.`,
    );
  } else if (publicMaxClsDelta === 0) {
    lines.push(
      "Worst-case public-route CLS is identical between the two variants on this runner.",
    );
  } else {
    lines.push(
      `Worst-case public-route CLS is higher with Pretext by ${
        formatClsValue(Math.abs(publicMaxClsDelta))
      }, which merits a focused visual inspection.`,
    );
  }

  return lines;
}

export function buildPretextVisualHarnessComparisonSummaryMarkdown(
  report: PretextVisualHarnessComparisonReport,
  options: PretextVisualHarnessComparisonSummaryOptions = {},
): string {
  const maxScenarioRows = options.maxScenarioRows ?? 12;
  const differingScenarioComparisons = getDifferingScenarioComparisons(report);
  const scenarioRows = differingScenarioComparisons.slice(0, maxScenarioRows);
  const publicScenarioComparisons = filterScenarioComparisonsExcludingRouteKind(
    report,
    "probe",
  );
  const probeScenarioComparisons = filterScenarioComparisonsByRouteKind(
    report,
    "probe",
  );
  const withPublicMaxCls = getScenarioComparisonMaxCls(
    publicScenarioComparisons,
    "withPretext",
  );
  const withoutPublicMaxCls = getScenarioComparisonMaxCls(
    publicScenarioComparisons,
    "withoutPretext",
  );
  const withProbeMaxCls = getScenarioComparisonMaxCls(
    probeScenarioComparisons,
    "withPretext",
  );
  const withoutProbeMaxCls = getScenarioComparisonMaxCls(
    probeScenarioComparisons,
    "withoutPretext",
  );
  const lines = [
    "# Pretext Visual Harness Comparison",
    "",
    "| Metric | With Pretext | Without Pretext | Delta |",
    "| --- | --- | --- | --- |",
    `| Generated at | ${escapeMarkdownCell(report.generatedAt)} | ${
      escapeMarkdownCell(report.generatedAt)
    } | - |`,
    `| Scenarios | ${report.withPretext.scenarioCount} | ${report.withoutPretext.scenarioCount} | 0 |`,
    `| Errors | ${report.withPretext.errorCount} | ${report.withoutPretext.errorCount} | ${
      formatSignedDelta(
        report.withPretext.errorCount - report.withoutPretext.errorCount,
      )
    } |`,
    `| Warnings | ${report.withPretext.warningCount} | ${report.withoutPretext.warningCount} | ${
      formatSignedDelta(
        report.withPretext.warningCount - report.withoutPretext.warningCount,
      )
    } |`,
    `| Max CLS | ${formatClsValue(report.withPretext.maxCls)} | ${
      formatClsValue(report.withoutPretext.maxCls)
    } | ${
      formatSignedClsDelta(
        report.withPretext.maxCls - report.withoutPretext.maxCls,
      )
    } |`,
    `| Public-route max CLS | ${formatClsValue(withPublicMaxCls)} | ${
      formatClsValue(withoutPublicMaxCls)
    } | ${
      formatSignedClsDelta(
        withPublicMaxCls - withoutPublicMaxCls,
      )
    } |`,
    `| Probe-route max CLS | ${formatClsValue(withProbeMaxCls)} | ${
      formatClsValue(withoutProbeMaxCls)
    } | ${
      formatSignedClsDelta(
        withProbeMaxCls - withoutProbeMaxCls,
      )
    } |`,
    `| Non-zero CLS scenarios | ${report.withPretext.nonZeroClsScenarioCount} | ${report.withoutPretext.nonZeroClsScenarioCount} | ${
      formatSignedDelta(
        report.withPretext.nonZeroClsScenarioCount -
          report.withoutPretext.nonZeroClsScenarioCount,
      )
    } |`,
    `| Samples with title vars | ${report.withPretext.sampleCounts.title} | ${report.withoutPretext.sampleCounts.title} | ${
      formatSignedDelta(
        report.withPretext.sampleCounts.title -
          report.withoutPretext.sampleCounts.title,
      )
    } |`,
    `| Samples with summary vars | ${report.withPretext.sampleCounts.summary} | ${report.withoutPretext.sampleCounts.summary} | ${
      formatSignedDelta(
        report.withPretext.sampleCounts.summary -
          report.withoutPretext.sampleCounts.summary,
      )
    } |`,
    `| Samples with Pretext-backed pixel min-block-size | ${report.withPretext.sampleCounts.pretextBackedPixelMinBlockSize} | ${report.withoutPretext.sampleCounts.pretextBackedPixelMinBlockSize} | ${
      formatSignedDelta(
        report.withPretext.sampleCounts.pretextBackedPixelMinBlockSize -
          report.withoutPretext.sampleCounts.pretextBackedPixelMinBlockSize,
      )
    } |`,
    `| Base URL | ${escapeMarkdownCell(report.withPretext.baseUrl)} | ${
      escapeMarkdownCell(report.withoutPretext.baseUrl)
    } | - |`,
    `| Output dir | ${escapeMarkdownCell(report.outputDir)} | ${
      escapeMarkdownCell(report.outputDir)
    } | - |`,
    `| Report file | ${escapeMarkdownCell(report.withPretext.reportPath)} | ${
      escapeMarkdownCell(report.withoutPretext.reportPath)
    } | - |`,
    `| Summary file | ${escapeMarkdownCell(report.withPretext.summaryPath)} | ${
      escapeMarkdownCell(report.withoutPretext.summaryPath)
    } | - |`,
    `| Screenshots dir | ${
      escapeMarkdownCell(report.withPretext.screenshotsDir)
    } | ${escapeMarkdownCell(report.withoutPretext.screenshotsDir)} | - |`,
  ];

  if (report.rootDir !== undefined) {
    lines.push(
      `| Static root | ${escapeMarkdownCell(report.rootDir)} | ${
        escapeMarkdownCell(report.rootDir)
      } | - |`,
    );
  }

  lines.push("", "## Interpretation", "");

  for (const interpretationLine of buildInterpretationLines(report)) {
    lines.push(`- ${interpretationLine}`);
  }

  lines.push("", "## Scenario Deltas", "");

  if (scenarioRows.length === 0) {
    lines.push("No scenario-level delta detected between the two variants.");
  } else {
    lines.push(
      "| Scenario | Route kind | CLS with | CLS without | Title vars | Summary vars | Pretext-backed pixel min-block-size |",
    );
    lines.push("| --- | --- | --- | --- | --- | --- | --- |");

    for (const comparison of scenarioRows) {
      lines.push(
        `| ${escapeMarkdownCell(comparison.stem)} | ${
          escapeMarkdownCell(comparison.routeKind)
        } | ${formatClsValue(comparison.withPretext.cls)} | ${
          formatClsValue(comparison.withoutPretext.cls)
        } | ${comparison.withPretext.sampleCounts.title} / ${comparison.withoutPretext.sampleCounts.title} | ${comparison.withPretext.sampleCounts.summary} / ${comparison.withoutPretext.sampleCounts.summary} | ${comparison.withPretext.sampleCounts.pretextBackedPixelMinBlockSize} / ${comparison.withoutPretext.sampleCounts.pretextBackedPixelMinBlockSize} |`,
      );
    }

    if (differingScenarioComparisons.length > scenarioRows.length) {
      lines.push(
        "",
        `...and ${
          differingScenarioComparisons.length - scenarioRows.length
        } more differing scenario(s).`,
      );
    }
  }

  return lines.join("\n");
}

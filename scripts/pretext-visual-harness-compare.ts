import { parseArgs } from "@std/cli";
import { isAbsolute, join, normalize, relative } from "@std/path";

import { createUsageError, getErrorMessage } from "./_shared.ts";
import { REPO_ROOT } from "./deno_graph.ts";
import { writeGitHubJobSummary } from "./github-actions.ts";
import { buildPretextVisualHarnessComparisonSummaryMarkdown } from "./pretext-visual-harness-compare-summary.ts";
import {
  runPretextVisualHarness,
  startPretextVisualHarnessStaticServer,
  writePretextVisualHarnessOutputs,
} from "./pretext-visual-harness.ts";
import {
  getPretextVisualHarnessMaxCls,
  getPretextVisualHarnessNonZeroClsResults,
  getPretextVisualHarnessProbeDiagnosticsCounts,
  getPretextVisualHarnessResultSampleCounts,
  getPretextVisualHarnessSampleCounts,
} from "./pretext-visual-harness-summary.ts";
import type {
  HarnessIssue,
  HarnessReport,
  PretextHarnessVariant,
  PretextVisualHarnessRunOptions,
  ProbeDiagnosticsSummary,
  ScenarioResult,
} from "./pretext-visual-harness.ts";
import type {
  PretextVisualHarnessProbeDiagnosticsCounts,
  PretextVisualHarnessSampleCounts,
} from "./pretext-visual-harness-summary.ts";

type PretextVisualHarnessComparisonRunOptions = Readonly<{
  baseUrl?: string;
  outputDir: string;
  rootDir: string;
}>;

type ParsedCliOptions = PretextVisualHarnessComparisonRunOptions;

type ScenarioIssueCounts = Readonly<{
  errorCount: number;
  warningCount: number;
}>;

export type PretextVisualHarnessComparisonVariantSummary = Readonly<{
  baseUrl: string;
  errorCount: number;
  issueCount: number;
  maxCls: number;
  nonZeroClsScenarioCount: number;
  probeDiagnostics: PretextVisualHarnessProbeDiagnosticsCounts;
  reportPath: string;
  sampleCounts: PretextVisualHarnessSampleCounts;
  scenarioCount: number;
  screenshotsDir: string;
  summaryPath: string;
  variant: PretextHarnessVariant;
  warningCount: number;
}>;

type PretextVisualHarnessScenarioComparisonMetrics = Readonly<{
  cls: number;
  errorCount: number;
  probeDiagnostics: ProbeDiagnosticsSummary | null;
  sampleCounts: PretextVisualHarnessSampleCounts;
  screenshotPath: string | null;
  warningCount: number;
}>;

export type PretextVisualHarnessScenarioComparison = Readonly<{
  languageCode: string;
  pathname: string;
  routeKind: ScenarioResult["routeKind"];
  stem: string;
  viewportId: ScenarioResult["viewportId"];
  withPretext: PretextVisualHarnessScenarioComparisonMetrics;
  withoutPretext: PretextVisualHarnessScenarioComparisonMetrics;
}>;

export type PretextVisualHarnessComparisonReport = Readonly<{
  baseUrl: string;
  generatedAt: string;
  outputDir: string;
  rootDir?: string;
  scenarioComparisons: ReadonlyArray<PretextVisualHarnessScenarioComparison>;
  scenarioCount: number;
  withPretext: PretextVisualHarnessComparisonVariantSummary;
  withoutPretext: PretextVisualHarnessComparisonVariantSummary;
}>;

export const PRETEXT_VISUAL_HARNESS_COMPARE_USAGE = [
  "Usage: deno run --allow-env --allow-net=127.0.0.1,localhost --allow-read --allow-write=.tmp/pretext-harness-compare scripts/pretext-visual-harness-compare.ts [options]",
  "",
  "Options:",
  "  --base-url=<url>   Reuse an already running site root instead of serving _site locally",
  "  --root=<path>      Generated site root to serve when --base-url is omitted (default: _site)",
  "  --output=<path>    Directory for the compare report, per-variant summaries, and screenshots",
  "",
  "Install Chromium once with: deno task pretext:harness:install",
].join("\n");

function resolveRepoPath(path: string): string {
  return isAbsolute(path) ? normalize(path) : join(REPO_ROOT, path);
}

function toPosixRelativePath(from: string, to: string): string {
  return relative(from, to).replaceAll("\\", "/");
}

function parseCliOptions(args: ReadonlyArray<string>): ParsedCliOptions {
  const parsed = parseArgs(args, {
    string: ["base-url", "root", "output"],
    boolean: ["help"],
  });

  if (parsed.help) {
    throw createUsageError("", PRETEXT_VISUAL_HARNESS_COMPARE_USAGE);
  }

  if (parsed._.length > 0) {
    throw createUsageError(
      `Unexpected positional arguments: ${parsed._.join(" ")}`,
      PRETEXT_VISUAL_HARNESS_COMPARE_USAGE,
    );
  }

  const baseUrl = typeof parsed["base-url"] === "string"
    ? parsed["base-url"].trim()
    : undefined;
  const rootValue =
    typeof parsed.root === "string" && parsed.root.trim().length > 0
      ? parsed.root.trim()
      : "_site";
  const outputValue =
    typeof parsed.output === "string" && parsed.output.trim().length > 0
      ? parsed.output.trim()
      : ".tmp/pretext-harness-compare";

  if (baseUrl !== undefined) {
    try {
      const url = new URL(baseUrl);

      if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error("Only http:// and https:// base URLs are supported");
      }
    } catch (error) {
      throw createUsageError(
        `Invalid value for --base-url: ${getErrorMessage(error)}`,
        PRETEXT_VISUAL_HARNESS_COMPARE_USAGE,
      );
    }
  }

  return baseUrl === undefined
    ? {
      outputDir: resolveRepoPath(outputValue),
      rootDir: resolveRepoPath(rootValue),
    }
    : {
      baseUrl,
      outputDir: resolveRepoPath(outputValue),
      rootDir: resolveRepoPath(rootValue),
    };
}

function createScenarioIssueCountMap(
  issues: ReadonlyArray<HarnessIssue>,
): ReadonlyMap<string, ScenarioIssueCounts> {
  const issueCounts = new Map<string, ScenarioIssueCounts>();

  for (const issue of issues) {
    const currentCounts = issueCounts.get(issue.scenarioStem) ?? {
      errorCount: 0,
      warningCount: 0,
    };

    issueCounts.set(issue.scenarioStem, {
      errorCount: currentCounts.errorCount +
        (issue.severity === "error" ? 1 : 0),
      warningCount: currentCounts.warningCount +
        (issue.severity === "warning" ? 1 : 0),
    });
  }

  return issueCounts;
}

function buildScenarioComparisonMetrics(
  comparisonOutputDir: string,
  issueCounts: ReadonlyMap<string, ScenarioIssueCounts>,
  report: HarnessReport,
  result: ScenarioResult,
): PretextVisualHarnessScenarioComparisonMetrics {
  const scenarioIssueCounts = issueCounts.get(result.stem) ?? {
    errorCount: 0,
    warningCount: 0,
  };

  return {
    cls: result.cls.value,
    errorCount: scenarioIssueCounts.errorCount,
    probeDiagnostics: result.probeDiagnostics,
    sampleCounts: getPretextVisualHarnessResultSampleCounts(result),
    screenshotPath: result.screenshotPath === null ? null : toPosixRelativePath(
      comparisonOutputDir,
      join(report.outputDir, result.screenshotPath),
    ),
    warningCount: scenarioIssueCounts.warningCount,
  };
}

function buildVariantSummary(
  comparisonOutputDir: string,
  report: HarnessReport,
): PretextVisualHarnessComparisonVariantSummary {
  return {
    baseUrl: report.baseUrl,
    errorCount: report.errorCount,
    issueCount: report.issues.length,
    maxCls: getPretextVisualHarnessMaxCls(report),
    nonZeroClsScenarioCount: getPretextVisualHarnessNonZeroClsResults(report)
      .length,
    probeDiagnostics: getPretextVisualHarnessProbeDiagnosticsCounts(report),
    reportPath: toPosixRelativePath(
      comparisonOutputDir,
      join(report.outputDir, "report.json"),
    ),
    sampleCounts: getPretextVisualHarnessSampleCounts(report),
    scenarioCount: report.scenarioCount,
    screenshotsDir: toPosixRelativePath(
      comparisonOutputDir,
      join(report.outputDir, "screenshots"),
    ),
    summaryPath: toPosixRelativePath(
      comparisonOutputDir,
      join(report.outputDir, "summary.md"),
    ),
    variant: report.variant,
    warningCount: report.warningCount,
  };
}

function createScenarioComparison(
  comparisonOutputDir: string,
  withPretextIssueCounts: ReadonlyMap<string, ScenarioIssueCounts>,
  withPretextReport: HarnessReport,
  withPretextResult: ScenarioResult,
  withoutPretextIssueCounts: ReadonlyMap<string, ScenarioIssueCounts>,
  withoutPretextReport: HarnessReport,
  withoutPretextResult: ScenarioResult,
): PretextVisualHarnessScenarioComparison {
  return {
    languageCode: withPretextResult.languageCode,
    pathname: withPretextResult.pathname,
    routeKind: withPretextResult.routeKind,
    stem: withPretextResult.stem,
    viewportId: withPretextResult.viewportId,
    withPretext: buildScenarioComparisonMetrics(
      comparisonOutputDir,
      withPretextIssueCounts,
      withPretextReport,
      withPretextResult,
    ),
    withoutPretext: buildScenarioComparisonMetrics(
      comparisonOutputDir,
      withoutPretextIssueCounts,
      withoutPretextReport,
      withoutPretextResult,
    ),
  };
}

function assertCompatibleScenarioResults(
  withPretextResult: ScenarioResult,
  withoutPretextResult: ScenarioResult,
): void {
  if (
    withPretextResult.routeKind !== withoutPretextResult.routeKind ||
    withPretextResult.language !== withoutPretextResult.language ||
    withPretextResult.pathname !== withoutPretextResult.pathname ||
    withPretextResult.viewportId !== withoutPretextResult.viewportId
  ) {
    throw new Error(
      `Scenario mismatch for ${withPretextResult.stem}: variant reports are not aligned`,
    );
  }
}

function createVariantRunOptions(
  options: PretextVisualHarnessComparisonRunOptions,
  variant: PretextHarnessVariant,
  outputDir: string,
): PretextVisualHarnessRunOptions {
  return {
    ...(options.baseUrl !== undefined ? { baseUrl: options.baseUrl } : {}),
    disablePretext: variant === "without-pretext",
    outputDir,
    rootDir: options.rootDir,
    variant,
  };
}

export function buildPretextVisualHarnessComparisonReport(
  outputDir: string,
  withPretextReport: HarnessReport,
  withoutPretextReport: HarnessReport,
): PretextVisualHarnessComparisonReport {
  if (withPretextReport.scenarioCount !== withoutPretextReport.scenarioCount) {
    throw new Error(
      `Scenario count mismatch: with-pretext=${withPretextReport.scenarioCount}, without-pretext=${withoutPretextReport.scenarioCount}`,
    );
  }

  const withPretextResults = new Map(
    withPretextReport.results.map((result) => [result.stem, result]),
  );
  const withoutPretextResults = new Map(
    withoutPretextReport.results.map((result) => [result.stem, result]),
  );

  if (withPretextResults.size !== withoutPretextResults.size) {
    throw new Error("Variant result sets differ in size");
  }

  const withPretextIssueCounts = createScenarioIssueCountMap(
    withPretextReport.issues,
  );
  const withoutPretextIssueCounts = createScenarioIssueCountMap(
    withoutPretextReport.issues,
  );
  const scenarioComparisons: PretextVisualHarnessScenarioComparison[] = [];

  for (const withPretextResult of withPretextReport.results) {
    const withoutPretextResult = withoutPretextResults.get(
      withPretextResult.stem,
    );

    if (!withoutPretextResult) {
      throw new Error(
        `Missing comparison scenario for ${withPretextResult.stem} in without-pretext report`,
      );
    }

    assertCompatibleScenarioResults(withPretextResult, withoutPretextResult);
    scenarioComparisons.push(
      createScenarioComparison(
        outputDir,
        withPretextIssueCounts,
        withPretextReport,
        withPretextResult,
        withoutPretextIssueCounts,
        withoutPretextReport,
        withoutPretextResult,
      ),
    );
  }

  scenarioComparisons.sort((left, right) =>
    left.stem.localeCompare(right.stem)
  );

  return {
    baseUrl: withPretextReport.baseUrl,
    generatedAt: new Date().toISOString(),
    outputDir,
    ...(withPretextReport.rootDir !== undefined
      ? { rootDir: withPretextReport.rootDir }
      : {}),
    scenarioComparisons,
    scenarioCount: scenarioComparisons.length,
    withPretext: buildVariantSummary(outputDir, withPretextReport),
    withoutPretext: buildVariantSummary(outputDir, withoutPretextReport),
  };
}

export async function writePretextVisualHarnessComparisonOutputs(
  report: PretextVisualHarnessComparisonReport,
): Promise<string> {
  const comparisonPath = join(report.outputDir, "comparison.json");
  const summaryPath = join(report.outputDir, "summary.md");
  const summaryMarkdown = buildPretextVisualHarnessComparisonSummaryMarkdown(
    report,
  );

  await Deno.mkdir(report.outputDir, { recursive: true });
  await Deno.writeTextFile(
    comparisonPath,
    `${JSON.stringify(report, null, 2)}\n`,
  );
  await Deno.writeTextFile(summaryPath, `${summaryMarkdown}\n`);

  return summaryPath;
}

async function publishComparisonOutputsToGitHubActions(
  report: PretextVisualHarnessComparisonReport,
): Promise<void> {
  await writeGitHubJobSummary(
    buildPretextVisualHarnessComparisonSummaryMarkdown(report),
  );
}

export async function runPretextVisualHarnessComparison(
  options: PretextVisualHarnessComparisonRunOptions,
): Promise<PretextVisualHarnessComparisonReport> {
  const withPretextOutputDir = join(options.outputDir, "with-pretext");
  const withoutPretextOutputDir = join(options.outputDir, "without-pretext");
  const server = options.baseUrl === undefined
    ? await startPretextVisualHarnessStaticServer(options.rootDir)
    : undefined;

  try {
    const sharedOptions = options.baseUrl === undefined
      ? options
      : { ...options, baseUrl: options.baseUrl };
    const baseUrl = options.baseUrl ?? server?.baseUrl;

    if (baseUrl === undefined) {
      throw new Error(
        "Unable to resolve a base URL for the Pretext visual harness comparison",
      );
    }

    const withPretextReport = await runPretextVisualHarness(
      createVariantRunOptions(
        { ...sharedOptions, baseUrl },
        "with-pretext",
        withPretextOutputDir,
      ),
    );
    await writePretextVisualHarnessOutputs(withPretextReport);

    const withoutPretextReport = await runPretextVisualHarness(
      createVariantRunOptions(
        { ...sharedOptions, baseUrl },
        "without-pretext",
        withoutPretextOutputDir,
      ),
    );
    await writePretextVisualHarnessOutputs(withoutPretextReport);

    return buildPretextVisualHarnessComparisonReport(
      options.outputDir,
      withPretextReport,
      withoutPretextReport,
    );
  } finally {
    await server?.close();
  }
}

if (import.meta.main) {
  if (Deno.args.includes("--help") || Deno.args.includes("-h")) {
    console.info(PRETEXT_VISUAL_HARNESS_COMPARE_USAGE);
    Deno.exit(0);
  }

  try {
    const options = parseCliOptions(Deno.args);
    const report = await runPretextVisualHarnessComparison(options);
    const summaryPath = await writePretextVisualHarnessComparisonOutputs(
      report,
    );
    const failureMessages: string[] = [];

    try {
      await publishComparisonOutputsToGitHubActions(report);
    } catch (error) {
      failureMessages.push(
        `GitHub Actions publication failed: ${getErrorMessage(error)}`,
      );
    }

    if (report.withPretext.errorCount > 0) {
      failureMessages.push(
        `Pretext visual harness comparison found ${report.withPretext.errorCount} error(s) with Pretext enabled. See ${report.withPretext.reportPath}`,
      );
    }

    if (report.withoutPretext.errorCount > 0) {
      failureMessages.push(
        `Pretext visual harness comparison found ${report.withoutPretext.errorCount} error(s) with Pretext disabled. See ${report.withoutPretext.reportPath}`,
      );
    }

    if (failureMessages.length > 0) {
      throw new Error(failureMessages.join("\n\n"));
    }

    console.info(
      [
        `Pretext visual harness comparison captured ${report.scenarioCount} scenario pair(s).`,
        `Comparison report: ${join(report.outputDir, "comparison.json")}`,
        `Summary: ${summaryPath}`,
      ].join("\n"),
    );
  } catch (error) {
    console.error(getErrorMessage(error));
    Deno.exit(1);
  }
}

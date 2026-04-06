import { getErrorMessage, hasHelpFlag } from "./_shared.ts";

type HtmlValidationMessage = Readonly<{
  severity?: number;
}>;

type HtmlValidationResult = Readonly<{
  filePath?: string;
  errorCount?: number;
  warningCount?: number;
  messages?: readonly HtmlValidationMessage[];
}>;

type HtmlValidationReport = Readonly<{
  valid?: boolean;
  results?: readonly HtmlValidationResult[];
}>;

function printUsage(): void {
  console.log(
    "Usage: deno run --allow-read scripts/assert-html-validation.ts [report-path]",
  );
}

function toCount(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function summarizeIssues(
  results: readonly HtmlValidationResult[],
): Readonly<{
  errorCount: number;
  warningCount: number;
}> {
  let errorCount = 0;
  let warningCount = 0;

  for (const result of results) {
    errorCount += toCount(result.errorCount);
    warningCount += toCount(result.warningCount);
  }

  return { errorCount, warningCount };
}

function getFirstIssueFile(
  results: readonly HtmlValidationResult[],
): string | undefined {
  for (const result of results) {
    if (
      toCount(result.errorCount) > 0 || toCount(result.warningCount) > 0 ||
      (result.messages?.length ?? 0) > 0
    ) {
      return result.filePath;
    }
  }

  return undefined;
}

export function assertHtmlValidationReport(
  report: HtmlValidationReport,
): void {
  const results = Array.isArray(report.results) ? report.results : [];
  const { errorCount, warningCount } = summarizeIssues(results);
  const totalIssues = errorCount + warningCount;

  if (report.valid === true && totalIssues === 0) {
    return;
  }

  const firstIssueFile = getFirstIssueFile(results);
  const locationSuffix = firstIssueFile
    ? ` First issue: ${firstIssueFile}`
    : "";

  throw new Error(
    `HTML validation failed with ${errorCount} error(s) and ${warningCount} warning(s).${locationSuffix}`,
  );
}

if (import.meta.main) {
  if (hasHelpFlag(Deno.args)) {
    printUsage();
    Deno.exit(0);
  }

  const reportPath = Deno.args[0] ?? "_quality/html-issues.json";

  try {
    const reportText = await Deno.readTextFile(reportPath);
    const report = JSON.parse(reportText) as HtmlValidationReport;
    assertHtmlValidationReport(report);
  } catch (error) {
    console.error(
      `[html-validation] ${reportPath}: ${getErrorMessage(error)}`,
    );
    Deno.exit(1);
  }
}

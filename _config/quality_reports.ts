import { dirname } from "@std/path";
import type { Report } from "lume/deps/html_validate.ts";
import { log } from "lume/core/utils/log.ts";

export const HTML_ISSUES_REPORT_PATH = "_quality/html-issues.json";

export function writeJsonReportFile(path: string, data: unknown): void {
  Deno.mkdirSync(dirname(path), { recursive: true });
  Deno.writeTextFileSync(path, JSON.stringify(data, null, 2));
}

export function writeHtmlValidationReport(report: Report): void {
  writeJsonReportFile(HTML_ISSUES_REPORT_PATH, report);

  if (report.valid) {
    log.info("[validate_html plugin] No HTML errors found!");
    return;
  }

  log.warn(
    `[validate_html plugin] ${report.errorCount} HTML error(s) saved to <gray>${HTML_ISSUES_REPORT_PATH}</gray>`,
  );
}

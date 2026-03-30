/**
 * Commit-message lint CLI backed by `@miscellaneous/commitlint`.
 *
 * Reads the commit message from `.git/COMMIT_EDITMSG` (default) or the file
 * path supplied as the first CLI argument, then validates it against the
 * Conventional Commits rules exposed by the shared JSR package.
 *
 * Exit codes:
 *   0 — message is valid
 *   1 — one or more errors found, or the input file could not be read
 *
 * @example
 * ```sh
 * deno task lint-commit .git/COMMIT_EDITMSG
 * ```
 */

import { parseArgs } from "@std/cli";
import { stripAnsiCode } from "@std/fmt/colors";
import {
  formatReport,
  lintCommit as lintCommitWithPreset,
  type LintIssue,
  type LintOptions,
  type LintReport,
  type Severity,
} from "jsr/miscellaneous-commitlint";

export type { LintIssue, LintOptions, LintReport, Severity };

export type FormatLintCommitReportOptions = {
  readonly color?: boolean;
};

const TEXT_ENCODER = new TextEncoder();

function supportsColor(): boolean {
  return Deno.stdout.isTerminal();
}

export function formatLintCommitReport(
  report: LintReport,
  options: FormatLintCommitReportOptions = {},
): string {
  const color = options.color ?? supportsColor();
  const formatted = formatReport(report, { color });

  return color ? formatted : stripAnsiCode(formatted);
}

export function lintCommit(
  input: string,
  options: LintOptions = {},
): LintReport {
  return lintCommitWithPreset(input, {
    ...options,
    preset: options.preset ?? "commitlint",
  });
}

async function writeReport(report: LintReport): Promise<void> {
  await Deno.stdout.write(
    TEXT_ENCODER.encode(formatLintCommitReport(report)),
  );
}

async function main(): Promise<void> {
  const parsedArgs = parseArgs(Deno.args);
  const commitMsgPathArg = parsedArgs._[0];
  const commitMsgPath = typeof commitMsgPathArg === "string"
    ? commitMsgPathArg
    : ".git/COMMIT_EDITMSG";

  let raw: string;
  try {
    raw = await Deno.readTextFile(commitMsgPath);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      console.error(
        `lint-commit: cannot read commit message file: ${commitMsgPath}`,
      );
      Deno.exit(1);
    }

    throw error;
  }

  const report = lintCommit(raw);
  await writeReport(report);

  if (!report.valid) {
    Deno.exit(1);
  }
}

if (import.meta.main) {
  await main();
}

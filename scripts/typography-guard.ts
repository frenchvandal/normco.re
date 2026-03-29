import { parseArgs } from "@std/cli";
import { walk } from "@std/fs";
import { extname, join, relative, resolve } from "@std/path";

import {
  createUsageError,
  getErrorMessage,
  hasHelpFlag,
  lineNumberAt,
} from "./_shared.ts";

const DEFAULT_ROOT = resolve(join(import.meta.dirname ?? ".", ".."));
const SMART_TYPOGRAPHY_PATTERN = /[’‘“”]/g;
const REPLACEMENTS = {
  "’": "'",
  "‘": "'",
  "“": '"',
  "”": '"',
} as const satisfies Record<string, string>;
const MARKDOWN_EXTENSION = ".md";
const SLASH_COMMENT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mts",
  ".cts",
  ".cjs",
  ".mjs",
  ".css",
  ".scss",
  ".java",
  ".kt",
  ".kts",
  ".gradle",
  ".groovy",
  ".jsonc",
]);
const HASH_COMMENT_EXTENSIONS = new Set([
  ".sh",
  ".bash",
  ".zsh",
  ".yml",
  ".yaml",
  ".toml",
  ".py",
  ".rb",
  ".conf",
  ".ini",
  ".properties",
]);
const MARKUP_COMMENT_SUFFIXES = [
  ".html",
  ".htm",
  ".xml",
  ".svg",
  ".xsl",
  ".xsl.template",
];
const SKIP_DIRECTORY_NAMES = new Set([
  ".git",
  ".claude",
  ".tmp",
  "_site",
  "antd",
  "node_modules",
  "coverage",
]);
const SKIP_DIRECTORY_PATTERN = new RegExp(
  Array.from(SKIP_DIRECTORY_NAMES)
    .map((name) => `(?:^|/)${name}(?:/|$)`)
    .join("|"),
);
const USAGE =
  "Usage: deno run --allow-read [--allow-write] scripts/typography-guard.ts [--write] [--root=<path>]";

export interface TypographyIssue {
  readonly filePath: string;
  readonly line: number;
  readonly column: number;
  readonly character: keyof typeof REPLACEMENTS;
}

function normalizeSmartTypography(text: string): string {
  return text.replace(
    SMART_TYPOGRAPHY_PATTERN,
    (character) => REPLACEMENTS[character as keyof typeof REPLACEMENTS],
  );
}

function isSlashCommentFile(filePath: string): boolean {
  return SLASH_COMMENT_EXTENSIONS.has(extname(filePath));
}

function isHashCommentFile(filePath: string): boolean {
  return HASH_COMMENT_EXTENSIONS.has(extname(filePath));
}

function isMarkupCommentFile(filePath: string): boolean {
  return MARKUP_COMMENT_SUFFIXES.some((suffix) => filePath.endsWith(suffix));
}

function shouldCheckFile(filePath: string): boolean {
  return extname(filePath) === MARKDOWN_EXTENSION ||
    isSlashCommentFile(filePath) ||
    isHashCommentFile(filePath) ||
    isMarkupCommentFile(filePath);
}

export function shouldSkipEntryPath(filePath: string): boolean {
  return SKIP_DIRECTORY_PATTERN.test(filePath.replaceAll("\\", "/"));
}

function normalizeSlashCommentSource(source: string): string {
  let normalized = "";
  let index = 0;
  let activeQuote: "'" | '"' | "`" | undefined;
  let escaped = false;

  while (index < source.length) {
    const current = source[index];
    const next = source[index + 1];

    if (activeQuote) {
      normalized += current;

      if (escaped) {
        escaped = false;
      } else if (current === "\\") {
        escaped = true;
      } else if (current === activeQuote) {
        activeQuote = undefined;
      }

      index += 1;
      continue;
    }

    if (current === "'" || current === '"' || current === "`") {
      activeQuote = current;
      normalized += current;
      index += 1;
      continue;
    }

    if (current === "/" && next === "/") {
      const lineEnd = source.indexOf("\n", index);
      const commentEnd = lineEnd === -1 ? source.length : lineEnd;
      normalized += normalizeSmartTypography(source.slice(index, commentEnd));
      index = commentEnd;
      continue;
    }

    if (current === "/" && next === "*") {
      const commentEnd = source.indexOf("*/", index + 2);

      if (commentEnd === -1) {
        normalized += normalizeSmartTypography(source.slice(index));
        break;
      }

      normalized += normalizeSmartTypography(
        source.slice(index, commentEnd + 2),
      );
      index = commentEnd + 2;
      continue;
    }

    normalized += current;
    index += 1;
  }

  return normalized;
}

function normalizeHashCommentSource(source: string): string {
  const lines = source.split("\n");

  return lines.map((line) => {
    let activeQuote: "'" | '"' | undefined;
    let escaped = false;

    for (let index = 0; index < line.length; index += 1) {
      const current = line[index];

      if (activeQuote) {
        if (escaped) {
          escaped = false;
          continue;
        }

        if (current === "\\") {
          escaped = true;
          continue;
        }

        if (current === activeQuote) {
          activeQuote = undefined;
        }

        continue;
      }

      if (current === "'" || current === '"') {
        activeQuote = current;
        continue;
      }

      if (
        current === "#" && (index === 0 || /\s/.test(line[index - 1] ?? ""))
      ) {
        return `${line.slice(0, index)}${
          normalizeSmartTypography(line.slice(index))
        }`;
      }
    }

    return line;
  }).join("\n");
}

function normalizeMarkupCommentSource(source: string): string {
  let normalized = "";
  let index = 0;

  while (index < source.length) {
    const commentStart = source.indexOf("<!--", index);

    if (commentStart === -1) {
      normalized += source.slice(index);
      break;
    }

    normalized += source.slice(index, commentStart);

    const commentEnd = source.indexOf("-->", commentStart + 4);

    if (commentEnd === -1) {
      normalized += normalizeSmartTypography(source.slice(commentStart));
      break;
    }

    normalized += normalizeSmartTypography(
      source.slice(commentStart, commentEnd + 3),
    );
    index = commentEnd + 3;
  }

  return normalized;
}

export function normalizeTypographyForFile(
  filePath: string,
  source: string,
): string {
  if (extname(filePath) === MARKDOWN_EXTENSION) {
    return normalizeSmartTypography(source);
  }

  let normalized = source;

  if (isSlashCommentFile(filePath)) {
    normalized = normalizeSlashCommentSource(normalized);
  }

  if (isHashCommentFile(filePath)) {
    normalized = normalizeHashCommentSource(normalized);
  }

  if (isMarkupCommentFile(filePath)) {
    normalized = normalizeMarkupCommentSource(normalized);
  }

  return normalized;
}

export function collectTypographyIssues(
  filePath: string,
  source: string,
): TypographyIssue[] {
  const normalized = normalizeTypographyForFile(filePath, source);
  const issues: TypographyIssue[] = [];

  for (let index = 0; index < source.length; index += 1) {
    const current = source[index];
    const next = normalized[index];

    if (
      current === undefined ||
      current === next ||
      !(current in REPLACEMENTS)
    ) {
      continue;
    }

    const line = lineNumberAt(source, index);
    const lineStartIndex = source.lastIndexOf("\n", index - 1) + 1;

    issues.push({
      character: current as keyof typeof REPLACEMENTS,
      column: index - lineStartIndex + 1,
      filePath,
      line,
    });
  }

  return issues;
}

async function collectCandidateFiles(root: string): Promise<string[]> {
  const filePaths: string[] = [];

  for await (
    const entry of walk(root, {
      includeDirs: false,
      includeFiles: true,
      skip: [SKIP_DIRECTORY_PATTERN],
    })
  ) {
    if (shouldCheckFile(entry.path)) {
      filePaths.push(entry.path);
    }
  }

  filePaths.sort((left, right) => left.localeCompare(right));

  return filePaths;
}

export async function runTypographyGuard(
  root: string,
  options: Readonly<{ write: boolean }>,
): Promise<{ changedFiles: string[]; issueCount: number }> {
  const changedFiles: string[] = [];
  let issueCount = 0;

  for (const filePath of await collectCandidateFiles(root)) {
    const source = await Deno.readTextFile(filePath);
    const issues = collectTypographyIssues(filePath, source);

    if (issues.length === 0) {
      continue;
    }

    issueCount += issues.length;
    changedFiles.push(filePath);

    if (options.write) {
      await Deno.writeTextFile(
        filePath,
        normalizeTypographyForFile(filePath, source),
      );
    }
  }

  return { changedFiles, issueCount };
}

if (import.meta.main) {
  if (hasHelpFlag(Deno.args)) {
    console.info(USAGE);
    Deno.exit(0);
  }

  const args = parseArgs(Deno.args, {
    boolean: ["write"],
    string: ["root"],
    default: {
      root: DEFAULT_ROOT,
      write: false,
    },
  });

  if (args._.length > 0) {
    throw createUsageError(
      "typography-guard does not accept positional arguments",
      USAGE,
    );
  }

  const root = typeof args.root === "string"
    ? resolve(args.root)
    : DEFAULT_ROOT;
  const write = args.write === true;

  try {
    const { changedFiles, issueCount } = await runTypographyGuard(
      root,
      { write },
    );

    if (changedFiles.length === 0) {
      console.info("[typography] no smart typography found");
      Deno.exit(0);
    }

    if (write) {
      for (const filePath of changedFiles) {
        console.info(`[typography] normalized ${relative(root, filePath)}`);
      }

      console.info(
        `[typography] normalized ${issueCount} occurrence(s) across ${changedFiles.length} file(s)`,
      );
      Deno.exit(0);
    }

    const preview = changedFiles
      .slice(0, 20)
      .map((filePath) => `- ${relative(root, filePath)}`)
      .join("\n");
    const remainingCount = changedFiles.length -
      Math.min(changedFiles.length, 20);
    const remainingSummary = remainingCount > 0
      ? `\n- ... and ${remainingCount} more file(s)`
      : "";

    throw new Error(
      `Found ${issueCount} smart typography occurrence(s) across ${changedFiles.length} file(s).\n\n${preview}${remainingSummary}\n\nRun \`deno task typography:fix\` to normalize them.`,
    );
  } catch (error) {
    console.error(getErrorMessage(error));
    Deno.exit(1);
  }
}

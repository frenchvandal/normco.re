import { parseArgs } from "@std/cli";
import { walk } from "@std/fs";
import { join } from "@std/path";
import { createUsageError, hasHelpFlag, lineNumberAt } from "./_shared.ts";

const NETWORK_PREFIXES = ["http://", "https://"] as const;
const FORBIDDEN_PREFIXES = [
  ...NETWORK_PREFIXES,
  "npm/",
  "jsr:",
  "node:",
] as const;
const ALLOWED_PREFIXES = [
  "./",
  "../",
  "/",
  "data:",
  "blob:",
] as const;
const USAGE = [
  "Usage: deno run --allow-read scripts/check-browser-imports.ts [rootDir]",
  "",
  "Arguments:",
  "  [rootDir]  Built site output directory (default: _site)",
].join("\n");

export type ImportIssueKind =
  | "network-specifier"
  | "forbidden-prefix"
  | "bare-specifier"
  | "dynamic-non-literal";

export type ImportIssue = {
  filePath: string;
  kind: ImportIssueKind;
  specifier: string;
  line: number;
};

export type AnalyzeOptions = {
  readonly allowDynamicExpression?: (
    filePath: string,
    expression: string,
  ) => boolean;
};

function hasPrefix(
  value: string,
  prefixes: ReadonlyArray<string>,
): boolean {
  return prefixes.some((prefix) => value.startsWith(prefix));
}

function unwrapStringLiteral(expression: string): string | undefined {
  const match = expression.trim().match(/^(['"`])([\s\S]*?)\1$/);

  if (!match || (match[1] === "`" && match[2]?.includes("${"))) {
    return undefined;
  }

  return match[2];
}

function createSpecifierIssue(
  filePath: string,
  source: string,
  matchIndex: number,
  specifier: string,
): ImportIssue | undefined {
  if (hasPrefix(specifier, NETWORK_PREFIXES)) {
    return {
      filePath,
      kind: "network-specifier",
      specifier,
      line: lineNumberAt(source, matchIndex),
    };
  }

  if (hasPrefix(specifier, FORBIDDEN_PREFIXES)) {
    return {
      filePath,
      kind: "forbidden-prefix",
      specifier,
      line: lineNumberAt(source, matchIndex),
    };
  }

  if (!hasPrefix(specifier, ALLOWED_PREFIXES)) {
    return {
      filePath,
      kind: "bare-specifier",
      specifier,
      line: lineNumberAt(source, matchIndex),
    };
  }

  return undefined;
}

export function analyzeImportSpecifiers(
  source: string,
  filePath: string,
  options: AnalyzeOptions = {},
): ReadonlyArray<ImportIssue> {
  const issues: ImportIssue[] = [];
  const staticImportPattern =
    /(?:^|[^\w$.])import\s+(?:[^"'`()\n]*?\sfrom\s*)?["'`]([^"'`]+)["'`]/gm;
  const dynamicImportPattern = /import\(\s*([^)]+?)\s*\)/gm;

  for (const match of source.matchAll(staticImportPattern)) {
    const specifier = match[1];

    if (specifier === undefined) {
      continue;
    }
    const matchIndex = match.index ?? 0;
    const issue = createSpecifierIssue(filePath, source, matchIndex, specifier);

    if (issue !== undefined) {
      issues.push(issue);
    }
  }

  for (const match of source.matchAll(dynamicImportPattern)) {
    const expression = match[1]?.trim();

    if (expression === undefined) {
      continue;
    }
    const matchIndex = match.index ?? 0;
    const literalSpecifier = unwrapStringLiteral(expression);

    if (literalSpecifier === undefined) {
      if (
        options.allowDynamicExpression?.(filePath, expression) !== true
      ) {
        issues.push({
          filePath,
          kind: "dynamic-non-literal",
          specifier: expression,
          line: lineNumberAt(source, matchIndex),
        });
      }
      continue;
    }

    const issue = createSpecifierIssue(
      filePath,
      source,
      matchIndex,
      literalSpecifier,
    );

    if (issue !== undefined) {
      issues.push(issue);
    }
  }

  return issues;
}

async function collectBrowserScriptFiles(rootDir: string): Promise<string[]> {
  const files: string[] = [];
  const scriptsDir = join(rootDir, "scripts");

  try {
    for await (
      const entry of walk(scriptsDir, {
        includeDirs: false,
        exts: [".js"],
      })
    ) {
      files.push(entry.path);
    }
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) {
      throw error;
    }
  }

  for await (const entry of Deno.readDir(rootDir)) {
    if (entry.isFile && /^sw(?:-[\w-]+)?\.js$/.test(entry.name)) {
      files.push(join(rootDir, entry.name));
    }
  }

  files.sort((left, right) => left.localeCompare(right));
  return files;
}

function formatIssue(issue: ImportIssue, rootDir: string): string {
  const relativePath = issue.filePath.startsWith(`${rootDir}/`)
    ? issue.filePath.slice(rootDir.length + 1)
    : issue.filePath;
  const issueReason = issue.kind === "dynamic-non-literal"
    ? "Dynamic import must use a string-literal URL or path"
    : issue.kind === "bare-specifier"
    ? "Bare import specifier is not browser-resolvable in static output"
    : issue.kind === "network-specifier"
    ? "Network import specifiers are forbidden in shipped static scripts"
    : "Forbidden import prefix detected";

  return `- ${relativePath}:${issue.line} ${issueReason}: "${issue.specifier}"`;
}

function parseCliArgs(
  args: ReadonlyArray<string>,
): { showHelp: boolean; rootDir: string } {
  if (hasHelpFlag(args)) {
    return { showHelp: true, rootDir: "_site" };
  }

  const parsedArgs = parseArgs(args);

  if (parsedArgs._.length > 1) {
    throw createUsageError(
      "Too many positional arguments for check-browser-imports",
      USAGE,
    );
  }

  const rootDirArg = parsedArgs._[0];

  return {
    showHelp: false,
    rootDir: typeof rootDirArg === "string" ? rootDirArg : "_site",
  };
}

async function main(): Promise<void> {
  const { rootDir, showHelp } = parseCliArgs(Deno.args);

  if (showHelp) {
    console.info(USAGE);
    return;
  }

  const scriptFiles = await collectBrowserScriptFiles(rootDir);
  const issues: ImportIssue[] = [];

  for (const filePath of scriptFiles) {
    const source = await Deno.readTextFile(filePath);
    const fileIssues = analyzeImportSpecifiers(source, filePath, {});

    issues.push(...fileIssues);
  }

  if (issues.length === 0) {
    console.info(
      `[browser-imports] Verified ${scriptFiles.length} script files under ${rootDir}`,
    );
    return;
  }

  const details = issues
    .map((issue) => formatIssue(issue, rootDir))
    .join("\n");
  throw new Error(
    [
      "Detected non-browser-resolvable import specifiers in shipped scripts",
      details,
      "Fix imports to use local relative or absolute local paths and rebuild",
    ].join("\n"),
  );
}

if (import.meta.main) {
  await main();
}

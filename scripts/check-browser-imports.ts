import { join } from "jsr/path";

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

/** Categories of non-browser-resolvable import expressions. */
export type ImportIssueKind =
  | "network-specifier"
  | "forbidden-prefix"
  | "bare-specifier"
  | "dynamic-non-literal";

/** One import-resolution issue found in shipped browser scripts. */
export type ImportIssue = {
  filePath: string;
  kind: ImportIssueKind;
  specifier: string;
  line: number;
};

/** Optional analysis controls for imported specifier validation. */
export type AnalyzeOptions = {
  readonly allowDynamicExpression?: (
    filePath: string,
    expression: string,
  ) => boolean;
};

function isForbiddenPrefix(specifier: string): boolean {
  return FORBIDDEN_PREFIXES.some((prefix) => specifier.startsWith(prefix));
}

function isNetworkSpecifier(specifier: string): boolean {
  return NETWORK_PREFIXES.some((prefix) => specifier.startsWith(prefix));
}

function isBrowserResolvable(specifier: string): boolean {
  return ALLOWED_PREFIXES.some((prefix) => specifier.startsWith(prefix));
}

function getLineNumber(source: string, offset: number): number {
  return source.slice(0, offset).split("\n").length;
}

function unwrapStringLiteral(expression: string): string | undefined {
  const trimmedExpression = expression.trim();
  const quote = trimmedExpression.at(0);
  const lastCharacter = trimmedExpression.at(-1);

  if (
    quote === undefined ||
    lastCharacter === undefined ||
    quote !== lastCharacter ||
    !(quote === '"' || quote === "'" || quote === "`")
  ) {
    return undefined;
  }

  const value = trimmedExpression.slice(1, -1);

  if (quote === "`" && value.includes("${")) {
    return undefined;
  }

  return value;
}

function createSpecifierIssue(
  filePath: string,
  source: string,
  matchIndex: number,
  specifier: string,
): ImportIssue | undefined {
  if (isNetworkSpecifier(specifier)) {
    return {
      filePath,
      kind: "network-specifier",
      specifier,
      line: getLineNumber(source, matchIndex),
    };
  }

  if (isForbiddenPrefix(specifier)) {
    return {
      filePath,
      kind: "forbidden-prefix",
      specifier,
      line: getLineNumber(source, matchIndex),
    };
  }

  if (!isBrowserResolvable(specifier)) {
    return {
      filePath,
      kind: "bare-specifier",
      specifier,
      line: getLineNumber(source, matchIndex),
    };
  }

  return undefined;
}

/**
 * Analyze import expressions and report browser-unresolvable specifiers.
 * Supports static imports and dynamic imports with string-literal specifiers.
 */
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
          line: getLineNumber(source, matchIndex),
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

  async function collectScriptsRecursively(directory: string): Promise<void> {
    for await (const entry of Deno.readDir(directory)) {
      const entryPath = join(directory, entry.name);

      if (entry.isDirectory) {
        await collectScriptsRecursively(entryPath);
        continue;
      }

      if (entry.isFile && entry.name.endsWith(".js")) {
        files.push(entryPath);
      }
    }
  }

  try {
    await collectScriptsRecursively(scriptsDir);
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

async function main(): Promise<void> {
  const rootDir = Deno.args[0] ?? "_site";
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

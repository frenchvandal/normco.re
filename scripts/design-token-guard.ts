import { parseArgs } from "@std/cli";
import { walk } from "@std/fs";
import { join, relative } from "@std/path";
import { createUsageError, hasHelpFlag, lineNumberAt } from "./_shared.ts";

export type StyleSource = {
  readonly filePath: string;
  readonly source: string;
};

export type DesignTokenGuardIssue = {
  readonly filePath: string;
  readonly line: number;
  readonly rule: string;
  readonly message: string;
  readonly match: string;
};

type GuardRule = {
  readonly name: string;
  readonly pattern: RegExp;
  readonly message: string;
  readonly allowedFiles?: ReadonlyArray<string>;
};

const STYLE_ROOT = "src/styles" as const;
const DEFAULT_ROOT_DIR = Deno.cwd();
const USAGE = [
  "Usage: deno run --allow-read scripts/design-token-guard.ts [--root=<dir>]",
  "",
  "Options:",
  "  --root=<dir>  Repository root to scan (default: current working directory)",
].join("\n");

const RULES: readonly GuardRule[] = [
  {
    name: "legacy-link-underline-literals",
    pattern: /max\(1px,\s*0\.08em\)|0\.15em/g,
    message:
      "Use the shared link underline tokens from `src/styles/antd/theme-tokens.css`.",
    allowedFiles: ["src/styles/antd/theme-tokens.css"],
  },
  {
    name: "search-control-size-literals",
    pattern: /2\.25rem|0\.625rem|0\.875rem/g,
    message:
      "Use the semantic search control tokens from `src/styles/antd/theme-tokens.css`.",
    allowedFiles: ["src/styles/antd/theme-tokens.css"],
  },
  {
    name: "inline-copy-control-size-literal",
    pattern: /2\.375rem/g,
    message:
      "Use `--site-inline-copy-control-size` from `src/styles/antd/theme-tokens.css`.",
    allowedFiles: ["src/styles/antd/theme-tokens.css"],
  },
  {
    name: "oklch-outside-allowlist",
    pattern: /oklch\(/g,
    message:
      "Move custom palette literals into the theme bridge, except for the Prism syntax-highlighting allowlist.",
    allowedFiles: [
      "src/styles/antd/theme-tokens.css",
      "src/styles/components/prism.css",
    ],
  },
] as const;

function normalizePath(filePath: string): string {
  return filePath.replaceAll("\\", "/");
}

function ruleAllowsFile(rule: GuardRule, filePath: string): boolean {
  const normalizedPath = normalizePath(filePath);
  return rule.allowedFiles?.some((allowedFile) =>
    normalizedPath.endsWith(allowedFile)
  ) ?? false;
}

export function scanStyleSources(
  styleSources: ReadonlyArray<StyleSource>,
): ReadonlyArray<DesignTokenGuardIssue> {
  const issues: DesignTokenGuardIssue[] = [];

  for (const styleSource of styleSources) {
    for (const rule of RULES) {
      if (ruleAllowsFile(rule, styleSource.filePath)) {
        continue;
      }

      for (const match of styleSource.source.matchAll(rule.pattern)) {
        const index = match.index ?? 0;
        issues.push({
          filePath: styleSource.filePath,
          line: lineNumberAt(styleSource.source, index),
          rule: rule.name,
          message: rule.message,
          match: match[0],
        });
      }
    }
  }

  return issues.sort((left, right) =>
    left.filePath.localeCompare(right.filePath) || left.line - right.line
  );
}

async function collectStyleSources(rootDir: string): Promise<StyleSource[]> {
  const styleSources: StyleSource[] = [];
  const stylesRoot = join(rootDir, STYLE_ROOT);

  for await (
    const entry of walk(stylesRoot, {
      includeDirs: false,
      exts: [".css"],
    })
  ) {
    styleSources.push({
      filePath: normalizePath(relative(rootDir, entry.path)),
      source: await Deno.readTextFile(entry.path),
    });
  }

  return styleSources;
}

export async function runDesignTokenGuard(
  rootDir = Deno.cwd(),
): Promise<ReadonlyArray<DesignTokenGuardIssue>> {
  const styleSources = await collectStyleSources(rootDir);
  return scanStyleSources(styleSources);
}

function parseCliArgs(
  args: ReadonlyArray<string>,
): { showHelp: boolean; rootDir: string } {
  if (hasHelpFlag(args)) {
    return { showHelp: true, rootDir: DEFAULT_ROOT_DIR };
  }

  const parsedArgs = parseArgs(args, {
    string: ["root"],
    default: {
      root: DEFAULT_ROOT_DIR,
    },
  });
  const rootDir = parsedArgs.root;

  if (parsedArgs._.length > 0) {
    throw createUsageError(
      "design-token-guard does not accept positional arguments",
      USAGE,
    );
  }

  return {
    showHelp: false,
    rootDir: typeof rootDir === "string" && rootDir.trim().length > 0
      ? rootDir
      : DEFAULT_ROOT_DIR,
  };
}

if (import.meta.main) {
  const { rootDir, showHelp } = parseCliArgs(Deno.args);

  if (showHelp) {
    console.info(USAGE);
    Deno.exit(0);
  }

  const issues = await runDesignTokenGuard(rootDir);

  if (issues.length === 0) {
    console.log("design-token-guard: ok");
    Deno.exit(0);
  }

  console.error("design-token-guard: found hard-coded UI literals:");
  for (const issue of issues) {
    console.error(
      `- ${issue.filePath}:${issue.line} [${issue.rule}] ${issue.match} — ${issue.message}`,
    );
  }
  Deno.exit(1);
}

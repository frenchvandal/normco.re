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
    name: "shared-letter-spacing-literals",
    pattern: /letter-spacing:\s*(?:-0\.025em|-0\.015em|0\.08em)/g,
    message:
      "Use the shared letter-spacing tokens from `src/styles/antd/theme-tokens.css`.",
  },
  {
    name: "shared-radius-multipliers",
    pattern:
      /calc\(var\(--ph-radius-(?:lg|xl)\)\s*\*\s*(?:1\.05|1\.1|1\.15|1\.25)\)/g,
    message:
      "Use the shared surface radius tokens from `src/styles/antd/theme-tokens.css`.",
    allowedFiles: ["src/styles/antd/theme-tokens.css"],
  },
  {
    name: "shared-border-width-multiplier",
    pattern: /calc\(var\(--ph-border-hairline\)\s*\*\s*2\)/g,
    message:
      "Use the shared border width tokens from `src/styles/antd/theme-tokens.css`.",
    allowedFiles: ["src/styles/antd/theme-tokens.css"],
  },
  {
    name: "shared-archive-type-scale-multipliers",
    pattern: /calc\(var\(--ph-text-(?:xs|sm)\)\s*\*\s*(?:0\.94|0\.98)\)/g,
    message:
      "Use the shared archive type scale tokens from `src/styles/antd/theme-tokens.css`.",
    allowedFiles: ["src/styles/antd/theme-tokens.css"],
  },
  {
    name: "pill-radius-literal",
    pattern: /\b999px\b/g,
    message: "Use `--ph-radius-pill` from `src/styles/antd/theme-tokens.css`.",
    allowedFiles: ["src/styles/antd/theme-tokens.css"],
  },
  {
    name: "frosted-backdrop-literal",
    pattern: /blur\(16px\)\s+saturate\(1\.1\)/g,
    message:
      "Use `--ph-backdrop-frosted` from `src/styles/antd/theme-tokens.css`.",
    allowedFiles: ["src/styles/antd/theme-tokens.css"],
  },
  {
    name: "shared-decorative-opacity-literal",
    pattern: /opacity:\s*0\.72/g,
    message:
      "Use the shared decorative opacity tokens from `src/styles/antd/theme-tokens.css`.",
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

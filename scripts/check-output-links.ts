import { parseArgs } from "jsr/cli";
import { ensureDir, walk } from "jsr/fs";
import { dirname, extname, join, normalize } from "jsr/path";

const HTML_EXTENSIONS = new Set([".html", ".xml", ".xsl"]);
const SKIPPED_PREFIXES = [
  "http://",
  "https://",
  "mailto:",
  "tel:",
  "data:",
  "blob:",
  "javascript:",
  "#",
] as const;

export type BrokenLinksReport = Record<string, string[]>;

function shouldSkipTarget(rawTarget: string): boolean {
  const trimmedTarget = rawTarget.trim();

  if (trimmedTarget.length === 0) {
    return true;
  }

  return SKIPPED_PREFIXES.some((prefix) => trimmedTarget.startsWith(prefix));
}

function stripQueryAndHash(target: string): string {
  const hashIndex = target.indexOf("#");
  const queryIndex = target.indexOf("?");
  const endIndex = [hashIndex, queryIndex]
    .filter((index) => index >= 0)
    .sort((left, right) => left - right)[0];

  return endIndex === undefined ? target : target.slice(0, endIndex);
}

function toRoutePath(rootDir: string, filePath: string): string {
  const relativePath = filePath.startsWith(`${rootDir}/`)
    ? filePath.slice(rootDir.length + 1)
    : filePath;

  if (relativePath === "index.html") {
    return "/";
  }

  if (relativePath.endsWith("/index.html")) {
    return `/${relativePath.slice(0, -"index.html".length)}`;
  }

  return `/${relativePath}`;
}

function candidateOutputPaths(rootDir: string, target: string): string[] {
  const normalizedTarget = normalize(target);
  const trimmedTarget = normalizedTarget.startsWith("/")
    ? normalizedTarget.slice(1)
    : normalizedTarget;

  if (trimmedTarget.length === 0) {
    return [join(rootDir, "index.html")];
  }

  const directPath = join(rootDir, trimmedTarget);
  const directExtension = extname(trimmedTarget);

  if (normalizedTarget.endsWith("/")) {
    return [join(rootDir, trimmedTarget, "index.html")];
  }

  if (directExtension.length > 0) {
    return [directPath];
  }

  return [
    directPath,
    `${directPath}.html`,
    join(rootDir, trimmedTarget, "index.html"),
  ];
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await Deno.stat(filePath);
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return false;
    }

    throw error;
  }
}

function resolveLocalTarget(pagePath: string, rawTarget: string): string {
  const normalizedTarget = rawTarget.startsWith("/")
    ? normalize(rawTarget)
    : normalize(join(dirname(pagePath), rawTarget));

  if (
    rawTarget.endsWith("/") &&
    normalizedTarget !== "/" &&
    !normalizedTarget.endsWith("/")
  ) {
    return `${normalizedTarget}/`;
  }

  return normalizedTarget;
}

export function extractHtmlLocalReferences(source: string): string[] {
  const references = new Set<string>();
  const attributePattern = /\b(?:href|src)=["']([^"'#][^"']*)["']/g;

  for (const match of source.matchAll(attributePattern)) {
    const target = match[1]?.trim();

    if (target === undefined || shouldSkipTarget(target)) {
      continue;
    }

    references.add(stripQueryAndHash(target));
  }

  return [...references];
}

export async function collectBrokenOutputLinks(
  rootDir: string,
): Promise<BrokenLinksReport> {
  const report: BrokenLinksReport = {};

  for await (
    const entry of walk(rootDir, {
      includeDirs: false,
      exts: [...HTML_EXTENSIONS],
    })
  ) {
    const pagePath = entry.path;
    const source = await Deno.readTextFile(pagePath);
    const references = extractHtmlLocalReferences(source);
    const routePath = toRoutePath(rootDir, pagePath);

    for (const reference of references) {
      const resolvedTarget = resolveLocalTarget(routePath, reference);
      const candidates = candidateOutputPaths(rootDir, resolvedTarget);
      const targetExists = await Promise.all(candidates.map(fileExists)).then(
        (results) => results.some(Boolean),
      );

      if (targetExists) {
        continue;
      }

      const pages = report[resolvedTarget] ?? [];
      pages.push(routePath);
      report[resolvedTarget] = pages;
    }
  }

  return Object.fromEntries(
    Object.entries(report)
      .sort(([left], [right]) => left.localeCompare(right))
      .map((
        [target, pages],
      ) => [target, pages.sort((left, right) => left.localeCompare(right))]),
  );
}

function parseCliArgs(
  args: ReadonlyArray<string>,
): {
  rootDir: string;
  reportPath: string;
} {
  const parsedArgs = parseArgs(args);
  const rootDirArg = parsedArgs._[0];
  const reportPathArg = parsedArgs._[1];

  return {
    rootDir: typeof rootDirArg === "string" ? rootDirArg : "_site",
    reportPath: typeof reportPathArg === "string"
      ? reportPathArg
      : "_quality/broken-links.json",
  };
}

async function main(): Promise<void> {
  const { rootDir, reportPath } = parseCliArgs(Deno.args);
  const report = await collectBrokenOutputLinks(rootDir);

  await ensureDir(dirname(reportPath));
  await Deno.writeTextFile(
    `${reportPath}`,
    `${JSON.stringify(report, null, 2)}\n`,
  );

  const brokenTargets = Object.keys(report);

  if (brokenTargets.length === 0) {
    console.info(`[output-links] Verified final output under ${rootDir}`);
    return;
  }

  throw new Error(
    [
      `Detected ${brokenTargets.length} broken local link target(s) in final output`,
      `See ${reportPath} for the full report`,
    ].join("\n"),
  );
}

if (import.meta.main) {
  await main();
}

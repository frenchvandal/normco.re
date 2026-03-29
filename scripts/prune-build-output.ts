import { parseArgs } from "@std/cli";
import { walk } from "@std/fs";
import { extname } from "@std/path";
import {
  createUsageError,
  fileExists,
  getErrorMessage,
  hasHelpFlag,
} from "./_shared.ts";
import { getUrlBasename, toOutputPath } from "./_url_paths.ts";

const USAGE = [
  "Usage: deno run --allow-read --allow-write scripts/prune-build-output.ts [rootDir]",
  "",
  "Arguments:",
  "  [rootDir]  Built site output directory (default: _site)",
].join("\n");

const TEXT_EXTENSIONS = new Set([
  ".html",
  ".xml",
  ".xsl",
  ".js",
  ".css",
  ".json",
]);
const SOURCE_MAP_OWNER_EXTENSIONS = new Set([".js", ".css"]);
const OPTIONAL_OSS_PRUNABLE_URLS = [
  "/pagefind/pagefind-highlight.js",
  "/pagefind/pagefind-modular-ui.css",
  "/pagefind/pagefind-modular-ui.js",
] as const;

export type PruneBuildOutputSummary = Readonly<{
  optionalAssetsRemoved: readonly string[];
  sourceMapFilesRemoved: readonly string[];
  sourceMapOwnersUpdated: readonly string[];
}>;

type ParsedArgs = Readonly<{
  rootDir: string;
  showHelp: boolean;
}>;

function isTextFile(path: string): boolean {
  return TEXT_EXTENSIONS.has(extname(path).toLowerCase());
}

function isSourceMapOwner(path: string): boolean {
  return SOURCE_MAP_OWNER_EXTENSIONS.has(extname(path).toLowerCase());
}

export function stripSourceMapComments(content: string): string {
  return content
    .replaceAll(/\n?\/\/# sourceMappingURL=[^\n]+/g, "")
    .replaceAll(/\n?\/\*# sourceMappingURL=[^*]+\*\//g, "");
}

async function listFilesByExtension(
  rootDir: string,
  extension: string,
): Promise<readonly string[]> {
  const files: string[] = [];

  try {
    for await (
      const entry of walk(rootDir, {
        includeDirs: false,
        exts: [extension],
      })
    ) {
      files.push(entry.path);
    }
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return [];
    }

    throw error;
  }

  return files.sort();
}

export async function removeSourceMapReferences(
  rootDir: string,
): Promise<readonly string[]> {
  const updatedFiles: string[] = [];

  for await (
    const entry of walk(rootDir, {
      includeDirs: false,
    })
  ) {
    if (!isSourceMapOwner(entry.path)) {
      continue;
    }

    const original = await Deno.readTextFile(entry.path);
    const stripped = stripSourceMapComments(original);

    if (stripped === original) {
      continue;
    }

    await Deno.writeTextFile(entry.path, stripped);
    updatedFiles.push(entry.path);
  }

  return updatedFiles.sort();
}

export async function removeFiles(
  paths: readonly string[],
): Promise<readonly string[]> {
  const removedPaths: string[] = [];

  for (const path of [...paths].sort()) {
    if (!await fileExists(path)) {
      continue;
    }

    await Deno.remove(path);
    removedPaths.push(path);
  }

  return removedPaths;
}

async function outputContainsReference(
  rootDir: string,
  urlPath: string,
): Promise<boolean> {
  const basename = getUrlBasename(urlPath);
  const markers = [
    urlPath,
    basename ? `./${basename}` : undefined,
    basename,
  ].filter((value): value is string => typeof value === "string");

  for await (
    const entry of walk(rootDir, {
      includeDirs: false,
    })
  ) {
    if (!isTextFile(entry.path)) {
      continue;
    }

    const content = await Deno.readTextFile(entry.path);

    if (markers.some((marker) => content.includes(marker))) {
      return true;
    }
  }

  return false;
}

export async function collectOptionalAssetsToPrune(
  rootDir: string,
): Promise<readonly string[]> {
  const removablePaths: string[] = [];

  for (const urlPath of OPTIONAL_OSS_PRUNABLE_URLS) {
    const outputPath = toOutputPath(rootDir, urlPath);

    if (!await fileExists(outputPath)) {
      continue;
    }

    if (await outputContainsReference(rootDir, urlPath)) {
      continue;
    }

    removablePaths.push(outputPath);
  }

  return removablePaths.sort();
}

function parseCliArgs(args: readonly string[]): ParsedArgs {
  if (hasHelpFlag(args)) {
    return { rootDir: "_site", showHelp: true };
  }

  const parsed = parseArgs(args, {
    boolean: ["help"],
    alias: { h: "help" },
  });

  const positional = parsed._;

  if (positional.length > 1) {
    throw createUsageError(
      "Too many positional arguments for prune-build-output",
      USAGE,
    );
  }

  const [rootDirArg] = positional;

  if (typeof rootDirArg !== "undefined" && typeof rootDirArg !== "string") {
    throw createUsageError(
      "The rootDir positional argument must be a string",
      USAGE,
    );
  }

  return {
    rootDir: typeof rootDirArg === "string" ? rootDirArg : "_site",
    showHelp: false,
  };
}

export async function pruneBuildOutput(
  rootDir: string,
): Promise<PruneBuildOutputSummary> {
  const sourceMapOwnersUpdated = await removeSourceMapReferences(rootDir);
  const sourceMapFilesRemoved = await removeFiles(
    await listFilesByExtension(rootDir, ".map"),
  );
  const optionalAssetsRemoved = await removeFiles(
    await collectOptionalAssetsToPrune(rootDir),
  );

  return {
    optionalAssetsRemoved,
    sourceMapFilesRemoved,
    sourceMapOwnersUpdated,
  };
}

if (import.meta.main) {
  try {
    const { rootDir, showHelp } = parseCliArgs(Deno.args);

    if (showHelp) {
      console.info(USAGE);
      Deno.exit(0);
    }

    const summary = await pruneBuildOutput(rootDir);

    for (const path of summary.sourceMapOwnersUpdated) {
      console.info(
        `[prune-build-output] stripped source map reference ${path}`,
      );
    }

    for (const path of summary.sourceMapFilesRemoved) {
      console.info(`[prune-build-output] removed source map ${path}`);
    }

    for (const path of summary.optionalAssetsRemoved) {
      console.info(`[prune-build-output] removed unused asset ${path}`);
    }
  } catch (error) {
    console.error(`[prune-build-output] ${getErrorMessage(error)}`);
    Deno.exit(1);
  }
}

import { parseArgs } from "@std/cli";
import { dirname, extname, join, relative, resolve } from "@std/path";

import { createUsageError, getErrorMessage, hasHelpFlag } from "./_shared.ts";

const REPO_ROOT = resolve(import.meta.dirname ?? ".", "..");
const TEMP_FILE_PREFIX = ".fmt-xml-";
const XML_FORMAT_SUFFIXES = [
  ".xml",
  ".xml.template",
  ".xsl",
  ".xsl.template",
  ".xslt",
] as const;
const SKIP_DIRECTORY_NAMES = new Set([
  ".deno_cache",
  ".git",
  ".gradle",
  ".kotlin",
  ".tmp",
  "_site",
  "build",
  "coverage",
  "node_modules",
]);
const USAGE =
  "Usage: deno run --allow-read --allow-write --allow-run=xmllint scripts/format-xml.ts [<file-or-dir> ...]";

const stderrDecoder = new TextDecoder();

export type XmllintRunner = (
  inputPath: string,
  outputPath: string,
) => Promise<void>;

function escapeRegExpSegment(segment: string): string {
  return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const SKIP_DIRECTORY_PATTERN = new RegExp(
  Array.from(SKIP_DIRECTORY_NAMES)
    .map((name) => `(?:^|[\\\\/])${escapeRegExpSegment(name)}(?:[\\\\/]|$)`)
    .join("|"),
);

function isXmlLikeFilePath(filePath: string): boolean {
  const normalizedPath = filePath.toLowerCase();
  return XML_FORMAT_SUFFIXES.some((suffix) => normalizedPath.endsWith(suffix));
}

export function shouldSkipEntryPath(filePath: string): boolean {
  return SKIP_DIRECTORY_PATTERN.test(filePath);
}

export function buildXmllintArgs(
  inputPath: string,
  outputPath: string,
): readonly string[] {
  return ["--format", inputPath, "--output", outputPath];
}

async function collectXmlTargetsFromDirectory(
  directoryPath: string,
  targets: Set<string>,
): Promise<void> {
  // Recurse with explicit directory-name pruning so that an incidental
  // occurrence of a skip name in the parent chain (for example a repo-level
  // `.tmp/` test sandbox) does not suppress discovery inside the target tree.
  for await (const entry of Deno.readDir(directoryPath)) {
    if (SKIP_DIRECTORY_NAMES.has(entry.name)) {
      continue;
    }

    const entryPath = join(directoryPath, entry.name);

    if (entry.isDirectory) {
      await collectXmlTargetsFromDirectory(entryPath, targets);
      continue;
    }

    if (!entry.isFile || !isXmlLikeFilePath(entryPath)) {
      continue;
    }

    targets.add(resolve(entryPath));
  }
}

export async function collectXmlFormatTargets(
  entryPaths: readonly string[],
  currentDirectory = Deno.cwd(),
): Promise<readonly string[]> {
  const resolvedEntries = entryPaths.length === 0
    ? [REPO_ROOT]
    : entryPaths.map((entryPath) => resolve(currentDirectory, entryPath));
  const targets = new Set<string>();

  for (const resolvedEntryPath of resolvedEntries) {
    let stat: Deno.FileInfo;

    try {
      stat = await Deno.stat(resolvedEntryPath);
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        throw createUsageError(`Path not found: ${resolvedEntryPath}`, USAGE);
      }

      throw error;
    }

    if (stat.isDirectory) {
      await collectXmlTargetsFromDirectory(resolvedEntryPath, targets);
      continue;
    }

    if (!isXmlLikeFilePath(resolvedEntryPath)) {
      throw createUsageError(
        `Expected an XML/XSL file or directory: ${resolvedEntryPath}`,
        USAGE,
      );
    }

    targets.add(resolvedEntryPath);
  }

  return Array.from(targets).sort();
}

export async function runXmllint(
  inputPath: string,
  outputPath: string,
): Promise<void> {
  let output: Deno.CommandOutput;

  try {
    output = await new Deno.Command("xmllint", {
      args: [...buildXmllintArgs(inputPath, outputPath)],
      stderr: "piped",
      stdout: "null",
    }).output();
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      throw new Error(
        "xmllint was not found in PATH. Install libxml2/xmllint before running `deno task fmt:xml`.",
      );
    }

    throw error;
  }

  if (output.success) {
    return;
  }

  const stderr = stderrDecoder.decode(output.stderr).trim();
  throw new Error(
    stderr.length === 0
      ? `xmllint failed while formatting ${inputPath}.`
      : `xmllint failed while formatting ${inputPath}: ${stderr}`,
  );
}

async function removeIfPresent(filePath: string): Promise<void> {
  try {
    await Deno.remove(filePath);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return;
    }

    throw error;
  }
}

export async function formatXmlFile(
  filePath: string,
  runner: XmllintRunner = runXmllint,
): Promise<void> {
  const temporaryPath = await Deno.makeTempFile({
    dir: dirname(filePath),
    prefix: TEMP_FILE_PREFIX,
    suffix: extname(filePath) || ".xml",
  });

  try {
    await runner(filePath, temporaryPath);
    await Deno.rename(temporaryPath, filePath);
  } catch (error) {
    await removeIfPresent(temporaryPath);
    throw error;
  }
}

export async function formatXmlTargets(
  targets: readonly string[],
  runner: XmllintRunner = runXmllint,
): Promise<void> {
  for (const target of targets) {
    await formatXmlFile(target, runner);
    console.log(`formatted ${relative(REPO_ROOT, target)}`);
  }
}

if (import.meta.main) {
  try {
    if (hasHelpFlag(Deno.args)) {
      console.log(USAGE);
      Deno.exit(0);
    }

    const parsedArgs = parseArgs(Deno.args, {
      boolean: ["help"],
    });
    const targets = await collectXmlFormatTargets(
      parsedArgs._.map(String),
    );

    if (targets.length === 0) {
      console.log("No XML files found.");
      Deno.exit(0);
    }

    await formatXmlTargets(targets);
  } catch (error) {
    console.error(getErrorMessage(error));
    Deno.exit(1);
  }
}

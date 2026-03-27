import { parseArgs } from "@std/cli";
import { walk } from "@std/fs";
import { basename, join } from "@std/path";
import { parse, stringify } from "@std/yaml";
import { generate as generateUuidV7 } from "jsr:@std/uuid@^1.1.0/v7";
import { createUsageError, hasHelpFlag } from "./_shared.ts";

const REPO_ROOT = join(import.meta.dirname ?? ".", "..");
const POST_METADATA_FILE_NAME = "_data.yml";
const YAML_SCHEMA = "core" as const;
const USAGE = [
  "Usage: deno run --allow-read --allow-write scripts/posts-fix-ids.ts [--posts-dir=<dir>]",
  "",
  "Options:",
  "  --posts-dir=<dir>  Posts directory to scan (default: repo src/posts)",
].join("\n");

export const DEFAULT_POSTS_DIR = join(REPO_ROOT, "src", "posts");

export type FixedPostId = {
  readonly path: string;
  readonly id: string;
};

type FixMissingPostIdsOptions = {
  readonly findMetadataFiles?: (
    postsDir: string,
  ) => Promise<ReadonlyArray<string>>;
  readonly generateId?: () => string;
  readonly log?: (message: string) => void;
  readonly readTextFile?: (path: string) => Promise<string>;
  readonly writeTextFile?: (path: string, data: string) => Promise<void>;
};

function resolveLineEnding(source: string): string {
  return source.includes("\r\n") ? "\r\n" : "\n";
}

function isPostMetadataRecord(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeYamlLineEndings(source: string, lineEnding: string): string {
  return lineEnding === "\n" ? source : source.replaceAll("\n", lineEnding);
}

function parsePostMetadata(source: string): Record<string, unknown> {
  const parsed = parse(source, { schema: YAML_SCHEMA });

  if (parsed == null) {
    return {};
  }

  if (!isPostMetadataRecord(parsed)) {
    throw new Error("Expected post metadata YAML to parse to a mapping");
  }

  return parsed;
}

export function resolvePostMetadataId(source: string): string | undefined {
  const id = parsePostMetadata(source).id;
  return typeof id === "string" && id.trim().length > 0 ? id.trim() : undefined;
}

export function isPostMetadataFile(path: string): boolean {
  return basename(path) === POST_METADATA_FILE_NAME;
}

export function upsertPostMetadataId(source: string, id: string): string {
  const metadata = parsePostMetadata(source);
  const existingId = metadata.id;

  if (typeof existingId === "string" && existingId.trim().length > 0) {
    return source;
  }

  const lineEnding = resolveLineEnding(source);
  const { id: _existingId, ...rest } = metadata;
  const updatedSource = stringify(
    { id, ...rest },
    { schema: YAML_SCHEMA },
  );

  const normalizedSource = normalizeYamlLineEndings(updatedSource, lineEnding);
  return normalizedSource.endsWith(lineEnding)
    ? normalizedSource
    : `${normalizedSource}${lineEnding}`;
}

export async function findPostMetadataFiles(
  postsDir: string = DEFAULT_POSTS_DIR,
): Promise<ReadonlyArray<string>> {
  const metadataFiles: string[] = [];

  for await (const entry of walk(postsDir, { includeDirs: false })) {
    if (isPostMetadataFile(entry.path)) {
      metadataFiles.push(entry.path);
    }
  }

  return metadataFiles.sort();
}

export async function fixMissingPostIds(
  postsDir: string = DEFAULT_POSTS_DIR,
  options: FixMissingPostIdsOptions = {},
): Promise<ReadonlyArray<FixedPostId>> {
  const findMetadataFiles = options.findMetadataFiles ?? findPostMetadataFiles;
  const generateId = options.generateId ?? generateUuidV7;
  const log = options.log ?? console.info;
  const readTextFile = options.readTextFile ?? Deno.readTextFile;
  const writeTextFile = options.writeTextFile ?? Deno.writeTextFile;
  const metadataFiles = await findMetadataFiles(postsDir);
  const fixedIds: FixedPostId[] = [];

  for (const metadataFile of metadataFiles) {
    const source = await readTextFile(metadataFile);

    if (resolvePostMetadataId(source) !== undefined) {
      continue;
    }

    const id = generateId();
    const updatedSource = upsertPostMetadataId(source, id);

    if (updatedSource === source) {
      continue;
    }

    await writeTextFile(metadataFile, updatedSource);
    fixedIds.push({ path: metadataFile, id });
    log(`[posts:fix-ids] ${metadataFile}: assigned ${id}`);
  }

  if (fixedIds.length === 0) {
    log(`[posts:fix-ids] no missing post ids under ${postsDir}`);
  } else {
    log(`[posts:fix-ids] wrote ${fixedIds.length} post id(s)`);
  }

  return fixedIds;
}

if (import.meta.main) {
  if (hasHelpFlag(Deno.args)) {
    console.info(USAGE);
    Deno.exit(0);
  }

  const args = parseArgs(Deno.args, {
    string: ["posts-dir"],
    default: {
      "posts-dir": DEFAULT_POSTS_DIR,
    },
  });

  if (args._.length > 0) {
    throw createUsageError(
      "posts-fix-ids does not accept positional arguments",
      USAGE,
    );
  }

  const postsDir = typeof args["posts-dir"] === "string"
    ? args["posts-dir"]
    : DEFAULT_POSTS_DIR;

  await fixMissingPostIds(postsDir);
}

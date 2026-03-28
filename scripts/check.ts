import { walk } from "@std/fs";
import { dirname, fromFileUrl, join, relative } from "@std/path";

type DirectoryCheck = Readonly<{
  path: string;
  extensions: readonly string[];
}>;

const SCRIPT_DIR = dirname(fromFileUrl(import.meta.url));
const REPO_ROOT = join(SCRIPT_DIR, "..");
const FRONTEND_DIR = "src/blog/client";
const FRONTEND_CONFIG = join(FRONTEND_DIR, "deno.json");
const SKIP_NODE_MODULES = [/[/\\]node_modules(?:[/\\]|$)/];

const ROOT_FILES = ["_cms.ts", "_cms_test.ts", "_config.ts"] as const;
const ROOT_DIRECTORIES: readonly DirectoryCheck[] = [
  { path: "_config", extensions: [".ts"] },
  { path: "contracts", extensions: [".ts"] },
  { path: "plugins", extensions: [".ts"] },
  { path: "scripts", extensions: [".ts"] },
  { path: "src", extensions: [".ts", ".tsx"] },
  { path: "test", extensions: [".ts"] },
] as const;

function isFrontendReactFile(path: string): boolean {
  const normalized = path.replaceAll("\\", "/");
  return normalized.startsWith(`${FRONTEND_DIR}/`);
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await Deno.stat(path);
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return false;
    }

    throw error;
  }
}

async function collectDirectoryFiles(
  directory: DirectoryCheck,
): Promise<readonly string[]> {
  const directoryPath = join(REPO_ROOT, directory.path);

  if (!await pathExists(directoryPath)) {
    return [];
  }

  const files: string[] = [];

  for await (
    const entry of walk(directoryPath, {
      includeDirs: false,
      exts: [...directory.extensions],
      skip: SKIP_NODE_MODULES,
    })
  ) {
    const relativePath = relative(REPO_ROOT, entry.path).replaceAll("\\", "/");

    if (isFrontendReactFile(relativePath)) {
      continue;
    }

    files.push(relativePath);
  }

  return files.sort();
}

async function collectRootCheckFiles(): Promise<readonly string[]> {
  const files: string[] = [...ROOT_FILES];

  for (const directory of ROOT_DIRECTORIES) {
    files.push(...await collectDirectoryFiles(directory));
  }

  return files;
}

async function collectFrontendFiles(): Promise<readonly string[]> {
  const frontendPath = join(REPO_ROOT, FRONTEND_DIR);

  if (!await pathExists(frontendPath)) {
    return [];
  }

  const files: string[] = [];

  for await (
    const entry of walk(frontendPath, {
      includeDirs: false,
      exts: [".ts", ".tsx"],
      skip: SKIP_NODE_MODULES,
    })
  ) {
    files.push(relative(REPO_ROOT, entry.path).replaceAll("\\", "/"));
  }

  return files.sort();
}

async function runDenoCheck(
  files: readonly string[],
  configPath?: string,
): Promise<void> {
  if (files.length === 0) {
    return;
  }

  const args = ["check"];

  if (configPath !== undefined) {
    args.push("--config", configPath);
  }

  args.push(...files);

  const command = new Deno.Command("deno", {
    args,
    cwd: REPO_ROOT,
    stdout: "inherit",
    stderr: "inherit",
  });
  const status = await command.spawn().status;

  if (!status.success) {
    throw new Error(`deno check exited with code ${status.code}`);
  }
}

if (import.meta.main) {
  await runDenoCheck(await collectRootCheckFiles());
  await runDenoCheck(await collectFrontendFiles(), FRONTEND_CONFIG);
}

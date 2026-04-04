import { walk } from "@std/fs";
import { resolve } from "@std/path";

type EnvReader = Readonly<{
  get(name: string): string | undefined;
}>;

export type GitHubArtifactUploadResult = Readonly<{
  name: string;
  rootDir: string;
  fileCount: number;
  id?: number;
  size?: number;
  digest?: string;
}>;

function hasNonEmptyEnv(
  env: EnvReader,
  name: string,
): boolean {
  return (env.get(name)?.trim().length ?? 0) > 0;
}

export function isGitHubActionsEnvironment(env: EnvReader = Deno.env): boolean {
  return env.get("GITHUB_ACTIONS") === "true";
}

export function canWriteGitHubJobSummary(
  env: EnvReader = Deno.env,
): boolean {
  return isGitHubActionsEnvironment(env) &&
    hasNonEmptyEnv(env, "GITHUB_STEP_SUMMARY");
}

export function canUploadGitHubArtifact(
  env: EnvReader = Deno.env,
): boolean {
  return isGitHubActionsEnvironment(env) &&
    hasNonEmptyEnv(env, "ACTIONS_RUNTIME_TOKEN") &&
    hasNonEmptyEnv(env, "ACTIONS_RESULTS_URL");
}

export async function collectArtifactFilePaths(
  rootDir: string,
): Promise<ReadonlyArray<string>> {
  const resolvedRootDir = resolve(rootDir);
  const filePaths: string[] = [];

  for await (
    const entry of walk(resolvedRootDir, {
      includeDirs: false,
      followSymlinks: false,
    })
  ) {
    filePaths.push(entry.path);
  }

  return filePaths.sort((left, right) => left.localeCompare(right));
}

export async function writeGitHubJobSummary(
  markdown: string,
  env: EnvReader = Deno.env,
): Promise<boolean> {
  if (!canWriteGitHubJobSummary(env)) {
    return false;
  }

  const { summary } = await import("npm/actions-core");

  await summary.clear();
  summary.addRaw(markdown, true);
  await summary.write();
  return true;
}

export async function uploadGitHubArtifactDirectory(
  name: string,
  rootDir: string,
  options: Readonly<{ retentionDays?: number }> = {},
  env: EnvReader = Deno.env,
): Promise<GitHubArtifactUploadResult | undefined> {
  if (!canUploadGitHubArtifact(env)) {
    return undefined;
  }

  const resolvedRootDir = resolve(rootDir);
  const filePaths = await collectArtifactFilePaths(resolvedRootDir);

  if (filePaths.length === 0) {
    throw new Error(
      `Cannot upload GitHub artifact "${name}" because ${resolvedRootDir} is empty`,
    );
  }

  const { DefaultArtifactClient } = await import("npm/actions-artifact");
  const client = new DefaultArtifactClient();
  const upload = await client.uploadArtifact(
    name,
    [...filePaths],
    resolvedRootDir,
    {
      ...(options.retentionDays === undefined
        ? {}
        : { retentionDays: options.retentionDays }),
    },
  );

  return {
    name,
    rootDir: resolvedRootDir,
    fileCount: filePaths.length,
    ...(upload.id === undefined ? {} : { id: upload.id }),
    ...(upload.size === undefined ? {} : { size: upload.size }),
    ...(upload.digest === undefined ? {} : { digest: upload.digest }),
  };
}

import { walk } from "@std/fs";
import { resolve } from "@std/path";

type EnvReader = Readonly<{
  get(name: string): string | undefined;
}>;

export type GitHubActionsEnvironmentDiagnostics = Readonly<{
  githubActions: string | undefined;
  githubStepSummary: string | undefined;
  actionsRuntimeToken: string | undefined;
  actionsResultsUrl: string | undefined;
  actionsRuntimeUrl: string | undefined;
  githubWorkflow: string | undefined;
  githubRunId: string | undefined;
  githubServerUrl: string | undefined;
  runnerEnvironment: string | undefined;
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

function formatDiagnosticEnvValue(value: string | undefined): string {
  if (value === undefined) {
    return "<undefined>";
  }

  if (value.length === 0) {
    return "<empty>";
  }

  return JSON.stringify(value);
}

function formatDiagnosticTokenValue(value: string | undefined): string {
  if (value === undefined) {
    return "<undefined>";
  }

  const trimmedLength = value.trim().length;

  if (trimmedLength === 0) {
    return "<empty>";
  }

  return `${JSON.stringify(value)} (trimmed-length=${trimmedLength})`;
}

export function isGitHubActionsEnvironment(env: EnvReader = Deno.env): boolean {
  return env.get("GITHUB_ACTIONS") === "true";
}

export function getGitHubActionsEnvironmentDiagnostics(
  env: EnvReader = Deno.env,
): GitHubActionsEnvironmentDiagnostics {
  return {
    githubActions: env.get("GITHUB_ACTIONS"),
    githubStepSummary: env.get("GITHUB_STEP_SUMMARY"),
    actionsRuntimeToken: env.get("ACTIONS_RUNTIME_TOKEN"),
    actionsResultsUrl: env.get("ACTIONS_RESULTS_URL"),
    actionsRuntimeUrl: env.get("ACTIONS_RUNTIME_URL"),
    githubWorkflow: env.get("GITHUB_WORKFLOW"),
    githubRunId: env.get("GITHUB_RUN_ID"),
    githubServerUrl: env.get("GITHUB_SERVER_URL"),
    runnerEnvironment: env.get("RUNNER_ENVIRONMENT"),
  };
}

export function buildGitHubActionsEnvironmentDiagnosticLines(
  context: string,
  env: EnvReader = Deno.env,
): ReadonlyArray<string> {
  const diagnostics = getGitHubActionsEnvironmentDiagnostics(env);

  return [
    `[github-actions] ${context}: GITHUB_ACTIONS=${
      formatDiagnosticEnvValue(diagnostics.githubActions)
    }`,
    `[github-actions] ${context}: GITHUB_STEP_SUMMARY=${
      formatDiagnosticEnvValue(diagnostics.githubStepSummary)
    }`,
    `[github-actions] ${context}: ACTIONS_RUNTIME_TOKEN=${
      formatDiagnosticTokenValue(diagnostics.actionsRuntimeToken)
    }`,
    `[github-actions] ${context}: ACTIONS_RESULTS_URL=${
      formatDiagnosticEnvValue(diagnostics.actionsResultsUrl)
    }`,
    `[github-actions] ${context}: ACTIONS_RUNTIME_URL=${
      formatDiagnosticEnvValue(diagnostics.actionsRuntimeUrl)
    }`,
    `[github-actions] ${context}: GITHUB_WORKFLOW=${
      formatDiagnosticEnvValue(diagnostics.githubWorkflow)
    }`,
    `[github-actions] ${context}: GITHUB_RUN_ID=${
      formatDiagnosticEnvValue(diagnostics.githubRunId)
    }`,
    `[github-actions] ${context}: GITHUB_SERVER_URL=${
      formatDiagnosticEnvValue(diagnostics.githubServerUrl)
    }`,
    `[github-actions] ${context}: RUNNER_ENVIRONMENT=${
      formatDiagnosticEnvValue(diagnostics.runnerEnvironment)
    }`,
  ];
}

export async function logGitHubActionsEnvironmentDiagnostics(
  context: string,
  env: EnvReader = Deno.env,
): Promise<void> {
  if (!isGitHubActionsEnvironment(env)) {
    return;
  }

  const core = await import("npm/actions-core");
  const runtimeToken = env.get("ACTIONS_RUNTIME_TOKEN");

  if (runtimeToken !== undefined && runtimeToken.trim().length > 0) {
    core.setSecret(runtimeToken);
  }

  for (
    const line of buildGitHubActionsEnvironmentDiagnosticLines(context, env)
  ) {
    core.info(line);
  }
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
  await logGitHubActionsEnvironmentDiagnostics("job-summary", env);

  if (!canWriteGitHubJobSummary(env)) {
    if (isGitHubActionsEnvironment(env)) {
      const { info } = await import("npm/actions-core");
      info(
        "[github-actions] job-summary: skipped because GITHUB_STEP_SUMMARY is missing or empty",
      );
    }

    return false;
  }

  const { info, summary } = await import("npm/actions-core");

  await summary.clear();
  summary.addRaw(markdown, true);
  await summary.write();
  info("[github-actions] job-summary: wrote GitHub job summary");
  return true;
}

export async function uploadGitHubArtifactDirectory(
  name: string,
  rootDir: string,
  options: Readonly<{ retentionDays?: number }> = {},
  env: EnvReader = Deno.env,
): Promise<GitHubArtifactUploadResult | undefined> {
  await logGitHubActionsEnvironmentDiagnostics("artifact-upload", env);

  if (!canUploadGitHubArtifact(env)) {
    if (isGitHubActionsEnvironment(env)) {
      const { info } = await import("npm/actions-core");
      info(
        "[github-actions] artifact-upload: skipped because ACTIONS_RUNTIME_TOKEN or ACTIONS_RESULTS_URL is missing or empty",
      );
    }

    return undefined;
  }

  const resolvedRootDir = resolve(rootDir);
  const filePaths = await collectArtifactFilePaths(resolvedRootDir);

  if (filePaths.length === 0) {
    throw new Error(
      `Cannot upload GitHub artifact "${name}" because ${resolvedRootDir} is empty`,
    );
  }

  const { info } = await import("npm/actions-core");
  const { DefaultArtifactClient } = await import("npm/actions-artifact");
  const client = new DefaultArtifactClient();
  info(
    `[github-actions] artifact-upload: uploading "${name}" from ${resolvedRootDir} (${filePaths.length} files)`,
  );
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
  info(
    `[github-actions] artifact-upload: uploaded "${name}" id=${
      upload.id ?? "<undefined>"
    } size=${upload.size ?? "<undefined>"} digest=${
      upload.digest ?? "<undefined>"
    }`,
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

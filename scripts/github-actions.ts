type EnvReader = Readonly<{
  get(name: string): string | undefined;
}>;

export type GitHubActionsEnvironmentDiagnostics = Readonly<{
  githubActions: string | undefined;
  githubStepSummary: string | undefined;
  githubWorkflow: string | undefined;
  githubRunId: string | undefined;
  githubServerUrl: string | undefined;
  runnerEnvironment: string | undefined;
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

export function isGitHubActionsEnvironment(env: EnvReader = Deno.env): boolean {
  return env.get("GITHUB_ACTIONS") === "true";
}

export function getGitHubActionsEnvironmentDiagnostics(
  env: EnvReader = Deno.env,
): GitHubActionsEnvironmentDiagnostics {
  return {
    githubActions: env.get("GITHUB_ACTIONS"),
    githubStepSummary: env.get("GITHUB_STEP_SUMMARY"),
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

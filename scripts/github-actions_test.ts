import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import {
  buildGitHubActionsEnvironmentDiagnosticLines,
  canUploadGitHubArtifact,
  canWriteGitHubJobSummary,
  collectArtifactFilePaths,
  getGitHubActionsEnvironmentDiagnostics,
  isGitHubActionsEnvironment,
} from "./github-actions.ts";
import { withTempDir, writeTextTree } from "../test/temp_fs.ts";

function createEnv(entries: Record<string, string | undefined>): {
  get(name: string): string | undefined;
} {
  return {
    get(name: string): string | undefined {
      return entries[name];
    },
  };
}

describe("isGitHubActionsEnvironment()", () => {
  it("detects runner context from GITHUB_ACTIONS", () => {
    assertEquals(
      isGitHubActionsEnvironment(createEnv({ GITHUB_ACTIONS: "true" })),
      true,
    );
    assertEquals(
      isGitHubActionsEnvironment(createEnv({ GITHUB_ACTIONS: "false" })),
      false,
    );
  });
});

describe("canWriteGitHubJobSummary()", () => {
  it("requires both runner context and the step summary file path", () => {
    assertEquals(
      canWriteGitHubJobSummary(createEnv({
        GITHUB_ACTIONS: "true",
        GITHUB_STEP_SUMMARY: "/tmp/summary.md",
      })),
      true,
    );
    assertEquals(
      canWriteGitHubJobSummary(createEnv({ GITHUB_ACTIONS: "true" })),
      false,
    );
  });
});

describe("canUploadGitHubArtifact()", () => {
  it("requires the runtime token and results URL exposed by the runner", () => {
    assertEquals(
      canUploadGitHubArtifact(createEnv({
        GITHUB_ACTIONS: "true",
        ACTIONS_RUNTIME_TOKEN: "token",
        ACTIONS_RESULTS_URL: "https://results.actions.githubusercontent.com",
      })),
      true,
    );
    assertEquals(
      canUploadGitHubArtifact(createEnv({
        GITHUB_ACTIONS: "true",
        ACTIONS_RUNTIME_TOKEN: "token",
      })),
      false,
    );
  });
});

describe("getGitHubActionsEnvironmentDiagnostics()", () => {
  it("captures the runner variables used by the harness publishing path", () => {
    assertEquals(
      getGitHubActionsEnvironmentDiagnostics(createEnv({
        GITHUB_ACTIONS: "true",
        GITHUB_STEP_SUMMARY: "/tmp/summary.md",
        ACTIONS_RUNTIME_TOKEN: "token",
        ACTIONS_RESULTS_URL: "https://results.actions.githubusercontent.com",
        ACTIONS_RUNTIME_URL: "https://pipelines.actions.githubusercontent.com",
        GITHUB_WORKFLOW: "Pretext Harness",
        GITHUB_RUN_ID: "1234567890",
        GITHUB_SERVER_URL: "https://github.com",
        RUNNER_ENVIRONMENT: "github-hosted",
      })),
      {
        githubActions: "true",
        githubStepSummary: "/tmp/summary.md",
        actionsRuntimeToken: "token",
        actionsResultsUrl: "https://results.actions.githubusercontent.com",
        actionsRuntimeUrl: "https://pipelines.actions.githubusercontent.com",
        githubWorkflow: "Pretext Harness",
        githubRunId: "1234567890",
        githubServerUrl: "https://github.com",
        runnerEnvironment: "github-hosted",
      },
    );
  });
});

describe("buildGitHubActionsEnvironmentDiagnosticLines()", () => {
  it("surfaces both the current artifact gate and adjacent runtime variables", () => {
    assertEquals(
      buildGitHubActionsEnvironmentDiagnosticLines(
        "artifact-upload",
        createEnv({
          GITHUB_ACTIONS: "true",
          ACTIONS_RUNTIME_TOKEN: "token",
          ACTIONS_RUNTIME_URL:
            "https://pipelines.actions.githubusercontent.com",
        }),
      ),
      [
        '[github-actions] artifact-upload: GITHUB_ACTIONS="true"',
        "[github-actions] artifact-upload: GITHUB_STEP_SUMMARY=<undefined>",
        '[github-actions] artifact-upload: ACTIONS_RUNTIME_TOKEN="token" (trimmed-length=5)',
        "[github-actions] artifact-upload: ACTIONS_RESULTS_URL=<undefined>",
        '[github-actions] artifact-upload: ACTIONS_RUNTIME_URL="https://pipelines.actions.githubusercontent.com"',
        "[github-actions] artifact-upload: GITHUB_WORKFLOW=<undefined>",
        "[github-actions] artifact-upload: GITHUB_RUN_ID=<undefined>",
        "[github-actions] artifact-upload: GITHUB_SERVER_URL=<undefined>",
        "[github-actions] artifact-upload: RUNNER_ENVIRONMENT=<undefined>",
      ],
    );
  });
});

describe("collectArtifactFilePaths()", () => {
  it("walks a directory recursively and returns sorted file paths", async () => {
    await withTempDir("github-actions-artifact-", async (rootDir) => {
      await writeTextTree(rootDir, {
        "z-last.txt": "z",
        "nested/a-first.txt": "a",
        "nested/deeper/middle.txt": "m",
      });

      assertEquals(await collectArtifactFilePaths(rootDir), [
        `${rootDir}/nested/a-first.txt`,
        `${rootDir}/nested/deeper/middle.txt`,
        `${rootDir}/z-last.txt`,
      ]);
    });
  });
});

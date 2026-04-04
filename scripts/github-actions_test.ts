import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import {
  buildGitHubActionsEnvironmentDiagnosticLines,
  canWriteGitHubJobSummary,
  getGitHubActionsEnvironmentDiagnostics,
  isGitHubActionsEnvironment,
} from "./github-actions.ts";

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

describe("getGitHubActionsEnvironmentDiagnostics()", () => {
  it("captures the runner variables used by the summary publishing path", () => {
    assertEquals(
      getGitHubActionsEnvironmentDiagnostics(createEnv({
        GITHUB_ACTIONS: "true",
        GITHUB_STEP_SUMMARY: "/tmp/summary.md",
        GITHUB_WORKFLOW: "Pretext Harness",
        GITHUB_RUN_ID: "1234567890",
        GITHUB_SERVER_URL: "https://github.com",
        RUNNER_ENVIRONMENT: "github-hosted",
      })),
      {
        githubActions: "true",
        githubStepSummary: "/tmp/summary.md",
        githubWorkflow: "Pretext Harness",
        githubRunId: "1234567890",
        githubServerUrl: "https://github.com",
        runnerEnvironment: "github-hosted",
      },
    );
  });
});

describe("buildGitHubActionsEnvironmentDiagnosticLines()", () => {
  it("surfaces the public runner variables used by the summary path", () => {
    assertEquals(
      buildGitHubActionsEnvironmentDiagnosticLines(
        "job-summary",
        createEnv({
          GITHUB_ACTIONS: "true",
          GITHUB_STEP_SUMMARY: "/tmp/summary.md",
          GITHUB_WORKFLOW: "Pretext Harness",
        }),
      ),
      [
        '[github-actions] job-summary: GITHUB_ACTIONS="true"',
        '[github-actions] job-summary: GITHUB_STEP_SUMMARY="/tmp/summary.md"',
        '[github-actions] job-summary: GITHUB_WORKFLOW="Pretext Harness"',
        "[github-actions] job-summary: GITHUB_RUN_ID=<undefined>",
        "[github-actions] job-summary: GITHUB_SERVER_URL=<undefined>",
        "[github-actions] job-summary: RUNNER_ENVIRONMENT=<undefined>",
      ],
    );
  });
});

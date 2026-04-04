import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import {
  canUploadGitHubArtifact,
  canWriteGitHubJobSummary,
  collectArtifactFilePaths,
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

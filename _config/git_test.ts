import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import {
  buildGitHubHistoryUrl,
  createGitFileHistoryResolver,
  normalizeRepositoryUrl,
  parseDefaultBranch,
  parseGitFileLastCommit,
  toRepoRelativePath,
} from "./git.ts";

describe("_config/git.ts", () => {
  it("normalizes SSH repository remotes to HTTPS", () => {
    assertEquals(
      normalizeRepositoryUrl("git@github.com:frenchvandal/normco.re.git"),
      "https://github.com/frenchvandal/normco.re",
    );
  });

  it("parses the default branch from origin/HEAD and falls back cleanly", () => {
    assertEquals(
      parseDefaultBranch("refs/remotes/origin/master", "feature/metadata"),
      "master",
    );
    assertEquals(
      parseDefaultBranch(undefined, "feature/metadata"),
      "feature/metadata",
    );
  });

  it("converts source paths to repository-relative file paths", () => {
    assertEquals(
      toRepoRelativePath(
        "/Users/normcore/Code/normco.re/src/posts/example-post/en.md",
        "/Users/normcore/Code/normco.re",
      ),
      "src/posts/example-post/en.md",
    );
    assertEquals(
      toRepoRelativePath(
        "C:\\repo\\src\\posts\\example-post\\fr.md",
        "C:\\repo",
      ),
      "src/posts/example-post/fr.md",
    );
  });

  it("parses git log records into truncated GitHub-style SHAs", () => {
    assertEquals(
      parseGitFileLastCommit(
        "515315d176f8c4bd88ae71d4860b676ab1b2366b\u00002026-03-27T10:09:39+08:00",
      ),
      {
        sha: "515315d176f8c4bd88ae71d4860b676ab1b2366b",
        shortSha: "515315d",
        committedAt: "2026-03-27T10:09:39+08:00",
      },
    );
  });

  it("builds GitHub file-history URLs against the default branch", () => {
    assertEquals(
      buildGitHubHistoryUrl(
        "https://github.com/frenchvandal/normco.re",
        "master",
        "src/posts/alibaba-cloud-oss-cdn-deployment/zh-hans.md",
      ),
      "https://github.com/frenchvandal/normco.re/commits/master/src/posts/alibaba-cloud-oss-cdn-deployment/zh-hans.md",
    );
  });

  it("resolves git-created and last-commit metadata once per source path", () => {
    let lastCommitCalls = 0;
    let createdCalls = 0;

    const resolveHistory = createGitFileHistoryResolver((args, cwd) => {
      const key = `${cwd ?? ""}|${args.join(" ")}`;

      switch (key) {
        case "/repo|rev-parse --show-toplevel":
          return "/repo";
        case "/repo|config --get remote.origin.url":
          return "git@github.com:frenchvandal/normco.re.git";
        case "/repo|symbolic-ref refs/remotes/origin/HEAD":
          return "refs/remotes/origin/master";
        case "/repo|branch --show-current":
          return "feature/post-metadata";
        case "/repo|log --follow -n 1 --format=%H%x00%cI -- posts/example-post/en.md":
          lastCommitCalls += 1;
          return undefined;
        case "/repo|log --follow --diff-filter=A --format=%cI -- posts/example-post/en.md":
          createdCalls += 1;
          return undefined;
        case "/repo|log --follow -n 1 --format=%H%x00%cI -- src/posts/example-post/en.md":
          lastCommitCalls += 1;
          return "515315d176f8c4bd88ae71d4860b676ab1b2366b\u00002026-03-27T10:09:39+08:00";
        case "/repo|log --follow --diff-filter=A --format=%cI -- src/posts/example-post/en.md":
          createdCalls += 1;
          return "2026-03-14T08:00:00+08:00";
        default:
          throw new Error(`Unexpected git command: ${key}`);
      }
    }, "/repo");

    const first = resolveHistory("/posts/example-post/en.md");
    const second = resolveHistory("/posts/example-post/en.md");

    assertEquals(first, {
      createdAt: "2026-03-14T08:00:00+08:00",
      lastCommit: {
        sha: "515315d176f8c4bd88ae71d4860b676ab1b2366b",
        shortSha: "515315d",
        committedAt: "2026-03-27T10:09:39+08:00",
        filePath: "src/posts/example-post/en.md",
        historyUrl:
          "https://github.com/frenchvandal/normco.re/commits/master/src/posts/example-post/en.md",
        commitUrl:
          "https://github.com/frenchvandal/normco.re/commit/515315d176f8c4bd88ae71d4860b676ab1b2366b",
      },
    });
    assertEquals(second, first);
    assertEquals(lastCommitCalls, 2);
    assertEquals(createdCalls, 2);
  });
});

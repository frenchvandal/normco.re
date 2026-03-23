import { assertEquals, assertRejects } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import {
  POST_BUILD_TASKS,
  PRE_BUILD_TASKS,
  runBuildTask,
  runBuildTasks,
} from "./build_tasks.ts";
import { createDirEntry, withPatchedDeno } from "../test/mock_deno.ts";

describe("build task definitions", () => {
  it("defines the quality-report pre-build step", () => {
    assertEquals(PRE_BUILD_TASKS, [{
      name: "ensure quality report directory",
      command: "deno",
      args: ["run", "--allow-write", "scripts/ensure-dir.ts", "_quality"],
    }]);
  });

  it("defines ordered post-build steps without shell chaining", () => {
    assertEquals(
      POST_BUILD_TASKS.map((task) => task.name),
      [
        "fingerprint built assets",
        "verify browser imports",
        "format built HTML and JSON output",
        "validate built output links",
      ],
    );
  });
});

describe("runBuildTask()", () => {
  it("delegates to the injected command runner", async () => {
    const calls: Array<{ command: string; args: ReadonlyArray<string> }> = [];

    await runBuildTask(
      {
        name: "sample",
        command: "deno",
        args: ["fmt", "file.ts"],
      },
      (command, args) => {
        calls.push({ command, args });
        return Promise.resolve({ code: 0, success: true });
      },
    );

    assertEquals(calls, [{
      command: "deno",
      args: ["fmt", "file.ts"],
    }]);
  });

  it("wraps non-zero exit codes with task context", async () => {
    await assertRejects(
      () =>
        runBuildTask(
          {
            name: "verify browser imports",
            command: "deno",
            args: [
              "run",
              "--allow-read",
              "scripts/check-browser-imports.ts",
              "_site",
            ],
          },
          () => Promise.resolve({ code: 1, success: false }),
        ),
      Error,
      '[build-task] verify browser imports failed while running "deno run --allow-read scripts/check-browser-imports.ts _site": Command exited with code 1',
    );
  });

  it("wraps runner exceptions with task context", async () => {
    await assertRejects(
      () =>
        runBuildTask(
          {
            name: "verify browser imports",
            command: "deno",
            args: ["run", "--allow-read", "scripts/check-browser-imports.ts"],
          },
          () => Promise.reject(new Error("deno executable not found")),
        ),
      Error,
      '[build-task] verify browser imports failed while running "deno run --allow-read scripts/check-browser-imports.ts": deno executable not found',
    );
  });

  it("expands HTML and JSON glob arguments before invoking deno fmt", async () => {
    const htmlDir = "/virtual/site";
    const nestedDir = `${htmlDir}/posts`;
    const calls: Array<{ command: string; args: ReadonlyArray<string> }> = [];

    await withPatchedDeno({
      readDir: (path: string | URL) => {
        const directory = String(path);

        if (directory === htmlDir) {
          return (async function* () {
            yield createDirEntry("index.html", "file");
            yield createDirEntry("feed.json", "file");
            yield createDirEntry("posts", "directory");
          })();
        }

        if (directory === nestedDir) {
          return (async function* () {
            yield createDirEntry("entry.html", "file");
            yield createDirEntry("entry.json", "file");
          })();
        }

        return (async function* () {})();
      },
    }, async () => {
      await runBuildTask(
        {
          name: "format built HTML and JSON output",
          command: "deno",
          args: ["fmt", `${htmlDir}/**/*.html`, `${htmlDir}/**/*.json`],
        },
        (command, args) => {
          calls.push({ command, args });
          return Promise.resolve({ code: 0, success: true });
        },
      );
    });

    assertEquals(calls, [{
      command: "deno",
      args: [
        "fmt",
        `${htmlDir}/index.html`,
        `${nestedDir}/entry.html`,
        `${htmlDir}/feed.json`,
        `${nestedDir}/entry.json`,
      ],
    }]);
  });

  it("skips deno fmt when the HTML and JSON globs match no files", async () => {
    let callCount = 0;

    await withPatchedDeno({
      readDir: () => (async function* () {})(),
    }, async () => {
      await runBuildTask(
        {
          name: "format built HTML and JSON output",
          command: "deno",
          args: ["fmt", `/virtual/site/**/*.html`, `/virtual/site/**/*.json`],
        },
        () => {
          callCount += 1;
          return Promise.resolve({ code: 0, success: true });
        },
      );
    });

    assertEquals(callCount, 0);
  });
});

describe("runBuildTasks()", () => {
  it("runs tasks sequentially and stops at the first failure", async () => {
    const calls: string[] = [];

    await assertRejects(
      () =>
        runBuildTasks(
          [
            { name: "first", command: "deno", args: ["fmt", "a.ts"] },
            { name: "second", command: "deno", args: ["fmt", "b.ts"] },
            { name: "third", command: "deno", args: ["fmt", "c.ts"] },
          ],
          (_command, args) => {
            const file = args[1];
            calls.push(String(file));

            if (file === "b.ts") {
              return Promise.resolve({ code: 2, success: false });
            }

            return Promise.resolve({ code: 0, success: true });
          },
        ),
      Error,
      '[build-task] second failed while running "deno fmt b.ts": Command exited with code 2',
    );

    assertEquals(calls, ["a.ts", "b.ts"]);
  });
});

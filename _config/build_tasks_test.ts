import { assertEquals, assertRejects } from "@std/assert";
import { join } from "@std/path";
import { describe, it } from "@std/testing/bdd";

import {
  POST_BUILD_TASKS,
  PRE_BUILD_TASKS,
  runBuildTask,
  runBuildTasks,
} from "./build_tasks.ts";
import { withTempDir, writeTextTree } from "../test/temp_fs.ts";

describe("build task definitions", () => {
  it("defines the ordered pre-build steps without shell chaining", () => {
    assertEquals(PRE_BUILD_TASKS, [
      {
        name: "ensure quality report directory",
        command: "deno",
        args: ["run", "--allow-write", "scripts/ensure-dir.ts", "_quality"],
      },
      {
        name: "generate shared Ant Design stylesheet",
        command: "deno",
        args: ["run", "-A", "scripts/generate-antd-css.ts"],
      },
    ]);
  });

  it("defines ordered post-build steps without shell chaining", () => {
    assertEquals(
      POST_BUILD_TASKS.map((task) => task.name),
      [
        "fingerprint built assets",
        "prune non-deployable build output",
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
    const calls: Array<{ command: string; args: ReadonlyArray<string> }> = [];
    let expectedArgs: ReadonlyArray<string> = [];

    await withTempDir("build-tasks-", async (htmlDir) => {
      const nestedDir = join(htmlDir, "posts");
      expectedArgs = [
        "fmt",
        `${htmlDir}/index.html`,
        `${nestedDir}/entry.html`,
        `${htmlDir}/feed.json`,
        `${nestedDir}/entry.json`,
      ];
      await writeTextTree(htmlDir, {
        "index.html": "",
        "feed.json": "",
        "posts/entry.html": "",
        "posts/entry.json": "",
      });

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
      args: expectedArgs,
    }]);
  });

  it("skips deno fmt when the HTML and JSON globs match no files", async () => {
    let callCount = 0;

    await withTempDir("build-tasks-empty-", async (rootDir) => {
      await runBuildTask(
        {
          name: "format built HTML and JSON output",
          command: "deno",
          args: ["fmt", `${rootDir}/**/*.html`, `${rootDir}/**/*.json`],
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

import { assertEquals, assertRejects } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import {
  POST_BUILD_TASKS,
  PRE_BUILD_TASKS,
  runBuildTask,
  runBuildTasks,
} from "./build_tasks.ts";

describe("build task definitions", () => {
  it("defines the quality-cache pre-build step", () => {
    assertEquals(PRE_BUILD_TASKS, [{
      name: "ensure quality cache directory",
      command: "deno",
      args: ["run", "--allow-write", "scripts/ensure-dir.ts", "_cache/quality"],
    }]);
  });

  it("defines ordered post-build steps without shell chaining", () => {
    assertEquals(
      POST_BUILD_TASKS.map((task) => task.name),
      [
        "fingerprint built assets",
        "verify browser imports",
        "format built HTML output",
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
      async (command, args) => {
        calls.push({ command, args });
        return { code: 0, success: true };
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
          async () => ({ code: 1, success: false }),
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
          async () => {
            throw new Error("deno executable not found");
          },
        ),
      Error,
      '[build-task] verify browser imports failed while running "deno run --allow-read scripts/check-browser-imports.ts": deno executable not found',
    );
  });

  it("expands HTML glob arguments before invoking deno fmt", async () => {
    const dir = await Deno.makeTempDir();
    const htmlDir = `${dir}/site`;
    const nestedDir = `${htmlDir}/posts`;
    const calls: Array<{ command: string; args: ReadonlyArray<string> }> = [];

    try {
      await Deno.mkdir(nestedDir, { recursive: true });
      await Deno.writeTextFile(`${htmlDir}/index.html`, "<html></html>");
      await Deno.writeTextFile(`${nestedDir}/entry.html`, "<html></html>");

      await runBuildTask(
        {
          name: "format built HTML output",
          command: "deno",
          args: ["fmt", `${htmlDir}/**/*.html`],
        },
        async (command, args) => {
          calls.push({ command, args });
          return { code: 0, success: true };
        },
      );
    } finally {
      await Deno.remove(dir, { recursive: true });
    }

    assertEquals(calls, [{
      command: "deno",
      args: ["fmt", `${htmlDir}/index.html`, `${nestedDir}/entry.html`],
    }]);
  });

  it("skips deno fmt when the HTML glob matches no files", async () => {
    const dir = await Deno.makeTempDir();
    let callCount = 0;

    try {
      await runBuildTask(
        {
          name: "format built HTML output",
          command: "deno",
          args: ["fmt", `${dir}/**/*.html`],
        },
        async () => {
          callCount += 1;
          return { code: 0, success: true };
        },
      );
    } finally {
      await Deno.remove(dir, { recursive: true });
    }

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
          async (_command, args) => {
            const file = args[1];
            calls.push(String(file));

            if (file === "b.ts") {
              return { code: 2, success: false };
            }

            return { code: 0, success: true };
          },
        ),
      Error,
      '[build-task] second failed while running "deno fmt b.ts": Command exited with code 2',
    );

    assertEquals(calls, ["a.ts", "b.ts"]);
  });
});

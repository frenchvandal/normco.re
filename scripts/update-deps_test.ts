import { assertEquals } from "@std/assert";

import {
  buildUpdateDepsSteps,
  DEFAULT_SERVE_PROBE_DURATION_MS,
  isExpectedServeExitCode,
} from "./update-deps.ts";

Deno.test("buildUpdateDepsSteps() keeps the expected dependency refresh order", () => {
  assertEquals(
    buildUpdateDepsSteps().map((step) => ({
      args: [...step.args],
      cwd: step.cwd,
      label: step.label,
    })),
    [
      {
        args: ["outdated", "--update", "--latest"],
        cwd: undefined,
        label: "Updating root dependencies",
      },
      {
        args: ["outdated", "--update", "--latest"],
        cwd: "src/blog/client",
        label: "Updating frontend dependencies",
      },
      {
        args: ["task", "locks:regen"],
        cwd: undefined,
        label: "Regenerating lockfiles",
      },
      {
        args: ["task", "generate:antd-css"],
        cwd: undefined,
        label: "Regenerating generated Ant Design CSS",
      },
    ],
  );
  assertEquals(DEFAULT_SERVE_PROBE_DURATION_MS, 60_000);
});

Deno.test("isExpectedServeExitCode() accepts clean and SIGINT exits only", () => {
  assertEquals(isExpectedServeExitCode(0), true);
  assertEquals(isExpectedServeExitCode(130), true);
  assertEquals(isExpectedServeExitCode(1), false);
});

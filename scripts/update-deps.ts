import { join } from "@std/path";

import { FRONTEND_DIR, REPO_ROOT } from "./deno_graph.ts";

type UpdateDepsStep = Readonly<{
  args: readonly string[];
  cwd?: string;
  label: string;
}>;

export const DEFAULT_SERVE_PROBE_DURATION_MS = 60_000;

export function buildUpdateDepsSteps(): readonly UpdateDepsStep[] {
  return [
    {
      args: ["outdated", "--update", "--latest"],
      label: "Updating root dependencies",
    },
    {
      args: ["outdated", "--update", "--latest"],
      cwd: FRONTEND_DIR,
      label: "Updating frontend dependencies",
    },
    {
      args: ["task", "locks:regen"],
      label: "Regenerating lockfiles",
    },
    {
      args: ["task", "generate:antd-css"],
      label: "Regenerating generated Ant Design CSS",
    },
  ];
}

export function isExpectedServeExitCode(code: number): boolean {
  return code === 0 || code === 130;
}

async function runDenoStep(step: UpdateDepsStep): Promise<void> {
  console.log(step.label);

  const status = await new Deno.Command("deno", {
    args: [...step.args],
    cwd: step.cwd ? join(REPO_ROOT, step.cwd) : REPO_ROOT,
    stdout: "inherit",
    stderr: "inherit",
  }).spawn().status;

  if (!status.success) {
    throw new Error(
      `${step.label} failed with exit code ${status.code}.`,
    );
  }
}

async function runServeProbe(
  durationMs: number = DEFAULT_SERVE_PROBE_DURATION_MS,
): Promise<void> {
  console.log(`Starting dev server probe for ${durationMs}ms`);

  const serveProcess = new Deno.Command("deno", {
    args: ["task", "serve"],
    cwd: REPO_ROOT,
    stdout: "inherit",
    stderr: "inherit",
  }).spawn();
  let interrupted = false;
  const timeoutId = globalThis.setTimeout(() => {
    interrupted = true;

    try {
      serveProcess.kill("SIGINT");
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        console.warn(
          "Failed to interrupt the dev server probe cleanly:",
          error,
        );
      }
    }
  }, durationMs);

  try {
    const status = await serveProcess.status;

    if (!interrupted) {
      throw new Error(
        `The dev server exited before the ${durationMs}ms probe completed (exit code ${status.code}).`,
      );
    }

    if (!isExpectedServeExitCode(status.code)) {
      throw new Error(
        `The dev server exited with unexpected code ${status.code} after the probe.`,
      );
    }
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
}

export async function updateDeps(
  durationMs: number = DEFAULT_SERVE_PROBE_DURATION_MS,
): Promise<void> {
  for (const step of buildUpdateDepsSteps()) {
    await runDenoStep(step);
  }

  await runServeProbe(durationMs);
}

if (import.meta.main) {
  await updateDeps();
}

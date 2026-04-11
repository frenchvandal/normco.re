import {
  collectFrontendFiles,
  collectRootLockFiles,
  FRONTEND_CONFIG,
  FRONTEND_LOCK,
  REPO_ROOT,
  ROOT_LOCK,
} from "./deno_graph.ts";

type LockCheckTarget = Readonly<{
  configPath?: string;
  files: readonly string[];
  label: string;
  lockPath: string;
}>;

export function buildCheckArgs(target: LockCheckTarget): string[] {
  const args = [
    "check",
    "--lock",
    target.lockPath,
    "--frozen",
  ];

  if (target.configPath !== undefined) {
    args.push("--config", target.configPath);
  }

  args.push(...target.files);

  return args;
}

async function runLockCheck(target: LockCheckTarget): Promise<void> {
  if (target.files.length === 0) {
    return;
  }

  console.log(`Verifying ${target.label} lockfile at ${target.lockPath}`);

  const status = await new Deno.Command("deno", {
    args: buildCheckArgs(target),
    cwd: REPO_ROOT,
    stdout: "inherit",
    stderr: "inherit",
  }).spawn().status;

  if (!status.success) {
    throw new Error(
      `deno check exited with code ${status.code} while verifying ${target.label} lockfile`,
    );
  }
}

if (import.meta.main) {
  await runLockCheck({
    label: "root",
    lockPath: ROOT_LOCK,
    files: await collectRootLockFiles(),
  });

  await runLockCheck({
    label: "frontend",
    lockPath: FRONTEND_LOCK,
    configPath: FRONTEND_CONFIG,
    files: await collectFrontendFiles(),
  });
}

import {
  FRONTEND_CONFIG,
  FRONTEND_LOCK,
  REPO_ROOT,
  ROOT_LOCK,
} from "./deno_graph.ts";

type LockTarget = Readonly<{
  label: string;
  lockPath: string;
  configPath?: string;
}>;

export function buildInstallArgs(target: LockTarget): string[] {
  // Reuse cached dependency metadata by default so a lock refresh does not
  // fail just because an upstream registry hiccups during an unrelated review.
  const args = [
    "install",
    "--lock",
    target.lockPath,
    "--frozen=false",
  ];

  if (target.configPath !== undefined) {
    args.push("--config", target.configPath);
  }

  return args;
}

async function backupFileIfExists(
  path: string,
  backupPath: string,
): Promise<boolean> {
  await removeFileIfExists(backupPath);

  try {
    await Deno.copyFile(path, backupPath);
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return false;
    }

    throw error;
  }
}

async function removeFileIfExists(path: string): Promise<void> {
  try {
    await Deno.remove(path);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return;
    }

    throw error;
  }
}

async function regenerateLock(target: LockTarget): Promise<void> {
  console.log(`Regenerating ${target.label} lockfile at ${target.lockPath}`);

  const backupPath = `${target.lockPath}.bak`;
  const hadBackup = await backupFileIfExists(target.lockPath, backupPath);

  await removeFileIfExists(target.lockPath);
  const args = buildInstallArgs(target);

  const status = await new Deno.Command("deno", {
    args,
    cwd: REPO_ROOT,
    stdout: "inherit",
    stderr: "inherit",
  }).spawn().status;

  if (status.success) {
    await removeFileIfExists(backupPath);
    return;
  }

  if (hadBackup) {
    await Deno.copyFile(backupPath, target.lockPath);
  } else {
    await removeFileIfExists(target.lockPath);
  }

  await removeFileIfExists(backupPath);

  throw new Error(
    `deno install exited with code ${status.code} while regenerating ${target.label} lockfile`,
  );
}

if (import.meta.main) {
  await regenerateLock({
    label: "root",
    lockPath: ROOT_LOCK,
  });

  await regenerateLock({
    label: "frontend",
    lockPath: FRONTEND_LOCK,
    configPath: FRONTEND_CONFIG,
  });
}

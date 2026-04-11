import {
  collectFrontendFiles,
  collectRootLockFiles,
  FRONTEND_CONFIG,
  FRONTEND_LOCK,
  REPO_ROOT,
  ROOT_LOCK,
} from "./deno_graph.ts";

type LockTarget = Readonly<{
  files: readonly string[];
  label: string;
  lockPath: string;
  configPath?: string;
}>;

export function buildRefreshArgs(target: LockTarget): string[] {
  const args = [
    "check",
    "--lock",
    target.lockPath,
    "--frozen=false",
  ];

  if (target.configPath !== undefined) {
    args.push("--config", target.configPath);
  }

  args.push(...target.files);

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
  if (target.files.length === 0) {
    return;
  }

  console.log(`Regenerating ${target.label} lockfile at ${target.lockPath}`);

  const backupPath = `${target.lockPath}.bak`;
  const hadBackup = await backupFileIfExists(target.lockPath, backupPath);

  await removeFileIfExists(target.lockPath);
  const args = buildRefreshArgs(target);

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
    `deno check exited with code ${status.code} while regenerating ${target.label} lockfile`,
  );
}

if (import.meta.main) {
  await regenerateLock({
    files: await collectRootLockFiles(),
    label: "root",
    lockPath: ROOT_LOCK,
  });

  await regenerateLock({
    files: await collectFrontendFiles(),
    label: "frontend",
    lockPath: FRONTEND_LOCK,
    configPath: FRONTEND_CONFIG,
  });
}

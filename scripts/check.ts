import {
  collectFrontendFiles,
  collectRootCheckFiles,
  FRONTEND_CONFIG,
  REPO_ROOT,
} from "./deno_graph.ts";

async function runDenoCheck(
  files: readonly string[],
  configPath?: string,
  forwardArgs: readonly string[] = [],
): Promise<void> {
  if (files.length === 0) {
    return;
  }

  const args = ["check", ...forwardArgs];

  if (configPath !== undefined) {
    args.push("--config", configPath);
  }

  args.push(...files);

  const command = new Deno.Command("deno", {
    args,
    cwd: REPO_ROOT,
    stdout: "inherit",
    stderr: "inherit",
  });
  const status = await command.spawn().status;

  if (!status.success) {
    throw new Error(`deno check exited with code ${status.code}`);
  }
}

if (import.meta.main) {
  const forwardArgs = Deno.args.filter((arg) =>
    arg === "--watch" || arg.startsWith("--watch=")
  );

  await runDenoCheck(await collectRootCheckFiles(), undefined, forwardArgs);
  await runDenoCheck(
    await collectFrontendFiles(),
    FRONTEND_CONFIG,
    forwardArgs,
  );
}

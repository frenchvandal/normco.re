import { parseArgs } from "@std/cli";
import { createUsageError, hasHelpFlag } from "./_shared.ts";

const USAGE = [
  "Usage: deno run --allow-write scripts/ensure-dir.ts <directory>",
  "",
  "Arguments:",
  "  <directory>  Directory path to create recursively",
].join("\n");

function parseCliArgs(
  args: ReadonlyArray<string>,
): {
  showHelp: boolean;
  targetDir?: string;
} {
  if (hasHelpFlag(args)) {
    return { showHelp: true };
  }

  const parsedArgs = parseArgs(args);
  const targetDir = parsedArgs._[0];

  if (typeof targetDir !== "string" || targetDir.trim().length === 0) {
    throw createUsageError("Missing directory path argument", USAGE);
  }

  return { showHelp: false, targetDir };
}

async function main(): Promise<void> {
  const parsed = parseCliArgs(Deno.args);

  if (parsed.showHelp) {
    console.info(USAGE);
    return;
  }

  await Deno.mkdir(parsed.targetDir!, { recursive: true });
  console.info(`[ensure-dir] Ready: ${parsed.targetDir}`);
}

if (import.meta.main) {
  await main();
}

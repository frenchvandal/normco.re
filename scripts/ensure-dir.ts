import { parseArgs } from "@std/cli";

const parsedArgs = parseArgs(Deno.args);
const targetDir = parsedArgs._[0];

if (typeof targetDir !== "string" || targetDir.trim().length === 0) {
  throw new Error("Missing directory path argument");
}

await Deno.mkdir(targetDir, { recursive: true });
console.info(`[ensure-dir] Ready: ${targetDir}`);

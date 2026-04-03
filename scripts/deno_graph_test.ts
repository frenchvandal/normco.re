import { assert, assertEquals } from "@std/assert";

import {
  collectRootCheckFiles,
  collectRootLockEntrypoints,
  collectRootLockFiles,
} from "./deno_graph.ts";

Deno.test("collectRootLockFiles() keeps build entrypoints in the root lock graph", async () => {
  const checkFiles = await collectRootCheckFiles();
  const lockEntrypoints = await collectRootLockEntrypoints();
  const lockFiles = await collectRootLockFiles();
  const [lockEntrypoint] = lockEntrypoints;

  assert(checkFiles.includes("_config.ts"));
  assertEquals(lockEntrypoints.length, 1);
  assert(lockEntrypoint !== undefined);
  assert(lockEntrypoint.endsWith("/cli.ts"));
  assert(!checkFiles.includes(lockEntrypoint));
  assert(lockFiles.includes(lockEntrypoint));
  assertEquals(lockFiles.length, new Set(lockFiles).size);
});

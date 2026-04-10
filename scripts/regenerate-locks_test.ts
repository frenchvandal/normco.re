import { assertEquals } from "@std/assert";

import { buildInstallArgs } from "./regenerate-locks.ts";

Deno.test("buildInstallArgs() preserves root lock install args", () => {
  assertEquals(
    buildInstallArgs({
      label: "root",
      lockPath: "deno.lock",
    }),
    [
      "install",
      "--lock",
      "deno.lock",
      "--frozen=false",
    ],
  );
});

Deno.test("buildInstallArgs() includes config for frontend lock regeneration", () => {
  assertEquals(
    buildInstallArgs({
      label: "frontend",
      lockPath: "src/blog/client/deno.lock",
      configPath: "src/blog/client/deno.json",
    }),
    [
      "install",
      "--lock",
      "src/blog/client/deno.lock",
      "--frozen=false",
      "--config",
      "src/blog/client/deno.json",
    ],
  );
});

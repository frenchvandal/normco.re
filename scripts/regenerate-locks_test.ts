import { assertEquals } from "@std/assert";

import { buildCheckArgs } from "./regenerate-locks.ts";

Deno.test("buildCheckArgs() omits reload and preserves root lock args", () => {
  assertEquals(
    buildCheckArgs({
      label: "root",
      lockPath: "deno.lock",
      files: ["_config.ts", "scripts/check.ts"],
    }),
    [
      "check",
      "--lock",
      "deno.lock",
      "--frozen=false",
      "_config.ts",
      "scripts/check.ts",
    ],
  );
});

Deno.test("buildCheckArgs() includes config for frontend lock regeneration", () => {
  assertEquals(
    buildCheckArgs({
      label: "frontend",
      lockPath: "src/blog/client/deno.lock",
      files: ["src/blog/client/PostApp.tsx"],
      configPath: "src/blog/client/deno.json",
    }),
    [
      "check",
      "--lock",
      "src/blog/client/deno.lock",
      "--frozen=false",
      "--config",
      "src/blog/client/deno.json",
      "src/blog/client/PostApp.tsx",
    ],
  );
});

import { assertEquals } from "@std/assert";

import { buildCheckArgs } from "./check-locks.ts";

Deno.test("buildCheckArgs() preserves root frozen lock verification args", () => {
  assertEquals(
    buildCheckArgs({
      label: "root",
      lockPath: "deno.lock",
      files: ["_config.ts", "https://example.com/lume/cli.ts"],
    }),
    [
      "check",
      "--lock",
      "deno.lock",
      "--frozen",
      "_config.ts",
      "https://example.com/lume/cli.ts",
    ],
  );
});

Deno.test("buildCheckArgs() includes frontend config and lock path", () => {
  assertEquals(
    buildCheckArgs({
      label: "frontend",
      lockPath: "src/blog/client/deno.lock",
      configPath: "src/blog/client/deno.json",
      files: ["src/blog/client/archive-antd.ts"],
    }),
    [
      "check",
      "--lock",
      "src/blog/client/deno.lock",
      "--frozen",
      "--config",
      "src/blog/client/deno.json",
      "src/blog/client/archive-antd.ts",
    ],
  );
});

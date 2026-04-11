import { assertEquals } from "@std/assert";

import { buildRefreshArgs } from "./regenerate-locks.ts";

Deno.test("buildRefreshArgs() builds root lock check args", () => {
  assertEquals(
    buildRefreshArgs({
      files: ["src/index.page.tsx"],
      label: "root",
      lockPath: "deno.lock",
    }),
    [
      "check",
      "--lock",
      "deno.lock",
      "--frozen=false",
      "src/index.page.tsx",
    ],
  );
});

Deno.test("buildRefreshArgs() includes config for frontend lock regeneration", () => {
  assertEquals(
    buildRefreshArgs({
      configPath: "src/blog/client/deno.json",
      files: ["src/blog/client/main.tsx"],
      label: "frontend",
      lockPath: "src/blog/client/deno.lock",
    }),
    [
      "check",
      "--lock",
      "src/blog/client/deno.lock",
      "--frozen=false",
      "--config",
      "src/blog/client/deno.json",
      "src/blog/client/main.tsx",
    ],
  );
});

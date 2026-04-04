import { assertEquals } from "@std/assert";
import { join } from "@std/path";
import { describe, it } from "@std/testing/bdd";

function readJsonFile(path: string): Record<string, unknown> {
  return JSON.parse(Deno.readTextFileSync(path)) as Record<string, unknown>;
}

function getImportAlias(
  configPath: string,
  alias: string,
): string | undefined {
  const json = readJsonFile(configPath);
  const imports = json.imports;

  if (!imports || typeof imports !== "object") {
    return undefined;
  }

  const value = (imports as Record<string, unknown>)[alias];
  return typeof value === "string" ? value : undefined;
}

describe("Pretext config alignment", () => {
  it("keeps the npm/pretext alias in sync between the repo root and the frontend graph", () => {
    const repoRoot = Deno.cwd();
    const rootImportMapPath = join(repoRoot, "import_map.json");
    const blogClientConfigPath = join(repoRoot, "src/blog/client/deno.json");

    assertEquals(
      getImportAlias(rootImportMapPath, "npm/pretext"),
      getImportAlias(blogClientConfigPath, "npm/pretext"),
    );
  });
});

import {
  assert,
  assertEquals,
  assertFalse,
  assertStringIncludes,
} from "@std/assert";
import { join } from "@std/path";
import { describe, it } from "@std/testing/bdd";
import { withTempDir, writeTextTree } from "../test/temp_fs.ts";
import {
  collectOptionalAssetsToPrune,
  pruneBuildOutput,
  stripSourceMapComments,
} from "./prune-build-output.ts";

describe("stripSourceMapComments()", () => {
  it("removes JavaScript and CSS source map trailers", () => {
    const input = [
      "console.log('a');",
      "//# sourceMappingURL=./app.js.map",
      "body{color:red}",
      "/*# sourceMappingURL=./app.css.map */",
    ].join("\n");

    const output = stripSourceMapComments(input);

    assertFalse(output.includes("sourceMappingURL"));
    assertStringIncludes(output, "console.log('a');");
    assertStringIncludes(output, "body{color:red}");
  });
});

describe("collectOptionalAssetsToPrune()", () => {
  it("keeps optional pagefind assets when they are referenced", async () => {
    await withTempDir("prune-build-output-", async (rootDir) => {
      await writeTextTree(rootDir, {
        "index.html":
          '<script src="/pagefind/pagefind-modular-ui.js"></script>',
        "pagefind/pagefind-modular-ui.js": "export default true;",
      });

      const removable = await collectOptionalAssetsToPrune(rootDir);

      assertEquals(removable, []);
    });
  });
});

describe("pruneBuildOutput()", () => {
  it("strips source map comments, removes map files, and prunes unreferenced optional assets", async () => {
    await withTempDir("prune-build-output-", async (rootDir) => {
      const appJsPath = join(rootDir, "scripts/app.js");
      const appCssPath = join(rootDir, "styles/app.css");
      const jsMapPath = `${appJsPath}.map`;
      const cssMapPath = `${appCssPath}.map`;
      const highlightPath = join(rootDir, "pagefind/pagefind-highlight.js");
      const entryPath = join(rootDir, "pagefind/pagefind-entry.json");

      await writeTextTree(rootDir, {
        "index.html": '<script src="/scripts/app.js"></script>',
        "scripts/app.js":
          "console.log('ok');\n//# sourceMappingURL=./app.js.map\n",
        "scripts/app.js.map": "{}",
        "styles/app.css":
          "body{color:red}\n/*# sourceMappingURL=./app.css.map */\n",
        "styles/app.css.map": "{}",
        "pagefind/pagefind-highlight.js": "export default true;",
        "pagefind/pagefind-entry.json": '{"version":"1.0.0"}',
      });

      const summary = await pruneBuildOutput(rootDir);

      assert(summary.sourceMapOwnersUpdated.includes(appCssPath));
      assert(summary.sourceMapOwnersUpdated.includes(appJsPath));
      assert(summary.sourceMapFilesRemoved.includes(cssMapPath));
      assert(summary.sourceMapFilesRemoved.includes(jsMapPath));
      assert(summary.optionalAssetsRemoved.includes(highlightPath));
      assertFalse(summary.optionalAssetsRemoved.includes(entryPath));
      assertFalse(
        (await Deno.readTextFile(appJsPath)).includes("sourceMappingURL"),
      );
      assertFalse(
        (await Deno.readTextFile(appCssPath)).includes("sourceMappingURL"),
      );
      assertFalse(await exists(jsMapPath));
      assertFalse(await exists(cssMapPath));
      assertFalse(await exists(highlightPath));
      assert(await exists(entryPath));
    });
  });
});

async function exists(path: string): Promise<boolean> {
  try {
    await Deno.stat(path);
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return false;
    }

    throw error;
  }
}

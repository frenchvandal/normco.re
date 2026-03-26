import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import { fileExists, lineNumberAt } from "./_shared.ts";
import { withTempFile } from "../test/temp_fs.ts";

describe("fileExists()", () => {
  it("detects existing and missing files on disk", async () => {
    await withTempFile("scripts-shared-", async (filePath) => {
      assertEquals(await fileExists(filePath), true);
      assertEquals(await fileExists(`${filePath}.missing`), false);
    });
  });
});

describe("lineNumberAt()", () => {
  it("maps string indices to 1-based line numbers", () => {
    const source = "alpha\nbeta\ngamma";

    assertEquals(lineNumberAt(source, 0), 1);
    assertEquals(lineNumberAt(source, 6), 2);
    assertEquals(lineNumberAt(source, source.length - 1), 3);
  });
});

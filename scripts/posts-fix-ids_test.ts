import { assertEquals } from "@std/assert";
import { join } from "@std/path";
import { describe, it } from "@std/testing/bdd";
import {
  fixMissingPostIds,
  isPostMetadataFile,
  resolvePostMetadataId,
  upsertPostMetadataId,
} from "./posts-fix-ids.ts";
import { withTempDir, writeTextTree } from "../test/temp_fs.ts";

describe("resolvePostMetadataId()", () => {
  it("returns the shared post id when present", () => {
    assertEquals(
      resolvePostMetadataId(
        "id: 019d2978-aac3-7b06-b5c3-7d4c406f2911\ndate: 2026-03-10\n",
      ),
      "019d2978-aac3-7b06-b5c3-7d4c406f2911",
    );
  });

  it("treats blank ids as missing", () => {
    assertEquals(
      resolvePostMetadataId("id:   \ndate: 2026-03-10\n"),
      undefined,
    );
    assertEquals(resolvePostMetadataId("date: 2026-03-10\n"), undefined);
  });
});

describe("upsertPostMetadataId()", () => {
  it("prepends an id line when the metadata file has none", () => {
    assertEquals(
      upsertPostMetadataId(
        "date: 2026-03-10\nurl: /posts/example/\n",
        "uuid-1",
      ),
      "id: uuid-1\ndate: 2026-03-10\nurl: /posts/example/\n",
    );
  });

  it("replaces a blank id line in place", () => {
    assertEquals(
      upsertPostMetadataId("id:   \ndate: 2026-03-10\n", "uuid-2"),
      "id: uuid-2\ndate: 2026-03-10\n",
    );
  });

  it("leaves explicit ids untouched", () => {
    assertEquals(
      upsertPostMetadataId("id: existing-id\ndate: 2026-03-10\n", "ignored"),
      "id: existing-id\ndate: 2026-03-10\n",
    );
  });
});

describe("isPostMetadataFile()", () => {
  it("matches post `_data.yml` files only", () => {
    assertEquals(
      isPostMetadataFile("/repo/src/posts/example-post/_data.yml"),
      true,
    );
    assertEquals(isPostMetadataFile("/repo/src/posts/_data.ts"), false);
  });
});

describe("fixMissingPostIds()", () => {
  it("writes UUIDs only to post metadata files missing an explicit id", async () => {
    const generatedIds = [
      "019d2978-aac3-7b06-b5c3-7d4c406f2911",
      "019d2979-472f-7d0e-a4bb-2f9aa2509a2a",
    ];
    await withTempDir("posts-fix-ids-", async (rootDir) => {
      const postsDir = join(rootDir, "src", "posts");
      const missingIdPath = join(postsDir, "missing-id", "_data.yml");
      const blankIdPath = join(postsDir, "blank-id", "_data.yml");
      const existingIdPath = join(postsDir, "existing-id", "_data.yml");

      await writeTextTree(rootDir, {
        "src/posts/missing-id/_data.yml":
          "date: 2026-03-10\nurl: /posts/missing-id/\n",
        "src/posts/blank-id/_data.yml":
          "id:   \ndate: 2026-03-11\nurl: /posts/blank-id/\n",
        "src/posts/existing-id/_data.yml":
          "id: existing-id\ndate: 2026-03-12\nurl: /posts/existing-id/\n",
      });

      const fixedIds = await fixMissingPostIds(postsDir, {
        generateId: () => {
          const id = generatedIds.shift();

          if (id === undefined) {
            throw new Error("Expected another generated id");
          }

          return id;
        },
        log: () => {},
      });

      assertEquals(
        fixedIds.map(({ path, id }) => ({ path, id })),
        [
          {
            path: blankIdPath,
            id: "019d2978-aac3-7b06-b5c3-7d4c406f2911",
          },
          {
            path: missingIdPath,
            id: "019d2979-472f-7d0e-a4bb-2f9aa2509a2a",
          },
        ],
      );

      assertEquals(
        await Deno.readTextFile(blankIdPath),
        "id: 019d2978-aac3-7b06-b5c3-7d4c406f2911\ndate: 2026-03-11\nurl: /posts/blank-id/\n",
      );
      assertEquals(
        await Deno.readTextFile(missingIdPath),
        "id: 019d2979-472f-7d0e-a4bb-2f9aa2509a2a\ndate: 2026-03-10\nurl: /posts/missing-id/\n",
      );
      assertEquals(
        await Deno.readTextFile(existingIdPath),
        "id: existing-id\ndate: 2026-03-12\nurl: /posts/existing-id/\n",
      );
    });
  });
});

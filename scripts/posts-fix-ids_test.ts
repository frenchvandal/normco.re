import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  fixMissingPostIds,
  isPostMetadataFile,
  resolvePostMetadataId,
  upsertPostMetadataId,
} from "./posts-fix-ids.ts";

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
    const postsDir = "/repo/src/posts";
    const missingIdPath = `${postsDir}/missing-id/_data.yml`;
    const blankIdPath = `${postsDir}/blank-id/_data.yml`;
    const existingIdPath = `${postsDir}/existing-id/_data.yml`;
    const generatedIds = [
      "019d2978-aac3-7b06-b5c3-7d4c406f2911",
      "019d2979-472f-7d0e-a4bb-2f9aa2509a2a",
    ];
    const files = new Map<string, string>([
      [
        missingIdPath,
        "date: 2026-03-10\nurl: /posts/missing-id/\n",
      ],
      [
        blankIdPath,
        "id:   \ndate: 2026-03-11\nurl: /posts/blank-id/\n",
      ],
      [
        existingIdPath,
        "id: existing-id\ndate: 2026-03-12\nurl: /posts/existing-id/\n",
      ],
    ]);

    const fixedIds = await fixMissingPostIds(postsDir, {
      findMetadataFiles: () => Promise.resolve([...files.keys()].sort()),
      generateId: () => {
        const id = generatedIds.shift();

        if (id === undefined) {
          throw new Error("Expected another generated id");
        }

        return id;
      },
      log: () => {},
      readTextFile: (path) => {
        const source = files.get(path);

        if (source === undefined) {
          throw new Error(`Missing fixture for ${path}`);
        }

        return Promise.resolve(source);
      },
      writeTextFile: (path, data) => {
        files.set(path, data);
        return Promise.resolve();
      },
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
      files.get(blankIdPath),
      "id: 019d2978-aac3-7b06-b5c3-7d4c406f2911\ndate: 2026-03-11\nurl: /posts/blank-id/\n",
    );
    assertEquals(
      files.get(missingIdPath),
      "id: 019d2979-472f-7d0e-a4bb-2f9aa2509a2a\ndate: 2026-03-10\nurl: /posts/missing-id/\n",
    );
    assertEquals(
      files.get(existingIdPath),
      "id: existing-id\ndate: 2026-03-12\nurl: /posts/existing-id/\n",
    );
  });
});

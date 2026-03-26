import { assertEquals } from "@std/assert";
import { join } from "@std/path";
import { describe, it } from "@std/testing/bdd";

import {
  getAndroidContractAssetCopies,
  mapPostDetailAssetCopy,
  needsAndroidContractAssetWrite,
  syncAndroidContractAssets,
} from "./sync-android-contract-assets.ts";
import { withTempDir, writeTextTree } from "../test/temp_fs.ts";

describe("getAndroidContractAssetCopies()", () => {
  it("maps generated site contracts to Android bootstrap asset paths", () => {
    assertEquals(
      getAndroidContractAssetCopies(
        "/tmp/site",
        "/tmp/assets",
        [
          "/tmp/site/api/posts/example-post.json",
          "/tmp/site/fr/api/posts/example-post.json",
        ],
      ),
      [
        {
          source: "/tmp/site/api/app-manifest.json",
          destination: "/tmp/assets/app-manifest.json",
        },
        {
          source: "/tmp/site/api/posts/index.json",
          destination: "/tmp/assets/posts-index-en.json",
        },
        {
          source: "/tmp/site/fr/api/posts/index.json",
          destination: "/tmp/assets/posts-index-fr.json",
        },
        {
          source: "/tmp/site/zh-hans/api/posts/index.json",
          destination: "/tmp/assets/posts-index-zh-hans.json",
        },
        {
          source: "/tmp/site/zh-hant/api/posts/index.json",
          destination: "/tmp/assets/posts-index-zh-hant.json",
        },
        {
          source: "/tmp/site/api/posts/example-post.json",
          destination: "/tmp/assets/post-details/en/example-post.json",
        },
        {
          source: "/tmp/site/fr/api/posts/example-post.json",
          destination: "/tmp/assets/post-details/fr/example-post.json",
        },
      ],
    );
  });
});

describe("mapPostDetailAssetCopy()", () => {
  it("maps localized post-detail outputs into language-scoped Android assets", () => {
    assertEquals(
      mapPostDetailAssetCopy(
        "/tmp/site/zh-hans/api/posts/example-post.json",
        "/tmp/site",
        "/tmp/assets",
      ),
      {
        source: "/tmp/site/zh-hans/api/posts/example-post.json",
        destination: "/tmp/assets/post-details/zh-hans/example-post.json",
      },
    );
  });
});

describe("needsAndroidContractAssetWrite()", () => {
  it("ignores generatedAt-only churn for the mirrored app manifest", () => {
    assertEquals(
      needsAndroidContractAssetWrite(
        '{"version":"1","generatedAt":"2026-03-20T12:00:00Z","defaultLanguage":"en","languages":["en"],"postsIndex":[{"lang":"en","apiUrl":"/api/posts/index.json"}]}',
        '{"version":"1","generatedAt":"2026-03-21T12:00:00Z","defaultLanguage":"en","languages":["en"],"postsIndex":[{"lang":"en","apiUrl":"/api/posts/index.json"}]}',
        "/tmp/assets/app-manifest.json",
      ),
      false,
    );
  });

  it("still rewrites posts-index assets when payload content changes", () => {
    assertEquals(
      needsAndroidContractAssetWrite(
        '{"version":"1","lang":"en","items":[{"id":"one"}]}',
        '{"version":"1","lang":"en","items":[{"id":"two"}]}',
        "/tmp/assets/posts-index-en.json",
      ),
      true,
    );
  });
});

describe("syncAndroidContractAssets()", () => {
  it("copies generated contracts into Android assets while ignoring app-manifest timestamp churn", async () => {
    await withTempDir("android-contracts-", async (rootDir) => {
      const siteDir = join(rootDir, "site");
      const assetsDir = join(rootDir, "assets");

      await writeTextTree(rootDir, {
        "site/api/app-manifest.json":
          '{"version":"1","generatedAt":"2026-03-21T12:00:00Z","defaultLanguage":"en","languages":["en"],"postsIndex":[{"lang":"en","apiUrl":"/api/posts/index.json"}]}',
        "site/api/posts/index.json":
          '{"version":"1","lang":"en","items":[{"id":"one"}]}',
        "site/fr/api/posts/index.json":
          '{"version":"1","lang":"fr","items":[]}',
        "site/zh-hans/api/posts/index.json":
          '{"version":"1","lang":"zh-hans","items":[]}',
        "site/zh-hant/api/posts/index.json":
          '{"version":"1","lang":"zh-hant","items":[]}',
        "site/api/posts/example-post.json":
          '{"version":"1","id":"example-post"}',
        "assets/app-manifest.json":
          '{"version":"1","generatedAt":"2026-03-20T12:00:00Z","defaultLanguage":"en","languages":["en"],"postsIndex":[{"lang":"en","apiUrl":"/api/posts/index.json"}]}',
        "assets/posts-index-en.json":
          '{"version":"1","lang":"en","items":[{"id":"stale"}]}',
      });

      await syncAndroidContractAssets(siteDir, assetsDir);

      assertEquals(
        await Deno.readTextFile(join(assetsDir, "app-manifest.json")),
        '{"version":"1","generatedAt":"2026-03-20T12:00:00Z","defaultLanguage":"en","languages":["en"],"postsIndex":[{"lang":"en","apiUrl":"/api/posts/index.json"}]}',
      );
      assertEquals(
        await Deno.readTextFile(join(assetsDir, "posts-index-en.json")),
        '{"version":"1","lang":"en","items":[{"id":"one"}]}',
      );
      assertEquals(
        await Deno.readTextFile(
          join(assetsDir, "post-details", "en", "example-post.json"),
        ),
        '{"version":"1","id":"example-post"}',
      );
    });
  });
});

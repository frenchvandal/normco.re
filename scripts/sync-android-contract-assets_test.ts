import { assertEquals } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import {
  getAndroidContractAssetCopies,
  needsAndroidContractAssetWrite,
} from "./sync-android-contract-assets.ts";

describe("getAndroidContractAssetCopies()", () => {
  it("maps generated site contracts to Android bootstrap asset paths", () => {
    assertEquals(
      getAndroidContractAssetCopies("/tmp/site", "/tmp/assets"),
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
      ],
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

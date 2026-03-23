import { assertEquals, assertThrows } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import {
  resolveCmsProdBranch,
  resolveCurrentDateIso,
  resolveSlug,
} from "./src/utils/cms.ts";

describe("resolveSlug", () => {
  it("normalizes valid slugs through slugify", () => {
    assertEquals(resolveSlug("Crème brûlée"), "creme-brulee");
  });

  it("rejects empty slug values", () => {
    assertThrows(() => resolveSlug("   "), Error, "Post slug is required.");
  });

  it("rejects values that become empty after normalization", () => {
    assertThrows(
      () => resolveSlug("你好"),
      Error,
      'Post slug "你好" is invalid after normalization.',
    );
  });
});

describe("resolveCurrentDateIso", () => {
  it("returns the provided Temporal plain date", () => {
    const plainDate = {
      toString: () => "2026-03-20",
    } as Temporal.PlainDate;

    assertEquals(
      resolveCurrentDateIso({
        plainDateISO: () => plainDate,
      }),
      "2026-03-20",
    );
  });

  it("uses the runtime Temporal clock by default", () => {
    assertEquals(
      resolveCurrentDateIso(),
      Temporal.Now.plainDateISO().toString(),
    );
  });
});

describe("resolveCmsProdBranch", () => {
  it("returns the configured branch when CMS_PROD_BRANCH is set", () => {
    assertEquals(
      resolveCmsProdBranch({
        get: (key) => key === "CMS_PROD_BRANCH" ? "main" : undefined,
      }),
      "main",
    );
  });

  it("falls back to the repository default branch when unset", () => {
    assertEquals(
      resolveCmsProdBranch({
        get: () => undefined,
      }),
      "master",
    );
  });

  it("falls back to the repository default branch when env access throws", () => {
    assertEquals(
      resolveCmsProdBranch({
        get: () => {
          throw new Error("env access denied");
        },
      }),
      "master",
    );
  });
});

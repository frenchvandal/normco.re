import { assertEquals, assertThrows } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import {
  resolveCmsProdBranch,
  resolveCurrentDateIso,
  resolveSlug,
} from "./_cms.ts";

const LOCAL_NOON = new Date(2026, 2, 16, 12, 0, 0, 0);

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
  it("prefers Temporal when available", () => {
    assertEquals(
      resolveCurrentDateIso(
        LOCAL_NOON,
        {
          Now: {
            plainDateISO: () => ({ toString: () => "2026-03-20" }),
          },
        },
      ),
      "2026-03-20",
    );
  });

  it("falls back to the local Date components when Temporal is unavailable", () => {
    assertEquals(
      resolveCurrentDateIso(LOCAL_NOON, {}),
      "2026-03-16",
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

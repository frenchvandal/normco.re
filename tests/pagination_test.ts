/**
 * Tests for pagination utilities
 *
 * @module tests/pagination_test
 */

import { assertEquals, assertStrictEquals } from "@std/assert";

import {
  createPaginationUrl,
  isFirstPage,
} from "../src/_utilities/pagination.ts";

// =============================================================================
// createPaginationUrl Tests
// =============================================================================

Deno.test("createPaginationUrl", async (t) => {
  await t.step("returns a function", () => {
    const toUrl = createPaginationUrl("/archive");
    assertEquals(typeof toUrl, "function");
  });

  await t.step("handles first page (page 1)", async (t) => {
    await t.step("returns base URL with trailing slash for /archive", () => {
      const toUrl = createPaginationUrl("/archive");
      assertEquals(toUrl(1), "/archive/");
    });

    await t.step("returns base URL with trailing slash for /archive/", () => {
      const toUrl = createPaginationUrl("/archive/");
      assertEquals(toUrl(1), "/archive/");
    });

    await t.step("returns / for root path", () => {
      const toUrl = createPaginationUrl("/");
      assertEquals(toUrl(1), "/");
    });

    await t.step("returns / for empty string", () => {
      const toUrl = createPaginationUrl("");
      assertEquals(toUrl(1), "/");
    });
  });

  await t.step("handles subsequent pages (page > 1)", async (t) => {
    await t.step("appends page number for page 2", () => {
      const toUrl = createPaginationUrl("/archive");
      assertEquals(toUrl(2), "/archive/2/");
    });

    await t.step("appends page number for page 10", () => {
      const toUrl = createPaginationUrl("/archive");
      assertEquals(toUrl(10), "/archive/10/");
    });

    await t.step("appends page number for page 100", () => {
      const toUrl = createPaginationUrl("/archive");
      assertEquals(toUrl(100), "/archive/100/");
    });

    await t.step("works with trailing slash base URL", () => {
      const toUrl = createPaginationUrl("/archive/");
      assertEquals(toUrl(3), "/archive/3/");
    });

    await t.step("works with root path", () => {
      const toUrl = createPaginationUrl("/");
      assertEquals(toUrl(2), "/2/");
    });
  });

  await t.step("handles nested paths", async (t) => {
    await t.step("handles two-level nesting", () => {
      const toUrl = createPaginationUrl("/archive/tags");
      assertEquals(toUrl(1), "/archive/tags/");
      assertEquals(toUrl(2), "/archive/tags/2/");
    });

    await t.step("handles three-level nesting", () => {
      const toUrl = createPaginationUrl("/archive/tags/typescript");
      assertEquals(toUrl(1), "/archive/tags/typescript/");
      assertEquals(toUrl(5), "/archive/tags/typescript/5/");
    });
  });

  await t.step("normalizes multiple trailing slashes", () => {
    const toUrl = createPaginationUrl("/archive///");
    assertEquals(toUrl(1), "/archive/");
    assertEquals(toUrl(2), "/archive/2/");
  });
});

// =============================================================================
// isFirstPage Tests
// =============================================================================

Deno.test("isFirstPage", async (t) => {
  await t.step("returns true for page 1", () => {
    assertStrictEquals(isFirstPage(1), true);
  });

  await t.step("returns false for page 0", () => {
    assertStrictEquals(isFirstPage(0), false);
  });

  await t.step("returns false for negative numbers", async (t) => {
    await t.step("page -1", () => {
      assertStrictEquals(isFirstPage(-1), false);
    });

    await t.step("page -100", () => {
      assertStrictEquals(isFirstPage(-100), false);
    });
  });

  await t.step("returns false for pages greater than 1", async (t) => {
    await t.step("page 2", () => {
      assertStrictEquals(isFirstPage(2), false);
    });

    await t.step("page 100", () => {
      assertStrictEquals(isFirstPage(100), false);
    });
  });
});

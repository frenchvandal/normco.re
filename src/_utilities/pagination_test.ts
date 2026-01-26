/**
 * Tests for pagination utilities
 *
 * @module src/_utilities/pagination_test
 */

import { assertEquals, assertStrictEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import { createPaginationUrl, isFirstPage } from "./pagination.ts";

// =============================================================================
// createPaginationUrl Tests
// =============================================================================

describe("createPaginationUrl", () => {
  it("should return a function", () => {
    const toUrl = createPaginationUrl("/archive");
    assertEquals(typeof toUrl, "function");
  });

  describe("first page (page 1)", () => {
    it("should return base URL with trailing slash for /archive", () => {
      const toUrl = createPaginationUrl("/archive");
      assertEquals(toUrl(1), "/archive/");
    });

    it("should return base URL with trailing slash for /archive/", () => {
      const toUrl = createPaginationUrl("/archive/");
      assertEquals(toUrl(1), "/archive/");
    });

    it("should return / for root path", () => {
      const toUrl = createPaginationUrl("/");
      assertEquals(toUrl(1), "/");
    });

    it("should return / for empty string", () => {
      const toUrl = createPaginationUrl("");
      assertEquals(toUrl(1), "/");
    });
  });

  describe("subsequent pages (page > 1)", () => {
    it("should append page number for page 2", () => {
      const toUrl = createPaginationUrl("/archive");
      assertEquals(toUrl(2), "/archive/2/");
    });

    it("should append page number for page 10", () => {
      const toUrl = createPaginationUrl("/archive");
      assertEquals(toUrl(10), "/archive/10/");
    });

    it("should append page number for page 100", () => {
      const toUrl = createPaginationUrl("/archive");
      assertEquals(toUrl(100), "/archive/100/");
    });

    it("should work with trailing slash base URL", () => {
      const toUrl = createPaginationUrl("/archive/");
      assertEquals(toUrl(3), "/archive/3/");
    });

    it("should work with root path", () => {
      const toUrl = createPaginationUrl("/");
      assertEquals(toUrl(2), "/2/");
    });
  });

  describe("nested paths", () => {
    it("should handle two-level nesting", () => {
      const toUrl = createPaginationUrl("/archive/tags");
      assertEquals(toUrl(1), "/archive/tags/");
      assertEquals(toUrl(2), "/archive/tags/2/");
    });

    it("should handle three-level nesting", () => {
      const toUrl = createPaginationUrl("/archive/tags/typescript");
      assertEquals(toUrl(1), "/archive/tags/typescript/");
      assertEquals(toUrl(5), "/archive/tags/typescript/5/");
    });
  });

  describe("edge cases", () => {
    it("should normalize multiple trailing slashes", () => {
      const toUrl = createPaginationUrl("/archive///");
      assertEquals(toUrl(1), "/archive/");
      assertEquals(toUrl(2), "/archive/2/");
    });
  });
});

// =============================================================================
// isFirstPage Tests
// =============================================================================

describe("isFirstPage", () => {
  it("should return true for page 1", () => {
    assertStrictEquals(isFirstPage(1), true);
  });

  it("should return false for page 0", () => {
    assertStrictEquals(isFirstPage(0), false);
  });

  describe("negative numbers", () => {
    it("should return false for page -1", () => {
      assertStrictEquals(isFirstPage(-1), false);
    });

    it("should return false for page -100", () => {
      assertStrictEquals(isFirstPage(-100), false);
    });
  });

  describe("pages greater than 1", () => {
    it("should return false for page 2", () => {
      assertStrictEquals(isFirstPage(2), false);
    });

    it("should return false for page 100", () => {
      assertStrictEquals(isFirstPage(100), false);
    });
  });
});

/**
 * Tests for search utilities
 *
 * @module tests/search_test
 */

import { assertEquals, assertStringIncludes } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import {
  allPostsQuery,
  byAuthorQuery,
  byTagQuery,
  firstPageQuery,
} from "../src/_utilities/search.ts";

// =============================================================================
// allPostsQuery Tests
// =============================================================================

describe("allPostsQuery", () => {
  it("should be a string constant", () => {
    assertEquals(typeof allPostsQuery, "string");
  });

  it("should query for posts", () => {
    assertEquals(allPostsQuery, "type=post");
  });

  it("should include type=post filter", () => {
    assertStringIncludes(allPostsQuery, "type=post");
  });
});

// =============================================================================
// byTagQuery Tests
// =============================================================================

describe("byTagQuery", () => {
  describe("basic functionality", () => {
    it("should return a query string containing the tag", () => {
      const result = byTagQuery("typescript");
      assertStringIncludes(result, "typescript");
    });

    it("should include type=post in the query", () => {
      const result = byTagQuery("typescript");
      assertStringIncludes(result, "type=post");
    });

    it("should wrap tag in single quotes", () => {
      const result = byTagQuery("typescript");
      assertStringIncludes(result, "'typescript'");
    });
  });

  describe("tag formats", () => {
    it("should handle hyphenated tags", () => {
      assertEquals(byTagQuery("design-system"), "type=post 'design-system'");
    });

    it("should handle tags with spaces", () => {
      assertEquals(byTagQuery("design system"), "type=post 'design system'");
    });

    it("should handle tags with special characters", () => {
      assertEquals(byTagQuery("ux/ui"), "type=post 'ux/ui'");
    });

    it("should handle single-word tags", () => {
      assertEquals(byTagQuery("javascript"), "type=post 'javascript'");
    });

    it("should handle numeric tags", () => {
      assertEquals(byTagQuery("2024"), "type=post '2024'");
    });

    it("should handle empty tag", () => {
      assertEquals(byTagQuery(""), "type=post ''");
    });
  });

  describe("real-world tags", () => {
    const realTags = [
      { tag: "typescript", expected: "type=post 'typescript'" },
      { tag: "web-development", expected: "type=post 'web-development'" },
      { tag: "CSS", expected: "type=post 'CSS'" },
      { tag: "Deno 2.0", expected: "type=post 'Deno 2.0'" },
    ];

    realTags.forEach(({ tag, expected }) => {
      it(`should handle tag "${tag}"`, () => {
        assertEquals(byTagQuery(tag), expected);
      });
    });
  });
});

// =============================================================================
// byAuthorQuery Tests
// =============================================================================

describe("byAuthorQuery", () => {
  describe("basic functionality", () => {
    it("should return a query string containing the author", () => {
      const result = byAuthorQuery("John");
      assertStringIncludes(result, "John");
    });

    it("should include type=post in the query", () => {
      const result = byAuthorQuery("John");
      assertStringIncludes(result, "type=post");
    });

    it("should use author= syntax", () => {
      const result = byAuthorQuery("John");
      assertStringIncludes(result, "author=");
    });
  });

  describe("author name formats", () => {
    it("should handle single name", () => {
      assertEquals(byAuthorQuery("Phiphi"), "type=post author='Phiphi'");
    });

    it("should handle full name with space", () => {
      assertEquals(
        byAuthorQuery("Phiphi Duval"),
        "type=post author='Phiphi Duval'",
      );
    });

    it("should handle names with multiple parts", () => {
      assertEquals(
        byAuthorQuery("Jean-Pierre Dupont"),
        "type=post author='Jean-Pierre Dupont'",
      );
    });

    it("should handle empty author", () => {
      assertEquals(byAuthorQuery(""), "type=post author=''");
    });
  });

  describe("query structure", () => {
    it("should start with type=post", () => {
      const result = byAuthorQuery("Test");
      assertEquals(result.startsWith("type=post"), true);
    });

    it("should have author filter after type", () => {
      const result = byAuthorQuery("Test");
      const parts = result.split(" ");
      assertEquals(parts[0], "type=post");
      assertEquals(parts[1].startsWith("author="), true);
    });
  });
});

// =============================================================================
// firstPageQuery Tests
// =============================================================================

describe("firstPageQuery", () => {
  describe("basic functionality", () => {
    it("should include pagination.page=1", () => {
      const result = firstPageQuery("tag");
      assertStringIncludes(result, "pagination.page=1");
    });

    it("should include the type filter", () => {
      const result = firstPageQuery("tag");
      assertStringIncludes(result, "type=tag");
    });
  });

  describe("page types", () => {
    it("should handle tag type", () => {
      assertEquals(firstPageQuery("tag"), "type=tag pagination.page=1");
    });

    it("should handle author type", () => {
      assertEquals(firstPageQuery("author"), "type=author pagination.page=1");
    });

    it("should handle post type", () => {
      assertEquals(firstPageQuery("post"), "type=post pagination.page=1");
    });

    it("should handle page type", () => {
      assertEquals(firstPageQuery("page"), "type=page pagination.page=1");
    });

    it("should handle custom types", () => {
      assertEquals(firstPageQuery("custom"), "type=custom pagination.page=1");
    });

    it("should handle empty type", () => {
      assertEquals(firstPageQuery(""), "type= pagination.page=1");
    });
  });

  describe("query structure", () => {
    it("should have type filter first", () => {
      const result = firstPageQuery("test");
      assertEquals(result.startsWith("type="), true);
    });

    it("should have pagination filter second", () => {
      const result = firstPageQuery("test");
      const parts = result.split(" ");
      assertEquals(parts.length, 2);
      assertEquals(parts[1], "pagination.page=1");
    });
  });
});

// =============================================================================
// Integration Tests
// =============================================================================

describe("search query integration", () => {
  it("all queries should be valid strings", () => {
    assertEquals(typeof allPostsQuery, "string");
    assertEquals(typeof byTagQuery("test"), "string");
    assertEquals(typeof byAuthorQuery("test"), "string");
    assertEquals(typeof firstPageQuery("test"), "string");
  });

  it("all post-related queries should include type=post", () => {
    assertStringIncludes(allPostsQuery, "type=post");
    assertStringIncludes(byTagQuery("test"), "type=post");
    assertStringIncludes(byAuthorQuery("test"), "type=post");
  });

  it("queries should not have trailing spaces", () => {
    assertEquals(allPostsQuery.trim(), allPostsQuery);
    assertEquals(byTagQuery("test").trim(), byTagQuery("test"));
    assertEquals(byAuthorQuery("test").trim(), byAuthorQuery("test"));
    assertEquals(firstPageQuery("test").trim(), firstPageQuery("test"));
  });
});

/**
 * Tests for internationalization data
 *
 * @module src/_data/i18n_test
 */

import { assertEquals, assertExists, assertStringIncludes } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import i18n from "./i18n.ts";

// =============================================================================
// Structure Tests
// =============================================================================

describe("i18n - structure", () => {
  it("should be defined", () => {
    assertExists(i18n);
  });

  it("should be an object", () => {
    assertEquals(typeof i18n, "object");
  });

  it("should have nav section", () => {
    assertExists(i18n.nav);
  });

  it("should have post section", () => {
    assertExists(i18n.post);
  });

  it("should have search section", () => {
    assertExists(i18n.search);
  });

  it("should have source section", () => {
    assertExists(i18n.source);
  });
});

// =============================================================================
// Navigation Strings Tests
// =============================================================================

describe("i18n.nav", () => {
  it("should have toc string", () => {
    assertExists(i18n.nav.toc);
    assertEquals(typeof i18n.nav.toc, "string");
  });

  it("should have next_post string", () => {
    assertExists(i18n.nav.next_post);
    assertEquals(typeof i18n.nav.next_post, "string");
  });

  it("should have previous_post string", () => {
    assertExists(i18n.nav.previous_post);
    assertEquals(typeof i18n.nav.previous_post, "string");
  });

  it("should have continue_reading string", () => {
    assertExists(i18n.nav.continue_reading);
    assertEquals(typeof i18n.nav.continue_reading, "string");
  });

  it("should have archive_title string", () => {
    assertExists(i18n.nav.archive_title);
    assertEquals(i18n.nav.archive_title, "Archive");
  });

  it("should have archive string with link", () => {
    assertExists(i18n.nav.archive);
    assertStringIncludes(i18n.nav.archive, "/archive/");
  });

  it("should have back string", () => {
    assertExists(i18n.nav.back);
    assertEquals(typeof i18n.nav.back, "string");
  });

  it("should have page string", () => {
    assertExists(i18n.nav.page);
    assertEquals(i18n.nav.page, "Page");
  });

  it("should have next string", () => {
    assertExists(i18n.nav.next);
    assertEquals(typeof i18n.nav.next, "string");
  });

  it("should have previous string", () => {
    assertExists(i18n.nav.previous);
    assertEquals(typeof i18n.nav.previous, "string");
  });

  it("should have home string", () => {
    assertExists(i18n.nav.home);
    assertEquals(i18n.nav.home, "Home");
  });

  it("should have posts string", () => {
    assertExists(i18n.nav.posts);
    assertEquals(i18n.nav.posts, "Posts");
  });
});

// =============================================================================
// Post Strings Tests
// =============================================================================

describe("i18n.post", () => {
  it("should have by string", () => {
    assertExists(i18n.post.by);
    assertEquals(typeof i18n.post.by, "string");
  });

  it("should have reading_time string", () => {
    assertExists(i18n.post.reading_time);
    assertEquals(typeof i18n.post.reading_time, "string");
  });

  it("by string should end with space for concatenation", () => {
    assertEquals(i18n.post.by.endsWith(" "), true);
  });
});

// =============================================================================
// Search Strings Tests
// =============================================================================

describe("i18n.search", () => {
  it("should have by_author string", () => {
    assertExists(i18n.search.by_author);
    assertEquals(typeof i18n.search.by_author, "string");
  });

  it("should have by_tag string", () => {
    assertExists(i18n.search.by_tag);
    assertEquals(typeof i18n.search.by_tag, "string");
  });

  it("should have tags string", () => {
    assertExists(i18n.search.tags);
    assertEquals(i18n.search.tags, "Tags");
  });

  it("should have authors string", () => {
    assertExists(i18n.search.authors);
    assertEquals(i18n.search.authors, "Authors");
  });
});

// =============================================================================
// Source Strings Tests
// =============================================================================

describe("i18n.source", () => {
  it("should have view_source string", () => {
    assertExists(i18n.source.view_source);
    assertEquals(i18n.source.view_source, "View source");
  });

  it("should have revision string", () => {
    assertExists(i18n.source.revision);
    assertEquals(i18n.source.revision, "rev");
  });
});

// =============================================================================
// Consistency Tests
// =============================================================================

describe("i18n - consistency", () => {
  it("all values should be non-empty strings", () => {
    const checkStrings = (obj: Record<string, unknown>, path = ""): void => {
      for (const [key, value] of Object.entries(obj)) {
        const fullPath = path ? `${path}.${key}` : key;
        if (typeof value === "object" && value !== null) {
          checkStrings(value as Record<string, unknown>, fullPath);
        } else {
          assertEquals(typeof value, "string", `${fullPath} should be string`);
          assertEquals(value !== "", true, `${fullPath} should not be empty`);
        }
      }
    };

    checkStrings(i18n as unknown as Record<string, unknown>);
  });

  it("navigation arrows should use consistent symbols", () => {
    const leftArrow = "←";
    const rightArrow = "→";

    assertStringIncludes(i18n.nav.previous_post, leftArrow);
    assertStringIncludes(i18n.nav.next_post, rightArrow);
    assertStringIncludes(i18n.nav.continue_reading, rightArrow);
    assertStringIncludes(i18n.nav.back, leftArrow);
  });
});

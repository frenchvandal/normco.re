/**
 * Tests for configuration constants
 *
 * @module tests/data/constants_test
 */

import { assertEquals, assertExists } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import { ARCHIVE_MENU, PAGINATION_SIZE } from "../../src/_config/constants.ts";

// =============================================================================
// PAGINATION_SIZE Tests
// =============================================================================

describe("PAGINATION_SIZE", () => {
  it("should be defined", () => {
    assertExists(PAGINATION_SIZE);
  });

  it("should be a number", () => {
    assertEquals(typeof PAGINATION_SIZE, "number");
  });

  it("should be positive", () => {
    assertEquals(PAGINATION_SIZE > 0, true);
  });

  it("should be a reasonable pagination size", () => {
    assertEquals(PAGINATION_SIZE >= 5, true);
    assertEquals(PAGINATION_SIZE <= 50, true);
  });

  it("should equal 10", () => {
    assertEquals(PAGINATION_SIZE, 10);
  });
});

// =============================================================================
// ARCHIVE_MENU Tests
// =============================================================================

describe("ARCHIVE_MENU", () => {
  it("should be defined", () => {
    assertExists(ARCHIVE_MENU);
  });

  it("should be an object", () => {
    assertEquals(typeof ARCHIVE_MENU, "object");
  });

  it("should have visible property", () => {
    assertExists(ARCHIVE_MENU.visible);
  });

  it("should have visible set to true", () => {
    assertEquals(ARCHIVE_MENU.visible, true);
  });

  it("should have order property", () => {
    assertExists(ARCHIVE_MENU.order);
  });

  it("should have order set to 1", () => {
    assertEquals(ARCHIVE_MENU.order, 1);
  });

  it("should be immutable (const assertion)", () => {
    // TypeScript ensures this at compile time with "as const"
    // At runtime we verify the values are correct
    assertEquals(Object.keys(ARCHIVE_MENU).length, 2);
    assertEquals(Object.keys(ARCHIVE_MENU).includes("visible"), true);
    assertEquals(Object.keys(ARCHIVE_MENU).includes("order"), true);
  });
});

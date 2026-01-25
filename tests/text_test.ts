/**
 * Tests for text utilities
 *
 * @module tests/text_test
 */

import { assertEquals, assertStrictEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import { slugify } from "../src/_utilities/text.ts";

// =============================================================================
// slugify Tests using BDD style
// =============================================================================

describe("slugify", () => {
  describe("basic transformations", () => {
    it("should trim whitespace and lowercase", () => {
      assertEquals(slugify("  Hello World  "), "hello-world");
    });

    it("should convert spaces to hyphens", () => {
      assertEquals(slugify("Hello World"), "hello-world");
    });

    it("should lowercase all characters", () => {
      assertEquals(slugify("HELLO"), "hello");
      assertEquals(slugify("HeLLo WoRLd"), "hello-world");
    });
  });

  describe("punctuation handling", () => {
    it("should strip punctuation", () => {
      assertEquals(slugify("Hello, world!!!"), "hello-world");
    });

    it("should remove special characters", () => {
      assertEquals(slugify("Hello@World#Test"), "helloworldtest");
    });

    it("should handle apostrophes", () => {
      assertEquals(slugify("it's a test"), "its-a-test");
    });

    it("should handle periods", () => {
      assertEquals(slugify("hello.world"), "helloworld");
    });

    it("should handle underscores", () => {
      assertEquals(slugify("hello_world"), "helloworld");
    });

    it("should handle parentheses", () => {
      assertEquals(slugify("hello (world)"), "hello-world");
    });

    it("should handle brackets", () => {
      assertEquals(slugify("hello [world]"), "hello-world");
    });
  });

  describe("whitespace handling", () => {
    it("should collapse multiple spaces", () => {
      assertEquals(slugify("Multiple   spaces"), "multiple-spaces");
    });

    it("should handle tabs", () => {
      assertEquals(slugify("Hello\tWorld"), "hello-world");
    });

    it("should handle newlines", () => {
      assertEquals(slugify("Hello\nWorld"), "hello-world");
    });

    it("should handle mixed whitespace", () => {
      assertEquals(slugify("Hello \t\n World"), "hello-world");
    });
  });

  describe("accent normalization", () => {
    it("should normalize French accents", () => {
      assertEquals(slugify("Crème brûlée"), "creme-brulee");
      assertEquals(slugify("éléphant"), "elephant");
      assertEquals(slugify("à côté"), "a-cote");
    });

    it("should normalize Portuguese accents", () => {
      assertEquals(slugify("São Paulo"), "sao-paulo");
      assertEquals(slugify("maçã"), "maca");
    });

    it("should normalize German umlauts", () => {
      assertEquals(slugify("Über"), "uber");
      assertEquals(slugify("Müller"), "muller");
    });

    it("should normalize Spanish accents", () => {
      assertEquals(slugify("señor"), "senor");
      assertEquals(slugify("niño"), "nino");
    });

    it("should normalize multiple accents in one word", () => {
      assertEquals(slugify("résumé"), "resume");
    });
  });

  describe("hyphen handling", () => {
    it("should collapse duplicate hyphens", () => {
      assertEquals(slugify("Hello -- world"), "hello-world");
      assertEquals(slugify("Hello --- world"), "hello-world");
    });

    it("should remove leading hyphens", () => {
      assertEquals(slugify("--Hello world"), "hello-world");
    });

    it("should remove trailing hyphens", () => {
      assertEquals(slugify("Hello world--"), "hello-world");
    });

    it("should remove leading and trailing hyphens", () => {
      assertEquals(slugify("--Hello world--"), "hello-world");
      assertEquals(slugify(" - Hello world - "), "hello-world");
    });

    it("should handle hyphens with spaces", () => {
      assertEquals(slugify("hello - world"), "hello-world");
    });
  });

  describe("edge cases", () => {
    it("should return empty string for blank input", () => {
      assertEquals(slugify("   "), "");
    });

    it("should return empty string for empty string", () => {
      assertEquals(slugify(""), "");
    });

    it("should return empty string for only special characters", () => {
      assertEquals(slugify("@#$%^&*"), "");
    });

    it("should return empty string for only hyphens", () => {
      assertEquals(slugify("---"), "");
    });

    it("should handle numbers", () => {
      assertEquals(slugify("Test 123"), "test-123");
      assertEquals(slugify("123"), "123");
    });

    it("should handle mixed numbers and letters", () => {
      assertEquals(slugify("2024 New Year"), "2024-new-year");
    });

    it("should handle very long strings", () => {
      const longString = "A".repeat(100) + " " + "B".repeat(100);
      const expected = "a".repeat(100) + "-" + "b".repeat(100);
      assertEquals(slugify(longString), expected);
    });
  });

  describe("real-world examples", () => {
    it("should handle blog post titles", () => {
      assertEquals(
        slugify("How to Build a Blog with Deno"),
        "how-to-build-a-blog-with-deno",
      );
    });

    it("should handle technical terms", () => {
      assertEquals(
        slugify("TypeScript 5.0 Features"),
        "typescript-50-features",
      );
    });

    it("should handle questions", () => {
      assertEquals(slugify("What is Deno?"), "what-is-deno");
    });

    it("should handle quotes in titles", () => {
      assertEquals(slugify("The 'Best' Way"), "the-best-way");
    });
  });
});

// =============================================================================
// Additional Deno.test style tests for comparison
// =============================================================================

Deno.test("slugify - returns consistent type", () => {
  const result = slugify("test");
  assertStrictEquals(typeof result, "string");
});

Deno.test("slugify - is idempotent", () => {
  const input = "Hello World Test";
  const firstPass = slugify(input);
  const secondPass = slugify(firstPass);
  assertEquals(firstPass, secondPass);
});

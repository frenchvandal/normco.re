import { assertEquals } from "@std/assert";

import { slugify } from "../src/_utilities/text.ts";

Deno.test("slugify trims and lowercases", () => {
  assertEquals(slugify("  Hello World  "), "hello-world");
});

Deno.test("slugify strips punctuation and collapses whitespace", () => {
  assertEquals(slugify("Hello, world!!!"), "hello-world");
  assertEquals(slugify("Multiple   spaces"), "multiple-spaces");
});

Deno.test("slugify normalizes accents", () => {
  assertEquals(slugify("Crème brûlée"), "creme-brulee");
  assertEquals(slugify("São Paulo"), "sao-paulo");
});

Deno.test("slugify collapses duplicate hyphens", () => {
  assertEquals(slugify("Hello -- world"), "hello-world");
});

Deno.test("slugify removes leading and trailing hyphens", () => {
  assertEquals(slugify("--Hello world--"), "hello-world");
  assertEquals(slugify(" - Hello world - "), "hello-world");
});

Deno.test("slugify returns an empty string for blank input", () => {
  assertEquals(slugify("   "), "");
});

import { assertEquals } from "@std/assert";

import { slugify } from "../src/_utilities/text.ts";

Deno.test("slugify trims and lowercases", () => {
  assertEquals(slugify("  Hello World  "), "hello-world");
});

Deno.test("slugify strips punctuation and collapses whitespace", () => {
  assertEquals(slugify("Hello, world!!!"), "hello-world");
  assertEquals(slugify("Multiple   spaces"), "multiple-spaces");
});

Deno.test("slugify collapses duplicate hyphens", () => {
  assertEquals(slugify("Hello -- world"), "hello-world");
});

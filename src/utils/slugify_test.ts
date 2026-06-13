import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import { slugify } from "./slugify.ts";

describe("slugify()", () => {
  it("normalizes accents and punctuation", () => {
    assertEquals(slugify("Crème brûlée!"), "creme-brulee");
  });

  it("collapses repeated spaces and dashes", () => {
    assertEquals(slugify("hello   --   world"), "hello-world");
  });

  it("trims surrounding whitespace", () => {
    assertEquals(slugify("  one two  "), "one-two");
  });

  it("trims leading and trailing dashes", () => {
    assertEquals(slugify("& Design"), "design");
    assertEquals(slugify("Note —"), "note");
    assertEquals(slugify("--hello--"), "hello");
  });
});

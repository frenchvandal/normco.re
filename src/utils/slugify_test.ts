import { assertEquals } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

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
});

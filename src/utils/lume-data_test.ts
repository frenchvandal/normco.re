import { assertEquals, assertStrictEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { asLumeData } from "../../test/lume.ts";

import {
  callMethod,
  resolveHtmlChildren,
  resolveStringTags,
  searchPages,
} from "./lume-data.ts";

describe("callMethod()", () => {
  it("invokes a method when present on the object", () => {
    const result = callMethod<number>(
      {
        sum(a: number, b: number) {
          return a + b;
        },
      },
      "sum",
      2,
      3,
    );

    assertStrictEquals(result, 5);
  });

  it("returns undefined for missing or non-callable members", () => {
    assertStrictEquals(callMethod({}, "sum", 2, 3), undefined);
    assertStrictEquals(callMethod({ sum: 42 }, "sum", 2, 3), undefined);
  });
});

describe("searchPages()", () => {
  it("returns only valid Lume pages from the dynamic search object", () => {
    const results = searchPages({
      pages: () => [asLumeData({ title: "Valid" }), null, "nope"],
    }, "type=post");

    assertEquals(results, [asLumeData({ title: "Valid" })]);
  });

  it("returns an empty list when search.pages is unavailable", () => {
    assertEquals(searchPages({}, "type=post"), []);
  });
});

describe("resolveHtmlChildren()", () => {
  it("supports raw strings and Lume-style __html objects", () => {
    assertStrictEquals(resolveHtmlChildren("<p>Hello</p>"), "<p>Hello</p>");
    assertStrictEquals(
      resolveHtmlChildren({ __html: "<p>Rendered</p>" }),
      "<p>Rendered</p>",
    );
  });

  it("returns undefined for unsupported inputs", () => {
    assertStrictEquals(resolveHtmlChildren(42), undefined);
    assertStrictEquals(resolveHtmlChildren({}), undefined);
  });
});

describe("resolveStringTags()", () => {
  it("keeps only non-empty strings", () => {
    assertEquals(resolveStringTags(["design", "", 42, "writing"]), [
      "design",
      "writing",
    ]);
  });

  it("returns an empty array for non-array inputs", () => {
    assertEquals(resolveStringTags(undefined), []);
  });
});

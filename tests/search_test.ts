import { assertEquals } from "@std/assert";

import {
  allPostsQuery,
  byAuthorQuery,
  byTagQuery,
  firstPageQuery,
} from "../src/_utilities/search.ts";

Deno.test("search query helpers return consistent query strings", () => {
  const tagCases = [
    { tag: "design-system", expected: "type=post 'design-system'" },
    { tag: "design system", expected: "type=post 'design system'" },
    { tag: "ux/ui", expected: "type=post 'ux/ui'" },
  ];

  const authorCases = [
    { author: "Phiphi", expected: "type=post author='Phiphi'" },
    { author: "Phiphi Duval", expected: "type=post author='Phiphi Duval'" },
  ];

  const firstPageCases = [
    { type: "tag", expected: "type=tag pagination.page=1" },
    { type: "author", expected: "type=author pagination.page=1" },
  ];

  assertEquals(allPostsQuery, "type=post");

  for (const { tag, expected } of tagCases) {
    assertEquals(byTagQuery(tag), expected);
  }

  for (const { author, expected } of authorCases) {
    assertEquals(byAuthorQuery(author), expected);
  }

  for (const { type, expected } of firstPageCases) {
    assertEquals(firstPageQuery(type), expected);
  }
});

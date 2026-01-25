import { assertEquals } from "@std/assert";

import {
  allPostsQuery,
  byAuthorQuery,
  byTagQuery,
  firstPageQuery,
} from "../src/_utilities/search.ts";

Deno.test("search query helpers return consistent query strings", () => {
  assertEquals(allPostsQuery, "type=post");
  assertEquals(byTagQuery("design-system"), "type=post 'design-system'");
  assertEquals(byAuthorQuery("Phiphi"), "type=post author='Phiphi'");
  assertEquals(firstPageQuery("tag"), "type=tag pagination.page=1");
});

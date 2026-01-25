import { assertEquals } from "jsr:@std/assert@1.0.8";

import {
  allPostsQuery,
  byAuthorQuery,
  byTagQuery,
  firstPageQuery,
} from "./search.ts";

Deno.test("search query helpers return consistent query strings", () => {
  assertEquals(allPostsQuery, "type=post");
  assertEquals(byTagQuery("design-system"), "type=post 'design-system'");
  assertEquals(byAuthorQuery("Phiphi"), "type=post author='Phiphi'");
  assertEquals(firstPageQuery("tag"), "type=tag pagination.page=1");
});

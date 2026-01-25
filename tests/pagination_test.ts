import { assertEquals } from "@std/assert";

import {
  createPaginationUrl,
  isFirstPage,
} from "../src/_utilities/pagination.ts";

Deno.test("createPaginationUrl builds base and paginated URLs", () => {
  const toUrl = createPaginationUrl("/archive");

  assertEquals(toUrl(1), "/archive/");
  assertEquals(toUrl(2), "/archive/2/");
  assertEquals(toUrl(10), "/archive/10/");
});

Deno.test("isFirstPage detects the first page", () => {
  assertEquals(isFirstPage(1), true);
  assertEquals(isFirstPage(2), false);
});

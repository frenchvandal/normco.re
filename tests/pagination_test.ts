import { assertEquals } from "@std/assert";

import {
  createPaginationUrl,
  isFirstPage,
} from "../src/_utilities/pagination.ts";

Deno.test("createPaginationUrl builds base and paginated URLs", () => {
  const cases = [
    { baseUrl: "/archive", page: 1, expected: "/archive/" },
    { baseUrl: "/archive", page: 2, expected: "/archive/2/" },
    { baseUrl: "/archive", page: 10, expected: "/archive/10/" },
    { baseUrl: "/archive/", page: 1, expected: "/archive/" },
    { baseUrl: "/archive/", page: 3, expected: "/archive/3/" },
    { baseUrl: "/", page: 1, expected: "/" },
    { baseUrl: "/", page: 2, expected: "/2/" },
    { baseUrl: "", page: 1, expected: "/" },
  ];

  for (const { baseUrl, page, expected } of cases) {
    const toUrl = createPaginationUrl(baseUrl);
    assertEquals(toUrl(page), expected);
  }
});

Deno.test("isFirstPage detects the first page", () => {
  assertEquals(isFirstPage(1), true);
  assertEquals(isFirstPage(0), false);
  assertEquals(isFirstPage(-1), false);
  assertEquals(isFirstPage(2), false);
});

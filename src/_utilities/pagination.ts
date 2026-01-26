/**
 * Creates a pagination URL generator function
 * @param baseUrl - The base URL path (e.g., "/archive" or "/archive/tag-name")
 * @returns A function that generates URLs for pagination
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { createPaginationUrl } from "./pagination.ts";
 *
 * const buildUrl = createPaginationUrl("/archive");
 * assertEquals(buildUrl(1), "/archive/");
 * assertEquals(buildUrl(2), "/archive/2/");
 * ```
 */
export function createPaginationUrl(baseUrl: string) {
  const normalizedBaseUrl = baseUrl === "/" ? "" : baseUrl.replace(/\/+$/, "");

  return (pageNumber: number): string => {
    // First page uses the base URL, subsequent pages append the page number
    const pageSuffix = pageNumber === 1 ? "" : `/${pageNumber}`;
    return `${normalizedBaseUrl}${pageSuffix}/`;
  };
}

/**
 * Checks if a page is the first page in pagination
 * @param pageNumber - The current page number
 * @returns True if this is the first page
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { isFirstPage } from "./pagination.ts";
 *
 * assertEquals(isFirstPage(1), true);
 * assertEquals(isFirstPage(2), false);
 * ```
 */
export function isFirstPage(pageNumber: number): boolean {
  return pageNumber === 1;
}

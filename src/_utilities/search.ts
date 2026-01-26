/**
 * Search query helpers for consistent query building
 */

/**
 * Query for all posts sorted by date descending
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { allPostsQuery } from "./search.ts";
 *
 * assertEquals(allPostsQuery, "type=post");
 * ```
 */
export const allPostsQuery = "type=post";

/**
 * Creates a query for posts with a specific tag
 * @param tag - The tag name
 * @returns Search query string
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { byTagQuery } from "./search.ts";
 *
 * assertEquals(byTagQuery("deno"), "type=post 'deno'");
 * ```
 */
export function byTagQuery(tag: string): string {
  return `type=post '${tag}'`;
}

/**
 * Creates a query for posts by a specific author
 * @param author - The author name
 * @returns Search query string
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { byAuthorQuery } from "./search.ts";
 *
 * assertEquals(byAuthorQuery("Phiphi"), "type=post author='Phiphi'");
 * ```
 */
export function byAuthorQuery(author: string): string {
  return `type=post author='${author}'`;
}

/**
 * Creates a query for first page results of a specific type
 * @param type - The page type (e.g., "author", "tag")
 * @returns Search query string
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { firstPageQuery } from "./search.ts";
 *
 * assertEquals(firstPageQuery("tag"), "type=tag pagination.page=1");
 * ```
 */
export function firstPageQuery(type: string): string {
  return `type=${type} pagination.page=1`;
}

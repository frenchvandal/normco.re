/**
 * Search query helpers for consistent query building
 */

/**
 * Query for all posts sorted by date descending
 */
export const allPostsQuery = "type=post";

/**
 * Creates a query for posts with a specific tag
 * @param tag - The tag name
 * @returns Search query string
 */
export function byTagQuery(tag: string): string {
  return `type=post '${tag}'`;
}

/**
 * Creates a query for posts by a specific author
 * @param author - The author name
 * @returns Search query string
 */
export function byAuthorQuery(author: string): string {
  return `type=post author='${author}'`;
}

/**
 * Creates a query for first page results of a specific type
 * @param type - The page type (e.g., "author", "tag")
 * @returns Search query string
 */
export function firstPageQuery(type: string): string {
  return `type=${type} pagination.page=1`;
}

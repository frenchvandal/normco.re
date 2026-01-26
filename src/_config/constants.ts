/**
 * Number of items per page in paginated lists.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { PAGINATION_SIZE } from "./constants.ts";
 *
 * assertEquals(PAGINATION_SIZE, 10);
 * ```
 */
export const PAGINATION_SIZE = 10;

/**
 * Menu configuration for archive pages.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { ARCHIVE_MENU } from "./constants.ts";
 *
 * assertEquals(ARCHIVE_MENU.visible, true);
 * assertEquals(ARCHIVE_MENU.order, 1);
 * ```
 */
export const ARCHIVE_MENU = {
  visible: true,
  order: 1,
} as const;

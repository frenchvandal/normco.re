import "lume/types.ts";

import { createPaginationUrl, isFirstPage } from "./_utilities/pagination.ts";
import { ARCHIVE_MENU, PAGINATION_SIZE } from "./_config/constants.ts";
import { allPostsQuery } from "./_utilities/search.ts";

/**
 * Layout template used for archive pages.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { layout } from "./archive.page.ts";
 *
 * assertEquals(layout, "layouts/archive.ts");
 * ```
 */
export const layout = "layouts/archive.ts";

/**
 * Generates paginated archive pages.
 *
 * @param data - Lume data helpers for search, pagination, and translations.
 * @returns A generator of archive page data.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import generateArchive from "./archive.page.ts";
 *
 * assertEquals(typeof generateArchive, "function");
 * ```
 */
export default function* ({ search, paginate, i18n }: Lume.Data) {
  const posts = search.pages(allPostsQuery, "date=desc");
  const url = createPaginationUrl("/archive");

  for (const data of paginate(posts, { url, size: PAGINATION_SIZE })) {
    // Show the first page in the menu
    if (isFirstPage(data.pagination.page)) {
      data.menu = ARCHIVE_MENU;
    }

    yield {
      ...data,
      title: i18n.nav.archive_title,
    };
  }
}

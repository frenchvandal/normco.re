import "lume/types.ts";

import { createPaginationUrl, isFirstPage } from "./_utilities/pagination.ts";
import { ARCHIVE_MENU, PAGINATION_SIZE } from "./_config/constants.ts";
import { allPostsQuery } from "./_utilities/search.ts";

export const layout = "layouts/archive.ts";

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

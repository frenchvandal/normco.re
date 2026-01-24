import { createPaginationUrl, isFirstPage } from "./_utilities/pagination.ts";
import { ARCHIVE_MENU, PAGINATION_SIZE } from "./_config/constants.ts";
import { allPostsQuery } from "./_utilities/search.ts";

export const layout = "layouts/archive.ts";

interface PaginationData {
  pagination: {
    page: number;
  };
  menu?: {
    visible: boolean;
    order: number;
  };
  [key: string]: unknown;
}

interface ArchiveData {
  search: {
    pages: (query: string, sort: string) => unknown[];
  };
  paginate: (
    items: unknown[],
    options: { url: (n: number) => string; size: number },
  ) => Generator<PaginationData>;
  i18n: {
    nav: {
      archive_title: string;
    };
  };
}

export default function* ({ search, paginate, i18n }: ArchiveData) {
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

import "lume/types.ts";
import type { PaginateResult } from "lume/plugins/paginate.ts";
import type { Data } from "lume/core/file.ts";

import { createPaginationUrl } from "./_utilities/pagination.ts";
import { PAGINATION_SIZE } from "./_config/constants.ts";
import { byAuthorQuery, byTagQuery } from "./_utilities/search.ts";

export const layout = "layouts/archive-result.ts";

interface ArchiveConfig {
  type: "tag" | "author";
  fieldName: string;
  urlPrefix: string;
  titlePrefix: string;
  queryFn: (value: string) => string;
  formatTitle: (value: string) => string;
}

interface ArchiveResultPageData extends PaginateResult<Data> {
  title: string;
  type: "tag" | "author";
  tag?: string;
  author?: string;
}

/**
 * Generic generator for archive result pages (tags or authors)
 */
function* generateArchiveResults(
  values: string[],
  config: ArchiveConfig,
  search: Lume.Data["search"],
  paginate: Lume.Data["paginate"],
): Generator<ArchiveResultPageData> {
  for (const value of values) {
    const url = createPaginationUrl(`${config.urlPrefix}/${value}`);
    const pages = search.pages(config.queryFn(value));

    for (const page of paginate(pages, { url, size: PAGINATION_SIZE })) {
      yield {
        ...page,
        title: config.formatTitle(value),
        type: config.type,
        [config.fieldName]: value,
      };
    }
  }
}

export default function* ({ search, i18n, paginate }: Lume.Data) {
  // Generate a page for each tag
  yield* generateArchiveResults(
    search.values("tags"),
    {
      type: "tag",
      fieldName: "tag",
      urlPrefix: "/archive",
      titlePrefix: i18n.search.by_tag,
      queryFn: byTagQuery,
      formatTitle: (tag) => `${i18n.search.by_tag} "${tag}"`,
    },
    search,
    paginate,
  );

  // Generate a page for each author
  yield* generateArchiveResults(
    search.values("author"),
    {
      type: "author",
      fieldName: "author",
      urlPrefix: "/author",
      titlePrefix: i18n.search.by_author,
      queryFn: byAuthorQuery,
      formatTitle: (author) => `${i18n.search.by_author} ${author}`,
    },
    search,
    paginate,
  );
}

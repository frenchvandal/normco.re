/**
 * Archive Result Layout
 * Layout for filtered archive results (by tag or author)
 */
export const layout = "layouts/base.ts";

/**
 * Body class assigned to archive result pages.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { bodyClass } from "./archive-result.ts";
 *
 * assertEquals(bodyClass, "body-tag");
 * ```
 */
export const bodyClass = "body-tag";

/**
 * Renders the archive result page layout.
 *
 * @param data - Lume data for archive results and components.
 * @returns The archive result HTML markup.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import renderArchiveResultLayout from "./archive-result.ts";
 *
 * assertEquals(typeof renderArchiveResultLayout, "function");
 * ```
 */
export default async function (
  {
    title,
    pagination,
    results,
    i18n,
    comp,
  }: Lume.Data,
) {
  const postList = await comp.PostList({ postslist: results });
  const paginationNav = await comp.Pagination({ pagination, i18n });

  const breadcrumbs = await comp.Breadcrumbs({
    items: [
      { label: i18n.nav.archive_title, url: "/archive/" },
      { label: title },
    ],
    homeLabel: i18n.nav.home,
  });

  return `
${breadcrumbs}

<header class="page-header">
  <h1 class="page-title">${title}</h1>
</header>

${postList}
${paginationNav}
`;
}

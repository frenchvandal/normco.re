/**
 * Archive Result Layout
 * Layout for filtered archive results (by tag or author).
 * Uses PaperMod-style timeline layout for post listings.
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
 * assertEquals(bodyClass, "body-archive");
 * ```
 */
export const bodyClass = "body-archive";

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
    lang,
    comp,
  }: Lume.Data,
) {
  // Use timeline-style ArchiveList for tag/author filtered results
  const archiveList = await comp.ArchiveList({
    postslist: results,
    i18n,
    lang,
  });
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

${archiveList}
${paginationNav}
`;
}

/**
 * Pagination Component
 *
 * Renders pagination controls for navigating paginated content.
 * Displays previous/next links and current page indicator.
 * Returns an empty string if only one page exists.
 *
 * @param data - Lume data containing pagination state and i18n strings.
 * @param data.pagination - Pagination state from Lume.
 * @param data.pagination.previous - URL to previous page or undefined.
 * @param data.pagination.next - URL to next page or undefined.
 * @param data.pagination.page - Current page number.
 * @param data.pagination.totalPages - Total number of pages.
 * @param data.i18n - Internationalization strings.
 * @returns The pagination navigation HTML markup.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import renderPagination from "./Pagination.ts";
 *
 * assertEquals(typeof renderPagination, "function");
 * ```
 *
 * @example
 * ```ts
 * import { assertStringIncludes } from "@std/assert";
 * import renderPagination from "./Pagination.ts";
 *
 * const data = {
 *   pagination: { page: 2, totalPages: 5, previous: "/page/1/", next: "/page/3/" },
 *   i18n: { nav: { previous: "← Previous", next: "Next →", page: "Page" } },
 * };
 * const html = renderPagination(data);
 * assertStringIncludes(html, 'rel="prev"');
 * assertStringIncludes(html, 'rel="next"');
 * assertStringIncludes(html, "Page 2");
 * ```
 */
export default function ({ pagination, i18n }: Lume.Data) {
  if (!pagination || pagination.totalPages === 1) {
    return "";
  }

  return `
<nav class="page-pagination pagination" aria-label="Pagination">
  <ul role="list">
    ${
    pagination.previous
      ? `
    <li class="pagination-prev">
      <a href="${pagination.previous}" rel="prev">${i18n.nav.previous}</a>
    </li>
    `
      : ""
  }

    <li class="pagination-page" aria-current="page">
      ${i18n.nav.page} ${pagination.page}
    </li>

    ${
    pagination.next
      ? `
    <li class="pagination-next">
      <a href="${pagination.next}" rel="next">${i18n.nav.next}</a>
    </li>
    `
      : ""
  }
  </ul>
</nav>
`;
}

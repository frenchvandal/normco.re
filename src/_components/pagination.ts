/**
 * Pagination Component
 * Displays pagination controls for paginated content
 */
export default function ({ pagination, i18n }: Lume.Data) {
  if (!pagination || pagination.totalPages === 1) {
    return "";
  }

  return `
<nav class="page-pagination pagination">
  <ul>
    ${
    pagination.previous
      ? `
    <li class="pagination-prev">
      <a href="${pagination.previous}" rel="prev">${i18n.nav.previous}</a>
    </li>
    `
      : ""
  }

    <li class="pagination-page">
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

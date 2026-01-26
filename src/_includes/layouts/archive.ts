/**
 * Archive Layout
 * Main archive listing page with search, authors, and tags
 */
export const layout = "layouts/base.ts";
export const bodyClass = "body-tag";

export default async function (
  {
    title,
    pagination,
    results,
    search,
    i18n,
    comp,
  }: Lume.Data,
) {
  const postList = await comp.PostList({ postslist: results });
  const paginationNav = await comp.Pagination({ pagination, i18n });

  const pageAuthors = pagination?.page === 1
    ? search.pages("type=author pagination.page=1", "author")
    : [];

  const pageTags = pagination?.page === 1
    ? search.pages("type=tag pagination.page=1", "tag")
    : [];

  return `
<header class="page-header">
  <h1 class="page-title">${title}</h1>

  <p>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="3" cy="13" r="2" fill="currentColor"/><path d="M14 13C14 6.925 9.075 2 3 2M9 13a6 6 0 0 0-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg> RSS:
    <a href="/feed.xml">Atom</a>, <a href="/feed-json-viewer/">JSON</a>
  </p>

  ${
    pagination?.page === 1
      ? `
  <div class="search" id="search" role="search" aria-label="Search posts">
    <div class="search-skeleton" aria-hidden="true">
      <div class="skeleton skeleton--text skeleton--w-full" style="height: 2.5rem;"></div>
    </div>
  </div>
  `
      : ""
  }
</header>

${
    pagination?.page === 1 && pageAuthors.length > 1
      ? `
<nav class="page-navigation">
  <h2>${i18n.search.authors}:</h2>

  <ul class="page-navigation-tags">
  ${
        pageAuthors.map((page) => `
    <li><a href="${page.url}" class="badge">${page.author}</a></li>
  `).join("")
      }
  </ul>
</nav>
`
      : ""
  }

${
    pagination?.page === 1 && pageTags.length > 0
      ? `
<nav class="page-navigation">
  <h2>${i18n.search.tags}:</h2>

  <ul class="page-navigation-tags">
  ${
        pageTags.map((page) => `
    <li><a href="${page.url}" class="badge">${page.tag}</a></li>
  `).join("")
      }
  </ul>
</nav>
`
      : ""
  }

${postList}
${paginationNav}
`;
}

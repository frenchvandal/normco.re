/**
 * Archive Result Layout
 * Layout for filtered archive results (by tag or author)
 */
export const layout = "layouts/base.ts";
export const bodyClass = "body-tag";

export default async function (
  {
    title,
    pagination,
    results,
    i18n,
    comp,
  }: Lume.Data,
) {
  const postList = await comp.postList({ postslist: results });
  const paginationNav = await comp.pagination({ pagination, i18n });

  return `
<header class="page-header">
  <p><a href="/archive/">${i18n.nav.back}</a></p>
  <h1 class="page-title">${title}</h1>
</header>

${postList}
${paginationNav}
`;
}

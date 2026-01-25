/**
 * Page Layout
 * Simple layout for content pages
 */
export const layout = "layouts/base.ts";
export const bodyClass = "body-page";

export default async function (
  { title, subtitle, content, sourceCommit, sourcePath, repo, i18n, comp }:
    Lume.Data,
  { md }: Lume.Helpers,
) {
  const sourceInfo = await comp.SourceInfo({
    sourceCommit,
    sourcePath,
    repo,
    i18n,
  });

  return `
<article class="post" data-pagefind-body>
  <header class="post-header">
    <h1 class="post-title">${title}</h1>

    ${subtitle ? md(subtitle) : ""}
  </header>

  <div class="post-body">
    ${content}
  </div>

  ${sourceInfo}
</article>
`;
}

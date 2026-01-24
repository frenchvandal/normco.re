/**
 * Page Layout
 * Simple layout for content pages
 */
export const layout = "layouts/base.ts";
export const bodyClass = "body-page";

export default function (
  { title, subtitle, content }: Lume.Data,
  { md }: Lume.Helpers,
) {
  return `
<article class="post" data-pagefind-body>
  <header class="post-header">
    <h1 class="post-title">${title}</h1>

    ${subtitle ? md(subtitle) : ""}
  </header>

  <div class="post-body">
    ${content}
  </div>
</article>
`;
}

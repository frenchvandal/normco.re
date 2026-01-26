/**
 * Page Layout
 * Simple layout for content pages
 */
export const layout = "layouts/base.ts";

/**
 * Body class assigned to content pages.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { bodyClass } from "./page.ts";
 *
 * assertEquals(bodyClass, "body-page");
 * ```
 */
export const bodyClass = "body-page";

/**
 * Renders the content page layout.
 *
 * @param data - Lume data for page content and components.
 * @param helpers - Lume helpers for markdown rendering.
 * @returns The page HTML markup.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import renderPageLayout from "./page.ts";
 *
 * assertEquals(typeof renderPageLayout, "function");
 * ```
 */
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

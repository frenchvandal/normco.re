/** Individual post layout — chains into the base layout. */

/** This layout is itself wrapped by the base layout. */
export const layout = "layouts/base.ts";

/** Typed helpers used in this layout. */
type H = {
  date: (value: unknown, format: string) => string;
  class: (...args: Array<string | Record<string, boolean>>) => string;
};

/**
 * Minimal interface for the nav helper injected by the nav plugin.
 * Only the methods used in this layout are declared.
 */
type NavHelper = {
  previousPage: (
    url: string,
    base?: string,
    query?: string,
    sort?: string,
  ) => Lume.Data | undefined;
  nextPage: (
    url: string,
    base?: string,
    query?: string,
    sort?: string,
  ) => Lume.Data | undefined;
};

export default function (data: Lume.Data, helpers: Lume.Helpers): string {
  const { date: dateFormat, class: cls } = helpers as unknown as H;

  // Use the nav plugin to find adjacent posts ordered chronologically.
  const n = data.nav as unknown as NavHelper;
  const currentUrl = data.url ?? "/";
  const prev = n.previousPage(currentUrl, "/posts/", "type=post", "date=asc");
  const next = n.nextPage(currentUrl, "/posts/", "type=post", "date=asc");

  const minutes = typeof data.readingTime === "number"
    ? Math.ceil(data.readingTime as number)
    : undefined;
  const readingTimePart = minutes !== undefined
    ? `<span class="post-meta-separator" aria-hidden="true">·</span>
       <span>${minutes} min read</span>`
    : "";

  const prevNav = prev
    ? `<div class="${cls("post-nav-item")}">
        <span class="post-nav-label">Previous</span>
        <a href="${prev.url}" class="post-nav-title">${prev.title}</a>
      </div>`
    : `<div></div>`;

  const nextNav = next
    ? `<div class="${cls("post-nav-item", "post-nav-item--next")}">
        <span class="post-nav-label">Next</span>
        <a href="${next.url}" class="post-nav-title">${next.title}</a>
      </div>`
    : `<div></div>`;

  return `<article class="post-article">
  <header class="post-header">
    <h1 class="post-title">${data.title}</h1>
    <div class="post-meta">
      <time datetime="${dateFormat(data.date, "ATOM")}">${
    dateFormat(data.date, "HUMAN_DATE")
  }</time>
      ${readingTimePart}
    </div>
  </header>
  <div class="post-content">
    ${data.content}
  </div>
  <nav class="post-nav" aria-label="Post navigation">
    ${prevNav}
    ${nextNav}
  </nav>
</article>`;
}

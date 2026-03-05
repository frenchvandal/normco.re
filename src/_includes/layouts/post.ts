/** Individual post layout — chains into the base layout. */

/** This layout is itself wrapped by the base layout. */
export const layout = "layouts/base.ts";

/** Formats a `Date` as "Month Day, Year" in en-US locale. */
function formatDate(date: unknown): string {
  if (!(date instanceof Date)) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/** Returns an ISO 8601 date string, or empty string when the value is not a Date. */
function isoDate(date: unknown): string {
  if (!(date instanceof Date)) return "";
  return date.toISOString();
}

export default function (data: Lume.Data, _helpers: Lume.Helpers): string {
  const allPosts = data.search.pages("type=post", "date=asc") as Lume.Data[];
  const idx = allPosts.findIndex((p) => p.url === data.url);
  const prev = idx > 0 ? allPosts[idx - 1] : undefined;
  const next = idx < allPosts.length - 1 ? allPosts[idx + 1] : undefined;

  const minutes = typeof data.readingTime === "number"
    ? Math.ceil(data.readingTime as number)
    : undefined;
  const readingTimePart = minutes !== undefined
    ? `<span class="post-meta-separator" aria-hidden="true">·</span>
       <span>${minutes} min read</span>`
    : "";

  const prevNav = prev
    ? `<div class="post-nav-item">
        <span class="post-nav-label">Previous</span>
        <a href="${prev.url}" class="post-nav-title">${prev.title}</a>
      </div>`
    : `<div></div>`;

  const nextNav = next
    ? `<div class="post-nav-item post-nav-item--next">
        <span class="post-nav-label">Next</span>
        <a href="${next.url}" class="post-nav-title">${next.title}</a>
      </div>`
    : `<div></div>`;

  return `<article class="post-article">
  <header class="post-header">
    <h1 class="post-title">${data.title}</h1>
    <div class="post-meta">
      <time datetime="${isoDate(data.date)}">${formatDate(data.date)}</time>
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

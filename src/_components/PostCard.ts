/** Post card used on the home page and archive listings. */

/** Formats a `Date` as "Mon D, YYYY" (short month). */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export default function (
  { title, url, date, readingTime }: {
    readonly title: string;
    readonly url: string;
    readonly date: Date;
    readonly readingTime?: unknown;
  },
): string {
  const minutes = typeof readingTime === "number"
    ? Math.ceil(readingTime as number)
    : undefined;
  const meta = minutes !== undefined
    ? `<span class="post-card-meta">${minutes} min read</span>`
    : "";

  return `<article class="post-card">
  <time class="post-card-date" datetime="${date.toISOString()}">${
    formatDate(date)
  }</time>
  <h3 class="post-card-title"><a href="${url}">${title}</a></h3>
  ${meta}
</article>`;
}

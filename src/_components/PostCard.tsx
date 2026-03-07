/**
 * Post card used on the home page and archive listings.
 *
 * Callers are responsible for formatting dates via `helpers.date()` before
 * passing them in, keeping this component free of date-formatting logic.
 */

export default function (
  { title, url, dateStr, dateIso, readingMinutes }: {
    readonly title: string;
    readonly url: string;
    /** Display string produced by `helpers.date(date, "SHORT")`. */
    readonly dateStr: string;
    /** ISO 8601 string for the `datetime` attribute, e.g. from `helpers.date(date, "ATOM")`. */
    readonly dateIso: string;
    readonly readingMinutes?: number;
  },
): string {
  const meta = readingMinutes !== undefined
    ? `<span class="post-card-meta">${readingMinutes} min read</span>`
    : "";

  return `<article class="post-card">
  <time class="post-card-date" datetime="${dateIso}">${dateStr}</time>
  <h3 class="post-card-title"><a href="${url}">${title}</a></h3>
  ${meta}
</article>`;
}

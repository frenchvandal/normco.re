/**
 * Post card used on the home page and archive listings.
 *
 * Callers are responsible for formatting dates and reading labels before
 * passing them in, keeping this component free of locale logic.
 */

/** Escapes text content before interpolation into raw HTML strings. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Escapes attribute values before interpolation into raw HTML strings. */
function escapeAttribute(value: string): string {
  return escapeHtml(value).replace(/"/g, "&quot;");
}

/** Renders one post card row. */
export default (
  { title, url, dateStr, dateIso, readingLabel }: {
    readonly title: string;
    readonly url: string;
    readonly dateStr: string;
    readonly dateIso: string;
    readonly readingLabel?: string;
  },
): string => {
  const meta = readingLabel !== undefined
    ? `<span class="post-card-reading-time">${escapeHtml(readingLabel)}</span>`
    : "";
  const safeTitle = escapeHtml(title);
  const safeUrl = escapeAttribute(url);
  const safeDateIso = escapeAttribute(dateIso);
  const safeDateStr = escapeHtml(dateStr);

  return `<article class="post-card">
  <time class="post-card-date" datetime="${safeDateIso}">${safeDateStr}</time>
  <h3 class="post-card-title"><a href="${safeUrl}">${safeTitle}</a></h3>
  ${meta}
</article>`;
};

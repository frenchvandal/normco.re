/**
 * Post card used on the home page and archive listings.
 *
 * Callers are responsible for formatting dates and reading labels before
 * passing them in, keeping this component free of locale logic.
 */

/** Renders one post card row. */
export default (
  {
    title,
    url,
    dateStr,
    dateIso,
    readingLabel,
    summary,
    authorName,
    authorUrl,
  }: {
    readonly title: string;
    readonly url: string;
    readonly dateStr: string;
    readonly dateIso: string;
    readonly readingLabel?: string;
    readonly summary?: string;
    readonly authorName?: string;
    readonly authorUrl?: string;
  },
) => (
  <article class="post-card h-entry">
    <time class="post-card-date dt-published" datetime={dateIso}>
      {dateStr}
    </time>
    <h3 class="post-card-title p-name">
      <a class="post-card-link u-url u-uid" href={url}>{title}</a>
    </h3>
    {summary !== undefined && <p class="p-summary sr-only">{summary}</p>}
    {readingLabel !== undefined && (
      <span class="post-card-reading-time">{readingLabel}</span>
    )}
    {authorName !== undefined && authorUrl !== undefined && (
      <a class="p-author h-card sr-only" href={authorUrl}>
        <span class="p-name">{authorName}</span>
      </a>
    )}
  </article>
);

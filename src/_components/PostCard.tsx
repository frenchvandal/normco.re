/**
 * Post card used on the home page and archive listings.
 *
 * Callers are responsible for formatting dates and reading labels before
 * passing them in, keeping this component free of locale logic.
 */

/** Renders one post card row. */
export default (
  { title, url, dateStr, dateIso, readingLabel }: {
    readonly title: string;
    readonly url: string;
    readonly dateStr: string;
    readonly dateIso: string;
    readonly readingLabel?: string;
  },
) => (
  <article class="post-card">
    <time class="post-card-date" datetime={dateIso}>{dateStr}</time>
    <h3 class="post-card-title">
      <a href={url}>{title}</a>
    </h3>
    {readingLabel !== undefined && (
      <span class="post-card-reading-time">{readingLabel}</span>
    )}
  </article>
);

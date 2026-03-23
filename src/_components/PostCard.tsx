/**
 * Post card used on the home page and archive listings.
 *
 * Callers are responsible for formatting dates and reading labels before
 * passing them in, keeping this component free of locale logic.
 */

import HEntryShell from "../mf2/components/HEntryShell.tsx";

/** Renders one post card row. */
export default (
  {
    title,
    url,
    dateStr,
    dateIso,
    className,
    readingLabel,
    summary,
    showSummary,
    authorName,
    authorUrl,
  }: {
    readonly title: string;
    readonly url: string;
    readonly dateStr: string;
    readonly dateIso: string;
    readonly className?: string;
    readonly readingLabel?: string;
    readonly summary?: string;
    readonly showSummary?: boolean;
    readonly authorName?: string;
    readonly authorUrl?: string;
  },
) => (
  <HEntryShell
    className={[
      "cds--tile",
      "post-card",
      "h-entry",
      className,
    ].filter(Boolean).join(" ")}
    {...(summary !== undefined ? { summary } : {})}
    {...(authorName !== undefined && authorUrl !== undefined
      ? { author: { name: authorName, url: authorUrl } }
      : {})}
  >
    <time class="post-card-date dt-published" datetime={dateIso}>
      {dateStr}
    </time>
    <h3 class="post-card-title p-name">
      <a class="post-card-link u-url u-uid" href={url}>{title}</a>
    </h3>
    {showSummary === true && summary !== undefined && (
      <p class="post-card-summary">{summary}</p>
    )}
    {readingLabel !== undefined && (
      <span class="post-card-reading-time">{readingLabel}</span>
    )}
  </HEntryShell>
);

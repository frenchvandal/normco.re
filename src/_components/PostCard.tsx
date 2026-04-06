import type { jsx } from "lume/jsx-runtime";

import { resolvePostTitleViewTransitionName } from "../utils/view-transitions.ts";

/**
 * Post card used on the home page and post listings.
 *
 * Callers are responsible for formatting dates and reading labels before
 * passing them in, keeping this component free of locale logic.
 */

type El = ReturnType<typeof jsx>;

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
  }: {
    readonly title: string;
    readonly url: string;
    readonly dateStr: string;
    readonly dateIso: string;
    readonly className?: string;
    readonly readingLabel?: string;
    readonly summary?: string;
    readonly showSummary?: boolean;
  },
): El => {
  const titleTransitionName = resolvePostTitleViewTransitionName(url);

  return (
    <article
      class={[
        "site-panel",
        "post-card",
        className,
      ].filter(Boolean).join(" ")}
    >
      <h3 class="post-card-title">
        <a
          class="post-card-link"
          href={url}
          {...(titleTransitionName
            ? {
              style: `view-transition-name: ${titleTransitionName};`,
            }
            : {})}
        >
          {title}
        </a>
      </h3>
      {showSummary === true && summary !== undefined && (
        <p class="post-card-summary">{summary}</p>
      )}
      <div class="post-card-meta">
        <time class="post-card-date" datetime={dateIso}>
          {dateStr}
        </time>
        {readingLabel !== undefined && (
          <span class="post-card-reading-time">{readingLabel}</span>
        )}
      </div>
    </article>
  );
};

import { renderComponent } from "lume/jsx-runtime";

import HEntryShell from "../mf2/components/HEntryShell.tsx";
import { escapeHtml } from "./html.ts";

export type PostCardProps = Readonly<{
  title: string;
  url: string;
  dateStr: string;
  dateIso: string;
  className?: string;
  readingLabel?: string;
  summary?: string;
  showSummary?: boolean;
  authorName?: string;
  authorUrl?: string;
}>;

export type PostCardRenderer = (props: PostCardProps) => Promise<string>;

export type DateHelper = (
  value: unknown,
  pattern?: string,
  lang?: string,
) => string | undefined;

export function renderFallbackPostCard(
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
  }: PostCardProps,
): Promise<string> {
  return Promise.resolve(
    renderComponent(
      HEntryShell({
        className: [
          "cds--tile",
          "post-card",
          "h-entry",
          className,
        ].filter(Boolean).join(" "),
        ...(summary !== undefined ? { summary } : {}),
        ...(authorName && authorUrl
          ? { author: { name: authorName, url: authorUrl } }
          : {}),
        children: {
          __html:
            `<h3 class="post-card-title p-name"><a class="post-card-link u-url u-uid" href="${
              escapeHtml(url)
            }">${escapeHtml(title)}</a></h3>${
              showSummary && summary
                ? `<p class="post-card-summary">${escapeHtml(summary)}</p>`
                : ""
            }<div class="post-card-meta"><time class="post-card-date dt-published" datetime="${
              escapeHtml(dateIso)
            }">${escapeHtml(dateStr)}</time>${
              readingLabel
                ? `<span class="post-card-reading-time">${
                  escapeHtml(readingLabel)
                }</span>`
                : ""
            }</div>`,
        },
      }),
    ),
  );
}

export function resolvePostCardRenderer(value: unknown): PostCardRenderer {
  if (typeof value === "object" && value !== null) {
    const PostCard = Reflect.get(value, "PostCard");

    if (typeof PostCard === "function") {
      return (props) =>
        Promise.resolve(Reflect.apply(PostCard, value, [props])).then((
          result,
        ) => String(result));
    }
  }

  return renderFallbackPostCard;
}

export function resolveDateHelper(helpers: Lume.Helpers): DateHelper {
  const date = Reflect.get(helpers, "date");

  if (typeof date !== "function") {
    return () => undefined;
  }

  return (value, pattern, lang) => {
    const formatted = Reflect.apply(date, helpers, [value, pattern, lang]);
    return typeof formatted === "string" ? formatted : undefined;
  };
}

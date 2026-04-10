import { escapeHtml } from "./html.ts";
import { getRecordMethod, getRecordValue } from "./type-guards.ts";
import {
  renderViewTransitionNameAttribute,
  resolvePostSummaryViewTransitionName,
  resolvePostTitleViewTransitionName,
} from "./view-transitions.ts";

export type PostCardProps = Readonly<{
  title: string;
  url: string;
  dateStr: string;
  dateIso: string;
  className?: string;
  readingLabel?: string | undefined;
  summary?: string | undefined;
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

type DynamicPostCard = (
  this: unknown,
  props: PostCardProps,
) => unknown | Promise<unknown>;

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
  }: PostCardProps,
): Promise<string> {
  const cls = ["site-panel", "post-card", className].filter(Boolean).join(" ");
  const titleTransitionName = resolvePostTitleViewTransitionName(url);
  const summaryTransitionName = resolvePostSummaryViewTransitionName(url);
  const titleTransitionAttribute = renderViewTransitionNameAttribute(
    titleTransitionName,
  );
  const summaryTransitionAttribute = renderViewTransitionNameAttribute(
    summaryTransitionName,
  );
  const summaryHtml = showSummary && summary
    ? `<p class="post-card-summary"${summaryTransitionAttribute}>${
      escapeHtml(summary)
    }</p>`
    : "";
  const readingHtml = readingLabel
    ? `<span class="post-card-reading-time">${escapeHtml(readingLabel)}</span>`
    : "";

  return Promise.resolve(
    `<article class="${
      escapeHtml(cls)
    }"><h3 class="post-card-title"><a class="post-card-link" href="${
      escapeHtml(url)
    }"${titleTransitionAttribute}>${
      escapeHtml(title)
    }</a></h3>${summaryHtml}<div class="post-card-meta"><time class="post-card-date" datetime="${
      escapeHtml(dateIso)
    }">${escapeHtml(dateStr)}</time>${readingHtml}</div></article>`,
  );
}

export function resolvePostCardRenderer(comp: unknown): PostCardRenderer {
  const PostCard = getRecordValue(comp, "PostCard");

  if (typeof PostCard === "function") {
    const render = PostCard as DynamicPostCard;
    return async (props) => String(await render.call(comp, props));
  }

  return renderFallbackPostCard;
}

export function resolveDateHelper(helpers: Lume.Helpers): DateHelper {
  const date = getRecordMethod(helpers, "date");

  if (!date) return () => undefined;

  return (value, pattern, lang) => {
    const result = date.call(helpers, value, pattern, lang);
    return typeof result === "string" ? result : undefined;
  };
}

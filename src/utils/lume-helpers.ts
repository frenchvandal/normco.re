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
  }: PostCardProps,
): Promise<string> {
  const cls = ["cds--tile", "post-card", className].filter(Boolean).join(" ");
  const summaryHtml = showSummary && summary
    ? `<p class="post-card-summary">${escapeHtml(summary)}</p>`
    : "";
  const readingHtml = readingLabel
    ? `<span class="post-card-reading-time">${escapeHtml(readingLabel)}</span>`
    : "";

  return Promise.resolve(
    `<article class="${
      escapeHtml(cls)
    }"><h3 class="post-card-title"><a class="post-card-link" href="${
      escapeHtml(url)
    }">${
      escapeHtml(title)
    }</a></h3>${summaryHtml}<div class="post-card-meta"><time class="post-card-date" datetime="${
      escapeHtml(dateIso)
    }">${escapeHtml(dateStr)}</time>${readingHtml}</div></article>`,
  );
}

export function resolvePostCardRenderer(comp: unknown): PostCardRenderer {
  if (typeof comp !== "object" || comp === null) return renderFallbackPostCard;
  const PostCard = Reflect.get(comp, "PostCard");
  if (typeof PostCard === "function") {
    return (props) =>
      Promise.resolve(Reflect.apply(PostCard, comp, [props])).then(String);
  }
  return renderFallbackPostCard;
}

export function resolveDateHelper(helpers: Lume.Helpers): DateHelper {
  const date = Reflect.get(helpers, "date");
  if (typeof date !== "function") return () => undefined;

  return (value, pattern, lang) => {
    const result = Reflect.apply(date, helpers, [value, pattern, lang]);
    return typeof result === "string" ? result : undefined;
  };
}

import type { jsx } from "lume/jsx-runtime";

import { resolvePageSetup } from "../../utils/page-setup.ts";
import SiteIcon from "../../_components/SiteIcon.tsx";
import { resolveDateHelper } from "../../utils/lume-helpers.ts";
import { getTagColor, getTagUrl } from "../../utils/tags.ts";
import { isDefined, isLumeData, resolveOptionalTrimmedString } from "../../utils/type-guards.ts";
import { resolvePostDate, resolveReadingMinutes } from "../../posts/post-metadata.ts";
import { formatRfc3339Instant } from "../../utils/date-time.ts";
import { formatReadingTime } from "../../utils/i18n.ts";
import { enhancePostContent } from "../../utils/post-outline.ts";
import { callMethod, resolveHtmlChildren, resolveStringTags } from "../../utils/lume-data.ts";

export const layout = "layouts/base.tsx";

type El = ReturnType<typeof jsx>;
type DlItem = Readonly<{ key: string; term: string; value: El | string | number }>;

// ── Helpers ──────────────────────────────────────────────────────────────

function renderDl(items: readonly DlItem[], cls: Record<"list" | "item" | "term" | "value", string>): El {
  return (
    <dl class={cls.list}>
      {items.map(({ key, term, value }) => (
        <div key={key} class={cls.item}>
          <dt class={cls.term}>{term}</dt>
          <dd class={cls.value}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function NavLink({ post, label, isNext }: { post?: Lume.Data; label: string; isNext?: boolean }): El {
  if (!post) return <div class="post-nav-placeholder" aria-hidden="true"></div>;
  return (
    <div class={`post-nav-item${isNext ? " post-nav-item--next" : ""}`}>
      <span class="post-nav-label">{label}</span>
      <a href={post.url ?? ""} class="post-nav-title">{post.title ?? ""}</a>
    </div>
  );
}

function resolveAdjacentPosts(currentUrl: string, query: string, search: unknown) {
  const posts = (callMethod<unknown[]>(search, "pages", query, "date=asc") ?? []).filter(isLumeData);
  const idx = posts.findIndex((p) => p.url === currentUrl);
  return {
    prev: idx > 0 ? posts[idx - 1] : undefined,
    next: idx >= 0 && idx < posts.length - 1 ? posts[idx + 1] : undefined,
  };
}

// ── Layout ───────────────────────────────────────────────────────────────

export default (data: Lume.Data, helpers: Lume.Helpers) => {
  const dateFormat = resolveDateHelper(helpers);
  const { language, languageDataCode, archiveUrl: postsBaseUrl, homeUrl, translations: t } =
    resolvePageSetup(data.lang);
  const postQuery = `type=post lang=${languageDataCode}`;
  const currentUrl = typeof data.url === "string" ? data.url : "/";

  // Adjacent post resolution
  let { prev, next } = resolveAdjacentPosts(currentUrl, postQuery, data.search);

  const isPostCandidate = (v: unknown): v is Lume.Data =>
    isLumeData(v) && typeof v.url === "string" &&
    v.url.startsWith(postsBaseUrl) && v.url !== postsBaseUrl &&
    (v.type === undefined || v.type === "post");

  if (!prev) {
    const navPrev = callMethod(data.nav, "previousPage", currentUrl, postsBaseUrl, postQuery, "date=asc");
    if (isPostCandidate(navPrev)) prev = navPrev;
  }
  if (!next) {
    const navNext = callMethod(data.nav, "nextPage", currentUrl, postsBaseUrl, postQuery, "date=asc");
    if (isPostCandidate(navNext)) next = navNext;
  }

  const postDate = resolvePostDate(data.date);
  const minutes = resolveReadingMinutes(data.readingInfo);
  const tags = resolveStringTags(data.tags);
  const rawHtml = resolveHtmlChildren(data.children);
  const includeCodeCopy = /<pre>\s*<code\b/i.test(rawHtml ?? "");
  const enhanced = rawHtml ? enhancePostContent(rawHtml) : { html: "", outline: [] };
  const renderedChildren = rawHtml ? { __html: enhanced.html } : data.children;
  const { outline } = enhanced;

  const publishedDateIso = dateFormat(postDate, "ATOM", language) ?? formatRfc3339Instant(postDate);
  const publishedDateLabel = dateFormat(postDate, "HUMAN_DATE", language) ?? formatRfc3339Instant(postDate);
  const readingTimeLabel = minutes !== undefined ? formatReadingTime(minutes, language) : undefined;
  const visibleSummary = resolveOptionalTrimmedString(data.description);
  const hasRail = outline.length > 0 || tags.length > 0 || prev || next;
  const showSummaryBlock = visibleSummary !== undefined || outline.length > 0;

  const codeCopyAttr = (label: string, fallback: string) =>
    includeCodeCopy && label !== fallback ? label : undefined;

  const summaryItems = [
    readingTimeLabel ? { key: "reading-time", term: t.post.readingLabel, value: readingTimeLabel } : undefined,
    outline.length > 0 ? { key: "sections", term: t.post.sectionsLabel, value: outline.length } : undefined,
  ].filter(isDefined);

  const publicationDetails: DlItem[] = [
    { key: "published", term: t.post.publishedLabel, value: <time datetime={publishedDateIso}>{publishedDateLabel}</time> },
    readingTimeLabel ? { key: "reading-time", term: t.post.readingLabel, value: readingTimeLabel } : undefined,
    { key: "permalink", term: t.post.permalinkLabel, value: <a href={currentUrl} class="post-details-link">{currentUrl}</a> },
  ].filter(isDefined);

  return (
    <div class="site-page-shell site-page-shell--wide">
      <div class={`feature-layout${hasRail ? " feature-layout--with-rail" : ""}`}>
        <article
          class="post-article feature-main"
          data-code-copy-label={codeCopyAttr(t.post.copyCodeLabel, "Copy code")}
          data-code-copy-feedback={codeCopyAttr(t.post.copyCodeFeedback, "Code copied")}
          data-code-copy-failed-feedback={codeCopyAttr(t.post.copyCodeFailedFeedback, "Cannot copy code")}
        >
          <header class="post-header pagehead post-pagehead">
            <nav class="cds--breadcrumb" aria-label={t.post.breadcrumbAriaLabel}>
              <ol class="cds--breadcrumb-list">
                <li class="cds--breadcrumb-item">
                  <a href={homeUrl} class="cds--breadcrumb-link">{t.navigation.home}</a>
                </li>
                <li class="cds--breadcrumb-item">
                  <a href={postsBaseUrl} class="cds--breadcrumb-link">{t.navigation.writing}</a>
                </li>
              </ol>
            </nav>
            <div class="post-pagehead-grid">
              <div class="post-pagehead-copy">
                <h1 class="post-title">{data.title ?? ""}</h1>
                <div class="post-meta">
                  <time datetime={publishedDateIso}>{publishedDateLabel}</time>
                  {minutes !== undefined && (
                    <>
                      <span class="post-meta-separator" aria-hidden="true">·</span>
                      <span>{readingTimeLabel}</span>
                    </>
                  )}
                </div>
              </div>
              {showSummaryBlock && (
                <div class="post-pagehead-context">
                  {visibleSummary !== undefined && (
                    <>
                      <p class="post-pagehead-kicker">{t.post.summaryEyebrow}</p>
                      <p class="post-pagehead-summary pagehead-lead">{visibleSummary}</p>
                    </>
                  )}
                  {summaryItems.length > 0 && renderDl(summaryItems, {
                    list: "post-summary-meta",
                    item: "post-summary-meta-group",
                    term: "post-summary-term",
                    value: "post-summary-value",
                  })}
                </div>
              )}
            </div>
          </header>

          <div class="post-content">{renderedChildren}</div>

          <div class="post-details-section">
            <ul class="cds--accordion site-accordion post-details-accordion" data-site-accordion="">
              <li class="cds--accordion__item">
                <button
                  type="button"
                  class="cds--accordion__heading"
                  data-accordion-trigger=""
                  aria-expanded="false"
                  aria-controls="post-publication-details"
                >
                  <SiteIcon name="chevron-down" className="cds--accordion__arrow" width={16} height={16} />
                  <span class="cds--accordion__title">{t.post.detailsTitle}</span>
                </button>
                <div id="post-publication-details" class="cds--accordion__wrapper" data-accordion-panel="" hidden>
                  <div class="cds--accordion__content">
                    {renderDl(publicationDetails, {
                      list: "post-details-list",
                      item: "post-details-item",
                      term: "post-details-term",
                      value: "post-details-value",
                    })}
                  </div>
                </div>
              </li>
            </ul>
          </div>

          {includeCodeCopy && <script src="/scripts/post-code-copy.js" defer></script>}
          <script src="/scripts/surface-controls.js" defer></script>
        </article>

        {hasRail && (
          <aside class="feature-rail post-rail" aria-label={t.post.railAriaLabel}>
            <div class="feature-rail-sticky">
              {outline.length > 0 && (
                <section class="feature-card post-rail-card post-outline-card">
                  <h2 class="feature-card-title">{t.post.outlineTitle}</h2>
                  <nav class="post-outline-nav" aria-label={t.post.outlineAriaLabel}>
                    <ul class="post-outline-list">
                      {outline.map((item) => (
                        <li key={item.id} class={`post-outline-item post-outline-item--level-${item.level}`}>
                          <a href={`#${item.id}`} class="post-outline-link">{item.text}</a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </section>
              )}

              {tags.length > 0 && (
                <section class="feature-card post-rail-card post-tags-card">
                  <h2 class="feature-card-title">{t.post.tagsAriaLabel}</h2>
                  <ul class="post-tags post-tags--rail">
                    {tags.map((tag, i) => (
                      <li key={`${tag}-${i}`}>
                        <a href={getTagUrl(tag, language)} class={`tag-link tag-link--${getTagColor(tag)}`} rel="tag" title={tag}>
                          <span class="tag-link__label">{tag}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {(prev || next) && (
                <section class="feature-card post-rail-card post-nav-card">
                  <h2 class="feature-card-title">{t.post.navigationAriaLabel}</h2>
                  <nav class="post-nav post-nav--rail" aria-label={t.post.navigationAriaLabel}>
                    <NavLink post={prev} label={t.post.previousLabel} />
                    <NavLink post={next} label={t.post.nextLabel} isNext />
                  </nav>
                </section>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

import type { jsx } from "lume/jsx-runtime";

import {
  formatReadingTime,
  getLanguageDataCode,
  getPageContext,
  resolveSiteLanguage,
} from "../../utils/i18n.ts";
import SiteIcon from "../../_components/SiteIcon.tsx";
import { resolveDateHelper } from "../../utils/lume-helpers.ts";
import { getTagColor, getTagUrl } from "../../utils/tags.ts";
import {
  isDefined,
  isLumeData,
  resolveOptionalTrimmedString,
} from "../../utils/type-guards.ts";
import {
  resolvePostDate,
  resolveReadingMinutes,
} from "../../posts/post-metadata.ts";
import { formatRfc3339Instant } from "../../utils/date-time.ts";
import { enhancePostContent } from "../../utils/post-outline.ts";

export const layout = "layouts/base.tsx";

/**
 * Minimal interface for the nav helper injected by the nav plugin.
 * Only the methods used in this layout are declared.
 */
type NavHelper = {
  previousPage?: (
    url: string,
    base?: string,
    query?: string,
    sort?: string,
  ) => unknown;
  nextPage?: (
    url: string,
    base?: string,
    query?: string,
    sort?: string,
  ) => unknown;
};

type SearchHelper = {
  pages: (query: string, sort?: string) => ReadonlyArray<unknown>;
};

type SsxElement = ReturnType<typeof jsx>;
type DefinitionListValue = SsxElement | string | number;
type NavMethod = NonNullable<NavHelper["previousPage"]>;
type DefinitionListItem = Readonly<{
  key: string;
  term: string;
  value: DefinitionListValue;
}>;

function isPostCandidate(
  candidate: unknown,
  postsBaseUrl: string,
): candidate is Lume.Data {
  if (!isLumeData(candidate)) {
    return false;
  }

  const candidateUrl = typeof candidate.url === "string" ? candidate.url : "";
  if (!candidateUrl.startsWith(postsBaseUrl) || candidateUrl === postsBaseUrl) {
    return false;
  }

  if (candidate.type !== undefined && candidate.type !== "post") {
    return false;
  }

  return true;
}

function resolveMethod<TArgs extends unknown[], TResult>(
  value: unknown,
  key: PropertyKey,
): ((...args: TArgs) => TResult) | undefined {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }

  const method = Reflect.get(value, key);
  if (typeof method !== "function") {
    return undefined;
  }

  return (...args) => Reflect.apply(method, value, args) as TResult;
}

function resolveNavHelper(value: unknown): NavHelper {
  const previousPage = resolveMethod<Parameters<NavMethod>, unknown>(
    value,
    "previousPage",
  );
  const nextPage = resolveMethod<Parameters<NavMethod>, unknown>(
    value,
    "nextPage",
  );

  return {
    ...(previousPage ? { previousPage } : {}),
    ...(nextPage ? { nextPage } : {}),
  };
}

function resolveSearchHelper(
  value: unknown,
): Partial<SearchHelper> | undefined {
  const pages = resolveMethod<Parameters<SearchHelper["pages"]>, unknown>(
    value,
    "pages",
  );
  if (!pages) {
    return undefined;
  }

  return {
    pages: (query, sort) => {
      const result = pages(query, sort);
      return Array.isArray(result) ? result : [];
    },
  };
}

function resolveStringTags(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((tag): tag is string => typeof tag === "string")
    : [];
}

function resolveHtmlChildren(children: unknown): string | undefined {
  if (typeof children === "string") {
    return children;
  }

  const html = typeof children === "object" && children !== null
    ? Reflect.get(children, "__html")
    : undefined;
  return typeof html === "string" ? html : undefined;
}

function hasCodeBlocks(children: unknown): boolean {
  return /<pre>\s*<code\b/i.test(resolveHtmlChildren(children) ?? "");
}

function resolveCodeCopyAttribute(
  includeCodeCopyScript: boolean,
  label: string,
  fallback: string,
): string | undefined {
  return includeCodeCopyScript && label !== fallback ? label : undefined;
}

function resolveAdjacentPosts(
  currentUrl: string,
  postQuery: string,
  search: Partial<SearchHelper> | undefined,
): { prev?: Lume.Data; next?: Lume.Data } {
  const searchPages = search?.pages;
  if (typeof searchPages !== "function") {
    return {};
  }

  const posts = searchPages(postQuery, "date=asc").filter(isLumeData);
  const currentIndex = posts.findIndex((post) => post.url === currentUrl);
  const prev = currentIndex > 0 ? posts[currentIndex - 1] : undefined;
  const next = currentIndex >= 0 && currentIndex < posts.length - 1
    ? posts[currentIndex + 1]
    : undefined;

  return {
    ...(prev ? { prev } : {}),
    ...(next ? { next } : {}),
  };
}

function renderDefinitionList(
  items: readonly DefinitionListItem[],
  {
    itemClass,
    listClass,
    termClass,
    valueClass,
  }: {
    readonly itemClass: string;
    readonly listClass: string;
    readonly termClass: string;
    readonly valueClass: string;
  },
): SsxElement {
  return (
    <dl class={listClass}>
      {items.map(({ key, term, value }) => (
        <div key={key} class={itemClass}>
          <dt class={termClass}>{term}</dt>
          <dd class={valueClass}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function renderPostNavLink(
  post: Lume.Data | undefined,
  label: string,
  isNext = false,
): SsxElement {
  if (post === undefined) {
    return <div class="post-nav-placeholder" aria-hidden="true"></div>;
  }

  return (
    <div class={`post-nav-item${isNext ? " post-nav-item--next" : ""}`}>
      <span class="post-nav-label">{label}</span>
      <a href={post.url ?? ""} class="post-nav-title">
        {post.title ?? ""}
      </a>
    </div>
  );
}

export default (data: Lume.Data, helpers: Lume.Helpers) => {
  const dateFormat = resolveDateHelper(helpers);
  const nav = resolveNavHelper(data.nav);
  const language = resolveSiteLanguage(data.lang);
  const languageDataCode = getLanguageDataCode(language);
  const { archiveUrl: postsBaseUrl, homeUrl, translations } = getPageContext(
    language,
  );
  const postQuery = `type=post lang=${languageDataCode}`;
  const currentUrl = typeof data.url === "string" ? data.url : "/";
  const search = resolveSearchHelper(data.search);
  let { prev, next } = resolveAdjacentPosts(
    currentUrl,
    postQuery,
    search,
  );

  const navPrev = nav.previousPage?.(
    currentUrl,
    postsBaseUrl,
    postQuery,
    "date=asc",
  );
  if (prev === undefined && isPostCandidate(navPrev, postsBaseUrl)) {
    prev = navPrev;
  }

  const navNext = nav.nextPage?.(
    currentUrl,
    postsBaseUrl,
    postQuery,
    "date=asc",
  );
  if (next === undefined && isPostCandidate(navNext, postsBaseUrl)) {
    next = navNext;
  }

  const postDate = resolvePostDate(data.date);
  const minutes = resolveReadingMinutes(data.readingInfo);
  const tags = resolveStringTags(data.tags);
  const includeCodeCopyScript = hasCodeBlocks(data.children);
  const rawChildrenHtml = resolveHtmlChildren(data.children);
  const enhancedPostContent = typeof rawChildrenHtml === "string"
    ? enhancePostContent(rawChildrenHtml)
    : { html: "", outline: [] };
  const renderedChildren = typeof rawChildrenHtml === "string"
    ? { __html: enhancedPostContent.html }
    : data.children;
  const outline = enhancedPostContent.outline;
  const codeCopyLabel = translations.post.copyCodeLabel;
  const codeCopyFeedback = translations.post.copyCodeFeedback;
  const codeCopyFailedFeedback = translations.post.copyCodeFailedFeedback;
  const codeCopyLabelAttribute = resolveCodeCopyAttribute(
    includeCodeCopyScript,
    codeCopyLabel,
    "Copy code",
  );
  const codeCopyFeedbackAttribute = resolveCodeCopyAttribute(
    includeCodeCopyScript,
    codeCopyFeedback,
    "Code copied",
  );
  const codeCopyFailedFeedbackAttribute = resolveCodeCopyAttribute(
    includeCodeCopyScript,
    codeCopyFailedFeedback,
    "Cannot copy code",
  );

  const publishedDateIso = dateFormat(postDate, "ATOM", language) ??
    formatRfc3339Instant(postDate);
  const publishedDateLabel = dateFormat(postDate, "HUMAN_DATE", language) ??
    formatRfc3339Instant(postDate);
  const readingTimeLabel = minutes !== undefined
    ? formatReadingTime(minutes, language)
    : undefined;
  const visibleSummary = resolveOptionalTrimmedString(data.description);
  const hasRail = outline.length > 0 ||
    tags.length > 0 ||
    prev !== undefined ||
    next !== undefined;
  const showSummaryBlock = visibleSummary !== undefined ||
    outline.length > 0;
  const summaryItems = [
    readingTimeLabel === undefined ? undefined : {
      key: "reading-time",
      term: translations.post.readingLabel,
      value: readingTimeLabel,
    },
    outline.length === 0 ? undefined : {
      key: "sections",
      term: translations.post.sectionsLabel,
      value: outline.length,
    },
  ].filter(isDefined);
  const publicationDetails: DefinitionListItem[] = [
    {
      key: "published",
      term: translations.post.publishedLabel,
      value: (
        <time datetime={publishedDateIso}>
          {publishedDateLabel}
        </time>
      ),
    },
    readingTimeLabel === undefined ? undefined : {
      key: "reading-time",
      term: translations.post.readingLabel,
      value: readingTimeLabel,
    },
    {
      key: "permalink",
      term: translations.post.permalinkLabel,
      value: <a href={currentUrl} class="post-details-link">{currentUrl}</a>,
    },
  ].filter(isDefined);

  return (
    <div class="site-page-shell site-page-shell--wide">
      <div
        class={`feature-layout${hasRail ? " feature-layout--with-rail" : ""}`}
      >
        <article
          class="post-article feature-main"
          data-code-copy-label={codeCopyLabelAttribute}
          data-code-copy-feedback={codeCopyFeedbackAttribute}
          data-code-copy-failed-feedback={codeCopyFailedFeedbackAttribute}
        >
          <header class="post-header pagehead post-pagehead">
            <nav
              class="cds--breadcrumb"
              aria-label={translations.post.breadcrumbAriaLabel}
            >
              <ol class="cds--breadcrumb-list">
                <li class="cds--breadcrumb-item">
                  <a href={homeUrl} class="cds--breadcrumb-link">
                    {translations.navigation.home}
                  </a>
                </li>
                <li class="cds--breadcrumb-item">
                  <a href={postsBaseUrl} class="cds--breadcrumb-link">
                    {translations.navigation.writing}
                  </a>
                </li>
              </ol>
            </nav>
            <div class="post-pagehead-grid">
              <div class="post-pagehead-copy">
                <h1 class="post-title">{data.title ?? ""}</h1>
                <div class="post-meta">
                  <time
                    datetime={publishedDateIso}
                  >
                    {publishedDateLabel}
                  </time>
                  {minutes !== undefined && (
                    <>
                      <span class="post-meta-separator" aria-hidden="true">
                        ·
                      </span>
                      <span>{readingTimeLabel}</span>
                    </>
                  )}
                </div>
              </div>
              {showSummaryBlock && (
                <div class="post-pagehead-context">
                  {visibleSummary !== undefined && (
                    <>
                      <p class="post-pagehead-kicker">
                        {translations.post.summaryEyebrow}
                      </p>
                      <p class="post-pagehead-summary pagehead-lead">
                        {visibleSummary}
                      </p>
                    </>
                  )}
                  {summaryItems.length > 0 &&
                    renderDefinitionList(summaryItems, {
                      listClass: "post-summary-meta",
                      itemClass: "post-summary-meta-group",
                      termClass: "post-summary-term",
                      valueClass: "post-summary-value",
                    })}
                </div>
              )}
            </div>
          </header>
          <div class="post-content">
            {renderedChildren}
          </div>
          <div class="post-details-section">
            <ul
              class="cds--accordion site-accordion post-details-accordion"
              data-site-accordion=""
            >
              <li class="cds--accordion__item">
                <button
                  type="button"
                  class="cds--accordion__heading"
                  data-accordion-trigger=""
                  aria-expanded="false"
                  aria-controls="post-publication-details"
                >
                  <SiteIcon
                    name="chevron-down"
                    className="cds--accordion__arrow"
                    width={16}
                    height={16}
                  />
                  <span class="cds--accordion__title">
                    {translations.post.detailsTitle}
                  </span>
                </button>
                <div
                  id="post-publication-details"
                  class="cds--accordion__wrapper"
                  data-accordion-panel=""
                  hidden
                >
                  <div class="cds--accordion__content">
                    {renderDefinitionList(publicationDetails, {
                      listClass: "post-details-list",
                      itemClass: "post-details-item",
                      termClass: "post-details-term",
                      valueClass: "post-details-value",
                    })}
                  </div>
                </div>
              </li>
            </ul>
          </div>
          {includeCodeCopyScript && (
            <script src="/scripts/post-code-copy.js" defer></script>
          )}
          <script src="/scripts/surface-controls.js" defer></script>
        </article>

        {hasRail && (
          <aside
            class="feature-rail post-rail"
            aria-label={translations.post.railAriaLabel}
          >
            <div class="feature-rail-sticky">
              {outline.length > 0 && (
                <section class="feature-card post-rail-card post-outline-card">
                  <h2 class="feature-card-title">
                    {translations.post.outlineTitle}
                  </h2>
                  <nav
                    class="post-outline-nav"
                    aria-label={translations.post.outlineAriaLabel}
                  >
                    <ul class="post-outline-list">
                      {outline.map((item) => (
                        <li
                          key={item.id}
                          class={`post-outline-item post-outline-item--level-${item.level}`}
                        >
                          <a href={`#${item.id}`} class="post-outline-link">
                            {item.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </section>
              )}

              {tags.length > 0 && (
                <section class="feature-card post-rail-card post-tags-card">
                  <h2 class="feature-card-title">
                    {translations.post.tagsAriaLabel}
                  </h2>
                  <ul class="post-tags post-tags--rail">
                    {tags.map((tag, index) => {
                      const tagLabel = String(tag);
                      const _color = getTagColor(tagLabel);
                      return (
                        <li
                          key={`${tagLabel}-${index}`}
                        >
                          <a
                            href={getTagUrl(tagLabel, language)}
                            class={`tag-link tag-link--${_color}`}
                            rel="tag"
                            title={tagLabel}
                          >
                            <span class="tag-link__label">{tagLabel}</span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}

              {(prev !== undefined || next !== undefined) && (
                <section class="feature-card post-rail-card post-nav-card">
                  <h2 class="feature-card-title">
                    {translations.post.navigationAriaLabel}
                  </h2>
                  <nav
                    class="post-nav post-nav--rail"
                    aria-label={translations.post.navigationAriaLabel}
                  >
                    {renderPostNavLink(prev, translations.post.previousLabel)}
                    {renderPostNavLink(
                      next,
                      translations.post.nextLabel,
                      true,
                    )}
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

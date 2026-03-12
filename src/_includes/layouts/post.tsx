/** Individual post layout - chains into the base layout. */

import {
  formatReadingTime,
  getLanguageDataCode,
  getLocalizedUrl,
  getSiteTranslations,
  resolveSiteLanguage,
} from "../../utils/i18n.ts";
import {
  resolvePostDate,
  resolveReadingMinutes,
} from "../../posts/post-metadata.ts";

/** This layout is itself wrapped by the base layout. */
export const layout = "layouts/base.tsx";

/** Typed helpers used in this layout. */
type H = {
  date: (value: unknown, pattern?: string, lang?: string) => string | undefined;
};

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
  ) => Lume.Data | undefined;
  nextPage?: (
    url: string,
    base?: string,
    query?: string,
    sort?: string,
  ) => Lume.Data | undefined;
};

/** Minimal interface for the search helper injected by Lume. */
type SearchHelper = {
  pages: (query: string, sort?: string) => Lume.Data[];
};

/** Returns true when the candidate looks like a post URL in the expected base path. */
function isPostCandidate(
  candidate: Lume.Data | undefined,
  postsBaseUrl: string,
): boolean {
  if (candidate === undefined) {
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

/** Returns true when the post body contains at least one `<pre><code>` block. */
function hasCodeBlocks(children: unknown): boolean {
  const codeBlockPattern = /<pre>\s*<code\b/i;

  if (typeof children === "string") {
    return codeBlockPattern.test(children);
  }

  if (
    typeof children === "object" &&
    children !== null &&
    "__html" in children
  ) {
    const html = (children as { readonly __html?: unknown }).__html;
    return typeof html === "string" && codeBlockPattern.test(html);
  }

  return false;
}

/** Renders the post page within the base layout. */
export default (data: Lume.Data, helpers: Lume.Helpers) => {
  const { date: dateFormat } = helpers as unknown as H;

  // data.nav is typed as `unknown` by Lume; cast to the minimal NavHelper
  // interface declared above (§5.4 - library boundary).
  const n = data.nav as unknown as NavHelper;
  const language = resolveSiteLanguage(data.lang);
  const languageDataCode = getLanguageDataCode(language);
  const translations = getSiteTranslations(language);
  const postQuery = `type=post lang=${languageDataCode}`;
  const currentUrl = data.url ?? "/";
  const postsBaseUrl = getLocalizedUrl("/posts/", language);
  const search = data.search as Partial<SearchHelper> | undefined;
  let prev: Lume.Data | undefined;
  let next: Lume.Data | undefined;

  if (typeof search?.pages === "function") {
    const posts = search.pages(postQuery, "date=asc");
    const currentIndex = posts.findIndex((post) => post.url === currentUrl);

    if (currentIndex > 0) {
      prev = posts[currentIndex - 1];
    }

    if (currentIndex >= 0 && currentIndex < posts.length - 1) {
      next = posts[currentIndex + 1];
    }
  }

  if (prev === undefined && typeof n.previousPage === "function") {
    const navPrev = n.previousPage(
      currentUrl,
      postsBaseUrl,
      postQuery,
      "date=asc",
    );
    prev = isPostCandidate(navPrev, postsBaseUrl) ? navPrev : undefined;
  }

  if (next === undefined && typeof n.nextPage === "function") {
    const navNext = n.nextPage(currentUrl, postsBaseUrl, postQuery, "date=asc");
    next = isPostCandidate(navNext, postsBaseUrl) ? navNext : undefined;
  }

  const postDate = resolvePostDate(data.date);
  const minutes = resolveReadingMinutes(data.readingInfo);
  const homeUrl = getLocalizedUrl("/", language);
  const currentTitle = typeof data.title === "string" ? data.title : "";
  const includeCodeCopyScript = hasCodeBlocks(data.children);

  return (
    <article
      class="post-article"
      data-code-copy-label={translations.post.copyCodeLabel}
      data-code-copy-feedback={translations.post.copyCodeFeedback}
      data-code-copy-failed-feedback={translations.post.copyCodeFailedFeedback}
    >
      <header class="post-header pagehead post-pagehead">
        <nav
          class="post-breadcrumb-shell"
          aria-label={translations.post.breadcrumbAriaLabel}
        >
          <cds-breadcrumb class="post-breadcrumb" size="sm" no-trailing-slash>
            <cds-breadcrumb-item>
              <cds-link href={homeUrl} size="sm">
                {translations.navigation.home}
              </cds-link>
            </cds-breadcrumb-item>
            <cds-breadcrumb-item>
              <cds-link href={postsBaseUrl} size="sm">
                {translations.navigation.writing}
              </cds-link>
            </cds-breadcrumb-item>
            <cds-breadcrumb-item>
              <span class="post-breadcrumb-current" aria-current="page">
                {currentTitle}
              </span>
            </cds-breadcrumb-item>
          </cds-breadcrumb>
        </nav>
        <h1 class="post-title">{data.title ?? ""}</h1>
        <div class="post-meta">
          <time
            datetime={dateFormat(postDate, "ATOM", language) ??
              postDate.toISOString()}
          >
            {dateFormat(postDate, "HUMAN_DATE", language) ??
              postDate.toISOString()}
          </time>
          {minutes !== undefined && (
            <>
              <span class="post-meta-separator" aria-hidden="true">·</span>
              <span>{formatReadingTime(minutes, language)}</span>
            </>
          )}
        </div>
      </header>
      <div class="post-content">
        {data.children}
      </div>
      <nav class="post-nav" aria-label={translations.post.navigationAriaLabel}>
        {prev
          ? (
            <div class="post-nav-item">
              <span class="post-nav-label">
                {translations.post.previousLabel}
              </span>
              <a href={prev.url ?? ""} class="post-nav-title">
                {prev.title ?? ""}
              </a>
            </div>
          )
          : <div class="post-nav-placeholder" aria-hidden="true"></div>}
        {next
          ? (
            <div class="post-nav-item post-nav-item--next">
              <span class="post-nav-label">{translations.post.nextLabel}</span>
              <a href={next.url ?? ""} class="post-nav-title">
                {next.title ?? ""}
              </a>
            </div>
          )
          : <div class="post-nav-placeholder" aria-hidden="true"></div>}
      </nav>
      {includeCodeCopyScript && (
        <script src="/scripts/post-code-copy.js" defer></script>
      )}
    </article>
  );
};

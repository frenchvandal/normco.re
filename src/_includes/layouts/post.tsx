/** Individual post layout - chains into the base layout. */

import {
  formatReadingTime,
  getLanguageDataCode,
  getLocalizedUrl,
  getSiteTranslations,
  resolveSiteLanguage,
} from "../../utils/i18n.ts";
import HEntryShell from "../../mf2/components/HEntryShell.tsx";
import { getAuthorIdentity } from "../../mf2/extractors.ts";
import { getTagColor, getTagUrl } from "../../utils/tags.ts";
import {
  resolvePostDate,
  resolveReadingMinutes,
} from "../../posts/post-metadata.ts";

/** This layout is itself wrapped by the base layout. */
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

/** Minimal interface for the search helper injected by Lume. */
type SearchHelper = {
  pages: (query: string, sort?: string) => ReadonlyArray<unknown>;
};

type DateHelper = (
  value: unknown,
  pattern?: string,
  lang?: string,
) => string | undefined;

function isLumeData(value: unknown): value is Lume.Data {
  return typeof value === "object" && value !== null;
}

/** Returns true when the candidate looks like a post URL in the expected base path. */
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

function resolveDateHelper(helpers: Lume.Helpers): DateHelper {
  const helper = Reflect.get(helpers, "date");

  if (typeof helper !== "function") {
    return () => undefined;
  }

  return (value, pattern, lang) => {
    const result = Reflect.apply(helper, helpers, [value, pattern, lang]);
    return typeof result === "string" ? result : undefined;
  };
}

function resolveNavHelper(value: unknown): NavHelper {
  if (typeof value !== "object" || value === null) {
    return {};
  }

  const previousPage = Reflect.get(value, "previousPage");
  const nextPage = Reflect.get(value, "nextPage");

  return {
    ...(typeof previousPage === "function"
      ? {
        previousPage: (url, base, query, sort) =>
          Reflect.apply(previousPage, value, [url, base, query, sort]),
      }
      : {}),
    ...(typeof nextPage === "function"
      ? {
        nextPage: (url, base, query, sort) =>
          Reflect.apply(nextPage, value, [url, base, query, sort]),
      }
      : {}),
  };
}

function resolveSearchHelper(
  value: unknown,
): Partial<SearchHelper> | undefined {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }

  const pages = Reflect.get(value, "pages");

  if (typeof pages !== "function") {
    return undefined;
  }

  return {
    pages: (query, sort) => {
      const result = Reflect.apply(pages, value, [query, sort]);
      return Array.isArray(result) ? result : [];
    },
  };
}

function resolveStringTags(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((tag): tag is string => typeof tag === "string")
    : [];
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
  const dateFormat = resolveDateHelper(helpers);
  const n = resolveNavHelper(data.nav);
  const language = resolveSiteLanguage(data.lang);
  const languageDataCode = getLanguageDataCode(language);
  const translations = getSiteTranslations(language);
  const postQuery = `type=post lang=${languageDataCode}`;
  const currentUrl = typeof data.url === "string" ? data.url : "/";
  const postsBaseUrl = getLocalizedUrl("/posts/", language);
  const search = resolveSearchHelper(data.search);
  let prev: Lume.Data | undefined;
  let next: Lume.Data | undefined;

  if (typeof search?.pages === "function") {
    const posts = search.pages(postQuery, "date=asc").filter(isLumeData);
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
  const description = typeof data.description === "string" &&
      data.description.length > 0
    ? data.description
    : undefined;
  const tags = resolveStringTags(data.tags);
  const author = getAuthorIdentity(language, data.author);
  const includeCodeCopyScript = hasCodeBlocks(data.children);
  const codeCopyLabel = translations.post.copyCodeLabel;
  const codeCopyFeedback = translations.post.copyCodeFeedback;
  const codeCopyFailedFeedback = translations.post.copyCodeFailedFeedback;
  const codeCopyLabelAttribute = includeCodeCopyScript &&
      codeCopyLabel !== "Copy code"
    ? codeCopyLabel
    : undefined;
  const codeCopyFeedbackAttribute = includeCodeCopyScript &&
      codeCopyFeedback !== "Code copied"
    ? codeCopyFeedback
    : undefined;
  const codeCopyFailedFeedbackAttribute = includeCodeCopyScript &&
      codeCopyFailedFeedback !== "Cannot copy code"
    ? codeCopyFailedFeedback
    : undefined;

  const hasRail = tags.length > 0 || prev !== undefined || next !== undefined;

  return (
    <div class="site-page-shell site-page-shell--wide">
      <div
        class={`feature-layout${hasRail ? " feature-layout--with-rail" : ""}`}
      >
        <HEntryShell
          className="post-article feature-main h-entry"
          rootAttributes={{
            "data-code-copy-label": codeCopyLabelAttribute,
            "data-code-copy-feedback": codeCopyFeedbackAttribute,
            "data-code-copy-failed-feedback": codeCopyFailedFeedbackAttribute,
          }}
          url={currentUrl}
          author={author}
          categories={tags}
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
                <li class="cds--breadcrumb-item">
                  <span class="cds--breadcrumb-current" aria-current="page">
                    {currentTitle}
                  </span>
                </li>
              </ol>
            </nav>
            <h1 class="post-title p-name">{data.title ?? ""}</h1>
            {description !== undefined && (
              <p class="post-dek p-summary">{description}</p>
            )}
            <div class="post-meta">
              <time
                class="dt-published"
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
          <div class="post-content e-content">
            {data.children}
          </div>
          {includeCodeCopyScript && (
            <script src="/scripts/post-code-copy.js" defer></script>
          )}
        </HEntryShell>

        {hasRail && (
          <aside
            class="feature-rail post-rail"
            aria-label={translations.post.railAriaLabel}
          >
            <div class="feature-rail-sticky">
              {tags.length > 0 && (
                <section class="feature-card">
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
                            class={`tag-link tag-link--${_color} p-category`}
                            rel="tag"
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
                <section class="feature-card">
                  <h2 class="feature-card-title">
                    {translations.post.navigationAriaLabel}
                  </h2>
                  <nav
                    class="post-nav post-nav--rail"
                    aria-label={translations.post.navigationAriaLabel}
                  >
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
                      : (
                        <div class="post-nav-placeholder" aria-hidden="true">
                        </div>
                      )}
                    {next
                      ? (
                        <div class="post-nav-item post-nav-item--next">
                          <span class="post-nav-label">
                            {translations.post.nextLabel}
                          </span>
                          <a href={next.url ?? ""} class="post-nav-title">
                            {next.title ?? ""}
                          </a>
                        </div>
                      )
                      : (
                        <div class="post-nav-placeholder" aria-hidden="true">
                        </div>
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

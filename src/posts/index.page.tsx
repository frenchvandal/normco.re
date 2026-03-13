/** Posts archive - all posts grouped by year, newest first. */

import {
  formatPostCount,
  formatReadingTime,
  getLanguageDataCode,
  getSiteTranslations,
  resolveSiteLanguage,
} from "../utils/i18n.ts";
import { resolvePostDate, resolveReadingMinutes } from "./post-metadata.ts";

/** Typed helpers used in this page. */
type H = {
  date: (value: unknown, pattern?: string, lang?: string) => string | undefined;
};

/** Posts per page for pagination (Carbon recommends 10-25 for editorial content). */
const POSTS_PER_PAGE = 10;

/** Available language versions generated from this page. */
export const lang = ["en", "fr", "zh-hans", "zh-hant"] as const;
/** Archive page URL. */
export const url = "/posts/";
/** Lume layout template. */
export const layout = "layouts/base.tsx";
/** Page title. */
export const title = "Writing";
/** Page meta description. */
export const description = "All posts, grouped by year.";

/** French-only metadata overrides used by the multilanguage plugin. */
export const fr = {
  title: "Articles",
  description: "Tous les articles, regroupés par année.",
} as const;

/** Simplified Chinese metadata overrides used by the multilanguage plugin. */
export const zhHans = {
  title: "文章",
  description: "所有文章，按年份分组。",
} as const;

/** Traditional Chinese metadata overrides used by the multilanguage plugin. */
export const zhHant = {
  title: "文章",
  description: "所有文章，依年份分組。",
} as const;

// Override the `type = "post"` inherited from _data.ts so this page
// is not matched by `search.pages("type=post")` or nav plugin queries.
/** Page type - overrides the inherited `"post"` to exclude this page from post queries. */
export const type = "archive";

/** Renders the posts archive page body. */
export default (data: Lume.Data, helpers: Lume.Helpers): string => {
  const { date: dateFormat } = helpers as unknown as H;
  const language = resolveSiteLanguage(data.lang);
  const languageDataCode = getLanguageDataCode(language);
  const translations = getSiteTranslations(language);
  const shortDatePattern = language === "fr"
    ? "d MMM"
    : language === "zhHans" || language === "zhHant"
    ? "M月d日"
    : "SHORT";
  const posts = data.search.pages(
    `type=post lang=${languageDataCode}`,
    "date=desc",
  ) as Lume.Data[];

  // Group posts by year.
  const currentYear = new Date().getFullYear();
  const byYear = new Map<number, Lume.Data[]>();

  for (const post of posts) {
    const postDate = resolvePostDate(post.date, new Date(currentYear, 0, 1));
    const year = postDate.getFullYear();
    const existing = byYear.get(year) ?? [];
    existing.push(post);
    byYear.set(year, existing);
  }

  const years = [...byYear.keys()].sort((a, b) => b - a);

  const sections = years.map((year) => {
    const yearPosts = byYear.get(year) ?? [];
    const postCount = yearPosts.length;
    const yearSummary = formatPostCount(postCount, language);
    const items = yearPosts.map((post) => {
      const postDate = resolvePostDate(post.date, new Date(year, 0, 1));
      const minutes = resolveReadingMinutes(post.readingInfo);
      const readingTimePart = minutes !== undefined
        ? `<span class="archive-reading-time">${
          formatReadingTime(minutes, language)
        }</span>`
        : "";

      return `<li class="archive-item">
  <time class="archive-date" datetime="${
        dateFormat(postDate, "ATOM", language) ?? postDate.toISOString()
      }">${
        dateFormat(postDate, shortDatePattern, language) ??
          postDate.toISOString()
      }</time>
  <a href="${post.url}" class="archive-title">${post.title}</a>
  ${readingTimePart}
</li>`;
    }).join("\n");

    return `<section class="archive-year" id="archive-year-${year}" aria-labelledby="archive-year-heading-${year}">
  <header class="archive-year-header">
    <h2 id="archive-year-heading-${year}" class="archive-year-heading">${year}</h2>
    <p class="archive-year-summary">${yearSummary}</p>
  </header>
  <ul class="archive-list">
    ${items}
  </ul>
</section>`;
  }).join("\n");

  const yearNavItems = years.map((year) => {
    const postCount = (byYear.get(year) ?? []).length;
    const singleYearAriaCurrent = years.length === 1
      ? ' aria-current="location"'
      : "";

    return `<li class="archive-year-nav-item">
  <a href="#archive-year-${year}" class="archive-year-nav-link"${singleYearAriaCurrent}>
    <span class="archive-year-nav-label">${year}</span>
    <span class="archive-year-nav-count">${postCount}</span>
  </a>
</li>`;
  }).join("\n");

  const archiveIntro =
    `<nav class="bx--breadcrumb" aria-label="${translations.archive.breadcrumbAriaLabel}">
  <a href="/" class="bx--breadcrumb-item">Home</a>
  <span class="bx--breadcrumb-separator" aria-hidden="true">/</span>
  <a href="/posts/" class="bx--breadcrumb-item">Writing</a>
  <span class="bx--breadcrumb-separator" aria-hidden="true">/</span>
  <span class="bx--breadcrumb-item bx--breadcrumb-item--current" aria-current="page">Archive</span>
</nav>
<section class="pagehead archive-pagehead" aria-labelledby="archive-title">
  <p class="pagehead-eyebrow">${translations.archive.eyebrow}</p>
  <h1 id="archive-title" class="archive-page-title">${translations.archive.title}</h1>
  <p class="pagehead-lead">${translations.archive.lead}</p>
</section>`;

  const archiveBody = sections.length > 0
    ? `<section class="archive-activity" aria-label="${translations.archive.activityAriaLabel}">
  <div class="archive-activity-main">
    ${sections}
  </div>
  <aside class="archive-year-nav" aria-label="${translations.archive.yearsAriaLabel}">
    <ol class="archive-year-nav-list">
      ${yearNavItems}
    </ol>
  </aside>
</section>`
    : `<p class="blankslate">${translations.archive.emptyState}</p>`;

  const archiveYearNavScript = years.length > 1
    ? '<script src="/scripts/archive-year-nav.js" defer></script>'
    : "";

  // Carbon pagination — only show if more posts than POSTS_PER_PAGE
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const currentPage = 1; // Static for now; would be dynamic with query params
  const paginationMarkup = totalPages > 1
    ? `<nav class="bx--pagination" aria-label="${translations.archive.paginationAriaLabel}">
  <div class="bx--pagination__content">
    <span class="bx--pagination__text">
      ${
      translations.archive.paginationItemsRange.replace("{start}", "1").replace(
        "{end}",
        String(Math.min(POSTS_PER_PAGE, posts.length)),
      ).replace("{total}", String(posts.length))
    }
    </span>
    <div class="bx--pagination__control">
      <button class="bx--pagination__button bx--pagination__button--backward" disabled aria-label="${translations.archive.paginationPrevious}">
        <svg class="bx--pagination__button-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
          <path d="M11 3.5l-5 4.5 5 4.5V3.5z"/>
        </svg>
      </button>
      <div class="bx--pagination__pages">
        ${
      Array.from({ length: totalPages }, (_, i) => {
        const pageNum = i + 1;
        const isCurrent = pageNum === currentPage;
        return `<button class="bx--pagination__page-button${
          isCurrent ? '" aria-current="page' : ""
        }" aria-label="${translations.archive.paginationPage} ${pageNum}">${pageNum}</button>`;
      }).join("")
    }
      </div>
      <button class="bx--pagination__button bx--pagination__button--forward" aria-label="${translations.archive.paginationNext}">
        <svg class="bx--pagination__button-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
          <path d="M5 11.5l5-4.5-5-4.5v9z"/>
        </svg>
      </button>
    </div>
  </div>
</nav>`
    : "";

  return `${archiveIntro}
${archiveBody}
${paginationMarkup}
${archiveYearNavScript}`;
};

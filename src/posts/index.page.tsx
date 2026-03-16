/** Posts archive - all posts grouped by year, newest first. */

import StatePanel from "../_components/StatePanel.tsx";
import {
  formatPostCount,
  formatReadingTime,
  getLanguageDataCode,
  getLocalizedUrl,
  getSiteTranslations,
  resolveSiteLanguage,
} from "../utils/i18n.ts";
import { resolvePostDate, resolveReadingMinutes } from "./post-metadata.ts";

/** Typed component functions used on this page. */
type Comp = {
  PostCard: (props: {
    readonly title: string;
    readonly url: string;
    readonly dateStr: string;
    readonly dateIso: string;
    readonly readingLabel?: string;
  }) => string | Promise<string>;
};

/** Typed helpers used in this page. */
type H = {
  date: (value: unknown, pattern?: string, lang?: string) => string | undefined;
};

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
export default async (
  data: Lume.Data,
  helpers: Lume.Helpers,
): Promise<string> => {
  const { PostCard } = data.comp as unknown as Comp;
  const { date: dateFormat } = helpers as unknown as H;
  const language = resolveSiteLanguage(data.lang);
  const languageDataCode = getLanguageDataCode(language);
  const translations = getSiteTranslations(language);
  const homeUrl = getLocalizedUrl("/", language);
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

  const yearNavItems = years.map((year) =>
    `<li class="archive-year-nav-item">
  <a href="#archive-year-${year}" class="cds--tag cds--tag--default archive-year-nav-link">
    <span class="cds--tag__label">${year}</span>
  </a>
</li>`
  ).join("\n");

  const sections = await Promise.all(years.map(async (year) => {
    const yearPosts = byYear.get(year) ?? [];
    const postCount = yearPosts.length;
    const yearSummary = formatPostCount(postCount, language);
    const items = await Promise.all(yearPosts.map(async (post) => {
      const postDate = resolvePostDate(post.date, new Date(year, 0, 1));
      const minutes = resolveReadingMinutes(post.readingInfo);
      const card = await PostCard({
        title: post.title as string,
        url: post.url as string,
        dateStr: dateFormat(postDate, shortDatePattern, language) ??
          postDate.toISOString(),
        dateIso: dateFormat(postDate, "ATOM", language) ??
          postDate.toISOString(),
        ...(minutes !== undefined
          ? { readingLabel: formatReadingTime(minutes, language) }
          : {}),
      });

      return `<li class="archive-list-item">${card}</li>`;
    })).then((cards) => cards.join("\n"));

    return `<section class="archive-year" id="archive-year-${year}" aria-labelledby="archive-year-heading-${year}">
  <header class="archive-year-header">
    <div class="archive-year-heading-group">
      <h2 id="archive-year-heading-${year}" class="archive-year-heading">${year}</h2>
      <span class="cds--tag cds--tag--gray archive-year-summary">
        <span class="cds--tag__label">${yearSummary}</span>
      </span>
    </div>
  </header>
  <ul class="archive-list">
    ${items}
  </ul>
</section>`;
  }));

  const archiveIntro =
    `<nav class="cds--breadcrumb" aria-label="${translations.archive.breadcrumbAriaLabel}">
  <ol class="cds--breadcrumb-list">
    <li class="cds--breadcrumb-item">
      <a href="${homeUrl}" class="cds--breadcrumb-link">
        ${translations.navigation.home}
      </a>
    </li>
    <li class="cds--breadcrumb-item">
      <span class="cds--breadcrumb-current" aria-current="page">
        ${translations.archive.title}
      </span>
    </li>
  </ol>
</nav>
<section class="pagehead archive-pagehead" aria-labelledby="archive-title">
  <p class="pagehead-eyebrow">${translations.archive.eyebrow}</p>
  <h1 id="archive-title" class="archive-page-title">${translations.archive.title}</h1>
  <p class="pagehead-lead">${translations.archive.lead}</p>
</section>`;

  const archiveYearNav = years.length > 1
    ? `<nav class="archive-year-nav" aria-label="${translations.archive.yearsAriaLabel}">
  <ol class="archive-year-nav-list">
    ${yearNavItems}
  </ol>
</nav>`
    : "";

  const archiveBody = sections.length > 0
    ? `<section class="archive-activity" aria-label="${translations.archive.activityAriaLabel}">
  <div class="archive-activity-main">
    ${sections.join("\n")}
  </div>
</section>`
    : StatePanel({
      title: translations.archive.emptyStateTitle,
      message: translations.archive.emptyState,
      actionHref: homeUrl,
      actionLabel: translations.navigation.home,
      headingTag: "h2",
      variant: "inline",
    });

  const archiveLayoutClass = archiveYearNav
    ? "feature-layout feature-layout--with-rail"
    : "feature-layout";
  const archiveRail = archiveYearNav
    ? `<aside class="feature-rail archive-rail" aria-label="${translations.archive.railAriaLabel}">
  <div class="feature-rail-sticky">
    <section class="feature-card">
      <h2 class="feature-card-title">${translations.archive.yearsAriaLabel}</h2>
      <p class="feature-card-caption">${
      formatPostCount(posts.length, language)
    }</p>
      ${archiveYearNav}
    </section>
  </div>
</aside>`
    : "";

  return `<div class="site-page-shell site-page-shell--wide">
<div class="${archiveLayoutClass}">
  <div class="feature-main">
    ${archiveIntro}
    ${archiveBody}
  </div>
  ${archiveRail}
</div>
</div>`;
};

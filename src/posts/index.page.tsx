/** Posts archive - all posts grouped by year, newest first. */

import { renderComponent } from "lume/jsx-runtime";

import StatePanel from "../_components/StatePanel.tsx";
import HEntryShell from "../mf2/components/HEntryShell.tsx";
import HFeedShell from "../mf2/components/HFeedShell.tsx";
import { getAuthorIdentity, getCanonicalFeedUrl } from "../mf2/extractors.ts";
import {
  formatPostCount,
  formatReadingTime,
  getLanguageDataCode,
  getLocalizedUrl,
  getSiteTranslations,
  resolveSiteLanguage,
} from "../utils/i18n.ts";
import { resolvePostDate, resolveReadingMinutes } from "./post-metadata.ts";
import { escapeHtml } from "../utils/html.ts";

/** Typed component functions used on this page. */
type Comp = {
  PostCard: (props: {
    readonly title: string;
    readonly url: string;
    readonly dateStr: string;
    readonly dateIso: string;
    readonly readingLabel?: string;
    readonly summary?: string;
    readonly authorName?: string;
    readonly authorUrl?: string;
  }) => string | Promise<string>;
};

/** Typed helpers used in this page. */
type H = {
  date: (value: unknown, pattern?: string, lang?: string) => string | undefined;
};

function isLumeData(value: unknown): value is Lume.Data {
  return typeof value === "object" && value !== null;
}

function resolvePostCardRenderer(value: unknown): Comp["PostCard"] {
  if (typeof value === "object" && value !== null) {
    const PostCard = Reflect.get(value, "PostCard");

    if (typeof PostCard === "function") {
      return (props) => {
        const rendered = Reflect.apply(PostCard, value, [props]);
        return rendered instanceof Promise ? rendered : String(rendered);
      };
    }
  }

  return (
    {
      title,
      url,
      dateStr,
      dateIso,
      readingLabel,
      summary,
      authorName,
      authorUrl,
    },
  ) =>
    renderComponent(
      HEntryShell({
        className: "post-card h-entry",
        ...(authorName && authorUrl
          ? { author: { name: authorName, url: authorUrl } }
          : {}),
        children: {
          __html: `<time class="post-card-date dt-published" datetime="${
            escapeHtml(dateIso)
          }">${
            escapeHtml(dateStr)
          }</time><h3 class="post-card-title p-name"><a class="post-card-link u-url u-uid" href="${
            escapeHtml(url)
          }">${escapeHtml(title)}</a></h3>${
            summary
              ? `<p class="post-card-summary p-summary">${
                escapeHtml(summary)
              }</p>`
              : ""
          }${
            readingLabel
              ? `<span class="post-card-reading-time">${
                escapeHtml(readingLabel)
              }</span>`
              : ""
          }`,
        },
      }),
    );
}

function resolveDateHelper(helpers: Lume.Helpers): H["date"] {
  const date = Reflect.get(helpers, "date");

  if (typeof date !== "function") {
    return () => undefined;
  }

  return (value, pattern, lang) => {
    const formatted = Reflect.apply(date, helpers, [value, pattern, lang]);
    return typeof formatted === "string" ? formatted : undefined;
  };
}

function resolveArchivePosts(
  search: unknown,
  languageDataCode: string,
): Lume.Data[] {
  if (typeof search !== "object" || search === null) {
    return [];
  }

  const pages = Reflect.get(search, "pages");

  if (typeof pages !== "function") {
    return [];
  }

  const results = Reflect.apply(pages, search, [
    `type=post lang=${languageDataCode}`,
    "date=desc",
  ]);

  return Array.isArray(results) ? results.filter(isLumeData) : [];
}

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
  const PostCard = resolvePostCardRenderer(data.comp);
  const dateFormat = resolveDateHelper(helpers);
  const language = resolveSiteLanguage(data.lang);
  const languageDataCode = getLanguageDataCode(language);
  const translations = getSiteTranslations(language);
  const homeUrl = getLocalizedUrl("/", language);
  const feedUrl = getCanonicalFeedUrl(language);
  const shortDatePattern = language === "fr"
    ? "d MMM"
    : language === "zhHans" || language === "zhHant"
    ? "M月d日"
    : "SHORT";
  const posts = resolveArchivePosts(data.search, languageDataCode);
  const author = getAuthorIdentity(language, data.author);

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

  // Keep archive navigation distinct from editorial taxonomy tags by using a
  // dedicated secondary-nav pattern for in-page year jumps.
  const yearNavItems = years.map((year, index) => {
    const postCount = (byYear.get(year) ?? []).length;
    const yearSummary = formatPostCount(postCount, language);
    const targetId = `archive-year-${year}`;

    return `<li class="archive-year-nav-item">
  <a href="#${targetId}" class="archive-year-nav-link" data-archive-year-link=""${
      index === 0 ? ' aria-current="location"' : ""
    }>
    <span class="archive-year-nav-link-label">${year}</span>
    <span class="archive-year-nav-link-meta">${escapeHtml(yearSummary)}</span>
  </a>
</li>`;
  }).join("\n");
  const yearJumpOptions = years.map((year, index) => {
    const postCount = (byYear.get(year) ?? []).length;
    const yearSummary = formatPostCount(postCount, language);
    const selected = index === 0 ? ' selected=""' : "";

    return `<option value="archive-year-${year}"${selected}>${
      escapeHtml(`${year} — ${yearSummary}`)
    }</option>`;
  }).join("\n");

  const sections = await Promise.all(years.map(async (year) => {
    const yearPosts = byYear.get(year) ?? [];
    const postCount = yearPosts.length;
    const yearSummary = formatPostCount(postCount, language);
    const items = await Promise.all(yearPosts.map(async (post) => {
      const postDate = resolvePostDate(post.date, new Date(year, 0, 1));
      const minutes = resolveReadingMinutes(post.readingInfo);
      const card = await PostCard({
        title: typeof post.title === "string" ? post.title : "",
        url: typeof post.url === "string" ? post.url : "",
        dateStr: dateFormat(postDate, shortDatePattern, language) ??
          postDate.toISOString(),
        dateIso: dateFormat(postDate, "ATOM", language) ??
          postDate.toISOString(),
        ...(typeof post.description === "string" && post.description.length > 0
          ? { summary: post.description }
          : {}),
        authorName: author.name,
        authorUrl: author.url,
        ...(minutes !== undefined
          ? { readingLabel: formatReadingTime(minutes, language) }
          : {}),
      });

      return `<li class="archive-list-item">${card}</li>`;
    })).then((cards) => cards.join("\n"));

    return `<section class="archive-year" id="archive-year-${year}" data-archive-year-section="" aria-labelledby="archive-year-heading-${year}">
  <header class="archive-year-header">
    <div class="archive-year-heading-group">
      <h2 id="archive-year-heading-${year}" class="archive-year-heading">${year}</h2>
      <span class="cds--tag cds--tag--gray archive-year-summary">
        <span class="cds--tag__label">${escapeHtml(yearSummary)}</span>
      </span>
    </div>
  </header>
  <ul class="archive-list">
    ${items}
  </ul>
</section>`;
  }));

  const archiveIntro = `<nav class="cds--breadcrumb" aria-label="${
    escapeHtml(translations.archive.breadcrumbAriaLabel)
  }">
  <ol class="cds--breadcrumb-list">
    <li class="cds--breadcrumb-item">
      <a href="${escapeHtml(homeUrl)}" class="cds--breadcrumb-link">
        ${escapeHtml(translations.navigation.home)}
      </a>
    </li>
    <li class="cds--breadcrumb-item">
      <span class="cds--breadcrumb-current" aria-current="page">
        ${escapeHtml(translations.archive.title)}
      </span>
    </li>
  </ol>
</nav>
<section class="pagehead archive-pagehead" aria-labelledby="archive-title">
  <p class="pagehead-eyebrow">${escapeHtml(translations.archive.eyebrow)}</p>
  <h1 id="archive-title" class="archive-page-title p-name">${
    escapeHtml(translations.archive.title)
  }</h1>
  <p class="pagehead-lead">${escapeHtml(translations.archive.lead)}</p>
</section>`;

  const archiveYearNav = years.length > 1
    ? `<nav class="archive-year-nav" aria-label="${
      escapeHtml(translations.archive.yearsAriaLabel)
    }">
  <ol class="archive-year-nav-list">
    ${yearNavItems}
  </ol>
</nav>`
    : "";

  const archiveBody = sections.length > 0
    ? `<section class="archive-activity" aria-label="${
      escapeHtml(translations.archive.activityAriaLabel)
    }">
  ${
      archiveYearNav
        ? `<div class="archive-year-jump">
    <label for="archive-year-select" class="archive-year-jump-label">${
          escapeHtml(translations.archive.jumpToYearLabel)
        }</label>
    <select
      id="archive-year-select"
      class="archive-year-jump-select"
      data-archive-year-select=""
    >
      ${yearJumpOptions}
    </select>
  </div>`
        : ""
    }
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
  const archiveYearNavScript = archiveYearNav
    ? '<script src="/scripts/archive-year-nav.js" defer></script>'
    : "";
  const archiveRail = archiveYearNav
    ? `<aside class="feature-rail archive-rail" aria-label="${
      escapeHtml(translations.archive.railAriaLabel)
    }">
  <div class="feature-rail-sticky">
    <section class="feature-card archive-year-card">
      <h2 class="feature-card-title">${
      escapeHtml(translations.archive.yearsAriaLabel)
    }</h2>
      <p class="feature-card-caption">${
      escapeHtml(formatPostCount(posts.length, language))
    }</p>
      ${archiveYearNav}
    </section>
  </div>
</aside>`
    : "";

  const archiveFeed = await renderComponent(
    HFeedShell({
      className: "feature-main h-feed",
      url: feedUrl,
      author,
      children: {
        __html: `${archiveIntro}
    ${archiveBody}`,
      },
    }),
  );

  return `<div class="site-page-shell site-page-shell--wide">
<div class="${escapeHtml(archiveLayoutClass)}">
  ${archiveFeed}
  ${archiveRail}
</div>
</div>
${archiveYearNavScript}`;
};

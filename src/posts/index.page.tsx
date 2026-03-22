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
        className: "cds--tile post-card h-entry",
        ...(summary !== undefined ? { summary } : {}),
        ...(authorName && authorUrl
          ? { author: { name: authorName, url: authorUrl } }
          : {}),
        children: {
          __html: `<time class="post-card-date dt-published" datetime="${
            escapeHtml(dateIso)
          }">${
            escapeHtml(dateStr)
          }</time><h3 class="p-name"><a class="u-url u-uid" href="${
            escapeHtml(url)
          }">${escapeHtml(title)}</a></h3>${
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

function resolveCurrentYear(value: unknown): number {
  return typeof value === "number" && Number.isInteger(value)
    ? value
    : new Date().getFullYear();
}

function renderArchiveYearSection(
  {
    body,
    headingId,
    sectionId,
    year,
    yearSummary,
  }: {
    readonly body: string;
    readonly headingId: string;
    readonly sectionId: string;
    readonly year: number;
    readonly yearSummary: string;
  },
): string {
  return `<section class="archive-year" id="${
    escapeHtml(sectionId)
  }" aria-labelledby="${escapeHtml(headingId)}">
  <header class="archive-year-header">
    <div class="archive-year-heading-group">
      <h2 id="${
    escapeHtml(headingId)
  }" class="archive-year-heading">${year}</h2>
      <span class="cds--tag cds--tag--gray archive-year-summary" title="${
    escapeHtml(yearSummary)
  }">
        <span class="cds--tag__label">${escapeHtml(yearSummary)}</span>
      </span>
    </div>
  </header>
  ${body}
</section>`;
}

/** Available language versions generated from this page. */
export const lang = ["en", "fr", "zh-hans", "zh-hant"] as const;
/** Archive page URL. */
export const url = "/posts/";
/** Lume layout template. */
export const layout = "layouts/base.tsx";
/** Exclude archive listings from Pagefind in favor of source post pages. */
export const searchIndexed = false;
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
  const currentYear = resolveCurrentYear(Reflect.get(data, "currentYear"));
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
  const yearNavItems = years.map((year) => {
    const postCount = (byYear.get(year) ?? []).length;
    const yearSummary = formatPostCount(postCount, language);

    return `<li class="archive-year-nav-item">
  <a href="#archive-year-${year}" class="archive-year-nav-link">
    <span class="archive-year-nav-link-label">${year}</span>
    <span class="archive-year-nav-link-meta">${escapeHtml(yearSummary)}</span>
  </a>
</li>`;
  }).join("\n");

  const cardSections = await Promise.all(years.map(async (year) => {
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

    return renderArchiveYearSection({
      sectionId: `archive-year-${year}`,
      headingId: `archive-year-heading-${year}`,
      year,
      yearSummary,
      body: `<ul class="archive-list">
    ${items}
  </ul>`,
    });
  }));

  const listSections = years.map((year) => {
    const yearPosts = byYear.get(year) ?? [];
    const postCount = yearPosts.length;
    const yearSummary = formatPostCount(postCount, language);
    const rows = yearPosts.map((post) => {
      const postDate = resolvePostDate(post.date, new Date(year, 0, 1));
      const minutes = resolveReadingMinutes(post.readingInfo);
      const readingLabel = minutes !== undefined
        ? formatReadingTime(minutes, language)
        : "";

      return `<div class="cds--structured-list-row">
  <span class="cds--structured-list-td archive-structured-list-date">${
        escapeHtml(
          dateFormat(postDate, shortDatePattern, language) ??
            postDate.toISOString(),
        )
      }</span>
  <span class="cds--structured-list-td archive-structured-list-title">
    <a href="${
        escapeHtml(typeof post.url === "string" ? post.url : "")
      }" class="archive-structured-list-link">${
        escapeHtml(typeof post.title === "string" ? post.title : "")
      }</a>
  </span>
  <span class="cds--structured-list-td archive-structured-list-reading">${
        escapeHtml(readingLabel)
      }</span>
</div>`;
    }).join("\n");

    return renderArchiveYearSection({
      sectionId: `archive-list-year-${year}`,
      headingId: `archive-list-year-heading-${year}`,
      year,
      yearSummary,
      body:
        `<div class="cds--structured-list cds--structured-list--condensed archive-structured-list">
    <div class="cds--structured-list-thead">
      <div class="cds--structured-list-row cds--structured-list-row--header-row">
        <span class="cds--structured-list-th">${
          escapeHtml(translations.archive.listDateHeading)
        }</span>
        <span class="cds--structured-list-th">${
          escapeHtml(translations.archive.listTitleHeading)
        }</span>
        <span class="cds--structured-list-th">${
          escapeHtml(translations.archive.listReadingHeading)
        }</span>
      </div>
    </div>
    <div class="cds--structured-list-tbody">
      ${rows}
    </div>
  </div>`,
    });
  });

  const postsCountLabel = formatPostCount(posts.length, language);
  const archiveIntro = `<nav class="cds--breadcrumb" aria-label="${
    escapeHtml(translations.archive.breadcrumbAriaLabel)
  }">
  <ol class="cds--breadcrumb-list">
    <li class="cds--breadcrumb-item">
      <a href="${escapeHtml(homeUrl)}" class="cds--breadcrumb-link">
        ${escapeHtml(translations.navigation.home)}
      </a>
    </li>
  </ol>
</nav>
<section class="pagehead archive-pagehead" aria-labelledby="archive-title">
  <div class="archive-pagehead-grid">
    <div class="archive-pagehead-copy">
      <p class="pagehead-eyebrow">${
    escapeHtml(translations.archive.eyebrow)
  }</p>
      <h1 id="archive-title" class="archive-page-title p-name">${
    escapeHtml(translations.archive.title)
  }</h1>
      <p class="pagehead-lead">${escapeHtml(translations.archive.lead)}</p>
    </div>
    ${
    posts.length > 0
      ? `<div class="archive-pagehead-meta">
      <span class="cds--tag cds--tag--gray archive-page-count" title="${
        escapeHtml(postsCountLabel)
      }">
        <span class="cds--tag__label">${escapeHtml(postsCountLabel)}</span>
      </span>
    </div>`
      : ""
  }
  </div>
</section>${
    posts.length > 0
      ? `<div class="archive-tools">
  <div class="cds--content-switcher site-content-switcher archive-view-switcher" data-content-switcher="" role="tablist" aria-label="${
        escapeHtml(translations.archive.viewLabel)
      }">
  <button
    type="button"
    class="cds--content-switcher-btn cds--content-switcher--selected"
    id="archive-cards-tab"
    role="tab"
    data-content-switcher-trigger=""
    aria-selected="true"
    aria-controls="archive-cards-panel"
  >
    <span class="cds--content-switcher__label">${
        escapeHtml(translations.archive.cardsViewLabel)
      }</span>
  </button>
  <button
    type="button"
    class="cds--content-switcher-btn"
    id="archive-list-tab"
    role="tab"
    data-content-switcher-trigger=""
    aria-selected="false"
    tabindex="-1"
    aria-controls="archive-list-panel"
  >
    <span class="cds--content-switcher__label">${
        escapeHtml(translations.archive.listViewLabel)
      }</span>
  </button>
</div>
</div>`
      : ""
  }`;

  const archiveYearNav = years.length > 1
    ? `<nav class="archive-year-nav" aria-label="${
      escapeHtml(translations.archive.yearsAriaLabel)
    }">
  <ol class="archive-year-nav-list">
    ${yearNavItems}
  </ol>
</nav>`
    : "";

  const archiveBody = cardSections.length > 0
    ? `<section class="archive-activity" aria-label="${
      escapeHtml(translations.archive.activityAriaLabel)
    }">
  <div
    id="archive-cards-panel"
    class="archive-activity-main"
    role="tabpanel"
    aria-labelledby="archive-cards-tab"
    data-content-switcher-panel=""
  >
    ${cardSections.join("\n")}
  </div>
  <div
    id="archive-list-panel"
    class="archive-activity-main"
    role="tabpanel"
    aria-labelledby="archive-list-tab"
    data-content-switcher-panel=""
    hidden
  >
    ${listSections.join("\n")}
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
    ? `<aside class="feature-rail archive-rail" aria-label="${
      escapeHtml(translations.archive.railAriaLabel)
    }">
  <div class="feature-rail-sticky">
    <section class="cds--tile feature-card archive-year-card">
      <h2 class="feature-card-title">${
      escapeHtml(translations.archive.yearsAriaLabel)
    }</h2>
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
    ${archiveBody}
    ${
          posts.length > 0
            ? '<script src="/scripts/surface-controls.js" defer></script>'
            : ""
        }`,
      },
    }),
  );

  return `<div class="site-page-shell site-page-shell--wide">
<div class="${escapeHtml(archiveLayoutClass)}">
  ${archiveFeed}
  ${archiveRail}
</div>
</div>`;
};

/** Home page - hero + five most recent posts. */

import StatePanel from "./_components/StatePanel.tsx";
import { siteName } from "./_data.ts";
import {
  formatReadingTime,
  getLanguageDataCode,
  getLocalizedUrl,
  getSiteTranslations,
  resolveSiteLanguage,
} from "./utils/i18n.ts";
import {
  getLocalizedAuthorHCard,
  renderHiddenHCard,
  renderHiddenUrl,
} from "./utils/microformats.ts";
import {
  resolvePostDate,
  resolveReadingMinutes,
} from "./posts/post-metadata.ts";
import { escapeHtml } from "./utils/html.ts";

/** Available language versions generated from this page. */
export const lang = ["en", "fr", "zh-hans", "zh-hant"] as const;
/** Page URL. */
export const url = "/";
/** Page title - same as the site name for the home page. */
export const title: string = siteName;

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

  return ({ title, url, dateStr, dateIso, summary, authorName, authorUrl }) =>
    `<article class="post-card h-entry"><time class="post-card-date dt-published" datetime="${
      escapeHtml(dateIso)
    }">${
      escapeHtml(dateStr)
    }</time><h3 class="p-name"><a class="u-url u-uid" href="${
      escapeHtml(url)
    }">${escapeHtml(title)}</a></h3>${
      summary ? `<p class="p-summary sr-only">${escapeHtml(summary)}</p>` : ""
    }${
      authorName && authorUrl
        ? renderHiddenHCard({ name: authorName, url: authorUrl })
        : ""
    }</article>`;
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

function resolveRecentPosts(
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
    5,
  ]);

  return Array.isArray(results) ? results.filter(isLumeData) : [];
}

/** Renders the home page body. */
export default async (
  data: Lume.Data,
  helpers: Lume.Helpers,
): Promise<string> => {
  const PostCard = resolvePostCardRenderer(data.comp);
  const dateFormat = resolveDateHelper(helpers);
  const language = resolveSiteLanguage(data.lang);
  const languageDataCode = getLanguageDataCode(language);
  const translations = getSiteTranslations(language);
  const shortDatePattern = language === "fr"
    ? "d MMM"
    : language === "zhHans" || language === "zhHant"
    ? "M 月 d 日"
    : "SHORT";
  const aboutUrl = getLocalizedUrl("/about/", language);
  const currentUrl = getLocalizedUrl("/", language);
  const archiveUrl = getLocalizedUrl("/posts/", language);
  const recent = resolveRecentPosts(data.search, languageDataCode);
  const author = getLocalizedAuthorHCard(language, data.author);

  const postItems = await Promise.all(recent.map(async (post) => {
    const postDate = resolvePostDate(post.date);
    const minutes = resolveReadingMinutes(post.readingInfo);

    // exactOptionalPropertyTypes: only include readingLabel when it has a value.
    const card = await PostCard({
      title: typeof post.title === "string" ? post.title : "",
      url: typeof post.url === "string" ? post.url : "",
      dateStr: dateFormat(postDate, shortDatePattern, language) ??
        postDate.toISOString(),
      dateIso: dateFormat(postDate, "ATOM", language) ?? postDate.toISOString(),
      ...(typeof post.description === "string" && post.description.length > 0
        ? { summary: post.description }
        : {}),
      authorName: author.name,
      authorUrl: author.url,
      ...(minutes !== undefined
        ? { readingLabel: formatReadingTime(minutes, language) }
        : {}),
    });

    return `<li class="home-posts-item">${card}</li>`;
  })).then((items) => items.join("\n"));

  const emptyState = `<li class="home-posts-item home-posts-item--empty">
    ${
    StatePanel({
      title: translations.home.emptyStateTitle,
      message: translations.home.emptyState,
      actionHref: aboutUrl,
      actionLabel: translations.navigation.about,
      headingTag: "h3",
      variant: "inline",
    })
  }
  </li>`;

  return `<div class="site-page-shell site-page-shell--wide">
<section class="pagehead hero home-pagehead" aria-labelledby="home-title">
  <p class="pagehead-eyebrow">${escapeHtml(translations.home.eyebrow)}</p>
  <h1 id="home-title" class="hero-title">${
    escapeHtml(translations.home.title)
  }</h1>
  <p class="hero-lead">${escapeHtml(translations.home.lead)}</p>
</section>

<section class="home-recent h-feed" aria-labelledby="home-recent-title">
  <div class="subhead">
    <h2 id="home-recent-title" class="subhead-heading p-name">${
    escapeHtml(translations.home.recentHeading)
  }</h2>
    <a href="${escapeHtml(archiveUrl)}" class="home-all-posts">${
    escapeHtml(translations.home.archiveLinkLabel)
  }</a>
  </div>
  ${renderHiddenUrl(currentUrl)}
  ${renderHiddenHCard(author)}
  <ul class="home-posts">
    ${recent.length > 0 ? postItems : emptyState}
  </ul>
</section>
</div>`;
};

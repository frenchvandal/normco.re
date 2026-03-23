import StatePanel from "../_components/StatePanel.tsx";
import { formatRfc3339Instant } from "../utils/date-time.ts";
import {
  formatPostCount,
  formatReadingTime,
  formatShortDate,
  getLanguageDataCode,
  getPageContext,
  resolveSiteLanguage,
} from "../utils/i18n.ts";
import { resolvePostDate, resolveReadingMinutes } from "./post-metadata.ts";
import { escapeHtml } from "../utils/html.ts";
import {
  resolveDateHelper,
  resolvePostCardRenderer,
} from "../utils/lume-helpers.ts";
import { isLumeData, resolveOptionalString } from "../utils/type-guards.ts";

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

export const lang = ["en", "fr", "zh-hans", "zh-hant"] as const;
export const url = "/posts/";
export const layout = "layouts/base.tsx";
// Keep Pagefind focused on canonical post detail pages instead of aggregate
// listings that repeat the same content.
export const searchIndexed = false;
export const title = "Articles";
export const description = "All published articles, newest first.";

export const fr = {
  title: "Articles",
  description: "Tous les articles publiés, du plus récent au plus ancien.",
} as const;

export const zhHans = {
  title: "文章",
  description: "所有已发布文章，按时间倒序排列。",
} as const;

export const zhHant = {
  title: "文章",
  description: "所有已發佈文章，依時間倒序排列。",
} as const;

// Override the `type = "post"` inherited from _data.ts so this page
// is not matched by `search.pages("type=post")` or nav plugin queries.
export const type = "listing";

export default async (
  data: Lume.Data,
  helpers: Lume.Helpers,
): Promise<string> => {
  const PostCard = resolvePostCardRenderer(data.comp);
  const dateFormat = resolveDateHelper(helpers);
  const language = resolveSiteLanguage(data.lang);
  const languageDataCode = getLanguageDataCode(language);
  const { homeUrl, translations } = getPageContext(language);
  const posts = resolveArchivePosts(data.search, languageDataCode);
  const items = await Promise.all(posts.map(async (post) => {
    const postDate = resolvePostDate(post.date);
    const minutes = resolveReadingMinutes(post.readingInfo);
    const summary = resolveOptionalString(post.description);
    const card = await PostCard({
      title: resolveOptionalString(post.title) ?? "",
      url: resolveOptionalString(post.url) ?? "",
      dateStr: formatShortDate(postDate, language),
      dateIso: dateFormat(postDate, "ATOM", language) ??
        formatRfc3339Instant(postDate),
      className: "archive-post",
      ...(summary !== undefined ? { summary, showSummary: true } : {}),
      ...(minutes !== undefined
        ? { readingLabel: formatReadingTime(minutes, language) }
        : {}),
    });

    return `<li class="archive-list-item">${card}</li>`;
  })).then((cards) => cards.join("\n"));

  const postsCountLabel = formatPostCount(posts.length, language);
  const pageIntro = `<nav class="cds--breadcrumb" aria-label="${
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
      <h1 id="archive-title" class="archive-page-title">${
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
</section>`;

  const pageBody = posts.length > 0
    ? `<section class="archive-activity" aria-label="${
      escapeHtml(translations.archive.activityAriaLabel)
    }">
  <div class="archive-activity-main">
    <ul class="archive-list">
      ${items}
    </ul>
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

  return `<div class="site-page-shell site-page-shell--wide">
  <div class="feature-main">
    ${pageIntro}
    ${pageBody}
  </div>
</div>`;
};

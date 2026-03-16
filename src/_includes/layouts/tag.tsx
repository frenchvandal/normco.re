import {
  formatPostCount,
  formatReadingTime,
  getLocalizedUrl,
  getSiteTranslations,
  resolveSiteLanguage,
} from "../../utils/i18n.ts";
import {
  resolvePostDate,
  resolveReadingMinutes,
} from "../../posts/post-metadata.ts";
import { getTagColor } from "../../utils/tags.ts";

export const layout = "layouts/base.tsx";

type Comp = {
  PostCard: (props: {
    readonly title: string;
    readonly url: string;
    readonly dateStr: string;
    readonly dateIso: string;
    readonly readingLabel?: string;
  }) => string | Promise<string>;
};

type H = {
  date: (value: unknown, pattern?: string, lang?: string) => string | undefined;
};

type TagPageData = Lume.Data & {
  tagName?: string;
  posts?: Lume.Data[];
  lang?: string;
};

export default async (
  data: TagPageData,
  helpers: Lume.Helpers,
): Promise<string> => {
  const { PostCard } = data.comp as unknown as Comp;
  const { date: dateFormat } = helpers as unknown as H;
  const language = resolveSiteLanguage(data.lang);
  const translations = getSiteTranslations(language);
  const homeUrl = getLocalizedUrl("/", language);
  const archiveUrl = getLocalizedUrl("/posts/", language);
  const tagName = typeof data.tagName === "string" ? data.tagName : "";
  const posts = Array.isArray(data.posts) ? data.posts : [];
  const shortDatePattern = language === "fr"
    ? "d MMM"
    : language === "zhHans" || language === "zhHant"
    ? "M月d日"
    : "SHORT";

  const items = await Promise.all(posts.map(async (post) => {
    const postDate = resolvePostDate(post.date);
    const minutes = resolveReadingMinutes(post.readingInfo);
    const card = await PostCard({
      title: post.title as string,
      url: post.url as string,
      dateStr: dateFormat(postDate, shortDatePattern, language) ??
        postDate.toISOString(),
      dateIso: dateFormat(postDate, "ATOM", language) ?? postDate.toISOString(),
      ...(minutes !== undefined
        ? { readingLabel: formatReadingTime(minutes, language) }
        : {}),
    });

    return `<li class="archive-list-item">${card}</li>`;
  })).then((renderedItems) => renderedItems.join("\n"));

  const emptyState =
    `<p class="blankslate">${translations.archive.emptyState}</p>`;

  return `<div class="site-page-shell site-page-shell--wide">
<div class="feature-layout feature-layout--with-rail">
  <div class="feature-main">
    <nav class="cds--breadcrumb" aria-label="${translations.tagPage.breadcrumbAriaLabel}">
      <ol class="cds--breadcrumb-list">
        <li class="cds--breadcrumb-item">
          <a href="${homeUrl}" class="cds--breadcrumb-link">${translations.navigation.home}</a>
        </li>
        <li class="cds--breadcrumb-item">
          <a href="${archiveUrl}" class="cds--breadcrumb-link">${translations.navigation.writing}</a>
        </li>
        <li class="cds--breadcrumb-item">
          <span class="cds--breadcrumb-current" aria-current="page">${tagName}</span>
        </li>
      </ol>
    </nav>
    <section class="pagehead tag-pagehead" aria-labelledby="tag-page-title">
      <p class="pagehead-eyebrow">${translations.tagPage.eyebrow}</p>
      <h1 id="tag-page-title" class="tag-page-title">${tagName}</h1>
      <p class="pagehead-lead">${formatPostCount(posts.length, language)}</p>
    </section>
    <section class="tag-page-results" aria-label="${translations.tagPage.postsAriaLabel}">
      <div class="subhead">
        <h2 class="subhead-heading">${translations.tagPage.postsHeading}</h2>
        <a href="${archiveUrl}" class="feature-link">${translations.tagPage.archiveLinkLabel}</a>
      </div>
      ${
    posts.length > 0 ? `<ul class="archive-list">${items}</ul>` : emptyState
  }
    </section>
  </div>
  <aside class="feature-rail tag-page-rail" aria-label="${translations.tagPage.railAriaLabel}">
    <div class="feature-rail-sticky">
      <section class="feature-card">
        <h2 class="feature-card-title">${translations.tagPage.eyebrow}</h2>
        <span class="cds--tag cds--tag--${
    getTagColor(tagName)
  } tag-page-current-tag">
          <span class="cds--tag__label">${tagName}</span>
        </span>
        <p class="feature-card-caption">${
    formatPostCount(posts.length, language)
  }</p>
        <a href="${archiveUrl}" class="feature-link">${translations.tagPage.archiveLinkLabel}</a>
      </section>
    </div>
  </aside>
</div>
</div>`;
};

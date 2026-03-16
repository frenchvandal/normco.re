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
import { escapeHtml } from "../../utils/html.ts";
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
  posts?: unknown;
  lang?: string;
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

  return ({ title, url }) =>
    `<article class="post-card"><h3><a href="${escapeHtml(url)}">${
      escapeHtml(title)
    }</a></h3></article>`;
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

function resolveTagPosts(value: unknown): Lume.Data[] {
  return Array.isArray(value) ? value.filter(isLumeData) : [];
}

export default async (
  data: TagPageData,
  helpers: Lume.Helpers,
): Promise<string> => {
  const PostCard = resolvePostCardRenderer(data.comp);
  const dateFormat = resolveDateHelper(helpers);
  const language = resolveSiteLanguage(data.lang);
  const translations = getSiteTranslations(language);
  const homeUrl = getLocalizedUrl("/", language);
  const archiveUrl = getLocalizedUrl("/posts/", language);
  const tagName = typeof data.tagName === "string" ? data.tagName : "";
  const posts = resolveTagPosts(data.posts);
  const shortDatePattern = language === "fr"
    ? "d MMM"
    : language === "zhHans" || language === "zhHant"
    ? "M月d日"
    : "SHORT";

  const items = await Promise.all(posts.map(async (post) => {
    const postDate = resolvePostDate(post.date);
    const minutes = resolveReadingMinutes(post.readingInfo);
    const card = await PostCard({
      title: typeof post.title === "string" ? post.title : "",
      url: typeof post.url === "string" ? post.url : "",
      dateStr: dateFormat(postDate, shortDatePattern, language) ??
        postDate.toISOString(),
      dateIso: dateFormat(postDate, "ATOM", language) ?? postDate.toISOString(),
      ...(minutes !== undefined
        ? { readingLabel: formatReadingTime(minutes, language) }
        : {}),
    });

    return `<li class="archive-list-item">${card}</li>`;
  })).then((renderedItems) => renderedItems.join("\n"));

  const emptyState = `<p class="blankslate">${
    escapeHtml(translations.archive.emptyState)
  }</p>`;

  return `<div class="site-page-shell site-page-shell--wide">
<div class="feature-layout feature-layout--with-rail">
  <div class="feature-main">
    <nav class="cds--breadcrumb" aria-label="${
    escapeHtml(translations.tagPage.breadcrumbAriaLabel)
  }">
      <ol class="cds--breadcrumb-list">
        <li class="cds--breadcrumb-item">
          <a href="${escapeHtml(homeUrl)}" class="cds--breadcrumb-link">${
    escapeHtml(translations.navigation.home)
  }</a>
        </li>
        <li class="cds--breadcrumb-item">
          <a href="${escapeHtml(archiveUrl)}" class="cds--breadcrumb-link">${
    escapeHtml(translations.navigation.writing)
  }</a>
        </li>
        <li class="cds--breadcrumb-item">
          <span class="cds--breadcrumb-current" aria-current="page">${
    escapeHtml(tagName)
  }</span>
        </li>
      </ol>
    </nav>
    <section class="pagehead tag-pagehead" aria-labelledby="tag-page-title">
      <p class="pagehead-eyebrow">${
    escapeHtml(translations.tagPage.eyebrow)
  }</p>
      <h1 id="tag-page-title" class="tag-page-title">${escapeHtml(tagName)}</h1>
      <p class="pagehead-lead">${
    escapeHtml(formatPostCount(posts.length, language))
  }</p>
    </section>
    <section class="tag-page-results" aria-label="${
    escapeHtml(translations.tagPage.postsAriaLabel)
  }">
      <div class="subhead">
        <h2 class="subhead-heading">${
    escapeHtml(translations.tagPage.postsHeading)
  }</h2>
        <a href="${escapeHtml(archiveUrl)}" class="feature-link">${
    escapeHtml(translations.tagPage.archiveLinkLabel)
  }</a>
      </div>
      ${
    posts.length > 0 ? `<ul class="archive-list">${items}</ul>` : emptyState
  }
    </section>
  </div>
  <aside class="feature-rail tag-page-rail" aria-label="${
    escapeHtml(translations.tagPage.railAriaLabel)
  }">
    <div class="feature-rail-sticky">
      <section class="feature-card">
        <h2 class="feature-card-title">${
    escapeHtml(translations.tagPage.eyebrow)
  }</h2>
        <span class="cds--tag cds--tag--${
    getTagColor(tagName)
  } tag-page-current-tag">
          <span class="cds--tag__label">${escapeHtml(tagName)}</span>
        </span>
        <p class="feature-card-caption">${
    escapeHtml(formatPostCount(posts.length, language))
  }</p>
        <a href="${escapeHtml(archiveUrl)}" class="feature-link">${
    escapeHtml(translations.tagPage.archiveLinkLabel)
  }</a>
      </section>
    </div>
  </aside>
</div>
</div>`;
};

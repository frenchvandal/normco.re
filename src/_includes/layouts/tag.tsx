import { renderComponent } from "lume/jsx-runtime";

import HFeedShell from "../../mf2/components/HFeedShell.tsx";
import { getAuthorIdentity } from "../../mf2/extractors.ts";
import {
  formatPostCount,
  formatReadingTime,
  formatShortDate,
  getPageContext,
  resolveSiteLanguage,
} from "../../utils/i18n.ts";
import {
  resolvePostDate,
  resolveReadingMinutes,
} from "../../posts/post-metadata.ts";
import { formatRfc3339Instant } from "../../utils/date-time.ts";
import { escapeHtml } from "../../utils/html.ts";
import {
  resolveDateHelper,
  resolvePostCardRenderer,
} from "../../utils/lume-helpers.ts";
import { getTagColor } from "../../utils/tags.ts";
import { isLumeData, resolveOptionalString } from "../../utils/type-guards.ts";

export const layout = "layouts/base.tsx";

type TagPageData = Lume.Data & {
  tagName?: string;
  posts?: unknown;
  lang?: string;
};

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
  const { archiveUrl, homeUrl, translations } = getPageContext(language);
  const tagName = resolveOptionalString(data.tagName) ?? "";
  const posts = resolveTagPosts(data.posts);
  const postsCountLabel = formatPostCount(posts.length, language);
  const currentUrl = resolveOptionalString(data.url) ?? archiveUrl;
  const author = getAuthorIdentity(language, data.author);

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
      ...(summary !== undefined ? { summary } : {}),
      authorName: author.name,
      authorUrl: author.url,
      ...(minutes !== undefined
        ? { readingLabel: formatReadingTime(minutes, language) }
        : {}),
    });

    return `<li class="archive-list-item">${card}</li>`;
  })).then((renderedItems) => renderedItems.join("\n"));

  const emptyState = `<p class="blankslate">${
    escapeHtml(translations.archive.emptyState)
  }</p>`;

  const tagFeed = await renderComponent(
    HFeedShell({
      className: "feature-main h-feed",
      url: currentUrl,
      author,
      children: {
        __html: `<nav class="cds--breadcrumb" aria-label="${
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
      </ol>
    </nav>
    <section class="pagehead tag-pagehead" aria-labelledby="tag-page-title">
      <div class="tag-pagehead-grid">
        <div class="tag-pagehead-copy">
          <p class="pagehead-eyebrow">${
          escapeHtml(translations.tagPage.eyebrow)
        }</p>
          <h1 id="tag-page-title" class="tag-page-title p-name">${
          escapeHtml(tagName)
        }</h1>
          <p class="pagehead-lead">${escapeHtml(postsCountLabel)}</p>
        </div>
        <div class="tag-pagehead-meta">
          <span class="cds--tag cds--tag--${
          getTagColor(tagName)
        } tag-page-current-tag" title="${escapeHtml(tagName)}">
            <span class="cds--tag__label">${escapeHtml(tagName)}</span>
          </span>
          <a href="${
          escapeHtml(archiveUrl)
        }" class="feature-link tag-pagehead-link">${
          escapeHtml(translations.tagPage.archiveLinkLabel)
        }</a>
        </div>
      </div>
    </section>
    <section class="tag-page-results" aria-label="${
          escapeHtml(translations.tagPage.postsAriaLabel)
        }">
      <div class="subhead">
        <h2 class="subhead-heading">${
          escapeHtml(translations.tagPage.postsHeading)
        }</h2>
      </div>
      ${
          posts.length > 0
            ? `<ul class="archive-list">${items}</ul>`
            : emptyState
        }
    </section>`,
      },
    }),
  );

  return `<div class="site-page-shell site-page-shell--editorial">
  ${tagFeed}
</div>`;
};

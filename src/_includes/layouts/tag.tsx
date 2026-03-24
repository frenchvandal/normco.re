import { resolvePageSetup } from "../../utils/page-setup.ts";
import { formatPostCount } from "../../utils/i18n.ts";
import { renderPostListItem, toStoryData } from "../../utils/story-data.ts";
import { escapeHtml } from "../../utils/html.ts";
import {
  resolveDateHelper,
  resolvePostCardRenderer,
} from "../../utils/lume-helpers.ts";
import { renderBreadcrumb } from "../../utils/breadcrumb.ts";
import { getTagColor } from "../../utils/tags.ts";
import { isLumeData, resolveOptionalString } from "../../utils/type-guards.ts";

export const layout = "layouts/base.tsx";

type TagPageData = Lume.Data & {
  tagName?: string;
  posts?: unknown;
  lang?: string;
};

export default async (
  data: TagPageData,
  helpers: Lume.Helpers,
): Promise<string> => {
  const PostCard = resolvePostCardRenderer(data.comp);
  const dateFormat = resolveDateHelper(helpers);
  const { language, homeUrl, archiveUrl, translations: t } = resolvePageSetup(
    data.lang,
  );
  const tagName = resolveOptionalString(data.tagName) ?? "";
  const posts = Array.isArray(data.posts) ? data.posts.filter(isLumeData) : [];
  const postsCountLabel = formatPostCount(posts.length, language);

  const items = (await Promise.all(
    posts.map((post) =>
      renderPostListItem(PostCard, toStoryData(post, language, dateFormat))
    ),
  )).join("\n");

  const breadcrumb = renderBreadcrumb(
    [
      { href: homeUrl, label: t.navigation.home },
      { href: archiveUrl, label: t.navigation.writing },
    ],
    t.tagPage.breadcrumbAriaLabel,
  );

  return `<div class="site-page-shell site-page-shell--editorial">
  <div class="feature-main">
    ${breadcrumb}
    <section class="pagehead tag-pagehead" aria-labelledby="tag-page-title">
      <div class="tag-pagehead-grid">
        <div class="tag-pagehead-copy">
          <p class="pagehead-eyebrow">${escapeHtml(t.tagPage.eyebrow)}</p>
          <h1 id="tag-page-title" class="tag-page-title">${
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
    escapeHtml(t.tagPage.archiveLinkLabel)
  }</a>
        </div>
      </div>
    </section>
    <section class="tag-page-results" aria-label="${
    escapeHtml(t.tagPage.postsAriaLabel)
  }">
      <div class="subhead">
        <h2 class="subhead-heading">${escapeHtml(t.tagPage.postsHeading)}</h2>
      </div>
      ${
    posts.length > 0
      ? `<ul class="archive-list">${items}</ul>`
      : `<p class="blankslate">${escapeHtml(t.archive.emptyState)}</p>`
  }
    </section>
  </div>
</div>`;
};

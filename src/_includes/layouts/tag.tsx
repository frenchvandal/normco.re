import { resolvePageSetup } from "../../utils/page-setup.ts";
import { formatPostCount } from "../../utils/i18n.ts";
import { renderPostListItem, toStoryData } from "../../utils/story-data.ts";
import {
  resolveDateHelper,
  resolvePostCardRenderer,
} from "../../utils/lume-helpers.ts";
import { escapeHtml } from "../../utils/html.ts";
import { getTagColor } from "../../utils/tags.ts";
import {
  isLumeRecord,
  resolveOptionalString,
} from "../../utils/type-guards.ts";

export const layout = "layouts/base.tsx";
export const extraStylesheets = ["/styles/blog-antd.css"];

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
  const { language, archiveUrl, translations: t } = resolvePageSetup(
    data.lang,
  );
  const tagName = resolveOptionalString(data.tagName) ?? "";
  const posts = Array.isArray(data.posts)
    ? data.posts.filter(isLumeRecord)
    : [];
  const postsCountLabel = formatPostCount(posts.length, language);
  const stories = posts.map((post) => toStoryData(post, language, dateFormat));
  const items = (await Promise.all(
    stories.map((story) => renderPostListItem(PostCard, story)),
  )).join("\n");

  return `<div class="blog-antd-root">
  <div class="site-page-shell site-page-shell--editorial">
  <div class="feature-main">
    <section class="pagehead tag-pagehead" aria-labelledby="tag-page-title">
      <div class="tag-pagehead-grid">
        <div class="tag-pagehead-copy">
          <p class="pagehead-eyebrow">${escapeHtml(t.tagPage.eyebrow)}</p>
          <h1 id="tag-page-title" class="tag-page-title">${
    escapeHtml(tagName)
  }</h1>
          <p class="pagehead-lead">${escapeHtml(postsCountLabel)}</p>
          <p class="tag-pagehead-intro">${escapeHtml(t.tagPage.intro)}</p>
        </div>
        <div class="tag-pagehead-meta">
          <p class="tag-pagehead-kicker">${
    escapeHtml(t.tagPage.archiveHintTitle)
  }</p>
          <span class="blog-tag-chip blog-tag-chip--${
    getTagColor(tagName)
  } tag-page-current-tag" title="${escapeHtml(tagName)}">
            <span class="blog-tag-chip__label">${escapeHtml(tagName)}</span>
          </span>
          <p class="tag-pagehead-note">${escapeHtml(t.tagPage.archiveHint)}</p>
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
      ${
    posts.length > 0
      ? `<ul class="archive-list">${items}</ul>`
      : `<p class="blankslate">${escapeHtml(t.archive.emptyState)}</p>`
  }
    </section>
  </div>
</div>
</div>`;
};

import StatePanel from "../_components/StatePanel.tsx";
import { resolvePageSetup } from "../utils/page-setup.ts";
import { searchPages } from "../utils/lume-data.ts";
import { toStoryData, renderPostListItem } from "../utils/story-data.ts";
import { formatPostCount } from "../utils/i18n.ts";
import { escapeHtml } from "../utils/html.ts";
import { resolveDateHelper, resolvePostCardRenderer } from "../utils/lume-helpers.ts";
import { renderBreadcrumb } from "../utils/breadcrumb.ts";

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
  const { language, languageDataCode, homeUrl, translations: t } =
    resolvePageSetup(data.lang);
  const posts = searchPages(
    data.search,
    `type=post lang=${languageDataCode}`,
  );

  const items = (await Promise.all(posts.map((post) =>
    renderPostListItem(
      PostCard,
      toStoryData(post, language, dateFormat),
      { className: "archive-post", showSummary: true },
    )
  ))).join("\n");

  const postsCountLabel = formatPostCount(posts.length, language);

  const breadcrumb = renderBreadcrumb(
    [{ href: homeUrl, label: t.navigation.home }],
    t.archive.breadcrumbAriaLabel,
  );

  const pageBody = posts.length > 0
    ? `<section class="archive-activity" aria-label="${
      escapeHtml(t.archive.activityAriaLabel)
    }">
  <div class="archive-activity-main">
    <ul class="archive-list">
      ${items}
    </ul>
  </div>
</section>`
    : StatePanel({
      title: t.archive.emptyStateTitle,
      message: t.archive.emptyState,
      actionHref: homeUrl,
      actionLabel: t.navigation.home,
      headingTag: "h2",
      variant: "inline",
    });

  return `<div class="site-page-shell site-page-shell--wide">
  <div class="feature-main">
    ${breadcrumb}
<section class="pagehead archive-pagehead" aria-labelledby="archive-title">
  <div class="archive-pagehead-grid">
    <div class="archive-pagehead-copy">
      <p class="pagehead-eyebrow">${escapeHtml(t.archive.eyebrow)}</p>
      <h1 id="archive-title" class="archive-page-title">${
    escapeHtml(t.archive.title)
  }</h1>
      <p class="pagehead-lead">${escapeHtml(t.archive.lead)}</p>
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
</section>
    ${pageBody}
  </div>
</div>`;
};

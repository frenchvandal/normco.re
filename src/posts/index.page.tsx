import StatePanel from "../_components/StatePanel.tsx";
import {
  groupArchiveMonths,
  renderArchiveMonthNav,
  renderArchiveTimeline,
} from "../blog/archive-render.ts";
import { resolvePageSetup } from "../utils/page-setup.ts";
import { searchPages } from "../utils/lume-data.ts";
import { toStoryData } from "../utils/story-data.ts";
import { formatPostCount } from "../utils/i18n.ts";
import { escapeHtml } from "../utils/html.ts";
import { resolveDateHelper } from "../utils/lume-helpers.ts";

export const lang = ["en", "fr", "zh-hans", "zh-hant"] as const;
export const url = "/posts/";
export const layout = "layouts/base.tsx";
export const extraStylesheets = ["/styles/blog-antd.css"];
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

export default (
  data: Lume.Data,
  helpers: Lume.Helpers,
): string => {
  const dateFormat = resolveDateHelper(helpers);
  const { language, languageDataCode, languageTag, homeUrl, translations: t } =
    resolvePageSetup(data.lang);
  const posts = searchPages(
    data.search,
    `type=post lang=${languageDataCode}`,
  );
  const stories = posts.map((post) => toStoryData(post, language, dateFormat));
  const postsCountLabel = formatPostCount(posts.length, language);
  const archiveMonths = groupArchiveMonths(stories, languageTag);
  const archiveLayoutClass = archiveMonths.length > 1
    ? "blog-antd-archive-layout blog-antd-archive-layout--with-nav"
    : "blog-antd-archive-layout";

  const pageBody = posts.length > 0
    ? `<div class="${archiveLayoutClass}">
  ${
      archiveMonths.length > 1
        ? renderArchiveMonthNav(archiveMonths, postsCountLabel)
        : ""
    }
  ${renderArchiveTimeline(archiveMonths, t.archive.activityAriaLabel, language)}
</div>`
    : StatePanel({
      title: t.archive.emptyStateTitle,
      message: t.archive.emptyState,
      actionHref: homeUrl,
      actionLabel: t.navigation.home,
      headingTag: "h2",
      variant: "inline",
    });

  return `<div class="blog-antd-root">
  <div class="site-page-shell site-page-shell--wide blog-antd-page blog-antd-page--archive">
  <div class="feature-main">
<section class="blog-antd-archive-header" aria-labelledby="archive-title">
  <div class="blog-antd-archive-header__copy">
      <span class="blog-antd-count-tag">${escapeHtml(postsCountLabel)}</span>
      <h1 id="archive-title" class="blog-antd-page-title">${
    escapeHtml(t.archive.title)
  }</h1>
      <p class="blog-antd-page-lead">${escapeHtml(t.archive.lead)}</p>
  </div>
</section>
    ${pageBody}
  </div>
</div>
</div>`;
};

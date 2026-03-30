import StatePanel from "../_components/StatePanel.tsx";
import { buildArchiveViewModel } from "../blog/archive-view-model.ts";
import {
  renderArchiveMonthNav,
  renderArchiveTimeline,
} from "../blog/archive-render.ts";
import { resolvePageSetup } from "../utils/page-setup.ts";
import { searchPages } from "../utils/lume-data.ts";
import { toStoryData } from "../utils/story-data.ts";
import { formatPostCount } from "../utils/i18n.ts";
import { escapeHtml } from "../utils/html.ts";
import { resolveDateHelper } from "../utils/lume-helpers.ts";
import { renderSiteIconMarkup } from "../utils/site-icons.ts";

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

function buildArchiveBackToTopLink(label: string): string {
  return `<a class="blog-antd-backtop blog-antd-archive-backtop" href="#archive-title" aria-label="${
    escapeHtml(label)
  }">
  <span class="blog-antd-backtop__button blog-antd-archive-backtop__button">
  ${
    renderSiteIconMarkup(
      "arrow-right",
      "blog-antd-backtop__icon blog-antd-archive-backtop__icon",
      { width: 16, height: 16 },
    )
  }
  <span class="sr-only blog-antd-archive-backtop__label">${
    escapeHtml(label)
  }</span>
</span>
</a>`;
}

function resolveArchivePageState(
  data: Lume.Data,
  helpers: Lume.Helpers,
) {
  const dateFormat = resolveDateHelper(helpers);
  const { language, languageDataCode, languageTag, homeUrl, translations: t } =
    resolvePageSetup(data.lang);
  const posts = searchPages(
    data.search,
    `type=post lang=${languageDataCode}`,
  );
  const stories = posts.map((post) => toStoryData(post, language, dateFormat));
  const postsCountLabel = formatPostCount(posts.length, language);
  const archiveView = buildArchiveViewModel(stories, languageTag);

  return {
    archiveView,
    homeUrl,
    language,
    postsCountLabel,
    t,
  };
}

export function renderAfterMainContent(
  data: Lume.Data,
  helpers: Lume.Helpers,
): { __html: string } | string {
  const { archiveView, t } = resolveArchivePageState(data, helpers);

  if (!archiveView.hasPosts) {
    return "";
  }

  return { __html: buildArchiveBackToTopLink(t.archive.backToTopLabel) };
}

export default (
  data: Lume.Data,
  helpers: Lume.Helpers,
): string => {
  const { archiveView, homeUrl, language, postsCountLabel, t } =
    resolveArchivePageState(data, helpers);

  const pageBody = archiveView.hasPosts
    ? `<div class="${archiveView.layoutClassName}">
  ${
      renderArchiveMonthNav(archiveView.monthNav, {
        ariaLabel: t.archive.yearsAriaLabel,
        eyebrowLabel: postsCountLabel,
        jumpLabel: t.archive.jumpLabel,
        latestJumpLabel: t.archive.latestJumpLabel,
      })
    }
  ${
      renderArchiveTimeline(
        archiveView.timelineItems,
        t.archive.activityAriaLabel,
        language,
      )
    }
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

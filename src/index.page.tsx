import { distinct } from "@std/collections";

import { resolvePageSetup } from "./utils/page-setup.ts";
import { searchPages } from "./utils/lume-data.ts";
import {
  renderPostListItem,
  type StoryData,
  toStoryData,
} from "./utils/story-data.ts";
import { escapeHtml } from "./utils/html.ts";
import {
  resolveDateHelper,
  resolvePostCardRenderer,
} from "./utils/lume-helpers.ts";
import { getTagUrl } from "./utils/tags.ts";
import type { SiteLanguage, SiteTranslations } from "./utils/i18n.ts";

export const lang = ["en", "fr", "zh-hans", "zh-hant"] as const;
export const url = "/";
// Keep the title undefined so the base layout emits the bare site name.
export const title: string | undefined = undefined;

// Keep Pagefind focused on canonical content pages instead of aggregate shells.
export const searchIndexed = false;

function renderTopicList(
  tags: readonly string[],
  language: SiteLanguage,
  classes: Readonly<{ list: string; item: string; link: string }>,
): string {
  if (tags.length === 0) return "";
  const items = tags.map((tag) =>
    `<li class="${classes.item}">
      <a href="${
      escapeHtml(getTagUrl(tag, language))
    }" class="${classes.link}">${escapeHtml(tag)}</a>
    </li>`
  ).join("\n");
  return `<ul class="${classes.list}">${items}</ul>`;
}

function renderFeaturedStory(story: StoryData, language: SiteLanguage): string {
  const topics = renderTopicList(story.tags.slice(0, 2), language, {
    list: "primer-home-featured-story__topics",
    item: "primer-home-featured-story__topics-item",
    link: "primer-home-featured-story__topic-link",
  });

  return `<article class="primer-home-featured-story">
  <div class="primer-home-featured-story__body">
    ${topics}
    <h2 class="primer-home-featured-story__title">
      <a class="primer-home-featured-story__link" href="${
    escapeHtml(story.url)
  }">${escapeHtml(story.title)}</a>
    </h2>
    ${
    story.summary === undefined
      ? ""
      : `<p class="primer-home-featured-story__summary">${
        escapeHtml(story.summary)
      }</p>`
  }
    <div class="primer-home-featured-story__meta">
      <time datetime="${escapeHtml(story.dateIso)}">${
    escapeHtml(story.dateLabel)
  }</time>${
    story.readingLabel === undefined
      ? ""
      : `<span class="primer-home-featured-story__reading">${
        escapeHtml(story.readingLabel)
      }</span>`
  }
    </div>
  </div>
</article>`;
}

function renderEmptyState(aboutUrl: string, t: SiteTranslations): string {
  return `<div class="primer-home-empty-state">
    <p class="primer-home-section-kicker">${escapeHtml(t.home.eyebrow)}</p>
    <h3>${escapeHtml(t.home.emptyStateTitle)}</h3>
    <p>${escapeHtml(t.home.emptyState)}</p>
    <a href="${escapeHtml(aboutUrl)}" class="btn btn-sm">${
    escapeHtml(t.navigation.about)
  }</a>
  </div>`;
}

export default async (
  data: Lume.Data,
  helpers: Lume.Helpers,
): Promise<string> => {
  const PostCard = resolvePostCardRenderer(data.comp);
  const dateFormat = resolveDateHelper(helpers);
  const { language, languageDataCode, aboutUrl, archiveUrl, translations: t } =
    resolvePageSetup(data.lang);

  const recent = searchPages(
    data.search,
    `type=post lang=${languageDataCode}`,
    "date=desc",
    5,
  );
  const stories = recent.map((p) => toStoryData(p, language, dateFormat));
  const featuredTags = distinct(stories.flatMap((s) => [...s.tags])).slice(
    0,
    4,
  );

  const introTopicMarkup = renderTopicList(featuredTags, language, {
    list: "primer-home-topics",
    item: "primer-home-topics__item",
    link: "primer-home-topic-link",
  });

  const [featured, ...rest] = stories;
  const featuredStory = featured === undefined
    ? ""
    : renderFeaturedStory(featured, language);

  const listingMarkup =
    (await Promise.all(rest.map((story) =>
      renderPostListItem(PostCard, story, {
        className: "primer-home-post primer-home-post--ledger",
        showSummary: true,
      }).then((li) => li.replace("archive-list-item", "home-posts-item"))
    ))).join("\n");

  const recentSection =
    `<section class="home-recent home-recent--primer" aria-labelledby="home-recent-title">
  <div class="primer-home-section-head">
    <div class="primer-home-section-head-copy">
      <p class="primer-home-section-kicker">${escapeHtml(t.archive.eyebrow)}</p>
      <h2 id="home-recent-title" class="primer-home-section-title">${
      escapeHtml(t.home.recentHeading)
    }</h2>
    </div>
    <a href="${escapeHtml(archiveUrl)}" class="primer-home-section-link">${
      escapeHtml(t.home.archiveLinkLabel)
    }</a>
  </div>
  ${
      recent.length === 0
        ? renderEmptyState(aboutUrl, t)
        : `<div class="primer-home-ledger">
    ${featuredStory}
    ${
          listingMarkup.length > 0
            ? `<ul class="home-posts home-posts--ledger">${listingMarkup}</ul>`
            : ""
        }
  </div>`
    }
</section>`;

  return `<div class="site-page-shell site-page-shell--editorial home-page home-page--primer">
<section class="primer-home-intro" aria-labelledby="home-title">
  <p class="primer-home-kicker">${escapeHtml(t.home.eyebrow)}</p>
  <div class="primer-home-intro__grid">
    <div class="primer-home-intro__copy">
      <h1 id="home-title" class="primer-home-title">normco.re</h1>
      <p class="primer-home-intro__strap">${escapeHtml(t.home.title)}</p>
      <p class="primer-home-lead">${escapeHtml(t.home.lead)}</p>
    </div>
    <div class="primer-home-intro__aside">
      <nav class="primer-home-intro__links" aria-label="${
    escapeHtml(t.site.mainNavigationAriaLabel)
  }">
        <a href="${
    escapeHtml(archiveUrl)
  }" class="primer-home-inline-link primer-home-inline-link--primary">${
    escapeHtml(t.home.archiveLinkLabel)
  }</a>
        <a href="${escapeHtml(aboutUrl)}" class="primer-home-inline-link">${
    escapeHtml(t.navigation.about)
  }</a>
      </nav>
      ${
    introTopicMarkup.length === 0
      ? ""
      : `<div class="primer-home-intro__topics">${introTopicMarkup}</div>`
  }
    </div>
  </div>
</section>

${recentSection}
</div>`;
};

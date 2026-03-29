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
import { getSiteName } from "./utils/site-identity.ts";

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
    list: "editorial-home-featured-story__topics",
    item: "editorial-home-featured-story__topics-item",
    link: "editorial-home-featured-story__topic-link",
  });

  return `<article class="editorial-home-featured-story">
  <div class="editorial-home-featured-story__frame">
    <div class="editorial-home-featured-story__identity">
      ${topics}
      <div class="editorial-home-featured-story__meta">
        <time datetime="${escapeHtml(story.dateIso)}">${
    escapeHtml(story.dateLabel)
  }</time>${
    story.readingLabel === undefined
      ? ""
      : `<span class="editorial-home-featured-story__reading">${
        escapeHtml(story.readingLabel)
      }</span>`
  }
      </div>
    </div>
    <div class="editorial-home-featured-story__body">
      <h2 class="editorial-home-featured-story__title">
        <a class="editorial-home-featured-story__link" href="${
    escapeHtml(story.url)
  }">${escapeHtml(story.title)}</a>
      </h2>
      ${
    story.summary === undefined
      ? ""
      : `<p class="editorial-home-featured-story__summary">${
        escapeHtml(story.summary)
      }</p>`
  }
    </div>
  </div>
</article>`;
}

function isHanLanguage(language: SiteLanguage): boolean {
  return language === "zhHans" || language === "zhHant";
}

function renderHomeTitle(
  siteName: string,
  language: SiteLanguage,
  languageTag: string,
): string {
  const className = `editorial-home-title${
    isHanLanguage(language) ? " editorial-home-title--han" : ""
  }`;

  if (!isHanLanguage(language)) {
    return `<h1 id="home-title" class="${className}" lang="${
      escapeHtml(languageTag)
    }">${escapeHtml(siteName)}</h1>`;
  }

  const separator = "的";
  const splitIndex = siteName.indexOf(separator);
  if (splitIndex === -1) {
    return `<h1 id="home-title" class="${className}" lang="${
      escapeHtml(languageTag)
    }">${escapeHtml(siteName)}</h1>`;
  }

  const prefix = siteName.slice(0, splitIndex + separator.length);
  const name = siteName.slice(splitIndex + separator.length);

  return `<h1 id="home-title" class="${className}" lang="${
    escapeHtml(languageTag)
  }">
      <span class="editorial-home-title__line editorial-home-title__line--intro">${
    escapeHtml(prefix)
  }</span>
      <span class="editorial-home-title__line editorial-home-title__line--name">${
    escapeHtml(name)
  }</span>
    </h1>`;
}

function renderEmptyState(aboutUrl: string, t: SiteTranslations): string {
  return `<div class="editorial-home-empty-state">
    <p class="editorial-home-section-kicker">${escapeHtml(t.home.eyebrow)}</p>
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
  const {
    language,
    languageDataCode,
    languageTag,
    aboutUrl,
    archiveUrl,
    translations: t,
  } = resolvePageSetup(data.lang);
  const siteName = getSiteName(language);

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
    list: "editorial-home-topics",
    item: "editorial-home-topics__item",
    link: "editorial-home-topic-link",
  });

  const [featured, ...rest] = stories;
  const featuredStory = featured === undefined
    ? ""
    : renderFeaturedStory(featured, language);

  const listingMarkup = (await Promise.all(rest.map(async (story) => {
    const listItem = await renderPostListItem(PostCard, story, {
      className: "editorial-home-post editorial-home-post--ledger",
      showSummary: true,
    });

    return listItem.replace("archive-list-item", "home-posts-item");
  }))).join("\n");

  const recentSection =
    `<section class="home-recent home-recent--editorial" aria-labelledby="home-recent-title">
  <div class="editorial-home-section-head">
    <div class="editorial-home-section-head-copy">
      <p class="editorial-home-section-kicker">${
      escapeHtml(t.archive.eyebrow)
    }</p>
      <h2 id="home-recent-title" class="editorial-home-section-title">${
      escapeHtml(t.home.recentHeading)
    }</h2>
    </div>
    <a href="${escapeHtml(archiveUrl)}" class="editorial-home-section-link">${
      escapeHtml(t.home.archiveLinkLabel)
    }</a>
  </div>
  ${
      recent.length === 0
        ? renderEmptyState(aboutUrl, t)
        : `<div class="editorial-home-ledger">
    ${featuredStory}
    ${
          listingMarkup.length > 0
            ? `<ul class="home-posts home-posts--ledger">${listingMarkup}</ul>`
            : ""
        }
  </div>`
    }
</section>`;

  return `<div class="site-page-shell site-page-shell--editorial home-page home-page--editorial">
<section class="editorial-home-intro${
    isHanLanguage(language) ? " editorial-home-intro--han" : ""
  }" aria-labelledby="home-title">
  <p class="editorial-home-kicker">${escapeHtml(t.home.eyebrow)}</p>
  <div class="editorial-home-intro__grid">
    <div class="editorial-home-intro__copy">
      ${renderHomeTitle(siteName, language, languageTag)}
      <p class="editorial-home-intro__strap">${escapeHtml(t.home.title)}</p>
      <p class="editorial-home-lead">${escapeHtml(t.home.lead)}</p>
    </div>
    <div class="editorial-home-intro__aside">
      <nav class="editorial-home-intro__links" aria-label="${
    escapeHtml(t.site.mainNavigationAriaLabel)
  }">
        <a href="${
    escapeHtml(archiveUrl)
  }" class="editorial-home-inline-link editorial-home-inline-link--primary">${
    escapeHtml(t.home.archiveLinkLabel)
  }</a>
        <a href="${escapeHtml(aboutUrl)}" class="editorial-home-inline-link">${
    escapeHtml(t.navigation.about)
  }</a>
      </nav>
      ${
    introTopicMarkup.length === 0
      ? ""
      : `<div class="editorial-home-intro__topics">${introTopicMarkup}</div>`
  }
    </div>
  </div>
</section>

${recentSection}
</div>`;
};

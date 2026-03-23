/** Home page - editorial landing with featured story and recent posts. */

import { distinct } from "@std/collections";
import { renderComponent } from "lume/jsx-runtime";

import HEntryShell from "./mf2/components/HEntryShell.tsx";
import HFeedShell from "./mf2/components/HFeedShell.tsx";
import { getAuthorIdentity } from "./mf2/extractors.ts";
import {
  formatReadingTime,
  formatShortDate,
  getLanguageDataCode,
  getPageContext,
  resolveSiteLanguage,
  type SiteLanguage,
  type SiteTranslations,
} from "./utils/i18n.ts";
import {
  resolvePostDate,
  resolveReadingMinutes,
} from "./posts/post-metadata.ts";
import { formatRfc3339Instant } from "./utils/date-time.ts";
import { escapeHtml } from "./utils/html.ts";
import {
  type DateHelper,
  resolveDateHelper,
  resolvePostCardRenderer,
} from "./utils/lume-helpers.ts";
import { getTagUrl } from "./utils/tags.ts";
import { isLumeData, resolveOptionalString } from "./utils/type-guards.ts";

/** Available language versions generated from this page. */
export const lang = ["en", "fr", "zh-hans", "zh-hant"] as const;
/** Page URL. */
export const url = "/";
/** Page title - left undefined so the base layout emits the bare site name. */
export const title: string | undefined = undefined;

type AuthorIdentity = ReturnType<typeof getAuthorIdentity>;
type StoryData = {
  readonly title: string;
  readonly url: string;
  readonly summary?: string;
  readonly tags: readonly string[];
  readonly dateIso: string;
  readonly dateLabel: string;
  readonly readingLabel?: string;
};

function resolveRecentPosts(
  search: unknown,
  languageDataCode: string,
): Lume.Data[] {
  if (typeof search !== "object" || search === null) {
    return [];
  }

  const pages = Reflect.get(search, "pages");

  if (typeof pages !== "function") {
    return [];
  }

  const results = Reflect.apply(pages, search, [
    `type=post lang=${languageDataCode}`,
    "date=desc",
    5,
  ]);

  return Array.isArray(results) ? results.filter(isLumeData) : [];
}

function resolvePostTags(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((tag): tag is string =>
      typeof tag === "string" && tag.length > 0
    )
    : [];
}

function resolveFeaturedTags(posts: readonly Lume.Data[]): string[] {
  const tags = posts.flatMap((post) => resolvePostTags(post.tags));
  return distinct(tags).slice(0, 4);
}

function resolveStoryData(
  post: Lume.Data,
  language: SiteLanguage,
  dateFormat: DateHelper,
): StoryData {
  const postDate = resolvePostDate(post.date);
  const minutes = resolveReadingMinutes(post.readingInfo);
  const summary = resolveOptionalString(post.description);

  return {
    title: resolveOptionalString(post.title) ?? "",
    url: resolveOptionalString(post.url) ?? "",
    tags: resolvePostTags(post.tags),
    dateIso: dateFormat(postDate, "ATOM", language) ??
      formatRfc3339Instant(postDate),
    dateLabel: formatShortDate(postDate, language),
    ...(summary !== undefined ? { summary } : {}),
    ...(minutes !== undefined
      ? { readingLabel: formatReadingTime(minutes, language) }
      : {}),
  };
}

function renderTopicList(
  tags: readonly string[],
  language: SiteLanguage,
  {
    itemClassName,
    linkClassName,
    listClassName,
  }: Readonly<{
    itemClassName: string;
    linkClassName: string;
    listClassName: string;
  }>,
): string {
  if (tags.length === 0) {
    return "";
  }

  const items = tags.map((tag) =>
    `<li class="${itemClassName}">
      <a href="${
      escapeHtml(getTagUrl(tag, language))
    }" class="${linkClassName}">
        ${escapeHtml(tag)}
      </a>
    </li>`
  ).join("\n");

  return `<ul class="${listClassName}">
    ${items}
  </ul>`;
}

function renderFeaturedStory(
  story: StoryData,
  author: AuthorIdentity,
  language: SiteLanguage,
): Promise<string> {
  const topics = renderTopicList(
    story.tags.slice(0, 2),
    language,
    {
      listClassName: "primer-home-featured-story__topics",
      itemClassName: "primer-home-featured-story__topics-item",
      linkClassName: "primer-home-featured-story__topic-link",
    },
  );

  return Promise.resolve(
    renderComponent(
      HEntryShell({
        className: "primer-home-featured-story h-entry",
        ...(story.summary !== undefined ? { summary: story.summary } : {}),
        categories: story.tags.slice(0, 2),
        author,
        children: {
          __html: `<div class="primer-home-featured-story__body">
    ${topics}
    <h2 class="primer-home-featured-story__title p-name">
      <a class="primer-home-featured-story__link u-url u-uid" href="${
            escapeHtml(story.url)
          }">
        ${escapeHtml(story.title)}
      </a>
    </h2>
    ${
            story.summary === undefined
              ? ""
              : `<p class="primer-home-featured-story__summary">${
                escapeHtml(story.summary)
              }</p>`
          }
    <div class="primer-home-featured-story__meta">
      <span class="primer-home-featured-story__author">${
            escapeHtml(author.name)
          }</span>
      <time class="dt-published" datetime="${escapeHtml(story.dateIso)}">${
            escapeHtml(story.dateLabel)
          }</time>${
            story.readingLabel === undefined
              ? ""
              : `<span class="primer-home-featured-story__reading">${
                escapeHtml(story.readingLabel)
              }</span>`
          }
    </div>
  </div>`,
        },
      }),
    ),
  );
}

function renderEmptyState(
  aboutUrl: string,
  translations: SiteTranslations,
): string {
  return `<div class="primer-home-empty-state">
    <p class="primer-home-section-kicker">${
    escapeHtml(translations.home.eyebrow)
  }</p>
    <h3>${escapeHtml(translations.home.emptyStateTitle)}</h3>
    <p>${escapeHtml(translations.home.emptyState)}</p>
    <a href="${escapeHtml(aboutUrl)}" class="btn btn-sm">${
    escapeHtml(translations.navigation.about)
  }</a>
  </div>`;
}

/** Exclude aggregate landing content from Pagefind in favor of source pages. */
export const searchIndexed = false;

/** Renders the home page body. */
export default async (
  data: Lume.Data,
  helpers: Lume.Helpers,
): Promise<string> => {
  const PostCard = resolvePostCardRenderer(data.comp);
  const dateFormat = resolveDateHelper(helpers);
  const language = resolveSiteLanguage(data.lang);
  const languageDataCode = getLanguageDataCode(language);
  const { aboutUrl, archiveUrl, homeUrl, translations } = getPageContext(
    language,
  );
  const currentUrl = homeUrl;
  const recent = resolveRecentPosts(data.search, languageDataCode);
  const author = getAuthorIdentity(language, data.author);
  const introTopicMarkup = renderTopicList(
    resolveFeaturedTags(recent),
    language,
    {
      listClassName: "primer-home-topics",
      itemClassName: "primer-home-topics__item",
      linkClassName: "primer-home-topic-link",
    },
  );

  const [featuredPost, ...remainingPosts] = recent;
  const featuredStory = featuredPost === undefined
    ? ""
    : await renderFeaturedStory(
      resolveStoryData(
        featuredPost,
        language,
        dateFormat,
      ),
      author,
      language,
    );

  const listingMarkup = await Promise.all(remainingPosts.map(async (post) => {
    const story = resolveStoryData(
      post,
      language,
      dateFormat,
    );
    const card = await PostCard({
      title: story.title,
      url: story.url,
      dateStr: story.dateLabel,
      dateIso: story.dateIso,
      className: "primer-home-post primer-home-post--ledger",
      ...(story.summary !== undefined
        ? { summary: story.summary, showSummary: true }
        : {}),
      authorName: author.name,
      authorUrl: author.url,
      ...(story.readingLabel !== undefined
        ? { readingLabel: story.readingLabel }
        : {}),
    });

    return `<li class="home-posts-item">${card}</li>`;
  })).then((items) => items.join("\n"));

  const recentSection = await renderComponent(
    HFeedShell({
      tagName: "section",
      className: "home-recent home-recent--primer h-feed",
      rootAttributes: { "aria-labelledby": "home-recent-title" },
      url: currentUrl,
      author,
      children: {
        __html: `<div class="primer-home-section-head">
    <div class="primer-home-section-head-copy">
      <p class="primer-home-section-kicker">${
          escapeHtml(translations.archive.eyebrow)
        }</p>
      <h2 id="home-recent-title" class="p-name primer-home-section-title">${
          escapeHtml(translations.home.recentHeading)
        }</h2>
    </div>
    <a href="${escapeHtml(archiveUrl)}" class="primer-home-section-link">${
          escapeHtml(translations.home.archiveLinkLabel)
        }</a>
  </div>
  ${
          recent.length === 0
            ? renderEmptyState(aboutUrl, translations)
            : `<div class="primer-home-ledger">
    ${featuredStory}
    ${
              listingMarkup.length > 0
                ? `<ul class="home-posts home-posts--ledger">
      ${listingMarkup}
    </ul>`
                : ""
            }
  </div>`
        }`,
      },
    }),
  );

  return `<div class="site-page-shell site-page-shell--wide home-page home-page--primer">
<section class="primer-home-intro" aria-labelledby="home-title">
  <p class="primer-home-kicker">${escapeHtml(translations.home.eyebrow)}</p>
  <div class="primer-home-intro__grid">
    <div class="primer-home-intro__copy">
      <h1 id="home-title" class="primer-home-title">normco.re</h1>
      <p class="primer-home-intro__strap">${
    escapeHtml(translations.home.title)
  }</p>
      <p class="primer-home-lead">${escapeHtml(translations.home.lead)}</p>
    </div>
    <div class="primer-home-intro__aside">
      <nav
        class="primer-home-intro__links"
        aria-label="${escapeHtml(translations.site.mainNavigationAriaLabel)}"
      >
        <a href="${
    escapeHtml(archiveUrl)
  }" class="primer-home-inline-link primer-home-inline-link--primary">${
    escapeHtml(translations.home.archiveLinkLabel)
  }</a>
        <a href="${escapeHtml(aboutUrl)}" class="primer-home-inline-link">${
    escapeHtml(translations.navigation.about)
  }</a>
      </nav>
      ${introTopicMarkup}
    </div>
  </div>
</section>

${recentSection}
</div>`;
};

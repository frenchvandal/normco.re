/** Home page - editorial landing with featured story and recent posts. */

import { distinct } from "jsr/collections";
import { renderComponent } from "lume/jsx-runtime";

import HEntryShell from "./mf2/components/HEntryShell.tsx";
import HFeedShell from "./mf2/components/HFeedShell.tsx";
import { getAuthorIdentity } from "./mf2/extractors.ts";
import {
  formatReadingTime,
  getLanguageDataCode,
  getLocalizedUrl,
  getSiteTranslations,
  resolveSiteLanguage,
  type SiteLanguage,
} from "./utils/i18n.ts";
import {
  resolvePostDate,
  resolveReadingMinutes,
} from "./posts/post-metadata.ts";
import { escapeHtml } from "./utils/html.ts";
import { getTagUrl } from "./utils/tags.ts";

/** Available language versions generated from this page. */
export const lang = ["en", "fr", "zh-hans", "zh-hant"] as const;
/** Page URL. */
export const url = "/";
/** Page title - left undefined so the base layout emits the bare site name. */
export const title: string | undefined = undefined;

/** Typed component functions used on this page. */
type PostCardProps = Readonly<{
  title: string;
  url: string;
  dateStr: string;
  dateIso: string;
  className?: string;
  readingLabel?: string;
  summary?: string;
  showSummary?: boolean;
  authorName?: string;
  authorUrl?: string;
}>;
type Comp = {
  PostCard: (props: PostCardProps) => string | Promise<string>;
};

/** Typed helpers used in this page. */
type H = {
  date: (value: unknown, pattern?: string, lang?: string) => string | undefined;
};

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

function isLumeData(value: unknown): value is Lume.Data {
  return typeof value === "object" && value !== null;
}

function renderFallbackPostCard(
  {
    title,
    url,
    dateStr,
    dateIso,
    className,
    readingLabel,
    summary,
    showSummary,
    authorName,
    authorUrl,
  }: PostCardProps,
): Promise<string> {
  return Promise.resolve(
    renderComponent(
      HEntryShell({
        className: [
          "cds--tile",
          "post-card",
          "h-entry",
          className,
        ].filter(Boolean).join(" "),
        ...(summary !== undefined ? { summary } : {}),
        ...(authorName && authorUrl
          ? { author: { name: authorName, url: authorUrl } }
          : {}),
        children: {
          __html: `<time class="post-card-date dt-published" datetime="${
            escapeHtml(dateIso)
          }">${
            escapeHtml(dateStr)
          }</time><h3 class="post-card-title p-name"><a class="post-card-link u-url u-uid" href="${
            escapeHtml(url)
          }">${escapeHtml(title)}</a></h3>${
            showSummary && summary
              ? `<p class="post-card-summary">${escapeHtml(summary)}</p>`
              : ""
          }${
            readingLabel
              ? `<span class="post-card-reading-time">${
                escapeHtml(readingLabel)
              }</span>`
              : ""
          }`,
        },
      }),
    ),
  );
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

  return renderFallbackPostCard;
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

function resolveOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function resolveShortDatePattern(language: SiteLanguage): string {
  switch (language) {
    case "fr":
      return "d MMM";
    case "zhHans":
    case "zhHant":
      return "M 月 d 日";
    default:
      return "SHORT";
  }
}

function resolveStoryData(
  post: Lume.Data,
  language: SiteLanguage,
  shortDatePattern: string,
  dateFormat: H["date"],
): StoryData {
  const postDate = resolvePostDate(post.date);
  const minutes = resolveReadingMinutes(post.readingInfo);
  const summary = resolveOptionalString(post.description);

  return {
    title: resolveOptionalString(post.title) ?? "",
    url: resolveOptionalString(post.url) ?? "",
    tags: resolvePostTags(post.tags),
    dateIso: dateFormat(postDate, "ATOM", language) ?? postDate.toISOString(),
    dateLabel: dateFormat(postDate, shortDatePattern, language) ??
      postDate.toISOString(),
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
  translations: ReturnType<typeof getSiteTranslations>,
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
  const translations = getSiteTranslations(language);
  const shortDatePattern = resolveShortDatePattern(language);
  const aboutUrl = getLocalizedUrl("/about/", language);
  const currentUrl = getLocalizedUrl("/", language);
  const archiveUrl = getLocalizedUrl("/posts/", language);
  const recent = resolveRecentPosts(data.search, languageDataCode);
  const featuredTopics = resolveFeaturedTags(recent);
  const author = getAuthorIdentity(language, data.author);
  const introTopicMarkup = renderTopicList(
    featuredTopics,
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
        shortDatePattern,
        dateFormat,
      ),
      author,
      language,
    );

  const listingMarkup = await Promise.all(remainingPosts.map(async (post) => {
    const story = resolveStoryData(
      post,
      language,
      shortDatePattern,
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

  const emptyState = renderEmptyState(aboutUrl, translations);

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
          recent.length === 0 ? emptyState : `<div class="primer-home-ledger">
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

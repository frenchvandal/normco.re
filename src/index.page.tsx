import { distinct } from "@std/collections";
import { type jsx, renderComponent } from "lume/jsx-runtime";

import { resolvePageSetup } from "./utils/page-setup.ts";
import { searchPages } from "./utils/lume-data.ts";
import { type StoryData, toStoryData } from "./utils/story-data.ts";
import {
  type PostCardRenderer,
  resolveDateHelper,
  resolvePostCardRenderer,
} from "./utils/lume-helpers.ts";
import { getTagUrl } from "./utils/tags.ts";
import type { SiteLanguage, SiteTranslations } from "./utils/i18n.ts";
import { getSiteName } from "./utils/site-identity.ts";
import { resolvePostTitleViewTransitionAttributes } from "./utils/view-transitions.ts";

export const lang = ["en", "fr", "zh-hans", "zh-hant"] as const;
export const url = "/";
// Keep the title undefined so the base layout emits the bare site name.
export const title: string | undefined = undefined;

// Keep Pagefind focused on canonical content pages instead of aggregate shells.
export const searchIndexed = false;

type El = ReturnType<typeof jsx>;
type RawHtml = { __html: string };
type TopicListClasses = Readonly<{
  list: string;
  item: string;
  link: string;
}>;

function isHanLanguage(language: SiteLanguage): boolean {
  return language === "zhHans" || language === "zhHant";
}

function TopicList(
  {
    tags,
    language,
    classes,
  }: {
    tags: readonly string[];
    language: SiteLanguage;
    classes: TopicListClasses;
  },
): El | null {
  if (tags.length === 0) {
    return null;
  }

  return (
    <ul class={classes.list}>
      {tags.map((tag) => (
        <li key={tag} class={classes.item}>
          <a href={getTagUrl(tag, language)} class={classes.link}>{tag}</a>
        </li>
      ))}
    </ul>
  );
}

function FeaturedStory(
  { story, language }: { story: StoryData; language: SiteLanguage },
): El {
  const titleTransitionAttributes = resolvePostTitleViewTransitionAttributes(
    story.url,
  );

  return (
    <article class="editorial-home-featured-story">
      <div class="editorial-home-featured-story__frame">
        <div class="editorial-home-featured-story__identity">
          <TopicList
            tags={story.tags.slice(0, 2)}
            language={language}
            classes={{
              list: "editorial-home-featured-story__topics",
              item: "editorial-home-featured-story__topics-item",
              link: "editorial-home-featured-story__topic-link",
            }}
          />
          <div class="editorial-home-featured-story__meta">
            <time datetime={story.dateIso}>{story.dateLabel}</time>
            {story.readingLabel !== undefined && (
              <span class="editorial-home-featured-story__reading">
                {story.readingLabel}
              </span>
            )}
          </div>
        </div>
        <div class="editorial-home-featured-story__body">
          <h2 class="editorial-home-featured-story__title">
            <a
              class="editorial-home-featured-story__link"
              href={story.url}
              {...(titleTransitionAttributes ?? {})}
            >
              {story.title}
            </a>
          </h2>
          {story.summary !== undefined && (
            <p class="editorial-home-featured-story__summary">
              {story.summary}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

function HomeTitle(
  {
    siteName,
    language,
    languageTag,
  }: {
    siteName: string;
    language: SiteLanguage;
    languageTag: string;
  },
): El {
  const className = `editorial-home-title${
    isHanLanguage(language) ? " editorial-home-title--han" : ""
  }`;

  if (!isHanLanguage(language)) {
    return (
      <h1 id="home-title" class={className} lang={languageTag}>{siteName}</h1>
    );
  }

  const separator = "的";
  const splitIndex = siteName.indexOf(separator);

  if (splitIndex === -1) {
    return (
      <h1 id="home-title" class={className} lang={languageTag}>{siteName}</h1>
    );
  }

  const prefix = siteName.slice(0, splitIndex + separator.length);
  const name = siteName.slice(splitIndex + separator.length);

  return (
    <h1 id="home-title" class={className} lang={languageTag}>
      <span class="editorial-home-title__line editorial-home-title__line--intro">
        {prefix}
      </span>
      <span class="editorial-home-title__line editorial-home-title__line--name">
        {name}
      </span>
    </h1>
  );
}

function EmptyState(
  { aboutUrl, translations }: {
    aboutUrl: string;
    translations: SiteTranslations;
  },
): El {
  return (
    <div class="editorial-home-empty-state">
      <p class="editorial-home-section-kicker">{translations.home.eyebrow}</p>
      <h3>{translations.home.emptyStateTitle}</h3>
      <p>{translations.home.emptyState}</p>
      <a href={aboutUrl} class="btn btn-sm">{translations.navigation.about}</a>
    </div>
  );
}

async function renderHomePostItems(
  PostCard: PostCardRenderer,
  stories: readonly StoryData[],
): Promise<readonly Readonly<{ key: string; content: RawHtml }>[]> {
  return await Promise.all(stories.map(async (story) => {
    const card = await PostCard({
      title: story.title,
      url: story.url,
      dateStr: story.dateLabel,
      dateIso: story.dateIso,
      className: "editorial-home-post editorial-home-post--ledger",
      showSummary: true,
      summary: story.summary,
      readingLabel: story.readingLabel,
    });

    return {
      key: `${story.url}-${story.dateIso}`,
      content: { __html: card },
    };
  }));
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
  const featuredTags = distinct(stories.flatMap((story) => [...story.tags]))
    .slice(
      0,
      4,
    );
  const [featured, ...rest] = stories;
  const homePostItems = await renderHomePostItems(PostCard, rest);
  const introClassName = `editorial-home-intro${
    isHanLanguage(language) ? " editorial-home-intro--han" : ""
  }`;

  return await renderComponent(
    <div class="site-page-shell site-page-shell--editorial home-page home-page--editorial">
      <section class={introClassName} aria-labelledby="home-title">
        <p class="editorial-home-kicker">{t.home.eyebrow}</p>
        <div class="editorial-home-intro__grid">
          <div class="editorial-home-intro__copy">
            <HomeTitle
              siteName={siteName}
              language={language}
              languageTag={languageTag}
            />
            <p class="editorial-home-intro__strap">{t.home.title}</p>
            <p class="editorial-home-lead">{t.home.lead}</p>
          </div>
          <div class="editorial-home-intro__aside">
            <div class="editorial-home-intro__links">
              <a
                href={archiveUrl}
                class="editorial-home-inline-link editorial-home-inline-link--primary"
              >
                {t.home.archiveLinkLabel}
              </a>
              <a href={aboutUrl} class="editorial-home-inline-link">
                {t.navigation.about}
              </a>
            </div>
            {featuredTags.length > 0 && (
              <div class="editorial-home-intro__topics">
                <TopicList
                  tags={featuredTags}
                  language={language}
                  classes={{
                    list: "editorial-home-topics",
                    item: "editorial-home-topics__item",
                    link: "editorial-home-topic-link",
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section
        class="home-recent home-recent--editorial"
        aria-labelledby="home-recent-title"
      >
        <div class="editorial-home-section-head">
          <div class="editorial-home-section-head-copy">
            <p class="editorial-home-section-kicker">{t.archive.eyebrow}</p>
            <h2 id="home-recent-title" class="editorial-home-section-title">
              {t.home.recentHeading}
            </h2>
          </div>
          <a href={archiveUrl} class="editorial-home-section-link">
            {t.home.archiveLinkLabel}
          </a>
        </div>
        {recent.length === 0
          ? <EmptyState aboutUrl={aboutUrl} translations={t} />
          : (
            <div class="editorial-home-ledger">
              {featured !== undefined && (
                <FeaturedStory story={featured} language={language} />
              )}
              {homePostItems.length > 0 && (
                <ul class="home-posts home-posts--ledger">
                  {homePostItems.map(({ key, content }) => (
                    <li key={key} class="home-posts-item">{content}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
      </section>
    </div>,
  );
};

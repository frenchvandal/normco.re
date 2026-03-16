/** Home page - hero + five most recent posts. */

import { metas, siteName } from "./_data.ts";
import {
  formatReadingTime,
  getLanguageDataCode,
  getLocalizedUrl,
  getSiteTranslations,
  resolveSiteLanguage,
} from "./utils/i18n.ts";
import {
  resolvePostDate,
  resolveReadingMinutes,
} from "./posts/post-metadata.ts";

/** Available language versions generated from this page. */
export const lang = ["en", "fr", "zh-hans", "zh-hant"] as const;
/** Page URL. */
export const url = "/";
/** Page title - same as the site name for the home page. */
export const title: string = siteName;
/** Page meta description - mirrors the site-wide default. */
export const description: string = metas.description;

/** French-only metadata overrides used by the multilanguage plugin. */
export const fr = {
  description: "Blog personnel de Phiphi, base a Chengdu, en Chine.",
} as const;

/** Simplified Chinese metadata overrides used by the multilanguage plugin. */
export const zhHans = {
  description: "Phiphi 的个人博客，写于中国成都。",
} as const;

/** Traditional Chinese metadata overrides used by the multilanguage plugin. */
export const zhHant = {
  description: "Phiphi 的個人部落格，寫於中國成都。",
} as const;

/** Typed component functions used on this page. */
type Comp = {
  PostCard: (props: {
    readonly title: string;
    readonly url: string;
    readonly dateStr: string;
    readonly dateIso: string;
    readonly readingLabel?: string;
  }) => string;
};

/** Typed helpers used in this page. */
type H = {
  date: (value: unknown, pattern?: string, lang?: string) => string | undefined;
};

/** Renders the home page body. */
export default async (
  data: Lume.Data,
  helpers: Lume.Helpers,
): Promise<string> => {
  // Lume.comp is loosely typed; cast to the minimal Comp interface (§5.4 - library boundary).
  const { PostCard } = data.comp as unknown as Comp;
  const { date: dateFormat } = helpers as unknown as H;
  const language = resolveSiteLanguage(data.lang);
  const languageDataCode = getLanguageDataCode(language);
  const translations = getSiteTranslations(language);
  const shortDatePattern = language === "fr"
    ? "d MMM"
    : language === "zhHans" || language === "zhHant"
    ? "M 月 d 日"
    : "SHORT";
  const archiveUrl = getLocalizedUrl("/posts/", language);
  const recent = data.search.pages(
    `type=post lang=${languageDataCode}`,
    "date=desc",
    5,
  ) as Lume.Data[];

  const postItems = await Promise.all(recent.map(async (post) => {
    const postDate = resolvePostDate(post.date);
    const minutes = resolveReadingMinutes(post.readingInfo);

    // exactOptionalPropertyTypes: only include readingLabel when it has a value.
    const card = await PostCard({
      title: post.title as string,
      url: post.url as string,
      dateStr: dateFormat(postDate, shortDatePattern, language) ??
        postDate.toISOString(),
      dateIso: dateFormat(postDate, "ATOM", language) ?? postDate.toISOString(),
      ...(minutes !== undefined
        ? { readingLabel: formatReadingTime(minutes, language) }
        : {}),
    });

    return `<li class="home-posts-item">${card}</li>`;
  })).then((items) => items.join("\n"));

  const emptyState = `<li class="home-posts-item home-posts-item--empty">
    <p class="blankslate">${translations.home.emptyState}</p>
  </li>`;

  return `<div class="site-page-shell site-page-shell--wide">
<section class="pagehead hero home-pagehead" aria-labelledby="home-title">
  <p class="pagehead-eyebrow">${translations.home.eyebrow}</p>
  <h1 id="home-title" class="hero-title">${translations.home.title}</h1>
  <p class="hero-lead">${translations.home.lead}</p>
</section>

<section class="home-recent" aria-labelledby="home-recent-title">
  <div class="subhead">
    <h2 id="home-recent-title" class="subhead-heading">${translations.home.recentHeading}</h2>
    <a href="${archiveUrl}" class="home-all-posts">${translations.home.archiveLinkLabel}</a>
  </div>
  <ul class="home-posts">
    ${recent.length > 0 ? postItems : emptyState}
  </ul>
</section>
</div>`;
};

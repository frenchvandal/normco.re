/** Site-wide data available to all pages and layouts. */

/** Primary language of the site. */
export const lang = "en";

/**
 * Year the blog was launched. Used to format the copyright notice.
 * Set to the current year if you want a single-year notice.
 */
export const blogStartYear = 2022 as const;

/** Default layout applied to every page. Posts override this via `src/posts/_data.ts`. */
export const layout = "layouts/base.tsx";

/** Canonical site name / domain used in titles, feeds, and metadata. */
export const siteName = "normco.re" as const;

/** Primary author name used in copyright notices and structured data. */
export const author = "Phiphi" as const;

/** Site metadata used for meta tags and feeds. */
export const metas = {
  site: siteName,
  description: `Personal blog by ${author}, based in Chengdu, China.`,
  lang: "en",
} as const satisfies Record<string, string>;

/** French-only global data overrides merged by the multilanguage plugin. */
export const fr = {
  metas: {
    site: siteName,
    description: `Blog personnel de ${author}, basé à Chengdu, en Chine.`,
    lang: "fr",
  },
} as const;

/** Simplified Chinese global data overrides merged by the multilanguage plugin. */
export const zhHans = {
  metas: {
    site: siteName,
    description: `${author} 的个人博客，写于中国成都。`,
    lang: "zh-Hans",
  },
} as const;

/** Traditional Chinese global data overrides merged by the multilanguage plugin. */
export const zhHant = {
  metas: {
    site: siteName,
    description: `${author} 的個人部落格，寫於中國成都。`,
    lang: "zh-Hant",
  },
} as const;

/** Default structured data for pages, rendered by the official Lume jsonLd plugin. */
export const jsonLd: Lume.Data["jsonLd"] = {
  "@type": "WebSite",
  url: "/",
  name: siteName,
  headline: `=title || ${siteName}`,
  description: "=description || =metas.description",
  inLanguage: "=metas.lang || =lang",
  author: {
    "@type": "Person",
    name: author,
  },
};

import {
  type SiteChromeData,
  type SiteManifestData,
} from "./utils/site-manifest.ts";
import {
  getDefaultSiteDescription,
  getSiteName,
  SITE_AUTHOR,
  SITE_NAME,
  SITE_ORIGIN,
  SITE_SHORT_NAME,
} from "./utils/site-identity.ts";

export const lang = "en";

/**
 * Year the blog was launched. Used to format the copyright notice.
 * Set to the current year if you want a single-year notice.
 */
export const blogStartYear = 2022 as const;

export const layout = "layouts/base.tsx";
// Ask Lume's multilanguage plugin to emit `hreflang="x-default"` pointing to
// the English variant when alternates exist.
export const unmatchedLangUrl = "en" as const;

export const siteName = SITE_NAME;

export const siteOrigin = SITE_ORIGIN;

export const author = SITE_AUTHOR;

export const metas = {
  site: siteName,
  description: getDefaultSiteDescription(author),
  lang: "en",
} as const satisfies Record<string, string>;

export const siteChrome = {
  faviconIcoUrl: "/favicon.ico",
  faviconSvgUrl: "/favicon.svg",
  appleTouchIconUrl: "/apple-touch-icon.png",
  themeColorLight: "#ffffff",
  themeColorDark: "#22272e",
} as const satisfies SiteChromeData;

/**
 * Core W3C Web App Manifest members.
 * Storefront-style metadata such as description/screenshots lives outside the
 * core manifest processing model, so it is intentionally omitted here.
 */
export const siteManifest = {
  dir: "ltr",
  lang,
  name: siteName,
  shortName: SITE_SHORT_NAME,
  startUrl: "/",
  id: "/",
  scope: "/",
  display: "standalone",
  themeColor: siteChrome.themeColorLight,
  backgroundColor: siteChrome.themeColorLight,
  icons: [
    {
      src: "/android-chrome-192x192.png",
      sizes: "192x192",
      type: "image/png",
    },
    {
      src: "/android-chrome-512x512.png",
      sizes: "512x512",
      type: "image/png",
    },
  ],
  shortcuts: [
    {
      name: "Posts",
      shortName: "Posts",
      description: "Browse the post archive.",
      url: "/posts/",
    },
    {
      name: "About",
      shortName: "About",
      description: "Read the author profile and contact links.",
      url: "/about/",
    },
  ],
} as const satisfies SiteManifestData;

export const fr = {
  siteName: getSiteName("fr"),
  metas: {
    site: getSiteName("fr"),
    description: `Blog personnel de ${author}, basé à Chengdu, en Chine.`,
    lang: "fr",
  },
  jsonLd: {
    name: getSiteName("fr"),
    headline: `=title || ${getSiteName("fr")}`,
  },
} as const;

export const zhHans = {
  siteName: getSiteName("zhHans"),
  metas: {
    site: getSiteName("zhHans"),
    description: `${author} 的个人博客，写于中国成都。`,
    lang: "zh-Hans",
  },
  jsonLd: {
    name: getSiteName("zhHans"),
    headline: `=title || ${getSiteName("zhHans")}`,
  },
} as const;

export const zhHant = {
  siteName: getSiteName("zhHant"),
  metas: {
    site: getSiteName("zhHant"),
    description: `${author} 的個人部落格，寫於中國成都。`,
    lang: "zh-Hant",
  },
  jsonLd: {
    name: getSiteName("zhHant"),
    headline: `=title || ${getSiteName("zhHant")}`,
  },
} as const;

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

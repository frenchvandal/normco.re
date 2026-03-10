/** Site-wide data available to all pages and layouts. */

/** Primary language of the site. */
export const lang = "en";

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
    description: `Blog personnel de ${author}, base a Chengdu, en Chine.`,
    lang: "fr",
  },
} as const;

/** Default structured data for pages, rendered by the official Lume jsonLd plugin. */
export const jsonLd: Lume.Data["jsonLd"] = {
  "@type": "WebSite",
  url: "/",
  name: siteName,
  headline: `=title || ${siteName}`,
  description: "=description || =metas.description",
  inLanguage: "=lang",
  author: {
    "@type": "Person",
    name: author,
  },
};

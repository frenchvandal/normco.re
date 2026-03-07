/** Site-wide data available to all pages and layouts. */

/** Primary language of the site. */
export const lang = "en";

/** Default layout applied to every page. Posts override this via `src/posts/_data.ts`. */
export const layout = "layouts/base.tsx";

/** Site metadata used for meta tags and feeds. */
export const metas = {
  site: "normco.re",
  description: "Personal blog by Phiphi, based in Chengdu, China.",
  lang: "en",
} as const satisfies Record<string, string>;

/** Default structured data for pages, rendered by the official Lume jsonLd plugin. */
export const jsonLd: Lume.Data["jsonLd"] = {
  "@type": "WebSite",
  url: "/",
  name: "normco.re",
  headline: "=title || normco.re",
  description: "=description || =metas.description",
  inLanguage: "=lang",
  author: {
    "@type": "Person",
    name: "Phiphi",
  },
};

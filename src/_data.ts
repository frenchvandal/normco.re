/** Site-wide data available to all pages and layouts. */

/** Primary language of the site. */
export const lang = "en";

/** Site metadata used for meta tags and feeds. */
export const metas = {
  site: "normco.re",
  description: "Personal blog by Phiphi, based in Chengdu, China.",
  lang: "en",
} as const satisfies Record<string, string>;

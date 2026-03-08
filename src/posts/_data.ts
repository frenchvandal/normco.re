/** Shared data applied to every post in this directory. */

/** Page type identifier — used to query posts via `search.pages("type=post")`. */
export const type = "post";

/** Default layout for all posts. */
export const layout = "layouts/post.tsx";

/** Author name, kept local to avoid a cross-directory import from `src/_data.ts`. */
const AUTHOR = "Phiphi" as const;

/** Structured data for article pages, rendered by the official Lume jsonLd plugin. */
export const jsonLd: Lume.Data["jsonLd"] = {
  "@type": "BlogPosting",
  headline: "=title || $ h1.post-title",
  description: "=description",
  datePublished: "=date",
  dateModified: "=date",
  url: "=url",
  mainEntityOfPage: "=url",
  author: {
    "@type": "Person",
    name: AUTHOR,
  },
  publisher: {
    "@type": "Person",
    name: AUTHOR,
  },
};

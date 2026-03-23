import { author } from "../_data.ts";

// Post discovery, feeds, and related navigation all query this shared type.
export const type = "post";

export const layout = "layouts/post.tsx";

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
    name: author,
  },
  publisher: {
    "@type": "Person",
    name: author,
  },
};

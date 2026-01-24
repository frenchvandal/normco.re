/**
 * Default data for all posts
 */

import "lume/types.ts";

interface PostData {
  type: string;
  layout: string;
  metas: {
    title: string;
  };
  jsonLd: Lume.Data["jsonLd"];
}

const data: PostData = {
  type: "post",
  layout: "layouts/post.ts",
  metas: {
    title: "=title",
  },
  jsonLd: {
    "@type": "BlogPosting",
    headline: "=title",
    description: "=description || =excerpt || =metas.description",
    url: "=url",
    image: "=image || =metas.image || /favicon.png",
    datePublished: "=date",
    author: {
      "@type": "Person",
      name: "=author",
    },
  },
};

export default data;

import plugins, { Options } from "./plugins.ts";

import "lume/types.ts";

export type { Options } from "./plugins.ts";

export default function (options: Partial<Options> = {}) {
  return (site: Lume.Site) => {
    // Configure the site
    site.use(plugins(options));

    // Add remote files
    const files = [
      "_includes/css/fonts.css",
      "_includes/css/navbar.css",
      "_includes/css/page.css",
      "_includes/css/post-list.css",
      "_includes/css/post.css",
      "_includes/css/reset.css",
      "_includes/css/badge.css",
      "_includes/css/variables.css",
      "_includes/css/search.css",
      "_components/metaTags.ts",
      "_components/pagination.ts",
      "_components/postDetails.ts",
      "_components/postList.ts",
      "_includes/layouts/archive-result.ts",
      "_includes/layouts/archive.ts",
      "_includes/layouts/base.ts",
      "_includes/layouts/page.ts",
      "_includes/layouts/post.ts",
      "posts/_data.ts",
      "_data.ts",
      "_data/i18n.ts",
      "404.md",
      "archive-result.page.ts",
      "archive.page.ts",
      "index.page.ts",
      "feed-json-viewer.page.ts",
      "styles.css",
      "favicon.png",
    ];

    for (const file of files) {
      site.remoteFile(file, import.meta.resolve(`./src/${file}`));
    }
  };
}

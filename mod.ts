import plugins, { Options } from "./plugins.ts";

import "lume/types.ts";

export type { Options } from "./plugins.ts";

/**
 * Registers the Normco plugin bundle with Lume.
 *
 * @param options - Partial options to override plugin defaults.
 * @returns A Lume site configuration function.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import createNormcore from "./mod.ts";
 *
 * assertEquals(typeof createNormcore, "function");
 * ```
 */
export default function (options: Partial<Options> = {}) {
  return (site: Lume.Site) => {
    // Configure the site
    site.use(plugins(options));

    // Add remote files
    const files = [
      // CSS - Design Tokens
      "_includes/css/01-tokens/tokens.css",
      // CSS - Base
      "_includes/css/02-base/reset.css",
      "_includes/css/02-base/typography.css",
      "_includes/css/02-base/prism.css",
      "_includes/css/02-base/global.css",
      // CSS - Utilities
      "_includes/css/03-utilities/utilities.css",
      // CSS - Components
      "_includes/css/04-components/button.css",
      "_includes/css/04-components/badge.css",
      "_includes/css/04-components/alert.css",
      "_includes/css/04-components/card.css",
      "_includes/css/04-components/theme-toggle.css",
      "_includes/css/04-components/search.css",
      "_includes/css/04-components/input.css",
      "_includes/css/04-components/select.css",
      "_includes/css/04-components/checkbox.css",
      "_includes/css/04-components/switch.css",
      "_includes/css/04-components/tabs.css",
      "_includes/css/04-components/breadcrumbs.css",
      "_includes/css/04-components/modal.css",
      "_includes/css/04-components/toast.css",
      "_includes/css/04-components/tooltip.css",
      "_includes/css/04-components/skeleton.css",
      // CSS - Layouts
      "_includes/css/05-layouts/navbar.css",
      "_includes/css/05-layouts/footer.css",
      "_includes/css/05-layouts/page.css",
      "_includes/css/05-layouts/post.css",
      "_includes/css/05-layouts/post-list.css",
      "_includes/css/05-layouts/toc-footnotes.css",
      // Components
      "_components/pagination.ts",
      "_components/PostDetails.ts",
      "_components/PostList.ts",
      // Layouts
      "_includes/layouts/archive-result.ts",
      "_includes/layouts/archive.ts",
      "_includes/layouts/base.ts",
      "_includes/layouts/page.ts",
      "_includes/layouts/post.ts",
      // Data
      "posts/_data.ts",
      "_data.ts",
      "_data/i18n.ts",
      // Pages
      "404.md",
      "archive-result.page.ts",
      "archive.page.ts",
      "index.page.ts",
      "feed-json-viewer.page.ts",
      // Assets
      "styles.css",
      "favicon.png",
    ];

    for (const file of files) {
      site.remoteFile(file, import.meta.resolve(`./src/${file}`));
    }
  };
}

import date, { Options as DateOptions } from "lume/plugins/date.ts";
import esbuild from "lume/plugins/esbuild.ts";
import lightningCss from "lume/plugins/lightningcss.ts";
import purgecss from "lume/plugins/purgecss.ts";
import sourceMaps from "lume/plugins/source_maps.ts";
import prism, { Options as PrismOptions } from "lume/plugins/prism.ts";
import basePath from "lume/plugins/base_path.ts";
import slugifyUrls from "lume/plugins/slugify_urls.ts";
import resolveUrls from "lume/plugins/resolve_urls.ts";
import jsonLd from "lume/plugins/json_ld.ts";
import metas from "lume/plugins/metas.ts";
import pagefind, { Options as PagefindOptions } from "lume/plugins/pagefind.ts";
import sitemap from "lume/plugins/sitemap.ts";
import feed, { Options as FeedOptions } from "lume/plugins/feed.ts";
import readingInfo from "lume/plugins/reading_info.ts";
import { merge } from "lume/core/utils/object.ts";
import toc from "lume/markdown-plugins/toc.ts";
import image from "lume/markdown-plugins/image.ts";
import footnotes from "lume/markdown-plugins/footnotes.ts";
import { alert } from "@mdit/plugin-alert";

import "lume/types.ts";

export interface Options {
  prism?: Partial<PrismOptions>;
  date?: Partial<DateOptions>;
  pagefind?: Partial<PagefindOptions>;
  feed?: Partial<FeedOptions>;
}

export const defaults: Options = {
  prism: {
    autoloadLanguages: true, // Auto-load languages for code tabs
  },
  pagefind: {
    ui: false, // Disable auto UI injection, we handle it in main.js
  },
  feed: {
    output: ["/feed.xml", "/feed.json"],
    query: "type=post",
    info: {
      title: "=metas.site",
      description: "=metas.description",
    },
    items: {
      title: "=title",
    },
    stylesheet: "/feed.xsl",
  },
};

/** Configure the site */
export default function (userOptions?: Options) {
  const options = merge(defaults, userOptions);

  return (site: Lume.Site) => {
    site.use(esbuild())
      .use(lightningCss({
        options: {
          minify: true,
          drafts: {
            customMedia: true,
          },
        },
      }))
      .use(purgecss({
        options: {
          safelist: {
            deep: [/token/],
            standard: [/^language-/],
          },
        },
      }))
      .use(sourceMaps())
      .use(basePath())
      .use(toc())
      .use(prism(options.prism))
      .use(readingInfo())
      .use(date(options.date))
      .use(jsonLd())
      .use(slugifyUrls())
      .use(metas())
      .use(image())
      .use(footnotes())
      .use(resolveUrls())
      .use(pagefind(options.pagefind))
      .use(sitemap())
      .use(feed(options.feed))
      .add("fonts")
      .add("styles.css")
      .add("js/main.js")
      .add("favicon.png")
      .add("feed.xsl")
      .add("uploads")
      .mergeKey("extra_head", "stringArray")
      .preprocess([".md"], (pages) => {
        for (const page of pages) {
          if (page.data.excerpt) {
            continue;
          }
          const content = typeof page.data.content === "string"
            ? page.data.content
            : "";
          if (!content) {
            continue;
          }
          page.data.excerpt = content.split(/<!--\s*more\s*-->/i)[0];
        }
      })
      // Inject git commit SHA for each source file
      .preprocess([".md"], async (pages) => {
        for (const page of pages) {
          const src = page.src;
          if (!src?.path || !src?.ext) continue;

          const normalizedPath = src.path.startsWith("/")
            ? src.path
            : `/${src.path}`;
          const filePath = `src${normalizedPath}${src.ext}`;
          try {
            const cmd = new Deno.Command("git", {
              args: ["log", "-1", "--format=%H", "--", filePath],
              cwd: Deno.cwd(),
            });
            const { code, stdout } = await cmd.output();
            if (code === 0) {
              const sha = new TextDecoder().decode(stdout).trim();
              if (sha) {
                page.data.sourceCommit = sha;
                page.data.sourcePath = filePath;
              }
            }
          } catch {
            // Silently ignore git errors
          }
        }
      });

    // Alert plugin
    site.hooks.addMarkdownItPlugin(alert);

    // Add lazy loading to images and improve accessibility (DOM API)
    site.process([".html"], (pages) => {
      for (const page of pages) {
        const document = page.document;
        if (!document) {
          continue;
        }

        // Add loading="lazy" to images (except first image for LCP)
        let imageCount = 0;
        for (const img of document.querySelectorAll("img")) {
          imageCount++;

          // First image: use eager loading for better LCP
          const loading = imageCount === 1 ? "eager" : "lazy";

          // Add loading and decoding attributes
          if (!img.hasAttribute("loading")) {
            img.setAttribute("loading", loading);
          }
          if (!img.hasAttribute("decoding")) {
            img.setAttribute("decoding", "async");
          }

          // Ensure alt attribute exists (accessibility)
          if (!img.hasAttribute("alt")) {
            img.setAttribute("alt", "");
          }
        }
      }
    });
  };
}

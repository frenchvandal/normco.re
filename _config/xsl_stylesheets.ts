import { Page } from "lume/core/file.ts";
import type Site from "lume/core/site.ts";

import { FEED_STYLESHEET_PATH } from "../src/utils/feed-paths.ts";
import {
  renderFeedStylesheet,
  renderSitemapStylesheet,
} from "../src/utils/xsl-stylesheets.ts";

const SITEMAP_STYLESHEET_PATH = "/sitemap.xsl";

function createTextPage(url: string, content: string): Page {
  return Page.create({ url, content });
}

export function registerXslStylesheets(site: Site): void {
  site.process(function processXslStylesheets() {
    site.pages.push(
      createTextPage(FEED_STYLESHEET_PATH, renderFeedStylesheet()),
      createTextPage(SITEMAP_STYLESHEET_PATH, renderSitemapStylesheet()),
    );
  });
}

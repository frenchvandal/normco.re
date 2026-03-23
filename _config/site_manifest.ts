import { Page } from "lume/core/file.ts";
import type Site from "lume/core/site.ts";

import {
  APP_MANIFEST_PATH,
  type SiteManifestData,
  stringifySiteManifest,
} from "../src/utils/site-manifest.ts";

type RootSiteData = {
  readonly siteManifest?: SiteManifestData;
};

export function createSiteManifestPage(siteManifest: SiteManifestData): Page {
  return Page.create({
    url: APP_MANIFEST_PATH,
    content: stringifySiteManifest(siteManifest),
  });
}

export function registerSiteManifest(site: Site): void {
  site.process(function processSiteManifest() {
    const rootData = site.source.data.get("/") as RootSiteData | undefined;
    const siteManifest = rootData?.siteManifest;

    if (!siteManifest) {
      return;
    }

    site.pages.push(createSiteManifestPage(siteManifest));
  });
}

import {
  getLocalizedCanonicalFeedUrl,
  MF2_CONFIG,
  MF2_HTML_CONTENT_TYPE,
} from "../config.ts";
import type { DiscoveryLinksProps } from "../types.ts";

export default function DiscoveryLinks(
  { language, siteName, rssUrl, atomUrl, jsonFeedUrl }: DiscoveryLinksProps,
) {
  const hFeedUrl = getLocalizedCanonicalFeedUrl(language);

  return (
    <>
      {MF2_CONFIG.discovery.rss && (
        <link
          rel="alternate"
          type="application/rss+xml"
          title={siteName}
          href={rssUrl}
        />
      )}
      {MF2_CONFIG.discovery.atom && (
        <link
          rel="alternate"
          type="application/atom+xml"
          title={`${siteName} Atom feed`}
          href={atomUrl}
        />
      )}
      {MF2_CONFIG.discovery.jsonFeed && (
        <link
          rel="alternate"
          type="application/feed+json"
          title={`${siteName} JSON feed`}
          href={jsonFeedUrl}
        />
      )}
      {MF2_CONFIG.discovery.htmlFeed && (
        <link
          rel="alternate"
          type={MF2_HTML_CONTENT_TYPE}
          title={`${siteName} h-feed`}
          href={hFeedUrl}
        />
      )}
    </>
  );
}

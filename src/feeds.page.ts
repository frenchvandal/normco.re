/** Feeds hub page — lists all syndication and discovery endpoints. */

export const url = "/feeds/";
/** Lume layout template. */
export const layout = "layouts/base.ts";
/** Page title. */
export const title = "Feeds";
/** Page meta description. */
export const description =
  "All syndication feeds and discovery endpoints for normco.re.";

/** A single feed entry in the hub. */
type FeedEntry = {
  readonly label: string;
  readonly href: string;
  readonly type: string;
  readonly description: string;
};

const FEEDS = [
  {
    label: "Atom Feed",
    href: "/feed.xml",
    type: "application/atom+xml",
    description:
      "Subscribe in any RSS/Atom-compatible reader. Full post content included.",
  },
  {
    label: "JSON Feed",
    href: "/feed.json",
    type: "application/feed+json",
    description:
      "Machine-readable JSON Feed 1.1. Ideal for programmatic access and custom integrations.",
  },
  {
    label: "Sitemap",
    href: "/sitemap.xml",
    type: "application/xml",
    description:
      "XML sitemap listing all indexed URLs for search engine crawlers.",
  },
] as const satisfies ReadonlyArray<FeedEntry>;

/** Renders the feeds hub page body. */
export default function (): string {
  const items = FEEDS.map(
    ({ label, href, type, description }) =>
      `<li class="feeds-item">
    <article class="feeds-entry">
      <h2 class="feeds-entry-title">
        <a href="${href}" class="feeds-entry-link">${label}</a>
      </h2>
      <p class="feeds-entry-type"><code>${type}</code></p>
      <p class="feeds-entry-description">${description}</p>
    </article>
  </li>`,
  ).join("\n  ");

  return `<section class="feeds-page">
  <h1 class="feeds-page-title">Feeds</h1>
  <p class="feeds-page-lead">Subscribe to normco.re or integrate its content programmatically.</p>
  <ul class="feeds-list">
    ${items}
  </ul>
</section>`;
}

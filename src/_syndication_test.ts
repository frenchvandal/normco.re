import { assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import syndicationPage from "./syndication.page.tsx";

const MOCK_DATA = {} as unknown as Lume.Data;

describe("syndication.page.tsx", () => {
  it("renders the wide page shell and heading", () => {
    const html = syndicationPage(MOCK_DATA);

    assertStringIncludes(
      html,
      'class="site-page-shell site-page-shell--wide feeds-page"',
    );
    assertStringIncludes(html, 'class="cds--breadcrumb"');
    assertStringIncludes(html, 'aria-label="Syndication breadcrumb"');
    assertStringIncludes(html, 'href="/" class="cds--breadcrumb-link"');
    assertStringIncludes(
      html,
      '<h1 id="syndication-title" class="feeds-page-title">Syndication</h1>',
    );
  });

  it("renders a decorative octopus pictogram in the side rail", () => {
    const html = syndicationPage(MOCK_DATA);

    assertStringIncludes(html, 'class="feature-rail syndication-rail"');
    assertStringIncludes(html, 'class="syndication-pictogram-frame"');
    assertStringIncludes(html, 'class="syndication-pictogram"');
    assertStringIncludes(html, '<path d="M18,13.5');
  });

  it("renders all machine-readable endpoint cards", () => {
    const html = syndicationPage(MOCK_DATA);

    assertStringIncludes(html, 'href="/feed.rss"');
    assertStringIncludes(html, 'href="/feed.atom"');
    assertStringIncludes(html, 'href="/feed.json"');
    assertStringIncludes(html, 'href="/sitemap.xml"');
    assertStringIncludes(html, "application/rss+xml");
    assertStringIncludes(html, "application/atom+xml");
    assertStringIncludes(html, "application/feed+json");
    assertStringIncludes(html, "application/xml");
  });

  it("loads the feed copy enhancement script", () => {
    const html = syndicationPage(MOCK_DATA);

    assertStringIncludes(html, 'src="/scripts/feed-copy.js"');
  });

  it("localizes routes and copy labels in French", () => {
    const html = syndicationPage({ lang: "fr" } as unknown as Lume.Data);

    assertStringIncludes(
      html,
      '<h1 id="syndication-title" class="feeds-page-title">Syndication</h1>',
    );
    assertStringIncludes(html, 'aria-label="Fil d’Ariane Syndication"');
    assertStringIncludes(html, 'href="/fr/" class="cds--breadcrumb-link"');
    assertStringIncludes(html, 'href="/fr/feed.rss"');
    assertStringIncludes(html, 'href="/fr/feed.atom"');
    assertStringIncludes(html, 'href="/fr/feed.json"');
    assertStringIncludes(html, 'href="/sitemap.xml"');
    assertStringIncludes(html, 'data-copy-default-label="Copier"');
  });
});

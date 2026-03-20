import { assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import feedsStyles from "./styles/components/_feeds.scss" with { type: "text" };
import { asLumeData } from "../test/lume.ts";

import syndicationPage from "./syndication.page.tsx";

const MOCK_DATA = asLumeData({});

describe("syndication.page.tsx", () => {
  it("renders the wide page shell and heading", () => {
    const html = syndicationPage(MOCK_DATA);

    assertStringIncludes(
      html,
      'class="site-page-shell site-page-shell--wide feeds-page"',
    );
    assertStringIncludes(
      html,
      'class="cds--tile pagehead syndication-pagehead"',
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
    assertStringIncludes(
      html,
      'class="cds--tag cds--tag--gray feeds-card-tag" title="XML"',
    );
    assertStringIncludes(
      html,
      'class="cds--tag cds--tag--teal feeds-card-tag" title="JSON"',
    );
    assertStringIncludes(html, "application/rss+xml");
    assertStringIncludes(html, "application/atom+xml");
    assertStringIncludes(html, "application/feed+json");
    assertStringIncludes(html, "application/xml");
    assertStringIncludes(
      html,
      'data-copy-copied-status="RSS feed URL copied"',
    );
    assertStringIncludes(
      html,
      'data-copy-error-status="Cannot copy RSS feed URL"',
    );
    assertStringIncludes(html, 'data-site-tabs=""');
    assertStringIncludes(html, 'data-content-switcher=""');
    assertStringIncludes(html, "feeds-structured-list");
    assertStringIncludes(html, 'data-site-accordion=""');
    assertStringIncludes(html, 'data-copy-notice=""');
  });

  it("loads the shared surface controls and feed copy scripts", () => {
    const html = syndicationPage(MOCK_DATA);

    assertStringIncludes(html, 'src="/scripts/surface-controls.js"');
    assertStringIncludes(html, 'src="/scripts/feed-copy.js"');
  });

  it("localizes routes and copy labels in French", () => {
    const html = syndicationPage(asLumeData({ lang: "fr" }));

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
    assertStringIncludes(html, 'data-copy-notice-success-title="Copié"');
    assertStringIncludes(
      html,
      'data-copy-copied-status="URL de Flux RSS copiée"',
    );
  });
});

describe("syndication CSS contracts", () => {
  it("keeps shared inline copy controls and inset focus tokens", () => {
    assertStringIncludes(feedsStyles, ".feeds-endpoint-copy-button");
    assertStringIncludes(
      feedsStyles,
      "inline-size: var(--site-inline-copy-control-size);",
    );
    assertStringIncludes(
      feedsStyles,
      "outline-offset: var(--focus-ring-inset-offset);",
    );
  });

  it("keeps endpoint rows on shared panel surfaces", () => {
    assertStringIncludes(
      feedsStyles,
      "background: var(--site-surface-panel-hover);",
    );
    assertStringIncludes(feedsStyles, "background: var(--site-surface-panel);");
    assertStringIncludes(feedsStyles, ".feeds-structured-list");
    assertStringIncludes(feedsStyles, ".feeds-copy-notice");
  });
});

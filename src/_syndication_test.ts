import { assertNotMatch, assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import feedsStyles from "./styles/components/_feeds.scss" with { type: "text" };
import surfacePatternsStyles from "./styles/components/_surface-patterns.scss" with {
  type: "text",
};
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
    assertNotMatch(html, /cds--breadcrumb-current/);
    assertNotMatch(html, /aria-current="page"/);
    assertStringIncludes(
      html,
      '<h1 id="syndication-title" class="feeds-page-title">Syndication</h1>',
    );
    assertStringIncludes(html, 'class="syndication-layout"');
  });

  it("renders a decorative octopus pictogram alongside the intro", () => {
    const html = syndicationPage(MOCK_DATA);

    assertStringIncludes(html, 'class="syndication-hero"');
    assertStringIncludes(html, 'class="syndication-hero-copy"');
    assertStringIncludes(html, 'class="syndication-rail"');
    assertStringIncludes(html, 'class="syndication-pictogram-frame"');
    assertStringIncludes(html, 'class="syndication-pictogram"');
    assertStringIncludes(html, '<path d="M18,13.5');
  });

  it("renders all machine-readable endpoint cards", () => {
    const html = syndicationPage(MOCK_DATA);

    assertStringIncludes(html, 'href="/rss.xml"');
    assertStringIncludes(html, 'href="/atom.xml"');
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
    if (html.includes("cds--tabs--contained")) {
      throw new Error(
        "Syndication tabs should use Carbon line tabs, not contained tabs.",
      );
    }
    assertStringIncludes(
      html,
      'class="site-switcher-icon cds--content-switcher__icon"',
    );
    assertStringIncludes(html, 'class="cds--content-switcher__label">Cards');
    assertStringIncludes(html, 'class="cds--content-switcher__label">List');
    assertStringIncludes(html, "feeds-structured-list");
    assertStringIncludes(html, 'data-site-accordion=""');
    assertStringIncludes(html, 'data-copy-notice=""');
    assertStringIncludes(html, "feeds-copy-control--compact");
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
    assertStringIncludes(html, 'href="/fr/rss.xml"');
    assertStringIncludes(html, 'href="/fr/atom.xml"');
    assertStringIncludes(html, 'href="/fr/feed.json"');
    assertStringIncludes(html, 'href="/sitemap.xml"');
    assertStringIncludes(html, 'data-copy-default-label="Copier"');
    assertStringIncludes(html, 'data-copy-notice-success-title="Copié"');
    assertStringIncludes(
      html,
      'data-copy-copied-status="URL de Flux RSS copiée"',
    );
    assertNotMatch(html, /cds--breadcrumb-current/);
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
    assertStringIncludes(feedsStyles, ".feeds-copy-notice[hidden]");
    assertStringIncludes(feedsStyles, "display: none !important;");
    assertStringIncludes(
      feedsStyles,
      ".feeds-copy-notice .cds--inline-notification__details",
    );
    assertStringIncludes(
      feedsStyles,
      "align-items: center !important;",
    );
    assertStringIncludes(feedsStyles, ".syndication-hero");
    assertStringIncludes(feedsStyles, ".syndication-hero-copy");
    assertStringIncludes(feedsStyles, ".feeds-copy-control--compact");
  });

  it("keeps shared switcher and tabs focus treatments readable", () => {
    assertStringIncludes(
      surfacePatternsStyles,
      ".site-content-switcher .site-switcher-icon",
    );
    assertStringIncludes(
      surfacePatternsStyles,
      "fill: currentColor !important;",
    );
    assertStringIncludes(
      surfacePatternsStyles,
      "display: none;",
    );
    assertStringIncludes(
      surfacePatternsStyles,
      "inline-size: 1.125rem;",
    );
    assertStringIncludes(
      surfacePatternsStyles,
      ".site-tabs .cds--tabs__nav-link",
    );
    assertStringIncludes(
      surfacePatternsStyles,
      "cursor: pointer;",
    );
  });
});

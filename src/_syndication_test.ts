import { assertNotMatch, assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import layoutStyles from "./styles/_layout.scss" with {
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
      'class="pagehead syndication-pagehead"',
    );
    assertStringIncludes(html, 'class="syndication-pagehead-grid"');
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

  it("renders the overview note and decorative pictogram in the pagehead", () => {
    const html = syndicationPage(MOCK_DATA);

    assertStringIncludes(html, 'class="syndication-pagehead-meta"');
    assertStringIncludes(html, 'class="syndication-overview-card"');
    assertStringIncludes(html, "Pick the right endpoint for the job.");
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
    assertStringIncludes(html, 'data-content-switcher=""');
    assertStringIncludes(
      html,
      'class="site-switcher-icon cds--content-switcher__icon"',
    );
    assertStringIncludes(html, 'class="cds--content-switcher__label">Cards');
    assertStringIncludes(html, 'class="cds--content-switcher__label">List');
    assertStringIncludes(html, "feeds-structured-list");
    assertStringIncludes(html, "syndication-guidance-section");
    assertStringIncludes(html, "Use the endpoint that matches your reader");
    assertStringIncludes(html, 'data-site-accordion=""');
    assertStringIncludes(html, 'data-copy-notice=""');
    assertStringIncludes(html, "feeds-copy-control--compact");
    assertNotMatch(html, /data-site-tabs=/);
    assertNotMatch(html, /feeds-overview-callout/);
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
  it("keeps shared inline copy controls and copy-state feedback", () => {
    assertStringIncludes(layoutStyles, ".feeds-endpoint-copy-button");
    assertStringIncludes(
      layoutStyles,
      ".feed-copy-control--copied .feeds-endpoint-copy-button {",
    );
    assertStringIncludes(
      layoutStyles,
      ".feeds-copy-icon--success {",
    );
  });

  it("keeps endpoint rows on shared panel surfaces", () => {
    assertStringIncludes(
      layoutStyles,
      ".feeds-endpoint-row {",
    );
    assertStringIncludes(
      layoutStyles,
      ".feeds-structured-list .cds--structured-list-row",
    );
    assertStringIncludes(layoutStyles, ".feeds-copy-notice");
    assertStringIncludes(
      layoutStyles,
      ".feeds-copy-notice .cds--inline-notification__details",
    );
    assertStringIncludes(layoutStyles, ".syndication-pagehead-grid");
    assertStringIncludes(layoutStyles, ".syndication-overview-card");
    assertStringIncludes(layoutStyles, ".feeds-copy-control--compact");
  });

  it("keeps shared switcher focus treatments readable", () => {
    assertStringIncludes(
      layoutStyles,
      ".cds--content-switcher,",
    );
    assertStringIncludes(
      layoutStyles,
      ".cds--content-switcher-btn {",
    );
    assertStringIncludes(
      layoutStyles,
      ".cds--content-switcher--selected,",
    );
  });

  it("keeps the mobile structured list wide enough for copy controls", () => {
    assertStringIncludes(layoutStyles, "@media (max-width: 47.999rem) {");
    assertStringIncludes(
      layoutStyles,
      ".feeds-structured-list .cds--structured-list-row {",
    );
  });
});

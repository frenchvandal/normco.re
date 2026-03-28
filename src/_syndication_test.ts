import { assertNotMatch, assertStringIncludes } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import layoutStyles from "./styles/layout.css" with {
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
    assertNotMatch(html, /class="site-breadcrumb"/);
    assertNotMatch(html, /Syndication breadcrumb/);
    assertNotMatch(html, /href="\/" class="site-breadcrumb-link"/);
    assertNotMatch(html, /site-breadcrumb-current/);
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
      'class="site-tag site-tag--gray feeds-card-tag" title="XML"',
    );
    assertStringIncludes(
      html,
      'class="site-tag site-tag--teal feeds-card-tag" title="JSON"',
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
      'class="site-switcher-icon site-switcher__icon"',
    );
    assertStringIncludes(html, 'class="site-switcher__label">Cards');
    assertStringIncludes(html, 'class="site-switcher__label">List');
    assertStringIncludes(html, "feeds-structured-list");
    assertStringIncludes(html, "syndication-guidance-section");
    assertStringIncludes(html, "Use the endpoint that matches your reader");
    assertStringIncludes(html, 'data-site-accordion=""');
    assertStringIncludes(html, 'data-copy-notice=""');
    assertStringIncludes(html, "feeds-copy-control--compact");
    assertNotMatch(html, /data-site-tabs=/);
    assertNotMatch(html, /feeds-overview-callout/);
  });

  it("renders generated mobile contract reference from live schema data", () => {
    const html = syndicationPage(MOCK_DATA);

    assertStringIncludes(html, "contract-reference-section");
    assertStringIncludes(html, "App contracts");
    assertStringIncludes(html, "Contract version");
    assertStringIncludes(html, "<code>1</code>");
    assertStringIncludes(html, "App Manifest");
    assertStringIncludes(html, "Posts Index");
    assertStringIncludes(html, "Post Detail");
    assertStringIncludes(html, "<code>/api/app-manifest.json</code>");
    assertStringIncludes(html, "<code>/fr/api/posts/index.json</code>");
    assertStringIncludes(html, "<code>/zh-hans/api/posts/{slug}.json</code>");
    assertStringIncludes(html, "Top-level fields");
    assertStringIncludes(html, "Definitions");
    assertStringIncludes(html, "RFC 3339");
    assertStringIncludes(html, "absolute URI");
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
    assertNotMatch(html, /Fil d’Ariane Syndication/);
    assertNotMatch(html, /href="\/fr\/" class="site-breadcrumb-link"/);
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
    assertStringIncludes(html, "Contrats app");
    assertStringIncludes(html, "Version du contrat");
    assertStringIncludes(html, "Champs de premier niveau");
    assertNotMatch(html, /site-breadcrumb-current/);
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
      "grid-template-columns: minmax(0, 1fr) auto;",
    );
    assertStringIncludes(
      layoutStyles,
      ".feeds-structured-list .site-structured-list-row",
    );
    assertStringIncludes(layoutStyles, ".feeds-copy-notice");
    assertStringIncludes(
      layoutStyles,
      ".feeds-copy-notice .site-notification__details",
    );
    assertStringIncludes(layoutStyles, ".contract-reference-grid {");
    assertStringIncludes(layoutStyles, ".contract-reference-field {");
    assertStringIncludes(layoutStyles, ".syndication-pagehead-grid");
    assertStringIncludes(layoutStyles, ".syndication-overview-card");
  });

  it("keeps shared switcher focus treatments readable", () => {
    assertStringIncludes(
      layoutStyles,
      ".site-switcher,",
    );
    assertStringIncludes(
      layoutStyles,
      ".site-switcher__button {",
    );
    assertStringIncludes(
      layoutStyles,
      ".site-switcher__button--selected,",
    );
  });

  it("keeps the mobile structured list wide enough for copy controls", () => {
    assertStringIncludes(layoutStyles, "@media (max-width: 47.999rem) {");
    assertStringIncludes(
      layoutStyles,
      ".feeds-structured-list .site-structured-list-row {",
    );
  });
});

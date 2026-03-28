import { assertNotMatch, assertStringIncludes } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import archiveStyles from "./styles/components/archive.css" with {
  type: "text",
};
import feedsStyles from "./styles/components/feeds.css" with {
  type: "text",
};
import postStyles from "./styles/components/post.css" with {
  type: "text",
};
import layoutShellStyles from "./styles/layout.css" with {
  type: "text",
};
import { asLumeData } from "../test/lume.ts";

import syndicationPage from "./syndication.page.tsx";

const MOCK_DATA = asLumeData({});
const layoutStyles = [
  archiveStyles,
  feedsStyles,
  postStyles,
  layoutShellStyles,
].join("\n");

describe("syndication.page.tsx", () => {
  it("renders a minimal shell with a single feed descriptions sheet", () => {
    const html = syndicationPage(MOCK_DATA);

    assertStringIncludes(
      html,
      'class="site-page-shell site-page-shell--wide feeds-page feeds-page--minimal"',
    );
    assertStringIncludes(html, 'class="syndication-pagehead-grid"');
    assertStringIncludes(
      html,
      '<h1 id="syndication-title" class="feeds-page-title">Syndication</h1>',
    );
    assertStringIncludes(
      html,
      'class="css-var-_R_0_ ant-descriptions feeds-descriptions"',
    );
    assertStringIncludes(html, 'class="ant-descriptions-view"');
    assertNotMatch(html, /syndication-pagehead-meta/);
    assertNotMatch(html, /syndication-overview-card/);
    assertNotMatch(html, /contract-reference/);
    assertNotMatch(html, /guidance/);
  });

  it("renders only RSS, Atom, and JSON feed endpoints", () => {
    const html = syndicationPage(MOCK_DATA);

    assertStringIncludes(
      html,
      'class="feeds-description-row feeds-description-row--rss"',
    );
    assertStringIncludes(
      html,
      'class="feeds-description-row feeds-description-row--atom"',
    );
    assertStringIncludes(
      html,
      'class="feeds-description-row feeds-description-row--json"',
    );
    assertStringIncludes(html, 'class="feeds-description-term"');
    assertStringIncludes(html, 'class="feeds-description-body"');
    assertStringIncludes(html, 'href="/rss.xml"');
    assertStringIncludes(html, 'href="/atom.xml"');
    assertStringIncludes(html, 'href="/feed.json"');
    assertNotMatch(html, /sitemap\.xml/);
    assertStringIncludes(html, "application/rss+xml");
    assertStringIncludes(html, "application/atom+xml");
    assertStringIncludes(html, "application/feed+json");
  });

  it("renders copy controls with Ant Design typography classes", () => {
    const html = syndicationPage(MOCK_DATA);

    assertStringIncludes(
      html,
      'class="css-var-_R_0_ ant-typography ant-typography-actions feeds-endpoint-actions"',
    );
    assertStringIncludes(
      html,
      'class="ant-typography-copy feeds-endpoint-copy-button"',
    );
    assertStringIncludes(
      html,
      'class="anticon anticon-copy feeds-copy-icon feeds-copy-icon--default"',
    );
    assertStringIncludes(html, 'class="sr-only feeds-copy-button-label"');
    assertStringIncludes(html, 'data-copy-default-label="Copy"');
    assertStringIncludes(
      html,
      'data-copy-copied-status="RSS feed URL copied"',
    );
    assertStringIncludes(
      html,
      'data-copy-error-status="Cannot copy RSS feed URL"',
    );
  });

  it("loads only the feed copy script", () => {
    const html = syndicationPage(MOCK_DATA);

    assertStringIncludes(html, 'src="/scripts/feed-copy.js"');
    assertNotMatch(html, /surface-controls\.js/);
  });

  it("localizes feed routes and copy labels in French", () => {
    const html = syndicationPage(asLumeData({ lang: "fr" }));

    assertStringIncludes(html, 'href="/fr/rss.xml"');
    assertStringIncludes(html, 'href="/fr/atom.xml"');
    assertStringIncludes(html, 'href="/fr/feed.json"');
    assertNotMatch(html, /sitemap\.xml/);
    assertStringIncludes(html, 'data-copy-default-label="Copier"');
    assertStringIncludes(
      html,
      'data-copy-copied-status="URL de Flux RSS copiée"',
    );
  });
});

describe("syndication CSS contracts", () => {
  it("keeps the minimal descriptions layout and Ant-like copy button styling", () => {
    assertStringIncludes(layoutStyles, ".feeds-descriptions,");
    assertStringIncludes(layoutStyles, ".feeds-description-row {");
    assertStringIncludes(layoutStyles, ".feeds-description-term {");
    assertStringIncludes(layoutStyles, ".feeds-endpoint-row {");
    assertStringIncludes(
      layoutStyles,
      ".feeds-endpoint-actions.ant-typography.ant-typography-actions {",
    );
    assertStringIncludes(
      layoutStyles,
      ".feeds-endpoint-copy-button.ant-typography-copy {",
    );
    assertStringIncludes(layoutStyles, ".feeds-copy-icon-stack {");
  });

  it("keeps copy state styling for copied and error states", () => {
    assertStringIncludes(
      layoutStyles,
      ".feed-copy-control--copied .feeds-endpoint-copy-button {",
    );
    assertStringIncludes(
      layoutStyles,
      ".feed-copy-control--copied .feeds-copy-icon--success {",
    );
    assertStringIncludes(
      layoutStyles,
      ".feed-copy-control--error .feeds-endpoint-copy-button {",
    );
  });

  it("keeps the pagehead narrow and single-purpose", () => {
    assertStringIncludes(layoutStyles, ".feeds-page-title,");
    assertStringIncludes(layoutStyles, ".syndication-intro {");
  });
});

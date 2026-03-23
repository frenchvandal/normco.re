import { assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import layoutStyles from "./styles/layout.css" with {
  type: "text",
};
import { asLumeData, asLumeHelpers } from "../test/lume.ts";

import page404 from "./404.page.tsx";

const MOCK_DATA = asLumeData({});
const MOCK_HELPERS = asLumeHelpers({});

describe("404.page.tsx", () => {
  it("renders the shared state panel shell", () => {
    const html = page404(MOCK_DATA, MOCK_HELPERS);
    assertStringIncludes(
      html,
      'class="site-page-shell site-page-shell--editorial state-page state-page--404"',
    );
    assertStringIncludes(
      html,
      'class="state-panel state-panel--page state-panel--not-found"',
    );
  });

  it('displays the "404" eyebrow', () => {
    const html = page404(MOCK_DATA, MOCK_HELPERS);
    assertStringIncludes(html, 'class="state-panel-eyebrow"');
    assertStringIncludes(html, ">404<");
  });

  it("contains a semantic h1 heading", () => {
    const html = page404(MOCK_DATA, MOCK_HELPERS);
    assertStringIncludes(html, "<h1");
    assertStringIncludes(html, "Page not found");
  });

  it("contains a back-to-home link", () => {
    const html = page404(MOCK_DATA, MOCK_HELPERS);
    assertStringIncludes(html, 'href="/"');
  });

  it("marks the 404 code as aria-hidden", () => {
    const html = page404(MOCK_DATA, MOCK_HELPERS);
    assertStringIncludes(html, 'aria-hidden="true"');
  });

  it("localizes message and home link for French data", () => {
    const frenchData = asLumeData({ lang: "fr" });
    const html = page404(frenchData, MOCK_HELPERS);
    assertStringIncludes(html, "Page introuvable");
    assertStringIncludes(html, 'href="/fr/"');
  });
});

describe("state panel CSS contracts", () => {
  it("keeps the page state centered in a narrow editorial column", () => {
    assertStringIncludes(layoutStyles, ".state-panel--page {");
    assertStringIncludes(layoutStyles, "inline-size: min(100%, 480px);");
    assertStringIncludes(layoutStyles, ".state-panel-actions {");
  });

  it("gives the status code and copy their dedicated hierarchy", () => {
    assertStringIncludes(layoutStyles, ".state-panel-eyebrow {");
    assertStringIncludes(layoutStyles, "font-size: var(--ph-text-3xl);");
    assertStringIncludes(
      layoutStyles,
      ".state-panel-message {",
    );
  });
});

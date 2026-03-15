import { assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import aboutPage from "./about.page.tsx";

const MOCK_DATA = {} as unknown as Lume.Data;
const MOCK_HELPERS = {} as unknown as Lume.Helpers;

describe("about.page.tsx", () => {
  it("wraps the content in the editorial shell", () => {
    const html = aboutPage(MOCK_DATA, MOCK_HELPERS);
    assertStringIncludes(
      html,
      'class="site-page-shell site-page-shell--editorial"',
    );
  });

  it("renders an h1 heading", () => {
    const html = aboutPage(MOCK_DATA, MOCK_HELPERS);
    assertStringIncludes(html, "<h1");
    assertStringIncludes(html, "About");
  });

  it("contains the about-content wrapper", () => {
    const html = aboutPage(MOCK_DATA, MOCK_HELPERS);
    assertStringIncludes(html, 'class="about-content"');
  });

  it("contains an RSS feed link", () => {
    const html = aboutPage(MOCK_DATA, MOCK_HELPERS);
    assertStringIncludes(html, 'href="/feed.xml"');
  });

  it("contains a JSON Feed link", () => {
    const html = aboutPage(MOCK_DATA, MOCK_HELPERS);
    assertStringIncludes(html, 'href="/feed.json"');
  });

  it("renders localized French content when `lang` is `fr`", () => {
    const frenchData = { lang: "fr" } as unknown as Lume.Data;
    const html = aboutPage(frenchData, MOCK_HELPERS);
    assertStringIncludes(html, "À propos");
    assertStringIncludes(html, 'href="/fr/feed.xml"');
  });
});

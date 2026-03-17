import { assertNotMatch, assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import aboutPage from "./about.page.tsx";

const MOCK_DATA = {} as unknown as Lume.Data;
const MOCK_HELPERS = {} as unknown as Lume.Helpers;

describe("about.page.tsx", () => {
  it("wraps the content in the wide page shell", () => {
    const html = aboutPage(MOCK_DATA, MOCK_HELPERS);
    assertStringIncludes(
      html,
      'class="site-page-shell site-page-shell--wide"',
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

  it("renders the about rail with supporting cards", () => {
    const html = aboutPage(MOCK_DATA, MOCK_HELPERS);
    assertStringIncludes(
      html,
      'class="feature-layout feature-layout--with-rail"',
    );
    assertStringIncludes(html, 'class="feature-rail about-rail"');
    assertStringIncludes(html, 'class="feature-card about-contact-card"');
    assertStringIncludes(html, "about-contact-icon--wechat");
    assertStringIncludes(html, "about-contact-icon--telegram");
    assertStringIncludes(html, "At a glance");
    assertStringIncludes(html, 'class="about-pictogram-frame"');
    assertStringIncludes(html, "<svg");
    assertStringIncludes(html, "<path");
    assertNotMatch(html, /data:image\/png;base64,/);
  });

  it("contains an RSS feed link", () => {
    const html = aboutPage(MOCK_DATA, MOCK_HELPERS);
    assertStringIncludes(html, 'href="/feed.xml"');
  });

  it("contains an Atom feed link", () => {
    const html = aboutPage(MOCK_DATA, MOCK_HELPERS);
    assertStringIncludes(html, 'href="/atom.xml"');
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
    assertStringIncludes(html, 'href="/fr/atom.xml"');
    assertStringIncludes(html, "En bref");
    assertStringIncludes(html, "J’écris");
    assertStringIncludes(html, "C’est juste un endroit");
    assertNotMatch(html, /J&#39;écris/);
  });
});

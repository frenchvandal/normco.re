import { assert, assertNotMatch, assertStringIncludes } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import layoutStyles from "./styles/layout.css" with { type: "text" };
import { asLumeData, asLumeHelpers } from "../test/lume.ts";

import aboutPage from "./about.page.tsx";

const MOCK_DATA = asLumeData({});
const MOCK_HELPERS = asLumeHelpers({});

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
    assertStringIncludes(html, 'class="pagehead about-pagehead"');
    assertStringIncludes(html, 'class="about-pagehead-grid"');
    assertStringIncludes(html, "<h1");
    assertStringIncludes(html, "About");
  });

  it("renders a breadcrumb", () => {
    const html = aboutPage(MOCK_DATA, MOCK_HELPERS);

    assertStringIncludes(html, 'class="cds--breadcrumb"');
    assertStringIncludes(html, 'aria-label="About breadcrumb"');
    assertStringIncludes(html, 'href="/" class="cds--breadcrumb-link"');
    assertNotMatch(html, /cds--breadcrumb-current/);
    assertNotMatch(html, /aria-current="page"/);
  });

  it("contains the about-content wrapper", () => {
    const html = aboutPage(MOCK_DATA, MOCK_HELPERS);
    assertStringIncludes(html, 'class="about-content"');
    assertStringIncludes(html, 'class="about-intro"');
  });

  it("renders the about rail with supporting cards", () => {
    const html = aboutPage(MOCK_DATA, MOCK_HELPERS);
    assertStringIncludes(
      html,
      'class="feature-layout feature-layout--with-rail"',
    );
    assertStringIncludes(html, 'class="feature-rail about-rail"');
    assertStringIncludes(
      html,
      'class="feature-card about-rail-card about-contact-card"',
    );
    assertStringIncludes(
      html,
      'class="feature-card about-rail-card about-facts-card"',
    );
    assertStringIncludes(
      html,
      'class="feature-card about-rail-card about-notes-card"',
    );
    assertStringIncludes(html, "about-contact-icon--wechat");
    assertStringIncludes(html, "about-contact-icon--telegram");
    assertStringIncludes(html, 'data-contact-toggletip=""');
    assertStringIncludes(html, 'data-contact-toggletip-trigger=""');
    assertStringIncludes(html, 'data-contact-toggletip-close=""');
    assertStringIncludes(html, 'class="cds--popover" hidden');
    assertStringIncludes(html, 'transform-images="avif webp jpg 240 360 512"');
    assertStringIncludes(html, 'width="1170"');
    assertStringIncludes(html, 'height="2532"');
    assertStringIncludes(html, 'width="1224"');
    assertStringIncludes(html, 'height="1605"');
    assertStringIncludes(html, 'aria-label="Download QR Code"');
    assertStringIncludes(html, "At a glance");
    assertStringIncludes(
      html,
      'class="about-fact-icon about-fact-icon--location"',
    );
    assertStringIncludes(html, 'class="about-fact-icon-svg"');
    assertStringIncludes(html, 'class="about-pictogram-frame"');
    assertStringIncludes(html, "<svg");
    assertStringIncludes(html, "<path");
    assertNotMatch(html, /data:image\/png;base64,/);
  });

  it("renders Telegram before WeChat in the contact list", () => {
    const html = aboutPage(MOCK_DATA, MOCK_HELPERS);
    const telegramIndex = html.indexOf(">Telegram</span>");
    const wechatIndex = html.indexOf(">WeChat</span>");

    assert(telegramIndex !== -1);
    assert(wechatIndex !== -1);
    assert(telegramIndex < wechatIndex);
  });

  it("contains an RSS feed link", () => {
    const html = aboutPage(MOCK_DATA, MOCK_HELPERS);
    assertStringIncludes(html, 'href="/rss.xml"');
    assertStringIncludes(html, 'class="about-pagehead-feed-links"');
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
    const frenchData = asLumeData({ lang: "fr" });
    const html = aboutPage(frenchData, MOCK_HELPERS);
    assertStringIncludes(html, "À propos");
    assertStringIncludes(html, 'aria-label="Fil d’Ariane À propos"');
    assertStringIncludes(html, 'href="/fr/" class="cds--breadcrumb-link"');
    assertStringIncludes(html, 'aria-label="Télécharger le code QR"');
    assertStringIncludes(html, 'href="/fr/rss.xml"');
    assertStringIncludes(html, 'href="/fr/atom.xml"');
    assertStringIncludes(html, "En bref");
    assertStringIncludes(html, "J’écris");
    assertStringIncludes(html, "C’est juste un endroit");
    assertNotMatch(html, /J&#39;écris/);
  });

  it("renders localized Simplified Chinese contact labels", () => {
    const simplifiedChineseData = asLumeData({ lang: "zh-hans" });
    const html = aboutPage(simplifiedChineseData, MOCK_HELPERS);

    assertStringIncludes(html, ">电报</span>");
    assertStringIncludes(html, ">微信</span>");
    assertStringIncludes(html, 'aria-label="下载二维码"');
    assertStringIncludes(
      html,
      'href="/contact/wechat/contact-wechat-zh-hans.jpg"',
    );
  });

  it("renders localized Traditional Chinese WeChat and keeps Telegram in English", () => {
    const traditionalChineseData = asLumeData({ lang: "zh-hant" });
    const html = aboutPage(traditionalChineseData, MOCK_HELPERS);

    assertStringIncludes(html, ">Telegram</span>");
    assertStringIncludes(html, ">微信</span>");
    assertStringIncludes(html, 'aria-label="下載 QR 碼"');
    assertStringIncludes(
      html,
      'href="/contact/wechat/contact-wechat-zh-hant.jpg"',
    );
  });
});

describe("about page CSS contracts", () => {
  it("keeps the contact popover on the shared raised surface", () => {
    assertStringIncludes(layoutStyles, ".about-contact-popover {");
    assertStringIncludes(
      layoutStyles,
      "inline-size: min(18rem, calc(100vw - var(--ph-shell-gutter) * 2));",
    );
    assertStringIncludes(layoutStyles, ".about-contact-trigger:hover,");
  });

  it("keeps the QR and pictogram frames on shared neutral panels", () => {
    assertStringIncludes(
      layoutStyles,
      ".about-pictogram-frame,",
    );
    assertStringIncludes(
      layoutStyles,
      ".syndication-pictogram-frame {",
    );
    assertStringIncludes(
      layoutStyles,
      "background: var(--ph-color-canvas-default);",
    );
  });
});

import { assertNotMatch, assertStringIncludes } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import aboutStyles from "./styles/components/about.css" with { type: "text" };
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

  it("omits the redundant breadcrumb on the top-level about page", () => {
    const html = aboutPage(MOCK_DATA, MOCK_HELPERS);

    assertNotMatch(html, /About breadcrumb/);
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
    assertStringIncludes(html, 'data-icon="wechat"');
    assertStringIncludes(html, 'data-contact-toggletip=""');
    assertStringIncludes(html, 'data-contact-toggletip-trigger=""');
    assertStringIncludes(html, 'data-contact-toggletip-close=""');
    assertStringIncludes(html, 'class="site-popover" hidden');
    assertStringIncludes(html, 'class="about-contact-trigger-arrow"');
    assertStringIncludes(html, 'class="about-contact-popover-handle"');
    assertStringIncludes(html, 'class="about-contact-popover-title"');
    assertStringIncludes(html, 'transform-images="avif webp jpg 240 360 512"');
    assertStringIncludes(html, 'width="1224"');
    assertStringIncludes(html, 'height="1605"');
    assertStringIncludes(html, 'aria-label="Download QR Code"');
    assertStringIncludes(html, 'src="/scripts/about-contact-toggletips.js"');
    assertStringIncludes(html, 'class="about-contact-icon-svg"');
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
    assertNotMatch(html, /Fil d’Ariane À propos/);
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

    assertStringIncludes(html, ">微信</span>");
    assertStringIncludes(html, 'aria-label="下载二维码"');
    assertStringIncludes(
      html,
      'href="/contact/wechat/contact-wechat-zh-hans.jpg"',
    );
  });

  it("renders localized Traditional Chinese WeChat contact details", () => {
    const traditionalChineseData = asLumeData({ lang: "zh-hant" });
    const html = aboutPage(traditionalChineseData, MOCK_HELPERS);

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
    assertStringIncludes(aboutStyles, ".about-contact-popover {");
    assertStringIncludes(
      aboutStyles,
      "inline-size: min(18rem, calc(100vw - var(--ph-shell-gutter) * 2));",
    );
    assertStringIncludes(aboutStyles, ".about-contact-popover-title {");
    assertStringIncludes(aboutStyles, ".about-contact-trigger:hover,");
    assertStringIncludes(aboutStyles, ".about-contact-trigger-arrow {");
    assertStringIncludes(aboutStyles, ".about-contact-popover-handle {");
    assertStringIncludes(aboutStyles, "inset-block-start: 0;");
    assertStringIncludes(aboutStyles, "transition-behavior: allow-discrete;");
  });

  it("keeps the QR frame neutral and gives the field note a restrained mobile and dark treatment", () => {
    assertStringIncludes(
      aboutStyles,
      ".about-pictogram-frame {",
    );
    assertStringIncludes(
      aboutStyles,
      "place-items: end center;",
    );
    assertStringIncludes(
      aboutStyles,
      "--about-pictogram-shift-x: calc(var(--ph-space-2) * -0.35);",
    );
    assertStringIncludes(
      aboutStyles,
      "--about-pictogram-shift-y: calc(var(--ph-space-2) * 0.6);",
    );
    assertStringIncludes(
      aboutStyles,
      "overflow: hidden;",
    );
    assertStringIncludes(
      aboutStyles,
      "background: var(--about-pictogram-surface);",
    );
    assertStringIncludes(
      aboutStyles,
      ".about-pictogram-frame::before {",
    );
    assertStringIncludes(
      aboutStyles,
      "radial-gradient(",
    );
    assertStringIncludes(
      aboutStyles,
      "aspect-ratio: 1;",
    );
    assertStringIncludes(
      aboutStyles,
      "inline-size: min(100%, 14.5rem);",
    );
    assertStringIncludes(
      aboutStyles,
      `.about-pictogram {
      --about-pictogram-shift-y: calc(var(--ph-space-2) * 1.2);
      inline-size: min(100%, 12.5rem);
      block-size: 100%;`,
    );
    assertStringIncludes(
      aboutStyles,
      ".about-pictogram svg {\n      inline-size: min(100%, 10rem);",
    );
    assertStringIncludes(
      aboutStyles,
      ':root:is([data-color-mode="dark"], [data-theme-preference="dark"])',
    );
    assertStringIncludes(
      aboutStyles,
      "--about-pictogram-surface: linear-gradient(",
    );
  });
});

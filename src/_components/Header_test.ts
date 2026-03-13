import { assertMatch, assertNotMatch, assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import { renderComponent } from "lume/jsx-runtime";

import Header from "./Header.tsx";

describe("Header()", () => {
  describe("ariaCurrent — home menu link '/'", () => {
    it('marks "/" as current when currentUrl is "/"', async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertMatch(
        html,
        /<cds-header-nav-item[^>]*href="\/"[^>]*aria-current="page"/,
      );
    });

    it('does not mark "/" as current on /posts/', async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/posts/", language: "en" }),
      );
      assertNotMatch(
        html,
        /<cds-header-nav-item[^>]*href="\/"[^>]*aria-current="page"/,
      );
    });

    it('does not mark "/" as current on /about/', async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/about/", language: "en" }),
      );
      assertNotMatch(
        html,
        /<cds-header-nav-item[^>]*href="\/"[^>]*aria-current="page"/,
      );
    });
  });

  describe("ariaCurrent — /posts/ link", () => {
    it('marks /posts/ as current when currentUrl is "/posts/"', async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/posts/", language: "en" }),
      );
      assertMatch(
        html,
        /<cds-header-nav-item[^>]*href="\/posts\/"[^>]*aria-current="page"/,
      );
    });

    it("marks /posts/ as current for a child URL /posts/my-post/", async () => {
      const html = await renderComponent(
        Header({
          currentUrl: "/posts/my-post/",
          language: "en",
        }),
      );
      assertMatch(
        html,
        /<cds-header-nav-item[^>]*href="\/posts\/"[^>]*aria-current="page"/,
      );
    });

    it('does not mark /posts/ as current on "/"', async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertNotMatch(
        html,
        /<cds-header-nav-item[^>]*href="\/posts\/"[^>]*aria-current="page"/,
      );
    });
  });

  describe("ariaCurrent — /about/ link", () => {
    it('marks /about/ as current when currentUrl is "/about/"', async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/about/", language: "en" }),
      );
      assertMatch(
        html,
        /<cds-header-nav-item[^>]*href="\/about\/"[^>]*aria-current="page"/,
      );
    });

    it('does not mark /about/ as current on "/"', async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertNotMatch(
        html,
        /<cds-header-nav-item[^>]*href="\/about\/"[^>]*aria-current="page"/,
      );
    });
  });

  describe("structure", () => {
    it("wraps everything in .site-header", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertStringIncludes(html, 'class="site-header"');
    });

    it("does not render the left-side site-name link anymore", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/about/", language: "en" }),
      );
      assertNotMatch(html, /class="site-name"/);
    });

    it("contains a Writing nav link", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertStringIncludes(html, 'href="/posts/"');
      assertStringIncludes(html, "Writing");
    });

    it("contains a Home nav link in the hamburger menu", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertMatch(
        html,
        /<cds-side-nav-link[^>]*href="\/"[^>]*>Home<\/cds-side-nav-link>/,
      );
    });

    it("contains an About nav link", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertStringIncludes(html, 'href="/about/"');
      assertStringIncludes(html, "About");
    });

    it("renders a hamburger trigger and a Carbon search action panel", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertMatch(
        html,
        /<cds-header-menu-button[^>]*button-label-active="Open navigation menu"[^>]*button-label-inactive="Open navigation menu"/,
      );
      assertStringIncludes(html, "<cds-header-global-action");
      assertStringIncludes(html, 'panel-id="site-search-panel"');
      assertStringIncludes(html, "<cds-header-panel");
      assertStringIncludes(html, 'class="site-search-panel"');
      assertStringIncludes(html, 'data-search-panel=""');
      assertStringIncludes(html, 'data-search-root=""');
      assertStringIncludes(html, 'id="search"');
      assertNotMatch(html, /search-16\.svg/);
    });

    it("renders Carbon header navigation shell elements", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertStringIncludes(html, "<cds-header");
      assertStringIncludes(html, "<cds-header-nav");
      assertStringIncludes(html, "<cds-side-nav");
    });

    it("renders a native language selector <select> with localized options", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "fr" }),
      );
      // Select element with proper accessibility (aria-label is localized)
      assertMatch(
        html,
        /<select[^>]*id="language-select"[^>]*name="language"[^>]*class="site-language-select"[^>]*aria-label="Choisir la langue"/,
      );
      // All language options present
      assertStringIncludes(html, 'value="en"');
      assertStringIncludes(html, 'value="fr"');
      assertStringIncludes(html, 'value="zhHans"');
      assertStringIncludes(html, 'value="zhHant"');
      // Current language selected
      assertMatch(
        html,
        /<option[^>]*value="fr"[^>]*selected[^>]*>Français<\/option>/,
      );
      // Language names displayed
      assertStringIncludes(html, ">English<");
      assertStringIncludes(html, ">Français<");
      assertStringIncludes(html, ">简体中文<");
      assertStringIncludes(html, ">繁體中文<");
      // Hidden label for accessibility (localized)
      assertMatch(
        html,
        /<label[^>]*for="language-select"[^>]*class="site-language-select-label sr-only"[^>]*>Langue<\/label>/,
      );
      // Old Carbon switcher removed
      assertNotMatch(html, /<cds-switcher/);
      assertNotMatch(html, /<cds-switcher-item/);
      assertNotMatch(html, /data-language-option=/);
      assertNotMatch(html, /data-current-language=/);
    });

    it("contains the native theme toggle button", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertStringIncludes(html, "<button");
      assertStringIncludes(html, 'id="theme-toggle"');
      assertStringIncludes(html, 'type="button"');
      assertStringIncludes(html, 'class="site-theme-action"');
      assertStringIncludes(html, 'aria-label="Toggle color theme"');
      assertStringIncludes(html, 'aria-pressed="false"');
    });

    it("contains the contrast SVG icon", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertMatch(html, /class="theme-icon[^"]*"/);
    });

    it("has correct accessibility attributes for theme toggle button", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      // Native button with proper type and ARIA
      assertMatch(
        html,
        /<button[^>]*id="theme-toggle"[^>]*type="button"[^>]*aria-label="Toggle color theme"[^>]*aria-pressed="false"/,
      );
      // Data attributes for JS theme toggle
      assertMatch(
        html,
        /data-label-switch-light="Switch to light theme"/,
      );
      assertMatch(
        html,
        /data-label-switch-dark="Switch to dark theme"/,
      );
    });

    it("localizes navigation links for French pages", async () => {
      const html = await renderComponent(
        Header({
          currentUrl: "/fr/about/",
          language: "fr",
        }),
      );
      assertStringIncludes(html, 'href="/fr/posts/"');
      assertStringIncludes(html, "À propos");
    });
  });

  describe("home link label — i18n", () => {
    it('renders "Home" as the home link text in English', async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertStringIncludes(html, ">Home<");
    });

    it('renders "Accueil" as the home link text in French', async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/fr/", language: "fr" }),
      );
      assertStringIncludes(html, ">Accueil<");
    });

    it('renders "首页" as the home link text in Simplified Chinese', async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/zh-hans/", language: "zhHans" }),
      );
      assertStringIncludes(html, ">首页<");
    });

    it('renders "首頁" as the home link text in Traditional Chinese', async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/zh-hant/", language: "zhHant" }),
      );
      assertStringIncludes(html, ">首頁<");
    });
  });
});

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

    it("renders a Watson Language Translator Carbon panel and localized language options", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "fr" }),
      );
      assertStringIncludes(html, 'panel-id="site-language-panel"');
      assertStringIncludes(html, 'id="site-language-panel"');
      assertStringIncludes(html, 'class="site-language-panel"');
      assertStringIncludes(html, 'data-language-panel=""');
      assertStringIncludes(html, "<cds-switcher");
      assertMatch(
        html,
        /class="site-language-action-icon site-language-action-icon--watson"/,
      );
      assertStringIncludes(html, 'data-language-option="en"');
      assertStringIncludes(html, 'data-language-option="fr"');
      assertStringIncludes(html, 'data-language-option="zhHans"');
      assertStringIncludes(html, 'data-language-option="zhHant"');
      assertStringIncludes(html, 'data-current-language="true"');
      assertMatch(html, /<cds-switcher-item[^>]*selected=""[^>]*>Français/);
      assertNotMatch(html, /🇬🇧|🇫🇷|🇨🇳|🇹🇼/);
    });

    it("contains the Carbon theme toggle action", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertStringIncludes(html, "<cds-button");
      assertStringIncludes(html, 'id="theme-toggle"');
      assertStringIncludes(html, 'class="site-theme-action"');
      assertStringIncludes(html, 'kind="ghost"');
      assertStringIncludes(html, 'size="lg"');
      assertStringIncludes(html, 'tooltip-text="Toggle color theme"');
      assertStringIncludes(html, 'aria-label="Toggle color theme"');
    });

    it("contains the contrast SVG icon", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertMatch(html, /class="theme-icon[^"]*"/);
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

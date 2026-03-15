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
        /<a[^>]*href="\/"[^>]*class="cds--header__menu-item"[^>]*aria-current="page"/,
      );
    });

    it('does not mark "/" as current on /posts/', async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/posts/", language: "en" }),
      );
      assertNotMatch(
        html,
        /<a[^>]*href="\/"[^>]*class="cds--header__menu-item"[^>]*aria-current="page"/,
      );
    });

    it('does not mark "/" as current on /about/', async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/about/", language: "en" }),
      );
      assertNotMatch(
        html,
        /<a[^>]*href="\/"[^>]*class="cds--header__menu-item"[^>]*aria-current="page"/,
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
        /<a[^>]*href="\/posts\/"[^>]*class="cds--header__menu-item"[^>]*aria-current="page"/,
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
        /<a[^>]*href="\/posts\/"[^>]*class="cds--header__menu-item"[^>]*aria-current="page"/,
      );
    });

    it('does not mark /posts/ as current on "/"', async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertNotMatch(
        html,
        /<a[^>]*href="\/posts\/"[^>]*class="cds--header__menu-item"[^>]*aria-current="page"/,
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
        /<a[^>]*href="\/about\/"[^>]*class="cds--header__menu-item"[^>]*aria-current="page"/,
      );
    });

    it('does not mark /about/ as current on "/"', async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertNotMatch(
        html,
        /<a[^>]*href="\/about\/"[^>]*class="cds--header__menu-item"[^>]*aria-current="page"/,
      );
    });
  });

  describe("Carbon UI Shell structure", () => {
    it("renders Carbon UI Shell header with cds--header class", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertMatch(html, /<header[^>]*class="cds--header"/);
    });

    it("renders header wrapper with cds--header__wrapper", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertStringIncludes(html, 'class="cds--header__wrapper"');
    });

    it("renders header left section with cds--header__left", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertStringIncludes(html, 'class="cds--header__left"');
    });

    it("renders header global actions with cds--header__global", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertStringIncludes(html, 'class="cds--header__global"');
    });

    it("renders product name with cds--header__name", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertMatch(html, /<a[^>]*href="\/"[^>]*class="cds--header__name"/);
      assertStringIncludes(
        html,
        '<span class="cds--header__name--prefix">normco</span>',
      );
    });
  });

  describe("hamburger menu toggle", () => {
    it("renders hamburger menu toggle button", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertMatch(
        html,
        /<button[^>]*class="cds--header__action cds--header__menu-toggle"[^>]*aria-label="Open navigation menu"[^>]*aria-expanded="false"[^>]*aria-controls="site-side-nav"/,
      );
    });

    it("renders hamburger menu icon SVG", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertMatch(html, /<svg[^>]*class="cds--header__menu-icon"/);
      assertStringIncludes(html, 'data-carbon-icon="menu"');
    });
  });

  describe("header navigation", () => {
    it("renders header navigation with cds--header__nav", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertMatch(
        html,
        /<nav[^>]*class="cds--header__nav"[^>]*aria-label="Main navigation"/,
      );
    });

    it("renders navigation items as cds--header__menu-item", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertStringIncludes(html, 'class="cds--header__menu-item"');
      assertStringIncludes(html, 'href="/"');
      assertStringIncludes(html, 'href="/posts/"');
      assertStringIncludes(html, 'href="/about/"');
    });
  });

  describe("SideNav (Left Panel)", () => {
    it("renders SideNav aside with cds--side-nav class", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertMatch(
        html,
        /<aside[^>]*id="site-side-nav"[^>]*class="cds--side-nav"[^>]*aria-label="Main navigation"[^>]*hidden/,
      );
    });

    it("renders SideNav navigation structure", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertStringIncludes(html, 'class="cds--side-nav__navigation"');
      assertStringIncludes(html, 'class="cds--side-nav__items"');
      assertStringIncludes(html, 'class="cds--side-nav__item"');
      assertStringIncludes(html, 'class="cds--side-nav__link"');
      assertStringIncludes(html, 'class="cds--side-nav__link-text"');
    });

    it("renders SideNav overlay", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertMatch(
        html,
        /<div[^>]*class="cds--side-nav__overlay"[^>]*aria-hidden="true"/,
      );
    });
  });

  describe("search action", () => {
    it("renders search action button", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertMatch(
        html,
        /<button[^>]*class="cds--header__action"[^>]*aria-label="Search"[^>]*aria-expanded="false"[^>]*aria-controls="site-search-panel"/,
      );
    });

    it("renders search panel", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertMatch(
        html,
        /<div[^>]*id="site-search-panel"[^>]*class="cds--header__panel cds--header__search-panel"/,
      );
      assertStringIncludes(html, 'class="cds--header__search-root"');
      assertStringIncludes(
        html,
        'data-search-unavailable-label="Search is temporarily unavailable."',
      );
      assertStringIncludes(
        html,
        'data-search-offline-label="Search is unavailable while offline."',
      );
      assertStringIncludes(html, 'data-search-retry-label="Retry"');
    });
  });

  describe("language selector", () => {
    it("renders language toggle button", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertMatch(
        html,
        /<button[^>]*class="cds--header__action cds--header__language-toggle"[^>]*aria-label="Select language"[^>]*aria-controls="site-language-panel"/,
      );
    });

    it("renders language panel with language options", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "fr" }),
      );
      assertMatch(
        html,
        /<section[^>]*id="site-language-panel"[^>]*class="cds--header__panel cds--header__language-panel"[^>]*hidden/,
      );
      assertStringIncludes(html, 'data-language-menu=""');
      assertStringIncludes(html, 'role="menu"');
      assertStringIncludes(html, "cds--header__language-option");
      // Language options present
      assertStringIncludes(html, 'href="/"');
      assertStringIncludes(html, 'href="/fr/"');
      assertStringIncludes(html, 'href="/zh-hans/"');
      assertStringIncludes(html, 'href="/zh-hant/"');
      // Current language marked
      assertMatch(
        html,
        /<a[^>]*href="\/fr\/"[^>]*cds--header__language-option[^>]*role="menuitemradio"[^>]*aria-checked="true"/,
      );
      assertStringIncludes(html, 'data-language-panel=""');
      assertStringIncludes(html, 'data-language-option="en"');
      assertStringIncludes(html, 'data-carbon-icon="checkmark"');
    });

    it("uses page alternates for language links when available", async () => {
      const html = await renderComponent(
        Header({
          currentUrl: "/fr/about/",
          language: "fr",
          languageAlternates: {
            en: "/about/",
            fr: "/fr/about/",
            zhHans: "/zh-hans/about/",
            zhHant: "/zh-hant/about/",
          },
        }),
      );

      assertStringIncludes(
        html,
        'href="/about/" class="cds--header__language-option" data-language-option="en"',
      );
      assertStringIncludes(
        html,
        'href="/fr/about/" class="cds--header__language-option" data-language-option="fr"',
      );
      assertMatch(
        html,
        /<a[^>]*href="\/fr\/about\/"[^>]*aria-checked="true"/,
      );
    });

    it("renders language icon SVG", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertMatch(html, /<svg[^>]*class="cds--header__action-icon"/);
      assertStringIncludes(html, 'data-carbon-icon="translate"');
    });
  });

  describe("theme toggle", () => {
    it("renders theme toggle button", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertMatch(
        html,
        /<button[^>]*id="theme-toggle"[^>]*class="cds--header__action"[^>]*aria-label="Toggle color theme"/,
      );
    });

    it("contains theme icons", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertMatch(
        html,
        /<svg[^>]*class="cds--header__action-icon theme-icon theme-icon--sun"/,
      );
      assertMatch(
        html,
        /<svg[^>]*class="cds--header__action-icon theme-icon theme-icon--moon"/,
      );
      assertMatch(
        html,
        /<svg[^>]*class="cds--header__action-icon theme-icon theme-icon--system"/,
      );
      assertStringIncludes(html, 'data-carbon-icon="sun"');
      assertStringIncludes(html, 'data-carbon-icon="moon"');
      assertStringIncludes(html, 'data-carbon-icon="screen"');
      assertStringIncludes(html, 'data-label-follow-system="Follow system theme"');
    });
  });

  describe("localization", () => {
    it("localizes navigation links for French pages", async () => {
      const html = await renderComponent(
        Header({
          currentUrl: "/fr/about/",
          language: "fr",
        }),
      );
      assertStringIncludes(html, 'href="/fr/posts/"');
      assertStringIncludes(html, "Articles");
    });

    it("localizes menu toggle label", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "fr" }),
      );
      assertStringIncludes(html, 'aria-label="Ouvrir le menu de navigation"');
    });

    it("localizes search label", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "fr" }),
      );
      assertStringIncludes(html, 'aria-label="Recherche"');
    });

    it("does not mark the localized home link current on French child routes", async () => {
      const html = await renderComponent(
        Header({
          currentUrl: "/fr/posts/instructions/",
          language: "fr",
        }),
      );
      assertNotMatch(
        html,
        /<a[^>]*href="\/fr\/"[^>]*class="cds--header__menu-item"[^>]*aria-current="page"/,
      );
      assertNotMatch(
        html,
        /<a[^>]*href="\/fr\/"[^>]*class="cds--side-nav__link"[^>]*aria-current="page"/,
      );
      assertMatch(
        html,
        /<a[^>]*href="\/fr\/posts\/"[^>]*class="cds--header__menu-item"[^>]*aria-current="page"/,
      );
      assertMatch(
        html,
        /<a[^>]*href="\/fr\/posts\/"[^>]*class="cds--side-nav__link"[^>]*aria-current="page"/,
      );
    });
  });

  describe("old native components removed", () => {
    it("does not render old site-navigation-toggle", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertNotMatch(html, /class="site-navigation-toggle"/);
    });

    it("does not render old site-navigation", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertNotMatch(html, /class="site-navigation"/);
    });

    it("does not render old site-language-select", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertNotMatch(html, /class="site-language-select"/);
      assertNotMatch(html, /id="language-select"/);
    });

    it("does not render old Carbon cds-header-global-action", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertNotMatch(html, /<cds-header-global-action/);
    });
  });
});

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
        /<a[^>]*href="\/"[^>]*class="bx--header__menu-item"[^>]*aria-current="page"/,
      );
    });

    it('does not mark "/" as current on /posts/', async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/posts/", language: "en" }),
      );
      assertNotMatch(
        html,
        /<a[^>]*href="\/"[^>]*class="bx--header__menu-item"[^>]*aria-current="page"/,
      );
    });

    it('does not mark "/" as current on /about/', async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/about/", language: "en" }),
      );
      assertNotMatch(
        html,
        /<a[^>]*href="\/"[^>]*class="bx--header__menu-item"[^>]*aria-current="page"/,
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
        /<a[^>]*href="\/posts\/"[^>]*class="bx--header__menu-item"[^>]*aria-current="page"/,
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
        /<a[^>]*href="\/posts\/"[^>]*class="bx--header__menu-item"[^>]*aria-current="page"/,
      );
    });

    it('does not mark /posts/ as current on "/"', async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertNotMatch(
        html,
        /<a[^>]*href="\/posts\/"[^>]*class="bx--header__menu-item"[^>]*aria-current="page"/,
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
        /<a[^>]*href="\/about\/"[^>]*class="bx--header__menu-item"[^>]*aria-current="page"/,
      );
    });

    it('does not mark /about/ as current on "/"', async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertNotMatch(
        html,
        /<a[^>]*href="\/about\/"[^>]*class="bx--header__menu-item"[^>]*aria-current="page"/,
      );
    });
  });

  describe("Carbon UI Shell structure", () => {
    it("renders Carbon UI Shell header with bx--header class", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertMatch(html, /<header[^>]*class="bx--header"/);
    });

    it("renders header wrapper with bx--header__wrapper", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertStringIncludes(html, 'class="bx--header__wrapper"');
    });

    it("renders header left section with bx--header__left", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertStringIncludes(html, 'class="bx--header__left"');
    });

    it("renders header global actions with bx--header__global", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertStringIncludes(html, 'class="bx--header__global"');
    });

    it("renders product name with bx--header__name", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertMatch(html, /<a[^>]*href="\/"[^>]*class="bx--header__name"/);
      assertStringIncludes(
        html,
        '<span class="bx--header__name--prefix">normco</span>',
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
        /<button[^>]*class="bx--header__action bx--header__menu-toggle"[^>]*aria-label="Open navigation menu"[^>]*aria-expanded="false"[^>]*aria-controls="site-side-nav"/,
      );
    });

    it("renders hamburger menu icon SVG", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertMatch(html, /<svg[^>]*class="bx--header__menu-icon"/);
      assertStringIncludes(
        html,
        'd="M4 6H28V8H4zM4 15H28V17H4zM4 24H28V26H4z"',
      );
    });
  });

  describe("header navigation", () => {
    it("renders header navigation with bx--header__nav", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertMatch(
        html,
        /<nav[^>]*class="bx--header__nav"[^>]*aria-label="Main navigation"/,
      );
    });

    it("renders navigation items as bx--header__menu-item", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertStringIncludes(html, 'class="bx--header__menu-item"');
      assertStringIncludes(html, 'href="/"');
      assertStringIncludes(html, 'href="/posts/"');
      assertStringIncludes(html, 'href="/about/"');
    });
  });

  describe("SideNav (Left Panel)", () => {
    it("renders SideNav aside with bx--side-nav class", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertMatch(
        html,
        /<aside[^>]*id="site-side-nav"[^>]*class="bx--side-nav"[^>]*aria-label="Main navigation"[^>]*hidden/,
      );
    });

    it("renders SideNav navigation structure", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertStringIncludes(html, 'class="bx--side-nav__navigation"');
      assertStringIncludes(html, 'class="bx--side-nav__items"');
      assertStringIncludes(html, 'class="bx--side-nav__item"');
      assertStringIncludes(html, 'class="bx--side-nav__link"');
      assertStringIncludes(html, 'class="bx--side-nav__link-text"');
    });

    it("renders SideNav overlay", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertMatch(
        html,
        /<div[^>]*class="bx--side-nav__overlay"[^>]*aria-hidden="true"/,
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
        /<button[^>]*class="bx--header__action"[^>]*aria-label="Search"[^>]*aria-expanded="false"[^>]*aria-controls="site-search-panel"/,
      );
    });

    it("renders search panel", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertMatch(
        html,
        /<div[^>]*id="site-search-panel"[^>]*class="bx--header__panel bx--header__search-panel"/,
      );
      assertStringIncludes(html, 'class="bx--header__search-root"');
    });
  });

  describe("language selector", () => {
    it("renders language toggle button", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertMatch(
        html,
        /<button[^>]*class="bx--header__action bx--header__language-toggle"[^>]*aria-label="Select language"[^>]*aria-controls="site-language-panel"/,
      );
    });

    it("renders language panel with language options", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "fr" }),
      );
      assertMatch(
        html,
        /<div[^>]*id="site-language-panel"[^>]*class="bx--header__panel bx--header__language-panel"[^>]*hidden/,
      );
      assertStringIncludes(html, 'class="bx--header__panel-title"');
      assertStringIncludes(html, 'class="bx--header__language-list"');
      assertStringIncludes(html, "bx--header__language-item");
      // Language options present
      assertStringIncludes(html, 'href="/"');
      assertStringIncludes(html, 'href="/fr/"');
      assertStringIncludes(html, 'href="/zh-hans/"');
      assertStringIncludes(html, 'href="/zh-hant/"');
      // Current language marked
      assertMatch(
        html,
        /<a[^>]*href="\/fr\/"[^>]*bx--header__language-item[^>]*aria-current="page"/,
      );
    });

    it("renders language icon SVG", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertMatch(html, /<svg[^>]*class="bx--header__action-icon"/);
      // Carbon Translate icon
      assertStringIncludes(
        html,
        'd="M27.85 29H30L24 14H21.65l-6 15H17.8l1.6-4h6.85zM20.2 23l2.62-6.56L25.45 23zM18 7V5H11V2H9V5H2V7H12.74a14.71 14.71 0 0 1-3.19 6.18A13.5 13.5 0 0 1 7.26 9H5.16a16.47 16.47 0 0 0 3 5.58A16.84 16.84 0 0 1 3 18l.75 1.86A18.47 18.47 0 0 0 9.53 16a16.92 16.92 0 0 0 5.76 3.84L16 18a14.48 14.48 0 0 1-5.12-3.37A17.64 17.64 0 0 0 14.8 7z"',
      );
    });
  });

  describe("theme toggle", () => {
    it("renders theme toggle button", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertMatch(
        html,
        /<button[^>]*id="theme-toggle"[^>]*class="bx--header__action"[^>]*aria-label="Toggle color theme"/,
      );
    });

    it("contains theme icons", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertMatch(
        html,
        /<svg[^>]*class="bx--header__action-icon theme-icon theme-icon--sun"/,
      );
      assertMatch(
        html,
        /<svg[^>]*class="bx--header__action-icon theme-icon theme-icon--moon"/,
      );
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

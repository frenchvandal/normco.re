import { assertMatch, assertNotMatch, assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import { renderComponent } from "lume/jsx-runtime";

import Header from "./Header.tsx";

describe("Header()", () => {
  describe("ariaCurrent — home link '/'", () => {
    it('marks "/" as current when currentUrl is "/"', async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertMatch(html, /href="\/" class="site-name" aria-current="page"/);
    });

    it('does not mark "/" as current on /posts/', async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/posts/", language: "en" }),
      );
      assertNotMatch(html, /href="\/" class="site-name" aria-current="page"/);
    });

    it('does not mark "/" as current on /about/', async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/about/", language: "en" }),
      );
      assertNotMatch(html, /href="\/" class="site-name" aria-current="page"/);
    });
  });

  describe("ariaCurrent — /posts/ link", () => {
    it('marks /posts/ as current when currentUrl is "/posts/"', async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/posts/", language: "en" }),
      );
      assertMatch(html, /href="\/posts\/"[^>]*aria-current="page"/);
    });

    it("marks /posts/ as current for a child URL /posts/my-post/", async () => {
      const html = await renderComponent(
        Header({
          currentUrl: "/posts/my-post/",
          language: "en",
        }),
      );
      assertMatch(html, /href="\/posts\/"[^>]*aria-current="page"/);
    });

    it('does not mark /posts/ as current on "/"', async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertNotMatch(html, /href="\/posts\/"[^>]*aria-current="page"/);
    });
  });

  describe("ariaCurrent — /about/ link", () => {
    it('marks /about/ as current when currentUrl is "/about/"', async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/about/", language: "en" }),
      );
      assertMatch(html, /href="\/about\/"[^>]*aria-current="page"/);
    });

    it('does not mark /about/ as current on "/"', async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertNotMatch(html, /href="\/about\/"[^>]*aria-current="page"/);
    });
  });

  describe("structure", () => {
    it("wraps everything in .site-header", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertStringIncludes(html, 'class="site-header"');
    });

    it("contains the site-name link pointing to /", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/about/", language: "en" }),
      );
      assertStringIncludes(html, 'href="/"');
      assertStringIncludes(html, 'class="site-name"');
    });

    it("contains a Writing nav link", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertStringIncludes(html, 'href="/posts/"');
      assertStringIncludes(html, "Writing");
    });

    it("contains an About nav link", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertStringIncludes(html, 'href="/about/"');
      assertStringIncludes(html, "About");
    });

    it("renders a hamburger menu trigger and a search container", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertMatch(
        html,
        /class="site-menu-trigger-icon octicon-svg"[^>]*src="\/icons\/octicons\/three-bars-16\.svg"/,
      );
      assertStringIncludes(html, 'id="search"');
    });

    it("renders a globe trigger and localized language menu options", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "fr" }),
      );
      assertStringIncludes(html, 'class="language-switcher"');
      assertMatch(
        html,
        /class="language-menu-trigger-icon octicon-svg"[^>]*src="\/icons\/octicons\/globe-16\.svg"/,
      );
      assertStringIncludes(html, 'data-language-option="en"');
      assertStringIncludes(html, 'data-language-option="fr"');
      assertStringIncludes(html, 'data-language-option="zhHans"');
      assertStringIncludes(html, 'data-language-option="zhHant"');
      assertStringIncludes(html, 'data-current-language="true"');
      assertNotMatch(html, /🇬🇧|🇫🇷|🇨🇳|🇹🇼/);
    });

    it("contains the theme-toggle button", async () => {
      const html = await renderComponent(
        Header({ currentUrl: "/", language: "en" }),
      );
      assertStringIncludes(html, 'id="theme-toggle"');
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

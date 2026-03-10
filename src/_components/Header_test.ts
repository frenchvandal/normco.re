import { assertMatch, assertNotMatch, assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";
import { renderComponent } from "lume/jsx-runtime";
import { faker } from "npm/faker-js";

import Header from "./Header.tsx";

function makeSiteName(seed: number): string {
  faker.seed(seed);
  return faker.internet.domainName();
}

describe("Header()", () => {
  describe("ariaCurrent — home link '/'", () => {
    it('marks "/" as current when currentUrl is "/"', async () => {
      const siteName = makeSiteName(201);
      const html = await renderComponent(
        Header({ currentUrl: "/", siteName: siteName, language: "en" }),
      );
      assertMatch(html, /href="\/" class="site-name" aria-current="page"/);
    });

    it('does not mark "/" as current on /posts/', async () => {
      const siteName = makeSiteName(202);
      const html = await renderComponent(
        Header({ currentUrl: "/posts/", siteName: siteName, language: "en" }),
      );
      assertNotMatch(html, /href="\/" class="site-name" aria-current="page"/);
    });

    it('does not mark "/" as current on /about/', async () => {
      const siteName = makeSiteName(203);
      const html = await renderComponent(
        Header({ currentUrl: "/about/", siteName: siteName, language: "en" }),
      );
      assertNotMatch(html, /href="\/" class="site-name" aria-current="page"/);
    });
  });

  describe("ariaCurrent — /posts/ link", () => {
    it('marks /posts/ as current when currentUrl is "/posts/"', async () => {
      const siteName = makeSiteName(204);
      const html = await renderComponent(
        Header({ currentUrl: "/posts/", siteName: siteName, language: "en" }),
      );
      assertMatch(html, /href="\/posts\/"[^>]*aria-current="page"/);
    });

    it("marks /posts/ as current for a child URL /posts/my-post/", async () => {
      const siteName = makeSiteName(205);
      const html = await renderComponent(
        Header({
          currentUrl: "/posts/my-post/",
          siteName: siteName,
          language: "en",
        }),
      );
      assertMatch(html, /href="\/posts\/"[^>]*aria-current="page"/);
    });

    it('does not mark /posts/ as current on "/"', async () => {
      const siteName = makeSiteName(206);
      const html = await renderComponent(
        Header({ currentUrl: "/", siteName: siteName, language: "en" }),
      );
      assertNotMatch(html, /href="\/posts\/"[^>]*aria-current="page"/);
    });
  });

  describe("ariaCurrent — /about/ link", () => {
    it('marks /about/ as current when currentUrl is "/about/"', async () => {
      const siteName = makeSiteName(207);
      const html = await renderComponent(
        Header({ currentUrl: "/about/", siteName: siteName, language: "en" }),
      );
      assertMatch(html, /href="\/about\/"[^>]*aria-current="page"/);
    });

    it('does not mark /about/ as current on "/"', async () => {
      const siteName = makeSiteName(208);
      const html = await renderComponent(
        Header({ currentUrl: "/", siteName: siteName, language: "en" }),
      );
      assertNotMatch(html, /href="\/about\/"[^>]*aria-current="page"/);
    });
  });

  describe("structure", () => {
    it("wraps everything in .site-header", async () => {
      const siteName = makeSiteName(209);
      const html = await renderComponent(
        Header({ currentUrl: "/", siteName: siteName, language: "en" }),
      );
      assertStringIncludes(html, 'class="site-header"');
    });

    it("contains the site-name link pointing to /", async () => {
      const siteName = makeSiteName(210);
      const html = await renderComponent(
        Header({ currentUrl: "/about/", siteName: siteName, language: "en" }),
      );
      assertStringIncludes(html, 'href="/"');
      assertStringIncludes(html, 'class="site-name"');
    });

    it("contains a Writing nav link", async () => {
      const siteName = makeSiteName(211);
      const html = await renderComponent(
        Header({ currentUrl: "/", siteName: siteName, language: "en" }),
      );
      assertStringIncludes(html, 'href="/posts/"');
      assertStringIncludes(html, "Writing");
    });

    it("contains an About nav link", async () => {
      const siteName = makeSiteName(212);
      const html = await renderComponent(
        Header({ currentUrl: "/", siteName: siteName, language: "en" }),
      );
      assertStringIncludes(html, 'href="/about/"');
      assertStringIncludes(html, "About");
    });

    it("renders the language flag with OpenMoji and an emoji fallback", async () => {
      const siteName = makeSiteName(2121);
      const html = await renderComponent(
        Header({ currentUrl: "/", siteName: siteName, language: "fr" }),
      );
      assertMatch(
        html,
        /class="language-switcher-flag-icon"[^>]*src="\/icons\/openmoji\/1F1EB-1F1F7\.svg"/,
      );
      assertStringIncludes(html, 'class="language-switcher-flag-emoji"');
      assertStringIncludes(html, "🇫🇷");
    });

    it("contains the theme-toggle button", async () => {
      const siteName = makeSiteName(213);
      const html = await renderComponent(
        Header({ currentUrl: "/", siteName: siteName, language: "en" }),
      );
      assertStringIncludes(html, 'id="theme-toggle"');
      assertStringIncludes(html, 'aria-label="Toggle color theme"');
    });

    it("contains the contrast SVG icon", async () => {
      const siteName = makeSiteName(214);
      const html = await renderComponent(
        Header({ currentUrl: "/", siteName: siteName, language: "en" }),
      );
      assertMatch(html, /class="theme-icon[^"]*"/);
    });

    it("localizes navigation links for French pages", async () => {
      const siteName = makeSiteName(215);
      const html = await renderComponent(
        Header({
          currentUrl: "/fr/about/",
          siteName: siteName,
          language: "fr",
        }),
      );
      assertStringIncludes(html, 'href="/fr/posts/"');
      assertStringIncludes(html, "À propos");
    });
  });
});

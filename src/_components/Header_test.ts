import { assertMatch, assertNotMatch, assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import Header from "./Header.tsx";

describe("Header()", () => {
  describe("ariaCurrent — home link '/'", () => {
    it('marks "/" as current when currentUrl is "/"', () => {
      const html = Header({ currentUrl: "/" });
      assertMatch(html, /href="\/" class="site-name" aria-current="page"/);
    });

    it('does not mark "/" as current on /posts/', () => {
      const html = Header({ currentUrl: "/posts/" });
      assertNotMatch(html, /href="\/" class="site-name" aria-current="page"/);
    });

    it('does not mark "/" as current on /about/', () => {
      const html = Header({ currentUrl: "/about/" });
      assertNotMatch(html, /href="\/" class="site-name" aria-current="page"/);
    });
  });

  describe("ariaCurrent — /posts/ link", () => {
    it('marks /posts/ as current when currentUrl is "/posts/"', () => {
      const html = Header({ currentUrl: "/posts/" });
      assertStringIncludes(html, 'href="/posts/" aria-current="page"');
    });

    it("marks /posts/ as current for a child URL /posts/my-post/", () => {
      const html = Header({ currentUrl: "/posts/my-post/" });
      assertStringIncludes(html, 'href="/posts/" aria-current="page"');
    });

    it('does not mark /posts/ as current on "/"', () => {
      const html = Header({ currentUrl: "/" });
      assertNotMatch(html, /href="\/posts\/" aria-current="page"/);
    });
  });

  describe("ariaCurrent — /about/ link", () => {
    it('marks /about/ as current when currentUrl is "/about/"', () => {
      const html = Header({ currentUrl: "/about/" });
      assertStringIncludes(html, 'href="/about/" aria-current="page"');
    });

    it('does not mark /about/ as current on "/"', () => {
      const html = Header({ currentUrl: "/" });
      assertNotMatch(html, /href="\/about\/" aria-current="page"/);
    });
  });

  describe("structure", () => {
    it("wraps everything in .site-header", () => {
      const html = Header({ currentUrl: "/" });
      assertStringIncludes(html, 'class="site-header"');
    });

    it("contains the site-name link pointing to /", () => {
      const html = Header({ currentUrl: "/about/" });
      assertStringIncludes(html, 'href="/"');
      assertStringIncludes(html, 'class="site-name"');
    });

    it("contains a Writing nav link", () => {
      const html = Header({ currentUrl: "/" });
      assertStringIncludes(html, 'href="/posts/"');
      assertStringIncludes(html, "Writing");
    });

    it("contains an About nav link", () => {
      const html = Header({ currentUrl: "/" });
      assertStringIncludes(html, 'href="/about/"');
      assertStringIncludes(html, "About");
    });

    it("contains the theme-toggle button", () => {
      const html = Header({ currentUrl: "/" });
      assertStringIncludes(html, 'id="theme-toggle"');
      assertStringIncludes(html, 'aria-label="Toggle color theme"');
    });

    it("contains the contrast SVG icon", () => {
      const html = Header({ currentUrl: "/" });
      assertStringIncludes(html, 'class="theme-icon"');
    });
  });
});

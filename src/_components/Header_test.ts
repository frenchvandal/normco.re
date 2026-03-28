import {
  assertEquals,
  assertMatch,
  assertNotMatch,
  assertStringIncludes,
} from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { renderComponent } from "lume/jsx-runtime";
import layoutStyles from "../styles/layout.css" with { type: "text" };

import Header from "./Header.tsx";
import { ariaCurrent, buildHeaderNavigation } from "./header-navigation.ts";

describe("header-navigation.ts", () => {
  describe("ariaCurrent()", () => {
    it("marks exact matches as current", () => {
      assertEquals(ariaCurrent("/posts/", "/posts/"), {
        "aria-current": "page",
      });
      assertEquals(ariaCurrent("/about/", "/about"), {
        "aria-current": "page",
      });
    });

    it("keeps home inactive on child routes", () => {
      assertEquals(ariaCurrent("/", "/posts/"), {});
      assertEquals(ariaCurrent("/fr/", "/fr/about/"), {});
    });

    it("marks child routes under non-home sections", () => {
      assertEquals(ariaCurrent("/posts/", "/posts/my-post/"), {
        "aria-current": "page",
      });
    });
  });

  describe("buildHeaderNavigation()", () => {
    it("marks writing current for tag taxonomy routes", () => {
      const navigationItems = buildHeaderNavigation({
        currentUrl: "/tags/design/",
        language: "en",
      });

      assertEquals(navigationItems.map((item) => item.isCurrent), [
        false,
        true,
        false,
      ]);
      assertEquals(navigationItems[1]?.href, "/posts/");
    });

    it("keeps localized home inactive on localized child routes", () => {
      const navigationItems = buildHeaderNavigation({
        currentUrl: "/fr/posts/instructions/",
        language: "fr",
      });

      assertEquals(navigationItems.map((item) => item.isCurrent), [
        false,
        true,
        false,
      ]);
      assertEquals(navigationItems[0]?.href, "/fr/");
      assertEquals(navigationItems[2]?.href, "/fr/about/");
    });
  });
});

describe("Header()", () => {
  it("keeps the shared shell on non-home routes", async () => {
    const html = await renderComponent(
      Header({ currentUrl: "/posts/", language: "en" }),
    );

    assertMatch(html, /<header[^>]*class="cds--header"/);
    assertStringIncludes(html, 'class="cds--header__wrapper"');
    assertStringIncludes(html, 'class="cds--header__left"');
    assertStringIncludes(html, 'class="cds--header__global"');
    assertStringIncludes(html, 'class="cds--header__nav"');
    assertStringIncludes(html, 'data-site-header-menu=""');
    assertStringIncludes(html, 'class="site-header-antd-menu-shell"');
    assertStringIncludes(
      html,
      'class="site-header-antd-menu ant-menu-overflow ant-menu ant-menu-root ant-menu-horizontal',
    );
    assertStringIncludes(html, 'class="cds--side-nav__navigation"');
  });

  it("keeps legacy navigation, menu, and icon controls off the home route", async () => {
    const html = await renderComponent(
      Header({ currentUrl: "/posts/", language: "en" }),
    );

    assertMatch(
      html,
      /<button[^>]*class="cds--header__action cds--header__menu-toggle"[^>]*aria-controls="site-side-nav"/,
    );
    assertStringIncludes(html, 'data-icon="three-bars"');
    assertStringIncludes(html, 'data-icon="x"');
    assertStringIncludes(html, 'data-icon="translation"');
    assertStringIncludes(html, 'data-icon="sun"');
    assertStringIncludes(html, 'data-icon="moon"');
    assertStringIncludes(html, 'data-icon="device-desktop"');
  });

  it("renders search, language, and theme affordances for the legacy header", async () => {
    const html = await renderComponent(
      Header({ currentUrl: "/posts/", language: "en" }),
    );

    assertStringIncludes(html, 'data-header-tooltip-trigger=""');
    assertStringIncludes(html, 'id="site-search-panel"');
    assertStringIncludes(html, 'data-search-status=""');
    assertStringIncludes(html, 'data-search-root=""');
    assertStringIncludes(html, 'id="site-language-panel"');
    assertStringIncludes(html, 'data-language-menu=""');
    assertStringIncludes(html, 'id="theme-toggle"');
    assertStringIncludes(
      html,
      'data-label-follow-system="Follow system theme"',
    );
  });

  it("keeps language labels invariant and honors alternates in the legacy menu", async () => {
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
      '<span class="cds--header__language-label">English</span>',
    );
    assertStringIncludes(
      html,
      '<span class="cds--header__language-label">Français</span>',
    );
    assertStringIncludes(
      html,
      'href="/about/" class="cds--header__language-option" data-language-option="en"',
    );
    assertStringIncludes(
      html,
      'href="/fr/about/" class="cds--header__language-option" data-language-option="fr"',
    );
    assertMatch(html, /<a[^>]*href="\/fr\/about\/"[^>]*aria-checked="true"/);
  });

  it("localizes the legacy header for French child routes", async () => {
    const html = await renderComponent(
      Header({
        currentUrl: "/fr/posts/instructions/",
        language: "fr",
      }),
    );

    assertStringIncludes(html, 'href="/fr/posts/"');
    assertStringIncludes(html, "Articles");
    assertStringIncludes(html, 'aria-label="Ouvrir le menu de navigation"');
    assertStringIncludes(html, 'aria-label="Recherche"');
    assertStringIncludes(
      html,
      'data-search-loading-label="Chargement des résultats de recherche."',
    );
    assertNotMatch(
      html,
      /<a[^>]*href="\/fr\/"[^>]*aria-current="page"/,
    );
    assertStringIncludes(html, "ant-menu-item-selected");
    assertStringIncludes(html, 'href="/fr/posts/" aria-current="page"');
  });

  it("switches to the editorial home variant on home routes", async () => {
    const html = await renderComponent(
      Header({ currentUrl: "/", language: "en" }),
    );

    assertMatch(
      html,
      /<header[^>]*class="cds--header site-header--editorial-home"/,
    );
    assertStringIncludes(
      html,
      'class="cds--header__nav editorial-home-header__nav"',
    );
    assertStringIncludes(html, 'data-site-header-menu=""');
    assertStringIncludes(html, 'class="site-header-antd-menu-shell"');
    assertStringIncludes(
      html,
      'class="cds--header__action btn-octicon editorial-home-header__action"',
    );
    assertStringIncludes(html, 'class="editorial-home-header__action-icon"');
    assertStringIncludes(html, 'data-icon="translation"');
    assertStringIncludes(html, "theme-icon theme-icon--sun");
    assertStringIncludes(html, "theme-icon theme-icon--moon");
    assertStringIncludes(html, "theme-icon theme-icon--system");
    assertStringIncludes(
      html,
      'class="cds--side-nav editorial-home-header__drawer"',
    );
  });

  it("still omits the older pre-shell native navigation fragments", async () => {
    const html = await renderComponent(
      Header({ currentUrl: "/", language: "en" }),
    );

    assertNotMatch(html, /class="site-navigation-toggle"/);
    assertNotMatch(html, /class="site-navigation"/);
    assertNotMatch(html, /class="site-language-select"/);
    assertNotMatch(html, /id="language-select"/);
    assertNotMatch(html, /<cds-header-global-action/);
  });
});

describe("Header CSS contracts", () => {
  it("uses shared focus tokens for inset shell controls", () => {
    assertStringIncludes(
      layoutStyles,
      ".cds--header__menu-toggle:focus-visible,",
    );
    assertStringIncludes(
      layoutStyles,
      "border-color: var(--ph-color-border-default);",
    );
  });

  it("keeps the desktop navigation and global actions visually separated", () => {
    assertStringIncludes(layoutStyles, "@media (min-width: 64rem) {");
    assertStringIncludes(layoutStyles, ".cds--header__global {");
    assertStringIncludes(
      layoutStyles,
      "border-inline-start: 1px solid var(--ph-color-border-muted);",
    );
  });

  it("styles the mobile side nav as an editorial sheet", () => {
    assertStringIncludes(layoutStyles, ".cds--side-nav__header");
    assertStringIncludes(layoutStyles, ".cds--side-nav__brand");
    assertStringIncludes(layoutStyles, ".cds--side-nav__lead");
    assertStringIncludes(layoutStyles, ".cds--side-nav__overlay");
    assertStringIncludes(
      layoutStyles,
      "box-shadow: var(--ph-shadow-floating);",
    );
  });
});

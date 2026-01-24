/**
 * Base Layout
 * Master layout with HTML structure, navigation, and footer
 */
export default async function (
  {
    lang,
    title,
    metas,
    extra_head,
    logo,
    menu_links,
    url,
    bodyClass,
    content,
    commit,
    date,
    search,
    comp,
  }: Lume.Data,
  { url: urlHelper, date: dateHelper }: Lume.Helpers,
) {
  const menuItems = search.pages("menu.visible=true", "menu.order");
  const searchModal = await comp.modal({
    id: "search-modal",
    title: "Search",
    content:
      '<div class="search-modal__content" role="search" aria-label="Search posts"></div>',
    size: "large",
    initialState: "closed",
    closeable: true,
    closeLabel: "Close search",
    headerExtra: `
          <span class="modal__shortcut" aria-hidden="true">
            <kbd>Esc</kbd> to close
          </span>`,
  });

  return `<!doctype html>

<html lang="${lang}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${
    title ? `${title} - ${metas?.site ?? ""}` : metas?.site ?? ""
  }</title>

    <meta name="supported-color-schemes" content="light dark">
    <meta name="theme-color" content="hsl(220, 20%, 100%)" media="(prefers-color-scheme: light)">
    <meta name="theme-color" content="hsl(220, 20%, 10%)" media="(prefers-color-scheme: dark)">

    <link rel="stylesheet" href="/styles.css">
    <link rel="alternate" href="/feed.xml" type="application/atom+xml" title="${
    metas?.site ?? ""
  }">
    <link rel="alternate" href="/feed.json" type="application/json" title="${
    metas?.site ?? ""
  }">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png">
    <link rel="canonical" href="${urlHelper(url, true)}">

    <!-- Pagefind search -->
    <link rel="stylesheet" href="/pagefind/pagefind-ui.css">
    <script src="/pagefind/pagefind-ui.js"></script>

    <script src="/js/main.js" type="module"></script>
    ${extra_head ? extra_head.join("\n") : ""}
  </head>
  <body>
    <!-- Skip to main content for keyboard navigation -->
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <nav class="navbar" role="navigation" aria-label="Main navigation">
      <a href="/" class="navbar-home">
        ${logo ? logo : `<strong>${metas?.site ?? ""}</strong>`}
      </a>

      <ul class="navbar-links">
      ${
    menuItems.map((entry) => `
        <li>
          <a href="${entry.url}"${
      entry.url === url ? ' aria-current="page"' : ""
    }>
            ${entry.menu.title || entry.title}
          </a>
        </li>
      `).join("")
  }
      ${
    menu_links.map((link: { href: string; target?: string; text: string }) => `
        <li>
          <a href="${link.href}"${
      link.target ? ` target="${link.target}"` : ""
    }>
            ${link.text}
          </a>
        </li>
      `).join("")
  }
      <li>
        <button
          id="theme-toggle"
          class="button theme-toggle"
          aria-label="Switch theme"
          aria-live="polite"
        >
          <span class="icon" aria-hidden="true">◐</span>
        </button>
      </li>
      </ul>
    </nav>

    <main id="main-content" class="${bodyClass || ""}" role="main">
      ${content}
    </main>

    ${
    commit
      ? `
    <footer class="site-footer" role="contentinfo">
      <p>
        &copy; ${dateHelper(date, "yyyy")} &middot;
        <a href="https://github.com/frenchvandal/normco.re/commit/${commit}" target="_blank" rel="noopener noreferrer">
          rev ${commit.substring(0, 8)}
        </a>
      </p>
    </footer>
    `
      : ""
  }

    <!-- Toast notifications container -->
    <div class="toast-container toast-container--top-right" id="toast-container"></div>

    <!-- Search modal (Cmd/Ctrl+K) -->
    ${searchModal}

    <!-- Current page: ${url} -->
  </body>
</html>
`;
}

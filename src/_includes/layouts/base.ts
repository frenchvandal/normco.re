/**
 * Base layout template for the site.
 *
 * Renders the complete HTML document structure including:
 * - Document head with meta tags, stylesheets, and scripts
 * - Skip link for keyboard accessibility
 * - Navigation bar with menu items and theme toggle
 * - Main content area
 * - Footer with commit information
 * - Toast notifications container
 * - Search modal (activated via Cmd/Ctrl+K)
 *
 * @param data - Lume page data containing title, metas, content, and other page variables.
 * @param helpers - Lume helper functions for URL generation and date formatting.
 * @returns The complete HTML document as a string.
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
    buildId,
    date,
    search,
    comp,
  }: Lume.Data,
  { url: urlHelper, date: dateHelper }: Lume.Helpers,
) {
  const menuItems = search.pages("menu.visible=true", "menu.order");
  const searchModal = await comp.Modal({
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

<html lang="${lang}" data-build-id="${buildId ?? ""}">
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

    <script src="/js/main.js" type="module"></script>
    ${extra_head ? extra_head.join("\n") : ""}
  </head>
  <body>
    <!-- Skip to main content for keyboard navigation -->
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <nav class="navbar" role="navigation" aria-label="Main navigation">
      <div class="navbar__inner">
        <a href="/" class="navbar-home">
          ${logo ? logo : `<strong>${metas?.site ?? ""}</strong>`}
        </a>

        <div class="navbar__menu">
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
    menu_links.map(
      (link: { href: string; target?: string; text: string }) => `
            <li>
              <a href="${link.href}"${
        link.target ? ` target="${link.target}"` : ""
      }>
                ${link.text}
              </a>
            </li>
          `,
    ).join("")
  }
          </ul>
          <button
            id="theme-toggle"
            class="button theme-toggle"
            aria-label="Switch theme"
            aria-live="polite"
          >
            <svg class="icon icon-sun" aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            <svg class="icon icon-moon" aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </button>
        </div>
      </div>
    </nav>

    <main id="main-content" class="${bodyClass || ""}" role="main">
      ${content}
    </main>

    ${
    commit
      ? `
    <footer class="site-footer" role="contentinfo">
      <p>
        &copy; ${dateHelper(date, "yyyy")}
        <span class="footer-separator" aria-hidden="true">&middot;</span>
        <a class="footer-commit" href="https://github.com/frenchvandal/normco.re/commit/${commit}" target="_blank" rel="noopener noreferrer">
          ${commit.substring(0, 8)}
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

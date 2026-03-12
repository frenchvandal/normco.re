// @ts-check
/**
 * Archive year navigation — highlights the active year anchor in the sidebar
 * based on the current URL hash and updates `aria-current` on hash changes.
 *
 * Loaded only on archive pages. Runs as a plain IIFE so it works without a
 * module bundler and can be served as a versioned cacheable static asset.
 */
(() => {
  const links = Array.from(
    globalThis.document.querySelectorAll(".archive-year-nav-link"),
  ).filter((candidate) =>
    candidate instanceof HTMLAnchorElement && candidate.hash.length > 1
  );

  if (links.length === 0) {
    return;
  }

  function syncCurrentLink() {
    const activeLink =
      links.find((link) => link.hash === globalThis.location.hash) ??
        links[0];

    for (const link of links) {
      if (link === activeLink) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    }
  }

  globalThis.addEventListener("hashchange", syncCurrentLink);
  syncCurrentLink();
})();

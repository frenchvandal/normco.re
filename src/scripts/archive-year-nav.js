// @ts-check
(() => {
  const links = Array.from(
    globalThis.document.querySelectorAll(
      ".archive-year-nav-link[href^='#archive-year-']",
    ),
  ).filter(
    /**
     * Restrict the list to anchor elements so hash access stays type-safe.
     * @param {Element} link
     * @returns {link is HTMLAnchorElement}
     */
    (link) => link instanceof HTMLAnchorElement,
  );

  if (links.length < 2) {
    return;
  }

  const syncCurrentLink = () => {
    const currentHash = globalThis.location.hash || links[0]?.hash || "";

    for (const link of links) {
      if (link.hash === currentHash) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    }
  };

  globalThis.addEventListener("hashchange", syncCurrentLink);
  syncCurrentLink();
})();

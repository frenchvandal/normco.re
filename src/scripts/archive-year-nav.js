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
  ).filter((candidate) => candidate instanceof HTMLAnchorElement);

  if (links.length === 0) {
    return;
  }

  /** @type {Array<{ link: HTMLAnchorElement; id: string }>} */
  const entries = [];

  for (const link of links) {
    if (!link.hash.startsWith("#") || link.hash.length <= 1) {
      continue;
    }

    const id = decodeURIComponent(link.hash.slice(1));

    if (id.length === 0) {
      continue;
    }

    entries.push({
      link,
      id,
    });
  }

  if (entries.length === 0) {
    return;
  }

  function syncCurrentLink() {
    const currentHash = globalThis.location.hash;
    const requestedId = currentHash.startsWith("#") && currentHash.length > 1
      ? decodeURIComponent(currentHash.slice(1))
      : "";
    const activeId = entries.some((entry) => entry.id === requestedId)
      ? requestedId
      : entries[0].id;

    for (const entry of entries) {
      entry.link.toggleAttribute("aria-current", entry.id === activeId);
    }
  }

  globalThis.addEventListener("hashchange", syncCurrentLink);
  syncCurrentLink();
})();

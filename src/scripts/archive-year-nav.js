// @ts-check

(() => {
  const links = Array.from(
    globalThis.document.querySelectorAll(".archive-year-nav-link"),
  ).filter((candidate) => candidate instanceof HTMLAnchorElement);

  if (links.length === 0) {
    return;
  }

  /** @type {Map<HTMLAnchorElement, string>} */
  const idByLink = new Map();

  for (const link of links) {
    const href = link.getAttribute("href");

    if (href === null || !href.startsWith("#")) {
      continue;
    }

    const id = href.slice(1);

    if (id.length === 0) {
      continue;
    }

    idByLink.set(link, id);
  }

  if (idByLink.size === 0) {
    return;
  }

  /** @param {string} activeId */
  function setCurrentLink(activeId) {
    for (const [link, id] of idByLink) {
      if (id === activeId) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    }
  }

  /** @returns {string | null} */
  function getActiveIdFromHash() {
    const rawHash = globalThis.location.hash;

    if (rawHash.startsWith("#") && rawHash.length > 1) {
      const hashId = decodeURIComponent(rawHash.slice(1));

      for (const id of idByLink.values()) {
        if (id === hashId) {
          return id;
        }
      }
    }

    const firstId = idByLink.values().next().value;
    return typeof firstId === "string" ? firstId : null;
  }

  function syncCurrentLink() {
    const activeId = getActiveIdFromHash();

    if (activeId === null) {
      return;
    }

    setCurrentLink(activeId);
  }

  globalThis.addEventListener("hashchange", syncCurrentLink);
  syncCurrentLink();
})();

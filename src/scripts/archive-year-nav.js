// @ts-check
(() => {
  const links = Array.from(
    globalThis.document.querySelectorAll(
      ".archive-year-nav-link[href^='#archive-year-']",
    ),
  );

  if (links.length === 0) {
    return;
  }

  function syncCurrentLink() {
    const currentHash = globalThis.location.hash || links[0].hash;

    for (const link of links) {
      if (link.hash === currentHash) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    }
  }

  globalThis.addEventListener("hashchange", syncCurrentLink);
  syncCurrentLink();
})();

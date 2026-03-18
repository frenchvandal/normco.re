(() => {
  const LINK_SELECTOR = "[data-archive-year-link]";
  const SECTION_SELECTOR = "[data-archive-year-section]";
  const CURRENT_VALUE = "location";

  /**
   * @param {HTMLAnchorElement} link
   * @returns {string}
   */
  function getTargetId(link) {
    const href = link.getAttribute("href") ?? "";
    return href.startsWith("#") ? href.slice(1) : "";
  }

  /**
   * @param {HTMLAnchorElement[]} links
   * @param {string} targetId
   */
  function setCurrent(links, targetId) {
    if (targetId.length === 0) {
      return;
    }

    const hasTarget = links.some((link) => getTargetId(link) === targetId);

    if (!hasTarget) {
      return;
    }

    for (const link of links) {
      if (getTargetId(link) === targetId) {
        link.setAttribute("aria-current", CURRENT_VALUE);
      } else {
        link.removeAttribute("aria-current");
      }
    }
  }

  function init() {
    const links = [...document.querySelectorAll(LINK_SELECTOR)].filter((node) =>
      node instanceof HTMLAnchorElement
    );
    const sections = [...document.querySelectorAll(SECTION_SELECTOR)].filter((
      node,
    ) => node instanceof HTMLElement);

    if (links.length === 0 || sections.length === 0) {
      return;
    }

    const defaultId = sections[0]?.id ?? "";
    const visibleSectionIds = new Set();

    const syncFromHash = () => {
      const hashId = globalThis.location.hash.replace(/^#/, "");

      if (hashId.length > 0) {
        setCurrent(links, hashId);
      } else if (defaultId.length > 0) {
        setCurrent(links, defaultId);
      }
    };

    for (const link of links) {
      link.addEventListener("click", () => {
        setCurrent(links, getTargetId(link));
      });
    }

    globalThis.addEventListener("hashchange", syncFromHash);
    syncFromHash();

    if (!("IntersectionObserver" in globalThis)) {
      return;
    }

    const updateFromVisibleSections = () => {
      for (const section of sections) {
        if (visibleSectionIds.has(section.id)) {
          setCurrent(links, section.id);
          return;
        }
      }

      syncFromHash();
    };

    const observer = new globalThis.IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!(entry.target instanceof HTMLElement)) {
          continue;
        }

        if (entry.isIntersecting) {
          visibleSectionIds.add(entry.target.id);
        } else {
          visibleSectionIds.delete(entry.target.id);
        }
      }

      updateFromVisibleSections();
    }, {
      rootMargin: "-96px 0px -55% 0px",
      threshold: [0, 0.2, 0.6],
    });

    for (const section of sections) {
      observer.observe(section);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();

// @ts-check
(() => {
  const supportsIntersectionObserver = "IntersectionObserver" in globalThis &&
    "isIntersecting" in globalThis.IntersectionObserverEntry.prototype;

  if (!supportsIntersectionObserver) {
    return;
  }

  const connection = globalThis.navigator.connection;
  const blockedEffectiveTypes = new Set(["slow-2g", "2g"]);

  if (connection?.saveData) {
    return;
  }

  if (
    typeof connection?.effectiveType === "string" &&
    blockedEffectiveTypes.has(connection.effectiveType)
  ) {
    return;
  }

  const PREFETCH_LIMIT = 6;
  const PREFETCH_TIMEOUT_MS = 2000;
  const HOVER_INTENT_DELAY_MS = 180;

  /** @type {Set<string>} */
  const prefetchedUrls = new Set();
  /** @type {WeakSet<HTMLAnchorElement>} */
  const hoverBoundLinks = new WeakSet();
  /** @type {Map<HTMLAnchorElement, number>} */
  const hoverTimers = new Map();

  const canUseDomPrefetch = (() => {
    const link = globalThis.document.createElement("link");
    return Boolean(link.relList?.supports?.("prefetch"));
  })();

  function hasPrefetchBudget() {
    return prefetchedUrls.size < PREFETCH_LIMIT;
  }

  /**
   * @param {HTMLAnchorElement} link
   * @returns {boolean}
   */
  function isPrefetchCandidate(link) {
    if (link.href.length === 0) {
      return false;
    }

    if (link.origin !== globalThis.location.origin) {
      return false;
    }

    if (
      link.hash.length > 0 && link.pathname === globalThis.location.pathname
    ) {
      return false;
    }

    if (link.target === "_blank" || link.download.length > 0) {
      return false;
    }

    return true;
  }

  /**
   * @param {string} url
   * @returns {Promise<void>}
   */
  function prefetchUrl(url) {
    if (prefetchedUrls.has(url) || !hasPrefetchBudget()) {
      return Promise.resolve();
    }

    prefetchedUrls.add(url);

    if (canUseDomPrefetch) {
      return new Promise((resolve) => {
        const prefetchLink = globalThis.document.createElement("link");
        prefetchLink.rel = "prefetch";
        prefetchLink.href = url;
        prefetchLink.as = "document";
        prefetchLink.onload = () => resolve();
        prefetchLink.onerror = () => resolve();
        globalThis.document.head.append(prefetchLink);
      });
    }

    return globalThis.fetch(url, {
      mode: "same-origin",
      credentials: "same-origin",
      headers: { accept: "text/html" },
    }).then(() => undefined, () => undefined);
  }

  /** @param {HTMLAnchorElement} link */
  function registerHoverIntent(link) {
    if (hoverBoundLinks.has(link)) {
      return;
    }

    hoverBoundLinks.add(link);

    const onMouseEnter = () => {
      if (!isPrefetchCandidate(link) || !hasPrefetchBudget()) {
        return;
      }

      const timer = globalThis.setTimeout(() => {
        hoverTimers.delete(link);
        void prefetchUrl(link.href);
      }, HOVER_INTENT_DELAY_MS);

      hoverTimers.set(link, timer);
    };

    const onMouseLeave = () => {
      const timer = hoverTimers.get(link);

      if (timer !== undefined) {
        globalThis.clearTimeout(timer);
        hoverTimers.delete(link);
      }
    };

    link.addEventListener("mouseenter", onMouseEnter);
    link.addEventListener("mouseleave", onMouseLeave);
  }

  const observer = new globalThis.IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) {
        continue;
      }

      const link = entry.target;

      if (!(link instanceof HTMLAnchorElement)) {
        continue;
      }

      observer.unobserve(link);

      if (!isPrefetchCandidate(link) || !hasPrefetchBudget()) {
        continue;
      }

      void prefetchUrl(link.href);
      registerHoverIntent(link);
    }
  }, { threshold: 0.25 });

  function observeLinksInViewport() {
    const links = globalThis.document.querySelectorAll("a[href]");

    for (const node of links) {
      if (!(node instanceof HTMLAnchorElement) || !isPrefetchCandidate(node)) {
        continue;
      }

      observer.observe(node);
      registerHoverIntent(node);
    }
  }

  const idleCallback = globalThis.requestIdleCallback;

  if (typeof idleCallback === "function") {
    idleCallback(() => {
      observeLinksInViewport();
    }, { timeout: PREFETCH_TIMEOUT_MS });
    return;
  }

  globalThis.setTimeout(observeLinksInViewport, 1);
})();

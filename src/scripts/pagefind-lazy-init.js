// @ts-check
(() => {
  const SEARCH_DISCLOSURE_SELECTOR = ".site-search";
  const SEARCH_CONTAINER_SELECTOR = "#search";
  const PAGEFIND_SCRIPT_URL = "/pagefind/pagefind-ui.js";
  const PAGEFIND_STYLE_URL = "/pagefind/pagefind-ui.css";

  /** @type {Promise<void> | undefined} */
  let pagefindInitPromise;

  const searchDisclosure = globalThis.document.querySelector(
    SEARCH_DISCLOSURE_SELECTOR,
  );

  if (!(searchDisclosure instanceof HTMLDetailsElement)) {
    return;
  }

  searchDisclosure.addEventListener("toggle", () => {
    if (!searchDisclosure.open) {
      return;
    }

    if (pagefindInitPromise !== undefined) {
      return;
    }

    pagefindInitPromise = initializePagefind();
  });

  /**
   * Loads Pagefind assets and mounts the UI once per page view.
   * @returns {Promise<void>}
   */
  async function initializePagefind() {
    const container = globalThis.document.querySelector(
      SEARCH_CONTAINER_SELECTOR,
    );

    if (!(container instanceof HTMLElement)) {
      return;
    }

    if (
      !globalThis.document.querySelector(`link[href="${PAGEFIND_STYLE_URL}"]`)
    ) {
      const stylesheet = globalThis.document.createElement("link");
      stylesheet.rel = "stylesheet";
      stylesheet.href = PAGEFIND_STYLE_URL;
      globalThis.document.head.append(stylesheet);
    }

    await loadPagefindScript();

    const pagefindUi = globalThis["PagefindUI"];

    if (typeof pagefindUi !== "function") {
      return;
    }

    if (container.dataset.pagefindReady === "true") {
      return;
    }

    new pagefindUi({
      element: SEARCH_CONTAINER_SELECTOR,
      showImages: false,
      showSubResults: false,
      resetStyles: false,
    });

    container.dataset.pagefindReady = "true";
  }

  /**
   * Injects the Pagefind UI runtime exactly once.
   * @returns {Promise<void>}
   */
  async function loadPagefindScript() {
    if (typeof globalThis["PagefindUI"] === "function") {
      return;
    }

    const existingScript = globalThis.document.querySelector(
      `script[src="${PAGEFIND_SCRIPT_URL}"]`,
    );

    if (existingScript instanceof HTMLScriptElement) {
      if (existingScript.dataset.loaded === "true") {
        return;
      }

      await waitForScriptLoad(existingScript);
      return;
    }

    const script = globalThis.document.createElement("script");
    script.src = PAGEFIND_SCRIPT_URL;
    script.defer = true;
    globalThis.document.body.append(script);

    await waitForScriptLoad(script);
    script.dataset.loaded = "true";
  }

  /**
   * Resolves once the script is loaded or rejects on loading error.
   * @param {HTMLScriptElement} script
   * @returns {Promise<void>}
   */
  function waitForScriptLoad(script) {
    return new Promise((resolve, reject) => {
      const handleLoad = () => {
        cleanup();
        resolve();
      };

      /** @param {Event} event */
      const handleError = (event) => {
        cleanup();
        reject(event);
      };

      const cleanup = () => {
        script.removeEventListener("load", handleLoad);
        script.removeEventListener("error", handleError);
      };

      script.addEventListener("load", handleLoad, { once: true });
      script.addEventListener("error", handleError, { once: true });
    });
  }
})();

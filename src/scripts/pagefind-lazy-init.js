// @ts-check
(() => {
  const SEARCH_DISCLOSURE_SELECTOR = ".site-search";
  const SEARCH_CONTAINER_SELECTOR = ".site-search-root";
  const PAGEFIND_SCRIPT_URL = "/pagefind/pagefind-ui.js";
  const PAGEFIND_STYLE_URL = "/pagefind/pagefind-ui.css";

  const searchDisclosures = Array.from(
    globalThis.document.querySelectorAll(SEARCH_DISCLOSURE_SELECTOR),
  ).filter((candidate) => candidate instanceof HTMLDetailsElement);

  if (searchDisclosures.length === 0) {
    return;
  }

  /** @type {Promise<void> | undefined} */
  let pagefindRuntimePromise;
  /** @type {WeakMap<HTMLElement, Promise<void>>} */
  const initPromiseByContainer = new WeakMap();
  let generatedContainerId = 0;

  for (const searchDisclosure of searchDisclosures) {
    searchDisclosure.addEventListener("toggle", () => {
      if (!searchDisclosure.open) {
        return;
      }

      const container = searchDisclosure.querySelector(
        SEARCH_CONTAINER_SELECTOR,
      );

      if (!(container instanceof HTMLElement)) {
        return;
      }

      if (container.dataset.pagefindReady === "true") {
        return;
      }

      if (initPromiseByContainer.has(container)) {
        return;
      }

      const initPromise = initializePagefind(container);
      initPromiseByContainer.set(container, initPromise);

      void initPromise.catch(() => {
        initPromiseByContainer.delete(container);
      });
    });
  }

  /**
   * Loads Pagefind assets and mounts the UI once per container.
   * @param {HTMLElement} container
   * @returns {Promise<void>}
   */
  async function initializePagefind(container) {
    ensurePagefindStylesheet();
    await loadPagefindScript();
    await yieldToMain();

    const pagefindUi = globalThis["PagefindUI"];
    if (typeof pagefindUi !== "function") {
      return;
    }

    if (container.dataset.pagefindReady === "true") {
      return;
    }

    const elementSelector = ensureElementSelector(container);
    new pagefindUi({
      element: elementSelector,
      showImages: false,
      showSubResults: false,
      resetStyles: false,
    });

    container.dataset.pagefindReady = "true";
  }

  /**
   * Ensures the Pagefind stylesheet is present only once.
   * @returns {void}
   */
  function ensurePagefindStylesheet() {
    if (
      globalThis.document.querySelector(`link[href="${PAGEFIND_STYLE_URL}"]`)
    ) {
      return;
    }

    const stylesheet = globalThis.document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = PAGEFIND_STYLE_URL;
    globalThis.document.head.append(stylesheet);
  }

  /**
   * Returns a selector for the target container and guarantees a stable `id`.
   * @param {HTMLElement} container
   * @returns {string}
   */
  function ensureElementSelector(container) {
    if (container.id.length === 0) {
      generatedContainerId += 1;
      container.id = `site-search-root-${generatedContainerId}`;
    }

    return `#${container.id}`;
  }

  /**
   * Injects the Pagefind UI runtime exactly once.
   * @returns {Promise<void>}
   */
  async function loadPagefindScript() {
    if (typeof globalThis["PagefindUI"] === "function") {
      return;
    }

    if (pagefindRuntimePromise !== undefined) {
      await pagefindRuntimePromise;
      return;
    }

    const existingScript = globalThis.document.querySelector(
      `script[src="${PAGEFIND_SCRIPT_URL}"]`,
    );

    if (existingScript instanceof HTMLScriptElement) {
      if (existingScript.dataset.loaded === "true") {
        return;
      }

      pagefindRuntimePromise = waitForScriptLoad(existingScript)
        .then(() => {
          existingScript.dataset.loaded = "true";
        })
        .finally(() => {
          pagefindRuntimePromise = undefined;
        });

      await pagefindRuntimePromise;
      return;
    }

    const script = globalThis.document.createElement("script");
    script.src = PAGEFIND_SCRIPT_URL;
    script.async = true;
    globalThis.document.body.append(script);

    pagefindRuntimePromise = waitForScriptLoad(script)
      .then(() => {
        script.dataset.loaded = "true";
      })
      .finally(() => {
        pagefindRuntimePromise = undefined;
      });

    await pagefindRuntimePromise;
  }

  /**
   * Yields to the browser so input/rendering can proceed before heavy init.
   * @returns {Promise<void>}
   */
  async function yieldToMain() {
    /** @type {{ yield?: () => Promise<void> } | undefined} */
    const schedulerApi =
      /** @type {{ yield?: () => Promise<void> } | undefined} */ (
        /** @type {unknown} */ (globalThis["scheduler"])
      );

    if (typeof schedulerApi?.yield === "function") {
      await schedulerApi.yield();
      return;
    }

    await new Promise((resolve) => {
      globalThis.setTimeout(resolve, 0);
    });
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

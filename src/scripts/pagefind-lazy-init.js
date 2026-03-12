// @ts-check
(() => {
  const SEARCH_PANEL_SELECTOR = "[data-search-panel]";
  const SEARCH_CONTAINER_SELECTOR = "[data-search-root]";
  const PAGEFIND_SCRIPT_URL = "/pagefind/pagefind-ui.js";
  const PAGEFIND_STYLE_URL = "/pagefind/pagefind-ui.css";
  /**
   * @typedef {{
   *   readonly element: string;
   *   readonly showImages: boolean;
   *   readonly showSubResults: boolean;
   *   readonly resetStyles: boolean;
   * }} PagefindUiOptions
   */
  /** @typedef {new (options: PagefindUiOptions) => unknown} PagefindUiConstructor */

  /**
   * Returns the Pagefind UI constructor when the runtime has loaded.
   * @returns {PagefindUiConstructor | null}
   */
  function getPagefindUiConstructor() {
    const runtime =
      /** @type {{ readonly PagefindUI?: unknown }} */ (globalThis);
    const pagefindUi = runtime.PagefindUI;

    if (typeof pagefindUi !== "function") {
      return null;
    }

    return /** @type {PagefindUiConstructor} */ (pagefindUi);
  }

  /**
   * Returns the optional Scheduler API object when available.
   * @returns {{ yield?: () => Promise<void> } | undefined}
   */
  function getSchedulerApi() {
    const runtime =
      /** @type {{ readonly scheduler?: unknown }} */ (globalThis);
    const scheduler = runtime.scheduler;

    if (typeof scheduler !== "object" || scheduler === null) {
      return undefined;
    }

    return /** @type {{ yield?: () => Promise<void> }} */ (scheduler);
  }

  const searchPanels = Array.from(
    globalThis.document.querySelectorAll(SEARCH_PANEL_SELECTOR),
  ).filter((candidate) => candidate instanceof HTMLElement);

  if (searchPanels.length === 0) {
    return;
  }

  /** @type {Promise<void> | undefined} */
  let pagefindRuntimePromise;
  /** @type {WeakMap<HTMLElement, Promise<void>>} */
  const initPromiseByContainer = new WeakMap();
  let generatedContainerId = 0;

  const panelObserver = new MutationObserver((mutationList) => {
    for (const mutation of mutationList) {
      if (
        mutation.type !== "attributes" ||
        mutation.attributeName !== "expanded" ||
        !(mutation.target instanceof HTMLElement) ||
        !mutation.target.hasAttribute("expanded")
      ) {
        continue;
      }

      handleSearchPanelOpened(mutation.target);
    }
  });

  for (const searchPanel of searchPanels) {
    panelObserver.observe(searchPanel, {
      attributes: true,
      attributeFilter: ["expanded"],
    });

    if (searchPanel.hasAttribute("expanded")) {
      handleSearchPanelOpened(searchPanel);
    }
  }

  /**
   * Handles a user opening a search panel.
   * @param {HTMLElement} searchPanel
   * @returns {void}
   */
  function handleSearchPanelOpened(searchPanel) {
    const container = searchPanel.querySelector(SEARCH_CONTAINER_SELECTOR);

    if (!(container instanceof HTMLElement)) {
      return;
    }

    focusSearchInput(container);

    void ensurePagefindInitialized(container).then(() => {
      focusSearchInput(container);
    });
  }

  /**
   * Ensures Pagefind initialization runs once per container.
   * @param {HTMLElement} container
   * @returns {Promise<void>}
   */
  function ensurePagefindInitialized(container) {
    if (container.dataset.pagefindReady === "true") {
      return Promise.resolve();
    }

    const existingInitPromise = initPromiseByContainer.get(container);

    if (existingInitPromise !== undefined) {
      return existingInitPromise;
    }

    const initPromise = initializePagefind(container).catch((error) => {
      initPromiseByContainer.delete(container);
      throw error;
    });

    initPromiseByContainer.set(container, initPromise);
    return initPromise;
  }

  /**
   * Focuses the Pagefind search input when available.
   * @param {HTMLElement} searchContainer
   * @returns {void}
   */
  function focusSearchInput(searchContainer) {
    const searchInput = searchContainer.querySelector(
      ".pagefind-ui__search-input",
    );

    if (!(searchInput instanceof HTMLInputElement) || searchInput.disabled) {
      return;
    }

    searchInput.focus({ preventScroll: true });
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

    const pagefindUi = getPagefindUiConstructor();
    if (pagefindUi === null) {
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
    if (getPagefindUiConstructor() !== null) {
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
    const schedulerApi = getSchedulerApi();

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

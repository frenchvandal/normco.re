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
   *   readonly translations?: Record<string, string>;
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

  /**
   * @param {HTMLElement} container
   * @returns {{
   *   readonly unavailable: string;
   *   readonly offline: string;
   *   readonly retry: string;
   *   readonly loading: string;
   *   readonly noResults: string;
   *   readonly oneResult: string;
   *   readonly manyResults: string;
   * }}
   */
  function getSearchMessages(container) {
    return {
      loading: container.dataset.searchLoadingLabel ??
        "Loading search results.",
      noResults: container.dataset.searchNoResultsLabel ?? "No results found.",
      oneResult: container.dataset.searchOneResultLabel ?? "[COUNT] result",
      manyResults: container.dataset.searchManyResultsLabel ??
        "[COUNT] results",
      unavailable: container.dataset.searchUnavailableLabel ??
        "Search is temporarily unavailable.",
      offline: container.dataset.searchOfflineLabel ??
        "Search is unavailable while offline.",
      retry: container.dataset.searchRetryLabel ?? "Retry",
    };
  }

  /**
   * @param {HTMLElement} container
   * @returns {HTMLElement | null}
   */
  function getSearchStatusElement(container) {
    const searchPanel = container.closest(SEARCH_PANEL_SELECTOR);

    if (!(searchPanel instanceof HTMLElement)) {
      return null;
    }

    const status = searchPanel.querySelector("[data-search-status]");
    return status instanceof HTMLElement ? status : null;
  }

  /**
   * @param {HTMLElement} container
   * @param {string} message
   * @param {"idle" | "loading" | "results" | "error"} [state]
   * @returns {void}
   */
  function setSearchStatus(container, message, state = "idle") {
    const status = getSearchStatusElement(container);

    if (!(status instanceof HTMLElement)) {
      return;
    }

    const text = message.trim();
    status.textContent = text;
    status.dataset.searchStatusState = state;

    if (text.length === 0) {
      status.setAttribute("hidden", "");
      return;
    }

    status.removeAttribute("hidden");
  }

  /**
   * @param {HTMLElement} container
   * @returns {void}
   */
  function clearSearchStatus(container) {
    setSearchStatus(container, "");
  }

  /**
   * @param {HTMLElement} container
   * @returns {Record<string, string>}
   */
  function getPagefindTranslations(container) {
    const { loading, noResults, oneResult, manyResults } = getSearchMessages(
      container,
    );

    return {
      searching: loading,
      zero_results: noResults,
      one_result: oneResult,
      many_results: manyResults,
    };
  }

  /**
   * @param {HTMLElement} container
   * @returns {void}
   */
  function clearSearchFallback(container) {
    if (container.querySelector("[data-pagefind-fallback]") !== null) {
      container.replaceChildren();
    }
  }

  /**
   * @param {HTMLElement} container
   * @returns {void}
   */
  function renderSearchFallback(container) {
    const { unavailable, offline, retry } = getSearchMessages(container);
    const status = getSearchStatusElement(container);
    const fallback = globalThis.document.createElement("div");
    fallback.className = "pagefind-ui__drawer";
    fallback.dataset.pagefindFallback = "";

    const message = globalThis.navigator.onLine === false
      ? offline
      : unavailable;
    setSearchStatus(container, message, "error");

    const retryButton = globalThis.document.createElement("button");
    retryButton.type = "button";
    retryButton.className = "pagefind-ui__button";
    retryButton.textContent = retry;
    if (status?.id) {
      retryButton.setAttribute("aria-describedby", status.id);
    }

    retryButton.addEventListener("click", () => {
      clearSearchFallback(container);
      setSearchStatus(
        container,
        getSearchMessages(container).loading,
        "loading",
      );
      void ensurePagefindInitialized(container)
        .then(() => {
          focusSearchInput(container);
        })
        .catch(() => {
          renderSearchFallback(container);
        });
    });

    fallback.append(retryButton);
    container.replaceChildren(fallback);
    retryButton.focus({ preventScroll: true });
  }

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

    if (container.dataset.pagefindReady !== "true") {
      setSearchStatus(
        container,
        getSearchMessages(container).loading,
        "loading",
      );
    }

    focusSearchInput(container);

    void ensurePagefindInitialized(container)
      .then(() => {
        focusSearchInput(container);
      })
      .catch(() => {
        renderSearchFallback(container);
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
    clearSearchFallback(container);
    setSearchStatus(container, getSearchMessages(container).loading, "loading");
    ensurePagefindStylesheet();
    await loadPagefindScript();
    await yieldToMain();

    const pagefindUi = getPagefindUiConstructor();
    if (pagefindUi === null) {
      throw new Error("Pagefind UI constructor was not available.");
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
      translations: getPagefindTranslations(container),
    });

    container.dataset.pagefindReady = "true";
    bindSearchStatus(container);
  }

  /**
   * Keeps our adjacent status region in sync with Pagefind's internal messages.
   * @param {HTMLElement} container
   * @returns {void}
   */
  function bindSearchStatus(container) {
    if (container.dataset.searchStatusBound === "true") {
      syncSearchStatus(container);
      return;
    }

    const searchInput = container.querySelector(".pagefind-ui__search-input");

    if (!(searchInput instanceof HTMLInputElement)) {
      return;
    }

    container.dataset.searchStatusBound = "true";
    searchInput.addEventListener("input", () => {
      if (searchInput.value.trim().length === 0) {
        clearSearchStatus(container);
        return;
      }

      setSearchStatus(
        container,
        getSearchMessages(container).loading,
        "loading",
      );
    });

    const messageObserver = new MutationObserver(() => {
      syncSearchStatus(container);
    });

    messageObserver.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    syncSearchStatus(container);
  }

  /**
   * Mirrors Pagefind's visible message into the adjacent status region.
   * @param {HTMLElement} container
   * @returns {void}
   */
  function syncSearchStatus(container) {
    const message = container.querySelector(".pagefind-ui__message");
    const searchInput = container.querySelector(".pagefind-ui__search-input");

    if (!(searchInput instanceof HTMLInputElement)) {
      clearSearchStatus(container);
      return;
    }

    if (searchInput.value.trim().length === 0) {
      clearSearchStatus(container);
      return;
    }

    if (!(message instanceof HTMLElement)) {
      setSearchStatus(
        container,
        getSearchMessages(container).loading,
        "loading",
      );
      return;
    }

    const text = message.textContent?.trim() ?? "";

    if (text.length === 0) {
      setSearchStatus(
        container,
        getSearchMessages(container).loading,
        "loading",
      );
      return;
    }

    const { loading } = getSearchMessages(container);
    const state = text === loading ? "loading" : "results";
    setSearchStatus(container, text, state);
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
      if (existingScript.dataset.loadState === "error") {
        existingScript.remove();
      } else {
        if (existingScript.dataset.loaded === "true") {
          return;
        }

        pagefindRuntimePromise = waitForScriptLoad(existingScript)
          .then(() => {
            existingScript.dataset.loaded = "true";
            existingScript.dataset.loadState = "loaded";
          })
          .catch((error) => {
            existingScript.dataset.loadState = "error";
            existingScript.remove();
            throw error;
          })
          .finally(() => {
            pagefindRuntimePromise = undefined;
          });

        await pagefindRuntimePromise;
        return;
      }
    }

    const script = globalThis.document.createElement("script");
    script.src = PAGEFIND_SCRIPT_URL;
    script.async = true;
    script.dataset.loadState = "pending";
    globalThis.document.body.append(script);

    pagefindRuntimePromise = waitForScriptLoad(script)
      .then(() => {
        script.dataset.loaded = "true";
        script.dataset.loadState = "loaded";
      })
      .catch((error) => {
        script.dataset.loadState = "error";
        script.remove();
        throw error;
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

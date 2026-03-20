// @ts-check
(() => {
  const SEARCH_PANEL_SELECTOR = "[data-search-panel]";
  const SEARCH_CONTAINER_SELECTOR = "[data-search-root]";
  const PAGEFIND_SCRIPT_URL = "/pagefind/pagefind-ui.js";
  const PAGEFIND_STYLE_URL = "/pagefind/pagefind-ui.css";
  /**
   * @typedef {"idle" | "loading" | "results" | "error"} SearchStatusState
   */
  /**
   * @typedef {"idle" | "loading" | "ready" | "error"} PagefindState
   */
  /** @type {{ readonly IDLE: SearchStatusState; readonly LOADING: SearchStatusState; readonly RESULTS: SearchStatusState; readonly ERROR: SearchStatusState }} */
  const SEARCH_STATUS_STATE = {
    IDLE: "idle",
    LOADING: "loading",
    RESULTS: "results",
    ERROR: "error",
  };
  /** @type {{ readonly IDLE: PagefindState; readonly LOADING: PagefindState; readonly READY: PagefindState; readonly ERROR: PagefindState }} */
  const PAGEFIND_STATE = {
    IDLE: "idle",
    LOADING: "loading",
    READY: "ready",
    ERROR: "error",
  };
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
   * Returns whether the active interaction modality is keyboard-driven.
   * disclosure-controls.js keeps this attribute in sync on <html>.
   * @returns {boolean}
   */
  function shouldMoveFocusForOpen() {
    return globalThis.document.documentElement.dataset.interactionModality ===
      "keyboard";
  }

  /**
   * @param {HTMLElement} container
   * @returns {{
   *   readonly loadingTitle: string;
   *   readonly unavailable: string;
   *   readonly unavailableTitle: string;
   *   readonly offline: string;
   *   readonly offlineTitle: string;
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
      loadingTitle: container.dataset.searchLoadingTitle ?? "Preparing search",
      noResults: container.dataset.searchNoResultsLabel ?? "No results found.",
      oneResult: container.dataset.searchOneResultLabel ?? "[COUNT] result",
      manyResults: container.dataset.searchManyResultsLabel ??
        "[COUNT] results",
      unavailable: container.dataset.searchUnavailableLabel ??
        "Search is temporarily unavailable.",
      unavailableTitle: container.dataset.searchUnavailableTitle ??
        "Search unavailable",
      offline: container.dataset.searchOfflineLabel ??
        "Search is unavailable while offline.",
      offlineTitle: container.dataset.searchOfflineTitle ?? "Offline",
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
   * @returns {HTMLElement | null}
   */
  function getSearchStatusTextElement(container) {
    const status = getSearchStatusElement(container);

    if (!(status instanceof HTMLElement)) {
      return null;
    }

    const text = status.querySelector("[data-search-status-text]");
    return text instanceof HTMLElement ? text : null;
  }

  /**
   * @param {HTMLElement} container
   * @returns {HTMLElement | null}
   */
  function getSearchLoadingElement(container) {
    const status = getSearchStatusElement(container);

    if (!(status instanceof HTMLElement)) {
      return null;
    }

    const loading = status.querySelector("[data-search-loading]");
    return loading instanceof HTMLElement ? loading : null;
  }

  /**
   * @param {HTMLElement} container
   * @returns {HTMLElement | null}
   */
  function getSearchLoadingTextElement(container) {
    const loading = getSearchLoadingElement(container);

    if (!(loading instanceof HTMLElement)) {
      return null;
    }

    const text = loading.querySelector("[data-search-loading-text]");
    return text instanceof HTMLElement ? text : null;
  }

  /**
   * @param {HTMLElement} container
   * @returns {HTMLElement | null}
   */
  function getSearchNotificationElement(container) {
    const status = getSearchStatusElement(container);

    if (!(status instanceof HTMLElement)) {
      return null;
    }

    const notification = status.querySelector("[data-search-notification]");
    return notification instanceof HTMLElement ? notification : null;
  }

  /**
   * @param {HTMLElement} container
   * @returns {HTMLElement | null}
   */
  function getSearchNotificationTitleElement(container) {
    const notification = getSearchNotificationElement(container);

    if (!(notification instanceof HTMLElement)) {
      return null;
    }

    const title = notification.querySelector(
      "[data-search-notification-title]",
    );
    return title instanceof HTMLElement ? title : null;
  }

  /**
   * @param {HTMLElement} container
   * @returns {HTMLElement | null}
   */
  function getSearchNotificationSubtitleElement(container) {
    const notification = getSearchNotificationElement(container);

    if (!(notification instanceof HTMLElement)) {
      return null;
    }

    const subtitle = notification.querySelector(
      "[data-search-notification-subtitle]",
    );
    return subtitle instanceof HTMLElement ? subtitle : null;
  }

  /**
   * @param {HTMLElement} container
   * @param {boolean} isBusy
   * @returns {void}
   */
  function setSearchBusyState(container, isBusy) {
    const busy = isBusy ? "true" : "false";
    container.setAttribute("aria-busy", busy);
    container.dataset.searchBusy = busy;

    const searchPanel = container.closest(SEARCH_PANEL_SELECTOR);

    if (searchPanel instanceof HTMLElement) {
      searchPanel.setAttribute("aria-busy", busy);
    }
  }

  /**
   * Resets the search status region without changing the current busy state.
   * @param {HTMLElement} container
   * @returns {HTMLElement | null}
   */
  function resetSearchStatusRegion(container) {
    const status = getSearchStatusElement(container);
    const loading = getSearchLoadingElement(container);
    const loadingText = getSearchLoadingTextElement(container);
    const statusText = getSearchStatusTextElement(container);
    const notification = getSearchNotificationElement(container);
    const notificationTitle = getSearchNotificationTitleElement(container);
    const notificationSubtitle = getSearchNotificationSubtitleElement(
      container,
    );

    if (!(status instanceof HTMLElement)) {
      return null;
    }

    status.dataset.searchStatusState = SEARCH_STATUS_STATE.IDLE;

    if (loading instanceof HTMLElement) {
      loading.hidden = true;
    }

    if (loadingText instanceof HTMLElement) {
      loadingText.textContent = getSearchMessages(container).loading;
    }

    if (statusText instanceof HTMLElement) {
      statusText.hidden = true;
      statusText.textContent = "";
    }

    if (notification instanceof HTMLElement) {
      notification.hidden = true;
      notification.dataset.searchNotificationTone = "info";
      notification.classList.add("cds--inline-notification--info");
      notification.classList.remove("cds--inline-notification--warning");
    }

    if (notificationTitle instanceof HTMLElement) {
      notificationTitle.textContent = "";
    }

    if (notificationSubtitle instanceof HTMLElement) {
      notificationSubtitle.textContent = "";
    }

    status.setAttribute("hidden", "");
    return status;
  }

  /**
   * @param {HTMLElement} container
   * @param {string} message
   * @param {SearchStatusState} [state]
   * @returns {void}
   */
  function setSearchStatus(
    container,
    message,
    state = SEARCH_STATUS_STATE.IDLE,
  ) {
    const status = resetSearchStatusRegion(container);

    if (!(status instanceof HTMLElement)) {
      return;
    }

    const text = message.trim();
    status.dataset.searchStatusState = state;
    setSearchBusyState(
      container,
      text.length > 0 && state === SEARCH_STATUS_STATE.LOADING,
    );

    if (text.length === 0) {
      return;
    }

    const loading = getSearchLoadingElement(container);
    const loadingText = getSearchLoadingTextElement(container);
    const statusText = getSearchStatusTextElement(container);
    const notification = getSearchNotificationElement(container);
    const notificationTitle = getSearchNotificationTitleElement(container);
    const notificationSubtitle = getSearchNotificationSubtitleElement(
      container,
    );

    if (state === SEARCH_STATUS_STATE.LOADING) {
      if (loadingText instanceof HTMLElement) {
        loadingText.textContent = text;
      }

      if (loading instanceof HTMLElement) {
        loading.hidden = false;
      }
    } else if (state === SEARCH_STATUS_STATE.ERROR) {
      const {
        offline,
        offlineTitle,
        unavailableTitle,
      } = getSearchMessages(container);
      const tone = globalThis.navigator.onLine === false || text === offline
        ? "warning"
        : "info";

      if (notification instanceof HTMLElement) {
        notification.hidden = false;
        notification.dataset.searchNotificationTone = tone;
        notification.classList.toggle(
          "cds--inline-notification--info",
          tone === "info",
        );
        notification.classList.toggle(
          "cds--inline-notification--warning",
          tone === "warning",
        );
      }

      if (notificationTitle instanceof HTMLElement) {
        notificationTitle.textContent = tone === "warning"
          ? offlineTitle
          : unavailableTitle;
      }

      if (notificationSubtitle instanceof HTMLElement) {
        notificationSubtitle.textContent = text;
      }
    } else if (statusText instanceof HTMLElement) {
      statusText.hidden = false;
      statusText.textContent = text;
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
   * @returns {PagefindState}
   */
  function getPagefindState(container) {
    return /** @type {PagefindState} */ (
      container.dataset.pagefindState ?? PAGEFIND_STATE.IDLE
    );
  }

  /**
   * @param {HTMLElement} container
   * @param {PagefindState} state
   * @returns {void}
   */
  function setPagefindState(container, state) {
    container.dataset.pagefindState = state;
  }

  /**
   * @param {HTMLElement} container
   * @returns {boolean}
   */
  function isPagefindReady(container) {
    return getPagefindState(container) === PAGEFIND_STATE.READY;
  }

  /**
   * @param {HTMLElement} container
   * @returns {void}
   */
  function showPagefindPreparing(container) {
    setPagefindState(container, PAGEFIND_STATE.LOADING);
    ensureSearchSkeleton(container);
    resetSearchStatusRegion(container);
    setSearchBusyState(container, true);
  }

  /**
   * @param {HTMLElement} container
   * @param {string} message
   * @returns {void}
   */
  function showPagefindError(container, message) {
    setPagefindState(container, PAGEFIND_STATE.ERROR);
    setSearchStatus(container, message, SEARCH_STATUS_STATE.ERROR);
  }

  /**
   * @param {HTMLElement} container
   * @returns {void}
   */
  function markPagefindReady(container) {
    setPagefindState(container, PAGEFIND_STATE.READY);
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
  function ensureSearchSkeleton(container) {
    if (
      container.querySelector("[data-search-skeleton]") !== null ||
      container.querySelector(".pagefind-ui") !== null
    ) {
      return;
    }

    const skeleton = globalThis.document.createElement("div");
    skeleton.className = "site-search-skeleton";
    skeleton.dataset.searchSkeleton = "";
    skeleton.setAttribute("aria-hidden", "true");

    for (let index = 0; index < 3; index += 1) {
      const line = globalThis.document.createElement("span");
      line.className = "cds--skeleton__text site-search-skeleton-line";
      skeleton.append(line);
    }

    container.replaceChildren(skeleton);
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
    const shouldMoveFocus = shouldMoveFocusForOpen();
    const fallback = globalThis.document.createElement("div");
    fallback.className = "pagefind-ui__drawer";
    fallback.dataset.pagefindFallback = "";

    const message = globalThis.navigator.onLine === false
      ? offline
      : unavailable;
    showPagefindError(container, message);

    const retryButton = globalThis.document.createElement("button");
    retryButton.type = "button";
    retryButton.className = "pagefind-ui__button";
    retryButton.textContent = retry;
    if (status?.id) {
      retryButton.setAttribute("aria-describedby", status.id);
    }

    retryButton.addEventListener("click", () => {
      const shouldMoveFocusAfterRetry = shouldMoveFocusForOpen();
      clearSearchFallback(container);
      void startSearchInitialization(container, shouldMoveFocusAfterRetry);
    });

    fallback.append(retryButton);
    container.replaceChildren(fallback);
    if (shouldMoveFocus) {
      retryButton.focus({ preventScroll: true });
    }
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

    void startSearchInitialization(container, shouldMoveFocusForOpen());
  }

  /**
   * Ensures Pagefind initialization runs once per container.
   * @param {HTMLElement} container
   * @returns {Promise<void>}
   */
  function ensurePagefindInitialized(container) {
    if (isPagefindReady(container)) {
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
   * Coordinates the status UI, runtime initialization, and optional focus move
   * for both panel opens and manual retry actions.
   * @param {HTMLElement} container
   * @param {boolean} shouldMoveFocus
   * @returns {Promise<void>}
   */
  function startSearchInitialization(container, shouldMoveFocus) {
    if (!isPagefindReady(container)) {
      showPagefindPreparing(container);
    }

    if (shouldMoveFocus) {
      focusSearchInput(container);
    }

    return ensurePagefindInitialized(container)
      .then(() => {
        if (shouldMoveFocus) {
          focusSearchInput(container);
        }
      })
      .catch(() => {
        renderSearchFallback(container);
      });
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
    showPagefindPreparing(container);
    ensurePagefindStylesheet();
    await loadPagefindScript();
    await yieldToMain();

    const pagefindUi = getPagefindUiConstructor();
    if (pagefindUi === null) {
      throw new Error("Pagefind UI constructor was not available.");
    }

    if (isPagefindReady(container)) {
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

    markPagefindReady(container);
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
        SEARCH_STATUS_STATE.LOADING,
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
        SEARCH_STATUS_STATE.LOADING,
      );
      return;
    }

    const text = message.textContent?.trim() ?? "";

    if (text.length === 0) {
      setSearchStatus(
        container,
        getSearchMessages(container).loading,
        SEARCH_STATUS_STATE.LOADING,
      );
      return;
    }

    const { loading } = getSearchMessages(container);
    const state = text === loading
      ? SEARCH_STATUS_STATE.LOADING
      : SEARCH_STATUS_STATE.RESULTS;
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

        await trackRuntimeScriptLoad(existingScript);
        return;
      }
    }

    const script = globalThis.document.createElement("script");
    script.src = PAGEFIND_SCRIPT_URL;
    script.async = true;
    script.dataset.loadState = "pending";
    globalThis.document.body.append(script);

    await trackRuntimeScriptLoad(script);
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

  /**
   * Shares the promise bookkeeping for both reused and freshly injected
   * Pagefind runtime scripts.
   * @param {HTMLScriptElement} script
   * @returns {Promise<void>}
   */
  function trackRuntimeScriptLoad(script) {
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

    return pagefindRuntimePromise;
  }
})();

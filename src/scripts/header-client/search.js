// @ts-check

const FOCUSABLE_SELECTOR =
  "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";
const SEARCH_CONTAINER_SELECTOR = "[data-search-root]";
const SEARCH_PANEL_SELECTOR = "[data-search-panel]";
const PAGEFIND_SCRIPT_URL = "/pagefind/pagefind-ui.js";
const PAGEFIND_STYLE_URL = "/pagefind/pagefind-ui.css";

/**
 * @typedef {"idle" | "loading" | "results" | "error"} SearchStatusState
 */

/**
 * @typedef {"idle" | "loading" | "ready" | "error"} PagefindState
 */

/**
 * @typedef {{
 *   readonly element: string;
 *   readonly showImages: boolean;
 *   readonly showSubResults: boolean;
 *   readonly showEmptyFilters?: boolean;
 *   readonly openFilters?: readonly string[];
 *   readonly resetStyles: boolean;
 *   readonly translations?: Record<string, string>;
 * }} PagefindUiOptions
 */

/** @typedef {new (options: PagefindUiOptions) => unknown} PagefindUiConstructor */

/**
 * @typedef {{
 *   readonly panel: HTMLElement;
 *   readonly container: HTMLElement;
 *   readonly status: HTMLElement | null;
 *   readonly loading: HTMLElement | null;
 *   readonly loadingText: HTMLElement | null;
 *   readonly statusText: HTMLElement | null;
 *   readonly notification: HTMLElement | null;
 *   readonly notificationTitle: HTMLElement | null;
 *   readonly notificationSubtitle: HTMLElement | null;
 *   initPromise: Promise<void> | undefined;
 *   pendingStatusSyncId: number | undefined;
 * }} SearchController
 */

/**
 * @param {Window & typeof globalThis} runtime
 * @param {HTMLElement} root
 * @param {() => boolean} isKeyboardInteraction
 */
export function createHeaderSearch(runtime, root, isKeyboardInteraction) {
  const doc = runtime.document;
  /** @type {Promise<void> | undefined} */
  let pagefindRuntimePromise;
  const controller = createSearchController();

  /**
   * @param {string} selector
   * @param {ParentNode} [scope]
   * @returns {HTMLElement | null}
   */
  function queryElement(selector, scope = doc) {
    const element = scope.querySelector(selector);
    return element instanceof runtime.HTMLElement ? element : null;
  }

  /**
   * @param {HTMLElement} element
   * @returns {boolean}
   */
  function isHidden(element) {
    return element.hidden || element.closest("[hidden]") !== null;
  }

  /**
   * @param {HTMLElement} element
   * @returns {boolean}
   */
  function isSuppressedSearchElement(element) {
    return isHidden(element) ||
      element.closest(".pagefind-ui__hidden, .pagefind-ui__suppressed") !==
        null;
  }

  /**
   * @param {HTMLElement} container
   * @returns {HTMLElement[]}
   */
  function getFocusableElements(container) {
    /** @type {HTMLElement[]} */
    const focusable = [];

    for (const candidate of container.querySelectorAll(FOCUSABLE_SELECTOR)) {
      if (candidate instanceof runtime.HTMLElement && !isHidden(candidate)) {
        focusable.push(candidate);
      }
    }

    return focusable;
  }

  /**
   * @param {KeyboardEvent} event
   * @param {HTMLElement} container
   * @returns {void}
   */
  function trapFocus(event, container) {
    if (event.key !== "Tab") {
      return;
    }

    const focusable = getFocusableElements(container);

    if (focusable.length === 0) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (
      !(first instanceof runtime.HTMLElement) ||
      !(last instanceof runtime.HTMLElement)
    ) {
      return;
    }

    if (event.shiftKey) {
      if (doc.activeElement === first) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      }
      return;
    }

    if (doc.activeElement === last) {
      event.preventDefault();
      first.focus({ preventScroll: true });
    }
  }

  /**
   * @param {KeyboardEvent} event
   * @param {HTMLElement} container
   * @returns {boolean}
   */
  function routeFocusIntoContainer(event, container) {
    const focusable = getFocusableElements(container);

    if (focusable.length === 0) {
      return false;
    }

    const target = event.shiftKey
      ? focusable[focusable.length - 1]
      : focusable[0];

    if (!(target instanceof runtime.HTMLElement)) {
      return false;
    }

    event.preventDefault();
    target.focus({ preventScroll: true });
    return true;
  }

  /**
   * @returns {SearchController | null}
   */
  function createSearchController() {
    const panel = queryElement(SEARCH_PANEL_SELECTOR);
    const container = panel instanceof runtime.HTMLElement
      ? queryElement(SEARCH_CONTAINER_SELECTOR, panel)
      : null;

    if (
      !(panel instanceof runtime.HTMLElement) ||
      !(container instanceof runtime.HTMLElement)
    ) {
      return null;
    }

    return {
      panel,
      container,
      status: queryElement("[data-search-status]", panel),
      loading: queryElement("[data-search-loading]", panel),
      loadingText: queryElement("[data-search-loading-text]", panel),
      statusText: queryElement("[data-search-status-text]", panel),
      notification: queryElement("[data-search-notification]", panel),
      notificationTitle: queryElement(
        "[data-search-notification-title]",
        panel,
      ),
      notificationSubtitle: queryElement(
        "[data-search-notification-subtitle]",
        panel,
      ),
      initPromise: undefined,
      pendingStatusSyncId: undefined,
    };
  }

  /**
   * @param {SearchController} nextController
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
  function getSearchMessages(nextController) {
    return {
      loading: nextController.container.dataset.searchLoadingLabel ??
        "Loading search results.",
      loadingTitle: nextController.container.dataset.searchLoadingTitle ??
        "Preparing search",
      noResults: nextController.container.dataset.searchNoResultsLabel ??
        "No results found.",
      oneResult: nextController.container.dataset.searchOneResultLabel ??
        "[COUNT] result",
      manyResults: nextController.container.dataset.searchManyResultsLabel ??
        "[COUNT] results",
      unavailable: nextController.container.dataset.searchUnavailableLabel ??
        "Search is temporarily unavailable.",
      unavailableTitle:
        nextController.container.dataset.searchUnavailableTitle ??
          "Search unavailable",
      offline: nextController.container.dataset.searchOfflineLabel ??
        "Search is unavailable while offline.",
      offlineTitle: nextController.container.dataset.searchOfflineTitle ??
        "Offline",
      retry: nextController.container.dataset.searchRetryLabel ?? "Retry",
    };
  }

  /**
   * @param {SearchController} nextController
   * @returns {HTMLInputElement | null}
   */
  function getSearchInput(nextController) {
    const input = nextController.container.querySelector(
      ".pagefind-ui__search-input",
    );
    return input instanceof runtime.HTMLInputElement ? input : null;
  }

  /**
   * @param {SearchController} nextController
   * @returns {string}
   */
  function getActiveSearchTerm(nextController) {
    return getSearchInput(nextController)?.value.trim() ?? "";
  }

  /**
   * @param {SearchController} nextController
   * @returns {string}
   */
  function getVisibleSearchMessage(nextController) {
    for (
      const candidate of nextController.container.querySelectorAll(
        ".pagefind-ui__message",
      )
    ) {
      if (
        !(candidate instanceof runtime.HTMLElement) ||
        isSuppressedSearchElement(candidate)
      ) {
        continue;
      }

      const text = candidate.textContent?.trim() ?? "";

      if (text.length > 0) {
        return text;
      }
    }

    return "";
  }

  /**
   * @param {SearchController} nextController
   * @returns {number}
   */
  function getVisibleSearchResultCount(nextController) {
    let count = 0;

    for (
      const candidate of nextController.container.querySelectorAll(
        ".pagefind-ui__result",
      )
    ) {
      if (
        candidate instanceof runtime.HTMLElement &&
        !isSuppressedSearchElement(candidate)
      ) {
        count += 1;
      }
    }

    return count;
  }

  /**
   * @param {number} count
   * @returns {string}
   */
  function formatSearchResultCount(count) {
    const locale = root.lang?.trim() || undefined;
    return new Intl.NumberFormat(locale).format(count);
  }

  /**
   * @param {SearchController} nextController
   * @param {number} count
   * @returns {string}
   */
  function getSearchResultMessage(nextController, count) {
    const { noResults, oneResult, manyResults } = getSearchMessages(
      nextController,
    );

    if (count <= 0) {
      return noResults;
    }

    return (count === 1 ? oneResult : manyResults).replace(
      "[COUNT]",
      formatSearchResultCount(count),
    );
  }

  /**
   * @param {SearchController} nextController
   * @param {"info" | "warning"} tone
   * @param {string} title
   * @param {string} [subtitle]
   * @returns {void}
   */
  function showSearchNotification(
    nextController,
    tone,
    title,
    subtitle = "",
  ) {
    if (nextController.loading instanceof runtime.HTMLElement) {
      nextController.loading.hidden = true;
    }

    if (nextController.statusText instanceof runtime.HTMLElement) {
      nextController.statusText.hidden = true;
      nextController.statusText.textContent = "";
    }

    if (!(nextController.notification instanceof runtime.HTMLElement)) {
      return;
    }

    nextController.notification.hidden = false;
    nextController.notification.dataset.searchNotificationTone = tone;
    nextController.notification.classList.toggle(
      "site-notification--info",
      tone === "info",
    );
    nextController.notification.classList.toggle(
      "site-notification--warning",
      tone === "warning",
    );

    if (nextController.notificationTitle instanceof runtime.HTMLElement) {
      nextController.notificationTitle.textContent = title;
      nextController.notificationTitle.hidden = title.length === 0;
    }

    if (nextController.notificationSubtitle instanceof runtime.HTMLElement) {
      nextController.notificationSubtitle.textContent = subtitle;
      nextController.notificationSubtitle.hidden = subtitle.length === 0;
    }
  }

  /**
   * @param {SearchController} nextController
   * @param {boolean} isBusy
   * @returns {void}
   */
  function setSearchBusyState(nextController, isBusy) {
    const busy = isBusy ? "true" : "false";
    nextController.container.setAttribute("aria-busy", busy);
    nextController.container.dataset.searchBusy = busy;
    nextController.panel.setAttribute("aria-busy", busy);
  }

  /**
   * @param {SearchController} nextController
   * @returns {PagefindState}
   */
  function getPagefindState(nextController) {
    return /** @type {PagefindState} */ (
      nextController.container.dataset.pagefindState ?? "idle"
    );
  }

  /**
   * @param {SearchController} nextController
   * @param {PagefindState} state
   * @returns {void}
   */
  function setPagefindState(nextController, state) {
    nextController.container.dataset.pagefindState = state;
  }

  /**
   * @param {SearchController} nextController
   * @returns {HTMLElement | null}
   */
  function resetSearchStatusRegion(nextController) {
    const status = nextController.status;

    if (!(status instanceof runtime.HTMLElement)) {
      return null;
    }

    status.dataset.searchStatusState = "idle";

    if (nextController.loading instanceof runtime.HTMLElement) {
      nextController.loading.hidden = true;
    }

    if (nextController.loadingText instanceof runtime.HTMLElement) {
      nextController.loadingText.textContent =
        getSearchMessages(nextController).loading;
    }

    if (nextController.statusText instanceof runtime.HTMLElement) {
      nextController.statusText.hidden = true;
      nextController.statusText.textContent = "";
    }

    if (nextController.notification instanceof runtime.HTMLElement) {
      nextController.notification.hidden = true;
      nextController.notification.dataset.searchNotificationTone = "info";
      nextController.notification.classList.add(
        "site-notification--info",
      );
      nextController.notification.classList.remove(
        "site-notification--warning",
      );
    }

    if (nextController.notificationTitle instanceof runtime.HTMLElement) {
      nextController.notificationTitle.textContent = "";
      nextController.notificationTitle.hidden = true;
    }

    if (nextController.notificationSubtitle instanceof runtime.HTMLElement) {
      nextController.notificationSubtitle.textContent = "";
      nextController.notificationSubtitle.hidden = true;
    }

    status.hidden = true;
    return status;
  }

  /**
   * @param {SearchController} nextController
   * @param {string} message
   * @param {SearchStatusState} [state]
   * @returns {void}
   */
  function setSearchStatus(nextController, message, state = "idle") {
    const status = resetSearchStatusRegion(nextController);

    if (!(status instanceof runtime.HTMLElement)) {
      return;
    }

    const text = message.trim();
    status.dataset.searchStatusState = state;
    setSearchBusyState(
      nextController,
      text.length > 0 && state === "loading",
    );

    if (text.length === 0) {
      return;
    }

    if (state === "loading") {
      if (nextController.loadingText instanceof runtime.HTMLElement) {
        nextController.loadingText.textContent = text;
      }

      if (nextController.loading instanceof runtime.HTMLElement) {
        nextController.loading.hidden = false;
      }
    } else if (state === "error") {
      const {
        offline,
        offlineTitle,
        unavailableTitle,
      } = getSearchMessages(nextController);
      const tone = runtime.navigator.onLine === false || text === offline
        ? "warning"
        : "info";
      showSearchNotification(
        nextController,
        tone,
        tone === "warning" ? offlineTitle : unavailableTitle,
        text,
      );
    } else if (state === "results") {
      if (nextController.statusText instanceof runtime.HTMLElement) {
        nextController.statusText.hidden = false;
        nextController.statusText.textContent = text;
      }
    } else if (nextController.statusText instanceof runtime.HTMLElement) {
      nextController.statusText.hidden = false;
      nextController.statusText.textContent = text;
    }

    status.hidden = false;
  }

  /**
   * @param {SearchController} nextController
   * @returns {void}
   */
  function clearSearchStatus(nextController) {
    setSearchStatus(nextController, "");
  }

  /**
   * @param {SearchController} nextController
   * @returns {void}
   */
  function ensureSearchSkeleton(nextController) {
    if (
      nextController.container.querySelector("[data-search-skeleton]") !==
        null ||
      nextController.container.querySelector(".pagefind-ui") !== null
    ) {
      return;
    }

    const skeleton = doc.createElement("div");
    skeleton.className = "site-search-skeleton";
    skeleton.dataset.searchSkeleton = "";
    skeleton.setAttribute("aria-hidden", "true");

    for (let index = 0; index < 3; index += 1) {
      const line = doc.createElement("span");
      line.className = "site-skeleton__text site-search-skeleton-line";
      skeleton.append(line);
    }

    nextController.container.replaceChildren(skeleton);
  }

  /**
   * @param {SearchController} nextController
   * @returns {void}
   */
  function clearSearchFallback(nextController) {
    if (
      nextController.container.querySelector("[data-pagefind-fallback]") !==
        null
    ) {
      nextController.container.replaceChildren();
    }
  }

  /**
   * @param {SearchController} nextController
   * @returns {void}
   */
  function showPagefindPreparing(nextController) {
    setPagefindState(nextController, "loading");
    ensureSearchSkeleton(nextController);
    resetSearchStatusRegion(nextController);
    setSearchBusyState(nextController, true);
  }

  /**
   * @param {SearchController} nextController
   * @param {string} message
   * @returns {void}
   */
  function showPagefindError(nextController, message) {
    setPagefindState(nextController, "error");
    setSearchStatus(nextController, message, "error");
  }

  /**
   * @param {SearchController} nextController
   * @returns {Record<string, string>}
   */
  function getPagefindTranslations(nextController) {
    const { loading, noResults, oneResult, manyResults } = getSearchMessages(
      nextController,
    );

    return {
      searching: loading,
      zero_results: noResults,
      one_result: oneResult,
      many_results: manyResults,
    };
  }

  /**
   * @returns {PagefindUiConstructor | null}
   */
  function getPagefindUiConstructor() {
    const host = /** @type {{ readonly PagefindUI?: unknown }} */ (runtime);
    return typeof host.PagefindUI === "function"
      ? /** @type {PagefindUiConstructor} */ (host.PagefindUI)
      : null;
  }

  /**
   * @returns {{ yield?: () => Promise<void> } | undefined}
   */
  function getSchedulerApi() {
    const host = /** @type {{ readonly scheduler?: unknown }} */ (runtime);
    return typeof host.scheduler === "object" && host.scheduler !== null
      ? /** @type {{ yield?: () => Promise<void> }} */ (host.scheduler)
      : undefined;
  }

  /**
   * @param {SearchController} nextController
   * @returns {void}
   */
  function focusSearchInput(nextController) {
    const input = nextController.container.querySelector(
      ".pagefind-ui__search-input",
    );

    if (!(input instanceof runtime.HTMLInputElement) || input.disabled) {
      return;
    }

    input.focus({ preventScroll: true });
  }

  /**
   * @param {SearchController} nextController
   * @returns {void}
   */
  function syncSearchStatus(nextController) {
    const searchTerm = getActiveSearchTerm(nextController);

    if (searchTerm.length === 0) {
      clearSearchStatus(nextController);
      return;
    }

    const text = getVisibleSearchMessage(nextController);
    const resultCount = getVisibleSearchResultCount(nextController);
    const { loading } = getSearchMessages(nextController);

    if (resultCount > 0) {
      setSearchStatus(
        nextController,
        text.length > 0 && text !== loading
          ? text
          : getSearchResultMessage(nextController, resultCount),
        "results",
      );
      return;
    }

    if (text.length === 0 || text === loading) {
      setSearchStatus(nextController, loading, "loading");
      return;
    }

    setSearchStatus(nextController, text, "results");
  }

  /**
   * @param {SearchController} nextController
   * @returns {void}
   */
  function scheduleSearchStatusSync(nextController) {
    if (typeof nextController.pendingStatusSyncId === "number") {
      return;
    }

    nextController.pendingStatusSyncId = runtime.setTimeout(() => {
      nextController.pendingStatusSyncId = undefined;
      syncSearchStatus(nextController);
    }, 0);
  }

  /**
   * @param {SearchController} nextController
   * @returns {void}
   */
  function bindSearchStatus(nextController) {
    if (nextController.container.dataset.searchStatusBound === "true") {
      syncSearchStatus(nextController);
      return;
    }

    const input = getSearchInput(nextController);

    if (!(input instanceof runtime.HTMLInputElement)) {
      return;
    }

    nextController.container.dataset.searchStatusBound = "true";

    input.addEventListener("input", () => {
      if (input.value.trim().length === 0) {
        clearSearchStatus(nextController);
        return;
      }

      setSearchStatus(
        nextController,
        getSearchMessages(nextController).loading,
        "loading",
      );
      scheduleSearchStatusSync(nextController);
    });

    const messageObserver = new runtime.MutationObserver(() => {
      scheduleSearchStatusSync(nextController);
    });

    messageObserver.observe(nextController.container, {
      attributes: true,
      attributeFilter: ["class", "hidden", "open"],
      childList: true,
      subtree: true,
      characterData: true,
    });

    syncSearchStatus(nextController);
  }

  /**
   * @returns {void}
   */
  function ensurePagefindStylesheet() {
    if (doc.querySelector(`link[href="${PAGEFIND_STYLE_URL}"]`) !== null) {
      return;
    }

    const stylesheet = doc.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = PAGEFIND_STYLE_URL;
    doc.head.append(stylesheet);
  }

  /**
   * @param {SearchController} nextController
   * @returns {string}
   */
  function ensurePagefindSelector(nextController) {
    if (nextController.container.id.length === 0) {
      nextController.container.id = "site-search-root";
    }

    return `#${nextController.container.id}`;
  }

  /**
   * @returns {Promise<void>}
   */
  function loadPagefindScript() {
    if (getPagefindUiConstructor() !== null) {
      return Promise.resolve();
    }

    if (pagefindRuntimePromise !== undefined) {
      return pagefindRuntimePromise;
    }

    const existingScript = doc.querySelector(
      `script[src="${PAGEFIND_SCRIPT_URL}"]`,
    );

    if (existingScript instanceof runtime.HTMLScriptElement) {
      if (existingScript.dataset.loadState === "error") {
        existingScript.remove();
      } else {
        if (existingScript.dataset.loaded === "true") {
          return Promise.resolve();
        }

        return trackRuntimeScriptLoad(existingScript);
      }
    }

    const script = doc.createElement("script");
    script.src = PAGEFIND_SCRIPT_URL;
    script.async = true;
    script.dataset.loadState = "pending";
    doc.body.append(script);

    return trackRuntimeScriptLoad(script);
  }

  /**
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

  /**
   * @returns {Promise<void>}
   */
  async function yieldToMain() {
    const schedulerApi = getSchedulerApi();

    if (typeof schedulerApi?.yield === "function") {
      await schedulerApi.yield();
      return;
    }

    await new Promise((resolve) => {
      runtime.setTimeout(resolve, 0);
    });
  }

  /**
   * @param {SearchController} nextController
   * @returns {Promise<void>}
   */
  async function initializePagefind(nextController) {
    clearSearchFallback(nextController);
    showPagefindPreparing(nextController);
    ensurePagefindStylesheet();
    await loadPagefindScript();
    await yieldToMain();

    const pagefindUi = getPagefindUiConstructor();

    if (pagefindUi === null) {
      throw new Error("Pagefind UI constructor was not available.");
    }

    if (getPagefindState(nextController) === "ready") {
      return;
    }

    nextController.container.replaceChildren();
    delete nextController.container.dataset.searchStatusBound;

    new pagefindUi({
      element: ensurePagefindSelector(nextController),
      showImages: false,
      showEmptyFilters: false,
      openFilters: [],
      showSubResults: false,
      resetStyles: false,
      translations: getPagefindTranslations(nextController),
    });

    setPagefindState(nextController, "ready");
    bindSearchStatus(nextController);
  }

  /**
   * @param {SearchController} nextController
   * @returns {Promise<void>}
   */
  function ensurePagefindInitialized(nextController) {
    if (getPagefindState(nextController) === "ready") {
      return Promise.resolve();
    }

    if (nextController.initPromise !== undefined) {
      return nextController.initPromise;
    }

    nextController.initPromise = initializePagefind(nextController).catch(
      (error) => {
        nextController.initPromise = undefined;
        throw error;
      },
    );

    return nextController.initPromise;
  }

  /**
   * @param {SearchController} nextController
   * @param {boolean} shouldMoveFocus
   * @returns {void}
   */
  function renderSearchFallback(nextController, shouldMoveFocus) {
    const { unavailable, offline, retry } = getSearchMessages(nextController);
    const message = runtime.navigator.onLine === false ? offline : unavailable;
    const fallback = doc.createElement("div");
    fallback.className = "pagefind-ui__drawer";
    fallback.dataset.pagefindFallback = "";

    showPagefindError(nextController, message);

    const retryButton = doc.createElement("button");
    retryButton.type = "button";
    retryButton.className = "pagefind-ui__button";
    retryButton.textContent = retry;

    if (nextController.status?.id) {
      retryButton.setAttribute("aria-describedby", nextController.status.id);
    }

    retryButton.addEventListener("click", () => {
      clearSearchFallback(nextController);
      void startSearchInitialization(nextController, isKeyboardInteraction());
    });

    fallback.append(retryButton);
    nextController.container.replaceChildren(fallback);

    if (shouldMoveFocus) {
      retryButton.focus({ preventScroll: true });
    }
  }

  /**
   * @param {SearchController} nextController
   * @param {boolean} shouldMoveFocus
   * @returns {Promise<void>}
   */
  function startSearchInitialization(nextController, shouldMoveFocus) {
    if (getPagefindState(nextController) !== "ready") {
      showPagefindPreparing(nextController);
    }

    if (shouldMoveFocus) {
      focusSearchInput(nextController);
    }

    return ensurePagefindInitialized(nextController)
      .then(() => {
        if (shouldMoveFocus) {
          focusSearchInput(nextController);
        }
      })
      .catch(() => {
        renderSearchFallback(nextController, shouldMoveFocus);
      });
  }

  /**
   * @param {HTMLElement | null} surface
   * @returns {boolean}
   */
  function isSearchPanel(surface) {
    return surface instanceof runtime.HTMLElement &&
      surface.matches(SEARCH_PANEL_SELECTOR);
  }

  /**
   * @param {boolean} shouldMoveFocus
   * @returns {Promise<void>}
   */
  function initializeForOpen(shouldMoveFocus) {
    if (controller === null) {
      return Promise.resolve();
    }

    return startSearchInitialization(controller, shouldMoveFocus);
  }

  /**
   * @param {KeyboardEvent} event
   * @param {HTMLElement | null} openSurface
   * @returns {boolean}
   */
  function handleGlobalKeydown(event, openSurface) {
    const searchSurface = isSearchPanel(openSurface) ? openSurface : null;

    if (
      !(event.key === "Tab" && searchSurface instanceof runtime.HTMLElement)
    ) {
      return false;
    }

    const target = event.target instanceof runtime.HTMLElement
      ? event.target
      : null;

    if (
      !(target instanceof runtime.HTMLElement) ||
      !searchSurface.contains(target)
    ) {
      routeFocusIntoContainer(event, searchSurface);
      return true;
    }

    trapFocus(event, searchSurface);
    return true;
  }

  return {
    isSearchPanel,
    initializeForOpen,
    handleGlobalKeydown,
  };
}

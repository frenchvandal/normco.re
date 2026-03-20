// @ts-check
(() => {
  const doc = globalThis.document;
  const root = doc.documentElement;

  if (root.dataset.headerClientBound === "true") {
    return;
  }

  root.dataset.headerClientBound = "true";

  const DEFERRED_FOCUS_DELAY_MS = 16;
  const DISCLOSURE_CONTROL_SELECTOR =
    ".cds--header__action[aria-controls], .cds--header__menu-toggle";
  const DISCLOSURE_SURFACE_SELECTOR = ".cds--header__panel, .cds--side-nav";
  const FOCUSABLE_SELECTOR =
    "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";
  const LANGUAGE_MENU_SELECTOR = "[data-language-menu]";
  const LANGUAGE_OPTION_SELECTOR =
    '[data-language-option][role="menuitemradio"]';
  const OVERLAY_SELECTOR = ".cds--side-nav__overlay";
  const SEARCH_CONTAINER_SELECTOR = "[data-search-root]";
  const SEARCH_PANEL_SELECTOR = "[data-search-panel]";
  const SIDE_NAV_LINK_SELECTOR = "a.cds--side-nav__link";
  const THEME_TOGGLE_SELECTOR = "#theme-toggle";
  const TOOLTIP_CONTAINER_SELECTOR = "[data-header-tooltip]";
  const TOOLTIP_TRIGGER_SELECTOR = "[data-header-tooltip-trigger]";
  const PAGEFIND_SCRIPT_URL = "/pagefind/pagefind-ui.js";
  const PAGEFIND_STYLE_URL = "/pagefind/pagefind-ui.css";
  const THEME_STORAGE_KEY = "color-mode";
  const LEGACY_THEME_STORAGE_KEY = "color-scheme";
  const LANGUAGE_STORAGE_KEY = "preferred-language";

  /**
   * @typedef {"keyboard" | "pointer"} InteractionModality
   */

  /**
   * @typedef {"idle" | "loading" | "results" | "error"} SearchStatusState
   */

  /**
   * @typedef {"idle" | "loading" | "ready" | "error"} PagefindState
   */

  /**
   * @typedef {"light" | "dark"} ColorMode
   */

  /**
   * @typedef {"light" | "dark" | "system"} ThemePreference
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

  const disclosureControls = Array.from(
    doc.querySelectorAll(DISCLOSURE_CONTROL_SELECTOR),
  ).filter((candidate) => candidate instanceof HTMLElement);
  const overlay = queryElement(OVERLAY_SELECTOR);
  const surfaceByControl = new Map();
  const controlBySurfaceId = new Map();

  for (const control of disclosureControls) {
    const surface = getLinkedSurface(control);

    if (!(surface instanceof HTMLElement)) {
      continue;
    }

    surfaceByControl.set(control, surface);

    if (surface.id.length > 0) {
      controlBySurfaceId.set(surface.id, control);
    }
  }

  /** @type {HTMLElement | null} */
  let openControl = null;
  /** @type {HTMLElement | null} */
  let openSurface = null;
  /** @type {HTMLElement | null} */
  let lastTrigger = null;
  /** @type {InteractionModality} */
  let interactionModality = root.dataset.interactionModality === "keyboard"
    ? "keyboard"
    : "pointer";
  root.dataset.interactionModality = interactionModality;

  /** @type {Promise<void> | undefined} */
  let pagefindRuntimePromise;
  const themeMediaQuery = globalThis.matchMedia(
    "(prefers-color-scheme: dark)",
  );
  const search = createSearchController();

  syncInitialDisclosureState();
  syncOverlayVisibility();
  syncBodyScrollLock();
  setupThemeToggle();
  setupGlobalListeners();

  if (isSearchPanel(openSurface) && search !== null) {
    void startSearchInitialization(search, isKeyboardInteraction());
  }

  /**
   * @param {string} selector
   * @param {ParentNode} [scope]
   * @returns {HTMLElement | null}
   */
  function queryElement(selector, scope = doc) {
    const element = scope.querySelector(selector);
    return element instanceof HTMLElement ? element : null;
  }

  /**
   * @param {HTMLElement} control
   * @returns {HTMLElement | null}
   */
  function getLinkedSurface(control) {
    const panelId = control.getAttribute("aria-controls");

    if (panelId === null || panelId.length === 0) {
      return null;
    }

    const surface = doc.getElementById(panelId);
    return surface instanceof HTMLElement ? surface : null;
  }

  /**
   * @param {HTMLElement} surface
   * @returns {HTMLElement | null}
   */
  function getControlForSurface(surface) {
    if (surface.id.length === 0) {
      return null;
    }

    const control = controlBySurfaceId.get(surface.id);
    return control instanceof HTMLElement ? control : null;
  }

  /**
   * @param {EventTarget | null} node
   * @param {string} selector
   * @returns {HTMLElement | null}
   */
  function closestElement(node, selector) {
    if (!(node instanceof Element)) {
      return null;
    }

    const match = node.closest(selector);
    return match instanceof HTMLElement ? match : null;
  }

  /**
   * @param {HTMLElement} element
   * @returns {boolean}
   */
  function isHidden(element) {
    return element.hidden || element.closest("[hidden]") !== null;
  }

  /**
   * @param {HTMLElement} control
   * @param {boolean} expanded
   * @returns {void}
   */
  function setControlExpanded(control, expanded) {
    control.setAttribute("aria-expanded", expanded ? "true" : "false");
  }

  /**
   * @param {HTMLElement} surface
   * @param {boolean} expanded
   * @returns {void}
   */
  function setSurfaceExpanded(surface, expanded) {
    if (expanded) {
      surface.hidden = false;
      surface.setAttribute("expanded", "");
      return;
    }

    surface.hidden = true;
    surface.removeAttribute("expanded");
  }

  /**
   * @param {HTMLElement | null} surface
   * @returns {boolean}
   */
  function isLanguagePanel(surface) {
    return surface instanceof HTMLElement &&
      surface.matches("[data-language-panel]");
  }

  /**
   * @param {HTMLElement | null} surface
   * @returns {boolean}
   */
  function isSearchPanel(surface) {
    return surface instanceof HTMLElement &&
      surface.matches(SEARCH_PANEL_SELECTOR);
  }

  /**
   * @param {HTMLElement | null} surface
   * @returns {boolean}
   */
  function isSideNav(surface) {
    return surface instanceof HTMLElement && surface.matches(".cds--side-nav");
  }

  /**
   * @param {InteractionModality} modality
   * @returns {void}
   */
  function setInteractionModality(modality) {
    interactionModality = modality;
    root.dataset.interactionModality = modality;
  }

  /**
   * @returns {boolean}
   */
  function isKeyboardInteraction() {
    return interactionModality === "keyboard";
  }

  /**
   * @param {HTMLElement | null} trigger
   * @returns {void}
   */
  function rememberTrigger(trigger) {
    lastTrigger = trigger;
  }

  /**
   * @returns {void}
   */
  function clearRememberedTrigger() {
    lastTrigger = null;
  }

  /**
   * @returns {void}
   */
  function restoreRememberedTriggerFocus() {
    if (lastTrigger instanceof HTMLElement) {
      lastTrigger.focus({ preventScroll: true });
    }

    clearRememberedTrigger();
  }

  /**
   * @returns {void}
   */
  function syncOverlayVisibility() {
    if (!(overlay instanceof HTMLElement)) {
      return;
    }

    overlay.setAttribute(
      "aria-hidden",
      isSideNav(openSurface) ? "false" : "true",
    );
  }

  /**
   * @returns {void}
   */
  function syncBodyScrollLock() {
    doc.body.style.overflow = isSideNav(openSurface) ? "hidden" : "";
  }

  /**
   * @returns {void}
   */
  function syncInitialDisclosureState() {
    for (const control of disclosureControls) {
      if (control.getAttribute("aria-expanded") !== "true") {
        continue;
      }

      const surface = surfaceByControl.get(control);

      if (!(surface instanceof HTMLElement)) {
        continue;
      }

      openControl = control;
      openSurface = surface;
      return;
    }

    for (const surface of surfaceByControl.values()) {
      if (surface.hidden && !surface.hasAttribute("expanded")) {
        continue;
      }

      openSurface = surface;
      openControl = getControlForSurface(surface);
      return;
    }
  }

  /**
   * @param {HTMLElement} container
   * @param {() => Element | null} resolveTarget
   * @returns {void}
   */
  function scheduleDeferredFocus(container, resolveTarget) {
    const focusWhenReady = () => {
      if (!container.isConnected || container.hidden) {
        return;
      }

      const target = resolveTarget();

      if (!(target instanceof HTMLElement) || !target.isConnected) {
        return;
      }

      target.focus({ preventScroll: true });
    };

    if (typeof globalThis.requestAnimationFrame === "function") {
      globalThis.requestAnimationFrame(() => {
        globalThis.requestAnimationFrame(focusWhenReady);
      });
      return;
    }

    globalThis.setTimeout(focusWhenReady, DEFERRED_FOCUS_DELAY_MS);
  }

  /**
   * @param {HTMLElement} container
   * @returns {HTMLElement[]}
   */
  function getFocusableElements(container) {
    /** @type {HTMLElement[]} */
    const focusable = [];

    for (const candidate of container.querySelectorAll(FOCUSABLE_SELECTOR)) {
      if (candidate instanceof HTMLElement && !isHidden(candidate)) {
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

    if (!(first instanceof HTMLElement) || !(last instanceof HTMLElement)) {
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
   * @param {HTMLElement} menu
   * @returns {HTMLElement[]}
   */
  function getLanguageItems(menu) {
    return Array.from(menu.querySelectorAll(LANGUAGE_OPTION_SELECTOR))
      .filter((candidate) => candidate instanceof HTMLElement);
  }

  /**
   * @param {HTMLElement} menu
   * @param {number} nextIndex
   * @returns {void}
   */
  function focusLanguageItem(menu, nextIndex) {
    const items = getLanguageItems(menu);

    if (items.length === 0) {
      return;
    }

    const normalizedIndex = ((nextIndex % items.length) + items.length) %
      items.length;

    for (const [index, item] of items.entries()) {
      item.setAttribute("tabindex", index === normalizedIndex ? "0" : "-1");
    }

    items[normalizedIndex]?.focus({ preventScroll: true });
  }

  /**
   * @param {"first" | "last" | "selected"} strategy
   * @returns {boolean}
   */
  function focusLanguageMenuFromTrigger(strategy) {
    if (!isLanguagePanel(openSurface)) {
      return false;
    }

    const languagePanel = /** @type {HTMLElement} */ (openSurface);
    const menu = queryElement(LANGUAGE_MENU_SELECTOR, languagePanel);

    if (!(menu instanceof HTMLElement)) {
      return false;
    }

    const items = getLanguageItems(menu);

    if (items.length === 0) {
      return false;
    }

    if (strategy === "first") {
      focusLanguageItem(menu, 0);
      return true;
    }

    if (strategy === "last") {
      focusLanguageItem(menu, items.length - 1);
      return true;
    }

    const selectedIndex = items.findIndex((item) =>
      item.getAttribute("aria-checked") === "true" ||
      item.getAttribute("aria-current") === "page"
    );

    focusLanguageItem(menu, selectedIndex >= 0 ? selectedIndex : 0);
    return true;
  }

  /**
   * @param {HTMLElement} surface
   * @returns {Element | null}
   */
  function resolveInitialFocusTarget(surface) {
    if (isSideNav(surface)) {
      return surface.querySelector(SIDE_NAV_LINK_SELECTOR);
    }

    if (isLanguagePanel(surface)) {
      const selected = surface.querySelector(
        '[role="menuitemradio"][aria-checked="true"], [aria-current="page"]',
      );

      if (selected instanceof HTMLElement) {
        return selected;
      }
    }

    return surface.querySelector(FOCUSABLE_SELECTOR);
  }

  /**
   * @param {boolean} restoreFocus
   * @returns {boolean}
   */
  function closeCurrentDisclosure(restoreFocus = false) {
    if (!(openSurface instanceof HTMLElement)) {
      if (restoreFocus) {
        restoreRememberedTriggerFocus();
      }
      return false;
    }

    const surface = openSurface;
    const control = openControl ?? getControlForSurface(surface);

    if (control instanceof HTMLElement) {
      setControlExpanded(control, false);
    }

    setSurfaceExpanded(surface, false);
    openSurface = null;
    openControl = null;
    syncOverlayVisibility();
    syncBodyScrollLock();

    if (restoreFocus) {
      restoreRememberedTriggerFocus();
    } else {
      clearRememberedTrigger();
    }

    return true;
  }

  /**
   * @param {HTMLElement} control
   * @param {HTMLElement} surface
   * @returns {void}
   */
  function openDisclosure(control, surface) {
    if (openSurface instanceof HTMLElement && openSurface !== surface) {
      closeCurrentDisclosure(false);
    }

    rememberTrigger(control);
    openControl = control;
    openSurface = surface;
    setControlExpanded(control, true);
    setSurfaceExpanded(surface, true);
    closeTooltipForElement(control);
    syncOverlayVisibility();
    syncBodyScrollLock();

    if (isSearchPanel(surface)) {
      if (search !== null) {
        void startSearchInitialization(search, isKeyboardInteraction());
      }
      return;
    }

    if (isKeyboardInteraction()) {
      scheduleDeferredFocus(surface, () => resolveInitialFocusTarget(surface));
    }
  }

  /**
   * @param {HTMLElement} control
   * @returns {void}
   */
  function handleDisclosureControlActivation(control) {
    const surface = surfaceByControl.get(control);

    if (!(surface instanceof HTMLElement)) {
      return;
    }

    const isExpanded = openControl === control &&
      openSurface === surface &&
      control.getAttribute("aria-expanded") === "true";

    if (isExpanded) {
      closeTooltipForElement(control);
      closeCurrentDisclosure(false);
      control.focus({ preventScroll: true });
      return;
    }

    openDisclosure(control, surface);
  }

  /**
   * @param {HTMLElement | null} container
   * @returns {void}
   */
  function openTooltip(container) {
    if (!(container instanceof HTMLElement)) {
      return;
    }

    const trigger = queryElement(TOOLTIP_TRIGGER_SELECTOR, container);

    if (
      !(trigger instanceof HTMLButtonElement) ||
      trigger.getAttribute("aria-expanded") === "true"
    ) {
      return;
    }

    container.classList.add("cds--popover--open");
  }

  /**
   * @param {HTMLElement | null} container
   * @returns {void}
   */
  function closeTooltip(container) {
    if (!(container instanceof HTMLElement)) {
      return;
    }

    container.classList.remove("cds--popover--open");
  }

  /**
   * @param {HTMLElement} element
   * @returns {void}
   */
  function closeTooltipForElement(element) {
    closeTooltip(closestElement(element, TOOLTIP_CONTAINER_SELECTOR));
  }

  /**
   * @returns {void}
   */
  function closeAllTooltips() {
    for (const container of doc.querySelectorAll(TOOLTIP_CONTAINER_SELECTOR)) {
      if (container instanceof HTMLElement) {
        closeTooltip(container);
      }
    }
  }

  /**
   * @returns {SearchController | null}
   */
  function createSearchController() {
    const panel = queryElement(SEARCH_PANEL_SELECTOR);
    const container = panel instanceof HTMLElement
      ? queryElement(SEARCH_CONTAINER_SELECTOR, panel)
      : null;

    if (
      !(panel instanceof HTMLElement) || !(container instanceof HTMLElement)
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
   * @param {SearchController} controller
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
  function getSearchMessages(controller) {
    return {
      loading: controller.container.dataset.searchLoadingLabel ??
        "Loading search results.",
      loadingTitle: controller.container.dataset.searchLoadingTitle ??
        "Preparing search",
      noResults: controller.container.dataset.searchNoResultsLabel ??
        "No results found.",
      oneResult: controller.container.dataset.searchOneResultLabel ??
        "[COUNT] result",
      manyResults: controller.container.dataset.searchManyResultsLabel ??
        "[COUNT] results",
      unavailable: controller.container.dataset.searchUnavailableLabel ??
        "Search is temporarily unavailable.",
      unavailableTitle: controller.container.dataset.searchUnavailableTitle ??
        "Search unavailable",
      offline: controller.container.dataset.searchOfflineLabel ??
        "Search is unavailable while offline.",
      offlineTitle: controller.container.dataset.searchOfflineTitle ??
        "Offline",
      retry: controller.container.dataset.searchRetryLabel ?? "Retry",
    };
  }

  /**
   * @param {SearchController} controller
   * @returns {HTMLInputElement | null}
   */
  function getSearchInput(controller) {
    const input = controller.container.querySelector(
      ".pagefind-ui__search-input",
    );
    return input instanceof HTMLInputElement ? input : null;
  }

  /**
   * @param {SearchController} controller
   * @returns {string}
   */
  function getActiveSearchTerm(controller) {
    return getSearchInput(controller)?.value.trim() ?? "";
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
   * @param {SearchController} controller
   * @param {number} count
   * @returns {string}
   */
  function getSearchResultMessage(controller, count) {
    const { noResults, oneResult, manyResults } = getSearchMessages(controller);

    if (count <= 0) {
      return noResults;
    }

    return (count === 1 ? oneResult : manyResults).replace(
      "[COUNT]",
      formatSearchResultCount(count),
    );
  }

  /**
   * @param {SearchController} controller
   * @param {"info" | "warning"} tone
   * @param {string} title
   * @param {string} [subtitle]
   * @returns {void}
   */
  function showSearchNotification(
    controller,
    tone,
    title,
    subtitle = "",
  ) {
    if (!(controller.notification instanceof HTMLElement)) {
      return;
    }

    controller.notification.hidden = false;
    controller.notification.dataset.searchNotificationTone = tone;
    controller.notification.classList.toggle(
      "cds--inline-notification--info",
      tone === "info",
    );
    controller.notification.classList.toggle(
      "cds--inline-notification--warning",
      tone === "warning",
    );

    if (controller.notificationTitle instanceof HTMLElement) {
      controller.notificationTitle.textContent = title;
      controller.notificationTitle.hidden = title.length === 0;
    }

    if (controller.notificationSubtitle instanceof HTMLElement) {
      controller.notificationSubtitle.textContent = subtitle;
      controller.notificationSubtitle.hidden = subtitle.length === 0;
    }
  }

  /**
   * @param {SearchController} controller
   * @param {boolean} isBusy
   * @returns {void}
   */
  function setSearchBusyState(controller, isBusy) {
    const busy = isBusy ? "true" : "false";
    controller.container.setAttribute("aria-busy", busy);
    controller.container.dataset.searchBusy = busy;
    controller.panel.setAttribute("aria-busy", busy);
  }

  /**
   * @param {SearchController} controller
   * @returns {PagefindState}
   */
  function getPagefindState(controller) {
    return /** @type {PagefindState} */ (
      controller.container.dataset.pagefindState ?? "idle"
    );
  }

  /**
   * @param {SearchController} controller
   * @param {PagefindState} state
   * @returns {void}
   */
  function setPagefindState(controller, state) {
    controller.container.dataset.pagefindState = state;
  }

  /**
   * @param {SearchController} controller
   * @returns {HTMLElement | null}
   */
  function resetSearchStatusRegion(controller) {
    const status = controller.status;

    if (!(status instanceof HTMLElement)) {
      return null;
    }

    status.dataset.searchStatusState = "idle";

    if (controller.loading instanceof HTMLElement) {
      controller.loading.hidden = true;
    }

    if (controller.loadingText instanceof HTMLElement) {
      controller.loadingText.textContent =
        getSearchMessages(controller).loading;
    }

    if (controller.statusText instanceof HTMLElement) {
      controller.statusText.hidden = true;
      controller.statusText.textContent = "";
    }

    if (controller.notification instanceof HTMLElement) {
      controller.notification.hidden = true;
      controller.notification.dataset.searchNotificationTone = "info";
      controller.notification.classList.add("cds--inline-notification--info");
      controller.notification.classList.remove(
        "cds--inline-notification--warning",
      );
    }

    if (controller.notificationTitle instanceof HTMLElement) {
      controller.notificationTitle.textContent = "";
      controller.notificationTitle.hidden = true;
    }

    if (controller.notificationSubtitle instanceof HTMLElement) {
      controller.notificationSubtitle.textContent = "";
      controller.notificationSubtitle.hidden = true;
    }

    status.hidden = true;
    return status;
  }

  /**
   * @param {SearchController} controller
   * @param {string} message
   * @param {SearchStatusState} [state]
   * @returns {void}
   */
  function setSearchStatus(controller, message, state = "idle") {
    const status = resetSearchStatusRegion(controller);

    if (!(status instanceof HTMLElement)) {
      return;
    }

    const text = message.trim();
    status.dataset.searchStatusState = state;
    setSearchBusyState(
      controller,
      text.length > 0 && state === "loading",
    );

    if (text.length === 0) {
      return;
    }

    if (state === "loading") {
      if (controller.loadingText instanceof HTMLElement) {
        controller.loadingText.textContent = text;
      }

      if (controller.loading instanceof HTMLElement) {
        controller.loading.hidden = false;
      }
    } else if (state === "error") {
      const {
        offline,
        offlineTitle,
        unavailableTitle,
      } = getSearchMessages(controller);
      const tone = globalThis.navigator.onLine === false || text === offline
        ? "warning"
        : "info";
      showSearchNotification(
        controller,
        tone,
        tone === "warning" ? offlineTitle : unavailableTitle,
        text,
      );
    } else if (state === "results") {
      showSearchNotification(controller, "info", text);
    } else if (controller.statusText instanceof HTMLElement) {
      controller.statusText.hidden = false;
      controller.statusText.textContent = text;
    }

    status.hidden = false;
  }

  /**
   * @param {SearchController} controller
   * @returns {void}
   */
  function clearSearchStatus(controller) {
    setSearchStatus(controller, "");
  }

  /**
   * @param {SearchController} controller
   * @returns {void}
   */
  function ensureSearchSkeleton(controller) {
    if (
      controller.container.querySelector("[data-search-skeleton]") !== null ||
      controller.container.querySelector(".pagefind-ui") !== null
    ) {
      return;
    }

    const skeleton = doc.createElement("div");
    skeleton.className = "site-search-skeleton";
    skeleton.dataset.searchSkeleton = "";
    skeleton.setAttribute("aria-hidden", "true");

    for (let index = 0; index < 3; index += 1) {
      const line = doc.createElement("span");
      line.className = "cds--skeleton__text site-search-skeleton-line";
      skeleton.append(line);
    }

    controller.container.replaceChildren(skeleton);
  }

  /**
   * @param {SearchController} controller
   * @returns {void}
   */
  function clearSearchFallback(controller) {
    if (
      controller.container.querySelector("[data-pagefind-fallback]") !== null
    ) {
      controller.container.replaceChildren();
    }
  }

  /**
   * @param {SearchController} controller
   * @returns {void}
   */
  function showPagefindPreparing(controller) {
    setPagefindState(controller, "loading");
    ensureSearchSkeleton(controller);
    resetSearchStatusRegion(controller);
    setSearchBusyState(controller, true);
  }

  /**
   * @param {SearchController} controller
   * @param {string} message
   * @returns {void}
   */
  function showPagefindError(controller, message) {
    setPagefindState(controller, "error");
    setSearchStatus(controller, message, "error");
  }

  /**
   * @param {SearchController} controller
   * @returns {Record<string, string>}
   */
  function getPagefindTranslations(controller) {
    const { loading, noResults, oneResult, manyResults } = getSearchMessages(
      controller,
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
    const runtime =
      /** @type {{ readonly PagefindUI?: unknown }} */ (globalThis);
    return typeof runtime.PagefindUI === "function"
      ? /** @type {PagefindUiConstructor} */ (runtime.PagefindUI)
      : null;
  }

  /**
   * @returns {{ yield?: () => Promise<void> } | undefined}
   */
  function getSchedulerApi() {
    const runtime =
      /** @type {{ readonly scheduler?: unknown }} */ (globalThis);
    return typeof runtime.scheduler === "object" && runtime.scheduler !== null
      ? /** @type {{ yield?: () => Promise<void> }} */ (runtime.scheduler)
      : undefined;
  }

  /**
   * @param {SearchController} controller
   * @returns {void}
   */
  function focusSearchInput(controller) {
    const input = controller.container.querySelector(
      ".pagefind-ui__search-input",
    );

    if (!(input instanceof HTMLInputElement) || input.disabled) {
      return;
    }

    input.focus({ preventScroll: true });
  }

  /**
   * @param {SearchController} controller
   * @returns {void}
   */
  function syncSearchStatus(controller) {
    const message = controller.container.querySelector(".pagefind-ui__message");
    const searchTerm = getActiveSearchTerm(controller);

    if (searchTerm.length === 0) {
      clearSearchStatus(controller);
      return;
    }

    const text = message instanceof HTMLElement
      ? message.textContent?.trim() ?? ""
      : "";
    const resultCount = controller.container.querySelectorAll(
      ".pagefind-ui__result",
    ).length;
    const { loading } = getSearchMessages(controller);

    if (resultCount > 0) {
      setSearchStatus(
        controller,
        text.length > 0 && text !== loading
          ? text
          : getSearchResultMessage(controller, resultCount),
        "results",
      );
      return;
    }

    if (text.length === 0 || text === loading) {
      setSearchStatus(controller, loading, "loading");
      return;
    }

    setSearchStatus(
      controller,
      text,
      "results",
    );
  }

  /**
   * @param {SearchController} controller
   * @returns {void}
   */
  function scheduleSearchStatusSync(controller) {
    if (typeof controller.pendingStatusSyncId === "number") {
      return;
    }

    controller.pendingStatusSyncId = globalThis.setTimeout(() => {
      controller.pendingStatusSyncId = undefined;
      syncSearchStatus(controller);
    }, 0);
  }

  /**
   * @param {SearchController} controller
   * @returns {void}
   */
  function bindSearchStatus(controller) {
    if (controller.container.dataset.searchStatusBound === "true") {
      syncSearchStatus(controller);
      return;
    }

    const input = getSearchInput(controller);

    if (!(input instanceof HTMLInputElement)) {
      return;
    }

    controller.container.dataset.searchStatusBound = "true";

    input.addEventListener("input", () => {
      if (input.value.trim().length === 0) {
        clearSearchStatus(controller);
        return;
      }

      setSearchStatus(
        controller,
        getSearchMessages(controller).loading,
        "loading",
      );
      scheduleSearchStatusSync(controller);
    });

    const messageObserver = new MutationObserver(() => {
      syncSearchStatus(controller);
    });

    messageObserver.observe(controller.container, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    syncSearchStatus(controller);
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
   * @param {SearchController} controller
   * @returns {string}
   */
  function ensurePagefindSelector(controller) {
    if (controller.container.id.length === 0) {
      controller.container.id = "site-search-root";
    }

    return `#${controller.container.id}`;
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

    if (existingScript instanceof HTMLScriptElement) {
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
      globalThis.setTimeout(resolve, 0);
    });
  }

  /**
   * @param {SearchController} controller
   * @returns {Promise<void>}
   */
  async function initializePagefind(controller) {
    clearSearchFallback(controller);
    showPagefindPreparing(controller);
    ensurePagefindStylesheet();
    await loadPagefindScript();
    await yieldToMain();

    const pagefindUi = getPagefindUiConstructor();

    if (pagefindUi === null) {
      throw new Error("Pagefind UI constructor was not available.");
    }

    if (getPagefindState(controller) === "ready") {
      return;
    }

    // Pagefind mounts into the target node, so remove any placeholder skeleton
    // before the real UI is attached.
    controller.container.replaceChildren();
    delete controller.container.dataset.searchStatusBound;

    new pagefindUi({
      element: ensurePagefindSelector(controller),
      showImages: false,
      showEmptyFilters: false,
      openFilters: ["tag"],
      showSubResults: false,
      resetStyles: false,
      translations: getPagefindTranslations(controller),
    });

    setPagefindState(controller, "ready");
    bindSearchStatus(controller);
  }

  /**
   * @param {SearchController} controller
   * @returns {Promise<void>}
   */
  function ensurePagefindInitialized(controller) {
    if (getPagefindState(controller) === "ready") {
      return Promise.resolve();
    }

    if (controller.initPromise !== undefined) {
      return controller.initPromise;
    }

    controller.initPromise = initializePagefind(controller).catch((error) => {
      controller.initPromise = undefined;
      throw error;
    });

    return controller.initPromise;
  }

  /**
   * @param {SearchController} controller
   * @param {boolean} shouldMoveFocus
   * @returns {void}
   */
  function renderSearchFallback(controller, shouldMoveFocus) {
    const { unavailable, offline, retry } = getSearchMessages(controller);
    const message = globalThis.navigator.onLine === false
      ? offline
      : unavailable;
    const fallback = doc.createElement("div");
    fallback.className = "pagefind-ui__drawer";
    fallback.dataset.pagefindFallback = "";

    showPagefindError(controller, message);

    const retryButton = doc.createElement("button");
    retryButton.type = "button";
    retryButton.className = "pagefind-ui__button";
    retryButton.textContent = retry;

    if (controller.status?.id) {
      retryButton.setAttribute("aria-describedby", controller.status.id);
    }

    retryButton.addEventListener("click", () => {
      clearSearchFallback(controller);
      void startSearchInitialization(controller, isKeyboardInteraction());
    });

    fallback.append(retryButton);
    controller.container.replaceChildren(fallback);

    if (shouldMoveFocus) {
      retryButton.focus({ preventScroll: true });
    }
  }

  /**
   * @param {SearchController} controller
   * @param {boolean} shouldMoveFocus
   * @returns {Promise<void>}
   */
  function startSearchInitialization(controller, shouldMoveFocus) {
    if (getPagefindState(controller) !== "ready") {
      showPagefindPreparing(controller);
    }

    if (shouldMoveFocus) {
      focusSearchInput(controller);
    }

    return ensurePagefindInitialized(controller)
      .then(() => {
        if (shouldMoveFocus) {
          focusSearchInput(controller);
        }
      })
      .catch(() => {
        renderSearchFallback(controller, shouldMoveFocus);
      });
  }

  /**
   * @returns {ThemePreference | null}
   */
  function readStoredThemePreference() {
    try {
      const storedPreference = globalThis.localStorage.getItem(
        THEME_STORAGE_KEY,
      );

      if (
        storedPreference === "light" || storedPreference === "dark" ||
        storedPreference === "system"
      ) {
        return storedPreference;
      }

      const legacyPreference = globalThis.localStorage.getItem(
        LEGACY_THEME_STORAGE_KEY,
      );

      return legacyPreference === "light" || legacyPreference === "dark"
        ? legacyPreference
        : null;
    } catch {
      return null;
    }
  }

  /**
   * @param {ThemePreference} preference
   * @returns {void}
   */
  function persistThemePreference(preference) {
    try {
      globalThis.localStorage.setItem(THEME_STORAGE_KEY, preference);

      if (preference === "system") {
        globalThis.localStorage.removeItem(LEGACY_THEME_STORAGE_KEY);
      } else {
        globalThis.localStorage.setItem(LEGACY_THEME_STORAGE_KEY, preference);
      }
    } catch {
      // Ignore storage failures.
    }
  }

  /**
   * @param {ThemePreference} preference
   * @returns {ColorMode}
   */
  function resolveThemeMode(preference) {
    return preference === "system"
      ? (themeMediaQuery.matches ? "dark" : "light")
      : preference;
  }

  /**
   * @param {ThemePreference} preference
   * @returns {void}
   */
  function applyThemePreference(preference) {
    const mode = resolveThemeMode(preference);
    root.setAttribute("data-light-theme", "light");
    root.setAttribute("data-dark-theme", "dark");
    root.setAttribute("data-color-mode", mode);
    root.setAttribute("data-theme-preference", preference);
    root.setAttribute("data-color-scheme", mode);
  }

  /**
   * @returns {ThemePreference}
   */
  function getCurrentThemePreference() {
    const rootPreference = root.getAttribute("data-theme-preference");

    if (
      rootPreference === "light" || rootPreference === "dark" ||
      rootPreference === "system"
    ) {
      return rootPreference;
    }

    return readStoredThemePreference() ?? "system";
  }

  /**
   * @param {ThemePreference} preference
   * @returns {ThemePreference}
   */
  function getNextThemePreference(preference) {
    if (preference === "light") {
      return "dark";
    }

    if (preference === "dark") {
      return "system";
    }

    return "light";
  }

  /**
   * @param {HTMLButtonElement} button
   * @param {ThemePreference} preference
   * @returns {void}
   */
  function updateThemeToggleAccessibility(button, preference) {
    const nextPreference = getNextThemePreference(preference);
    const label = nextPreference === "light"
      ? (button.dataset.labelSwitchLight ?? "Switch to light theme")
      : nextPreference === "dark"
      ? (button.dataset.labelSwitchDark ?? "Switch to dark theme")
      : (button.dataset.labelFollowSystem ?? "Follow system theme");

    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
  }

  /**
   * @returns {void}
   */
  function setupThemeToggle() {
    const button = doc.querySelector(THEME_TOGGLE_SELECTOR);

    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    const preference = getCurrentThemePreference();
    applyThemePreference(preference);
    updateThemeToggleAccessibility(button, preference);

    themeMediaQuery.addEventListener("change", () => {
      if (getCurrentThemePreference() !== "system") {
        return;
      }

      applyThemePreference("system");
      updateThemeToggleAccessibility(button, "system");
    });
  }

  /**
   * @returns {void}
   */
  function toggleThemePreference() {
    const button = doc.querySelector(THEME_TOGGLE_SELECTOR);

    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    const nextPreference = getNextThemePreference(getCurrentThemePreference());
    applyThemePreference(nextPreference);
    persistThemePreference(nextPreference);
    updateThemeToggleAccessibility(button, nextPreference);
  }

  /**
   * @param {string} language
   * @returns {void}
   */
  function persistLanguagePreference(language) {
    try {
      globalThis.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // Ignore storage failures.
    }
  }

  /**
   * @returns {string}
   */
  function getCurrentPath() {
    return `${globalThis.location.pathname}${globalThis.location.search}`;
  }

  /**
   * @param {string} targetUrl
   * @returns {string}
   */
  function getTargetPath(targetUrl) {
    const absoluteTarget = new URL(targetUrl, globalThis.location.origin);
    return `${absoluteTarget.pathname}${absoluteTarget.search}`;
  }

  /**
   * @param {"assign" | "replace"} kind
   * @param {string} targetUrl
   * @returns {boolean}
   */
  function dispatchLanguageNavigationEvent(kind, targetUrl) {
    const navigationEvent = new CustomEvent("site:language-navigation", {
      bubbles: false,
      cancelable: true,
      detail: { kind, targetUrl },
    });

    return doc.dispatchEvent(navigationEvent);
  }

  /**
   * @param {HTMLElement} option
   * @returns {string | null}
   */
  function getLanguageOptionHref(option) {
    if (option instanceof HTMLAnchorElement) {
      return option.href;
    }

    const rawHref = option.getAttribute("href");

    if (rawHref === null || rawHref.length === 0) {
      return null;
    }

    try {
      return new URL(rawHref, globalThis.location.origin).href;
    } catch {
      return null;
    }
  }

  /**
   * @param {MouseEvent} event
   * @param {HTMLElement} option
   * @returns {void}
   */
  function handleLanguageOptionClick(event, option) {
    const language = option.dataset.languageOption;

    if (typeof language === "string" && language.length > 0) {
      persistLanguagePreference(language);
    }

    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const targetUrl = getLanguageOptionHref(option);

    if (targetUrl === null) {
      return;
    }

    event.preventDefault();

    if (getCurrentPath() === getTargetPath(targetUrl)) {
      closeCurrentDisclosure(false);

      const control = getControlForSurface(
        option.closest("[data-language-panel]") ?? doc.body,
      );

      if (control instanceof HTMLElement) {
        control.focus({ preventScroll: true });
      }

      return;
    }

    if (!dispatchLanguageNavigationEvent("assign", targetUrl)) {
      return;
    }

    globalThis.location.assign(targetUrl);
  }

  /**
   * @returns {void}
   */
  function setupGlobalListeners() {
    doc.addEventListener("pointerdown", () => {
      setInteractionModality("pointer");
    }, true);

    doc.addEventListener("mousedown", () => {
      setInteractionModality("pointer");
    }, true);

    doc.addEventListener("keydown", (event) => {
      if (!event.metaKey && !event.ctrlKey && !event.altKey) {
        setInteractionModality("keyboard");
      }
    }, true);

    doc.addEventListener("click", (event) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      const languageOption = closestElement(target, LANGUAGE_OPTION_SELECTOR);

      if (
        languageOption instanceof HTMLElement && event instanceof MouseEvent
      ) {
        handleLanguageOptionClick(event, languageOption);
        return;
      }

      const themeButton = closestElement(target, THEME_TOGGLE_SELECTOR);

      if (themeButton instanceof HTMLButtonElement) {
        closeTooltipForElement(themeButton);
        toggleThemePreference();
        return;
      }

      const control = closestElement(target, DISCLOSURE_CONTROL_SELECTOR);

      if (control instanceof HTMLElement) {
        handleDisclosureControlActivation(control);
        return;
      }

      if (
        overlay instanceof HTMLElement &&
        target instanceof Element &&
        overlay.contains(target)
      ) {
        closeCurrentDisclosure(true);
        return;
      }

      if (!(openSurface instanceof HTMLElement)) {
        return;
      }

      const insideSurface = closestElement(target, DISCLOSURE_SURFACE_SELECTOR);

      if (!(insideSurface instanceof HTMLElement)) {
        closeCurrentDisclosure(false);
      }
    });

    doc.addEventListener("keydown", (event) => {
      handleGlobalKeydown(event);
    });

    doc.addEventListener("focusin", (event) => {
      const container = closestElement(
        event.target,
        TOOLTIP_CONTAINER_SELECTOR,
      );
      openTooltip(container);

      const menu = closestElement(event.target, LANGUAGE_MENU_SELECTOR);

      if (!(menu instanceof HTMLElement)) {
        return;
      }

      const item = closestElement(event.target, LANGUAGE_OPTION_SELECTOR);

      if (!(item instanceof HTMLElement)) {
        return;
      }

      for (const candidate of getLanguageItems(menu)) {
        candidate.setAttribute("tabindex", candidate === item ? "0" : "-1");
      }
    });

    doc.addEventListener("focusout", (event) => {
      const container = closestElement(
        event.target,
        TOOLTIP_CONTAINER_SELECTOR,
      );

      if (!(container instanceof HTMLElement)) {
        return;
      }

      const nextTarget = event.relatedTarget;

      if (nextTarget instanceof Node && container.contains(nextTarget)) {
        return;
      }

      closeTooltip(container);
    });

    doc.addEventListener("pointerover", (event) => {
      const container = closestElement(
        event.target,
        TOOLTIP_CONTAINER_SELECTOR,
      );

      if (!(container instanceof HTMLElement)) {
        return;
      }

      const previousTarget = event.relatedTarget;

      if (
        previousTarget instanceof Node && container.contains(previousTarget)
      ) {
        return;
      }

      openTooltip(container);
    });

    doc.addEventListener("pointerout", (event) => {
      const container = closestElement(
        event.target,
        TOOLTIP_CONTAINER_SELECTOR,
      );

      if (!(container instanceof HTMLElement)) {
        return;
      }

      const nextTarget = event.relatedTarget;

      if (nextTarget instanceof Node && container.contains(nextTarget)) {
        return;
      }

      closeTooltip(container);
    });
  }

  /**
   * @param {KeyboardEvent} event
   * @returns {void}
   */
  function handleGlobalKeydown(event) {
    const target = event.target instanceof HTMLElement ? event.target : null;
    const languagePanel = isLanguagePanel(openSurface) ? openSurface : null;
    const menu = languagePanel instanceof HTMLElement
      ? queryElement(LANGUAGE_MENU_SELECTOR, languagePanel)
      : null;
    const isFocusInLanguageMenu = menu instanceof HTMLElement &&
      target instanceof HTMLElement &&
      menu.contains(target);

    if (event.key === "Escape") {
      closeAllTooltips();

      if (closeCurrentDisclosure(true)) {
        event.preventDefault();
      }
      return;
    }

    const sideNavSurface = isSideNav(openSurface) ? openSurface : null;

    if (event.key === "Tab" && sideNavSurface instanceof HTMLElement) {
      trapFocus(event, sideNavSurface);
      return;
    }

    if (
      isLanguagePanel(openSurface) &&
      (event.key === "ArrowDown" || event.key === "ArrowUp" ||
        event.key === "Home" || event.key === "End")
    ) {
      if (!isFocusInLanguageMenu) {
        event.preventDefault();

        if (event.key === "ArrowUp" || event.key === "End") {
          focusLanguageMenuFromTrigger("last");
        } else {
          focusLanguageMenuFromTrigger(
            event.key === "Home" ? "first" : "selected",
          );
        }
        return;
      }
    }

    if (!(menu instanceof HTMLElement) || !(target instanceof HTMLElement)) {
      return;
    }

    if (!target.matches(LANGUAGE_OPTION_SELECTOR)) {
      return;
    }

    const items = getLanguageItems(menu);
    const currentIndex = items.indexOf(target);

    if (currentIndex === -1) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusLanguageItem(menu, currentIndex + 1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusLanguageItem(menu, currentIndex - 1);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      focusLanguageItem(menu, 0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      focusLanguageItem(menu, items.length - 1);
      return;
    }

    if (event.key === " " || event.key === "Spacebar") {
      event.preventDefault();
      target.click();
    }
  }
})();

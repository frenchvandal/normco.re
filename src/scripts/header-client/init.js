// @ts-check

import { createHeaderSearch } from "./search.js";
import { createThemeController } from "./theme.js";

const DEFERRED_FOCUS_DELAY_MS = 16;
const DISCLOSURE_CONTROL_SELECTOR =
  ".site-header__action[aria-controls], .site-header__menu-toggle";
const DISCLOSURE_SURFACE_SELECTOR = ".site-header__panel, .site-side-nav";
const FOCUSABLE_SELECTOR =
  "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";
const LANGUAGE_MENU_SELECTOR = "[data-language-menu]";
const LANGUAGE_OPTION_SELECTOR = '[data-language-option][role="menuitemradio"]';
const OVERLAY_SELECTOR = ".site-side-nav__overlay";
const SIDE_NAV_CLOSE_SELECTOR = "[data-side-nav-close]";
const SIDE_NAV_LINK_SELECTOR = "a.site-side-nav__link";
const THEME_TOGGLE_SELECTOR = "#theme-toggle";
const TOOLTIP_CONTAINER_SELECTOR = "[data-header-tooltip]";
const TOOLTIP_TRIGGER_SELECTOR = "[data-header-tooltip-trigger]";
const LANGUAGE_STORAGE_KEY = "preferred-language";
const MOBILE_PANEL_MEDIA_QUERY = "(max-width: 47.999rem)";

/**
 * @typedef {"keyboard" | "pointer"} InteractionModality
 */

/**
 * @param {Window & typeof globalThis} runtime
 * @returns {void}
 */
export function bindHeaderClient(runtime) {
  const resolvedRuntime = runtime ??
    /** @type {Window & typeof globalThis} */ (globalThis);
  const doc = resolvedRuntime.document;
  const root = doc?.documentElement;

  if (!(root instanceof resolvedRuntime.HTMLElement)) {
    return;
  }

  if (root.dataset.headerClientBound === "true") {
    return;
  }

  root.dataset.headerClientBound = "true";

  /**
   * @param {string} selector
   * @param {ParentNode} [scope]
   * @returns {HTMLElement | null}
   */
  function queryElement(selector, scope = doc) {
    const element = scope.querySelector(selector);
    return element instanceof resolvedRuntime.HTMLElement ? element : null;
  }

  const disclosureControls = Array.from(
    doc.querySelectorAll(DISCLOSURE_CONTROL_SELECTOR),
  ).filter((candidate) => candidate instanceof resolvedRuntime.HTMLElement);
  const overlay = queryElement(OVERLAY_SELECTOR);
  const mobilePanels = typeof resolvedRuntime.matchMedia === "function"
    ? resolvedRuntime.matchMedia(MOBILE_PANEL_MEDIA_QUERY)
    : null;
  const surfaceByControl = new Map();
  const controlBySurfaceId = new Map();

  for (const control of disclosureControls) {
    const surface = getLinkedSurface(control);

    if (!(surface instanceof resolvedRuntime.HTMLElement)) {
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

  const theme = createThemeController(resolvedRuntime, root, {
    themeToggleSelector: THEME_TOGGLE_SELECTOR,
  });
  const search = createHeaderSearch(
    resolvedRuntime,
    root,
    isKeyboardInteraction,
  );

  syncInitialDisclosureState();
  syncOverlayVisibility();
  syncBodyScrollLock();
  theme.setup();
  setupGlobalListeners();

  if (search.isSearchPanel(openSurface)) {
    void search.initializeForOpen(isKeyboardInteraction());
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
    return surface instanceof resolvedRuntime.HTMLElement ? surface : null;
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
    return control instanceof resolvedRuntime.HTMLElement ? control : null;
  }

  /**
   * @param {EventTarget | null} node
   * @param {string} selector
   * @returns {HTMLElement | null}
   */
  function closestElement(node, selector) {
    if (!(node instanceof resolvedRuntime.Element)) {
      return null;
    }

    const match = node.closest(selector);
    return match instanceof resolvedRuntime.HTMLElement ? match : null;
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
    return surface instanceof resolvedRuntime.HTMLElement &&
      surface.matches("[data-language-panel]");
  }

  /**
   * @param {HTMLElement | null} surface
   * @returns {boolean}
   */
  function isSideNav(surface) {
    return surface instanceof resolvedRuntime.HTMLElement &&
      surface.matches(".site-side-nav");
  }

  /**
   * @returns {boolean}
   */
  function isMobilePanelViewport() {
    return mobilePanels?.matches ?? false;
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
    if (lastTrigger instanceof resolvedRuntime.HTMLElement) {
      lastTrigger.focus({ preventScroll: true });
    }

    clearRememberedTrigger();
  }

  /**
   * @returns {void}
   */
  function syncOverlayVisibility() {
    if (!(overlay instanceof resolvedRuntime.HTMLElement)) {
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
    doc.body.style.overflow =
      isSideNav(openSurface) || search.isSearchPanel(openSurface) ||
        (isLanguagePanel(openSurface) && isMobilePanelViewport())
        ? "hidden"
        : "";
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

      if (!(surface instanceof resolvedRuntime.HTMLElement)) {
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

      if (
        !(target instanceof resolvedRuntime.HTMLElement) || !target.isConnected
      ) {
        return;
      }

      target.focus({ preventScroll: true });
    };

    if (typeof resolvedRuntime.requestAnimationFrame === "function") {
      resolvedRuntime.requestAnimationFrame(() => {
        resolvedRuntime.requestAnimationFrame(focusWhenReady);
      });
      return;
    }

    resolvedRuntime.setTimeout(focusWhenReady, DEFERRED_FOCUS_DELAY_MS);
  }

  /**
   * @param {HTMLElement} container
   * @returns {HTMLElement[]}
   */
  function getFocusableElements(container) {
    /** @type {HTMLElement[]} */
    const focusable = [];

    for (const candidate of container.querySelectorAll(FOCUSABLE_SELECTOR)) {
      if (
        candidate instanceof resolvedRuntime.HTMLElement && !isHidden(candidate)
      ) {
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
      !(first instanceof resolvedRuntime.HTMLElement) ||
      !(last instanceof resolvedRuntime.HTMLElement)
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
   * @param {HTMLElement} menu
   * @returns {HTMLElement[]}
   */
  function getLanguageItems(menu) {
    return Array.from(menu.querySelectorAll(LANGUAGE_OPTION_SELECTOR))
      .filter((candidate) => candidate instanceof resolvedRuntime.HTMLElement);
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

    if (!(menu instanceof resolvedRuntime.HTMLElement)) {
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

      if (selected instanceof resolvedRuntime.HTMLElement) {
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
    if (!(openSurface instanceof resolvedRuntime.HTMLElement)) {
      if (restoreFocus) {
        restoreRememberedTriggerFocus();
      }
      return false;
    }

    const surface = openSurface;
    const control = openControl ?? getControlForSurface(surface);

    if (control instanceof resolvedRuntime.HTMLElement) {
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
    if (
      openSurface instanceof resolvedRuntime.HTMLElement &&
      openSurface !== surface
    ) {
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

    if (search.isSearchPanel(surface)) {
      void search.initializeForOpen(isKeyboardInteraction());
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

    if (!(surface instanceof resolvedRuntime.HTMLElement)) {
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
    if (!(container instanceof resolvedRuntime.HTMLElement)) {
      return;
    }

    const trigger = queryElement(TOOLTIP_TRIGGER_SELECTOR, container);

    if (
      !(trigger instanceof resolvedRuntime.HTMLButtonElement) ||
      trigger.getAttribute("aria-expanded") === "true"
    ) {
      return;
    }

    container.classList.add("site-popover--open");
  }

  /**
   * @param {HTMLElement | null} container
   * @returns {void}
   */
  function closeTooltip(container) {
    if (!(container instanceof resolvedRuntime.HTMLElement)) {
      return;
    }

    container.classList.remove("site-popover--open");
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
      if (container instanceof resolvedRuntime.HTMLElement) {
        closeTooltip(container);
      }
    }
  }

  /**
   * @param {string} language
   * @returns {void}
   */
  function persistLanguagePreference(language) {
    try {
      resolvedRuntime.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // Ignore storage failures.
    }
  }

  /**
   * @returns {string}
   */
  function getCurrentPath() {
    return `${resolvedRuntime.location.pathname}${resolvedRuntime.location.search}`;
  }

  /**
   * @param {string} targetUrl
   * @returns {string}
   */
  function getTargetPath(targetUrl) {
    const absoluteTarget = new URL(targetUrl, resolvedRuntime.location.origin);
    return `${absoluteTarget.pathname}${absoluteTarget.search}`;
  }

  /**
   * @param {"assign" | "replace"} kind
   * @param {string} targetUrl
   * @returns {boolean}
   */
  function dispatchLanguageNavigationEvent(kind, targetUrl) {
    const navigationEvent = new resolvedRuntime.CustomEvent(
      "site:language-navigation",
      {
        bubbles: false,
        cancelable: true,
        detail: { kind, targetUrl },
      },
    );

    return doc.dispatchEvent(navigationEvent);
  }

  /**
   * @param {HTMLElement} option
   * @returns {string | null}
   */
  function getLanguageOptionHref(option) {
    if (option instanceof resolvedRuntime.HTMLAnchorElement) {
      return option.href;
    }

    const rawHref = option.getAttribute("href");

    if (rawHref === null || rawHref.length === 0) {
      return null;
    }

    try {
      return new URL(rawHref, resolvedRuntime.location.origin).href;
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

      if (control instanceof resolvedRuntime.HTMLElement) {
        control.focus({ preventScroll: true });
      }

      return;
    }

    if (!dispatchLanguageNavigationEvent("assign", targetUrl)) {
      return;
    }

    resolvedRuntime.location.assign(targetUrl);
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

      if (!(target instanceof resolvedRuntime.Node)) {
        return;
      }

      const languageOption = closestElement(target, LANGUAGE_OPTION_SELECTOR);

      if (
        languageOption instanceof resolvedRuntime.HTMLElement &&
        event instanceof resolvedRuntime.MouseEvent
      ) {
        handleLanguageOptionClick(event, languageOption);
        return;
      }

      const sideNavClose = closestElement(target, SIDE_NAV_CLOSE_SELECTOR);

      if (sideNavClose instanceof resolvedRuntime.HTMLElement) {
        closeCurrentDisclosure(true);
        return;
      }

      const themeButton = closestElement(target, THEME_TOGGLE_SELECTOR);

      if (themeButton instanceof resolvedRuntime.HTMLButtonElement) {
        closeTooltipForElement(themeButton);
        theme.toggle();
        return;
      }

      const control = closestElement(target, DISCLOSURE_CONTROL_SELECTOR);

      if (control instanceof resolvedRuntime.HTMLElement) {
        handleDisclosureControlActivation(control);
        return;
      }

      if (
        overlay instanceof resolvedRuntime.HTMLElement &&
        target instanceof resolvedRuntime.Element &&
        overlay.contains(target)
      ) {
        closeCurrentDisclosure(true);
        return;
      }

      if (!(openSurface instanceof resolvedRuntime.HTMLElement)) {
        return;
      }

      const insideSurface = closestElement(target, DISCLOSURE_SURFACE_SELECTOR);

      if (!(insideSurface instanceof resolvedRuntime.HTMLElement)) {
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

      if (!(menu instanceof resolvedRuntime.HTMLElement)) {
        return;
      }

      const item = closestElement(event.target, LANGUAGE_OPTION_SELECTOR);

      if (!(item instanceof resolvedRuntime.HTMLElement)) {
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

      if (!(container instanceof resolvedRuntime.HTMLElement)) {
        return;
      }

      const nextTarget = event.relatedTarget;

      if (
        nextTarget instanceof resolvedRuntime.Node &&
        container.contains(nextTarget)
      ) {
        return;
      }

      closeTooltip(container);
    });

    doc.addEventListener("pointerover", (event) => {
      const container = closestElement(
        event.target,
        TOOLTIP_CONTAINER_SELECTOR,
      );

      if (!(container instanceof resolvedRuntime.HTMLElement)) {
        return;
      }

      const previousTarget = event.relatedTarget;

      if (
        previousTarget instanceof resolvedRuntime.Node &&
        container.contains(previousTarget)
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

      if (!(container instanceof resolvedRuntime.HTMLElement)) {
        return;
      }

      const nextTarget = event.relatedTarget;

      if (
        nextTarget instanceof resolvedRuntime.Node &&
        container.contains(nextTarget)
      ) {
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
    const target = event.target instanceof resolvedRuntime.HTMLElement
      ? event.target
      : null;
    const languagePanel = isLanguagePanel(openSurface) ? openSurface : null;
    const menu = languagePanel instanceof resolvedRuntime.HTMLElement
      ? queryElement(LANGUAGE_MENU_SELECTOR, languagePanel)
      : null;
    const isFocusInLanguageMenu = menu instanceof resolvedRuntime.HTMLElement &&
      target instanceof resolvedRuntime.HTMLElement &&
      menu.contains(target);

    if (event.key === "Escape") {
      closeAllTooltips();

      if (closeCurrentDisclosure(true)) {
        event.preventDefault();
      }
      return;
    }

    const sideNavSurface = isSideNav(openSurface) ? openSurface : null;

    if (
      event.key === "Tab" &&
      sideNavSurface instanceof resolvedRuntime.HTMLElement
    ) {
      trapFocus(event, sideNavSurface);
      return;
    }

    if (
      event.key === "Tab" &&
      isLanguagePanel(openSurface) &&
      openSurface instanceof resolvedRuntime.HTMLElement &&
      isMobilePanelViewport()
    ) {
      trapFocus(event, openSurface);
      return;
    }

    if (search.handleGlobalKeydown(event, openSurface)) {
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

    if (
      !(menu instanceof resolvedRuntime.HTMLElement) ||
      !(target instanceof resolvedRuntime.HTMLElement)
    ) {
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
}

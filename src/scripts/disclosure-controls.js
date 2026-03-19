// @ts-check
(() => {
  const DEFERRED_FOCUS_DELAY_MS = 16;
  const FOCUSABLE_SELECTOR =
    "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";
  const CONTROL_SELECTOR =
    ".cds--header__action[aria-controls], .cds--header__menu-toggle";
  const LANGUAGE_PANEL_SELECTOR = "[data-language-panel]:not([hidden])";
  const LANGUAGE_MENU_SELECTOR = "[data-language-menu]";
  const LANGUAGE_OPTION_SELECTOR =
    '[data-language-option][role="menuitemradio"]';
  const HEADER_PANEL_SELECTOR = ".cds--header__panel:not([hidden])";
  const SIDE_NAV_SELECTOR = ".cds--side-nav:not([hidden])";
  const SIDE_NAV_LINK_SELECTOR = "a.cds--side-nav__link";
  const OVERLAY_SELECTOR = ".cds--side-nav__overlay";
  const DISCLOSURE_SURFACE_SELECTOR = ".cds--header__panel, .cds--side-nav";
  const TOGGLE_BUTTON_SELECTOR =
    ".cds--header__menu-toggle, .cds--header__language-toggle, .cds--header__action[aria-controls]";

  /**
   * @typedef {"keyboard" | "pointer"} InteractionModality
   */

  const controls = Array.from(
    globalThis.document.querySelectorAll(CONTROL_SELECTOR),
  ).filter((element) => element instanceof HTMLElement);

  if (controls.length === 0) {
    return;
  }

  /** @type {{ lastTrigger: HTMLElement | null; lastInteractionModality: InteractionModality }} */
  const state = {
    lastTrigger: null,
    lastInteractionModality: "pointer",
  };

  globalThis.document.documentElement.dataset.interactionModality =
    state.lastInteractionModality;

  let hasBoundDisclosureControls = false;

  /**
   * @param {InteractionModality} modality
   * @returns {void}
   */
  function setInteractionModality(modality) {
    state.lastInteractionModality = modality;
    globalThis.document.documentElement.dataset.interactionModality = modality;
  }

  /**
   * @param {HTMLElement | null} trigger
   * @returns {void}
   */
  function rememberTrigger(trigger) {
    state.lastTrigger = trigger;
  }

  /**
   * @returns {void}
   */
  function restoreRememberedTriggerFocus() {
    if (state.lastTrigger instanceof HTMLElement) {
      state.lastTrigger.focus({ preventScroll: true });
      state.lastTrigger = null;
    }
  }

  /**
   * @returns {boolean}
   */
  function isKeyboardInteraction() {
    return state.lastInteractionModality === "keyboard";
  }

  /**
   * @param {HTMLElement} control
   * @returns {string | null}
   */
  function getLinkedPanelId(control) {
    if (
      control.matches(
        ".cds--header__action[aria-controls], .cds--header__menu-toggle",
      )
    ) {
      return control.getAttribute("aria-controls");
    }

    return null;
  }

  /**
   * @param {HTMLElement} control
   * @returns {HTMLElement | null}
   */
  function getLinkedPanel(control) {
    const panelId = getLinkedPanelId(control);

    if (panelId === null) {
      return null;
    }

    const panel = globalThis.document.getElementById(panelId);
    return panel instanceof HTMLElement ? panel : null;
  }

  /**
   * @returns {HTMLElement | null}
   */
  function getOverlay() {
    const overlay = globalThis.document.querySelector(OVERLAY_SELECTOR);
    return overlay instanceof HTMLElement ? overlay : null;
  }

  /**
   * @returns {HTMLElement | null}
   */
  function getOpenLanguagePanel() {
    const panel = globalThis.document.querySelector(LANGUAGE_PANEL_SELECTOR);
    return panel instanceof HTMLElement ? panel : null;
  }

  /**
   * @returns {HTMLElement | null}
   */
  function getOpenSideNav() {
    const sideNav = globalThis.document.querySelector(SIDE_NAV_SELECTOR);
    return sideNav instanceof HTMLElement ? sideNav : null;
  }

  /**
   * @param {HTMLElement} control
   * @param {boolean} expanded
   * @returns {void}
   */
  function setControlExpanded(control, expanded) {
    control.setAttribute("aria-expanded", String(expanded));
  }

  /**
   * @param {HTMLElement} surface
   * @param {boolean} expanded
   * @returns {void}
   */
  function setSurfaceExpanded(surface, expanded) {
    if (expanded) {
      surface.removeAttribute("hidden");
      surface.setAttribute("expanded", "");
      return;
    }

    surface.setAttribute("hidden", "");
    surface.removeAttribute("expanded");
  }

  /**
   * @param {boolean} visible
   * @returns {void}
   */
  function setOverlayVisible(visible) {
    const overlay = getOverlay();

    if (overlay instanceof HTMLElement) {
      overlay.setAttribute("aria-hidden", visible ? "false" : "true");
    }
  }

  /**
   * Traps Tab focus within a container element.
   * @param {KeyboardEvent} event
   * @param {HTMLElement} container
   */
  function trapFocus(event, container) {
    if (event.key !== "Tab") {
      return;
    }

    const focusable = Array.from(
      container.querySelectorAll(FOCUSABLE_SELECTOR),
    ).filter((element) =>
      element instanceof HTMLElement && element.offsetParent !== null
    );

    if (focusable.length === 0) {
      return;
    }

    const first = /** @type {HTMLElement} */ (focusable[0]);
    const last = /** @type {HTMLElement} */ (focusable[focusable.length - 1]);

    if (event.shiftKey) {
      if (globalThis.document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
      return;
    }

    if (globalThis.document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /**
   * @param {HTMLElement} menu
   * @returns {HTMLElement[]}
   */
  function getMenuItems(menu) {
    return Array.from(
      menu.querySelectorAll(LANGUAGE_OPTION_SELECTOR),
    ).filter((item) => item instanceof HTMLElement);
  }

  /**
   * @param {HTMLElement} menu
   * @param {number} nextIndex
   * @returns {void}
   */
  function focusMenuItem(menu, nextIndex) {
    const items = getMenuItems(menu);

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
   * @param {HTMLElement} panel
   * @param {"first" | "last" | "selected"} strategy
   * @returns {boolean}
   */
  function focusLanguageMenuFromTrigger(panel, strategy) {
    const menu = panel.querySelector(LANGUAGE_MENU_SELECTOR);

    if (!(menu instanceof HTMLElement)) {
      return false;
    }

    const items = getMenuItems(menu);

    if (items.length === 0) {
      return false;
    }

    if (strategy === "first") {
      focusMenuItem(menu, 0);
      return true;
    }

    if (strategy === "last") {
      focusMenuItem(menu, items.length - 1);
      return true;
    }

    const selectedIndex = items.findIndex((item) =>
      item.getAttribute("aria-checked") === "true" ||
      item.getAttribute("aria-current") === "page"
    );

    focusMenuItem(menu, selectedIndex >= 0 ? selectedIndex : 0);
    return true;
  }

  /**
   * Delays focus until Carbon surfaces finish opening, but only if the
   * container still exists and remains visible when the timer fires.
   * @param {HTMLElement} container
   * @param {() => Element | null} resolveTarget
   * @returns {void}
   */
  function scheduleDeferredFocus(container, resolveTarget) {
    const focusWhenReady = () => {
      if (!container.isConnected || container.hasAttribute("hidden")) {
        return;
      }

      const target = resolveTarget();

      if (!(target instanceof HTMLElement) || !target.isConnected) {
        return;
      }

      target.focus({ preventScroll: true });
    };
    const requestFrame = globalThis.requestAnimationFrame;

    if (typeof requestFrame === "function") {
      requestFrame(() => requestFrame(focusWhenReady));
      return;
    }

    globalThis.setTimeout(focusWhenReady, DEFERRED_FOCUS_DELAY_MS);
  }

  /**
   * @param {HTMLElement} panel
   * @returns {Element | null}
   */
  function resolvePanelInitialFocusTarget(panel) {
    const preferredFocusable = panel.querySelector(
      '[role="menuitemradio"][aria-checked="true"], [aria-current="page"]',
    );

    if (preferredFocusable instanceof HTMLElement) {
      return preferredFocusable;
    }

    return panel.querySelector(FOCUSABLE_SELECTOR);
  }

  /**
   * @param {HTMLElement} surface
   * @returns {boolean}
   */
  function isSideNavSurface(surface) {
    return surface.matches(".cds--side-nav");
  }

  /**
   * @param {HTMLElement} surface
   * @returns {Element | null}
   */
  function resolveSurfaceInitialFocusTarget(surface) {
    if (isSideNavSurface(surface)) {
      return surface.querySelector(SIDE_NAV_LINK_SELECTOR);
    }

    return resolvePanelInitialFocusTarget(surface);
  }

  /** Locks body scroll to prevent background scrolling when panels are open. */
  function lockScroll() {
    globalThis.document.body.style.overflow = "hidden";
  }

  /** Unlocks body scroll. */
  function unlockScroll() {
    globalThis.document.body.style.overflow = "";
  }

  /** Applies body scroll locking only while the SideNav is open. */
  function syncBodyScrollLock() {
    if (getOpenSideNav() instanceof HTMLElement) {
      lockScroll();
      return;
    }

    unlockScroll();
  }

  /**
   * @param {HTMLElement} button
   * @param {HTMLElement} surface
   * @returns {void}
   */
  function openDisclosureSurface(button, surface) {
    rememberTrigger(button);
    setControlExpanded(button, true);
    setSurfaceExpanded(surface, true);

    if (isSideNavSurface(surface)) {
      setOverlayVisible(true);
      syncBodyScrollLock();
    }

    if (isKeyboardInteraction()) {
      scheduleDeferredFocus(
        surface,
        () => resolveSurfaceInitialFocusTarget(surface),
      );
    }
  }

  /**
   * @param {HTMLElement} button
   * @param {HTMLElement} surface
   * @returns {void}
   */
  function closeDisclosureSurface(button, surface) {
    setControlExpanded(button, false);
    setSurfaceExpanded(surface, false);

    if (isSideNavSurface(surface)) {
      setOverlayVisible(false);
      syncBodyScrollLock();
    }

    button.focus({ preventScroll: true });
    rememberTrigger(null);
  }

  /**
   * @param {string | null} preservedPanelId
   * @returns {boolean}
   */
  function closeOpenHeaderPanels(preservedPanelId) {
    let closed = false;

    for (
      const panel of globalThis.document.querySelectorAll(HEADER_PANEL_SELECTOR)
    ) {
      if (!(panel instanceof HTMLElement)) {
        continue;
      }

      if (preservedPanelId !== null && panel.id === preservedPanelId) {
        continue;
      }

      setSurfaceExpanded(panel, false);
      closed = true;
    }

    return closed;
  }

  /**
   * @param {boolean} preserveSideNav
   * @returns {boolean}
   */
  function closeOpenSideNavs(preserveSideNav) {
    let closed = false;

    for (
      const sideNav of globalThis.document.querySelectorAll(SIDE_NAV_SELECTOR)
    ) {
      if (!(sideNav instanceof HTMLElement) || preserveSideNav) {
        continue;
      }

      setSurfaceExpanded(sideNav, false);
      closed = true;
    }

    if (!preserveSideNav) {
      setOverlayVisible(false);
    }

    return closed;
  }

  /**
   * @param {{
   *   readonly exceptControl?: HTMLElement | null;
   *   readonly restoreFocus?: boolean;
   * }} [options]
   * @returns {boolean}
   */
  function closeCarbonChrome(options = {}) {
    const exceptControl = options.exceptControl ?? null;
    const restoreFocus = options.restoreFocus ?? false;
    const preservedPanelId = exceptControl === null
      ? null
      : getLinkedPanelId(exceptControl);
    const preserveSideNav = exceptControl !== null &&
      exceptControl.matches(".cds--header__menu-toggle") &&
      exceptControl.getAttribute("aria-expanded") === "true";
    let closed = false;

    for (const control of controls) {
      if (control === exceptControl) {
        continue;
      }

      if (control.getAttribute("aria-expanded") === "true") {
        setControlExpanded(control, false);
        closed = true;
      }

      const linkedPanel = getLinkedPanel(control);

      if (!(linkedPanel instanceof HTMLElement)) {
        continue;
      }

      if (preservedPanelId !== null && linkedPanel.id === preservedPanelId) {
        continue;
      }

      if (
        linkedPanel.hasAttribute("expanded") ||
        !linkedPanel.hasAttribute("hidden")
      ) {
        setSurfaceExpanded(linkedPanel, false);
        closed = true;
      }
    }

    if (closeOpenHeaderPanels(preservedPanelId)) {
      closed = true;
    }

    if (closeOpenSideNavs(preserveSideNav)) {
      closed = true;
    }

    syncBodyScrollLock();

    if (restoreFocus) {
      restoreRememberedTriggerFocus();
    }

    return closed;
  }

  /**
   * @param {KeyboardEvent} event
   * @returns {void}
   */
  function handleGlobalKeydown(event) {
    const openLanguagePanel = getOpenLanguagePanel();

    if (
      openLanguagePanel instanceof HTMLElement &&
      (event.key === "ArrowDown" || event.key === "ArrowUp" ||
        event.key === "Home" || event.key === "End")
    ) {
      const menu = openLanguagePanel.querySelector(LANGUAGE_MENU_SELECTOR);
      const activeElement = globalThis.document.activeElement;
      const focusIsInLanguageMenu = menu instanceof HTMLElement &&
        activeElement instanceof HTMLElement &&
        menu.contains(activeElement);

      if (!focusIsInLanguageMenu) {
        event.preventDefault();

        if (event.key === "ArrowUp" || event.key === "End") {
          focusLanguageMenuFromTrigger(openLanguagePanel, "last");
        } else {
          focusLanguageMenuFromTrigger(
            openLanguagePanel,
            event.key === "Home" ? "first" : "selected",
          );
        }

        return;
      }
    }

    if (event.key === "Escape") {
      if (closeCarbonChrome({ restoreFocus: true })) {
        event.preventDefault();
      }
      return;
    }

    if (event.key === "Tab") {
      const openSideNav = getOpenSideNav();

      if (openSideNav instanceof HTMLElement) {
        trapFocus(event, openSideNav);
      }
    }
  }

  /**
   * @param {HTMLElement} button
   * @param {HTMLElement} panel
   * @returns {void}
   */
  function bindPanelTriggerKeyboard(button, panel) {
    button.addEventListener("keydown", (event) => {
      const isExpanded = button.getAttribute("aria-expanded") === "true";

      if (event.key === "ArrowDown") {
        if (isExpanded) {
          event.preventDefault();
          focusLanguageMenuFromTrigger(panel, "selected");
        }
        return;
      }

      if (event.key === "ArrowUp" && isExpanded) {
        event.preventDefault();
        focusLanguageMenuFromTrigger(panel, "last");
      }
    });
  }

  /**
   * @param {HTMLElement | null} button
   * @param {HTMLElement | null} panel
   * @returns {void}
   */
  function setupMenuKeyboardNavigation(panel) {
    if (!(panel instanceof HTMLElement)) {
      return;
    }

    const menu = panel.querySelector(LANGUAGE_MENU_SELECTOR);

    if (
      !(menu instanceof HTMLElement) || menu.dataset.keyboardBound === "true"
    ) {
      return;
    }

    menu.dataset.keyboardBound = "true";

    menu.addEventListener("focusin", (event) => {
      const target = event.target;

      if (
        !(target instanceof HTMLElement) ||
        !target.matches("[data-language-option]")
      ) {
        return;
      }

      for (const item of getMenuItems(menu)) {
        item.setAttribute("tabindex", item === target ? "0" : "-1");
      }
    });

    menu.addEventListener("keydown", (event) => {
      const target = event.target;

      if (
        !(target instanceof HTMLElement) ||
        !target.matches("[data-language-option]")
      ) {
        return;
      }

      const items = getMenuItems(menu);
      const currentIndex = items.indexOf(target);

      if (currentIndex === -1) {
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        focusMenuItem(menu, currentIndex + 1);
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        focusMenuItem(menu, currentIndex - 1);
        return;
      }

      if (event.key === "Home") {
        event.preventDefault();
        focusMenuItem(menu, 0);
        return;
      }

      if (event.key === "End") {
        event.preventDefault();
        focusMenuItem(menu, items.length - 1);
        return;
      }

      if (event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        target.click();
      }
    });
  }

  /**
   * @param {HTMLElement | null} button
   * @param {HTMLElement | null} surface
   * @returns {void}
   */
  function setupDisclosureToggle(button, surface) {
    if (!(button instanceof HTMLElement) || !(surface instanceof HTMLElement)) {
      return;
    }

    if (surface.matches("[data-language-panel]")) {
      bindPanelTriggerKeyboard(button, surface);
      setupMenuKeyboardNavigation(surface);
    }

    button.addEventListener("click", () => {
      const isExpanded = button.getAttribute("aria-expanded") === "true";
      closeCarbonChrome({ exceptControl: button });

      if (isExpanded) {
        closeDisclosureSurface(button, surface);
        return;
      }

      openDisclosureSurface(button, surface);
    });
  }

  /**
   * @param {HTMLElement | null} overlay
   * @returns {void}
   */
  function setupOverlayDismiss(overlay) {
    if (!(overlay instanceof HTMLElement)) {
      return;
    }

    overlay.addEventListener("click", () => {
      closeCarbonChrome({ restoreFocus: true });
    });
  }

  /**
   * @returns {void}
   */
  function setupOutsideDismiss() {
    globalThis.document.addEventListener("click", (event) => {
      const target = event.target;

      if (!(target instanceof HTMLElement)) {
        return;
      }

      const isInsidePanel = target.closest(DISCLOSURE_SURFACE_SELECTOR);
      const isToggleButton = target.closest(TOGGLE_BUTTON_SELECTOR);

      if (!isInsidePanel && !isToggleButton) {
        closeCarbonChrome();
      }
    });
  }

  /** Track whether the last interaction came from a pointer or keyboard. */
  function setupInteractionModalityTracking() {
    globalThis.document.addEventListener("pointerdown", () => {
      setInteractionModality("pointer");
    }, true);

    globalThis.document.addEventListener("mousedown", () => {
      setInteractionModality("pointer");
    }, true);

    globalThis.document.addEventListener("keydown", (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      setInteractionModality("keyboard");
    }, true);
  }

  /**
   * Wire the native header disclosures (navigation, search, language)
   * and their associated dismissal / focus behavior.
   */
  function setupDisclosureControls() {
    if (hasBoundDisclosureControls) {
      return;
    }

    hasBoundDisclosureControls = true;

    const overlay = getOverlay();

    for (const control of controls) {
      setupDisclosureToggle(control, getLinkedPanel(control));
    }

    setupOverlayDismiss(overlay);
    setupOutsideDismiss();
  }

  setupInteractionModalityTracking();
  globalThis.document.addEventListener("keydown", handleGlobalKeydown);

  if (globalThis.document.readyState === "loading") {
    globalThis.document.addEventListener(
      "DOMContentLoaded",
      setupDisclosureControls,
    );
  } else {
    setupDisclosureControls();
  }
})();

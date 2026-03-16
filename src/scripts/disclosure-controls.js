// @ts-check
(() => {
  const FOCUSABLE_SELECTOR =
    "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

  const controls = Array.from(
    globalThis.document.querySelectorAll(
      "cds-header-global-action[panel-id], cds-header-menu-button, .cds--header__language-toggle, .cds--header__menu-toggle, .cds--header__action[aria-controls]",
    ),
  ).filter((element) => element instanceof HTMLElement);

  if (controls.length === 0) {
    return;
  }

  /** @type {HTMLElement | null} */
  let lastTrigger = null;
  let lastInteractionModality = "pointer";

  globalThis.document.addEventListener("pointerdown", () => {
    lastInteractionModality = "pointer";
  }, true);

  globalThis.document.addEventListener("mousedown", () => {
    lastInteractionModality = "pointer";
  }, true);

  globalThis.document.addEventListener("keydown", (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }

    lastInteractionModality = "keyboard";
  }, true);

  /**
   * @param {HTMLElement} control
   * @returns {string | null}
   */
  function getLinkedPanelId(control) {
    if (
      control.matches(
        ".cds--header__language-toggle, .cds--header__action[aria-controls]",
      )
    ) {
      return control.getAttribute("aria-controls");
    }
    if (control.matches(".cds--header__menu-toggle")) {
      return control.getAttribute("aria-controls");
    }
    if (!control.matches("cds-header-global-action[panel-id]")) {
      return null;
    }
    return control.getAttribute("panel-id");
  }

  /**
   * Traps Tab focus within a container element.
   * @param {KeyboardEvent} event
   * @param {HTMLElement} container
   */
  function trapFocus(event, container) {
    if (event.key !== "Tab") return;

    const focusable = Array.from(
      container.querySelectorAll(FOCUSABLE_SELECTOR),
    ).filter(
      (el) => el instanceof HTMLElement && el.offsetParent !== null,
    );

    if (focusable.length === 0) return;

    const first = /** @type {HTMLElement} */ (focusable[0]);
    const last = /** @type {HTMLElement} */ (focusable[focusable.length - 1]);

    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  /**
   * @param {HTMLElement} menu
   * @returns {HTMLElement[]}
   */
  function getMenuItems(menu) {
    return Array.from(
      menu.querySelectorAll('[data-language-option][role="menuitemradio"]'),
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
   * @returns {HTMLElement | null}
   */
  function getOpenLanguagePanel() {
    const panel = document.querySelector(
      "[data-language-panel]:not([hidden])",
    );
    return panel instanceof HTMLElement ? panel : null;
  }

  /**
   * @param {HTMLElement} panel
   * @param {"first" | "last" | "selected"} strategy
   * @returns {boolean}
   */
  function focusLanguageMenuFromTrigger(panel, strategy) {
    const menu = panel.querySelector("[data-language-menu]");

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

  /** Locks body scroll to prevent background scrolling when panels are open. */
  function lockScroll() {
    document.body.style.overflow = "hidden";
  }

  /** Unlocks body scroll. */
  function unlockScroll() {
    document.body.style.overflow = "";
  }

  /** Applies body scroll locking only while the SideNav is open. */
  function syncBodyScrollLock() {
    const hasOpenSideNav =
      document.querySelector(".cds--side-nav:not([hidden])") instanceof
        HTMLElement;

    if (hasOpenSideNav) {
      lockScroll();
      return;
    }

    unlockScroll();
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
    let closed = false;
    const preservedPanelId = exceptControl === null
      ? null
      : getLinkedPanelId(exceptControl);
    const preserveSideNav = exceptControl !== null &&
      exceptControl.matches(".cds--header__menu-toggle") &&
      exceptControl.getAttribute("aria-expanded") === "true";

    for (const control of controls) {
      if (control === exceptControl) {
        continue;
      }

      if (control.hasAttribute("active")) {
        control.removeAttribute("active");
        closed = true;
      }

      const linkedPanelId = getLinkedPanelId(control);

      if (linkedPanelId === null) {
        continue;
      }

      const linkedPanel = globalThis.document.getElementById(linkedPanelId);

      if (!(linkedPanel instanceof HTMLElement)) {
        continue;
      }

      if (linkedPanel.hasAttribute("expanded")) {
        linkedPanel.removeAttribute("expanded");
        closed = true;
      }

      // Handle native hidden attribute for Carbon panels
      if (!linkedPanel.hasAttribute("hidden")) {
        linkedPanel.setAttribute("hidden", "");
        closed = true;
      }

      // Update aria-expanded on the control
      if (control.getAttribute("aria-expanded") === "true") {
        control.setAttribute("aria-expanded", "false");
      }
    }

    for (
      const panel of globalThis.document.querySelectorAll(
        "cds-header-panel[expanded], .cds--header__panel:not([hidden])",
      )
    ) {
      if (!(panel instanceof HTMLElement)) {
        continue;
      }

      if (preservedPanelId !== null && panel.id === preservedPanelId) {
        continue;
      }

      panel.removeAttribute("expanded");
      panel.setAttribute("hidden", "");
      closed = true;
    }

    for (
      const sideNav of globalThis.document.querySelectorAll(
        "cds-side-nav[expanded], .cds--side-nav:not([hidden])",
      )
    ) {
      if (!(sideNav instanceof HTMLElement)) {
        continue;
      }

      if (preserveSideNav) {
        continue;
      }

      sideNav.removeAttribute("expanded");
      sideNav.setAttribute("hidden", "");
      closed = true;
    }

    // Hide overlay when SideNav closes
    const overlay = globalThis.document.querySelector(
      ".cds--side-nav__overlay",
    );
    if (overlay instanceof HTMLElement && !preserveSideNav) {
      overlay.setAttribute("aria-hidden", "true");
    }

    syncBodyScrollLock();

    // Restore focus to the trigger that opened the panel
    if (restoreFocus && lastTrigger instanceof HTMLElement) {
      lastTrigger.focus({ preventScroll: true });
      lastTrigger = null;
    }

    return closed;
  }

  globalThis.document.addEventListener("keydown", (event) => {
    const openLanguagePanel = getOpenLanguagePanel();

    if (
      openLanguagePanel instanceof HTMLElement &&
      (event.key === "ArrowDown" || event.key === "ArrowUp" ||
        event.key === "Home" || event.key === "End")
    ) {
      const menu = openLanguagePanel.querySelector("[data-language-menu]");
      const activeElement = document.activeElement;
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

    // Focus trap only for the mobile SideNav, which behaves as a modal surface.
    if (event.key === "Tab") {
      const openSideNav = document.querySelector(
        ".cds--side-nav:not([hidden])",
      );
      if (openSideNav instanceof HTMLElement) {
        trapFocus(event, openSideNav);
      }
    }
  });

  const activeObserver = new MutationObserver((mutationList) => {
    for (const mutation of mutationList) {
      if (
        mutation.type !== "attributes" ||
        mutation.attributeName !== "active" ||
        !(mutation.target instanceof HTMLElement) ||
        !mutation.target.hasAttribute("active")
      ) {
        continue;
      }

      closeCarbonChrome({ exceptControl: mutation.target });
    }
  });

  for (const control of controls) {
    activeObserver.observe(control, {
      attributes: true,
      attributeFilter: ["active"],
    });
  }

  /**
   * Handle native UI shell toggles (navigation, search, language)
   * Replaces functionality previously provided by Carbon Web Components
   */
  function setupDisclosureControls() {
    const navToggle = document.querySelector(".cds--header__menu-toggle");
    const overlay = document.querySelector(".cds--side-nav__overlay");

    /**
     * Toggles a header panel's visibility and updates ARIA states.
     * Panels behave like disclosures, so focus is moved into the panel but
     * the rest of the page remains available to assistive technology.
     * @param {HTMLElement|null} button The trigger button
     * @param {HTMLElement|null} panel The panel to toggle
     */
    const setupPanelToggle = (button, panel) => {
      if (!button || !panel) return;

      button.addEventListener("keydown", (event) => {
        const isExpanded = button.getAttribute("aria-expanded") === "true";

        if (event.key === "ArrowDown") {
          if (isExpanded) {
            event.preventDefault();
            focusLanguageMenuFromTrigger(panel, "selected");
          }
          return;
        }

        if (event.key === "ArrowUp") {
          if (isExpanded) {
            event.preventDefault();
            focusLanguageMenuFromTrigger(panel, "last");
          }
        }
      });

      button.addEventListener("click", () => {
        const isExpanded = button.getAttribute("aria-expanded") === "true";
        const newState = !isExpanded;

        // Close all other panels first
        closeCarbonChrome({ exceptControl: button });

        button.setAttribute("aria-expanded", String(newState));

        if (newState) {
          lastTrigger = button;
          panel.removeAttribute("hidden");
          panel.setAttribute("expanded", "");

          if (lastInteractionModality === "keyboard") {
            // Prefer the current item so the language panel reflects the active locale.
            const preferredFocusable = panel.querySelector(
              '[role="menuitemradio"][aria-checked="true"], [aria-current="page"]',
            );
            const firstFocusable = preferredFocusable instanceof HTMLElement
              ? preferredFocusable
              : panel.querySelector(FOCUSABLE_SELECTOR);
            if (firstFocusable instanceof HTMLElement) {
              setTimeout(() => firstFocusable.focus(), 50);
            }
          }
        } else {
          panel.setAttribute("hidden", "");
          panel.removeAttribute("expanded");
          // Return focus to trigger
          button.focus({ preventScroll: true });
        }
      });
    };

    /**
     * Setup roving tabindex and arrow-key navigation for menu-style panels.
     * @param {HTMLElement|null} panel
     */
    const setupMenuKeyboardNavigation = (panel) => {
      if (!(panel instanceof HTMLElement)) {
        return;
      }

      const menu = panel.querySelector("[data-language-menu]");

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
    };

    /**
     * Setup SideNav toggle with overlay and scroll locking.
     * @param {HTMLElement|null} button The hamburger button
     * @param {HTMLElement|null} nav The SideNav element
     */
    const setupSideNavToggle = (button, nav) => {
      if (!button || !nav) return;

      button.addEventListener("click", () => {
        const isExpanded = button.getAttribute("aria-expanded") === "true";
        const newState = !isExpanded;

        // Close all other panels first
        closeCarbonChrome({ exceptControl: button });

        button.setAttribute("aria-expanded", String(newState));

        if (newState) {
          lastTrigger = button;
          nav.removeAttribute("hidden");
          nav.setAttribute("expanded", "");
          if (overlay instanceof HTMLElement) {
            overlay.setAttribute("aria-hidden", "false");
          }
          syncBodyScrollLock();
          // Focus first nav link
          const firstLink = nav.querySelector("a.cds--side-nav__link");
          if (firstLink instanceof HTMLElement) {
            setTimeout(() => firstLink.focus(), 50);
          }
        } else {
          nav.setAttribute("hidden", "");
          nav.removeAttribute("expanded");
          if (overlay instanceof HTMLElement) {
            overlay.setAttribute("aria-hidden", "true");
          }
          syncBodyScrollLock();
          // Return focus to trigger
          button.focus({ preventScroll: true });
        }
      });
    };

    if (navToggle instanceof HTMLElement) {
      const sideNavId = navToggle.getAttribute("aria-controls");
      const sideNav = sideNavId === null
        ? null
        : document.getElementById(sideNavId);
      setupSideNavToggle(navToggle, sideNav);
    }

    for (const control of controls) {
      if (
        !control.matches(
          ".cds--header__action[aria-controls]:not(.cds--header__menu-toggle)",
        )
      ) {
        continue;
      }

      const panelId = control.getAttribute("aria-controls");
      const panel = panelId === null ? null : document.getElementById(panelId);
      setupMenuKeyboardNavigation(panel);
      setupPanelToggle(control, panel);
    }

    // Close panels when clicking overlay
    if (overlay instanceof HTMLElement) {
      overlay.addEventListener("click", () => {
        closeCarbonChrome({ restoreFocus: true });
      });
    }

    // Close panels when clicking outside (but not on overlay)
    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const isInsidePanel = target.closest(
        ".cds--header__panel, .cds--side-nav",
      );
      const isToggleButton = target.closest(
        ".cds--header__menu-toggle, .cds--header__language-toggle, .cds--header__action[aria-controls]",
      );

      if (!isInsidePanel && !isToggleButton) {
        closeCarbonChrome();
      }
    });
  }

  // Run immediately if DOM is ready, otherwise wait for DOMContentLoaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupDisclosureControls);
  } else {
    setupDisclosureControls();
  }
})();

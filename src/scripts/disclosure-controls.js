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

  /** Locks body scroll to prevent background scrolling when panels are open. */
  function lockScroll() {
    document.body.style.overflow = "hidden";
  }

  /** Unlocks body scroll. */
  function unlockScroll() {
    document.body.style.overflow = "";
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
    const overlay = globalThis.document.querySelector(".cds--side-nav__overlay");
    if (overlay instanceof HTMLElement && !preserveSideNav) {
      overlay.setAttribute("aria-hidden", "true");
    }

    // Unlock scroll when closing panels
    if (closed && exceptControl === null) {
      unlockScroll();
    }

    // Restore focus to the trigger that opened the panel
    if (restoreFocus && lastTrigger instanceof HTMLElement) {
      lastTrigger.focus({ preventScroll: true });
      lastTrigger = null;
    }

    return closed;
  }

  globalThis.document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (closeCarbonChrome({ restoreFocus: true })) {
        event.preventDefault();
      }
      return;
    }

    // Focus trap for open panels and side nav
    if (event.key === "Tab") {
      const openPanel = document.querySelector(
        ".cds--header__panel:not([hidden])",
      );
      if (openPanel instanceof HTMLElement) {
        trapFocus(event, openPanel);
        return;
      }

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
    const sideNav = document.getElementById("site-side-nav");
    const searchToggle = document.querySelector(
      ".cds--header__action[aria-controls='site-search-panel']",
    );
    const searchPanel = document.getElementById("site-search-panel");
    const languageToggle = document.querySelector(
      ".cds--header__language-toggle",
    );
    const languagePanel = document.getElementById("site-language-panel");
    const overlay = document.querySelector(".cds--side-nav__overlay");

    /**
     * Toggles a panel's visibility and updates ARIA states.
     * Includes focus management and scroll locking.
     * @param {HTMLElement|null} button The trigger button
     * @param {HTMLElement|null} panel The panel to toggle
     */
    const setupPanelToggle = (button, panel) => {
      if (!button || !panel) return;

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
          lockScroll();
          // Focus first focusable element in panel
          const firstFocusable = panel.querySelector(FOCUSABLE_SELECTOR);
          if (firstFocusable instanceof HTMLElement) {
            setTimeout(() => firstFocusable.focus(), 50);
          }
        } else {
          panel.setAttribute("hidden", "");
          panel.removeAttribute("expanded");
          unlockScroll();
          // Return focus to trigger
          button.focus({ preventScroll: true });
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
          lockScroll();
          if (overlay instanceof HTMLElement) {
            overlay.setAttribute("aria-hidden", "false");
          }
          // Focus first nav link
          const firstLink = nav.querySelector("a.cds--side-nav__link");
          if (firstLink instanceof HTMLElement) {
            setTimeout(() => firstLink.focus(), 50);
          }
        } else {
          nav.setAttribute("hidden", "");
          nav.removeAttribute("expanded");
          unlockScroll();
          if (overlay instanceof HTMLElement) {
            overlay.setAttribute("aria-hidden", "true");
          }
          // Return focus to trigger
          button.focus({ preventScroll: true });
        }
      });
    };

    // Setup SideNav toggle
    setupSideNavToggle(navToggle, sideNav);

    // Setup search panel toggle
    setupPanelToggle(searchToggle, searchPanel);

    // Setup language panel toggle
    setupPanelToggle(languageToggle, languagePanel);

    // Close panels when clicking overlay
    if (overlay instanceof HTMLElement) {
      overlay.addEventListener("click", () => {
        closeCarbonChrome({ restoreFocus: true });
        unlockScroll();
      });
    }

    // Close panels when clicking outside (but not on overlay)
    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const isInsidePanel = target.closest(".cds--header__panel, .cds--side-nav");
      const isToggleButton = target.closest(
        ".cds--header__menu-toggle, .cds--header__language-toggle, .cds--header__action[aria-controls]",
      );

      if (!isInsidePanel && !isToggleButton) {
        closeCarbonChrome();
        unlockScroll();
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

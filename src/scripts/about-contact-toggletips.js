// @ts-check

import { getFocusableElements, trapFocus } from "./shared/focus-utils.js";

const MOBILE_MEDIA_QUERY = "(max-width: 47.999rem)";
const TOGGLETIP_SELECTOR = "[data-contact-toggletip]";
const TRIGGER_SELECTOR = "[data-contact-toggletip-trigger]";
const PANEL_SELECTOR = "[data-contact-toggletip-panel]";
const CLOSE_BUTTON_SELECTOR = "[data-contact-toggletip-close]";
const POPOVER_SELECTOR = ".site-popover";
const FEATURE_LAYOUT_SELECTOR = ".feature-layout";
const FEATURE_RAIL_STICKY_SELECTOR = ".feature-rail-sticky";
const CONTACT_LIST_SELECTOR = ".about-contact-list";
const NATIVE_POPOVER_VALUE = "auto";
const NATIVE_POPOVER_MARKER_ATTRIBUTE = "data-contact-native-popover";
const DESKTOP_POPOVER_TOP_VARIABLE = "--about-contact-popover-top";
const DESKTOP_POPOVER_LEFT_VARIABLE = "--about-contact-popover-left";
const DESKTOP_POPOVER_CARET_OFFSET_VARIABLE =
  "--about-contact-popover-caret-offset";

/**
 * @param {Window & typeof globalThis} runtime
 * @returns {void}
 */
export function bindAboutContactToggletips(runtime) {
  const doc = runtime.document;
  const containers = Array.from(doc.querySelectorAll(TOGGLETIP_SELECTOR))
    .filter((candidate) => candidate instanceof runtime.HTMLElement);
  const mobileMedia = typeof runtime.matchMedia === "function"
    ? runtime.matchMedia(MOBILE_MEDIA_QUERY)
    : null;
  /** @type {Set<HTMLElement>} */
  const inertElements = new Set();
  /** @type {Set<HTMLElement>} */
  const focusoutSuppressedContainers = new Set();
  /** @type {Map<HTMLElement, ResizeObserver>} */
  const popoverResizeObservers = new Map();
  /** @type {number | null} */
  let positionSyncFrame = null;

  if (containers.length === 0) {
    return;
  }

  /**
   * @returns {HTMLBodyElement | null}
   */
  function getBody() {
    const body = doc.body;
    return body instanceof runtime.HTMLBodyElement ? body : null;
  }

  /**
   * @param {HTMLElement} container
   * @returns {HTMLButtonElement | null}
   */
  function getTrigger(container) {
    const trigger = container.querySelector(TRIGGER_SELECTOR);
    return trigger instanceof runtime.HTMLButtonElement ? trigger : null;
  }

  /**
   * @param {HTMLElement} container
   * @returns {HTMLElement | null}
   */
  function getPopover(container) {
    const popover = container.querySelector(POPOVER_SELECTOR);
    return popover instanceof runtime.HTMLElement ? popover : null;
  }

  /**
   * @param {HTMLElement} container
   * @returns {HTMLElement | null}
   */
  function getPanel(container) {
    const panel = container.querySelector(PANEL_SELECTOR);
    return panel instanceof runtime.HTMLElement ? panel : null;
  }

  /**
   * @param {HTMLElement} container
   * @returns {HTMLButtonElement | null}
   */
  function getCloseButton(container) {
    const button = container.querySelector(CLOSE_BUTTON_SELECTOR);
    return button instanceof runtime.HTMLButtonElement ? button : null;
  }

  /**
   * @param {HTMLElement | null} element
   * @returns {void}
   */
  function blurElement(element) {
    if (element === null || element === getBody()) {
      return;
    }

    element.blur();
  }

  /**
   * @param {HTMLElement} element
   * @param {boolean} inert
   * @returns {void}
   */
  function setElementInert(element, inert) {
    if (inert) {
      element.setAttribute("inert", "");
      inertElements.add(element);
      return;
    }

    element.removeAttribute("inert");
    inertElements.delete(element);
  }

  /**
   * @param {HTMLElement} popover
   * @returns {boolean}
   */
  function supportsNativePopover(popover) {
    return typeof popover.showPopover === "function" &&
      typeof popover.hidePopover === "function";
  }

  /**
   * @param {string} tokenName
   * @param {number} fallback
   * @returns {number}
   */
  function resolveRootTokenPx(tokenName, fallback) {
    const root = doc.documentElement;

    if (!(root instanceof runtime.HTMLElement)) {
      return fallback;
    }

    const value = runtime.getComputedStyle(root).getPropertyValue(tokenName)
      .trim();
    const parsed = Number.parseFloat(value);

    return Number.isFinite(parsed) ? parsed : fallback;
  }

  /**
   * @param {HTMLElement} popover
   * @returns {boolean}
   */
  function isNativePopoverOpen(popover) {
    if (!supportsNativePopover(popover)) {
      return false;
    }

    try {
      if (
        typeof popover.matches === "function" &&
        popover.matches(":popover-open")
      ) {
        return true;
      }
    } catch {
      // Ignore selector support issues in test environments.
    }

    return popover.getAttribute("data-popover-open") === "true";
  }

  /**
   * @param {HTMLElement} popover
   * @returns {boolean}
   */
  function shouldUseNativePopover(popover) {
    return supportsNativePopover(popover);
  }

  /**
   * @param {HTMLElement | null} popover
   * @returns {void}
   */
  function clearNativePopoverPosition(popover) {
    if (popover === null) {
      return;
    }

    popover.style.removeProperty(DESKTOP_POPOVER_TOP_VARIABLE);
    popover.style.removeProperty(DESKTOP_POPOVER_LEFT_VARIABLE);
    popover.style.removeProperty(DESKTOP_POPOVER_CARET_OFFSET_VARIABLE);
  }

  /**
   * @param {HTMLElement} container
   * @returns {void}
   */
  function syncNativePopoverPosition(container) {
    const trigger = getTrigger(container);
    const popover = getPopover(container);

    if (
      trigger === null ||
      popover === null ||
      !shouldUseNativePopover(popover) ||
      !isNativePopoverOpen(popover) ||
      isMobileViewport()
    ) {
      clearNativePopoverPosition(popover);
      return;
    }

    const triggerRect = trigger.getBoundingClientRect();
    const popoverRect = popover.getBoundingClientRect();
    const offsetPx = resolveRootTokenPx("--ph-space-2", 8);
    const viewportPaddingPx = resolveRootTokenPx("--ph-space-4", 16);
    const desiredCenterX = triggerRect.left + (triggerRect.width / 2);
    const halfWidth = popoverRect.width / 2;
    const minCenterX = viewportPaddingPx + halfWidth;
    const maxCenterX = runtime.innerWidth - viewportPaddingPx - halfWidth;
    const centerX = minCenterX > maxCenterX
      ? runtime.innerWidth / 2
      : Math.min(Math.max(desiredCenterX, minCenterX), maxCenterX);
    const top = triggerRect.bottom + offsetPx;
    const caretOffset = desiredCenterX - centerX;

    popover.style.setProperty(DESKTOP_POPOVER_TOP_VARIABLE, `${top}px`);
    popover.style.setProperty(DESKTOP_POPOVER_LEFT_VARIABLE, `${centerX}px`);
    popover.style.setProperty(
      DESKTOP_POPOVER_CARET_OFFSET_VARIABLE,
      `${caretOffset}px`,
    );
  }

  /**
   * @param {HTMLElement} popover
   * @returns {boolean}
   */
  function syncPopoverMode(popover) {
    if (shouldUseNativePopover(popover)) {
      if (popover.getAttribute("popover") !== NATIVE_POPOVER_VALUE) {
        popover.setAttribute("popover", NATIVE_POPOVER_VALUE);
      }

      if (isMobileViewport()) {
        popover.removeAttribute(NATIVE_POPOVER_MARKER_ATTRIBUTE);
        clearNativePopoverPosition(popover);
      } else {
        popover.setAttribute(NATIVE_POPOVER_MARKER_ATTRIBUTE, "");
      }

      return true;
    }

    popover.removeAttribute(NATIVE_POPOVER_MARKER_ATTRIBUTE);
    clearNativePopoverPosition(popover);

    return false;
  }

  /**
   * @param {HTMLElement | null} activeContainer
   * @returns {Set<HTMLElement>}
   */
  function collectModalIsolationTargets(activeContainer) {
    const targets = new Set();

    if (
      !(activeContainer instanceof runtime.HTMLElement) || !isMobileViewport()
    ) {
      return targets;
    }

    const scopedParents = [
      activeContainer.closest(FEATURE_LAYOUT_SELECTOR),
      activeContainer.closest(FEATURE_RAIL_STICKY_SELECTOR),
      activeContainer.closest(CONTACT_LIST_SELECTOR),
    ];

    for (const parent of scopedParents) {
      if (!(parent instanceof runtime.HTMLElement)) {
        continue;
      }

      for (const child of parent.children) {
        if (!(child instanceof runtime.HTMLElement)) {
          continue;
        }

        if (child === activeContainer || child.contains(activeContainer)) {
          continue;
        }

        targets.add(child);
      }
    }

    if (targets.size > 0) {
      return targets;
    }

    for (const child of doc.body.children) {
      if (!(child instanceof runtime.HTMLElement)) {
        continue;
      }

      if (child === activeContainer || child.contains(activeContainer)) {
        continue;
      }

      targets.add(child);
    }

    return targets;
  }

  /**
   * @param {HTMLElement | null} activeContainer
   * @returns {void}
   */
  function syncModalIsolation(activeContainer = null) {
    const nextInertElements = collectModalIsolationTargets(activeContainer);

    for (const element of inertElements) {
      if (!nextInertElements.has(element)) {
        setElementInert(element, false);
      }
    }

    for (const element of nextInertElements) {
      if (!inertElements.has(element)) {
        setElementInert(element, true);
      }
    }
  }

  /**
   * @returns {void}
   */
  function syncModalState() {
    const body = getBody();

    if (body === null) {
      return;
    }

    const activeContainer = containers.find(isOpen) ?? null;
    const hasOpenToggletip = activeContainer !== null && isMobileViewport();

    if (hasOpenToggletip) {
      body.dataset.contactToggletipModalOpen = "true";
    } else {
      delete body.dataset.contactToggletipModalOpen;
    }

    syncModalIsolation(activeContainer);
  }

  /**
   * @returns {void}
   */
  function syncOpenPanelsToViewport() {
    for (const container of containers) {
      const open = isOpen(container);
      setToggletipState(container, open);
    }

    syncModalState();
  }

  /**
   * @returns {boolean}
   */
  function isMobileViewport() {
    return mobileMedia?.matches ?? false;
  }

  /**
   * @param {HTMLElement | null} panel
   * @param {boolean} open
   * @returns {void}
   */
  function syncPanelModalState(panel, open) {
    if (panel === null) {
      return;
    }

    if (open && isMobileViewport()) {
      panel.setAttribute("aria-modal", "true");
      return;
    }

    panel.removeAttribute("aria-modal");
  }

  /**
   * @param {HTMLElement} container
   * @param {HTMLButtonElement | null} trigger
   * @param {HTMLElement | null} panel
   * @param {boolean} open
   * @returns {void}
   */
  function syncPresentationState(container, trigger, panel, open) {
    container.classList.toggle("site-popover--open", open);
    container.classList.toggle("site-toggletip--open", open);
    trigger?.setAttribute("aria-expanded", open ? "true" : "false");
    syncPanelModalState(panel, open);
  }

  /**
   * @param {HTMLElement} container
   * @param {boolean} open
   * @returns {void}
   */
  function setToggletipState(container, open) {
    const trigger = getTrigger(container);
    const popover = getPopover(container);
    const panel = getPanel(container);

    syncPresentationState(container, trigger, panel, open);

    if (popover !== null) {
      if (syncPopoverMode(popover)) {
        if (open) {
          popover.hidden = false;

          if (!isNativePopoverOpen(popover)) {
            popover.showPopover();
          }

          syncNativePopoverPosition(container);
        } else {
          if (isNativePopoverOpen(popover)) {
            popover.hidePopover();
          }

          popover.hidden = true;
          clearNativePopoverPosition(popover);
        }
      } else {
        if (isNativePopoverOpen(popover)) {
          popover.hidePopover();
        }

        popover.hidden = !open;
      }
    }

    syncPanelModalState(panel, open);
  }

  /**
   * @param {HTMLElement} container
   * @param {{ restoreFocus?: boolean; blurActiveElement?: boolean }} [options]
   * @returns {void}
   */
  function closeToggletip(container, options = {}) {
    const trigger = getTrigger(container);
    const activeElement = doc.activeElement instanceof runtime.HTMLElement
      ? doc.activeElement
      : null;

    focusoutSuppressedContainers.delete(container);
    setToggletipState(container, false);
    syncModalState();

    if (options.restoreFocus) {
      trigger?.focus({ preventScroll: true });
      return;
    }

    if (options.blurActiveElement) {
      blurElement(activeElement);
    }
  }

  /**
   * @param {HTMLElement | null} [except]
   * @returns {void}
   */
  function closeAll(except = null) {
    for (const container of containers) {
      if (container === except) {
        continue;
      }

      closeToggletip(container);
    }
  }

  /**
   * @param {HTMLElement} container
   * @returns {boolean}
   */
  function isOpen(container) {
    const popover = getPopover(container);

    return container.classList.contains("site-popover--open") ||
      (popover !== null && isNativePopoverOpen(popover));
  }

  /**
   * @param {HTMLElement} container
   * @returns {void}
   */
  function openToggletip(container) {
    const panel = getPanel(container);

    focusoutSuppressedContainers.add(container);
    closeAll(container);
    setToggletipState(container, true);
    syncModalState();

    runtime.setTimeout(() => {
      try {
        if (!isOpen(container)) {
          return;
        }

        panel?.focus({ preventScroll: true });
      } finally {
        runtime.setTimeout(() => {
          focusoutSuppressedContainers.delete(container);
        }, 0);
      }
    }, 0);
  }

  /**
   * @returns {void}
   */
  function syncOpenPopoverPositions() {
    if (isMobileViewport()) {
      return;
    }

    for (const container of containers) {
      if (!isOpen(container)) {
        continue;
      }

      syncNativePopoverPosition(container);
    }
  }

  /**
   * @returns {void}
   */
  function schedulePositionSync() {
    if (positionSyncFrame !== null) {
      return;
    }

    if (typeof runtime.requestAnimationFrame !== "function") {
      syncOpenPopoverPositions();
      return;
    }

    positionSyncFrame = runtime.requestAnimationFrame(() => {
      positionSyncFrame = null;
      syncOpenPopoverPositions();
    });
  }

  /**
   * @param {HTMLElement} popover
   * @param {HTMLElement} container
   * @returns {void}
   */
  function observePopoverSize(popover, container) {
    if (
      typeof runtime.ResizeObserver !== "function" ||
      popoverResizeObservers.has(popover)
    ) {
      return;
    }

    const observer = new runtime.ResizeObserver(() => {
      if (!isOpen(container)) {
        return;
      }

      schedulePositionSync();
    });

    observer.observe(popover);
    popoverResizeObservers.set(popover, observer);
  }

  for (const container of containers) {
    const trigger = getTrigger(container);
    const popover = getPopover(container);
    const panel = getPanel(container);
    const closeButton = getCloseButton(container);

    if (trigger === null || popover === null || panel === null) {
      continue;
    }

    setToggletipState(container, isOpen(container));
    observePopoverSize(popover, container);

    if (supportsNativePopover(popover)) {
      popover.addEventListener("toggle", () => {
        const open = isNativePopoverOpen(popover);
        popover.hidden = !open;
        if (open) {
          syncNativePopoverPosition(container);
        } else {
          clearNativePopoverPosition(popover);
        }
        syncPresentationState(container, trigger, panel, open);
        syncModalState();
      });
    }

    trigger.addEventListener("click", (event) => {
      if (isOpen(container)) {
        closeToggletip(container, {
          restoreFocus: event.detail === 0,
          blurActiveElement: event.detail !== 0,
        });
        return;
      }

      openToggletip(container);
    });

    trigger.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      closeToggletip(container, { restoreFocus: true });
    });

    panel.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeToggletip(container, { restoreFocus: true });
        return;
      }

      if (event.key !== "Tab" || !isOpen(container) || !isMobileViewport()) {
        return;
      }

      const focusableElements = getFocusableElements(runtime, panel);

      if (focusableElements.length === 0) {
        event.preventDefault();
        panel.focus({ preventScroll: true });
        return;
      }

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      if (!firstFocusable || !lastFocusable) {
        event.preventDefault();
        panel.focus({ preventScroll: true });
        return;
      }

      if (doc.activeElement === panel) {
        event.preventDefault();
        (event.shiftKey ? lastFocusable : firstFocusable).focus({
          preventScroll: true,
        });
        return;
      }

      trapFocus(runtime, event, panel);
    });

    closeButton?.addEventListener("click", (event) => {
      closeToggletip(container, {
        restoreFocus: event.detail === 0,
        blurActiveElement: event.detail !== 0,
      });
    });

    popover.addEventListener("pointerdown", (event) => {
      if (event.target !== popover) {
        return;
      }

      closeToggletip(container, {
        blurActiveElement: true,
      });
    });

    container.addEventListener("focusout", () => {
      runtime.setTimeout(() => {
        if (focusoutSuppressedContainers.has(container)) {
          return;
        }

        const activeElement = doc.activeElement;

        if (
          activeElement instanceof runtime.Node &&
          container.contains(activeElement)
        ) {
          return;
        }

        closeToggletip(container);
      }, 0);
    });
  }

  doc.addEventListener("pointerdown", (event) => {
    const target = event.target;

    if (!(target instanceof runtime.Node)) {
      closeAll();
      return;
    }

    const clickedContainer = target instanceof runtime.Element
      ? target.closest(TOGGLETIP_SELECTOR)
      : null;

    if (clickedContainer instanceof runtime.HTMLElement) {
      return;
    }

    closeAll();
  });

  if (typeof mobileMedia?.addEventListener === "function") {
    mobileMedia.addEventListener("change", syncOpenPanelsToViewport);
  } else if (typeof mobileMedia?.addListener === "function") {
    mobileMedia.addListener(syncOpenPanelsToViewport);
  }

  runtime.addEventListener("resize", syncOpenPanelsToViewport);
  runtime.addEventListener("scroll", schedulePositionSync, {
    passive: true,
  });
}

if (typeof window !== "undefined") {
  bindAboutContactToggletips(window);
}

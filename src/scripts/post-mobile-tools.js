// @ts-check

// Mirrors POST_RAIL_BREAKPOINT in src/utils/layout-breakpoints.ts and the
// single-column post rail query in src/styles/components/post.css.
const POST_RAIL_BREAKPOINT = "66rem";
const MOBILE_MEDIA_QUERY = `(width < ${POST_RAIL_BREAKPOINT})`;
const OPEN_SELECTOR = "[data-post-mobile-tools-open]";
const CLOSE_SELECTOR = "[data-post-mobile-tools-close]";
const DIALOG_SELECTOR = "[data-post-mobile-tools]";

/**
 * @param {Window & typeof globalThis} runtime
 * @returns {void}
 */
export function bindPostMobileTools(runtime) {
  const resolvedRuntime = runtime;
  const HTMLElementCtor = resolvedRuntime.HTMLElement;
  const HTMLDialogElementCtor = resolvedRuntime.HTMLDialogElement;
  const HTMLButtonElementCtor = resolvedRuntime.HTMLButtonElement;
  const doc = resolvedRuntime.document;
  const root = doc?.documentElement;

  if (
    typeof HTMLElementCtor !== "function" ||
    typeof HTMLDialogElementCtor !== "function" ||
    typeof HTMLButtonElementCtor !== "function" ||
    !(root instanceof HTMLElementCtor)
  ) {
    return;
  }

  const dialog = doc.querySelector(DIALOG_SELECTOR);
  const openButton = doc.querySelector(OPEN_SELECTOR);

  if (
    !(dialog instanceof HTMLDialogElementCtor) ||
    !(openButton instanceof HTMLButtonElementCtor)
  ) {
    return;
  }

  const mobileDialog = /** @type {HTMLDialogElement} */ (dialog);
  const triggerButton = /** @type {HTMLButtonElement} */ (openButton);

  if (root.dataset.postMobileToolsBound === "true") {
    return;
  }

  root.dataset.postMobileToolsBound = "true";

  const closeButton = mobileDialog.querySelector(CLOSE_SELECTOR);
  const mobileMedia = typeof resolvedRuntime.matchMedia === "function"
    ? resolvedRuntime.matchMedia(MOBILE_MEDIA_QUERY)
    : null;

  /**
   * @returns {boolean}
   */
  function isMobileViewport() {
    return mobileMedia?.matches ?? false;
  }

  /**
   * @param {boolean} ready
   * @returns {void}
   */
  function setReady(ready) {
    if (ready) {
      root.dataset.postMobileToolsReady = "true";
      return;
    }

    delete root.dataset.postMobileToolsReady;
  }

  /**
   * @returns {boolean}
   */
  function isDialogOpen() {
    return mobileDialog.hasAttribute("open");
  }

  /**
   * @param {boolean} expanded
   * @returns {void}
   */
  function setExpanded(expanded) {
    triggerButton.setAttribute("aria-expanded", expanded ? "true" : "false");
  }

  /**
   * @returns {void}
   */
  function showDialog() {
    if (!isMobileViewport()) {
      return;
    }

    setReady(true);
    setExpanded(true);

    if (isDialogOpen()) {
      return;
    }

    if (typeof mobileDialog.showModal === "function") {
      try {
        mobileDialog.showModal();
      } catch {
        mobileDialog.setAttribute("open", "");
      }
    } else {
      mobileDialog.setAttribute("open", "");
    }

    if (closeButton instanceof HTMLElementCtor) {
      closeButton.focus({ preventScroll: true });
      return;
    }

    mobileDialog.focus({ preventScroll: true });
  }

  /**
   * @param {boolean} restoreFocus
   * @returns {void}
   */
  function closeDialog(restoreFocus) {
    if (typeof mobileDialog.close === "function" && isDialogOpen()) {
      try {
        mobileDialog.close();
      } catch {
        mobileDialog.removeAttribute("open");
        mobileDialog.dispatchEvent(new resolvedRuntime.Event("close"));
      }
    } else {
      mobileDialog.removeAttribute("open");
      mobileDialog.dispatchEvent(new resolvedRuntime.Event("close"));
    }

    setExpanded(false);

    if (restoreFocus) {
      triggerButton.focus({ preventScroll: true });
    }
  }

  /**
   * @returns {void}
   */
  function syncViewportState() {
    const isMobile = isMobileViewport();

    setReady(isMobile);

    if (!isMobile && isDialogOpen()) {
      closeDialog(false);
    }
  }

  triggerButton.addEventListener("click", () => {
    if (isDialogOpen()) {
      closeDialog(true);
      return;
    }

    showDialog();
  });

  if (closeButton instanceof HTMLButtonElementCtor) {
    closeButton.addEventListener("click", () => {
      closeDialog(true);
    });
  }

  mobileDialog.addEventListener("click", (event) => {
    if (event.target !== mobileDialog) {
      return;
    }

    closeDialog(false);
  });

  mobileDialog.addEventListener("close", () => {
    setExpanded(false);
  });

  syncViewportState();

  if (!mobileMedia) {
    return;
  }

  const handleViewportChange = () => {
    syncViewportState();
  };

  if (typeof mobileMedia.addEventListener === "function") {
    mobileMedia.addEventListener("change", handleViewportChange);
  } else if (typeof mobileMedia.addListener === "function") {
    mobileMedia.addListener(handleViewportChange);
  }
}

bindPostMobileTools(
  /** @type {Window & typeof globalThis} */ (globalThis),
);

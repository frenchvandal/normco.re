/**
 * Scroll-to-top button feature.
 *
 * Provides a floating button that appears when the user scrolls down the page,
 * allowing quick navigation back to the top. The button visibility is controlled
 * by scroll position and respects reduced motion preferences.
 *
 * @module features/scroll-to-top
 */

/**
 * Scroll threshold in pixels before showing the button.
 * @constant {number}
 */
const SCROLL_THRESHOLD = 300;

/**
 * Throttle delay in milliseconds for scroll event handling.
 * @constant {number}
 */
const THROTTLE_DELAY = 100;

/**
 * Creates a throttled version of a function.
 *
 * @param {Function} fn - The function to throttle.
 * @param {number} delay - The throttle delay in milliseconds.
 * @returns {Function} The throttled function.
 */
function throttle(fn, delay) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}

/**
 * Creates and manages the scroll-to-top button.
 *
 * @returns {Object} Object containing init and destroy methods.
 *
 * @example
 * ```js
 * import { createScrollToTop } from "./features/scroll-to-top.js";
 *
 * const scrollToTop = createScrollToTop();
 * scrollToTop.init();
 * ```
 */
export function createScrollToTop() {
  let button = null;
  let scrollHandler = null;

  /**
   * Checks if user prefers reduced motion.
   * @returns {boolean} True if reduced motion is preferred.
   */
  const prefersReducedMotion = () =>
    globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  /**
   * Updates the button visibility based on scroll position.
   */
  const updateVisibility = () => {
    if (!button) return;

    const shouldShow = globalThis.scrollY > SCROLL_THRESHOLD;
    button.classList.toggle("scroll-to-top--visible", shouldShow);
    button.setAttribute("aria-hidden", String(!shouldShow));
    button.tabIndex = shouldShow ? 0 : -1;
  };

  /**
   * Scrolls the page to the top.
   */
  const scrollToTop = () => {
    const behavior = prefersReducedMotion() ? "instant" : "smooth";
    globalThis.scrollTo({ top: 0, behavior });
  };

  /**
   * Handles keyboard events on the button.
   * @param {KeyboardEvent} event - The keyboard event.
   */
  const handleKeydown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      scrollToTop();
    }
  };

  /**
   * Creates the button element and appends it to the DOM.
   * @returns {HTMLButtonElement} The created button element.
   */
  const createButton = () => {
    const btn = document.createElement("button");
    btn.id = "scroll-to-top";
    btn.className = "scroll-to-top";
    btn.setAttribute("aria-label", "Scroll to top");
    btn.setAttribute("aria-hidden", "true");
    btn.tabIndex = -1;
    btn.innerHTML = `
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="18 15 12 9 6 15"/>
      </svg>
    `;

    btn.addEventListener("click", scrollToTop);
    btn.addEventListener("keydown", handleKeydown);

    document.body.appendChild(btn);
    return btn;
  };

  /**
   * Initializes the scroll-to-top button.
   */
  const init = () => {
    // Avoid duplicate initialization
    if (button) return;

    button = createButton();
    scrollHandler = throttle(updateVisibility, THROTTLE_DELAY);

    globalThis.addEventListener("scroll", scrollHandler, { passive: true });

    // Initial check
    updateVisibility();
  };

  /**
   * Removes the scroll-to-top button and cleans up event listeners.
   */
  const destroy = () => {
    if (scrollHandler) {
      globalThis.removeEventListener("scroll", scrollHandler);
      scrollHandler = null;
    }

    if (button) {
      button.removeEventListener("click", scrollToTop);
      button.removeEventListener("keydown", handleKeydown);
      button.remove();
      button = null;
    }
  };

  return { init, destroy };
}

/**
 * Initializes the scroll-to-top feature.
 *
 * Creates the button element and sets up scroll event handling.
 * Safe to call multiple times; only initializes once.
 */
export function initScrollToTop() {
  const scrollToTop = createScrollToTop();
  scrollToTop.init();
}

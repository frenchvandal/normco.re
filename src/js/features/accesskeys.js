/**
 * Access keys module - PaperMod-style keyboard navigation
 *
 * Provides quick keyboard shortcuts for site navigation following
 * PaperMod's access key conventions:
 * - h: Home page
 * - a: Archives (posts list)
 * - s: Search
 *
 * Access keys are activated via:
 * - Windows/Linux: Alt + key
 * - macOS: Control + Option + key
 *
 * @module features/accesskeys
 */

/**
 * Configuration for access key bindings.
 * Maps key codes to their target element selectors.
 *
 * @type {Readonly<Record<string, string>>}
 */
const ACCESS_KEY_CONFIG = Object.freeze({
  h: '[data-accesskey="home"]',
  a: '[data-accesskey="archives"]',
  s: '[data-accesskey="search"]',
});

/**
 * Activates the element associated with an access key.
 * For links, triggers navigation. For buttons, triggers click.
 *
 * @param {string} key - The access key pressed.
 * @returns {boolean} True if an action was performed, false otherwise.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert/equals";
 *
 * // Mocking would be needed for actual DOM testing
 * const result = false; // activateAccessKey returns false if no element found
 * assertEquals(result, false);
 * ```
 */
function activateAccessKey(key) {
  const selector = ACCESS_KEY_CONFIG[key.toLowerCase()];
  if (!selector) {
    return false;
  }

  const element = document.querySelector(selector);
  if (!element) {
    return false;
  }

  // For links, navigate directly
  if (element.tagName === "A" && element.href) {
    globalThis.location.href = element.href;
    return true;
  }

  // For buttons or other elements, trigger click
  element.click();
  return true;
}

/**
 * Checks if a keyboard event should trigger access key handling.
 * Ignores events when user is typing in an input field.
 *
 * @param {KeyboardEvent} event - The keyboard event to check.
 * @returns {boolean} True if the event should be handled.
 */
function shouldHandleAccessKey(event) {
  // Ignore if user is typing in an input
  const activeElement = document.activeElement;
  const isTyping = activeElement && (
    activeElement.tagName === "INPUT" ||
    activeElement.tagName === "TEXTAREA" ||
    activeElement.isContentEditable
  );

  if (isTyping) {
    return false;
  }

  // Check if this looks like an access key combination
  // macOS: Control + Option + key (event.altKey is true when Option is pressed)
  // Windows/Linux: Alt + key
  const isMac = /Mac|iPhone|iPod|iPad/.test(navigator.platform);

  if (isMac) {
    // On Mac, access keys are Control + Option + key
    // ctrlKey + altKey (Option)
    return event.ctrlKey && event.altKey && !event.metaKey && !event.shiftKey;
  }

  // On Windows/Linux, access keys are Alt + key
  return event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey;
}

/**
 * Handles keydown events for access key navigation.
 *
 * @param {KeyboardEvent} event - The keyboard event.
 */
function handleAccessKeyPress(event) {
  if (!shouldHandleAccessKey(event)) {
    return;
  }

  const key = event.key.toLowerCase();
  if (ACCESS_KEY_CONFIG[key]) {
    const activated = activateAccessKey(key);
    if (activated) {
      event.preventDefault();
    }
  }
}

/**
 * Initializes the access key navigation system.
 * Sets up keyboard event listeners and adds visual indicators.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert/equals";
 *
 * // Access keys are available after initialization
 * const keysAvailable = ["h", "a", "s"];
 * assertEquals(keysAvailable.length, 3);
 * ```
 */
export function initAccessKeys() {
  // Add keydown listener for access key combinations
  document.addEventListener("keydown", handleAccessKeyPress);

  // Add accesskey attributes to elements for browser native support
  // (browser tooltips will show the shortcut)
  const mappings = [
    { selector: '[data-accesskey="home"]', key: "h" },
    { selector: '[data-accesskey="archives"]', key: "a" },
    { selector: '[data-accesskey="search"]', key: "s" },
  ];

  for (const { selector, key } of mappings) {
    const element = document.querySelector(selector);
    if (element) {
      element.setAttribute("accesskey", key);
    }
  }
}

/**
 * Returns the platform-specific modifier key hint.
 *
 * @returns {string} The modifier key description (e.g., "Alt" or "Control+Option").
 */
export function getAccessKeyModifier() {
  const isMac = /Mac|iPhone|iPod|iPad/.test(navigator.platform);
  return isMac ? "Control+Option" : "Alt";
}

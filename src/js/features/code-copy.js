/**
 * Code copy button feature.
 *
 * Adds a copy-to-clipboard button to all code blocks on the page.
 * Provides visual feedback on successful copy and handles errors gracefully.
 * Respects reduced motion preferences for animations.
 *
 * @module features/code-copy
 */

/**
 * Duration in milliseconds for the "Copied!" feedback message.
 * @constant {number}
 */
const FEEDBACK_DURATION = 2000;

/**
 * Creates and manages copy buttons for code blocks.
 *
 * @returns {Object} Object containing init and destroy methods.
 *
 * @example
 * ```js
 * import { createCodeCopy } from "./features/code-copy.js";
 *
 * const codeCopy = createCodeCopy();
 * codeCopy.init();
 * ```
 */
export function createCodeCopy() {
  const buttons = new Set();

  /**
   * Copies text to clipboard using the Clipboard API.
   *
   * @param {string} text - The text to copy.
   * @returns {Promise<boolean>} True if copy succeeded, false otherwise.
   */
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback for older browsers or restricted contexts
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.cssText =
          "position:fixed;left:-9999px;top:-9999px;opacity:0";
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand("copy");
        document.body.removeChild(textarea);
        return success;
      } catch {
        return false;
      }
    }
  };

  /**
   * Shows feedback on the button after a copy action.
   *
   * @param {HTMLButtonElement} button - The copy button element.
   * @param {boolean} success - Whether the copy was successful.
   */
  const showFeedback = (button, success) => {
    const originalLabel = button.getAttribute("aria-label");
    const originalText = button.querySelector(".code-copy__text")?.textContent;

    // Update button state
    button.classList.add(success ? "code-copy--success" : "code-copy--error");
    button.setAttribute("aria-label", success ? "Copied!" : "Copy failed");

    const textSpan = button.querySelector(".code-copy__text");
    if (textSpan) {
      textSpan.textContent = success ? "Copied!" : "Error";
    }

    // Reset after delay
    setTimeout(() => {
      button.classList.remove("code-copy--success", "code-copy--error");
      button.setAttribute("aria-label", originalLabel);
      if (textSpan) {
        textSpan.textContent = originalText;
      }
    }, FEEDBACK_DURATION);
  };

  /**
   * Handles the copy button click event.
   *
   * @param {Event} event - The click event.
   */
  const handleClick = async (event) => {
    const button = event.currentTarget;
    const pre = button.closest("pre");
    const code = pre?.querySelector("code");

    if (!code) return;

    // Get text content, preserving newlines but trimming trailing whitespace
    const text = code.textContent?.replace(/\s+$/, "") || "";
    const success = await copyToClipboard(text);
    showFeedback(button, success);
  };

  /**
   * Creates a copy button element.
   *
   * @returns {HTMLButtonElement} The copy button element.
   */
  const createButton = () => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "code-copy";
    button.setAttribute("aria-label", "Copy code to clipboard");
    button.innerHTML = `
      <svg class="code-copy__icon" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
      </svg>
      <span class="code-copy__text">Copy</span>
    `;
    return button;
  };

  /**
   * Initializes copy buttons for all code blocks.
   */
  const init = () => {
    // Find all pre > code blocks (skip inline code)
    const codeBlocks = document.querySelectorAll("pre > code");

    for (const code of codeBlocks) {
      const pre = code.parentElement;

      // Skip if already has a copy button
      if (pre.querySelector(".code-copy")) continue;

      // Wrap in container if needed for positioning
      if (!pre.classList.contains("code-block")) {
        pre.classList.add("code-block");
      }

      // Create and add button
      const button = createButton();
      button.addEventListener("click", handleClick);
      buttons.add(button);

      // Insert button as first child of pre
      pre.insertBefore(button, pre.firstChild);
    }
  };

  /**
   * Removes all copy buttons and cleans up event listeners.
   */
  const destroy = () => {
    for (const button of buttons) {
      button.removeEventListener("click", handleClick);
      button.remove();
    }
    buttons.clear();
  };

  return { init, destroy };
}

/**
 * Initializes the code copy feature.
 *
 * Adds copy buttons to all code blocks on the page.
 * Safe to call multiple times; existing buttons are preserved.
 */
export function initCodeCopy() {
  const codeCopy = createCodeCopy();
  codeCopy.init();
}

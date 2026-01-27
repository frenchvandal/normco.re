/**
 * Share Copy Button
 *
 * Handles the "Copy link" button in the share buttons component.
 * Uses the Clipboard API to copy the post URL to the clipboard.
 *
 * @module
 */

/**
 * Initializes the share copy button functionality.
 * Attaches click handlers to all copy buttons with the `data-share-url` attribute.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { initShareCopy } from "./share-copy.js";
 *
 * assertEquals(typeof initShareCopy, "function");
 * ```
 */
export function initShareCopy() {
  const copyButtons = document.querySelectorAll(
    ".share-button--copy[data-share-url]",
  );

  copyButtons.forEach((button) => {
    button.addEventListener("click", handleCopyClick);
  });
}

/**
 * Handles the click event on a copy button.
 *
 * @param {Event} event - The click event
 */
async function handleCopyClick(event) {
  const button = event.currentTarget;
  const url = button.dataset.shareUrl;

  if (!url) return;

  try {
    await navigator.clipboard.writeText(url);
    showCopiedState(button);
  } catch {
    // Fallback for browsers without Clipboard API
    fallbackCopy(url, button);
  }
}

/**
 * Shows the "copied" state on the button temporarily.
 *
 * @param {HTMLElement} button - The copy button element
 */
function showCopiedState(button) {
  button.dataset.copied = "true";

  // Reset after 2 seconds
  setTimeout(() => {
    delete button.dataset.copied;
  }, 2000);
}

/**
 * Fallback copy method for browsers without Clipboard API.
 *
 * @param {string} url - The URL to copy
 * @param {HTMLElement} button - The copy button element
 */
function fallbackCopy(url, button) {
  const textArea = document.createElement("textarea");
  textArea.value = url;
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.select();

  try {
    document.execCommand("copy");
    showCopiedState(button);
  } catch {
    console.error("Failed to copy URL");
  }

  document.body.removeChild(textArea);
}

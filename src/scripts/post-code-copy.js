// @ts-check

import { copyText } from "./shared/clipboard.js";

const CODE_BLOCK_SELECTOR = ".post-content pre > code";
const COPY_BUTTON_CLASS_NAME = "post-code-copy-button";
const FEEDBACK_RESET_MS = 1800;

/**
 * @typedef {WeakMap<HTMLButtonElement, number>} ResetTimerMap
 */

/**
 * @param {Window & typeof globalThis} runtime
 * @returns {void}
 */
export function bindPostCodeCopy(runtime) {
  const article = runtime.document.querySelector(".post-article");

  if (!(article instanceof runtime.HTMLElement)) {
    return;
  }

  if (article.dataset.codeCopyBound === "true") {
    return;
  }

  const codeBlocks = article.querySelectorAll(CODE_BLOCK_SELECTOR);

  if (codeBlocks.length === 0) {
    return;
  }

  article.dataset.codeCopyBound = "true";

  const copyLabel = article.dataset.codeCopyLabel ?? "Copy code";
  const copyFeedback = article.dataset.codeCopyFeedback ?? "Code copied";
  const copyFailedFeedback = article.dataset.codeCopyFailedFeedback ??
    "Cannot copy code";
  /** @type {ResetTimerMap} */
  const resetTimers = new WeakMap();

  /**
   * @param {HTMLButtonElement} button
   * @returns {void}
   */
  function resetButtonState(button) {
    button.textContent = copyLabel;
    button.setAttribute("aria-label", copyLabel);
    button.classList.remove(`${COPY_BUTTON_CLASS_NAME}--copied`);
    button.classList.remove(`${COPY_BUTTON_CLASS_NAME}--error`);
    resetTimers.delete(button);
  }

  /**
   * @param {HTMLButtonElement} button
   * @returns {void}
   */
  function scheduleReset(button) {
    const existingTimer = resetTimers.get(button);

    if (existingTimer !== undefined) {
      runtime.clearTimeout(existingTimer);
    }

    const nextTimer = runtime.setTimeout(() => {
      resetButtonState(button);
    }, FEEDBACK_RESET_MS);

    resetTimers.set(button, nextTimer);
  }

  for (const codeBlock of codeBlocks) {
    const pre = codeBlock.parentElement;

    if (!(pre instanceof runtime.HTMLElement)) {
      continue;
    }

    const codeText = codeBlock.textContent ?? "";

    if (codeText.length === 0) {
      continue;
    }

    const copyButton = runtime.document.createElement("button");
    copyButton.type = "button";
    copyButton.className = COPY_BUTTON_CLASS_NAME;
    copyButton.textContent = copyLabel;
    copyButton.setAttribute("aria-label", copyLabel);
    pre.before(copyButton);

    copyButton.addEventListener("click", async () => {
      const success = await copyText(runtime, codeText);
      const feedback = success ? copyFeedback : copyFailedFeedback;

      copyButton.textContent = feedback;
      copyButton.setAttribute("aria-label", feedback);
      copyButton.classList.toggle(`${COPY_BUTTON_CLASS_NAME}--copied`, success);
      copyButton.classList.toggle(
        `${COPY_BUTTON_CLASS_NAME}--error`,
        !success,
      );
      scheduleReset(copyButton);
    });
  }
}

if (typeof window !== "undefined") {
  bindPostCodeCopy(window);
}

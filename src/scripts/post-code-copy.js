// @ts-check
(() => {
  /** @typedef {WeakMap<HTMLButtonElement, number>} ResetTimerMap */
  const article = globalThis.document.querySelector(
    ".post-article",
  );

  if (!(article instanceof HTMLElement)) {
    return;
  }

  if (article.dataset.codeCopyBound === "true") {
    return;
  }

  const codeBlocks = article.querySelectorAll(".post-content pre > code");

  if (codeBlocks.length === 0) {
    return;
  }

  article.dataset.codeCopyBound = "true";

  const copyLabel = article.dataset.codeCopyLabel ?? "Copy code";
  const copyFeedback = article.dataset.codeCopyFeedback ?? "Code copied";
  const copyFailedFeedback = article.dataset.codeCopyFailedFeedback ??
    "Cannot copy code";
  const feedbackResetMs = 1800;
  /** @type {ResetTimerMap} */
  const resetTimers = new WeakMap();

  /**
   * Copies text to the clipboard using the async API when available, then
   * falls back to a hidden textarea for older or restricted contexts.
   * @param {string} text
   * @returns {Promise<boolean>}
   */
  async function copyText(text) {
    const clipboard = globalThis.navigator.clipboard;

    if (clipboard !== undefined && typeof clipboard.writeText === "function") {
      try {
        await clipboard.writeText(text);
        return true;
      } catch {
        // Fall back to the manual selection path below.
      }
    }

    const selection = globalThis.getSelection();
    const activeElement = globalThis.document.activeElement;
    const textArea = globalThis.document.createElement("textarea");

    textArea.value = text;
    textArea.setAttribute("readonly", "");
    textArea.setAttribute("aria-hidden", "true");
    textArea.style.position = "fixed";
    textArea.style.insetBlockStart = "0";
    textArea.style.insetInlineStart = "0";
    textArea.style.inlineSize = "1px";
    textArea.style.blockSize = "1px";
    textArea.style.padding = "0";
    textArea.style.border = "0";
    textArea.style.opacity = "0";
    globalThis.document.body.append(textArea);

    try {
      textArea.focus({ preventScroll: true });
      textArea.select();
      textArea.setSelectionRange(0, textArea.value.length);
      return globalThis.document.execCommand("copy");
    } catch {
      return false;
    } finally {
      textArea.remove();

      if (selection !== null) {
        selection.removeAllRanges();
      }

      if (activeElement instanceof HTMLElement) {
        activeElement.focus({ preventScroll: true });
      }
    }
  }

  /**
   * @param {HTMLButtonElement} button
   * @returns {void}
   */
  function resetButtonState(button) {
    button.textContent = copyLabel;
    button.setAttribute("aria-label", copyLabel);
    button.classList.remove("post-code-copy-button--copied");
    button.classList.remove("post-code-copy-button--error");
    resetTimers.delete(button);
  }

  /**
   * @param {HTMLButtonElement} button
   * @returns {void}
   */
  function scheduleReset(button) {
    const existingTimer = resetTimers.get(button);

    if (existingTimer !== undefined) {
      globalThis.clearTimeout(existingTimer);
    }

    const nextTimer = globalThis.setTimeout(() => {
      resetButtonState(button);
    }, feedbackResetMs);

    resetTimers.set(button, nextTimer);
  }

  for (const codeBlock of codeBlocks) {
    const pre = codeBlock.parentElement;

    if (!(pre instanceof HTMLElement)) {
      continue;
    }

    const codeText = codeBlock.textContent ?? "";

    if (codeText.length === 0) {
      continue;
    }

    const copyButton = globalThis.document.createElement("button");
    copyButton.type = "button";
    copyButton.className = "post-code-copy-button";
    copyButton.textContent = copyLabel;
    copyButton.setAttribute("aria-label", copyLabel);
    pre.before(copyButton);

    copyButton.addEventListener("click", async () => {
      const success = await copyText(codeText);
      const feedback = success ? copyFeedback : copyFailedFeedback;

      copyButton.textContent = feedback;
      copyButton.setAttribute("aria-label", feedback);
      copyButton.classList.toggle("post-code-copy-button--copied", success);
      copyButton.classList.toggle("post-code-copy-button--error", !success);
      scheduleReset(copyButton);
    });
  }
})();

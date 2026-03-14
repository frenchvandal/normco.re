// @ts-check
(() => {
  const article = globalThis.document.querySelector(
    ".post-article",
  );

  if (!(article instanceof HTMLElement)) {
    return;
  }

  const codeBlocks = article.querySelectorAll(".post-content pre > code");

  if (codeBlocks.length === 0) {
    return;
  }

  const copyLabel = article.dataset.codeCopyLabel ?? "Copy code";
  const copyFeedback = article.dataset.codeCopyFeedback ?? "Code copied";
  const copyFailedFeedback = article.dataset.codeCopyFailedFeedback ??
    "Cannot copy code";
  const feedbackResetMs = 1800;

  /**
   * Copies text to clipboard using the Clipboard API.
   * @param {string} text
   * @returns {Promise<boolean>}
   */
  async function copyText(text) {
    try {
      await globalThis.navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  for (const codeBlock of codeBlocks) {
    const pre = codeBlock.parentElement;

    if (!(pre instanceof HTMLElement)) {
      continue;
    }

    const codeText = codeBlock.textContent?.trim() ?? "";

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
      copyButton.classList.add("post-code-copy-button--copied");

      globalThis.setTimeout(() => {
        copyButton.textContent = copyLabel;
        copyButton.setAttribute("aria-label", copyLabel);
        copyButton.classList.remove("post-code-copy-button--copied");
      }, feedbackResetMs);
    });
  }
})();

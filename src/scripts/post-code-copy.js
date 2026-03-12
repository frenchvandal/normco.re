// @ts-check
(() => {
  const article = globalThis.document.querySelector(
    ".post-article[data-code-copy-label]",
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
   * @param {string} text
   * @returns {boolean}
   */
  function writeWithExecCommand(text) {
    const textArea = globalThis.document.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "true");
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "-9999px";

    globalThis.document.body.append(textArea);
    textArea.focus();
    textArea.select();

    // TODO(phiphi): [Carbon-P3] Remove execCommand fallback after clipboard API support baseline for site visitors reaches full parity in analytics.
    let success = false;
    try {
      success = globalThis.document.execCommand("copy");
    } catch {
      success = false;
    }

    textArea.remove();
    return success;
  }

  /**
   * @param {string} text
   * @returns {Promise<boolean>}
   */
  async function copyText(text) {
    const clipboard = globalThis.navigator.clipboard;

    if (clipboard === undefined || typeof clipboard.writeText !== "function") {
      return writeWithExecCommand(text);
    }

    try {
      await clipboard.writeText(text);
      return true;
    } catch {
      return writeWithExecCommand(text);
    }
  }

  /**
   * @returns {HTMLElement}
   */
  function createCopyButton() {
    const copyButton = globalThis.document.createElement("cds-copy-button");
    copyButton.classList.add("post-code-copy-button");
    copyButton.setAttribute("feedback", copyFeedback);
    copyButton.setAttribute("feedback-timeout", String(feedbackResetMs));
    copyButton.textContent = copyLabel;
    return copyButton;
  }

  /**
   * @param {HTMLElement} copyButton
   * @returns {void}
   */
  function applyFailureFeedback(copyButton) {
    copyButton.setAttribute("feedback", copyFailedFeedback);
    globalThis.setTimeout(() => {
      copyButton.setAttribute("feedback", copyFeedback);
    }, feedbackResetMs);
  }

  for (const candidate of codeBlocks) {
    if (!(candidate instanceof HTMLElement)) {
      continue;
    }

    const pre = candidate.parentElement;

    if (!(pre instanceof HTMLElement)) {
      continue;
    }

    if (pre.parentElement?.classList.contains("post-code-block")) {
      continue;
    }

    const codeText = candidate.textContent?.trim() ?? "";
    const wrapper = globalThis.document.createElement("div");
    wrapper.className = "post-code-block";
    pre.replaceWith(wrapper);
    wrapper.append(pre);

    if (codeText.length === 0) {
      continue;
    }

    const copyButton = createCopyButton();
    wrapper.prepend(copyButton);
    copyButton.addEventListener("click", () => {
      void copyText(codeText).then((copied) => {
        if (!copied) {
          applyFailureFeedback(copyButton);
        }
      });
    });
  }
})();

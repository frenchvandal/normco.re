// @ts-check
(() => {
  /** @typedef {"idle" | "copied" | "error"} CopyState */
  const copyControls = globalThis.document.querySelectorAll(
    "[data-copy-control]",
  );
  const copiedStateDurationMs = 1800;
  /** @type {WeakMap<HTMLElement, number>} */
  const resetTimers = new WeakMap();

  if (copyControls.length === 0) {
    return;
  }

  /**
   * @param {HTMLElement} control
   * @returns {HTMLElement | null}
   */
  function getStatusElement(control) {
    const status = control.querySelector("[data-copy-status]");
    return status instanceof HTMLElement ? status : null;
  }

  /**
   * @param {HTMLElement} control
   * @returns {HTMLButtonElement | null}
   */
  function getCopyButton(control) {
    const copyButton = control.querySelector("[data-copy-button]");
    return copyButton instanceof HTMLButtonElement ? copyButton : null;
  }

  /**
   * @param {HTMLButtonElement} copyButton
   * @returns {string}
   */
  function getCopyTitle(copyButton) {
    return copyButton.dataset.copyTitle ?? "Copy URL";
  }

  /**
   * @param {HTMLButtonElement} copyButton
   * @returns {string}
   */
  function getDefaultButtonLabel(copyButton) {
    return copyButton.dataset.copyDefaultLabel ?? "Copy";
  }

  /**
   * @param {HTMLButtonElement} copyButton
   * @returns {HTMLElement | null}
   */
  function getButtonLabelElement(copyButton) {
    const labelElement = copyButton.querySelector("[data-copy-button-label]");
    return labelElement instanceof HTMLElement ? labelElement : null;
  }

  /**
   * @param {HTMLButtonElement} copyButton
   * @returns {string}
   */
  function getCopiedButtonLabel(copyButton) {
    return copyButton.dataset.copyCopiedLabel ?? "Copied";
  }

  /**
   * @param {HTMLButtonElement} copyButton
   * @returns {string}
   */
  function getErrorButtonLabel(copyButton) {
    return copyButton.dataset.copyErrorLabel ?? "Cannot copy";
  }

  /**
   * @param {HTMLElement} control
   * @returns {string}
   */
  function getCopyLabel(control) {
    return control.dataset.copyLabel ?? "Feed";
  }

  /**
   * @param {HTMLElement} control
   * @returns {string}
   */
  function getCopiedStatusMessage(control) {
    return control.dataset.copyCopiedStatus ??
      `${getCopyLabel(control)} URL copied`;
  }

  /**
   * @param {HTMLElement} control
   * @returns {string}
   */
  function getErrorStatusMessage(control) {
    return control.dataset.copyErrorStatus ??
      `Cannot copy ${getCopyLabel(control)} URL`;
  }

  /**
   * @param {HTMLElement} control
   * @param {string} message
   * @returns {void}
   */
  function setStatusMessage(control, message) {
    const statusElement = getStatusElement(control);
    if (statusElement === null) {
      return;
    }

    statusElement.textContent = message;
  }

  /**
   * @param {HTMLElement} control
   * @param {CopyState} state
   * @returns {void}
   */
  function setCopyState(control, state) {
    const copyButton = getCopyButton(control);
    const isCopied = state === "copied";
    const isError = state === "error";
    const statusMessage = isCopied
      ? getCopiedStatusMessage(control)
      : isError
      ? getErrorStatusMessage(control)
      : "";

    control.dataset.copyState = state;
    control.classList.toggle("feed-copy-control--copied", isCopied);
    control.classList.toggle("feed-copy-control--error", isError);
    setStatusMessage(control, statusMessage);

    if (copyButton !== null) {
      const nextLabel = isCopied
        ? getCopiedButtonLabel(copyButton)
        : isError
        ? getErrorButtonLabel(copyButton)
        : getDefaultButtonLabel(copyButton);
      const labelElement = getButtonLabelElement(copyButton);

      if (labelElement !== null) {
        labelElement.textContent = nextLabel;
      } else {
        copyButton.textContent = nextLabel;
      }

      copyButton.setAttribute(
        "aria-label",
        state === "idle" ? getCopyTitle(copyButton) : statusMessage,
      );
      copyButton.setAttribute(
        "title",
        isCopied
          ? statusMessage
          : isError
          ? statusMessage
          : getCopyTitle(copyButton),
      );
    }
  }

  /**
   * @param {HTMLElement} control
   * @returns {void}
   */
  function clearCopyStateLater(control) {
    const existingTimer = resetTimers.get(control);

    if (existingTimer !== undefined) {
      clearTimeout(existingTimer);
    }

    const nextTimer = globalThis.setTimeout(() => {
      setCopyState(control, "idle");
      resetTimers.delete(control);
    }, copiedStateDurationMs);

    resetTimers.set(control, nextTimer);
  }

  /**
   * @param {string} pathname
   * @returns {string}
   */
  function toAbsoluteUrl(pathname) {
    return new URL(pathname, globalThis.location.origin).href;
  }

  /**
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
        // Fall back to a manual copy path when the async clipboard API
        // is unavailable for the current browser context.
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
    textArea.style.pointerEvents = "none";
    textArea.style.whiteSpace = "pre";
    globalThis.document.body.append(textArea);
    textArea.focus();
    textArea.select();

    try {
      return globalThis.document.execCommand("copy");
    } catch {
      return false;
    } finally {
      textArea.remove();

      if (selection !== null) {
        selection.removeAllRanges();
      }

      if (
        activeElement instanceof HTMLElement ||
        activeElement instanceof SVGElement
      ) {
        activeElement.focus();
      }
    }
  }

  /**
   * @param {HTMLElement} control
   * @param {string} copyPath
   * @returns {Promise<void>}
   */
  async function handleCopy(control, copyPath) {
    setCopyState(control, "idle");
    const copied = await copyText(toAbsoluteUrl(copyPath));
    setCopyState(control, copied ? "copied" : "error");
    clearCopyStateLater(control);
  }

  for (const candidate of copyControls) {
    if (!(candidate instanceof HTMLElement)) {
      continue;
    }

    const control = candidate;

    if (control.dataset.copyBound === "true") {
      continue;
    }

    const copyButton = getCopyButton(control);

    if (copyButton === null) {
      continue;
    }

    const copyPath = copyButton.dataset.copyPath;

    if (copyPath === undefined || copyPath.length === 0) {
      continue;
    }

    control.dataset.copyBound = "true";
    copyButton.addEventListener("click", () => {
      void handleCopy(control, copyPath);
    });
  }
})();

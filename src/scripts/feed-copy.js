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
   * @param {HTMLElement} control
   * @returns {string}
   */
  function getCopyLabel(control) {
    return control.dataset.copyLabel ?? "Feed";
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
    const copyLabel = getCopyLabel(control);
    const isCopied = state === "copied";
    const isError = state === "error";
    const statusMessage = isCopied
      ? `${copyLabel} URL copied`
      : isError
      ? `Cannot copy ${copyLabel} URL`
      : "";
    const defaultLabel = `Copy ${copyLabel} URL`;

    control.dataset.copyState = state;
    control.classList.toggle("feed-copy-control--copied", isCopied);
    control.classList.toggle("feed-copy-control--error", isError);
    setStatusMessage(control, statusMessage);

    if (copyButton !== null) {
      copyButton.setAttribute(
        "aria-label",
        state === "idle" ? defaultLabel : statusMessage,
      );
      copyButton.setAttribute(
        "title",
        isCopied ? "Copied" : getCopyTitle(copyButton),
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

    if (clipboard === undefined || typeof clipboard.writeText !== "function") {
      return false;
    }

    try {
      await clipboard.writeText(text);
      return true;
    } catch {
      return false;
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
    const copyButton = getCopyButton(control);

    if (copyButton === null) {
      continue;
    }

    const copyPath = copyButton.dataset.copyPath;

    if (copyPath === undefined || copyPath.length === 0) {
      continue;
    }

    copyButton.addEventListener("click", () => {
      void handleCopy(control, copyPath);
    });
  }
})();

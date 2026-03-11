// @ts-check

(() => {
  const copyControls = globalThis.document.querySelectorAll(
    "[data-copy-control]",
  );
  const copiedStateDurationMs = 1800;
  const resetTimers = new WeakMap();

  if (copyControls.length === 0) {
    return;
  }

  function getStatusElement(control) {
    const status = control.querySelector("[data-copy-status]");
    return status instanceof HTMLElement ? status : null;
  }

  function getCopyButton(control) {
    const copyButton = control.querySelector("[data-copy-button]");
    return copyButton instanceof HTMLButtonElement ? copyButton : null;
  }

  function getCopyTitle(copyButton) {
    return copyButton.dataset.copyTitle ?? "Copy URL";
  }

  function getCopyLabel(control) {
    return control.dataset.copyLabel ?? "Feed";
  }

  function setStatusMessage(control, message) {
    const statusElement = getStatusElement(control);
    if (statusElement === null) {
      return;
    }

    statusElement.textContent = message;
  }

  function setCopyState(control, state) {
    const copyButton = getCopyButton(control);
    const copyLabel = getCopyLabel(control);
    const isCopied = state === "copied";

    control.dataset.copyState = state;
    control.classList.toggle("feed-copy-control--copied", isCopied);
    setStatusMessage(
      control,
      isCopied ? `${copyLabel} URL copied` : "",
    );

    if (copyButton !== null) {
      copyButton.setAttribute(
        "aria-label",
        isCopied ? `${copyLabel} URL copied` : `Copy ${copyLabel} URL`,
      );
      copyButton.setAttribute(
        "title",
        isCopied ? "Copied" : getCopyTitle(copyButton),
      );
    }
  }

  function clearCopiedStateLater(control) {
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

  function toAbsoluteUrl(pathname) {
    return new URL(pathname, globalThis.location.origin).href;
  }

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

    let success = false;
    try {
      success = globalThis.document.execCommand("copy");
    } catch {
      success = false;
    }

    textArea.remove();
    return success;
  }

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

  async function handleCopy(control, copyPath) {
    const copied = await copyText(toAbsoluteUrl(copyPath));
    const copyLabel = getCopyLabel(control);

    if (!copied) {
      setStatusMessage(control, `Cannot copy ${copyLabel} URL`);
      return;
    }

    setCopyState(control, "copied");
    clearCopiedStateLater(control);
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

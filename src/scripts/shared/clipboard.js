// @ts-check

/**
 * Copies text to the clipboard using the async API when available, then falls
 * back to a hidden textarea for older or restricted contexts.
 *
 * @param {Window & typeof globalThis} runtime
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export async function copyText(runtime, text) {
  const clipboard = runtime.navigator.clipboard;

  if (clipboard !== undefined && typeof clipboard.writeText === "function") {
    try {
      await clipboard.writeText(text);
      return true;
    } catch {
      // Fall back to the manual selection path below.
    }
  }

  const execCommand = typeof runtime.document.execCommand === "function"
    ? runtime.document.execCommand.bind(runtime.document)
    : null;

  if (execCommand === null) {
    return false;
  }

  const body = runtime.document.body;

  if (!(body instanceof runtime.HTMLElement)) {
    return false;
  }

  const selection = runtime.getSelection();
  const activeElement = runtime.document.activeElement;
  const textArea = runtime.document.createElement("textarea");

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
  body.append(textArea);

  try {
    textArea.focus({ preventScroll: true });
    textArea.select();
    textArea.setSelectionRange(0, textArea.value.length);
    return execCommand("copy");
  } catch {
    return false;
  } finally {
    textArea.remove();

    if (selection !== null) {
      selection.removeAllRanges();
    }

    if (
      activeElement instanceof runtime.HTMLElement ||
      activeElement instanceof runtime.SVGElement
    ) {
      activeElement.focus({ preventScroll: true });
    }
  }
}

// @ts-check

/**
 * Legacy clipboard fallback for browsers without `navigator.clipboard.writeText`.
 * This helper is loaded lazily from `post-code-copy.js` only when needed.
 *
 * @param {string} text
 * @returns {boolean}
 */
export function writeWithExecCommand(text) {
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

// @ts-check

import { copyText } from "./shared/clipboard.js";

/**
 * @typedef {"idle" | "copied" | "error"} CopyState
 */

/**
 * @typedef {{
 *   readonly control: HTMLElement;
 *   readonly copyButton: HTMLButtonElement;
 *   readonly buttonLabel: HTMLElement | null;
 *   readonly status: HTMLElement | null;
 *   readonly notice: HTMLElement | null;
 *   readonly noticeTitle: HTMLElement | null;
 *   readonly noticeMessage: HTMLElement | null;
 *   readonly copyPath: string;
 * }} CopyWidget
 */

const COPY_STATE_DURATION_MS = 1800;

/**
 * @param {Window & typeof globalThis} runtime
 * @returns {void}
 */
export function bindFeedCopy(runtime) {
  const doc = runtime.document;
  const copyControls = Array.from(doc.querySelectorAll("[data-copy-control]"))
    .filter((candidate) => candidate instanceof runtime.HTMLElement);
  /** @type {WeakMap<HTMLElement, number>} */
  const resetTimers = new WeakMap();

  if (copyControls.length === 0) {
    return;
  }

  /**
   * @param {HTMLElement} control
   * @returns {CopyWidget | null}
   */
  function createCopyWidget(control) {
    const copyButton = control.querySelector("[data-copy-button]");

    if (!(copyButton instanceof runtime.HTMLButtonElement)) {
      return null;
    }

    const copyPath = copyButton.dataset.copyPath;

    if (copyPath === undefined || copyPath.length === 0) {
      return null;
    }

    const notice = control.querySelector("[data-copy-notice]");
    const buttonLabel = copyButton.querySelector("[data-copy-button-label]");
    const status = control.querySelector("[data-copy-status]");
    const noticeTitle = notice instanceof runtime.HTMLElement
      ? notice.querySelector("[data-copy-notice-title]")
      : null;
    const noticeMessage = notice instanceof runtime.HTMLElement
      ? notice.querySelector("[data-copy-notice-message]")
      : null;

    return {
      control,
      copyButton,
      buttonLabel: buttonLabel instanceof runtime.HTMLElement
        ? buttonLabel
        : null,
      status: status instanceof runtime.HTMLElement ? status : null,
      notice: notice instanceof runtime.HTMLElement ? notice : null,
      noticeTitle: noticeTitle instanceof runtime.HTMLElement
        ? noticeTitle
        : null,
      noticeMessage: noticeMessage instanceof runtime.HTMLElement
        ? noticeMessage
        : null,
      copyPath,
    };
  }

  /**
   * @param {CopyWidget} widget
   * @returns {string}
   */
  function getCopyTitle(widget) {
    return widget.copyButton.dataset.copyTitle ?? "Copy URL";
  }

  /**
   * @param {CopyWidget} widget
   * @returns {string}
   */
  function getDefaultButtonLabel(widget) {
    return widget.copyButton.dataset.copyDefaultLabel ?? "Copy";
  }

  /**
   * @param {CopyWidget} widget
   * @returns {string}
   */
  function getCopiedButtonLabel(widget) {
    return widget.copyButton.dataset.copyCopiedLabel ?? "Copied";
  }

  /**
   * @param {CopyWidget} widget
   * @returns {string}
   */
  function getErrorButtonLabel(widget) {
    return widget.copyButton.dataset.copyErrorLabel ?? "Cannot copy";
  }

  /**
   * @param {CopyWidget} widget
   * @returns {string}
   */
  function getCopyLabel(widget) {
    return widget.control.dataset.copyLabel ?? "Feed";
  }

  /**
   * @param {CopyWidget} widget
   * @returns {string}
   */
  function getCopiedStatusMessage(widget) {
    return widget.control.dataset.copyCopiedStatus ??
      `${getCopyLabel(widget)} URL copied`;
  }

  /**
   * @param {CopyWidget} widget
   * @returns {string}
   */
  function getErrorStatusMessage(widget) {
    return widget.control.dataset.copyErrorStatus ??
      `Cannot copy ${getCopyLabel(widget)} URL`;
  }

  /**
   * @param {CopyWidget} widget
   * @returns {string}
   */
  function getSuccessNoticeTitle(widget) {
    return widget.notice?.dataset.copyNoticeSuccessTitle ?? "Copied";
  }

  /**
   * @param {CopyWidget} widget
   * @returns {string}
   */
  function getErrorNoticeTitle(widget) {
    return widget.notice?.dataset.copyNoticeErrorTitle ?? "Action failed";
  }

  /**
   * @param {CopyWidget} widget
   * @param {string} message
   * @returns {void}
   */
  function setStatusMessage(widget, message) {
    if (widget.status === null) {
      return;
    }

    widget.status.textContent = message;
  }

  /**
   * @param {CopyWidget} widget
   * @param {CopyState} state
   * @param {string} message
   * @returns {void}
   */
  function setNoticeMessage(widget, state, message) {
    const { notice } = widget;

    if (notice === null) {
      return;
    }

    const isVisible = state === "copied" || state === "error";
    const title = state === "copied"
      ? getSuccessNoticeTitle(widget)
      : state === "error"
      ? getErrorNoticeTitle(widget)
      : "";

    notice.dataset.copyNoticeState = state;
    notice.classList.toggle(
      "site-notification--success",
      state === "copied",
    );
    notice.classList.toggle(
      "site-notification--error",
      state === "error",
    );
    notice.hidden = !isVisible;

    if (widget.noticeTitle instanceof runtime.HTMLElement) {
      widget.noticeTitle.textContent = title;
    }

    if (widget.noticeMessage instanceof runtime.HTMLElement) {
      widget.noticeMessage.textContent = isVisible ? message : "";
    }
  }

  /**
   * @param {CopyWidget} widget
   * @param {CopyState} state
   * @returns {void}
   */
  function setCopyState(widget, state) {
    const isCopied = state === "copied";
    const isError = state === "error";
    const statusMessage = isCopied
      ? getCopiedStatusMessage(widget)
      : isError
      ? getErrorStatusMessage(widget)
      : "";

    widget.control.dataset.copyState = state;
    widget.control.classList.toggle("feed-copy-control--copied", isCopied);
    widget.control.classList.toggle("feed-copy-control--error", isError);
    setStatusMessage(widget, statusMessage);
    setNoticeMessage(widget, state, statusMessage);

    const nextLabel = isCopied
      ? getCopiedButtonLabel(widget)
      : isError
      ? getErrorButtonLabel(widget)
      : getDefaultButtonLabel(widget);

    if (widget.buttonLabel instanceof runtime.HTMLElement) {
      widget.buttonLabel.textContent = nextLabel;
    } else {
      widget.copyButton.textContent = nextLabel;
    }

    widget.copyButton.dataset.copyButtonState = state;
    widget.copyButton.setAttribute(
      "aria-label",
      state === "idle" ? getCopyTitle(widget) : statusMessage,
    );
    widget.copyButton.setAttribute(
      "title",
      isCopied || isError ? statusMessage : getCopyTitle(widget),
    );
  }

  /**
   * @param {CopyWidget} widget
   * @returns {void}
   */
  function clearCopyStateLater(widget) {
    const existingTimer = resetTimers.get(widget.control);

    if (existingTimer !== undefined) {
      runtime.clearTimeout(existingTimer);
    }

    const nextTimer = runtime.setTimeout(() => {
      setCopyState(widget, "idle");
      resetTimers.delete(widget.control);
    }, COPY_STATE_DURATION_MS);

    resetTimers.set(widget.control, nextTimer);
  }

  /**
   * @param {string} pathname
   * @returns {string}
   */
  function toAbsoluteUrl(pathname) {
    return new URL(pathname, runtime.location.origin).href;
  }

  /**
   * @param {CopyWidget} widget
   * @returns {Promise<void>}
   */
  async function handleCopy(widget) {
    setCopyState(widget, "idle");

    try {
      const copied = await copyText(runtime, toAbsoluteUrl(widget.copyPath));
      setCopyState(widget, copied ? "copied" : "error");
    } catch {
      setCopyState(widget, "error");
    } finally {
      clearCopyStateLater(widget);
    }
  }

  for (const control of copyControls) {
    if (control.dataset.copyBound === "true") {
      continue;
    }

    const widget = createCopyWidget(control);

    if (widget === null) {
      continue;
    }

    control.dataset.copyBound = "true";
    widget.copyButton.addEventListener("click", () => {
      void handleCopy(widget);
    });
  }
}

if (typeof window !== "undefined") {
  bindFeedCopy(window);
}

/**
 * Modal Component for Lume
 * Renders a modal dialog with accessible markup
 */

export interface ModalProps {
  id: string;
  title: string;
  content: string;
  footer?: string;
  size?: "small" | "default" | "large" | "fullscreen";
  closeable?: boolean;
  initialState?: "open" | "closed";
  closeLabel?: string;
  headerExtra?: string;
}

/**
 * Renders an accessible modal dialog.
 *
 * @param props - Modal configuration and content.
 * @returns The modal HTML markup.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import renderModal from "./Modal.ts";
 *
 * assertEquals(typeof renderModal, "function");
 * ```
 */
export default function ({
  id,
  title,
  content,
  footer = "",
  size = "default",
  closeable = true,
  initialState = "closed",
  closeLabel = "Close dialog",
  headerExtra = "",
}: ModalProps) {
  const sizeClass = size !== "default" ? ` modal--${size}` : "";

  return `
    <div
      class="modal-backdrop"
      id="${id}"
      data-state="${initialState}"
      ${initialState === "closed" ? 'aria-hidden="true"' : ""}
      role="dialog"
      aria-modal="true"
      aria-labelledby="${id}-title"
    >
      <div class="modal${sizeClass}">
        <div class="modal__header">
          <h2 class="modal__title" id="${id}-title">${title}</h2>
          ${headerExtra}
          ${
    closeable
      ? `
            <button class="modal__close" aria-label="${closeLabel}">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          `
      : ""
  }
        </div>
        <div class="modal__body">
          ${content}
        </div>
        ${
    footer
      ? `
          <div class="modal__footer">
            ${footer}
          </div>
        `
      : ""
  }
      </div>
    </div>
  `;
}

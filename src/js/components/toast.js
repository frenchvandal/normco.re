/**
 * Toast Manager
 * Handles toast notifications with auto-dismiss, progress bar, and queue management
 */

export class ToastManager {
  constructor(containerId = "toast-container") {
    this.container = document.getElementById(containerId);

    if (!this.container) {
      console.warn(`Toast container #${containerId} not found`);
      return;
    }

    this.toasts = [];
    this.maxToasts = 3;
    this.toastIdCounter = 0;

    this.eventController = new AbortController();

    // Setup event delegation for close buttons
    this.container.addEventListener("click", (e) => {
      if (e.target.closest(".toast__close")) {
        const toast = e.target.closest(".toast");
        if (toast) {
          this.dismiss(toast.id);
        }
      }
    }, { signal: this.eventController.signal });
  }

  /**
   * Show a toast notification
   * @param {Object} options - Toast options
   * @param {string} options.message - Toast message
   * @param {string} options.title - Optional toast title
   * @param {string} options.variant - Toast variant (info|success|warning|error)
   * @param {number} options.duration - Auto-dismiss duration in ms (0 = no auto-dismiss)
   * @param {boolean} options.closeable - Show close button
   * @returns {string} Toast ID
   */
  show({
    message,
    title = "",
    variant = "info",
    duration = 5000,
    closeable = true,
  }) {
    if (!this.container) return null;

    // Remove oldest toast if at max capacity
    if (this.toasts.length >= this.maxToasts) {
      this.dismiss(this.toasts[0].id);
    }

    const toastId = `toast-${++this.toastIdCounter}`;
    const toast = this.createToastElement({
      id: toastId,
      message,
      title,
      variant,
      closeable,
    });

    // Add to DOM
    this.container.appendChild(toast);

    // Trigger enter animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.setAttribute("data-state", "entering");
      });
    });

    // Track toast
    const toastData = { id: toastId, element: toast };
    this.toasts.push(toastData);

    // Auto-dismiss
    if (duration > 0) {
      toastData.timer = setTimeout(() => {
        this.dismiss(toastId);
      }, duration);

      // Add progress bar
      const progress = toast.querySelector(".toast__progress");
      if (progress) {
        progress.style.animationDuration = `${duration}ms`;
      }
    }

    return toastId;
  }

  /**
   * Dismiss a toast
   * @param {string} toastId - Toast ID to dismiss
   */
  dismiss(toastId) {
    const toastData = this.toasts.find((t) => t.id === toastId);
    if (!toastData) return;

    const { element, timer } = toastData;

    // Clear auto-dismiss timer
    if (timer) {
      clearTimeout(timer);
    }

    // Trigger exit animation
    element.setAttribute("data-state", "exiting");

    // Remove from DOM after animation
    setTimeout(() => {
      element.remove();
      this.toasts = this.toasts.filter((t) => t.id !== toastId);
    }, 300); // Match CSS animation duration
  }

  /**
   * Create toast HTML element
   */
  createToastElement({ id, message, title, variant, closeable }) {
    const toast = document.createElement("div");
    toast.className = `toast toast--${variant}`;
    toast.id = id;
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "polite");
    toast.setAttribute("data-state", "entering");

    const icon = this.getIcon(variant);

    toast.innerHTML = `
      ${icon ? `<div class="toast__icon">${icon}</div>` : ""}
      <div class="toast__content">
        ${
      title ? `<div class="toast__title">${this.escapeHtml(title)}</div>` : ""
    }
        <div class="toast__message">${this.escapeHtml(message)}</div>
      </div>
      ${
      closeable
        ? `
        <button class="toast__close" aria-label="Close notification">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="4" y1="4" x2="12" y2="12"/>
            <line x1="12" y1="4" x2="4" y2="12"/>
          </svg>
        </button>
      `
        : ""
    }
      <div class="toast__progress"></div>
    `;

    return toast;
  }

  /**
   * Get icon SVG for variant
   */
  getIcon(variant) {
    const icons = {
      success:
        `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M16 6L7.5 14.5L4 11"/>
      </svg>`,
      error:
        `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="10" cy="10" r="8"/>
        <line x1="10" y1="6" x2="10" y2="10"/>
        <line x1="10" y1="13" x2="10.01" y2="13"/>
      </svg>`,
      warning:
        `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10 2L2 17h16L10 2z"/>
        <line x1="10" y1="8" x2="10" y2="12"/>
        <line x1="10" y1="15" x2="10.01" y2="15"/>
      </svg>`,
      info:
        `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="10" cy="10" r="8"/>
        <line x1="10" y1="10" x2="10" y2="14"/>
        <line x1="10" y1="6" x2="10.01" y2="6"/>
      </svg>`,
    };

    return icons[variant] || icons.info;
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Convenience methods
   */
  success(message, duration = 5000) {
    return this.show({ message, variant: "success", duration });
  }

  error(message, duration = 5000) {
    return this.show({ message, variant: "error", duration });
  }

  warning(message, duration = 5000) {
    return this.show({ message, variant: "warning", duration });
  }

  info(message, duration = 5000) {
    return this.show({ message, variant: "info", duration });
  }

  /**
   * Dismiss all toasts
   */
  dismissAll() {
    [...this.toasts].forEach((toast) => {
      this.dismiss(toast.id);
    });
  }

  destroy() {
    this.eventController.abort();

    this.toasts.forEach(({ element, timer }) => {
      if (timer) clearTimeout(timer);
      element.remove();
    });

    this.toasts = [];
  }
}

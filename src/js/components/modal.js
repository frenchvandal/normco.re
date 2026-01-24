/**
 * Modal Manager
 * Handles modal open/close, focus trap, keyboard navigation, and accessibility
 */

export class ModalManager {
  /**
   * Initialize all modals on the page
   */
  static initAll() {
    const modals = document.querySelectorAll(".modal-backdrop");
    modals.forEach((backdrop) => {
      if (backdrop.id) {
        new ModalManager(backdrop.id);
      }
    });
  }

  constructor(modalId) {
    this.modalId = modalId;
    this.backdrop = document.getElementById(modalId);

    this.eventController = new AbortController();

    this.keyController = null;

    if (!this.backdrop) {
      console.warn(`Modal #${modalId} not found`);
      return;
    }

    this.modal = this.backdrop.querySelector(".modal");
    this.closeButtons = this.backdrop.querySelectorAll(".modal__close");
    this.isOpen = false;
    this.previousFocus = null;
    this.focusableElements = null;

    this.init();
  }

  init() {
    // Close button listeners
    this.closeButtons.forEach((btn) => {
      btn.addEventListener("click", () => this.close(), {
        signal: this.eventController.signal,
      });
    });

    // Backdrop click to close
    this.backdrop.addEventListener("click", (e) => {
      if (e.target === this.backdrop) {
        this.close();
      }
    }, { signal: this.eventController.signal });

    // Keyboard listeners
    this.handleKeyboard = this.handleKeyboard.bind(this);

    // Check if modal should be open initially
    if (this.backdrop.getAttribute("data-state") === "open") {
      this.open();
    }
  }

  /**
   * Open the modal
   */
  open() {
    if (this.isOpen) return;

    // Store current focus
    this.previousFocus = document.activeElement;

    // Set state
    this.isOpen = true;
    this.backdrop.setAttribute("data-state", "open");
    this.backdrop.removeAttribute("aria-hidden");

    // Get focusable elements
    this.updateFocusableElements();

    // Focus first element
    if (this.focusableElements.length > 0) {
      this.focusableElements[0].focus();
    }

    // Add keyboard listener
    document.addEventListener("keydown", this.handleKeyboard);
    this.keyController = new AbortController();

    document.addEventListener("keydown", this.handleKeyboard, {
      signal: this.keyController.signal,
    });

    // Emit custom event
    this.backdrop.dispatchEvent(
      new CustomEvent("modal:open", { detail: { modalId: this.modalId } }),
    );
  }

  /**
   * Close the modal
   */
  close() {
    if (!this.isOpen) return;

    // Set state
    this.isOpen = false;
    this.backdrop.setAttribute("data-state", "closed");
    this.backdrop.setAttribute("aria-hidden", "true");

    // Remove keyboard listener
    document.removeEventListener("keydown", this.handleKeyboard);
    if (this.keyController) {
      this.keyController.abort();
      this.keyController = null;
    }

    // Restore focus
    if (this.previousFocus && this.previousFocus.focus) {
      this.previousFocus.focus();
    }

    // Emit custom event
    this.backdrop.dispatchEvent(
      new CustomEvent("modal:close", { detail: { modalId: this.modalId } }),
    );
  }

  /**
   * Toggle modal state
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Handle keyboard navigation
   */
  handleKeyboard(event) {
    if (!this.isOpen) return;

    switch (event.key) {
      case "Escape":
        event.preventDefault();
        this.close();
        break;

      case "Tab":
        this.handleTab(event);
        break;
    }
  }

  /**
   * Handle Tab key for focus trap
   */
  handleTab(event) {
    if (!this.focusableElements || this.focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = this.focusableElements[0];
    const lastElement =
      this.focusableElements[this.focusableElements.length - 1];
    const activeElement = document.activeElement;

    // Shift + Tab: moving backwards
    if (event.shiftKey) {
      if (activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } // Tab: moving forwards
    else {
      if (activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  /**
   * Update list of focusable elements
   */
  updateFocusableElements() {
    const focusableSelectors = [
      "a[href]:not([disabled])",
      "button:not([disabled])",
      "textarea:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
    ].join(", ");

    this.focusableElements = Array.from(
      this.modal.querySelectorAll(focusableSelectors),
    );
  }

  /**
   * Destroy the modal manager instance
   */
  destroy() {
    document.removeEventListener("keydown", this.handleKeyboard);
    this.closeButtons.forEach((btn) => {
      btn.removeEventListener("click", () => this.close());
    });
    this.eventController.abort();
    if (this.keyController) {
      this.keyController.abort();
      this.keyController = null;
    }
    this.close();
  }
}

/**
 * Global modal API
 */
export function openModal(modalId) {
  const backdrop = document.getElementById(modalId);
  if (!backdrop) return;

  // Check if modal manager exists
  if (!backdrop._modalManager) {
    backdrop._modalManager = new ModalManager(modalId);
  }

  backdrop._modalManager.open();
}

export function closeModal(modalId) {
  const backdrop = document.getElementById(modalId);
  if (!backdrop || !backdrop._modalManager) return;

  backdrop._modalManager.close();
}

export function toggleModal(modalId) {
  const backdrop = document.getElementById(modalId);
  if (!backdrop) return;

  if (!backdrop._modalManager) {
    backdrop._modalManager = new ModalManager(modalId);
  }

  backdrop._modalManager.toggle();
}

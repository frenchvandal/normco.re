/**
 * UI components initialization
 */

import { TabsManager } from "../components/tabs.js";
import { ToastManager } from "../components/toast.js";
import {
  closeModal,
  ModalManager,
  openModal,
  toggleModal,
} from "../components/modal.js";

export function initializeUIComponents() {
  // Initialize tabs
  TabsManager.initAll();

  // Initialize toast manager (global)
  const toastManager = new ToastManager();
  globalThis.toast = toastManager;

  // Initialize modals
  ModalManager.initAll();

  // Expose modal API globally
  globalThis.openModal = openModal;
  globalThis.closeModal = closeModal;
  globalThis.toggleModal = toggleModal;
}

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

/**
 * Initialize all interactive UI components and expose global helpers.
 *
 * @param {object} [dependencies] - Optional dependency overrides (mainly for tests).
 * @param {{ initAll: () => void }} [dependencies.TabsManager] - Tabs manager.
 * @param {new () => object} [dependencies.ToastManager] - Toast manager constructor.
 * @param {{ initAll: () => void }} [dependencies.ModalManager] - Modal manager.
 * @param {(id: string) => void} [dependencies.openModal] - Open modal helper.
 * @param {(id: string) => void} [dependencies.closeModal] - Close modal helper.
 * @param {(id: string) => void} [dependencies.toggleModal] - Toggle modal helper.
 *
 * @example
 * ```js
 * import { assertEquals } from "@std/assert";
 * import { initializeUIComponents } from "./ui-components.js";
 *
 * const calls = [];
 * const mockDeps = {
 *   TabsManager: { initAll: () => calls.push("tabs") },
 *   ToastManager: class {
 *     constructor() {
 *       calls.push("toast");
 *     }
 *   },
 *   ModalManager: { initAll: () => calls.push("modals") },
 *   openModal: () => {},
 *   closeModal: () => {},
 *   toggleModal: () => {},
 * };
 *
 * initializeUIComponents(mockDeps);
 * assertEquals(calls, ["tabs", "toast", "modals"]);
 * ```
 */
export function initializeUIComponents(dependencies = {}) {
  const {
    TabsManager: TabsManagerImpl = TabsManager,
    ToastManager: ToastManagerImpl = ToastManager,
    ModalManager: ModalManagerImpl = ModalManager,
    openModal: openModalImpl = openModal,
    closeModal: closeModalImpl = closeModal,
    toggleModal: toggleModalImpl = toggleModal,
  } = dependencies;

  // Initialize tabs
  TabsManagerImpl.initAll();

  // Initialize toast manager (global)
  const toastManager = new ToastManagerImpl();
  globalThis.toast = toastManager;

  // Initialize modals
  ModalManagerImpl.initAll();

  // Expose modal API globally
  globalThis.openModal = openModalImpl;
  globalThis.closeModal = closeModalImpl;
  globalThis.toggleModal = toggleModalImpl;
}

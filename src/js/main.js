/**
 * Main JavaScript file for the site
 * Handles theme switching, search initialization, UI components, and accessibility features
 */

// ============================================================================
// Feature Imports
// ============================================================================

import { initAccessKeys } from "./features/accesskeys.js";
import { enhanceAnchors } from "./features/anchors.js";
import { initCodeCopy } from "./features/code-copy.js";
import { enhanceExternalLinks } from "./features/external-links.js";
import { enhanceImages } from "./features/images.js";
import { initLanguageSelector } from "./features/lang-selector.js";
import { initScrollToTop } from "./features/scroll-to-top.js";
import { initSearch } from "./features/search.js";
import { initSearchModal } from "./features/search-modal.js";
import { initShareCopy } from "./features/share-copy.js";
import { createThemeManager } from "./features/theme.js";
import { enhanceTOC } from "./features/toc.js";

// ============================================================================
// Core Imports
// ============================================================================

import { exposeThemeGlobals } from "./core/globals.js";
import { initializeUIComponents } from "./core/ui-components.js";

// ============================================================================
// Initialization
// ============================================================================

// Initialize theme manager immediately (before DOM ready)
const themeManager = createThemeManager();
themeManager.init();

// Initialize all features
function initializeFeatures() {
  initSearch();
  initSearchModal();
  initScrollToTop();
  initAccessKeys();
  initLanguageSelector();
  enhanceImages();
  const defer = globalThis.requestIdleCallback
    ? globalThis.requestIdleCallback
    : (callback) => setTimeout(callback, 0);

  defer(() => {
    enhanceExternalLinks();
    enhanceAnchors();
    enhanceTOC();
    initCodeCopy();
    initShareCopy();
  });

  // Initialize UI components
  initializeUIComponents();
}

// Initialize everything else when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeFeatures);
} else {
  initializeFeatures();
}

exposeThemeGlobals(themeManager);

// ============================================================================
// Service Worker
// ============================================================================

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  const buildId = document.documentElement.dataset.buildId;
  const swUrl = buildId
    ? `/sw.js?build=${encodeURIComponent(buildId)}`
    : "/sw.js";

  // Track if a SW was already controlling the page (not first visit)
  const wasControlled = Boolean(navigator.serviceWorker.controller);

  globalThis.addEventListener("load", () => {
    navigator.serviceWorker.register(swUrl).catch((error) => {
      console.warn("Service worker registration failed:", error);
    });
  });

  // Listen for update messages from service worker
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data?.type === "SW_UPDATED" && wasControlled) {
      // Only show toast if SW was already controlling (real update, not first visit)
      const showUpdateToast = () => {
        if (!globalThis.toast) {
          return;
        }

        const toastId = globalThis.toast.show({
          message: "Site updated. Click to refresh.",
          variant: "info",
          duration: 0,
          closeable: true,
        });

        // Make toast clickable to refresh
        if (toastId) {
          const toastElement = document.getElementById(toastId);
          if (toastElement) {
            toastElement.style.cursor = "pointer";
            toastElement.addEventListener("click", (e) => {
              // Don't refresh if clicking close button
              if (!e.target.closest(".toast__close")) {
                globalThis.location.reload();
              }
            });
          }
        }
      };

      // Wait for toast manager if not ready yet
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
          // Small delay to ensure UI components are initialized
          setTimeout(showUpdateToast, 100);
        }, { once: true });
      } else {
        // DOM ready, but toast might still be initializing
        setTimeout(showUpdateToast, 100);
      }
    }
  });
}

registerServiceWorker();

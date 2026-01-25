/**
 * Main JavaScript file for the site
 * Handles theme switching, search initialization, UI components, and accessibility features
 */

// ============================================================================
// Feature Imports
// ============================================================================

import { enhanceAnchors } from "./features/anchors.js";
import { enhanceExternalLinks } from "./features/external-links.js";
import { enhanceImages } from "./features/images.js";
import { initSearch } from "./features/search.js";
import { initSearchModal } from "./features/search-modal.js";
import {
  initializeServiceWorkerNotifications,
  prefetchAdjacentPosts,
} from "./features/service-worker.js";
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
  enhanceImages();
  const defer = globalThis.requestIdleCallback
    ? globalThis.requestIdleCallback
    : (callback) => setTimeout(callback, 0);

  defer(() => {
    enhanceExternalLinks();
    enhanceAnchors();
    enhanceTOC();
  });

  // Initialize UI components
  initializeUIComponents();

  // Service worker enhancements
  initializeServiceWorkerNotifications();
  prefetchAdjacentPosts();
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

  globalThis.addEventListener("load", () => {
    navigator.serviceWorker.register(swUrl).catch((error) => {
      console.warn("Service worker registration failed:", error);
      if (globalThis.toast?.error) {
        globalThis.toast.error(
          "Service worker registration failed. Offline features may be limited.",
          6000,
        );
      }
    });
  });
}

registerServiceWorker();

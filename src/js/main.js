/**
 * Main JavaScript file for the site
 * Handles theme switching, search initialization, UI components, and accessibility features
 */

// ==========================================================================
// Component Imports
// ==========================================================================

import { TabsManager } from "./components/tabs.js";
import { ToastManager } from "./components/toast.js";
import {
  closeModal,
  ModalManager,
  openModal,
  toggleModal,
} from "./components/modal.js";

// ==========================================================================
// Theme Management
// ==========================================================================

class ThemeManager {
  constructor() {
    this.theme = this.getInitialTheme();
    this.themeToggle = null;
    this.init();
  }

  getInitialTheme() {
    // Check localStorage first (with error handling)
    try {
      const stored = localStorage.getItem("theme");
      if (stored) return stored;
    } catch (e) {
      console.warn("localStorage unavailable, using system preference:", e);
    }

    // Check system preference
    try {
      return globalThis.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } catch (e) {
      console.warn("matchMedia unavailable, defaulting to light theme:", e);
      return "light";
    }
  }

  init() {
    // Apply theme immediately to prevent flash
    document.documentElement.dataset.theme = this.theme;

    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.setup());
    } else {
      this.setup();
    }

    // Listen for system theme changes
    try {
      globalThis
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", (e) => {
          try {
            if (!localStorage.getItem("theme")) {
              this.setTheme(e.matches ? "dark" : "light", false);
            }
          } catch (err) {
            console.warn(
              "Failed to check localStorage in theme listener:",
              err,
            );
          }
        });
    } catch (e) {
      console.warn("Failed to setup system theme listener:", e);
    }
  }

  setup() {
    this.themeToggle = document.getElementById("theme-toggle");
    if (!this.themeToggle) return;

    this.updateToggleState();
    this.themeToggle.addEventListener("click", () => this.toggle());

    // Update aria-label
    this.updateAriaLabel();
  }

  toggle() {
    const newTheme = this.theme === "dark" ? "light" : "dark";
    this.setTheme(newTheme, true);
  }

  setTheme(theme, saveToStorage = true) {
    this.theme = theme;

    // Add transition class for smooth theme change
    document.documentElement.classList.add("theme-transitioning");
    document.documentElement.dataset.theme = theme;

    if (saveToStorage) {
      try {
        localStorage.setItem("theme", theme);
      } catch (e) {
        console.warn("Failed to save theme to localStorage:", e);
      }
    }

    this.updateToggleState();
    this.updateAriaLabel();

    // Remove transition class after animation
    setTimeout(() => {
      document.documentElement.classList.remove("theme-transitioning");
    }, 300);
  }

  updateToggleState() {
    if (!this.themeToggle) return;
    this.themeToggle.setAttribute("data-theme", this.theme);
  }

  updateAriaLabel() {
    if (!this.themeToggle) return;
    const label = this.theme === "dark"
      ? "Switch to light mode"
      : "Switch to dark mode";
    this.themeToggle.setAttribute("aria-label", label);
  }
}

// ==========================================================================
// Search Initialization
// ==========================================================================

function initSearch() {
  const searchContainer = document.getElementById("search");
  if (!searchContainer) return;

  // Pagefind UI is loaded via the plugin
  // This just adds loading state
  searchContainer.setAttribute("aria-busy", "true");

  // Wait for Pagefind to load with Promise-based approach
  const waitForPagefind = () => {
    return new Promise((resolve, reject) => {
      const timeout = 5000;
      const interval = 100;
      let elapsed = 0;

      const check = setInterval(() => {
        if (globalThis.PagefindUI) {
          clearInterval(check);
          resolve();
        } else if (elapsed >= timeout) {
          clearInterval(check);
          reject(new Error("Pagefind failed to load within timeout"));
        }
        elapsed += interval;
      }, interval);
    });
  };

  waitForPagefind()
    .then(() => {
      new globalThis.PagefindUI({
        element: "#search",
        showSubResults: true,
        showImages: false,
        excerptLength: 15,
      });
    })
    .catch((error) => {
      console.warn("Search initialization failed:", error.message);
    })
    .finally(() => {
      searchContainer.removeAttribute("aria-busy");
    });
}

// ==========================================================================
// Image Lazy Loading Enhancement
// ==========================================================================

function enhanceImages() {
  // Add fade-in animation for lazy loaded images
  const images = document.querySelectorAll("img[loading='lazy']");

  images.forEach((img) => {
    if (img.complete) {
      img.classList.add("loaded");
    } else {
      img.addEventListener("load", () => {
        img.classList.add("loaded");
      }, { once: true });
    }
  });
}

// ==========================================================================
// External Links
// ==========================================================================

function enhanceExternalLinks() {
  const links = document.querySelectorAll("a[href^='http']");

  links.forEach((link) => {
    // Skip if it's a link to the current domain
    if (link.hostname === globalThis.location.hostname) return;

    // Add external indicator
    if (!link.hasAttribute("target")) {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    }

    // Add screen reader text
    if (!link.querySelector(".sr-only")) {
      const srText = document.createElement("span");
      srText.className = "sr-only";
      srText.textContent = " (opens in new tab)";
      link.appendChild(srText);
    }
  });
}

// ==========================================================================
// Smooth Scroll for Anchors
// ==========================================================================

function enhanceAnchors() {
  const prefersReducedMotion = globalThis.matchMedia?.(
    "(prefers-reduced-motion: reduce)",
  )?.matches;

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const href = anchor.getAttribute("href");
      if (href === "#") return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });

        // Update URL without triggering scroll
        history.pushState(null, "", href);

        // Focus the target for accessibility
        target.setAttribute("tabindex", "-1");
        target.focus();
        target.focus({ preventScroll: true });
      }
    });
  });
}

// ==========================================================================
// Table of Contents (TOC) Enhancement
// ==========================================================================

function enhanceTOC() {
  const toc = document.querySelector(".toc");
  if (!toc) return;

  // Make TOC sticky on scroll
  const tocTop = toc.offsetTop;

  let isTicking = false;
  const updateStickyState = () => {
    if (globalThis.scrollY > tocTop - 20) {
      toc.classList.add("toc-sticky");
    } else {
      toc.classList.remove("toc-sticky");
    }
    isTicking = false;
  };

  globalThis.addEventListener("scroll", () => {
    if (!isTicking) {
      isTicking = true;
      requestAnimationFrame(updateStickyState);
    }
  }, { passive: true });

  // Highlight current section in TOC
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute("id");
        const tocLink = toc.querySelector(`a[href="#${id}"]`);

        if (tocLink) {
          if (entry.isIntersecting) {
            // Remove active from all links
            toc.querySelectorAll("a").forEach((link) => {
              link.classList.remove("active");
            });
            // Add active to current
            tocLink.classList.add("active");
          }
        }
      });
    },
    { rootMargin: "-20% 0px -35% 0px" },
  );

  // Observe all headings
  document.querySelectorAll("h2[id], h3[id], h4[id]").forEach((heading) => {
    observer.observe(heading);
  });
}

// ==========================================================================
// Initialization
// ==========================================================================

// Initialize theme manager immediately (before DOM ready)
const themeManager = new ThemeManager();

// Initialize all features
function initializeFeatures() {
  initSearch();
  enhanceImages();
  enhanceExternalLinks();
  enhanceAnchors();
  enhanceTOC();

  // Initialize UI components
  initializeUIComponents();
}

// ==========================================================================
// UI Components Initialization
// ==========================================================================

function initializeUIComponents() {
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

// Initialize everything else when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeFeatures);
} else {
  initializeFeatures();
}

// Expose theme manager globally for inline script compatibility
globalThis.themeManager = themeManager;
globalThis.changeTheme = () => themeManager.toggle();

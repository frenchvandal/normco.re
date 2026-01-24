/**
 * Theme management
 */

class ThemeManager {
  constructor() {
    this.theme = this.getInitialTheme();
    this.themeToggle = null;
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

    // Show toast feedback for user-initiated theme changes
    if (saveToStorage && globalThis.toast) {
      const message = theme === "dark"
        ? "Thème sombre activé"
        : "Thème clair activé";
      globalThis.toast.info(message, 2000);
    }

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

export function createThemeManager() {
  return new ThemeManager();
}

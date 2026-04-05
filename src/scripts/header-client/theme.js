// @ts-check

/**
 * @typedef {"light" | "dark"} ColorMode
 */

/**
 * @typedef {"light" | "dark" | "system"} ThemePreference
 */

/**
 * @param {Window & typeof globalThis} runtime
 * @param {HTMLElement} root
 * @param {{ themeToggleSelector?: string }} [options]
 */
export function createThemeController(runtime, root, options = {}) {
  const doc = runtime.document;
  const themeToggleSelector = options.themeToggleSelector ?? "#theme-toggle";
  const themeMediaQuery = typeof runtime.matchMedia === "function"
    ? runtime.matchMedia("(prefers-color-scheme: dark)")
    : null;
  const themeStorageKey = "color-mode";
  const legacyThemeStorageKey = "color-scheme";

  /**
   * @returns {ThemePreference | null}
   */
  function readStoredThemePreference() {
    try {
      const storedPreference = runtime.localStorage.getItem(
        themeStorageKey,
      );

      if (
        storedPreference === "light" || storedPreference === "dark" ||
        storedPreference === "system"
      ) {
        return storedPreference;
      }

      const legacyPreference = runtime.localStorage.getItem(
        legacyThemeStorageKey,
      );

      return legacyPreference === "light" || legacyPreference === "dark"
        ? legacyPreference
        : null;
    } catch {
      return null;
    }
  }

  /**
   * @param {ThemePreference} preference
   * @returns {void}
   */
  function persistThemePreference(preference) {
    try {
      runtime.localStorage.setItem(themeStorageKey, preference);

      if (preference === "system") {
        runtime.localStorage.removeItem(legacyThemeStorageKey);
      } else {
        runtime.localStorage.setItem(legacyThemeStorageKey, preference);
      }
    } catch {
      // Ignore storage failures.
    }
  }

  /**
   * @param {ThemePreference} preference
   * @returns {ColorMode}
   */
  function resolveThemeMode(preference) {
    return preference === "system"
      ? (themeMediaQuery?.matches ? "dark" : "light")
      : preference;
  }

  /**
   * @param {ThemePreference} preference
   * @returns {void}
   */
  function applyThemePreference(preference) {
    const mode = resolveThemeMode(preference);
    root.setAttribute("data-color-mode", mode);
    root.setAttribute("data-theme-preference", preference);
    root.setAttribute("data-color-scheme", mode);
  }

  /**
   * @returns {ThemePreference}
   */
  function getCurrentThemePreference() {
    const rootPreference = root.getAttribute("data-theme-preference");

    if (
      rootPreference === "light" || rootPreference === "dark" ||
      rootPreference === "system"
    ) {
      return rootPreference;
    }

    return readStoredThemePreference() ?? "system";
  }

  /**
   * @param {ThemePreference} preference
   * @returns {ThemePreference}
   */
  function getNextThemePreference(preference) {
    if (preference === "light") {
      return "dark";
    }

    if (preference === "dark") {
      return "system";
    }

    return "light";
  }

  /**
   * @param {HTMLButtonElement} button
   * @param {ThemePreference} preference
   * @returns {void}
   */
  function updateThemeToggleAccessibility(button, preference) {
    const nextPreference = getNextThemePreference(preference);
    const label = nextPreference === "light"
      ? (button.dataset.labelSwitchLight ?? "Switch to light theme")
      : nextPreference === "dark"
      ? (button.dataset.labelSwitchDark ?? "Switch to dark theme")
      : (button.dataset.labelFollowSystem ?? "Follow system theme");

    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
  }

  /**
   * @returns {void}
   */
  function setup() {
    const button = doc.querySelector(themeToggleSelector);

    if (!(button instanceof runtime.HTMLButtonElement)) {
      return;
    }

    const preference = getCurrentThemePreference();
    applyThemePreference(preference);
    updateThemeToggleAccessibility(button, preference);

    const handleSystemThemeChange = () => {
      if (getCurrentThemePreference() !== "system") {
        return;
      }

      applyThemePreference("system");
      updateThemeToggleAccessibility(button, "system");
    };

    if (typeof themeMediaQuery?.addEventListener === "function") {
      themeMediaQuery.addEventListener("change", handleSystemThemeChange);
    } else if (typeof themeMediaQuery?.addListener === "function") {
      themeMediaQuery.addListener(handleSystemThemeChange);
    }
  }

  /**
   * @returns {void}
   */
  function toggle() {
    const button = doc.querySelector(themeToggleSelector);

    if (!(button instanceof runtime.HTMLButtonElement)) {
      return;
    }

    const nextPreference = getNextThemePreference(getCurrentThemePreference());
    applyThemePreference(nextPreference);
    persistThemePreference(nextPreference);
    updateThemeToggleAccessibility(button, nextPreference);
  }

  return {
    setup,
    toggle,
  };
}

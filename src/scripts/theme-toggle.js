// @ts-check
(() => {
  /** @typedef {"light" | "dark"} ColorMode */
  /** @typedef {"light" | "dark" | "system"} ThemePreference */
  const root = globalThis.document.documentElement;
  const button = globalThis.document.getElementById("theme-toggle");
  const mediaQuery = globalThis.matchMedia("(prefers-color-scheme: dark)");
  const STORAGE_KEY = "color-mode";
  const LEGACY_STORAGE_KEY = "color-scheme";

  if (button === null) {
    return;
  }

  const themeToggleButton = button;
  const switchToLightLabel = themeToggleButton.dataset.labelSwitchLight ??
    "Switch to light theme";
  const switchToDarkLabel = themeToggleButton.dataset.labelSwitchDark ??
    "Switch to dark theme";
  const followSystemLabel = themeToggleButton.dataset.labelFollowSystem ??
    "Follow system theme";

  /** @returns {ThemePreference | null} */
  function readStoredPreference() {
    try {
      const storedPreference = globalThis.localStorage.getItem(STORAGE_KEY);

      if (
        storedPreference === "light" || storedPreference === "dark" ||
        storedPreference === "system"
      ) {
        return storedPreference;
      }

      const legacyPreference = globalThis.localStorage.getItem(
        LEGACY_STORAGE_KEY,
      );

      return legacyPreference === "light" || legacyPreference === "dark"
        ? legacyPreference
        : null;
    } catch {
      return null;
    }
  }

  /** @param {ThemePreference} preference */
  function persistPreference(preference) {
    try {
      globalThis.localStorage.setItem(STORAGE_KEY, preference);

      if (preference === "system") {
        globalThis.localStorage.removeItem(LEGACY_STORAGE_KEY);
      } else {
        globalThis.localStorage.setItem(LEGACY_STORAGE_KEY, preference);
      }
    } catch {
      // Ignore storage failures (private mode, blocked storage, etc.).
    }
  }

  /** @param {ThemePreference} preference */
  function resolveEffectiveMode(preference) {
    return preference === "system"
      ? (mediaQuery.matches ? "dark" : "light")
      : preference;
  }

  /** @param {ThemePreference} preference */
  function applyPreference(preference) {
    const mode = resolveEffectiveMode(preference);
    root.setAttribute("data-light-theme", "light");
    root.setAttribute("data-dark-theme", "dark");
    root.setAttribute("data-color-mode", mode);
    root.setAttribute("data-theme-preference", preference);
    // Keep backward compatibility for selectors still using the old attribute.
    root.setAttribute("data-color-scheme", mode);
  }

  /** @returns {ThemePreference} */
  function getCurrentPreference() {
    const rootPreference = root.getAttribute("data-theme-preference");

    if (
      rootPreference === "light" || rootPreference === "dark" ||
      rootPreference === "system"
    ) {
      return rootPreference;
    }

    return readStoredPreference() ?? "system";
  }

  /** @param {ThemePreference} preference */
  function getNextPreference(preference) {
    if (preference === "light") return "dark";
    if (preference === "dark") return "system";
    return "light";
  }

  /** @param {ThemePreference} preference */
  function updateToggleAccessibility(preference) {
    const nextPreference = getNextPreference(preference);
    const nextLabel = nextPreference === "light"
      ? switchToLightLabel
      : nextPreference === "dark"
      ? switchToDarkLabel
      : followSystemLabel;

    themeToggleButton.setAttribute("aria-label", nextLabel);
    themeToggleButton.setAttribute("title", nextLabel);
  }

  const currentPreference = getCurrentPreference();
  applyPreference(currentPreference);
  updateToggleAccessibility(currentPreference);

  themeToggleButton.addEventListener("click", () => {
    const nextPreference = getNextPreference(getCurrentPreference());

    applyPreference(nextPreference);
    persistPreference(nextPreference);
    updateToggleAccessibility(nextPreference);
  });

  mediaQuery.addEventListener("change", () => {
    if (getCurrentPreference() !== "system") {
      return;
    }

    applyPreference("system");
    updateToggleAccessibility("system");
  });
})();

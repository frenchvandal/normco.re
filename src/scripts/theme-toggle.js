// @ts-check

(() => {
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

  function readStoredMode() {
    try {
      return globalThis.localStorage.getItem(STORAGE_KEY) ??
        globalThis.localStorage.getItem(LEGACY_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  function persistMode(mode) {
    try {
      globalThis.localStorage.setItem(STORAGE_KEY, mode);
      globalThis.localStorage.setItem(LEGACY_STORAGE_KEY, mode);
    } catch {
      // Ignore storage failures (private mode, blocked storage, etc.).
    }
  }

  function applyMode(mode) {
    root.setAttribute("data-light-theme", "light");
    root.setAttribute("data-dark-theme", "dark");
    root.setAttribute("data-color-mode", mode);
    // Keep backward compatibility for selectors still using the old attribute.
    root.setAttribute("data-color-scheme", mode);
  }

  function getEffectiveMode() {
    const value = root.getAttribute("data-color-mode") ??
      root.getAttribute("data-color-scheme") ?? readStoredMode();

    if (value === "light" || value === "dark") {
      return value;
    }

    return mediaQuery.matches ? "dark" : "light";
  }

  function updateToggleAccessibility(mode) {
    themeToggleButton.setAttribute(
      "aria-label",
      mode === "dark" ? switchToLightLabel : switchToDarkLabel,
    );
    themeToggleButton.setAttribute("aria-pressed", String(mode === "dark"));
  }

  const currentMode = getEffectiveMode();
  applyMode(currentMode);
  updateToggleAccessibility(currentMode);

  themeToggleButton.addEventListener("click", () => {
    const nextMode = getEffectiveMode() === "dark" ? "light" : "dark";

    applyMode(nextMode);
    persistMode(nextMode);
    updateToggleAccessibility(nextMode);
  });

  mediaQuery.addEventListener("change", () => {
    if (readStoredMode() !== null) {
      return;
    }

    const preferredMode = mediaQuery.matches ? "dark" : "light";
    applyMode(preferredMode);
    updateToggleAccessibility(preferredMode);
  });
})();

/**
 * Global API exposure
 */

export function exposeThemeGlobals(themeManager) {
  // Expose theme manager globally for inline script compatibility
  globalThis.themeManager = themeManager;
  globalThis.changeTheme = () => themeManager.toggle();
}

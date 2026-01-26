/**
 * Global API exposure.
 *
 * @param {{ toggle: () => void }} themeManager - Theme manager instance.
 *
 * @example
 * ```js
 * import { assertEquals } from "@std/assert";
 * import { exposeThemeGlobals } from "./globals.js";
 *
 * let toggled = false;
 * exposeThemeGlobals({ toggle: () => {
 *   toggled = true;
 * } });
 *
 * globalThis.changeTheme();
 * assertEquals(toggled, true);
 * ```
 */
export function exposeThemeGlobals(themeManager) {
  // Expose theme manager globally for inline script compatibility
  globalThis.themeManager = themeManager;
  globalThis.changeTheme = () => themeManager.toggle();
}

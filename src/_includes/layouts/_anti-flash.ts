/**
 * Inline script injected into `<head>` before any CSS renders.
 *
 * Reads the stored color-scheme preference from `localStorage` and applies it
 * to the `data-color-scheme` attribute on `<html>` before the browser paints,
 * preventing a flash of the wrong theme on page load.
 *
 * Intentionally minified: this runs synchronously on the critical path, so
 * every byte matters. It must remain inline — an external script loaded with
 * `defer` or `async` would arrive too late to suppress the flash.
 */
export const ANTI_FLASH_SCRIPT =
  `(()=>{const t=localStorage.getItem("color-scheme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-color-scheme",t)})();`;

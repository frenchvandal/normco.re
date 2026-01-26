/**
 * Title for the offline fallback page.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { title } from "./offline.page.ts";
 *
 * assertEquals(title, "Offline");
 * ```
 */
export const title = "Offline";

/**
 * Layout template used for the offline page.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { layout } from "./offline.page.ts";
 *
 * assertEquals(layout, "layouts/page.ts");
 * ```
 */
export const layout = "layouts/page.ts";

/**
 * Output URL for the offline page.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { url } from "./offline.page.ts";
 *
 * assertEquals(url, "/offline/");
 * ```
 */
export const url = "/offline/";

/**
 * Renders the offline fallback content.
 *
 * @returns The HTML markup for the offline page.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import renderOffline from "./offline.page.ts";
 *
 * assertEquals(typeof renderOffline, "function");
 * ```
 */
export default function () {
  return `
  <p>You appear to be offline. Please reconnect to load the latest content.</p>
  <p>If you visited this page before, some articles may still be available.</p>
  `;
}

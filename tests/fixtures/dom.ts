/**
 * DOM testing helpers
 *
 * Provides utilities for testing HTML output using deno-dom
 *
 * @module tests/fixtures/dom
 */

import { DOMParser, Element, HTMLDocument } from "@b-fuze/deno-dom";

/**
 * Parse an HTML string and return the document.
 *
 * @param html - The HTML string to parse.
 * @returns The parsed HTML document.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { parseHTML } from "./dom.ts";
 *
 * const doc = parseHTML("<p>Hello</p>");
 * assertEquals(doc.body.innerHTML, "<p>Hello</p>");
 * ```
 */
export function parseHTML(html: string): HTMLDocument {
  const doc = new DOMParser().parseFromString(
    `<!DOCTYPE html><html><body>${html}</body></html>`,
    "text/html",
  );
  if (!doc) {
    throw new Error("Failed to parse HTML");
  }
  return doc;
}

/**
 * Parse an HTML fragment and return the first element.
 *
 * @param html - The HTML string to parse.
 * @returns The first child element or null.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { parseFragment } from "./dom.ts";
 *
 * const el = parseFragment("<div class='test'>Content</div>");
 * assertEquals(el?.tagName, "DIV");
 * ```
 */
export function parseFragment(html: string): Element | null {
  const doc = parseHTML(html);
  return doc.body.firstElementChild;
}

/**
 * Get all elements matching a selector.
 *
 * @param html - The HTML string to parse.
 * @param selector - The CSS selector to match.
 * @returns An array of matching elements.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { queryAll } from "./dom.ts";
 *
 * const items = queryAll("<ul><li>A</li><li>B</li></ul>", "li");
 * assertEquals(items.length, 2);
 * ```
 */
export function queryAll(html: string, selector: string): Element[] {
  const doc = parseHTML(html);
  return Array.from(doc.querySelectorAll(selector));
}

/**
 * Get the first element matching a selector.
 *
 * @param html - The HTML string to parse.
 * @param selector - The CSS selector to match.
 * @returns The first matching element or null.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { query } from "./dom.ts";
 *
 * const el = query("<div><span id='test'>Hi</span></div>", "#test");
 * assertEquals(el?.textContent, "Hi");
 * ```
 */
export function query(html: string, selector: string): Element | null {
  const doc = parseHTML(html);
  return doc.querySelector(selector);
}

/**
 * Check if HTML contains an element matching the selector.
 *
 * @param html - The HTML string to parse.
 * @param selector - The CSS selector to match.
 * @returns True if an element matches, false otherwise.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { hasElement } from "./dom.ts";
 *
 * assertEquals(hasElement("<nav><a href='/'>Home</a></nav>", "nav"), true);
 * assertEquals(hasElement("<div>Content</div>", "nav"), false);
 * ```
 */
export function hasElement(html: string, selector: string): boolean {
  return query(html, selector) !== null;
}

/**
 * Get text content of all matching elements.
 *
 * @param html - The HTML string to parse.
 * @param selector - The CSS selector to match.
 * @returns An array of trimmed text contents.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { getTextContents } from "./dom.ts";
 *
 * const texts = getTextContents("<ul><li>A</li><li>B</li></ul>", "li");
 * assertEquals(texts, ["A", "B"]);
 * ```
 */
export function getTextContents(html: string, selector: string): string[] {
  const elements = queryAll(html, selector);
  return elements.map((el) => el.textContent?.trim() || "");
}

/**
 * Get attribute value from the first matching element.
 *
 * @param html - The HTML string to parse.
 * @param selector - The CSS selector to match.
 * @param attribute - The attribute name to retrieve.
 * @returns The attribute value or null.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { getAttribute } from "./dom.ts";
 *
 * const href = getAttribute("<a href='/home'>Home</a>", "a", "href");
 * assertEquals(href, "/home");
 * ```
 */
export function getAttribute(
  html: string,
  selector: string,
  attribute: string,
): string | null {
  const element = query(html, selector);
  return element?.getAttribute(attribute) ?? null;
}

/**
 * Check if an element has a specific class.
 *
 * @param html - The HTML string to parse.
 * @param selector - The CSS selector to match.
 * @param className - The class name to check for.
 * @returns True if the element has the class, false otherwise.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { hasClass } from "./dom.ts";
 *
 * assertEquals(hasClass("<div class='active'>Hi</div>", "div", "active"), true);
 * assertEquals(hasClass("<div class='active'>Hi</div>", "div", "hidden"), false);
 * ```
 */
export function hasClass(
  html: string,
  selector: string,
  className: string,
): boolean {
  const element = query(html, selector);
  return element?.classList.contains(className) ?? false;
}

/**
 * Count elements matching a selector.
 *
 * @param html - The HTML string to parse.
 * @param selector - The CSS selector to match.
 * @returns The number of matching elements.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { countElements } from "./dom.ts";
 *
 * assertEquals(countElements("<ul><li>A</li><li>B</li><li>C</li></ul>", "li"), 3);
 * ```
 */
export function countElements(html: string, selector: string): number {
  return queryAll(html, selector).length;
}

/**
 * Normalize HTML by removing extra whitespace.
 *
 * @param html - The HTML string to normalize.
 * @returns The normalized HTML string.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { normalizeHTML } from "./dom.ts";
 *
 * assertEquals(normalizeHTML("<p>  Hello  </p>"), "<p> Hello </p>");
 * ```
 */
export function normalizeHTML(html: string): string {
  return html
    .replace(/>\s+</g, "><")
    .replace(/\s+/g, " ")
    .trim();
}

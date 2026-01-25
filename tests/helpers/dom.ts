/**
 * DOM testing helpers
 *
 * Provides utilities for testing HTML output using deno-dom
 *
 * @module tests/helpers/dom
 */

import { DOMParser, Element, HTMLDocument } from "@b-fuze/deno-dom";

/**
 * Parse an HTML string and return the document
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
 * Parse an HTML fragment and return the first element
 */
export function parseFragment(html: string): Element | null {
  const doc = parseHTML(html);
  return doc.body.firstElementChild;
}

/**
 * Get all elements matching a selector
 */
export function queryAll(html: string, selector: string): Element[] {
  const doc = parseHTML(html);
  return Array.from(doc.querySelectorAll(selector));
}

/**
 * Get the first element matching a selector
 */
export function query(html: string, selector: string): Element | null {
  const doc = parseHTML(html);
  return doc.querySelector(selector);
}

/**
 * Check if HTML contains an element matching the selector
 */
export function hasElement(html: string, selector: string): boolean {
  return query(html, selector) !== null;
}

/**
 * Get text content of all matching elements
 */
export function getTextContents(html: string, selector: string): string[] {
  const elements = queryAll(html, selector);
  return elements.map((el) => el.textContent?.trim() || "");
}

/**
 * Get attribute value from the first matching element
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
 * Check if an element has a specific class
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
 * Count elements matching a selector
 */
export function countElements(html: string, selector: string): number {
  return queryAll(html, selector).length;
}

/**
 * Normalize HTML by removing extra whitespace
 */
export function normalizeHTML(html: string): string {
  return html
    .replace(/>\s+</g, "><")
    .replace(/\s+/g, " ")
    .trim();
}

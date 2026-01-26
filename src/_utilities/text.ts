/**
 * Text utility functions
 */

/**
 * Converts a string to a URL-friendly slug
 * @param input - The string to slugify
 * @returns A lowercase, hyphenated slug
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { slugify } from "./text.ts";
 *
 * assertEquals(slugify("Hello, World!"), "hello-world");
 * ```
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

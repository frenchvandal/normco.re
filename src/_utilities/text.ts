/**
 * Text utility functions
 */

/**
 * Converts a string to a URL-friendly slug
 * @param input - The string to slugify
 * @returns A lowercase, hyphenated slug
 */
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

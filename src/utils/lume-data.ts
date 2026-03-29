/**
 * Safe accessors for Lume's dynamic data objects.
 *
 * Lume injects `search`, `nav`, `comp`, and helper methods at runtime via
 * plain objects. These helpers wrap the `Reflect` ceremony into reusable
 * one-liners so page and layout code stays concise.
 */

import {
  getRecordMethod,
  getRecordValue,
  isLumeRecord,
  isMutableRecord,
} from "./type-guards.ts";

/** Call a method on a dynamic Lume object, returning `undefined` on failure. */
export function callMethod<T>(
  obj: unknown,
  key: string,
  ...args: unknown[]
): T | undefined {
  if (!isMutableRecord(obj)) return undefined;
  const fn = getRecordMethod(obj, key);
  return fn ? fn.call(obj, ...args) as T : undefined;
}

/** Query `search.pages(query, sort?, limit?)` safely. */
export function searchPages(
  search: unknown,
  query: string,
  sort = "date=desc",
  limit?: number,
): Lume.Data[] {
  const args: unknown[] = [query, sort];
  if (limit !== undefined) args.push(limit);
  const results = callMethod<unknown[]>(search, "pages", ...args);
  return Array.isArray(results) ? results.filter(isLumeRecord) : [];
}

/** Resolve raw `children` (string or `{ __html }`) into an HTML string. */
export function resolveHtmlChildren(children: unknown): string | undefined {
  if (typeof children === "string") return children;
  const html = getRecordValue(children, "__html");
  return typeof html === "string" ? html : undefined;
}

/** Extract string tags from Lume page data. */
export function resolveStringTags(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((t): t is string => typeof t === "string" && t.length > 0)
    : [];
}

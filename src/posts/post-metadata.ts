import { parseDateValue } from "../utils/date-time.ts";

/**
 * Resolves a post date value into a valid `Date` instance.
 *
 * @param value Raw date value from page data.
 * @param fallback Fallback date used when the value cannot be parsed. The
 *   default expression `new Date()` is evaluated at each call site, not once
 *   at module load. Pass an explicit `Date` for deterministic behavior (e.g.,
 *   in tests or when two calls must agree on the same timestamp).
 */
export function resolvePostDate(
  value: unknown,
  fallback: Date = new Date(),
): Date {
  return parseDateValue(value) ?? fallback;
}

export function resolveReadingMinutes(value: unknown): number | undefined {
  if (
    typeof value === "object" &&
    value !== null &&
    "minutes" in value &&
    typeof value.minutes === "number"
  ) {
    return Math.ceil(value.minutes);
  }

  return undefined;
}

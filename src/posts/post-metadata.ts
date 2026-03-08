/**
 * Resolves a post date value into a valid `Date` instance.
 *
 * @param value Raw date value from page data.
 * @param fallback Fallback date used when the value cannot be parsed.
 */
export function resolvePostDate(
  value: unknown,
  fallback: Date = new Date(),
): Date {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const parsedDate = new Date(value);
    if (!Number.isNaN(parsedDate.valueOf())) {
      return parsedDate;
    }
  }

  return fallback;
}

/** Returns rounded reading minutes when available, otherwise `undefined`. */
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

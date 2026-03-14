/**
 * Formats a copyright year range given a start year and the current year.
 *
 * - If start year equals current year: returns the start year as a string.
 * - If start year is less than current year: returns "startYear-currentYear".
 * - If start year is greater than current year: logs a warning and returns the start year.
 * - If start year is not a valid number: logs a warning and returns the current year.
 *
 * @param startYear - The year the blog or project started (YYYY format).
 * @param currentYear - The current year (defaults to Date.now() if not provided).
 * @returns A formatted copyright year string.
 *
 * @example
 * ```ts
 * formatCopyrightYears(2022, 2026); // "2022-2026"
 * formatCopyrightYears(2026, 2026); // "2026"
 * formatCopyrightYears(2030, 2026); // logs warning, returns "2030"
 * formatCopyrightYears("invalid", 2026); // logs warning, returns "2026"
 * ```
 */
export function formatCopyrightYears(
  startYear: unknown,
  currentYear: number = new Date().getFullYear(),
): string {
  const parsed = typeof startYear === "number"
    ? startYear
    : typeof startYear === "string"
    ? parseInt(startYear, 10)
    : NaN;

  if (!Number.isFinite(parsed)) {
    console.warn(
      `Copyright: blogStartYear value "${startYear}" is not in a valid YYYY format. Using current year (${currentYear}).`,
    );
    return String(currentYear);
  }

  if (parsed > currentYear) {
    console.warn(
      `Copyright: blogStartYear (${parsed}) is set to a future year. Current year is ${currentYear}.`,
    );
    return String(parsed);
  }

  if (parsed === currentYear) {
    return String(currentYear);
  }

  return `${parsed}-${currentYear}`;
}

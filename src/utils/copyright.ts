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

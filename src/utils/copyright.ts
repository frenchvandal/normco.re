const YEAR_STRING_PATTERN = /^\d{4}$/;

type FormatCopyrightYearsOptions = Readonly<{
  onInvalid?: (message: string) => void;
}>;

function parseStartYear(startYear: unknown): number {
  if (typeof startYear === "number") {
    return Number.isInteger(startYear) ? startYear : NaN;
  }

  if (typeof startYear !== "string") {
    return NaN;
  }

  const trimmedStartYear = startYear.trim();

  return YEAR_STRING_PATTERN.test(trimmedStartYear)
    ? Number(trimmedStartYear)
    : NaN;
}

export function formatCopyrightYears(
  startYear: unknown,
  currentYear: number = new Date().getFullYear(),
  options: FormatCopyrightYearsOptions = {},
): string {
  const parsed = parseStartYear(startYear);
  const { onInvalid } = options;

  if (!Number.isFinite(parsed)) {
    onInvalid?.(
      `Copyright: blogStartYear value "${startYear}" is not in a valid YYYY format. Using current year (${currentYear}).`,
    );
    return String(currentYear);
  }

  if (parsed > currentYear) {
    onInvalid?.(
      `Copyright: blogStartYear (${parsed}) is set to a future year. Using current year (${currentYear}).`,
    );
    return String(currentYear);
  }

  if (parsed === currentYear) {
    return String(currentYear);
  }

  return `${parsed}-${currentYear}`;
}

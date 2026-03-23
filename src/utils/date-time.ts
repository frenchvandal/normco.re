const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function toValidDate(date: Date): Date | undefined {
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function parseDateOnly(value: string): Date | undefined {
  try {
    const plainDate = Temporal.PlainDate.from(value);
    return new Date(plainDate.toZonedDateTime("UTC").epochMilliseconds);
  } catch {
    return undefined;
  }
}

export function parseDateValue(value: unknown): Date | undefined {
  if (value instanceof Date) {
    return toValidDate(value);
  }

  if (typeof value === "number") {
    return toValidDate(new Date(value));
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return undefined;
  }

  if (DATE_ONLY_PATTERN.test(trimmed)) {
    return parseDateOnly(trimmed);
  }

  return toValidDate(new Date(trimmed));
}

export function formatRfc3339Instant(date: Date): string {
  return Temporal.Instant.fromEpochMilliseconds(date.getTime()).toString();
}

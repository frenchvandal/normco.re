export function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

export function isMutableRecord(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isLumeData(value: unknown): value is Lume.Data {
  return typeof value === "object" && value !== null;
}

export function resolveOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function resolveOptionalTrimmedString(
  value: unknown,
): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

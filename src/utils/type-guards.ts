export function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

export function isMutableRecord(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function getRecordValue(value: unknown, key: string): unknown {
  return isMutableRecord(value) ? value[key] : undefined;
}

export type RecordMethod = (this: unknown, ...args: unknown[]) => unknown;

export function getRecordMethod(
  value: unknown,
  key: string,
): RecordMethod | undefined {
  const candidate = getRecordValue(value, key);
  return typeof candidate === "function"
    ? candidate as RecordMethod
    : undefined;
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

export function resolveOptionalStringArray(
  value: unknown,
): ReadonlyArray<string> | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const strings = value.filter((item): item is string =>
    typeof item === "string"
  );
  return strings.length > 0 ? strings : undefined;
}

export function isDocumentLike(value: unknown): value is Document {
  return typeof value === "object" &&
    value !== null &&
    "querySelector" in value &&
    typeof value.querySelector === "function";
}

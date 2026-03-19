export function asLumeData<T extends Record<string, unknown>>(
  value: T,
): Lume.Data {
  return value as unknown as Lume.Data;
}

export function asOptionalLumeData<T extends Record<string, unknown>>(
  value: T | undefined,
): Lume.Data | undefined {
  return value as unknown as Lume.Data | undefined;
}

export function asLumeHelpers<T extends Record<string, unknown>>(
  value: T,
): Lume.Helpers {
  return value as unknown as Lume.Helpers;
}

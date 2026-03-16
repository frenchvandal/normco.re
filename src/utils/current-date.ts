export type TemporalLike = {
  readonly Now?: {
    readonly plainDateISO?: () => { toString(): string };
  };
};

function getGlobalTemporal(): TemporalLike | undefined {
  return globalThis.Temporal as TemporalLike | undefined;
}

export function resolveCurrentDateIso(
  now: Date = new Date(),
  temporal: TemporalLike | undefined = getGlobalTemporal(),
): string {
  const temporalDate = temporal?.Now?.plainDateISO;

  if (typeof temporalDate === "function") {
    return temporalDate().toString();
  }

  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export type TemporalNowLike = Pick<typeof Temporal.Now, "plainDateISO">;

export function resolveCurrentDateIso(
  temporalNow: TemporalNowLike = Temporal.Now,
): string {
  return temporalNow.plainDateISO().toString();
}

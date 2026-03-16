import { faker } from "npm/faker-js";

/** Shared fixed reference date for reproducible Faker date helpers in tests. */
export const TEST_FAKER_REF_DATE = new Date("2026-03-16T00:00:00.000Z");

/**
 * Seeds Faker and pins relative date helpers to a fixed reference date.
 */
export function seedTestFaker(seed: number): void {
  faker.seed(seed);
  faker.setDefaultRefDate(TEST_FAKER_REF_DATE);
}

export { faker };

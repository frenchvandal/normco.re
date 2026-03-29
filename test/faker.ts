import { faker } from "npm/faker-js";

// Keep relative Faker date helpers deterministic across test files.
export const TEST_FAKER_REF_DATE = new Date("2026-03-16T00:00:00.000Z");

export function seedTestFaker(seed: number): void {
  faker.seed(seed);
  faker.setDefaultRefDate(TEST_FAKER_REF_DATE);
}

export { faker };

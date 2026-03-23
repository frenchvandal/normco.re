import { slugify } from "./slugify.ts";

const CMS_PROD_BRANCH_ENV_KEY = "CMS_PROD_BRANCH";
const DEFAULT_CMS_PROD_BRANCH = "master";

export { resolveCurrentDateIso } from "./current-date.ts";

export function resolveSlug(value: unknown): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error("Post slug is required.");
  }

  const normalizedSlug = slugify(value);

  if (normalizedSlug.length === 0) {
    throw new Error(`Post slug "${value}" is invalid after normalization.`);
  }

  return normalizedSlug;
}

export function resolveCmsProdBranch(
  env: Pick<typeof Deno.env, "get"> = Deno.env,
): string {
  try {
    const configuredBranch = env.get(CMS_PROD_BRANCH_ENV_KEY)?.trim();

    if (configuredBranch) {
      return configuredBranch;
    }
  } catch {
    // Ignore env lookup errors in restricted runtimes and keep the repo default.
  }

  return DEFAULT_CMS_PROD_BRANCH;
}

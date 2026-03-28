import { parseDateValue } from "../utils/date-time.ts";
import { resolveOptionalTrimmedString } from "../utils/type-guards.ts";

/**
 * Resolves a post date value into a valid `Date` instance.
 *
 * @param value Raw date value from page data.
 * @param fallback Fallback date used when the value cannot be parsed. The
 *   default expression `new Date()` is evaluated at each call site, not once
 *   at module load. Pass an explicit `Date` for deterministic behavior (e.g.,
 *   in tests or when two calls must agree on the same timestamp).
 */
export function resolvePostDate(
  value: unknown,
  fallback: Date = new Date(),
): Date {
  return parseDateValue(value) ?? fallback;
}

type PostDateLike = Readonly<{
  date?: unknown;
  update_date?: unknown;
  git_created?: unknown;
  git?: unknown;
}>;

function tryResolveDateValues(values: readonly unknown[]): Date | undefined {
  for (const value of values) {
    const resolved = parseDateValue(value);

    if (resolved) {
      return resolved;
    }
  }

  return undefined;
}

function tryResolveGitLastCommitDate(gitValue: unknown): Date | undefined {
  if (typeof gitValue !== "object" || gitValue === null) {
    return undefined;
  }

  const lastCommit = Reflect.get(gitValue, "lastCommit");

  if (typeof lastCommit !== "object" || lastCommit === null) {
    return undefined;
  }

  return tryResolveDateValues([
    Reflect.get(lastCommit, "date"),
    Reflect.get(lastCommit, "committedAt"),
  ]);
}

export function tryResolvePostCreatedDate(
  data: PostDateLike,
): Date | undefined {
  return tryResolveDateValues([data.git_created, data.date]);
}

export function resolvePostCreatedDate(
  data: PostDateLike,
  fallback: Date = new Date(),
): Date {
  return tryResolvePostCreatedDate(data) ?? fallback;
}

export function tryResolvePostUpdatedDate(
  data: PostDateLike,
): Date | undefined {
  return tryResolveDateValues([
    tryResolveGitLastCommitDate(data.git),
    data.update_date,
    data.git_created,
    data.date,
  ]);
}

export function resolvePostUpdatedDate(
  data: PostDateLike,
  fallback?: Date,
): Date {
  return tryResolvePostUpdatedDate(data) ??
    fallback ??
    resolvePostCreatedDate(data);
}

export function resolveReadingMinutes(value: unknown): number | undefined {
  if (
    typeof value === "object" &&
    value !== null &&
    "minutes" in value &&
    typeof value.minutes === "number"
  ) {
    return Math.ceil(value.minutes);
  }

  return undefined;
}

export type PostGitLastCommit = Readonly<{
  sha: string;
  shortSha: string;
  date?: string;
  url?: string;
  commitUrl?: string;
}>;

export function resolvePostGitLastCommit(
  value: unknown,
): PostGitLastCommit | undefined {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }

  const sha = resolveOptionalTrimmedString(Reflect.get(value, "sha"));
  const shortSha = resolveOptionalTrimmedString(Reflect.get(value, "shortSha"));

  if (sha === undefined || shortSha === undefined) {
    return undefined;
  }

  const url = resolveOptionalTrimmedString(Reflect.get(value, "url"));
  const date = resolveOptionalTrimmedString(Reflect.get(value, "date"));
  const commitUrl = resolveOptionalTrimmedString(
    Reflect.get(value, "commitUrl"),
  );

  return {
    sha,
    shortSha,
    ...(date ? { date } : {}),
    ...(url ? { url } : {}),
    ...(commitUrl ? { commitUrl } : {}),
  };
}

import { isMutableRecord } from "./type-guards.ts";
import { formatRfc3339Instant, parseDateValue } from "./date-time.ts";

export const JSON_FEED_VERSION = "https://jsonfeed.org/version/1.1";

export const JSON_FEED_PATH_PATTERN = /\/feed\.json$/;

export type JsonFeedItem = {
  readonly date_published?: string;
  readonly date_modified?: string;
  readonly [key: string]: unknown;
};

export type JsonFeedDocument = {
  readonly version?: string;
  readonly language?: string;
  readonly items?: ReadonlyArray<JsonFeedItem>;
  readonly [key: string]: unknown;
};

function formatJsonFeedItemContext(
  item: Record<string, unknown>,
  index: number,
): string {
  const details: string[] = [`index ${index}`];
  const id = typeof item.id === "string" && item.id.length > 0
    ? item.id
    : undefined;
  const url = typeof item.url === "string" && item.url.length > 0
    ? item.url
    : undefined;
  const title = typeof item.title === "string" && item.title.length > 0
    ? item.title
    : undefined;

  if (id !== undefined) {
    details.push(`id ${JSON.stringify(id)}`);
  }

  if (url !== undefined) {
    details.push(`url ${JSON.stringify(url)}`);
  }

  if (title !== undefined) {
    details.push(`title ${JSON.stringify(title)}`);
  }

  return `(${details.join(", ")})`;
}

function getJsonFeedValidationError(value: unknown): string | undefined {
  if (!isJsonFeedRecord(value)) {
    return "Expected a top-level JSON object.";
  }

  if (value.version !== undefined && typeof value.version !== "string") {
    return "`version` must be a string when present.";
  }

  if (value.language !== undefined && typeof value.language !== "string") {
    return "`language` must be a string when present.";
  }

  if (value.items !== undefined && !Array.isArray(value.items)) {
    return "`items` must be an array when present.";
  }

  if (!Array.isArray(value.items)) {
    return undefined;
  }

  for (const [index, item] of value.items.entries()) {
    if (!isJsonFeedRecord(item)) {
      return `items[${index}] must be an object.`;
    }

    const itemContext = formatJsonFeedItemContext(item, index);

    if (
      item.date_published !== undefined &&
      typeof item.date_published !== "string"
    ) {
      return `items[${index}].date_published must be a string ${itemContext}.`;
    }

    if (
      item.date_modified !== undefined &&
      typeof item.date_modified !== "string"
    ) {
      return `items[${index}].date_modified must be a string ${itemContext}.`;
    }
  }

  return undefined;
}

function isJsonFeedRecord(
  value: unknown,
): value is Record<string, unknown> {
  return isMutableRecord(value) && !Array.isArray(value);
}

export function isJsonFeedDocument(value: unknown): value is JsonFeedDocument {
  return getJsonFeedValidationError(value) === undefined;
}

export function parseJsonFeedDocument(source: string): JsonFeedDocument {
  const parsed = JSON.parse(source);
  const validationError = getJsonFeedValidationError(parsed);

  if (validationError !== undefined) {
    throw new TypeError(validationError);
  }

  return parsed;
}

export function toRfc3339(value: string): string {
  const date = parseDateValue(value);
  return date ? formatRfc3339Instant(date) : value;
}

// Lume's JSON feed output still needs light normalization to match the 1.1
// fields and date formats expected by downstream consumers.
export function normalizeJsonFeed(
  feed: JsonFeedDocument,
  language?: string,
): JsonFeedDocument {
  const normalized: Record<string, unknown> = {
    ...feed,
    version: JSON_FEED_VERSION,
  };

  if (
    language &&
    (typeof normalized.language !== "string" ||
      normalized.language.length === 0)
  ) {
    normalized.language = language;
  }

  if (Array.isArray(feed.items)) {
    normalized.items = feed.items.map((item) => {
      const normalizedItem: Record<string, unknown> = { ...item };

      if (typeof item.date_published === "string") {
        normalizedItem.date_published = toRfc3339(item.date_published);
      }

      if (typeof item.date_modified === "string") {
        normalizedItem.date_modified = toRfc3339(item.date_modified);
      }

      return normalizedItem;
    });
  }

  return normalized;
}

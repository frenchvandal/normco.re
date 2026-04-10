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

function isJsonFeedRecord(
  value: unknown,
): value is Record<string, unknown> {
  return isMutableRecord(value) && !Array.isArray(value);
}

function isJsonFeedItem(value: unknown): value is JsonFeedItem {
  return isJsonFeedRecord(value) &&
    (value.date_published === undefined ||
      typeof value.date_published === "string") &&
    (value.date_modified === undefined ||
      typeof value.date_modified === "string");
}

export function isJsonFeedDocument(value: unknown): value is JsonFeedDocument {
  return isJsonFeedRecord(value) &&
    (value.version === undefined || typeof value.version === "string") &&
    (value.language === undefined || typeof value.language === "string") &&
    (value.items === undefined ||
      (Array.isArray(value.items) && value.items.every(isJsonFeedItem)));
}

export function parseJsonFeedDocument(source: string): JsonFeedDocument {
  const parsed = JSON.parse(source);

  if (!isJsonFeedDocument(parsed)) {
    throw new TypeError(
      "Expected a JSON object shaped like a JSON feed document.",
    );
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

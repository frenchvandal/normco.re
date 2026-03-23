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

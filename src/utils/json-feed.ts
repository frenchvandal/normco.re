/** Normalizes Lume's JSON Feed 1.0 output to conform to JSON Feed 1.1. */

/** JSON Feed version URL for the 1.1 specification. */
export const JSON_FEED_VERSION = "https://jsonfeed.org/version/1.1";

/** Pattern matching feed.json output paths. */
export const JSON_FEED_PATH_PATTERN = /\/feed\.json$/;

/**
 * Converts a UTC date string (RFC 2822) to RFC 3339 format.
 *
 * Lume's feed plugin formats dates with `Date.toUTCString()`, producing
 * strings like `"Mon, 01 Jan 2024 00:00:00 GMT"`. JSON Feed requires
 * RFC 3339 (`"2024-01-01T00:00:00.000Z"`).
 */
export function toRfc3339(utcDateString: string): string {
  const date = new Date(utcDateString);

  if (Number.isNaN(date.getTime())) {
    return utcDateString;
  }

  return date.toISOString();
}

type JsonFeedItem = {
  date_published?: string;
  date_modified?: string;
  [key: string]: unknown;
};

type JsonFeed = {
  version?: string;
  language?: string;
  items?: JsonFeedItem[];
  [key: string]: unknown;
};

/**
 * Normalizes a parsed JSON Feed object to conform to JSON Feed 1.1.
 *
 * Applies three corrections for upstream Lume feed plugin limitations:
 * 1. Upgrades `version` from 1.0 to 1.1
 * 2. Converts `date_published` and `date_modified` from RFC 2822 to RFC 3339
 * 3. Adds the `language` field when present in feed metadata but not emitted
 */
export function normalizeJsonFeed(
  feed: JsonFeed,
  language?: string,
): JsonFeed {
  const normalized: JsonFeed = {
    ...feed,
    version: JSON_FEED_VERSION,
  };

  if (language && !feed.language) {
    normalized.language = language;
  }

  if (Array.isArray(feed.items)) {
    normalized.items = feed.items.map((item) => {
      const normalizedItem = { ...item };

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

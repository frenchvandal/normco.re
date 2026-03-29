import type {
  BlogAppViewData,
  BlogArchiveViewData,
  BlogPostViewData,
  BlogTagViewData,
} from "../view-data.ts";

export type BlogAppDataValidator<TData> = (value: unknown) => value is TData;

const ARCHIVE_STRING_FIELDS = [
  "language",
  "title",
  "lead",
  "postsCountLabel",
  "postsAriaLabel",
  "yearsAriaLabel",
  "backToTopLabel",
  "emptyStateTitle",
  "emptyStateMessage",
  "emptyStateActionHref",
  "emptyStateActionLabel",
] as const;

const TAG_STRING_FIELDS = [
  "breadcrumbAriaLabel",
  "eyebrow",
  "title",
  "postsCountLabel",
  "postsAriaLabel",
  "archiveUrl",
  "archiveLinkLabel",
  "emptyStateMessage",
] as const;

const POST_STRING_FIELDS = [
  "languageTag",
  "breadcrumbAriaLabel",
  "title",
  "publishedDateIso",
  "publishedDateLabel",
  "summaryEyebrow",
  "contentHtml",
  "detailsTitle",
  "railAriaLabel",
  "sectionsTitle",
  "tagsTitle",
  "backlinksTitle",
  "navigationAriaLabel",
  "previousLabel",
  "nextLabel",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasStringFields(
  value: Record<string, unknown>,
  keys: readonly string[],
): boolean {
  return keys.every((key) => typeof value[key] === "string");
}

function hasArrayFields(
  value: Record<string, unknown>,
  keys: readonly string[],
): boolean {
  return keys.every((key) => Array.isArray(value[key]));
}

export function isBlogArchiveViewData(
  value: unknown,
): value is BlogArchiveViewData {
  return isRecord(value) &&
    value["view"] === "archive" &&
    hasStringFields(value, ARCHIVE_STRING_FIELDS) &&
    hasArrayFields(value, ["posts"]);
}

export function isBlogTagViewData(
  value: unknown,
): value is BlogTagViewData {
  return isRecord(value) &&
    value["view"] === "tag" &&
    hasStringFields(value, TAG_STRING_FIELDS) &&
    hasArrayFields(value, ["breadcrumb", "posts"]);
}

export function isBlogPostViewData(
  value: unknown,
): value is BlogPostViewData {
  return isRecord(value) &&
    value["view"] === "post" &&
    hasStringFields(value, POST_STRING_FIELDS) &&
    hasArrayFields(
      value,
      [
        "breadcrumb",
        "summaryItems",
        "publicationDetails",
        "outline",
        "tags",
        "backlinks",
      ],
    );
}

export function isBlogAppViewData(value: unknown): value is BlogAppViewData {
  return isBlogArchiveViewData(value) || isBlogTagViewData(value) ||
    isBlogPostViewData(value);
}

export function parseBlogAppData<TData>(
  textContent: string,
  isExpectedData: BlogAppDataValidator<TData>,
): TData | undefined {
  try {
    const parsed: unknown = JSON.parse(textContent);

    if (!isExpectedData(parsed)) {
      console.error("[blog-antd] Failed to validate bootstrap data.");
      return undefined;
    }

    return parsed;
  } catch (error) {
    console.error("[blog-antd] Failed to parse bootstrap data.", error);
    return undefined;
  }
}

/**
 * Shared post-to-story resolution for listing pages (home, archive, tag).
 *
 * All three pages perform the same work: resolve date, reading time, summary,
 * then format into a display-ready shape for PostCard rendering.
 */

import {
  formatReadingTime,
  formatShortDate,
  type SiteLanguage,
} from "./i18n.ts";
import {
  resolvePostDate,
  resolveReadingMinutes,
} from "../posts/post-metadata.ts";
import { formatRfc3339Instant } from "./date-time.ts";
import { resolveOptionalString } from "./type-guards.ts";
import type {
  DateHelper,
  PostCardProps,
  PostCardRenderer,
} from "./lume-helpers.ts";

export type StoryData = {
  readonly title: string;
  readonly url: string;
  readonly summary?: string;
  readonly tags: readonly string[];
  readonly dateIso: string;
  readonly dateLabel: string;
  readonly readingLabel?: string;
};

function resolvePostTags(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((t): t is string => typeof t === "string" && t.length > 0)
    : [];
}

export function toStoryData(
  post: Lume.Data,
  language: SiteLanguage,
  dateFormat: DateHelper,
): StoryData {
  const postDate = resolvePostDate(post.date);
  const minutes = resolveReadingMinutes(post.readingInfo);
  const summary = resolveOptionalString(post.description);

  return {
    title: resolveOptionalString(post.title) ?? "",
    url: resolveOptionalString(post.url) ?? "",
    tags: resolvePostTags(post.tags),
    dateIso: dateFormat(postDate, "ATOM", language) ??
      formatRfc3339Instant(postDate),
    dateLabel: formatShortDate(postDate, language),
    ...(summary !== undefined ? { summary } : {}),
    ...(minutes !== undefined
      ? { readingLabel: formatReadingTime(minutes, language) }
      : {}),
  };
}

/** Render a post as a `<li class="archive-list-item">` using the PostCard. */
export async function renderPostListItem(
  PostCard: PostCardRenderer,
  story: StoryData,
  extraProps: Partial<PostCardProps> = {},
): Promise<string> {
  const card = await PostCard({
    title: story.title,
    url: story.url,
    dateStr: story.dateLabel,
    dateIso: story.dateIso,
    ...(story.summary !== undefined ? { summary: story.summary } : {}),
    ...(story.readingLabel !== undefined
      ? { readingLabel: story.readingLabel }
      : {}),
    ...extraProps,
  });
  return `<li class="archive-list-item">${card}</li>`;
}

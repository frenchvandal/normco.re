/**
 * Archive List Component
 * Renders a timeline-style archive list grouped by year, matching PaperMod's
 * archive aesthetic with a vertical timeline and year markers.
 *
 * @module ArchiveList
 */

/**
 * Groups an array of posts by their publication year.
 *
 * @param posts - Array of Lume post data objects.
 * @returns A Map with years as keys and arrays of posts as values, sorted
 *   descending by year.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 *
 * const posts = [
 *   { date: new Date("2024-01-15"), title: "Post A" },
 *   { date: new Date("2024-06-20"), title: "Post B" },
 *   { date: new Date("2023-03-10"), title: "Post C" },
 * ];
 *
 * const grouped = groupPostsByYear(posts);
 * assertEquals([...grouped.keys()], [2024, 2023]);
 * assertEquals(grouped.get(2024)?.length, 2);
 * assertEquals(grouped.get(2023)?.length, 1);
 * ```
 */
export function groupPostsByYear(
  posts: Lume.Data[],
): Map<number, Lume.Data[]> {
  const grouped = new Map<number, Lume.Data[]>();

  for (const post of posts) {
    const year = post.date instanceof Date
      ? post.date.getFullYear()
      : new Date(post.date as string).getFullYear();

    if (!grouped.has(year)) {
      grouped.set(year, []);
    }
    grouped.get(year)!.push(post);
  }

  // Sort by year descending
  return new Map(
    [...grouped.entries()].sort(([a], [b]) => b - a),
  );
}

/**
 * Formats a date to show month and day.
 *
 * @param date - The date to format.
 * @param lang - The language code for formatting (default: "en").
 * @returns Formatted date string (e.g., "Jan 15").
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 *
 * const date = new Date("2024-01-15");
 * const formatted = formatArchiveDate(date, "en");
 * assertEquals(formatted, "Jan 15");
 * ```
 */
export function formatArchiveDate(
  date: Date | string,
  lang = "en",
): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString(lang, {
    month: "short",
    day: "numeric",
  });
}

/**
 * Renders an archive list with posts grouped by year in a timeline style.
 *
 * @param data - Lume data containing the posts list and i18n strings.
 * @returns The HTML markup for the archive timeline.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import renderArchiveList from "./ArchiveList.ts";
 *
 * assertEquals(typeof renderArchiveList, "function");
 * ```
 */
export default function (
  { postslist, i18n, lang }: Lume.Data,
): string {
  if (!postslist || postslist.length === 0) {
    return "";
  }

  const groupedPosts = groupPostsByYear(postslist);
  const language = lang || "en";

  const yearSections: string[] = [];

  for (const [year, posts] of groupedPosts) {
    const postItems = posts.map((post: Lume.Data) => {
      const dateStr = formatArchiveDate(post.date, language);
      const draftBadge = post.draft
        ? `<span class="badge badge--small badge--draft">${
          i18n?.post?.draft || "Draft"
        }</span> `
        : "";

      return `
      <li class="archive-entry">
        <span class="archive-entry__date">${dateStr}</span>
        <a href="${post.url}" class="archive-entry__title">
          ${draftBadge}${post.title || post.url}
        </a>
      </li>`;
    }).join("\n");

    yearSections.push(`
    <div class="archive-year">
      <h2 class="archive-year__header">${year}</h2>
      <ul class="archive-year__posts">
        ${postItems}
      </ul>
    </div>`);
  }

  return `
<div class="archive-timeline">
  ${yearSections.join("\n")}
</div>
`;
}

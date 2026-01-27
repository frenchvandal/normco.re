/**
 * Post Details Component
 * Displays author, date, reading time, and tags for a post.
 *
 * @param data - Lume data containing post metadata and shared data.
 * @param helpers - Lume helpers for date formatting.
 * @returns The HTML markup for the post details block.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import renderPostDetails from "./PostDetails.ts";
 *
 * assertEquals(typeof renderPostDetails, "function");
 * ```
 */
export default function (
  {
    author,
    date,
    tags,
    readingInfo,
    i18n,
    search,
  }: Lume.Data,
  { date: dateHelper }: Lume.Helpers,
) {
  let authorHtml = "";
  if (author) {
    const authorPage = search.page(`type=author author="${author}"`);
    if (authorPage) {
      authorHtml =
        `<span class="post-meta__item">${i18n.post.by}<a data-pagefind-filter="author" href="${authorPage.url}">${author}</a></span>`;
    } else {
      authorHtml =
        `<span class="post-meta__item">${i18n.post.by}${author}</span>`;
    }
  }

  const dateHtml = `<span class="post-meta__item"><time datetime="${
    dateHelper(date, "DATETIME")
  }">${dateHelper(date, "HUMAN_DATE")}</time></span>`;
  const readingTimeHtml =
    `<span class="post-meta__item">${readingInfo.minutes} ${i18n.post.reading_time}</span>`;

  let tagsHtml = "";
  if (tags && tags.length > 0) {
    const tagLinks = tags.map((tag: string) => {
      const tagPage = search.page(`type=tag tag="${tag}"`);
      return tagPage
        ? `<li><a data-pagefind-filter="tag" href="${tagPage.url}">#${tag}</a></li>`
        : "";
    }).filter(Boolean).join("\n      ");

    if (tagLinks) {
      tagsHtml = `
  <div class="post-tags">
    <span class="post-tags__label">${i18n.search.tags}:</span>
    <ul class="post-tags__list" role="list">
      ${tagLinks}
    </ul>
  </div>`;
    }
  }

  return `
<div class="post-details">
  <div class="post-meta">
    ${authorHtml}
    ${dateHtml}
    ${readingTimeHtml}
  </div>
  ${tagsHtml}
</div>
`;
}

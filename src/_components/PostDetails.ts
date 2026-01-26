/**
 * Post Details Component
 * Displays author, date, reading time, and tags for a post
 */
export default function ({
  author,
  date,
  tags,
  readingInfo,
  i18n,
  search,
}: Lume.Data, { date: dateHelper }: Lume.Helpers) {
  let authorHtml = "";
  if (author) {
    const authorPage = search.page(`type=author author="${author}"`);
    if (authorPage) {
      authorHtml =
        `<p>${i18n.post.by}<a data-pagefind-filter="author" href="${authorPage.url}">${author}</a></p>`;
    } else {
      authorHtml = `<p>${i18n.post.by}${author}</p>`;
    }
  }

  const dateHtml = `<p><time datetime="${dateHelper(date, "DATETIME")}">${
    dateHelper(date, "HUMAN_DATE")
  }</time></p>`;
  const readingTimeHtml =
    `<p>${readingInfo.minutes} ${i18n.post.reading_time}</p>`;

  let tagsHtml = "";
  if (tags && tags.length > 0) {
    const tagLinks = tags.map((tag: string) => {
      const tagPage = search.page(`type=tag tag="${tag}"`);
      return tagPage
        ? `<a data-pagefind-filter="tag" class="badge" href="${tagPage.url}">${tag}</a>`
        : "";
    }).filter(Boolean).join("\n    ");

    if (tagLinks) {
      tagsHtml = `
  <div class="post-tags">
    ${tagLinks}
  </div>`;
    }
  }

  return `
<div class="post-details">
  ${authorHtml}

  ${dateHtml}

  ${readingTimeHtml}
  ${tagsHtml}
</div>
`;
}

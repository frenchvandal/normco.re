/** Posts archive — all posts grouped by year, newest first. */

import { resolvePostDate, resolveReadingMinutes } from "./post-metadata.ts";

/** Archive page URL. */
export const url = "/posts/";
/** Lume layout template. */
export const layout = "layouts/base.tsx";
/** Page title. */
export const title = "Writing";
/** Page meta description. */
export const description = "All posts, grouped by year.";

// Override the `type = "post"` inherited from _data.ts so this page
// is not matched by `search.pages("type=post")` or nav plugin queries.
/** Page type — overrides the inherited `"post"` to exclude this page from post queries. */
export const type = "archive";

/** Typed helpers used in this page. */
type H = {
  date: (value: unknown, format: string) => string;
};

/** Renders the posts archive page body. */
export default (data: Lume.Data, helpers: Lume.Helpers): string => {
  // Lume.Helpers is loosely typed; cast to the minimal interface declared above
  // to get type-safe access to the `date` helper (§5.4 — library boundary).
  const { date: dateFormat } = helpers as unknown as H;
  const posts = data.search.pages("type=post", "date=desc") as Lume.Data[];

  // Group posts by year.
  const currentYear = new Date().getFullYear();
  const byYear = new Map<number, Lume.Data[]>();
  for (const post of posts) {
    const postDate = resolvePostDate(post.date, new Date(currentYear, 0, 1));
    const year = postDate.getFullYear();
    const existing = byYear.get(year) ?? [];
    existing.push(post);
    byYear.set(year, existing);
  }

  const years = [...byYear.keys()].sort((a, b) => b - a);

  const sections = years.map((year) => {
    const yearPosts = byYear.get(year) ?? [];
    const postCount = yearPosts.length;
    const yearSummary = postCount === 1
      ? "1 post published"
      : `${postCount} posts published`;
    const items = yearPosts.map((post) => {
      const postDate = resolvePostDate(post.date, new Date(year, 0, 1));
      const minutes = resolveReadingMinutes(post.readingInfo);
      const readingTimePart = minutes !== undefined
        ? `<span class="archive-reading-time">${minutes} min</span>`
        : `<span></span>`;

      return `<li class="archive-item">
  <time class="archive-date" datetime="${dateFormat(postDate, "ATOM")}">${
        dateFormat(postDate, "SHORT")
      }</time>
  <a href="${post.url}" class="archive-title">${post.title}</a>
  ${readingTimePart}
</li>`;
    }).join("\n");

    return `<section class="archive-year" id="archive-year-${year}" aria-labelledby="archive-year-heading-${year}">
  <header class="archive-year-header">
    <h2 id="archive-year-heading-${year}" class="archive-year-heading">${year}</h2>
    <p class="archive-year-summary">${yearSummary}</p>
  </header>
  <ul class="archive-list">
    ${items}
  </ul>
</section>`;
  }).join("\n");

  const yearNavItems = years.map((year, index) => {
    const postCount = (byYear.get(year) ?? []).length;
    const currentAttr = index === 0 ? ' aria-current="true"' : "";

    return `<li class="archive-year-nav-item">
  <a href="#archive-year-${year}" class="archive-year-nav-link"${currentAttr}>
    <span class="archive-year-nav-label">${year}</span>
    <span class="archive-year-nav-count">${postCount}</span>
  </a>
</li>`;
  }).join("\n");

  const archiveIntro =
    `<section class="pagehead archive-pagehead" aria-labelledby="archive-title">
  <p class="pagehead-eyebrow">Archive</p>
  <h1 id="archive-title" class="archive-page-title">Writing</h1>
  <p class="pagehead-lead">All posts grouped by year, newest first.</p>
</section>`;

  const archiveBody = sections.length > 0
    ? `<section class="archive-activity" aria-label="Writing activity">
  <div class="archive-activity-main">
    ${sections}
  </div>
  <aside class="archive-year-nav" aria-label="Archive years">
    <ol class="archive-year-nav-list">
      ${yearNavItems}
    </ol>
  </aside>
</section>`
    : `<p class="blankslate">No posts published yet.</p>`;

  return `${archiveIntro}
${archiveBody}`;
};

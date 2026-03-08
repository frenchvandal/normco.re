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

    return `<section class="archive-year">
  <h2 class="archive-year-heading">${year}</h2>
  <ul class="archive-list">
    ${items}
  </ul>
</section>`;
  }).join("\n");

  return `<h1 class="archive-page-title">Writing</h1>
${sections}`;
};

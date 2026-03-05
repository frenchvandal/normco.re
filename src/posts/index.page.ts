/** Posts archive — all posts grouped by year, newest first. */

export const url = "/posts/";
export const layout = "layouts/base.ts";
export const title = "Writing";
export const description = "All posts, grouped by year.";

/** Formats a `Date` as "Mon D" (short month + day). */
function formatArchiveDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

/** Returns an ISO 8601 date string. */
function isoDate(date: Date): string {
  return date.toISOString();
}

export default function (data: Lume.Data, _helpers: Lume.Helpers): string {
  const posts = data.search.pages("type=post", "date=desc") as Lume.Data[];

  // Group posts by year.
  const byYear = new Map<number, Lume.Data[]>();
  for (const post of posts) {
    const year = post.date instanceof Date
      ? post.date.getFullYear()
      : new Date().getFullYear();
    const existing = byYear.get(year) ?? [];
    existing.push(post);
    byYear.set(year, existing);
  }

  const years = [...byYear.keys()].sort((a, b) => b - a);

  const sections = years.map((year) => {
    const yearPosts = byYear.get(year) ?? [];
    const items = yearPosts.map((post) => {
      const date = post.date instanceof Date ? post.date : new Date();
      const minutes = typeof post.readingTime === "number"
        ? Math.ceil(post.readingTime as number)
        : undefined;
      const readingTimePart = minutes !== undefined
        ? `<span class="archive-reading-time">${minutes} min</span>`
        : `<span></span>`;

      return `<li class="archive-item">
  <time class="archive-date" datetime="${isoDate(date)}">${
        formatArchiveDate(date)
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
}

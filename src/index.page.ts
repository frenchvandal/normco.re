/** Home page — hero + five most recent posts. */

export const url = "/";
export const layout = "layouts/base.ts";
export const title = "normco.re";
export const description = "Personal blog by Phiphi, based in Chengdu, China.";

/** Formats a `Date` as "Mon D" (no year — used in post cards on the home page). */
function formatShortDate(date: unknown): string {
  if (!(date instanceof Date)) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export default function (data: Lume.Data, _helpers: Lume.Helpers): string {
  const recent = data.search.pages("type=post", "date=desc", 5) as Lume.Data[];

  const postItems = recent.map((post) => {
    const date = post.date instanceof Date ? post.date : new Date();
    const minutes = typeof post.readingTime === "number"
      ? Math.ceil(post.readingTime as number)
      : undefined;
    const meta = minutes !== undefined
      ? `<span class="post-card-meta">${minutes} min read</span>`
      : "";

    return `<article class="post-card">
  <time class="post-card-date" datetime="${date.toISOString()}">${
      formatShortDate(date)
    }</time>
  <h2 class="post-card-title"><a href="${post.url}">${post.title}</a></h2>
  ${meta}
</article>`;
  }).join("\n");

  return `<section class="hero" aria-label="Introduction">
  <h1 class="hero-title">Writing about things that matter.</h1>
  <p class="hero-lead">A personal blog by Phiphi — software, culture, and everyday life from Chengdu.</p>
</section>

<section aria-label="Recent posts">
  <p class="home-section-heading">Recent</p>
  <div class="home-posts">
    ${postItems}
  </div>
  <a href="/posts/" class="home-all-posts">All posts →</a>
</section>`;
}

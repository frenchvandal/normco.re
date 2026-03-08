/** Home page — hero + five most recent posts. */

import { metas, siteName } from "./_data.ts";

/** Page URL. */
export const url = "/";
/** Page title — same as the site name for the home page. */
export const title: string = siteName;
/** Page meta description — mirrors the site-wide default. */
export const description: string = metas.description;

/** Typed helpers used in this page. */
type H = {
  date: (value: unknown, format: string) => string;
};

/** Typed component functions used on this page. */
type Comp = {
  PostCard: (props: {
    readonly title: string;
    readonly url: string;
    readonly dateStr: string;
    readonly dateIso: string;
    readonly readingMinutes?: number;
  }) => Promise<string>;
};

/** Renders the home page body. */
export default async (
  data: Lume.Data,
  helpers: Lume.Helpers,
): Promise<string> => {
  // Lume.Helpers and Lume.comp are loosely typed; cast to minimal interfaces above
  // (§5.4 — library boundary).
  const { date: dateFormat } = helpers as unknown as H;
  // Lume.comp is loosely typed; cast to the minimal Comp interface (§5.4 — library boundary).
  const { PostCard } = data.comp as unknown as Comp;
  const recent = data.search.pages("type=post", "date=desc", 5) as Lume.Data[];

  const postItems = (await Promise.all(recent.map((post) => {
    const reading = post.readingInfo as { minutes?: number } | undefined;
    const minutes = typeof reading?.minutes === "number"
      ? Math.ceil(reading.minutes)
      : undefined;

    // exactOptionalPropertyTypes: only include readingMinutes when it has a value.
    return PostCard({
      title: post.title as string,
      url: post.url as string,
      dateStr: dateFormat(post.date, "SHORT"),
      dateIso: dateFormat(post.date, "ATOM"),
      ...(minutes !== undefined ? { readingMinutes: minutes } : {}),
    });
  }))).join("\n");

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
};

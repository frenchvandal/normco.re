/** Home page — hero + five most recent posts. */

export const url = "/";
export const layout = "layouts/base.ts";
export const title = "normco.re";
export const description = "Personal blog by Phiphi, based in Chengdu, China.";

/** Typed helpers used in this page. */
type H = {
  date: (value: unknown, format: string) => string;
};

export default async function (
  data: Lume.Data,
  helpers: Lume.Helpers,
): Promise<string> {
  // Lume.Helpers is loosely typed; cast to the minimal interface declared above
  // to get type-safe access to the `date` helper (§5.4 — library boundary).
  const { date: dateFormat } = helpers as unknown as H;
  const recent = data.search.pages("type=post", "date=desc", 5) as Lume.Data[];

  const postItems = (await Promise.all(recent.map((post) => {
    const minutes = typeof post.readingTime === "number"
      ? Math.ceil(post.readingTime)
      : undefined;

    return data.comp.PostCard({
      title: post.title as string,
      url: post.url as string,
      dateStr: dateFormat(post.date, "SHORT"),
      dateIso: dateFormat(post.date, "ATOM"),
      readingTime: minutes,
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
}

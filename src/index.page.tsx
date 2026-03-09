/** Home page — hero + five most recent posts. */

import { metas, siteName } from "./_data.ts";
import {
  resolvePostDate,
  resolveReadingMinutes,
} from "./posts/post-metadata.ts";

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

  const postItems = (await Promise.all(recent.map(async (post) => {
    const postDate = resolvePostDate(post.date);
    const minutes = resolveReadingMinutes(post.readingInfo);

    // exactOptionalPropertyTypes: only include readingMinutes when it has a value.
    const card = await PostCard({
      title: post.title as string,
      url: post.url as string,
      dateStr: dateFormat(postDate, "SHORT"),
      dateIso: dateFormat(postDate, "ATOM"),
      ...(minutes !== undefined ? { readingMinutes: minutes } : {}),
    });
    return `<li class="home-posts-item">${card}</li>`;
  }))).join("\n");

  const emptyState = `<li class="home-posts-item home-posts-item--empty">
    <p class="blankslate">No posts published yet.</p>
  </li>`;

  return `<section class="pagehead hero home-pagehead" aria-labelledby="home-title">
  <p class="pagehead-eyebrow">Personal blog</p>
  <h1 id="home-title" class="hero-title">Writing about things that matter.</h1>
  <p class="hero-lead">A personal blog by Phiphi — software, culture, and everyday life from Chengdu.</p>
</section>

<section class="home-recent" aria-labelledby="home-recent-title">
  <div class="subhead">
    <h2 id="home-recent-title" class="subhead-heading">Recent writing</h2>
    <a href="/posts/" class="home-all-posts">View archive</a>
  </div>
  <ul class="home-posts">
    ${recent.length > 0 ? postItems : emptyState}
  </ul>
</section>`;
};

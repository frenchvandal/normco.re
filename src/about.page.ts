/** About page — prose introduction. */

export const url = "/about/";
export const layout = "layouts/base.ts";
export const title = "About";
export const description =
  "About Phiphi — a software person writing from Chengdu, China.";

export default function (_data: Lume.Data, _helpers: Lume.Helpers): string {
  return `<h1 class="about-title">About</h1>
<div class="about-content">
  <p>
    Hi, I'm Phiphi. I'm a software person living in Chengdu, China — a city
    known for its pandas, spicy food, and unhurried pace of life.
  </p>
  <p>
    I write about software, tools, language, and whatever else catches my
    attention. This site has no comments, no analytics, and no newsletter.
    It's just a place to think out loud.
  </p>
  <p>
    You can follow along via <a href="/feed.xml">RSS</a> or
    <a href="/feed.json">JSON Feed</a>.
  </p>
</div>`;
}

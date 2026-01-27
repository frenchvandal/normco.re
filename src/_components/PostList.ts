/**
 * Post List Component
 * Renders a list of posts with their details.
 *
 * @param data - Lume data containing the posts and helpers.
 * @param helpers - Lume helpers for markdown rendering.
 * @returns The HTML markup for the post list.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import renderPostList from "./PostList.ts";
 *
 * assertEquals(typeof renderPostList, "function");
 * ```
 */
export default async function (
  { postslist, url, comp, i18n }: Lume.Data,
  { md }: Lume.Helpers,
) {
  if (!postslist || postslist.length === 0) {
    return "";
  }

  const postItems = await Promise.all(
    postslist.map(async (post: Lume.Data) => {
      const postDetails = await comp.PostDetails({
        date: post.date,
        tags: post.tags,
        author: post.author,
        readingInfo: post.readingInfo,
      });
      const excerptHtml = post.excerpt
        ? `<div class="post-excerpt body">
      ${md(post.excerpt)}
    </div>`
        : "";

      return `
  <li class="post">
    <header class="post-header">
      <h2 class="post-title">
        <a href="${post.url}"${post.url === url ? ' aria-current="page"' : ""}>
          ${post.title || post.url}
        </a>
      </h2>

      ${postDetails}
    </header>

    ${excerptHtml}

    <a href="${post.url}" class="post-link">
      ${i18n.nav.continue_reading}
    </a>
  </li>`;
    }),
  );

  return `
<ul class="postList">
  ${postItems.join("\n")}
</ul>
`;
}

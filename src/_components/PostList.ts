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

      const coverImage = post.image
        ? await comp.CoverImage({
          src: post.image,
          alt: post.imageAlt || post.title,
          link: post.url,
          loading: "lazy",
        })
        : "";

      const excerptHtml = post.excerpt
        ? `<div class="post-excerpt body">
      ${md(post.excerpt)}
    </div>`
        : "";

      const draftBadge = post.draft
        ? `<span class="badge badge--small badge--draft">${i18n.post.draft}</span>`
        : "";

      return `
  <li class="post-entry${post.draft ? " post--draft" : ""}">
    ${coverImage}
    <header class="post-header">
      <h2 class="post-title">
        ${draftBadge}
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

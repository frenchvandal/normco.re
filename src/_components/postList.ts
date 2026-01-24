/**
 * Post List Component
 * Renders a list of posts with their details
 */
export default async function ({ postslist, url, comp }: Lume.Data) {
  if (!postslist || postslist.length === 0) {
    return "";
  }

  const postItems = await Promise.all(
    postslist.map(async (post: Lume.Data) => {
      const postDetails = await comp.postDetails({
        date: post.date,
        tags: post.tags,
        author: post.author,
        readingInfo: post.readingInfo,
      });

      return `
  <li class="post">
    <h2 class="post-title">
      <a href="${post.url}"${post.url === url ? ' aria-current="page"' : ""}>
        ${post.title || post.url}
      </a>
    </h2>

    ${postDetails}
  </li>`;
    }),
  );

  return `
<ul class="postList">
  ${postItems.join("\n")}
</ul>
`;
}

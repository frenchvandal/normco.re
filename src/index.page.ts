/**
 * Home Page
 * Homepage listing the 3 most recent posts
 */
export const layout = "layouts/base.ts";
export const bodyClass = "body-home";
export const title = "Home";

export default async function (
  { home, search, i18n, comp }: Lume.Data,
  { md }: Lume.Helpers,
) {
  const recentPosts = search.pages("type=post", "date=desc", 3);

  const postArticles = await Promise.all(
    recentPosts.map(async (post) => {
      const postDetails = await comp.postDetails({
        date: post.date,
        tags: post.tags,
        author: post.author,
        readingInfo: post.readingInfo,
      });

      return `
  <article class="post">
    <header class="post-header">
      <h2 class="post-title">
        <a href="${post.url}">
          ${post.title || post.url}
        </a>
      </h2>

      ${postDetails}
    </header>

    <div class="post-excerpt body">
      ${md(post.excerpt)}
    </div>

    <a href="${post.url}" class="post-link">
      ${i18n.nav.continue_reading}
    </a>
  </article>`;
    }),
  );

  return `
<header class="page-header">
  <h1 class="page-title u-display-title">${home.welcome}</h1>

  <div class="search" id="search" role="search" aria-label="Search posts"></div>
</header>

<section class="postList" aria-label="Recent posts">
  ${postArticles.join("\n")}
</section>

<hr>

<p>${i18n.nav.archive}</p>
`;
}

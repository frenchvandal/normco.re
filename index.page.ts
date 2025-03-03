// index.page.ts
export const title = "李北洛 Philippe";
export const stylesheet = "/styles/index.css";
export const layout = "@layouts/GlobalLayout.ts";

export default (data: Lume.Data, helpers: Lume.Helpers) => {
  const { search } = data;
  // Filter out the homepage from the search results
  const posts = search.pages("post").filter((post: any) => post.url !== "/");
  
  // Use native JavaScript for sorting by date in descending order
  posts.sort((a: any, b: any) => b.date.getTime() - a.date.getTime());
  
  const postItems = posts.map((post: any) => {
    const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    
    return `
      <article class="p-teasers__item">
        <h2 class="p-teasers__title">
          <a href="${post.url}" class="p-teasers__link">
            ${post.title}
          </a>
        </h2>
        <p class="p-teasers__date">
          <time datetime="${post.date.toISOString().split('T')[0]}">${formattedDate}</time>
        </p>
      </article>
    `;
  }).join('');
  
  return `
    <main>
      <div class="l-container">
        <section class="p-jumbotron">
          <h1 class="p-jumbotron__title">
            Welcome to
            <br />
            李北洛 Philippe's Blog
          </h1>
          <p class="p-jumbotron__description">
            This is my personal blog where I mainly write about web development.
          </p>
        </section>

        <div class="p-teasers">
          ${postItems}
        </div>
      </div>
    </main>
  `;
};
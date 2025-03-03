// index.page.ts
export const title = "李北洛 Philippe";
export const stylesheet = "/styles/index.css";
export const layout = "layouts/GlobalLayout.ts";

export default (data: Lume.Data) => {  // Remove unused helpers parameter
  const { search } = data;
  
  // Don't explicitly type the parameters - let TypeScript infer them
  const posts = search.pages("post").filter(post => post.url !== "/");
  
  // Add safety checks for date comparison
  posts.sort((a, b) => {
    const dateA = a.date instanceof Date ? a.date.getTime() : 0;
    const dateB = b.date instanceof Date ? b.date.getTime() : 0;
    return dateB - dateA;
  });
  
  const postItems = posts.map(post => {
    // Handle potential undefined date values
    const date = post.date instanceof Date ? post.date : new Date(post.date || "");
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    
    return `
      <article class="p-teasers__item">
        <h2 class="p-teasers__title">
          <a href="${post.url || '#'}" class="p-teasers__link">
            ${post.title || 'Untitled'}
          </a>
        </h2>
        <p class="p-teasers__date">
          <time datetime="${date.toISOString().split('T')[0]}">${formattedDate}</time>
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
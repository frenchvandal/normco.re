// _includes/layouts/BlogLayout.ts
export const layout = "layouts/GlobalLayout.ts";

export default (data: Lume.Data, helpers: Lume.Helpers) => {
  const { content, title, date } = data;
  
  // Format date using similar logic to the Time component
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });
  
  return `
    <main>
      <div class="l-container">
        <article class="p-blogContent">
          <header class="p-blogContent__header">
            <h1 class="p-blogContent__title">${title}</h1>
            <p class="p-blogContent__date">
              <time datetime="${date.toISOString().split('T')[0]}">${formattedDate}</time>
            </p>
          </header>
          <section class="p-blogContent__body">
            ${content}
          </section>
        </article>
      </div>
    </main>
  `;
};
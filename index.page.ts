import { LumeData, PostData, formatDate, isDate } from './types.ts';

export const title = '李北洛 Philippe';
export const stylesheet = '/styles/index.css';
export const layout = 'layouts/GlobalLayout.ts';

export default (data: LumeData) => {  
  // Get posts or use empty array if search is undefined or if pages() returns undefined
  const posts: PostData[] = data.search?.pages<PostData>('post')?.filter(
    (post: PostData) => post.url !== '/'
  ) ?? [];
  
  // Trier les posts du plus récent au plus ancien
  posts.sort((a: PostData, b: PostData) => {
    const dateA = isDate(a.date) ? a.date.getTime() : new Date(a.date || '').getTime();
    const dateB = isDate(b.date) ? b.date.getTime() : new Date(b.date || '').getTime();
    return dateB - dateA;
  });
  
  // Générer les éléments HTML pour chaque post
  const postItems = posts.map((post: PostData) => {
    return `
      <article class="p-teasers__item">
        <h2 class="p-teasers__title">
          <a href="${post.url || '#'}" class="p-teasers__link">
            ${post.title || 'Untitled'}
          </a>
        </h2>
        <p class="p-teasers__date">
          <time datetime="${new Date(post.date).toISOString().split('T')[0]}">
            ${formatDate(post.date)}
          </time>
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
import { MetaData } from './types.ts';

export const title = 'Page Not Found';
export const stylesheet = '/styles/404/index.css';
export const layout = 'layouts/GlobalLayout.ts'; 
export const metas: MetaData = {
  title: (data) => `${data.title} | 李北洛 Philippe`,
};

export default () => {
  return `
    <main>
      <div class="l-container">
        <section class="p-errorContent">
          <h1 class="p-errorContent__title">Page Not Found</h1>
          <p class="p-errorContent__description">
            The requested page was not found.
          </p>
        </section>
      </div>
    </main>
  `;
};
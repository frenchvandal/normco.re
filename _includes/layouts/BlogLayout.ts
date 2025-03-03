import { BlogLayoutData, LumeHelpers, formatDate } from '../../types.ts';

export const layout = 'layouts/GlobalLayout.ts';

export default (data: BlogLayoutData, _helpers: LumeHelpers) => {
  const { content, title, date } = data;
  
  // Utiliser la fonction formatDate pour la date
  const formattedDate = formatDate(date);
  
  // Récupérer la valeur ISO de la date pour l'attribut datetime
  const isoDate = date.toISOString().split('T')[0];
  
  return `
    <main>
      <div class="l-container">
        <article class="p-blogContent">
          <header class="p-blogContent__header">
            <h1 class="p-blogContent__title">${title}</h1>
            <p class="p-blogContent__date">
              <time datetime="${isoDate}">${formattedDate}</time>
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
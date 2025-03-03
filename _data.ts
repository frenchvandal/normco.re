import { MetaData } from './types.ts';

// Définition du layout à utiliser
export const layout = 'layouts/BlogLayout.ts';

// Définition des tags par défaut pour les pages
export const tags = ['post'];

// Feuille de style par défaut
export const stylesheet = '/styles/blog/index.css';

// Métadonnées par défaut
export const metas: MetaData = {
  title: (data) => `${data.title} | 李北洛 Philippe`,
};
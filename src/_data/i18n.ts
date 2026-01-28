/**
 * Internationalization strings
 *
 * This module exports UI strings with multilanguage support.
 * The default export provides English strings.
 * French (fr) and Chinese (zh) translations are exported as named exports
 * following Lume's Multilanguage plugin pattern.
 *
 * @module
 */

/**
 * Navigation-related strings.
 */
interface NavStrings {
  toc: string;
  next_post: string;
  previous_post: string;
  continue_reading: string;
  archive_title: string;
  archive: string;
  back: string;
  page: string;
  next: string;
  previous: string;
  home: string;
  posts: string;
}

/**
 * Post-related strings.
 */
interface PostStrings {
  by: string;
  reading_time: string;
  related_posts: string;
  draft: string;
}

/**
 * Search-related strings.
 */
interface SearchStrings {
  by_author: string;
  by_tag: string;
  tags: string;
  authors: string;
}

/**
 * Source info strings.
 */
interface SourceStrings {
  view_source: string;
  revision: string;
}

/**
 * Share button strings.
 */
interface ShareStrings {
  share: string;
  copy_link: string;
  copied: string;
}

/**
 * Author profile strings.
 */
interface AuthorStrings {
  written_by: string;
}

/**
 * Language selector strings.
 */
interface LangStrings {
  select_language: string;
  current_language: string;
}

/**
 * Complete i18n interface.
 */
export interface I18n {
  nav: NavStrings;
  post: PostStrings;
  search: SearchStrings;
  source: SourceStrings;
  share: ShareStrings;
  author: AuthorStrings;
  lang: LangStrings;
}

/**
 * English strings (default).
 */
const en: I18n = {
  nav: {
    toc: "Table of Contents",
    next_post: "Newer post →",
    previous_post: "← Older post",
    continue_reading: "Continue reading →",
    archive_title: "Archive",
    archive: 'More posts can be found in <a href="/archive/">the archive</a>.',
    back: "← Back",
    page: "Page",
    next: "Next →",
    previous: "← Previous",
    home: "Home",
    posts: "Posts",
  },
  post: {
    by: "by ",
    reading_time: "min read",
    related_posts: "Related Posts",
    draft: "Draft",
  },
  search: {
    by_author: "Posts by",
    by_tag: "Tagged",
    tags: "Tags",
    authors: "Authors",
  },
  source: {
    view_source: "View source",
    revision: "rev",
  },
  share: {
    share: "Share",
    copy_link: "Copy link",
    copied: "Copied!",
  },
  author: {
    written_by: "Written by",
  },
  lang: {
    select_language: "Select language",
    current_language: "English",
  },
};

/**
 * French translations.
 */
export const fr: I18n = {
  nav: {
    toc: "Table des matières",
    next_post: "Article suivant →",
    previous_post: "← Article précédent",
    continue_reading: "Lire la suite →",
    archive_title: "Archives",
    archive: 'Plus d\'articles dans <a href="/fr/archive/">les archives</a>.',
    back: "← Retour",
    page: "Page",
    next: "Suivant →",
    previous: "← Précédent",
    home: "Accueil",
    posts: "Articles",
  },
  post: {
    by: "par ",
    reading_time: "min de lecture",
    related_posts: "Articles similaires",
    draft: "Brouillon",
  },
  search: {
    by_author: "Articles de",
    by_tag: "Étiquette",
    tags: "Étiquettes",
    authors: "Auteurs",
  },
  source: {
    view_source: "Voir la source",
    revision: "rév",
  },
  share: {
    share: "Partager",
    copy_link: "Copier le lien",
    copied: "Copié !",
  },
  author: {
    written_by: "Écrit par",
  },
  lang: {
    select_language: "Choisir la langue",
    current_language: "Français",
  },
};

/**
 * Chinese translations.
 */
export const zh: I18n = {
  nav: {
    toc: "目录",
    next_post: "下一篇 →",
    previous_post: "← 上一篇",
    continue_reading: "继续阅读 →",
    archive_title: "归档",
    archive: '更多文章请查看<a href="/zh/archive/">归档</a>。',
    back: "← 返回",
    page: "页",
    next: "下一页 →",
    previous: "← 上一页",
    home: "首页",
    posts: "文章",
  },
  post: {
    by: "作者：",
    reading_time: "分钟阅读",
    related_posts: "相关文章",
    draft: "草稿",
  },
  search: {
    by_author: "作者文章",
    by_tag: "标签",
    tags: "标签",
    authors: "作者",
  },
  source: {
    view_source: "查看源码",
    revision: "修订",
  },
  share: {
    share: "分享",
    copy_link: "复制链接",
    copied: "已复制！",
  },
  author: {
    written_by: "作者",
  },
  lang: {
    select_language: "选择语言",
    current_language: "中文",
  },
};

/**
 * Get i18n strings for a specific language.
 *
 * @param lang - Language code (en, fr, zh).
 * @returns The i18n strings for the specified language.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { getI18n } from "./i18n.ts";
 *
 * assertEquals(getI18n("en").nav.home, "Home");
 * assertEquals(getI18n("fr").nav.home, "Accueil");
 * assertEquals(getI18n("zh").nav.home, "首页");
 * ```
 */
export function getI18n(lang: string): I18n {
  switch (lang) {
    case "fr":
      return fr;
    case "zh":
      return zh;
    default:
      return en;
  }
}

export default en;

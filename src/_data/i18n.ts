/**
 * Internationalization strings
 */

interface I18n {
  nav: {
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
  };
  post: {
    by: string;
    reading_time: string;
  };
  search: {
    by_author: string;
    by_tag: string;
    tags: string;
    authors: string;
  };
  source: {
    view_source: string;
    revision: string;
  };
}

const i18n: I18n = {
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
};

export default i18n;

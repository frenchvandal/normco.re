/** Individual post layout — chains into the base layout. */

import {
  resolvePostDate,
  resolveReadingMinutes,
} from "../../posts/post-metadata.ts";

/** This layout is itself wrapped by the base layout. */
export const layout = "layouts/base.tsx";

/** Typed helpers used in this layout. */
type H = {
  date: (value: unknown, format: string) => string;
};

/**
 * Minimal interface for the nav helper injected by the nav plugin.
 * Only the methods used in this layout are declared.
 */
type NavHelper = {
  previousPage?: (
    url: string,
    base?: string,
    query?: string,
    sort?: string,
  ) => Lume.Data | undefined;
  nextPage?: (
    url: string,
    base?: string,
    query?: string,
    sort?: string,
  ) => Lume.Data | undefined;
};

/** Minimal interface for the search helper injected by Lume. */
type SearchHelper = {
  pages: (query: string, sort?: string) => Lume.Data[];
};

/** Returns true when the candidate looks like a post URL in the expected base path. */
function isPostCandidate(
  candidate: Lume.Data | undefined,
  postsBaseUrl: string,
): boolean {
  if (candidate === undefined) {
    return false;
  }

  const candidateUrl = typeof candidate.url === "string" ? candidate.url : "";
  if (!candidateUrl.startsWith(postsBaseUrl) || candidateUrl === postsBaseUrl) {
    return false;
  }

  if (candidate.type !== undefined && candidate.type !== "post") {
    return false;
  }

  return true;
}

/** Renders the post page within the base layout. */
export default (data: Lume.Data, helpers: Lume.Helpers) => {
  // Lume.Helpers is loosely typed; cast to the minimal interface declared above
  // to get type-safe access to the `date` helper (§5.4 — library boundary).
  const { date: dateFormat } = helpers as unknown as H;

  // data.nav is typed as `unknown` by Lume; cast to the minimal NavHelper
  // interface declared above (§5.4 — library boundary).
  const n = data.nav as unknown as NavHelper;
  const language = data.lang === "fr" ? "fr" : "en";
  const isFrench = language === "fr";
  const postQuery = `type=post lang=${language}`;
  const currentUrl = data.url ?? "/";
  const postsBaseUrl = language === "fr" ? "/fr/posts/" : "/posts/";
  const search = data.search as Partial<SearchHelper> | undefined;
  let prev: Lume.Data | undefined;
  let next: Lume.Data | undefined;

  if (typeof search?.pages === "function") {
    const posts = search.pages(postQuery, "date=asc");
    const currentIndex = posts.findIndex((post) => post.url === currentUrl);

    if (currentIndex > 0) {
      prev = posts[currentIndex - 1];
    }

    if (currentIndex >= 0 && currentIndex < posts.length - 1) {
      next = posts[currentIndex + 1];
    }
  }

  if (prev === undefined && typeof n.previousPage === "function") {
    const navPrev = n.previousPage(
      currentUrl,
      postsBaseUrl,
      postQuery,
      "date=asc",
    );
    prev = isPostCandidate(navPrev, postsBaseUrl) ? navPrev : undefined;
  }

  if (next === undefined && typeof n.nextPage === "function") {
    const navNext = n.nextPage(currentUrl, postsBaseUrl, postQuery, "date=asc");
    next = isPostCandidate(navNext, postsBaseUrl) ? navNext : undefined;
  }
  const postDate = resolvePostDate(data.date);
  const minutes = resolveReadingMinutes(data.readingInfo);
  const readingTimeLabel = isFrench
    ? `${minutes ?? 0}\u00a0min de lecture`
    : `${minutes ?? 0} min read`;
  const navigationAriaLabel = isFrench
    ? "Navigation entre articles"
    : "Post navigation";
  const previousLabel = isFrench ? "Précédent" : "Previous";
  const nextLabel = isFrench ? "Suivant" : "Next";

  return (
    <article class="post-article">
      <header class="post-header pagehead post-pagehead">
        <h1 class="post-title">{data.title ?? ""}</h1>
        <div class="post-meta">
          <time datetime={dateFormat(postDate, "ATOM")}>
            {dateFormat(postDate, "HUMAN_DATE")}
          </time>
          {minutes !== undefined && (
            <>
              <span class="post-meta-separator" aria-hidden="true">·</span>
              <span>{readingTimeLabel}</span>
            </>
          )}
        </div>
      </header>
      <div class="post-content">
        {data.children}
      </div>
      <nav class="post-nav" aria-label={navigationAriaLabel}>
        {prev
          ? (
            <div class="post-nav-item">
              <span class="post-nav-label">{previousLabel}</span>
              <a href={prev.url ?? ""} class="post-nav-title">
                {prev.title ?? ""}
              </a>
            </div>
          )
          : <div class="post-nav-placeholder" aria-hidden="true"></div>}
        {next
          ? (
            <div class="post-nav-item post-nav-item--next">
              <span class="post-nav-label">{nextLabel}</span>
              <a href={next.url ?? ""} class="post-nav-title">
                {next.title ?? ""}
              </a>
            </div>
          )
          : <div class="post-nav-placeholder" aria-hidden="true"></div>}
      </nav>
    </article>
  );
};

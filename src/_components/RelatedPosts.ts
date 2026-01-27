/**
 * RelatedPosts component.
 *
 * Displays a list of related posts based on shared tags.
 * Uses Lume's search plugin to find posts with matching tags.
 *
 * @module _components/RelatedPosts
 */

/**
 * Props for the RelatedPosts component.
 */
export interface RelatedPostsProps {
  /**
   * The URL of the current post (to exclude from results).
   */
  currentUrl: string;

  /**
   * Tags of the current post to match against.
   */
  tags?: string[];

  /**
   * Maximum number of related posts to display.
   * @default 3
   */
  limit?: number;

  /**
   * The search function from Lume data.
   */
  search: Lume.Data["search"];

  /**
   * Internationalization strings.
   */
  i18n: {
    related_posts?: string;
  };
}

/**
 * Calculates a relevance score based on shared tags.
 *
 * @param postTags - Tags of the candidate post.
 * @param currentTags - Tags of the current post.
 * @returns The number of shared tags (relevance score).
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 *
 * const postTags = ["javascript", "web", "tutorial"];
 * const currentTags = ["javascript", "typescript", "web"];
 *
 * // Shared tags: "javascript", "web" = 2
 * const score = postTags.filter(t => currentTags.includes(t)).length;
 * assertEquals(score, 2);
 * ```
 */
function calculateRelevance(
  postTags: string[] = [],
  currentTags: string[] = [],
): number {
  return postTags.filter((tag) => currentTags.includes(tag)).length;
}

/**
 * Renders a list of related posts based on shared tags.
 *
 * The component:
 * - Finds posts that share at least one tag with the current post
 * - Sorts by relevance (number of shared tags), then by date
 * - Excludes the current post from results
 * - Returns empty string if no tags or no related posts found
 *
 * @param props - Component properties.
 * @returns HTML string for the related posts section, or empty string.
 *
 * @example
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import RelatedPosts from "./RelatedPosts.ts";
 *
 * assertEquals(typeof RelatedPosts, "function");
 * ```
 */
export default function RelatedPosts({
  currentUrl,
  tags = [],
  limit = 3,
  search,
  i18n,
}: RelatedPostsProps): string {
  // No tags means no way to find related posts
  if (!tags || tags.length === 0) {
    return "";
  }

  // Build query to find posts with any of the current tags
  const tagQueries = tags.map((tag) => `'${tag}'`).join("|");
  const query = `type=post tags=${tagQueries}`;

  // Search for posts with matching tags
  const allPosts = search.pages(query, "date=desc") as Array<{
    url: string;
    title: string;
    tags?: string[];
    date: Date;
  }>;

  // Filter out current post and calculate relevance
  const relatedPosts = allPosts
    .filter((post) => post.url !== currentUrl)
    .map((post) => ({
      ...post,
      relevance: calculateRelevance(post.tags, tags),
    }))
    // Sort by relevance (desc), then by date (desc)
    .sort((a, b) => {
      if (b.relevance !== a.relevance) {
        return b.relevance - a.relevance;
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    })
    .slice(0, limit);

  // No related posts found
  if (relatedPosts.length === 0) {
    return "";
  }

  const heading = i18n.related_posts || "Related Posts";

  return `
<aside class="related-posts" aria-labelledby="related-posts-heading">
  <h2 id="related-posts-heading" class="related-posts__heading">${heading}</h2>
  <ul class="related-posts__list" role="list">
    ${
    relatedPosts
      .map(
        (post) => `
    <li class="related-posts__item">
      <a href="${post.url}" class="related-posts__link">
        <span class="related-posts__title">${post.title}</span>
      </a>
    </li>
    `,
      )
      .join("")
  }
  </ul>
</aside>
`;
}

export const css = `
/* Related posts component styles are in 04-components/related-posts.css */
`;

import type { BlogStoryCard } from "./view-data.ts";

const MAX_TAG_SECONDARY_STORIES = 3;

export type TagStorySections = Readonly<{
  featuredStory?: BlogStoryCard | undefined;
  latestStory?: BlogStoryCard | undefined;
  secondaryStories: readonly BlogStoryCard[];
  gridStories: readonly BlogStoryCard[];
  gridStartIndex: number;
}>;

export function resolveTagStorySections(
  posts: readonly BlogStoryCard[],
): TagStorySections {
  const [featuredStory, latestStory, ...remainingStories] = posts;
  const secondaryStories = remainingStories.slice(0, MAX_TAG_SECONDARY_STORIES);
  const gridStories = remainingStories.slice(MAX_TAG_SECONDARY_STORIES);
  const displayedStoryCount = (featuredStory ? 1 : 0) +
    (latestStory ? 1 : 0) +
    secondaryStories.length;

  return {
    featuredStory,
    latestStory,
    secondaryStories,
    gridStories,
    gridStartIndex: displayedStoryCount + 1,
  };
}

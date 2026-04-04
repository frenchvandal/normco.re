import {
  PRETEXT_ARCHIVE_TIMELINE_SUMMARY_SELECTOR,
  PRETEXT_ARCHIVE_TIMELINE_TITLE_SELECTOR,
  PRETEXT_FEATURE_CARD_SUMMARY_SELECTOR,
  PRETEXT_FEATURE_CARD_TITLE_SELECTOR,
  PRETEXT_OUTLINE_LINK_TEXT_SELECTOR,
  PRETEXT_SIGNAL_LIST_TITLE_SELECTOR,
  PRETEXT_STORY_CARD_SUMMARY_SELECTOR,
  PRETEXT_STORY_CARD_TITLE_SELECTOR,
} from "./pretext-selectors.ts";

export const PRETEXT_BROWSER_PROBE_ROUTE = "/pretext/probe/";
export const PRETEXT_BROWSER_PROBE_ROOT_ID = "pretext-browser-probe";

export const PRETEXT_BROWSER_PROBE_SURFACE_IDS = {
  archiveItem: "archive-item",
  featuredStory: "featured-story",
  outlineLink: "outline-link",
  signalStory: "signal-story",
  storyCard: "story-card",
  storyGrid: "story-grid",
} as const;

export type PretextBrowserProbeSurfaceId =
  (typeof PRETEXT_BROWSER_PROBE_SURFACE_IDS)[
    keyof typeof PRETEXT_BROWSER_PROBE_SURFACE_IDS
  ];

export function buildPretextBrowserProbeSectionId(
  surfaceId: PretextBrowserProbeSurfaceId,
): string {
  return `pretext-browser-probe-${surfaceId}`;
}

export function buildPretextBrowserProbeSurfaceSelector(
  surfaceId: PretextBrowserProbeSurfaceId,
  selector: string,
): string {
  return `[data-pretext-probe-surface="${surfaceId}"] ${selector}`;
}

export const PRETEXT_BROWSER_PROBE_SELECTOR_EXPECTATIONS = {
  archiveItem: [
    {
      selector: buildPretextBrowserProbeSurfaceSelector(
        PRETEXT_BROWSER_PROBE_SURFACE_IDS.archiveItem,
        PRETEXT_ARCHIVE_TIMELINE_TITLE_SELECTOR,
      ),
      minCount: 1,
    },
    {
      selector: buildPretextBrowserProbeSurfaceSelector(
        PRETEXT_BROWSER_PROBE_SURFACE_IDS.archiveItem,
        PRETEXT_ARCHIVE_TIMELINE_SUMMARY_SELECTOR,
      ),
      minCount: 1,
    },
  ],
  featuredStory: [
    {
      selector: buildPretextBrowserProbeSurfaceSelector(
        PRETEXT_BROWSER_PROBE_SURFACE_IDS.featuredStory,
        PRETEXT_FEATURE_CARD_TITLE_SELECTOR,
      ),
      minCount: 1,
    },
    {
      selector: buildPretextBrowserProbeSurfaceSelector(
        PRETEXT_BROWSER_PROBE_SURFACE_IDS.featuredStory,
        PRETEXT_FEATURE_CARD_SUMMARY_SELECTOR,
      ),
      minCount: 1,
    },
  ],
  outlineLink: [
    {
      selector: buildPretextBrowserProbeSurfaceSelector(
        PRETEXT_BROWSER_PROBE_SURFACE_IDS.outlineLink,
        PRETEXT_OUTLINE_LINK_TEXT_SELECTOR,
      ),
      minCount: 1,
    },
  ],
  signalStory: [
    {
      selector: buildPretextBrowserProbeSurfaceSelector(
        PRETEXT_BROWSER_PROBE_SURFACE_IDS.signalStory,
        PRETEXT_SIGNAL_LIST_TITLE_SELECTOR,
      ),
      minCount: 1,
    },
  ],
  storyCard: [
    {
      selector: buildPretextBrowserProbeSurfaceSelector(
        PRETEXT_BROWSER_PROBE_SURFACE_IDS.storyCard,
        PRETEXT_STORY_CARD_TITLE_SELECTOR,
      ),
      minCount: 1,
    },
    {
      selector: buildPretextBrowserProbeSurfaceSelector(
        PRETEXT_BROWSER_PROBE_SURFACE_IDS.storyCard,
        PRETEXT_STORY_CARD_SUMMARY_SELECTOR,
      ),
      minCount: 1,
    },
  ],
  storyGrid: [
    {
      selector: buildPretextBrowserProbeSurfaceSelector(
        PRETEXT_BROWSER_PROBE_SURFACE_IDS.storyGrid,
        PRETEXT_STORY_CARD_TITLE_SELECTOR,
      ),
      minCount: 4,
    },
    {
      selector: buildPretextBrowserProbeSurfaceSelector(
        PRETEXT_BROWSER_PROBE_SURFACE_IDS.storyGrid,
        PRETEXT_STORY_CARD_SUMMARY_SELECTOR,
      ),
      minCount: 4,
    },
  ],
} as const;

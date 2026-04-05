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
export const PRETEXT_BROWSER_PROBE_DIAGNOSTIC_REPORT_ID =
  "pretext-browser-probe-diagnostics";

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

export const PRETEXT_BROWSER_PROBE_SURFACES = [
  {
    key: "storyCard",
    surfaceId: PRETEXT_BROWSER_PROBE_SURFACE_IDS.storyCard,
  },
  {
    key: "featuredStory",
    surfaceId: PRETEXT_BROWSER_PROBE_SURFACE_IDS.featuredStory,
  },
  {
    key: "archiveItem",
    surfaceId: PRETEXT_BROWSER_PROBE_SURFACE_IDS.archiveItem,
  },
  {
    key: "signalStory",
    surfaceId: PRETEXT_BROWSER_PROBE_SURFACE_IDS.signalStory,
  },
  {
    key: "outlineLink",
    surfaceId: PRETEXT_BROWSER_PROBE_SURFACE_IDS.outlineLink,
  },
  {
    key: "storyGrid",
    surfaceId: PRETEXT_BROWSER_PROBE_SURFACE_IDS.storyGrid,
  },
] as const;

export type PretextBrowserProbeSurfaceKey =
  (typeof PRETEXT_BROWSER_PROBE_SURFACES)[number]["key"];

export type PretextBrowserProbeTextTargetKind = "summary" | "title";

export type PretextBrowserProbeTextTarget = Readonly<{
  kind: PretextBrowserProbeTextTargetKind;
  minCount: number;
  selector: string;
}>;

type ProbeSelectorExpectation = Readonly<{
  minCount: number;
  selector: string;
}>;

export const PRETEXT_BROWSER_PROBE_DIAGNOSTIC_TOLERANCE_PX = 1;

export type PretextBrowserProbeHeightDeltaSample = Readonly<{
  heightDelta: number;
}>;

export type PretextBrowserProbeDiagnosticSummary = Readonly<{
  aboveToleranceCount: number;
  maxAbsHeightDelta: number;
  sampleCount: number;
}>;

export function resolvePretextBrowserProbeExpectedHeight(
  contentHeight: number,
  appliedHeight: number | null,
): number {
  return appliedHeight !== null && Number.isFinite(appliedHeight) &&
      appliedHeight > 0
    ? Math.max(contentHeight, appliedHeight)
    : contentHeight;
}

export function resolvePretextBrowserProbeExpectedLineCount(
  contentLineCount: number,
  expectedHeight: number,
  lineHeight: number,
): number {
  if (expectedHeight <= 0 || lineHeight <= 0) {
    return contentLineCount;
  }

  return Math.max(
    contentLineCount,
    Math.max(1, Math.round(expectedHeight / lineHeight)),
  );
}

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

export const PRETEXT_BROWSER_PROBE_TEXT_TARGETS = {
  archiveItem: [
    {
      kind: "title",
      selector: buildPretextBrowserProbeSurfaceSelector(
        PRETEXT_BROWSER_PROBE_SURFACE_IDS.archiveItem,
        PRETEXT_ARCHIVE_TIMELINE_TITLE_SELECTOR,
      ),
      minCount: 1,
    },
    {
      kind: "summary",
      selector: buildPretextBrowserProbeSurfaceSelector(
        PRETEXT_BROWSER_PROBE_SURFACE_IDS.archiveItem,
        PRETEXT_ARCHIVE_TIMELINE_SUMMARY_SELECTOR,
      ),
      minCount: 1,
    },
  ],
  featuredStory: [
    {
      kind: "title",
      selector: buildPretextBrowserProbeSurfaceSelector(
        PRETEXT_BROWSER_PROBE_SURFACE_IDS.featuredStory,
        PRETEXT_FEATURE_CARD_TITLE_SELECTOR,
      ),
      minCount: 1,
    },
    {
      kind: "summary",
      selector: buildPretextBrowserProbeSurfaceSelector(
        PRETEXT_BROWSER_PROBE_SURFACE_IDS.featuredStory,
        PRETEXT_FEATURE_CARD_SUMMARY_SELECTOR,
      ),
      minCount: 1,
    },
  ],
  outlineLink: [
    {
      kind: "title",
      selector: buildPretextBrowserProbeSurfaceSelector(
        PRETEXT_BROWSER_PROBE_SURFACE_IDS.outlineLink,
        PRETEXT_OUTLINE_LINK_TEXT_SELECTOR,
      ),
      minCount: 1,
    },
  ],
  signalStory: [
    {
      kind: "title",
      selector: buildPretextBrowserProbeSurfaceSelector(
        PRETEXT_BROWSER_PROBE_SURFACE_IDS.signalStory,
        PRETEXT_SIGNAL_LIST_TITLE_SELECTOR,
      ),
      minCount: 1,
    },
  ],
  storyCard: [
    {
      kind: "title",
      selector: buildPretextBrowserProbeSurfaceSelector(
        PRETEXT_BROWSER_PROBE_SURFACE_IDS.storyCard,
        PRETEXT_STORY_CARD_TITLE_SELECTOR,
      ),
      minCount: 1,
    },
    {
      kind: "summary",
      selector: buildPretextBrowserProbeSurfaceSelector(
        PRETEXT_BROWSER_PROBE_SURFACE_IDS.storyCard,
        PRETEXT_STORY_CARD_SUMMARY_SELECTOR,
      ),
      minCount: 1,
    },
  ],
  storyGrid: [
    {
      kind: "title",
      selector: buildPretextBrowserProbeSurfaceSelector(
        PRETEXT_BROWSER_PROBE_SURFACE_IDS.storyGrid,
        PRETEXT_STORY_CARD_TITLE_SELECTOR,
      ),
      minCount: 4,
    },
    {
      kind: "summary",
      selector: buildPretextBrowserProbeSurfaceSelector(
        PRETEXT_BROWSER_PROBE_SURFACE_IDS.storyGrid,
        PRETEXT_STORY_CARD_SUMMARY_SELECTOR,
      ),
      minCount: 4,
    },
  ],
} as const satisfies Record<
  PretextBrowserProbeSurfaceKey,
  readonly PretextBrowserProbeTextTarget[]
>;

function createProbeSelectorExpectations(
  targets: readonly PretextBrowserProbeTextTarget[],
): readonly ProbeSelectorExpectation[] {
  return targets.map(({ minCount, selector }) => ({ minCount, selector }));
}

export const PRETEXT_BROWSER_PROBE_SELECTOR_EXPECTATIONS = {
  archiveItem: createProbeSelectorExpectations(
    PRETEXT_BROWSER_PROBE_TEXT_TARGETS.archiveItem,
  ),
  featuredStory: createProbeSelectorExpectations(
    PRETEXT_BROWSER_PROBE_TEXT_TARGETS.featuredStory,
  ),
  outlineLink: createProbeSelectorExpectations(
    PRETEXT_BROWSER_PROBE_TEXT_TARGETS.outlineLink,
  ),
  signalStory: createProbeSelectorExpectations(
    PRETEXT_BROWSER_PROBE_TEXT_TARGETS.signalStory,
  ),
  storyCard: createProbeSelectorExpectations(
    PRETEXT_BROWSER_PROBE_TEXT_TARGETS.storyCard,
  ),
  storyGrid: createProbeSelectorExpectations(
    PRETEXT_BROWSER_PROBE_TEXT_TARGETS.storyGrid,
  ),
} as const satisfies Record<
  PretextBrowserProbeSurfaceKey,
  readonly ProbeSelectorExpectation[]
>;

export function buildPretextBrowserProbeDiagnosticsSummary(
  samples: ReadonlyArray<PretextBrowserProbeHeightDeltaSample>,
  tolerancePx = PRETEXT_BROWSER_PROBE_DIAGNOSTIC_TOLERANCE_PX,
): PretextBrowserProbeDiagnosticSummary {
  let maxAbsHeightDelta = 0;
  let aboveToleranceCount = 0;

  for (const sample of samples) {
    const absoluteHeightDelta = Math.abs(sample.heightDelta);
    maxAbsHeightDelta = Math.max(maxAbsHeightDelta, absoluteHeightDelta);

    if (absoluteHeightDelta > tolerancePx) {
      aboveToleranceCount += 1;
    }
  }

  return {
    aboveToleranceCount,
    maxAbsHeightDelta,
    sampleCount: samples.length,
  };
}

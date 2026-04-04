/** @jsxImportSource npm/react */
import type { ReactNode } from "npm/react";
import { createRoot } from "npm/react-dom/client";

import type { BlogStoryCard } from "../view-data.ts";
import { resolveSiteLanguage, type SiteLanguage } from "../../utils/i18n.ts";
import { ArchiveTimelineItem } from "./ArchiveApp.tsx";
import {
  FeaturedStory,
  SignalStoryLink,
  StoryCard,
  StoryGrid,
} from "./common.tsx";
import { OutlineTimelineLink } from "./PostApp.tsx";
import {
  buildPretextBrowserProbeSectionId,
  PRETEXT_BROWSER_PROBE_ROOT_ID,
  PRETEXT_BROWSER_PROBE_SURFACE_IDS,
  type PretextBrowserProbeSurfaceId,
} from "./pretext-browser-probe-shared.ts";
import { getPretextProbeLanguageFixture } from "./pretext-probe-fixtures.ts";

function buildProbeStory(
  baseStory: BlogStoryCard,
  {
    title,
    summary,
    surfaceId,
  }: {
    title: string;
    summary?: string | undefined;
    surfaceId: PretextBrowserProbeSurfaceId;
  },
): BlogStoryCard {
  return {
    ...baseStory,
    title,
    summary,
    url: `#${buildPretextBrowserProbeSectionId(surfaceId)}`,
  };
}

function ProbeSection(
  {
    surfaceId,
    title,
    fullWidth = false,
    children,
  }: {
    surfaceId: PretextBrowserProbeSurfaceId;
    title: string;
    fullWidth?: boolean | undefined;
    children: ReactNode;
  },
) {
  return (
    <section
      id={buildPretextBrowserProbeSectionId(surfaceId)}
      className={`blog-antd-probe__section${
        fullWidth ? " blog-antd-probe__section--full" : ""
      }`}
      data-pretext-probe-surface={surfaceId}
      aria-labelledby={`${buildPretextBrowserProbeSectionId(surfaceId)}-title`}
    >
      <div className="blog-antd-probe__section-head">
        <h2
          id={`${buildPretextBrowserProbeSectionId(surfaceId)}-title`}
          className="blog-antd-rail-title blog-antd-probe__section-title"
        >
          {title}
        </h2>
      </div>
      <div className="blog-antd-probe__surface">{children}</div>
    </section>
  );
}

function PretextBrowserProbeApp(
  { language }: {
    language: SiteLanguage;
  },
) {
  const fixture = getPretextProbeLanguageFixture(language);
  const [firstGridStory, secondGridStory, thirdGridStory, fourthGridStory] =
    fixture.gridPosts;

  if (
    !firstGridStory || !secondGridStory || !thirdGridStory || !fourthGridStory
  ) {
    throw new Error("Pretext browser probe requires four grid story fixtures");
  }

  const storyCardStory = buildProbeStory(firstGridStory, {
    title: fixture.storyTitle,
    summary: fixture.storySummary,
    surfaceId: PRETEXT_BROWSER_PROBE_SURFACE_IDS.storyCard,
  });
  const featuredStory = buildProbeStory(secondGridStory, {
    title: fixture.featuredTitle,
    summary: fixture.featuredSummary,
    surfaceId: PRETEXT_BROWSER_PROBE_SURFACE_IDS.featuredStory,
  });
  const archiveStory = buildProbeStory(thirdGridStory, {
    title: fixture.archiveTitle,
    summary: fixture.archiveSummary,
    surfaceId: PRETEXT_BROWSER_PROBE_SURFACE_IDS.archiveItem,
  });
  const signalStory = buildProbeStory(fourthGridStory, {
    title: fixture.signalTitle,
    surfaceId: PRETEXT_BROWSER_PROBE_SURFACE_IDS.signalStory,
  });

  return (
    <div className="blog-antd-probe">
      <header className="blog-antd-probe__intro">
        <p className="blog-antd-eyebrow">{fixture.pageKicker}</p>
        <h1 className="blog-antd-page-title">{fixture.pageTitle}</h1>
        <p className="blog-antd-page-lead">{fixture.pageLead}</p>
      </header>

      <div className="blog-antd-probe__surfaces">
        <ProbeSection
          surfaceId={PRETEXT_BROWSER_PROBE_SURFACE_IDS.storyCard}
          title={fixture.sectionLabels.storyCard}
        >
          <StoryCard
            index={1}
            story={storyCardStory}
            dateTooltip={fixture.dateTooltip}
            readingTooltip={fixture.readingTooltip}
          />
        </ProbeSection>

        <ProbeSection
          surfaceId={PRETEXT_BROWSER_PROBE_SURFACE_IDS.featuredStory}
          title={fixture.sectionLabels.featuredStory}
        >
          <FeaturedStory
            story={featuredStory}
            secondaryStories={fixture.gridPosts.slice(0, 2)}
            title={fixture.featuredEyebrow}
            dateTooltip={fixture.dateTooltip}
            readingTooltip={fixture.readingTooltip}
          />
        </ProbeSection>

        <ProbeSection
          surfaceId={PRETEXT_BROWSER_PROBE_SURFACE_IDS.archiveItem}
          title={fixture.sectionLabels.archiveItem}
        >
          <ArchiveTimelineItem
            story={archiveStory}
            indexLabel="01"
            dateTooltip={fixture.dateTooltip}
            readingTooltip={fixture.readingTooltip}
          />
        </ProbeSection>

        <ProbeSection
          surfaceId={PRETEXT_BROWSER_PROBE_SURFACE_IDS.signalStory}
          title={fixture.sectionLabels.signalStory}
        >
          <SignalStoryLink
            index={0}
            story={signalStory}
            dateTooltip={fixture.dateTooltip}
            readingTooltip={fixture.readingTooltip}
          />
        </ProbeSection>

        <ProbeSection
          surfaceId={PRETEXT_BROWSER_PROBE_SURFACE_IDS.outlineLink}
          title={fixture.sectionLabels.outlineLink}
        >
          <OutlineTimelineLink
            id={fixture.outlineId}
            text={fixture.outlineTitle}
          />
        </ProbeSection>

        <ProbeSection
          surfaceId={PRETEXT_BROWSER_PROBE_SURFACE_IDS.storyGrid}
          title={fixture.sectionLabels.storyGrid}
          fullWidth
        >
          <StoryGrid
            posts={fixture.gridPosts}
            ariaLabel={fixture.gridAriaLabel}
            dateTooltip={fixture.dateTooltip}
            readingTooltip={fixture.readingTooltip}
          />
        </ProbeSection>
      </div>
    </div>
  );
}

export function mountPretextBrowserProbe(rootElement: HTMLElement): void {
  const language = resolveSiteLanguage(
    rootElement.dataset.language ?? document.documentElement.lang,
  );

  createRoot(rootElement).render(
    <PretextBrowserProbeApp language={language} />,
  );
}

export function startPretextBrowserProbe(): void {
  const rootElement = document.getElementById(PRETEXT_BROWSER_PROBE_ROOT_ID);

  if (!(rootElement instanceof HTMLElement)) {
    return;
  }

  mountPretextBrowserProbe(rootElement);
}

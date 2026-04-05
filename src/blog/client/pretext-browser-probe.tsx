/** @jsxImportSource npm/react */
import type { ReactNode } from "npm/react";
import {
  startTransition,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
} from "npm/react";
import { createRoot } from "npm/react-dom/client";

import type { BlogStoryCard } from "../view-data.ts";
import { resolveSiteLanguage } from "../../utils/i18n.ts";
import type { SiteLanguage } from "../../utils/i18n.ts";
import { ArchiveTimelineItem } from "./ArchiveApp.tsx";
import {
  FeaturedStory,
  SignalStoryLink,
  StoryCard,
  StoryGrid,
} from "./common.tsx";
import { OutlineTimelineLink } from "./PostApp.tsx";
import {
  buildPretextBrowserProbeDiagnosticsSummary,
  buildPretextBrowserProbeSectionId,
  PRETEXT_BROWSER_PROBE_DIAGNOSTIC_REPORT_ID,
  PRETEXT_BROWSER_PROBE_DIAGNOSTIC_TOLERANCE_PX,
  PRETEXT_BROWSER_PROBE_ROOT_ID,
  PRETEXT_BROWSER_PROBE_SURFACE_IDS,
  PRETEXT_BROWSER_PROBE_SURFACES,
  PRETEXT_BROWSER_PROBE_TEXT_TARGETS,
  resolvePretextBrowserProbeExpectedHeight,
  resolvePretextBrowserProbeExpectedLineCount,
} from "./pretext-browser-probe-shared.ts";
import type {
  PretextBrowserProbeSurfaceId,
  PretextBrowserProbeSurfaceKey,
  PretextBrowserProbeTextTargetKind,
} from "./pretext-browser-probe-shared.ts";
import { getPretextProbeLanguageFixture } from "./pretext-probe-fixtures.ts";
import {
  buildPretextFont,
  clearPretextMeasurementCaches,
  isPretextRuntimeEnabled,
  layoutTextBlockWithLines,
  measureTextBlock,
  measureTextBlockWidestLine,
  observeDocumentFontLoads,
  PRETEXT_ENGINE,
  PRETEXT_MEASURE_FONT_TOKEN,
  readTextStyleSnapshot,
  resolveLineHeightPx,
} from "./pretext-story-core.ts";

type PretextProbeDiagnosticLine = Readonly<{
  text: string;
  width: number;
}>;

type PretextProbeDiagnostic = Readonly<{
  actualHeight: number;
  actualLineCount: number | null;
  contentHeight: number;
  expectedHeight: number;
  expectedLineCount: number;
  heightDelta: number;
  kind: PretextBrowserProbeTextTargetKind;
  lineHeight: number;
  lines: readonly PretextProbeDiagnosticLine[];
  minBlockSize: string | null;
  pretextHeight: string | null;
  sampleIndex: number;
  surfaceKey: PretextBrowserProbeSurfaceKey;
  widestLineWidth: number;
  width: number;
}>;

function roundProbeMetric(value: number): number {
  return Number(value.toFixed(2));
}

function formatProbeMetric(value: number): string {
  return `${roundProbeMetric(value)}px`;
}

function formatProbeSignedMetric(value: number): string {
  const roundedValue = roundProbeMetric(value);
  return `${roundedValue > 0 ? "+" : ""}${roundedValue}px`;
}

function resolveProbeMetricLabel(
  kind: PretextBrowserProbeTextTargetKind,
  {
    summaryLabel,
    titleLabel,
  }: {
    summaryLabel: string;
    titleLabel: string;
  },
): string {
  return kind === "title" ? titleLabel : summaryLabel;
}

function queryProbeElements(
  container: HTMLElement,
  selector: string,
): HTMLElement[] {
  return Array.from(container.querySelectorAll(selector)).filter(
    (candidate): candidate is HTMLElement => candidate instanceof HTMLElement,
  );
}

function resolveProbeMinBlockSize(style: CSSStyleDeclaration): string | null {
  return style.minBlockSize === "0px" || style.minBlockSize.trim() === ""
    ? null
    : style.minBlockSize;
}

function resolveProbeHeightCustomProperty(
  style: CSSStyleDeclaration,
  kind: PretextBrowserProbeTextTargetKind,
): string | null {
  const value = style
    .getPropertyValue(
      kind === "title" ? "--pretext-title-height" : "--pretext-summary-height",
    )
    .trim();

  return value.length > 0 ? value : null;
}

function parseProbePixelValue(value: string | null): number | null {
  const trimmedValue = value?.trim();

  if (!trimmedValue || !trimmedValue.endsWith("px")) {
    return null;
  }

  const parsedValue = Number.parseFloat(trimmedValue);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function resolveActualLineCount(
  actualHeight: number,
  lineHeight: number,
): number | null {
  if (actualHeight <= 0 || lineHeight <= 0) {
    return null;
  }

  return Math.max(1, Math.round(actualHeight / lineHeight));
}

function collectObservedProbeElements(container: HTMLElement): HTMLElement[] {
  const observedElements = new Set<HTMLElement>([container]);

  for (const surface of PRETEXT_BROWSER_PROBE_SURFACES) {
    for (const target of PRETEXT_BROWSER_PROBE_TEXT_TARGETS[surface.key]) {
      queryProbeElements(container, target.selector).forEach((element) => {
        observedElements.add(element);
      });
    }
  }

  return Array.from(observedElements);
}

function collectPretextProbeDiagnostics(
  container: HTMLElement,
): readonly PretextProbeDiagnostic[] {
  const defaultView = container.ownerDocument.defaultView;

  if (!defaultView) {
    return [];
  }

  const rootStyle = defaultView.getComputedStyle(
    container.ownerDocument.documentElement,
  );
  const locale = container.ownerDocument.documentElement.lang;
  const measureFontFamily = rootStyle.getPropertyValue(
    PRETEXT_MEASURE_FONT_TOKEN,
  );
  const diagnostics: PretextProbeDiagnostic[] = [];

  for (const surface of PRETEXT_BROWSER_PROBE_SURFACES) {
    for (const target of PRETEXT_BROWSER_PROBE_TEXT_TARGETS[surface.key]) {
      queryProbeElements(container, target.selector).forEach(
        (element, index) => {
          const computedStyle = defaultView.getComputedStyle(element);
          const textStyle = readTextStyleSnapshot(element);
          const width = element.clientWidth;
          const lineHeight = resolveLineHeightPx(
            textStyle.lineHeight,
            textStyle.fontSize,
          );
          const font = buildPretextFont(textStyle, measureFontFamily);
          const text = element.textContent?.trim();
          const measurement = measureTextBlock(PRETEXT_ENGINE, {
            font,
            lineHeight,
            locale,
            text,
            width,
          });
          const lineLayout = layoutTextBlockWithLines(PRETEXT_ENGINE, {
            font,
            lineHeight,
            locale,
            text,
            width,
          });
          const widestLine = measureTextBlockWidestLine(PRETEXT_ENGINE, {
            font,
            locale,
            text,
            width,
          });
          const actualHeight = roundProbeMetric(
            element.getBoundingClientRect().height,
          );
          const contentHeight = roundProbeMetric(measurement.height);
          const pretextHeight = resolveProbeHeightCustomProperty(
            computedStyle,
            target.kind,
          );
          const expectedHeight = roundProbeMetric(
            resolvePretextBrowserProbeExpectedHeight(
              contentHeight,
              parseProbePixelValue(pretextHeight),
            ),
          );
          const expectedLineCount = resolvePretextBrowserProbeExpectedLineCount(
            lineLayout.lineCount,
            expectedHeight,
            lineHeight,
          );

          diagnostics.push({
            actualHeight,
            actualLineCount: resolveActualLineCount(actualHeight, lineHeight),
            contentHeight,
            expectedHeight,
            expectedLineCount,
            heightDelta: roundProbeMetric(actualHeight - expectedHeight),
            kind: target.kind,
            lineHeight: roundProbeMetric(lineHeight),
            lines: lineLayout.lines.map((line) => ({
              text: line.text,
              width: roundProbeMetric(line.width),
            })),
            minBlockSize: resolveProbeMinBlockSize(computedStyle),
            pretextHeight,
            sampleIndex: index,
            surfaceKey: surface.key,
            widestLineWidth: roundProbeMetric(widestLine.widestLineWidth),
            width: roundProbeMetric(width),
          });
        },
      );
    }
  }

  return diagnostics;
}

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
  const runtimeEnabled = isPretextRuntimeEnabled();
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [diagnostics, setDiagnostics] = useState<
    readonly PretextProbeDiagnostic[]
  >([]);
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
  const updateDiagnostics = useEffectEvent(
    (currentContainer: HTMLElement | null) => {
      const nextDiagnostics = currentContainer
        ? collectPretextProbeDiagnostics(currentContainer)
        : [];

      startTransition(() => setDiagnostics(nextDiagnostics));
    },
  );
  const diagnosticSummary = useMemo(
    () => buildPretextBrowserProbeDiagnosticsSummary(diagnostics),
    [diagnostics],
  );
  const diagnosticsBySurface = useMemo(() => {
    return PRETEXT_BROWSER_PROBE_SURFACES.map((surface) => ({
      measurements: diagnostics.filter((measurement) =>
        measurement.surfaceKey === surface.key
      ),
      surfaceId: surface.surfaceId,
      title: fixture.sectionLabels[surface.key],
    }));
  }, [diagnostics, fixture.sectionLabels]);

  useEffect(() => {
    updateDiagnostics(container);
  }, [container, language]);

  useEffect(() => {
    if (!container || typeof ResizeObserver !== "function") {
      return;
    }

    const observer = new ResizeObserver(() => {
      updateDiagnostics(container);
    });

    collectObservedProbeElements(container).forEach((element) => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, [container]);

  useEffect(() => {
    if (!container) {
      return;
    }

    return observeDocumentFontLoads(container.ownerDocument, () => {
      clearPretextMeasurementCaches(PRETEXT_ENGINE);
      updateDiagnostics(container);
    });
  }, [container]);

  return (
    <div
      ref={setContainer}
      className="blog-antd-probe"
      data-pretext-probe-flagged-count={diagnosticSummary.aboveToleranceCount}
      data-pretext-probe-max-abs-delta={roundProbeMetric(
        diagnosticSummary.maxAbsHeightDelta,
      )}
      data-pretext-probe-runtime={runtimeEnabled ? "enabled" : "disabled"}
      data-pretext-probe-sample-count={diagnosticSummary.sampleCount}
    >
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

      <section
        id={PRETEXT_BROWSER_PROBE_DIAGNOSTIC_REPORT_ID}
        className="blog-antd-probe-diagnostics"
        aria-labelledby={`${PRETEXT_BROWSER_PROBE_DIAGNOSTIC_REPORT_ID}-title`}
        data-pretext-probe-flagged-count={diagnosticSummary.aboveToleranceCount}
        data-pretext-probe-max-abs-delta={roundProbeMetric(
          diagnosticSummary.maxAbsHeightDelta,
        )}
        data-pretext-probe-runtime={runtimeEnabled ? "enabled" : "disabled"}
        data-pretext-probe-sample-count={diagnosticSummary.sampleCount}
      >
        <div className="blog-antd-probe-diagnostics__head">
          <p className="blog-antd-eyebrow">
            {fixture.diagnostics.diagnosticKicker}
          </p>
          <div className="blog-antd-probe-diagnostics__head-row">
            <h2
              id={`${PRETEXT_BROWSER_PROBE_DIAGNOSTIC_REPORT_ID}-title`}
              className="blog-antd-rail-title blog-antd-probe-diagnostics__title"
            >
              {fixture.diagnostics.diagnosticTitle}
            </h2>
            <p className="blog-antd-probe-diagnostics__status">
              {runtimeEnabled
                ? fixture.diagnostics.runtimeEnabledLabel
                : fixture.diagnostics.runtimeDisabledLabel}
            </p>
          </div>
          <p className="blog-antd-page-lead blog-antd-probe-diagnostics__lead">
            {fixture.diagnostics.diagnosticLead}
          </p>
        </div>

        <div className="blog-antd-probe-diagnostics__summary">
          <dl className="blog-antd-probe-diagnostics__stat">
            <dt>{fixture.diagnostics.sampleCountLabel}</dt>
            <dd>{diagnosticSummary.sampleCount}</dd>
          </dl>
          <dl className="blog-antd-probe-diagnostics__stat">
            <dt>{fixture.diagnostics.maxDeltaLabel}</dt>
            <dd>{formatProbeMetric(diagnosticSummary.maxAbsHeightDelta)}</dd>
          </dl>
          <dl className="blog-antd-probe-diagnostics__stat">
            <dt>{fixture.diagnostics.flaggedLabel}</dt>
            <dd>{diagnosticSummary.aboveToleranceCount}</dd>
          </dl>
        </div>

        <div className="blog-antd-probe-diagnostics__surfaces">
          {diagnosticsBySurface.map((surface) => (
            <section
              key={surface.surfaceId}
              className="blog-antd-probe-diagnostics__surface"
              aria-labelledby={`${PRETEXT_BROWSER_PROBE_DIAGNOSTIC_REPORT_ID}-${surface.surfaceId}-title`}
            >
              <h3
                id={`${PRETEXT_BROWSER_PROBE_DIAGNOSTIC_REPORT_ID}-${surface.surfaceId}-title`}
                className="blog-antd-probe-diagnostics__surface-title"
              >
                {surface.title}
              </h3>
              {surface.measurements.length === 0
                ? (
                  <p className="blog-antd-probe-diagnostics__empty">
                    {fixture.diagnostics.noMeasurementsLabel}
                  </p>
                )
                : (
                  <ul className="blog-antd-probe-diagnostics__list">
                    {surface.measurements.map((measurement) => {
                      const metricLabel = resolveProbeMetricLabel(
                        measurement.kind,
                        fixture.diagnostics,
                      );

                      return (
                        <li
                          key={`${surface.surfaceId}-${measurement.kind}-${measurement.sampleIndex}`}
                          className={`blog-antd-probe-diagnostics__item${
                            Math.abs(measurement.heightDelta) >
                                PRETEXT_BROWSER_PROBE_DIAGNOSTIC_TOLERANCE_PX
                              ? " blog-antd-probe-diagnostics__item--flagged"
                              : ""
                          }`}
                        >
                          <details className="blog-antd-probe-diagnostics__details">
                            <summary className="blog-antd-probe-diagnostics__summary-row">
                              <span className="blog-antd-probe-diagnostics__metric-title">
                                {metricLabel}
                                {surface.measurements.filter((candidate) =>
                                    candidate.kind === measurement.kind
                                  ).length > 1
                                  ? ` ${measurement.sampleIndex + 1}`
                                  : ""}
                              </span>
                              <span className="blog-antd-probe-diagnostics__metric-snapshot">
                                {fixture.diagnostics.expectedHeightLabel}:{" "}
                                {formatProbeMetric(measurement.expectedHeight)}
                                {" · "}
                                {fixture.diagnostics.actualHeightLabel}:{" "}
                                {formatProbeMetric(measurement.actualHeight)}
                                {" · "}
                                {fixture.diagnostics.deltaLabel}:{" "}
                                {formatProbeSignedMetric(
                                  measurement.heightDelta,
                                )}
                              </span>
                            </summary>

                            <dl className="blog-antd-probe-diagnostics__metrics">
                              <div>
                                <dt>{fixture.diagnostics.widthLabel}</dt>
                                <dd>{formatProbeMetric(measurement.width)}</dd>
                              </div>
                              <div>
                                <dt>{fixture.diagnostics.lineCountLabel}</dt>
                                <dd>
                                  {measurement.actualLineCount ?? "?"}
                                  {" / "}
                                  {measurement.expectedLineCount}
                                </dd>
                              </div>
                              <div>
                                <dt>
                                  {fixture.diagnostics.contentHeightLabel}
                                </dt>
                                <dd>
                                  {formatProbeMetric(measurement.contentHeight)}
                                </dd>
                              </div>
                              <div>
                                <dt>{fixture.diagnostics.widestLineLabel}</dt>
                                <dd>
                                  {formatProbeMetric(
                                    measurement.widestLineWidth,
                                  )}
                                </dd>
                              </div>
                              <div>
                                <dt>{fixture.diagnostics.minBlockSizeLabel}</dt>
                                <dd>{measurement.minBlockSize ?? "auto"}</dd>
                              </div>
                              <div>
                                <dt>
                                  {fixture.diagnostics.pretextVariableLabel}
                                </dt>
                                <dd>{measurement.pretextHeight ?? "unset"}</dd>
                              </div>
                              <div>
                                <dt>{fixture.diagnostics.lineHeightLabel}</dt>
                                <dd>
                                  {formatProbeMetric(measurement.lineHeight)}
                                </dd>
                              </div>
                            </dl>

                            {measurement.lines.length > 0 && (
                              <ol className="blog-antd-probe-diagnostics__lines">
                                {measurement.lines.map((line, index) => (
                                  <li key={`${surface.surfaceId}-${index}`}>
                                    <span className="blog-antd-probe-diagnostics__line-text">
                                      {line.text}
                                    </span>
                                    <span className="blog-antd-probe-diagnostics__line-width">
                                      {formatProbeMetric(line.width)}
                                    </span>
                                  </li>
                                ))}
                              </ol>
                            )}
                          </details>
                        </li>
                      );
                    })}
                  </ul>
                )}
            </section>
          ))}
        </div>
      </section>
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

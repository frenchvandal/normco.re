import type { CSSProperties } from "npm/react";
import {
  startTransition,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
} from "npm/react";

import type { BlogStoryCard } from "../view-data.ts";
import { STORY_GRID_TWO_COLUMN_MEDIA_QUERY } from "../../utils/layout-breakpoints.ts";
import {
  balanceTextMeasurementsByRow,
  buildMeasuredTextStyleVariables,
  buildPretextFont,
  clearPretextMeasurementCaches,
  EMPTY_MEASURED_TEXT_STATE,
  isPretextRuntimeEnabled,
  type MeasuredTextState,
  type MeasuredTextStyleVariables,
  measureTextBlock,
  observeDocumentFontLoads,
  PRETEXT_ENGINE,
  PRETEXT_MEASURE_FONT_TOKEN,
  readTextStyleSnapshot,
  resolveLineHeightPx,
  type TextStyleSnapshot,
} from "./pretext-story-core.ts";

type MeasuredTextStyle = CSSProperties & MeasuredTextStyleVariables;

type MeasurementSample = Readonly<{
  locale?: string | undefined;
  measureFontFamily: string;
  summary?: {
    style: TextStyleSnapshot;
    width: number;
  };
  title: {
    style: TextStyleSnapshot;
    width: number;
  };
}>;

function queryMeasuredElement(
  container: HTMLElement,
  selector: string,
): HTMLElement | null {
  const candidate = container.querySelector(selector);
  return candidate instanceof HTMLElement ? candidate : null;
}

function queryMeasuredElements(
  container: HTMLElement,
  selector: string,
): HTMLElement[] {
  return Array.from(container.querySelectorAll(selector)).filter(
    (candidate): candidate is HTMLElement => candidate instanceof HTMLElement,
  );
}

function collectObservedElements(
  container: HTMLElement,
  summaryVisible: boolean,
): HTMLElement[] {
  return [
    container,
    ...queryMeasuredElements(container, ".blog-antd-story-card__title"),
    ...(summaryVisible
      ? queryMeasuredElements(container, ".blog-antd-story-card__summary")
      : []),
  ];
}

function buildMeasurementSample(
  container: HTMLElement,
  summaryVisible: boolean,
): MeasurementSample | undefined {
  const titleElement = queryMeasuredElement(
    container,
    ".blog-antd-story-card__title",
  );

  if (!titleElement) {
    return undefined;
  }

  const defaultView = container.ownerDocument.defaultView;

  if (!defaultView) {
    return undefined;
  }

  const rootStyle = defaultView.getComputedStyle(
    container.ownerDocument.documentElement,
  );
  const summaryElement = summaryVisible
    ? queryMeasuredElement(container, ".blog-antd-story-card__summary")
    : null;

  return {
    locale: container.ownerDocument.documentElement.lang,
    measureFontFamily: rootStyle.getPropertyValue(PRETEXT_MEASURE_FONT_TOKEN),
    ...(summaryElement
      ? {
        summary: {
          style: readTextStyleSnapshot(summaryElement),
          width: summaryElement.clientWidth,
        },
      }
      : {}),
    title: {
      style: readTextStyleSnapshot(titleElement),
      width: titleElement.clientWidth,
    },
  };
}

function detectStoryGridColumns(container: HTMLElement): number {
  const defaultView = container.ownerDocument.defaultView;
  return defaultView?.matchMedia(STORY_GRID_TWO_COLUMN_MEDIA_QUERY).matches
    ? 2
    : 1;
}

function measureStoryFromSample(
  story: BlogStoryCard,
  sample: MeasurementSample,
): MeasuredTextState {
  const titleFont = buildPretextFont(
    sample.title.style,
    sample.measureFontFamily,
  );
  const title = measureTextBlock(PRETEXT_ENGINE, {
    font: titleFont,
    lineHeight: resolveLineHeightPx(
      sample.title.style.lineHeight,
      sample.title.style.fontSize,
    ),
    locale: sample.locale,
    text: story.title,
    width: sample.title.width,
  });

  const summary = sample.summary
    ? measureTextBlock(PRETEXT_ENGINE, {
      font: buildPretextFont(sample.summary.style, sample.measureFontFamily),
      lineHeight: resolveLineHeightPx(
        sample.summary.style.lineHeight,
        sample.summary.style.fontSize,
      ),
      locale: sample.locale,
      text: story.summary,
      width: sample.summary.width,
    })
    : EMPTY_MEASURED_TEXT_STATE.summary;

  return { summary, title };
}

function buildStyleMap(
  posts: readonly BlogStoryCard[],
  measurements: readonly MeasuredTextState[],
): Map<string, MeasuredTextStyle> {
  const styleMap = new Map<string, MeasuredTextStyle>();

  posts.forEach((story, index) => {
    styleMap.set(
      story.url,
      buildMeasuredTextStyleVariables(
        measurements[index] ?? EMPTY_MEASURED_TEXT_STATE,
      ),
    );
  });

  return styleMap;
}

function areStyleMapsEqual(
  current: ReadonlyMap<string, MeasuredTextStyle>,
  next: ReadonlyMap<string, MeasuredTextStyle>,
): boolean {
  if (current.size !== next.size) {
    return false;
  }

  for (const [key, currentStyle] of current.entries()) {
    const nextStyle = next.get(key);

    if (!nextStyle) {
      return false;
    }

    if (
      currentStyle["--pretext-title-height"] !==
        nextStyle["--pretext-title-height"] ||
      currentStyle["--pretext-title-lines"] !==
        nextStyle["--pretext-title-lines"] ||
      currentStyle["--pretext-summary-height"] !==
        nextStyle["--pretext-summary-height"] ||
      currentStyle["--pretext-summary-lines"] !==
        nextStyle["--pretext-summary-lines"]
    ) {
      return false;
    }
  }

  return true;
}

export function useBalancedStoryGridTextStyles(
  {
    posts,
    summaryVisible,
  }: {
    posts: readonly BlogStoryCard[];
    summaryVisible: boolean;
  },
): Readonly<{
  ref: (element: HTMLElement | null) => void;
  styleMap: ReadonlyMap<string, MeasuredTextStyle>;
}> {
  const pretextEnabled = isPretextRuntimeEnabled();
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [styleMap, setStyleMap] = useState<
    ReadonlyMap<string, MeasuredTextStyle>
  >(
    () => new Map(),
  );

  const emptyStyleMap = useMemo<ReadonlyMap<string, MeasuredTextStyle>>(
    () => new Map(),
    [],
  );

  const updateMeasurements = useEffectEvent(
    (currentContainer: HTMLElement | null) => {
      if (!pretextEnabled || !currentContainer || posts.length === 0) {
        if (!areStyleMapsEqual(styleMap, emptyStyleMap)) {
          startTransition(() => setStyleMap(emptyStyleMap));
        }
        return;
      }

      const sample = buildMeasurementSample(currentContainer, summaryVisible);

      if (!sample) {
        return;
      }

      const measuredStories = posts.map((story) =>
        measureStoryFromSample(story, sample)
      );
      const columns = detectStoryGridColumns(currentContainer);
      const balancedMeasurements = balanceTextMeasurementsByRow(
        measuredStories,
        columns,
      );

      // Skip state churn when computed row maxima have not changed.
      const nextStyleMap = buildStyleMap(posts, balancedMeasurements);

      if (!areStyleMapsEqual(styleMap, nextStyleMap)) {
        startTransition(() => setStyleMap(nextStyleMap));
      }
    },
  );

  useEffect(() => {
    updateMeasurements(container);
  }, [container, posts, pretextEnabled, summaryVisible]);

  useEffect(() => {
    if (!pretextEnabled || !container || typeof ResizeObserver !== "function") {
      return;
    }

    const observer = new ResizeObserver(() => {
      updateMeasurements(container);
    });

    const observedElements = collectObservedElements(container, summaryVisible);
    observedElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [container, posts, pretextEnabled, summaryVisible]);

  useEffect(() => {
    if (!pretextEnabled || !container) {
      return;
    }

    return observeDocumentFontLoads(container.ownerDocument, () => {
      clearPretextMeasurementCaches(PRETEXT_ENGINE);
      updateMeasurements(container);
    });
  }, [container, pretextEnabled]);

  useEffect(() => {
    if (!pretextEnabled) {
      return;
    }

    const defaultView = container?.ownerDocument.defaultView;
    const mediaQuery = defaultView?.matchMedia(
      STORY_GRID_TWO_COLUMN_MEDIA_QUERY,
    );

    if (!mediaQuery) {
      return;
    }

    const handleChange = () => updateMeasurements(container);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [container, pretextEnabled]);

  return {
    ref: setContainer,
    styleMap,
  };
}

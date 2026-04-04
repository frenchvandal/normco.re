import type { CSSProperties } from "npm/react";
import {
  startTransition,
  useEffect,
  useEffectEvent,
  useState,
} from "npm/react";
import {
  areTextMeasurementsEqual,
  buildMeasuredTextStyleVariables,
  buildPretextFont,
  clearPretextMeasurementCaches,
  EMPTY_MEASURED_TEXT_STATE,
  EMPTY_TEXT_MEASUREMENT,
  type MeasuredTextState,
  type MeasuredTextStyleVariables,
  measureTextBlock,
  observeDocumentFontLoads,
  PRETEXT_ENGINE,
  PRETEXT_MEASURE_FONT_TOKEN,
  type PretextEngine,
  readTextStyleSnapshot,
  resolveLineHeightPx,
  type TextMeasurement,
} from "./pretext-story-core.ts";

type MeasuredTextStyle = CSSProperties & MeasuredTextStyleVariables;

type UsePretextTextStyleOptions = Readonly<{
  disabled?: boolean | undefined;
  summary?: string | undefined;
  summarySelector?: string | undefined;
  title: string;
  titleSelector: string;
}>;

function measureElementText(
  element: HTMLElement | null,
  text?: string | undefined,
  engine: PretextEngine = PRETEXT_ENGINE,
): TextMeasurement {
  if (!element) {
    return EMPTY_TEXT_MEASUREMENT;
  }

  const defaultView = element.ownerDocument.defaultView;

  if (!defaultView) {
    return EMPTY_TEXT_MEASUREMENT;
  }

  const rootStyle = defaultView.getComputedStyle(
    element.ownerDocument.documentElement,
  );
  const textStyle = readTextStyleSnapshot(element);
  const width = element.clientWidth;
  const font = buildPretextFont(
    textStyle,
    rootStyle.getPropertyValue(PRETEXT_MEASURE_FONT_TOKEN),
  );

  return measureTextBlock(engine, {
    font,
    lineHeight: resolveLineHeightPx(textStyle.lineHeight, textStyle.fontSize),
    locale: element.ownerDocument.documentElement.lang,
    text,
    width,
  });
}

function queryMeasuredElement(
  container: HTMLElement,
  selector?: string | undefined,
): HTMLElement | null {
  if (!selector) {
    return null;
  }

  const candidate = container.querySelector(selector);
  return candidate instanceof HTMLElement ? candidate : null;
}

export function usePretextTextStyle(
  {
    disabled = false,
    summary,
    summarySelector,
    title,
    titleSelector,
  }: UsePretextTextStyleOptions,
): Readonly<{
  ref: (element: HTMLElement | null) => void;
  style: MeasuredTextStyle;
}> {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [measurements, setMeasurements] = useState<MeasuredTextState>(
    EMPTY_MEASURED_TEXT_STATE,
  );

  const updateMeasurements = useEffectEvent(
    (currentContainer: HTMLElement | null) => {
      if (disabled || !currentContainer) {
        if (
          !areTextMeasurementsEqual(measurements, EMPTY_MEASURED_TEXT_STATE)
        ) {
          startTransition(() => setMeasurements(EMPTY_MEASURED_TEXT_STATE));
        }
        return;
      }

      const nextMeasurements = {
        summary: measureElementText(
          queryMeasuredElement(currentContainer, summarySelector),
          summary,
        ),
        title: measureElementText(
          queryMeasuredElement(currentContainer, titleSelector),
          title,
        ),
      } as const satisfies MeasuredTextState;

      if (!areTextMeasurementsEqual(measurements, nextMeasurements)) {
        startTransition(() => setMeasurements(nextMeasurements));
      }
    },
  );

  useEffect(() => {
    if (disabled) {
      updateMeasurements(null);
      return;
    }

    updateMeasurements(container);
  }, [container, disabled, summary, summarySelector, title, titleSelector]);

  useEffect(() => {
    if (disabled || !container || typeof ResizeObserver !== "function") {
      return;
    }

    const measuredElements = [
      queryMeasuredElement(container, titleSelector),
      queryMeasuredElement(container, summarySelector),
    ].filter((element): element is HTMLElement => element !== null);

    if (measuredElements.length === 0) {
      return;
    }

    const observer = new ResizeObserver(() => {
      updateMeasurements(container);
    });

    measuredElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [container, disabled, summarySelector, titleSelector]);

  useEffect(() => {
    if (disabled || !container) {
      return;
    }

    return observeDocumentFontLoads(container.ownerDocument, () => {
      clearPretextMeasurementCaches(PRETEXT_ENGINE);
      updateMeasurements(container);
    });
  }, [container, disabled]);

  return {
    ref: setContainer,
    style: buildMeasuredTextStyleVariables(measurements),
  };
}

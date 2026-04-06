import {
  clearCache,
  layout,
  layoutWithLines,
  prepare,
  prepareWithSegments,
  setLocale,
  walkLineRanges,
} from "npm/pretext";

export type TextMeasurement = Readonly<{
  height: number;
  lineCount: number;
}>;

export type MeasuredTextState = Readonly<{
  summary: TextMeasurement;
  title: TextMeasurement;
}>;

export type TextStyleSnapshot = Readonly<{
  fontFamily?: string;
  fontSize: string;
  fontStyle: string;
  fontWeight: string;
  lineHeight: string;
}>;

export type MeasuredTextStyleVariables = {
  "--pretext-summary-height"?: string;
  "--pretext-summary-lines"?: number;
  "--pretext-title-height"?: string;
  "--pretext-title-lines"?: number;
};

export type TextLineCursor = Readonly<{
  graphemeIndex: number;
  segmentIndex: number;
}>;

export type TextLayoutLine = Readonly<{
  end: TextLineCursor;
  start: TextLineCursor;
  text: string;
  width: number;
}>;

export type TextLayoutLineRange = Readonly<{
  end: TextLineCursor;
  start: TextLineCursor;
  width: number;
}>;

export type TextLineLayout = Readonly<{
  height: number;
  lineCount: number;
  lines: readonly TextLayoutLine[];
}>;

export type WidestLineMeasurement = Readonly<{
  lineCount: number;
  widestLineWidth: number;
}>;

export type FontLoadObserverFontSet = Readonly<{
  addEventListener?(
    type: "loading" | "loadingdone",
    listener: () => void,
  ): void;
  removeEventListener?(
    type: "loading" | "loadingdone",
    listener: () => void,
  ): void;
  ready?: PromiseLike<unknown>;
  status?: "loaded" | "loading";
}>;

export type FontLoadObserverDocument = Readonly<{
  fonts?: FontLoadObserverFontSet | undefined;
}>;

export type PretextEngine<Prepared = unknown> = Readonly<{
  layout(
    prepared: Prepared,
    maxWidth: number,
    lineHeight: number,
  ): TextMeasurement;
  clearCache?(): void;
  prepare(text: string, font: string): Prepared;
  setLocale?(locale?: string): void;
}>;

export type PretextSegmentEngine<
  Prepared = unknown,
  PreparedWithSegments = unknown,
> =
  & PretextEngine<Prepared>
  & Readonly<{
    layoutWithLines(
      prepared: PreparedWithSegments,
      maxWidth: number,
      lineHeight: number,
    ): TextLineLayout;
    prepareWithSegments(text: string, font: string): PreparedWithSegments;
    walkLineRanges(
      prepared: PreparedWithSegments,
      maxWidth: number,
      onLine: (line: TextLayoutLineRange) => void,
    ): number;
  }>;

export const EMPTY_TEXT_MEASUREMENT = {
  height: 0,
  lineCount: 0,
} as const satisfies TextMeasurement;

export const EMPTY_TEXT_LINE_LAYOUT = {
  height: 0,
  lineCount: 0,
  lines: [],
} as const satisfies TextLineLayout;

export const EMPTY_MEASURED_TEXT_STATE = {
  summary: EMPTY_TEXT_MEASUREMENT,
  title: EMPTY_TEXT_MEASUREMENT,
} as const satisfies MeasuredTextState;

export const EMPTY_WIDEST_LINE_MEASUREMENT = {
  lineCount: 0,
  widestLineWidth: 0,
} as const satisfies WidestLineMeasurement;

export const PRETEXT_ENGINE = {
  clearCache,
  layout,
  layoutWithLines,
  prepare,
  prepareWithSegments,
  setLocale,
  walkLineRanges,
} as const satisfies PretextSegmentEngine;

export const PRETEXT_MEASURE_FONT_TOKEN = "--ph-font-measure";
export const PRETEXT_DISABLE_GLOBAL_FLAG = "__PH_DISABLE_PRETEXT__" as const;

const FALLBACK_MEASURE_FONT =
  '"Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif';
// Keep caches scoped by engine so tests and future multi-engine variants can
// isolate prepared text without changing the cache contract again later.
const PREPARED_TEXT_CACHE = new WeakMap<PretextEngine, Map<string, unknown>>();
const PREPARED_SEGMENT_TEXT_CACHE = new WeakMap<
  PretextSegmentEngine,
  Map<string, unknown>
>();
const PRETEXT_LOCALE_STATE = new WeakMap<PretextEngine, string | undefined>();

export function normalizePretextLocale(
  locale?: string,
): string | undefined {
  const normalized = locale?.trim();
  return normalized === "" ? undefined : normalized;
}

export function isPretextRuntimeEnabled(
  globalObject:
    | Partial<Record<typeof PRETEXT_DISABLE_GLOBAL_FLAG, boolean>>
    | undefined = globalThis as Partial<
      Record<typeof PRETEXT_DISABLE_GLOBAL_FLAG, boolean>
    >,
): boolean {
  return globalObject?.[PRETEXT_DISABLE_GLOBAL_FLAG] !== true;
}

export function clearPretextMeasurementCaches(
  engine: PretextEngine,
): void {
  PREPARED_TEXT_CACHE.delete(engine);
  PREPARED_SEGMENT_TEXT_CACHE.delete(engine as PretextSegmentEngine);
  engine.clearCache?.();
}

function syncPretextLocale(
  engine: PretextEngine,
  locale?: string,
): string | undefined {
  const normalizedLocale = normalizePretextLocale(locale);
  const activeLocale = PRETEXT_LOCALE_STATE.get(engine);

  if (engine.setLocale && activeLocale !== normalizedLocale) {
    engine.setLocale(normalizedLocale);
    clearPretextMeasurementCaches(engine);
    PRETEXT_LOCALE_STATE.set(engine, normalizedLocale);
  }

  return normalizedLocale;
}

function parsePixelValue(value: string): number | undefined {
  const trimmedValue = value.trim();

  if (trimmedValue === "" || !trimmedValue.endsWith("px")) {
    return undefined;
  }

  const parsedValue = Number.parseFloat(trimmedValue);
  return Number.isFinite(parsedValue) ? parsedValue : undefined;
}

function parseUnitlessNumber(value: string): number | undefined {
  const trimmedValue = value.trim();

  if (!/^[+-]?(?:\d+|\d*\.\d+)$/.test(trimmedValue)) {
    return undefined;
  }

  const parsedValue = Number.parseFloat(trimmedValue);
  return Number.isFinite(parsedValue) ? parsedValue : undefined;
}

function parseRelativeEmValue(value: string): number | undefined {
  const trimmedValue = value.trim();

  if (!/^[+-]?(?:\d+|\d*\.\d+)em$/.test(trimmedValue)) {
    return undefined;
  }

  const parsedValue = Number.parseFloat(trimmedValue);
  return Number.isFinite(parsedValue) ? parsedValue : undefined;
}

export function readTextStyleSnapshot(
  element: HTMLElement,
): TextStyleSnapshot {
  const computedStyle = element.ownerDocument.defaultView?.getComputedStyle(
    element,
  );

  return {
    ...(computedStyle?.fontFamily
      ? { fontFamily: computedStyle.fontFamily }
      : {}),
    fontSize: computedStyle?.fontSize ?? "16px",
    fontStyle: computedStyle?.fontStyle ?? "normal",
    fontWeight: computedStyle?.fontWeight ?? "400",
    lineHeight: computedStyle?.lineHeight ?? "normal",
  };
}

export function buildMeasuredTextStyleVariables(
  measurements: MeasuredTextState,
): MeasuredTextStyleVariables {
  return {
    ...(measurements.title.height > 0
      ? {
        "--pretext-title-height": `${measurements.title.height}px`,
        "--pretext-title-lines": measurements.title.lineCount,
      }
      : {}),
    ...(measurements.summary.height > 0
      ? {
        "--pretext-summary-height": `${measurements.summary.height}px`,
        "--pretext-summary-lines": measurements.summary.lineCount,
      }
      : {}),
  };
}

export function observeDocumentFontLoads(
  document: FontLoadObserverDocument,
  onLoadingDone: () => void,
): (() => void) | undefined {
  const fontSet = document.fonts;
  const addEventListener = fontSet?.addEventListener;
  const removeEventListener = fontSet?.removeEventListener;
  let isActive = true;
  let activeLoadingCycle = 0;
  let lastHandledCycle = 0;

  const notifyLoadingDone = (cycle?: number) => {
    if (!isActive) {
      return;
    }

    if (cycle !== undefined) {
      lastHandledCycle = Math.max(lastHandledCycle, cycle);
    }

    onLoadingDone();
  };

  const observeCurrentReadyCycle = (cycle: number) => {
    if (!fontSet || typeof fontSet.ready?.then !== "function") {
      return false;
    }

    void fontSet.ready.then(() => {
      if (
        !isActive || activeLoadingCycle !== cycle || lastHandledCycle >= cycle
      ) {
        return;
      }

      notifyLoadingDone(cycle);
    });

    return true;
  };

  if (
    !fontSet ||
    typeof addEventListener !== "function" ||
    typeof removeEventListener !== "function"
  ) {
    return observeCurrentReadyCycle(1)
      ? () => {
        isActive = false;
      }
      : undefined;
  }

  const handleLoading = () => {
    activeLoadingCycle += 1;
    observeCurrentReadyCycle(activeLoadingCycle);
  };
  const handleLoadingDone = () => {
    if (activeLoadingCycle > 0 && lastHandledCycle >= activeLoadingCycle) {
      return;
    }

    notifyLoadingDone(activeLoadingCycle || undefined);
  };

  if (fontSet.status === "loading") {
    handleLoading();
  }

  addEventListener.call(fontSet, "loading", handleLoading);
  addEventListener.call(fontSet, "loadingdone", handleLoadingDone);

  return () => {
    isActive = false;
    removeEventListener.call(fontSet, "loading", handleLoading);
    removeEventListener.call(fontSet, "loadingdone", handleLoadingDone);
  };
}

export function buildPretextFont(
  style: TextStyleSnapshot,
  measureFontFamily: string,
): string {
  const resolvedFontFamily = style.fontFamily?.trim() ||
    measureFontFamily.trim() ||
    FALLBACK_MEASURE_FONT;

  return [
    style.fontStyle === "normal" ? "" : style.fontStyle,
    (style.fontWeight === "normal" || style.fontWeight === "400")
      ? ""
      : style.fontWeight,
    style.fontSize,
    resolvedFontFamily,
  ]
    .filter(Boolean)
    .join(" ");
}

export function resolveLineHeightPx(
  lineHeightValue: string,
  fontSizeValue: string,
): number {
  const fontSize = parsePixelValue(fontSizeValue) ?? 16;
  const trimmedLineHeight = lineHeightValue.trim();

  if (trimmedLineHeight === "" || trimmedLineHeight === "normal") {
    // `normal` remains font-dependent in CSS, so keep the fallback explicit and
    // prefer author-specified line-heights on measured surfaces when precision matters.
    return fontSize * 1.2;
  }

  const lineHeightPx = parsePixelValue(trimmedLineHeight);

  if (lineHeightPx !== undefined) {
    return lineHeightPx;
  }

  const lineHeightEm = parseRelativeEmValue(trimmedLineHeight);

  if (lineHeightEm !== undefined) {
    return lineHeightEm * fontSize;
  }

  const parsedUnitlessValue = parseUnitlessNumber(trimmedLineHeight);
  return parsedUnitlessValue !== undefined
    ? parsedUnitlessValue * fontSize
    : fontSize * 1.2;
}

export function measureTextBlock<Prepared>(
  engine: PretextEngine<Prepared>,
  {
    font,
    lineHeight,
    locale,
    text,
    width,
  }: {
    font: string;
    lineHeight: number;
    locale?: string | undefined;
    text?: string | undefined;
    width: number;
  },
): TextMeasurement {
  const normalizedText = text?.trim();

  if (!normalizedText || width <= 0 || lineHeight <= 0) {
    return EMPTY_TEXT_MEASUREMENT;
  }

  const normalizedLocale = syncPretextLocale(engine, locale);
  const cacheKey = [normalizedLocale ?? "", font, normalizedText].join("\0");
  const engineCache =
    (PREPARED_TEXT_CACHE.get(engine) as Map<string, Prepared> | undefined) ??
      new Map<string, Prepared>();

  if (!PREPARED_TEXT_CACHE.has(engine)) {
    PREPARED_TEXT_CACHE.set(engine, engineCache);
  }

  let preparedText = engineCache.get(cacheKey);

  if (preparedText === undefined) {
    preparedText = engine.prepare(normalizedText, font);
    engineCache.set(cacheKey, preparedText);
  }

  return engine.layout(preparedText, width, lineHeight);
}

function getPreparedSegmentText<PreparedWithSegments>(
  engine: PretextSegmentEngine<unknown, PreparedWithSegments>,
  cacheKey: string,
  text: string,
  font: string,
): PreparedWithSegments {
  const engineCache = (PREPARED_SEGMENT_TEXT_CACHE.get(engine) as
    | Map<
      string,
      PreparedWithSegments
    >
    | undefined) ?? new Map<string, PreparedWithSegments>();

  if (!PREPARED_SEGMENT_TEXT_CACHE.has(engine)) {
    PREPARED_SEGMENT_TEXT_CACHE.set(engine, engineCache);
  }

  let preparedText = engineCache.get(cacheKey);

  if (preparedText === undefined) {
    preparedText = engine.prepareWithSegments(text, font);
    engineCache.set(cacheKey, preparedText);
  }

  return preparedText;
}

export function layoutTextBlockWithLines<PreparedWithSegments>(
  engine: PretextSegmentEngine<unknown, PreparedWithSegments>,
  {
    font,
    lineHeight,
    locale,
    text,
    width,
  }: {
    font: string;
    lineHeight: number;
    locale?: string | undefined;
    text?: string | undefined;
    width: number;
  },
): TextLineLayout {
  const normalizedText = text?.trim();

  if (!normalizedText || width <= 0 || lineHeight <= 0) {
    return EMPTY_TEXT_LINE_LAYOUT;
  }

  const normalizedLocale = syncPretextLocale(engine, locale);
  const cacheKey = [normalizedLocale ?? "", font, normalizedText].join("\0");
  const preparedText = getPreparedSegmentText(
    engine,
    cacheKey,
    normalizedText,
    font,
  );

  return engine.layoutWithLines(preparedText, width, lineHeight);
}

export function measureTextBlockWidestLine<PreparedWithSegments>(
  engine: PretextSegmentEngine<unknown, PreparedWithSegments>,
  {
    font,
    locale,
    text,
    width,
  }: {
    font: string;
    locale?: string | undefined;
    text?: string | undefined;
    width: number;
  },
): WidestLineMeasurement {
  const normalizedText = text?.trim();

  if (!normalizedText || width <= 0) {
    return EMPTY_WIDEST_LINE_MEASUREMENT;
  }

  const normalizedLocale = syncPretextLocale(engine, locale);
  const cacheKey = [normalizedLocale ?? "", font, normalizedText].join("\0");
  const preparedText = getPreparedSegmentText(
    engine,
    cacheKey,
    normalizedText,
    font,
  );
  let widestLineWidth = 0;
  const lineCount = engine.walkLineRanges(preparedText, width, (line) => {
    widestLineWidth = Math.max(widestLineWidth, line.width);
  });

  return { lineCount, widestLineWidth };
}

export function areTextMeasurementsEqual(
  current: MeasuredTextState,
  next: MeasuredTextState,
): boolean {
  return current.title.height === next.title.height &&
    current.title.lineCount === next.title.lineCount &&
    current.summary.height === next.summary.height &&
    current.summary.lineCount === next.summary.lineCount;
}

export function balanceTextMeasurementsByRow(
  measurements: ReadonlyArray<MeasuredTextState>,
  columns: number,
): MeasuredTextState[] {
  const normalizedColumns = Number.isInteger(columns) && columns > 0
    ? columns
    : 1;

  if (normalizedColumns === 1) {
    return [...measurements];
  }

  const balancedMeasurements: MeasuredTextState[] = [];

  for (let index = 0; index < measurements.length; index += normalizedColumns) {
    const rowMeasurements = measurements.slice(
      index,
      index + normalizedColumns,
    );
    const rowTitleHeight = Math.max(
      ...rowMeasurements.map(({ title }) => title.height),
    );
    const rowTitleLines = Math.max(
      ...rowMeasurements.map(({ title }) => title.lineCount),
    );
    const rowSummaryHeight = Math.max(
      ...rowMeasurements.map(({ summary }) => summary.height),
    );
    const rowSummaryLines = Math.max(
      ...rowMeasurements.map(({ summary }) => summary.lineCount),
    );

    rowMeasurements.forEach(() => {
      balancedMeasurements.push({
        title: {
          height: rowTitleHeight,
          lineCount: rowTitleLines,
        },
        summary: {
          height: rowSummaryHeight,
          lineCount: rowSummaryLines,
        },
      });
    });
  }

  return balancedMeasurements;
}

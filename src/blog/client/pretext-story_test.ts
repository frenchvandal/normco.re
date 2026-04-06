import { assertAlmostEquals, assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import type {
  FontLoadObserverDocument,
  FontLoadObserverFontSet,
  TextLayoutLineRange,
} from "./pretext-story-core.ts";
import {
  balanceTextMeasurementsByRow,
  buildMeasuredTextStyleVariables,
  buildPretextFont,
  clearPretextMeasurementCaches,
  isPretextRuntimeEnabled,
  layoutTextBlockWithLines,
  measureTextBlock,
  measureTextBlockWidestLine,
  observeDocumentFontLoads,
  resolveLineHeightPx,
} from "./pretext-story-core.ts";

describe("buildPretextFont()", () => {
  it("uses the explicit measurement family instead of the live UI stack", () => {
    assertEquals(
      buildPretextFont(
        {
          fontSize: "20px",
          fontStyle: "normal",
          fontWeight: "700",
          lineHeight: "24px",
        },
        '"Segoe UI", Roboto, sans-serif',
      ),
      '700 20px "Segoe UI", Roboto, sans-serif',
    );
  });

  it("prefers the live computed family when the browser resolves one", () => {
    assertEquals(
      buildPretextFont(
        {
          fontFamily: '-apple-system, "Segoe UI", sans-serif',
          fontSize: "20px",
          fontStyle: "normal",
          fontWeight: "700",
          lineHeight: "24px",
        },
        '"Segoe UI", Roboto, sans-serif',
      ),
      '700 20px -apple-system, "Segoe UI", sans-serif',
    );
  });

  it("omits the default 400 weight from the measurement font string", () => {
    assertEquals(
      buildPretextFont(
        {
          fontSize: "16px",
          fontStyle: "normal",
          fontWeight: "400",
          lineHeight: "24px",
        },
        '"Segoe UI", Roboto, sans-serif',
      ),
      '16px "Segoe UI", Roboto, sans-serif',
    );
  });
});

describe("isPretextRuntimeEnabled()", () => {
  it("stays enabled by default and disables only when the global flag is true", () => {
    assertEquals(isPretextRuntimeEnabled({}), true);
    assertEquals(
      isPretextRuntimeEnabled({ __PH_DISABLE_PRETEXT__: false }),
      true,
    );
    assertEquals(
      isPretextRuntimeEnabled({ __PH_DISABLE_PRETEXT__: true }),
      false,
    );
  });
});

describe("resolveLineHeightPx()", () => {
  it("resolves pixel line heights directly", () => {
    assertEquals(resolveLineHeightPx("28px", "18px"), 28);
  });

  it("resolves relative em line heights from the computed font size", () => {
    assertEquals(resolveLineHeightPx("1.5em", "20px"), 30);
  });

  it("resolves unitless line heights from the computed font size", () => {
    assertEquals(resolveLineHeightPx("1.25", "20px"), 25);
  });

  it("falls back to a readable default when line-height is normal", () => {
    assertAlmostEquals(resolveLineHeightPx("normal", "18px"), 21.6);
  });

  it("falls back to a readable default for unsupported units", () => {
    assertAlmostEquals(resolveLineHeightPx("1.5rem", "18px"), 21.6);
  });
});

describe("buildMeasuredTextStyleVariables()", () => {
  it("serializes measured heights and line counts into CSS variables", () => {
    assertEquals(
      buildMeasuredTextStyleVariables({
        title: { height: 48, lineCount: 2 },
        summary: { height: 72, lineCount: 3 },
      }),
      {
        "--pretext-title-height": "48px",
        "--pretext-title-lines": 2,
        "--pretext-summary-height": "72px",
        "--pretext-summary-lines": 3,
      },
    );
  });
});

describe("observeDocumentFontLoads()", () => {
  function createFontSetStub(): {
    emit(type: "loading" | "loadingdone"): void;
    fontSet: FontLoadObserverFontSet;
    setPendingReady(nextReady: Promise<void>): void;
    settleReady(): void;
  } {
    const listeners = new Map<string, Set<() => void>>();
    let status: "loaded" | "loading" = "loaded";
    let ready = Promise.resolve();

    return {
      emit(type: string) {
        listeners.get(type)?.forEach((listener) => listener());
      },
      fontSet: {
        addEventListener(type: string, listener: () => void) {
          const registeredListeners = listeners.get(type) ?? new Set();
          registeredListeners.add(listener);
          listeners.set(type, registeredListeners);
        },
        removeEventListener(type: string, listener: () => void) {
          listeners.get(type)?.delete(listener);
        },
        get ready() {
          return ready;
        },
        get status() {
          return status;
        },
      },
      setPendingReady(nextReady: Promise<void>) {
        status = "loading";
        ready = nextReady;
      },
      settleReady() {
        status = "loaded";
      },
    };
  }

  function createDocumentStub(
    fontSet: FontLoadObserverFontSet,
  ): FontLoadObserverDocument {
    return { fonts: fontSet };
  }

  it("replays an in-flight font loading cycle when ready settles after subscription", async () => {
    const fontSetStub = createFontSetStub();
    let resolveReady!: () => void;
    const calls: number[] = [];

    fontSetStub.setPendingReady(
      new Promise<void>((resolve) => {
        resolveReady = resolve;
      }),
    );

    const cleanup = observeDocumentFontLoads(
      createDocumentStub(fontSetStub.fontSet),
      () => {
        calls.push(1);
      },
    );

    resolveReady();
    fontSetStub.settleReady();
    await Promise.resolve();

    assertEquals(calls, [1]);
    cleanup?.();
  });

  it("dedupes ready resolution and loadingdone for the same cycle", async () => {
    const fontSetStub = createFontSetStub();
    let resolveReady!: () => void;
    const calls: number[] = [];

    fontSetStub.setPendingReady(
      new Promise<void>((resolve) => {
        resolveReady = resolve;
      }),
    );

    const cleanup = observeDocumentFontLoads(
      createDocumentStub(fontSetStub.fontSet),
      () => {
        calls.push(1);
      },
    );

    resolveReady();
    fontSetStub.settleReady();
    await Promise.resolve();
    fontSetStub.emit("loadingdone");

    assertEquals(calls, [1]);
    cleanup?.();
  });

  it("continues observing later font loading cycles after the initial catch-up", async () => {
    const fontSetStub = createFontSetStub();
    let resolveInitialReady!: () => void;
    let resolveNextReady!: () => void;
    const calls: number[] = [];

    fontSetStub.setPendingReady(
      new Promise<void>((resolve) => {
        resolveInitialReady = resolve;
      }),
    );

    const cleanup = observeDocumentFontLoads(
      createDocumentStub(fontSetStub.fontSet),
      () => {
        calls.push(1);
      },
    );

    resolveInitialReady();
    fontSetStub.settleReady();
    await Promise.resolve();

    fontSetStub.setPendingReady(
      new Promise<void>((resolve) => {
        resolveNextReady = resolve;
      }),
    );
    fontSetStub.emit("loading");
    fontSetStub.settleReady();
    fontSetStub.emit("loadingdone");
    resolveNextReady();
    await Promise.resolve();

    assertEquals(calls, [1, 1]);
    cleanup?.();
  });
});

describe("measureTextBlock()", () => {
  it("reuses prepared text for repeated layout calls with the same locale", () => {
    const preparedKeys: string[] = [];
    const localeCalls: Array<string | undefined> = [];
    const engine = {
      layout(
        _prepared: string,
        maxWidth: number,
        lineHeight: number,
      ) {
        return {
          height: lineHeight * 2,
          lineCount: maxWidth > 200 ? 2 : 3,
        };
      },
      prepare(text: string, font: string) {
        const key = `${font}::${text}`;
        preparedKeys.push(key);
        return key;
      },
      setLocale(locale?: string) {
        localeCalls.push(locale);
      },
    };

    const first = measureTextBlock(engine, {
      font: '600 18px "Segoe UI"',
      lineHeight: 24,
      locale: "fr",
      text: "Bonjour tout le monde",
      width: 240,
    });
    const second = measureTextBlock(engine, {
      font: '600 18px "Segoe UI"',
      lineHeight: 24,
      locale: "fr",
      text: "Bonjour tout le monde",
      width: 180,
    });

    assertEquals(preparedKeys.length, 1);
    assertEquals(localeCalls, ["fr"]);
    assertEquals(first, { height: 48, lineCount: 2 });
    assertEquals(second, { height: 48, lineCount: 3 });
  });

  it("drops the prepared cache when the locale changes", () => {
    const preparedKeys: string[] = [];
    const localeCalls: Array<string | undefined> = [];
    const engine = {
      layout(_prepared: string, _maxWidth: number, lineHeight: number) {
        return {
          height: lineHeight,
          lineCount: 1,
        };
      },
      prepare(text: string, font: string) {
        const key = `${font}::${text}`;
        preparedKeys.push(key);
        return key;
      },
      setLocale(locale?: string) {
        localeCalls.push(locale);
      },
    };

    measureTextBlock(engine, {
      font: '600 18px "Segoe UI"',
      lineHeight: 24,
      locale: "fr",
      text: "Bonjour",
      width: 200,
    });
    measureTextBlock(engine, {
      font: '600 18px "Segoe UI"',
      lineHeight: 24,
      locale: "en",
      text: "Bonjour",
      width: 200,
    });

    assertEquals(preparedKeys.length, 2);
    assertEquals(localeCalls, ["fr", "en"]);
  });
});

describe("clearPretextMeasurementCaches()", () => {
  it("drops prepared text caches and forwards clearCache to the engine", () => {
    const preparedKeys: string[] = [];
    const clearCacheCalls: number[] = [];
    const engine = {
      clearCache() {
        clearCacheCalls.push(1);
      },
      layout(_prepared: string, _maxWidth: number, lineHeight: number) {
        return {
          height: lineHeight,
          lineCount: 1,
        };
      },
      prepare(text: string, font: string) {
        const key = `${font}::${text}`;
        preparedKeys.push(key);
        return key;
      },
    };

    measureTextBlock(engine, {
      font: '600 18px "Segoe UI"',
      lineHeight: 24,
      locale: "fr",
      text: "Bonjour",
      width: 200,
    });
    clearPretextMeasurementCaches(engine);
    measureTextBlock(engine, {
      font: '600 18px "Segoe UI"',
      lineHeight: 24,
      locale: "fr",
      text: "Bonjour",
      width: 200,
    });

    assertEquals(preparedKeys.length, 2);
    assertEquals(clearCacheCalls.length, 1);
  });
});

describe("layoutTextBlockWithLines()", () => {
  it("reuses segmented prepared text across line inspection helpers", () => {
    const segmentedPreparedKeys: string[] = [];
    const localeCalls: Array<string | undefined> = [];
    const engine = {
      layout(_prepared: string, _maxWidth: number, lineHeight: number) {
        return {
          height: lineHeight,
          lineCount: 1,
        };
      },
      layoutWithLines(prepared: string, maxWidth: number, lineHeight: number) {
        return {
          height: lineHeight * 2,
          lineCount: 2,
          lines: [
            {
              end: { graphemeIndex: 5, segmentIndex: 0 },
              start: { graphemeIndex: 0, segmentIndex: 0 },
              text: `${prepared}-1`,
              width: maxWidth - 24,
            },
            {
              end: { graphemeIndex: 11, segmentIndex: 0 },
              start: { graphemeIndex: 5, segmentIndex: 0 },
              text: `${prepared}-2`,
              width: maxWidth - 36,
            },
          ],
        };
      },
      prepare(text: string, font: string) {
        return `${font}::${text}`;
      },
      prepareWithSegments(text: string, font: string) {
        const key = `${font}::${text}`;
        segmentedPreparedKeys.push(key);
        return key;
      },
      setLocale(locale?: string) {
        localeCalls.push(locale);
      },
      walkLineRanges(
        _prepared: string,
        maxWidth: number,
        onLine: (line: TextLayoutLineRange) => void,
      ) {
        onLine({
          end: { graphemeIndex: 5, segmentIndex: 0 },
          start: { graphemeIndex: 0, segmentIndex: 0 },
          width: maxWidth - 28,
        });
        onLine({
          end: { graphemeIndex: 11, segmentIndex: 0 },
          start: { graphemeIndex: 5, segmentIndex: 0 },
          width: maxWidth - 12,
        });
        return 2;
      },
    };

    const layoutResult = layoutTextBlockWithLines(engine, {
      font: '780 32px "Segoe UI"',
      lineHeight: 34,
      locale: "fr",
      text: "Bonjour les lignes",
      width: 220,
    });
    const widestLine = measureTextBlockWidestLine(engine, {
      font: '780 32px "Segoe UI"',
      locale: "fr",
      text: "Bonjour les lignes",
      width: 220,
    });

    assertEquals(segmentedPreparedKeys.length, 1);
    assertEquals(localeCalls, ["fr"]);
    assertEquals(layoutResult.lineCount, 2);
    assertEquals(layoutResult.height, 68);
    assertEquals(
      layoutResult.lines[0]?.text,
      '780 32px "Segoe UI"::Bonjour les lignes-1',
    );
    assertEquals(widestLine, { lineCount: 2, widestLineWidth: 208 });
  });

  it("drops the segmented prepared cache when the locale changes", () => {
    const segmentedPreparedKeys: string[] = [];
    const localeCalls: Array<string | undefined> = [];
    const engine = {
      layout(_prepared: string, _maxWidth: number, lineHeight: number) {
        return {
          height: lineHeight,
          lineCount: 1,
        };
      },
      layoutWithLines(
        _prepared: string,
        _maxWidth: number,
        lineHeight: number,
      ) {
        return {
          height: lineHeight,
          lineCount: 1,
          lines: [
            {
              end: { graphemeIndex: 7, segmentIndex: 0 },
              start: { graphemeIndex: 0, segmentIndex: 0 },
              text: "Bonjour",
              width: 88,
            },
          ],
        };
      },
      prepare(text: string, font: string) {
        return `${font}::${text}`;
      },
      prepareWithSegments(text: string, font: string) {
        const key = `${font}::${text}`;
        segmentedPreparedKeys.push(key);
        return key;
      },
      setLocale(locale?: string) {
        localeCalls.push(locale);
      },
      walkLineRanges(
        _prepared: string,
        _maxWidth: number,
        onLine: (line: TextLayoutLineRange) => void,
      ) {
        onLine({
          end: { graphemeIndex: 7, segmentIndex: 0 },
          start: { graphemeIndex: 0, segmentIndex: 0 },
          width: 88,
        });
        return 1;
      },
    };

    layoutTextBlockWithLines(engine, {
      font: '600 18px "Segoe UI"',
      lineHeight: 24,
      locale: "fr",
      text: "Bonjour",
      width: 200,
    });
    measureTextBlockWidestLine(engine, {
      font: '600 18px "Segoe UI"',
      locale: "en",
      text: "Bonjour",
      width: 200,
    });

    assertEquals(segmentedPreparedKeys.length, 2);
    assertEquals(localeCalls, ["fr", "en"]);
  });
});

describe("balanceTextMeasurementsByRow()", () => {
  it("keeps single-column layouts unchanged", () => {
    const measurements = [
      {
        title: { height: 24, lineCount: 1 },
        summary: { height: 48, lineCount: 2 },
      },
      {
        title: { height: 48, lineCount: 2 },
        summary: { height: 24, lineCount: 1 },
      },
    ] as const;

    assertEquals(balanceTextMeasurementsByRow(measurements, 1), [
      ...measurements,
    ]);
  });

  it("equalizes row maxima across the current two-column row only", () => {
    const measurements = [
      {
        title: { height: 24, lineCount: 1 },
        summary: { height: 48, lineCount: 2 },
      },
      {
        title: { height: 72, lineCount: 3 },
        summary: { height: 24, lineCount: 1 },
      },
      {
        title: { height: 48, lineCount: 2 },
        summary: { height: 24, lineCount: 1 },
      },
    ] as const;

    assertEquals(
      balanceTextMeasurementsByRow(measurements, 2),
      [
        {
          title: { height: 72, lineCount: 3 },
          summary: { height: 48, lineCount: 2 },
        },
        {
          title: { height: 72, lineCount: 3 },
          summary: { height: 48, lineCount: 2 },
        },
        {
          title: { height: 48, lineCount: 2 },
          summary: { height: 24, lineCount: 1 },
        },
      ],
    );
  });
});

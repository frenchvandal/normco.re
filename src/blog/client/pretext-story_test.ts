import { assertAlmostEquals, assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import type {
  FontLoadObserverDocument,
  FontLoadObserverFontSet,
  PretextPrepareOptions,
} from "./pretext-story-core.ts";
import {
  balanceTextMeasurementsByRow,
  buildMeasuredTextStyleVariables,
  buildPretextFont,
  clearPretextMeasurementCaches,
  isPretextRuntimeEnabled,
  layoutTextBlockWithLines,
  measureTextBlock,
  measureTextBlockNaturalWidth,
  measureTextBlockWidestLine,
  observeDocumentFontLoads,
  resolveLetterSpacingPx,
  resolveLineHeightPx,
  resolveLocaleWordBreak,
} from "./pretext-story-core.ts";

describe("buildPretextFont()", () => {
  it("uses the explicit measurement family instead of the live UI stack", () => {
    assertEquals(
      buildPretextFont(
        {
          fontSize: "20px",
          fontStyle: "normal",
          fontWeight: "700",
          letterSpacing: "normal",
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
          letterSpacing: "normal",
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
          letterSpacing: "normal",
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

describe("resolveLetterSpacingPx()", () => {
  it("returns undefined for the default `normal` tracking", () => {
    assertEquals(resolveLetterSpacingPx("normal", "18px"), undefined);
  });

  it("returns undefined for an empty value", () => {
    assertEquals(resolveLetterSpacingPx("", "18px"), undefined);
  });

  it("returns undefined for a zero-px tracking to keep the cache key clean", () => {
    assertEquals(resolveLetterSpacingPx("0px", "18px"), undefined);
  });

  it("returns undefined for a zero-em tracking", () => {
    assertEquals(resolveLetterSpacingPx("0em", "18px"), undefined);
  });

  it("passes through an explicit pixel tracking", () => {
    assertEquals(resolveLetterSpacingPx("1.5px", "16px"), 1.5);
  });

  it("resolves a negative em tracking against the computed font size", () => {
    const resolved = resolveLetterSpacingPx("-0.055em", "40px");
    if (resolved === undefined) {
      throw new Error("expected a resolved pixel value");
    }
    assertAlmostEquals(resolved, -2.2);
  });

  it("returns undefined for unsupported CSS units", () => {
    assertEquals(resolveLetterSpacingPx("0.1rem", "18px"), undefined);
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
      measureLineStats(_prepared: string, maxWidth: number) {
        return {
          lineCount: 2,
          maxLineWidth: maxWidth - 12,
        };
      },
      measureNaturalWidth(_prepared: string) {
        return 360;
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
      measureLineStats(_prepared: string, _maxWidth: number) {
        return { lineCount: 1, maxLineWidth: 88 };
      },
      measureNaturalWidth(_prepared: string) {
        return 88;
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

describe("measureTextBlockNaturalWidth()", () => {
  it("returns the engine-reported natural width via the segment cache", () => {
    const segmentedPreparedKeys: string[] = [];
    const naturalWidthCalls: string[] = [];
    const engine = {
      layout(_prepared: string, _maxWidth: number, lineHeight: number) {
        return { height: lineHeight, lineCount: 1 };
      },
      layoutWithLines(
        _prepared: string,
        _maxWidth: number,
        lineHeight: number,
      ) {
        return { height: lineHeight, lineCount: 1, lines: [] };
      },
      measureLineStats(_prepared: string, _maxWidth: number) {
        return { lineCount: 1, maxLineWidth: 0 };
      },
      measureNaturalWidth(prepared: string) {
        naturalWidthCalls.push(prepared);
        return 184;
      },
      prepare(text: string, font: string) {
        return `${font}::${text}`;
      },
      prepareWithSegments(text: string, font: string) {
        const key = `${font}::${text}`;
        segmentedPreparedKeys.push(key);
        return key;
      },
      setLocale(_locale?: string) {},
    };

    const naturalWidth = measureTextBlockNaturalWidth(engine, {
      font: '600 18px "Segoe UI"',
      locale: "fr",
      text: "Archives de mars",
    });
    const cachedNaturalWidth = measureTextBlockNaturalWidth(engine, {
      font: '600 18px "Segoe UI"',
      locale: "fr",
      text: "Archives de mars",
    });

    assertEquals(naturalWidth, 184);
    assertEquals(cachedNaturalWidth, 184);
    assertEquals(segmentedPreparedKeys.length, 1);
    assertEquals(naturalWidthCalls.length, 2);
  });

  it("returns zero for empty text without touching the engine", () => {
    let prepareCalls = 0;
    const engine = {
      layout(_prepared: string, _maxWidth: number, lineHeight: number) {
        return { height: lineHeight, lineCount: 0 };
      },
      layoutWithLines(
        _prepared: string,
        _maxWidth: number,
        lineHeight: number,
      ) {
        return { height: lineHeight, lineCount: 0, lines: [] };
      },
      measureLineStats(_prepared: string, _maxWidth: number) {
        return { lineCount: 0, maxLineWidth: 0 };
      },
      measureNaturalWidth(_prepared: string) {
        return 0;
      },
      prepare(_text: string, _font: string) {
        prepareCalls += 1;
        return "";
      },
      prepareWithSegments(_text: string, _font: string) {
        prepareCalls += 1;
        return "";
      },
    };

    assertEquals(
      measureTextBlockNaturalWidth(engine, {
        font: '600 18px "Segoe UI"',
        text: "   ",
      }),
      0,
    );
    assertEquals(prepareCalls, 0);
  });
});

describe("resolveLocaleWordBreak()", () => {
  it("returns keep-all for zh and ko locales to match browser CJK behavior", () => {
    assertEquals(resolveLocaleWordBreak("zh-hans"), "keep-all");
    assertEquals(resolveLocaleWordBreak("zh-Hant"), "keep-all");
    assertEquals(resolveLocaleWordBreak("ko"), "keep-all");
  });

  it("leaves Latin-script locales untouched", () => {
    assertEquals(resolveLocaleWordBreak("en"), undefined);
    assertEquals(resolveLocaleWordBreak("fr"), undefined);
    assertEquals(resolveLocaleWordBreak(""), undefined);
    assertEquals(resolveLocaleWordBreak(undefined), undefined);
  });
});

describe("wordBreak option threading", () => {
  it("forwards the prepare option to prepare() and partitions the cache", () => {
    const prepareCalls: Array<{
      text: string;
      options: PretextPrepareOptions | undefined;
    }> = [];
    const engine = {
      layout(_prepared: string, _maxWidth: number, lineHeight: number) {
        return { height: lineHeight, lineCount: 1 };
      },
      prepare(
        text: string,
        _font: string,
        options?: PretextPrepareOptions,
      ) {
        prepareCalls.push({ text, options });
        return `${options?.wordBreak ?? "default"}::${text}`;
      },
      setLocale(_locale?: string) {},
    };

    measureTextBlock(engine, {
      font: '600 18px "Segoe UI"',
      lineHeight: 24,
      locale: "zh-hans",
      text: "设计系统",
      width: 200,
      wordBreak: "keep-all",
    });
    measureTextBlock(engine, {
      font: '600 18px "Segoe UI"',
      lineHeight: 24,
      locale: "zh-hans",
      text: "设计系统",
      width: 200,
      wordBreak: "keep-all",
    });
    measureTextBlock(engine, {
      font: '600 18px "Segoe UI"',
      lineHeight: 24,
      locale: "zh-hans",
      text: "设计系统",
      width: 200,
    });

    assertEquals(prepareCalls.length, 2);
    assertEquals(prepareCalls[0]?.options, { wordBreak: "keep-all" });
    assertEquals(prepareCalls[1]?.options, undefined);
  });

  it("forwards the prepare option to prepareWithSegments() as well", () => {
    const prepareCalls: Array<PretextPrepareOptions | undefined> = [];
    const engine = {
      layout(_prepared: string, _maxWidth: number, lineHeight: number) {
        return { height: lineHeight, lineCount: 1 };
      },
      layoutWithLines(
        _prepared: string,
        _maxWidth: number,
        lineHeight: number,
      ) {
        return { height: lineHeight, lineCount: 1, lines: [] };
      },
      measureLineStats(_prepared: string, _maxWidth: number) {
        return { lineCount: 1, maxLineWidth: 120 };
      },
      measureNaturalWidth(_prepared: string) {
        return 120;
      },
      prepare(text: string, font: string) {
        return `${font}::${text}`;
      },
      prepareWithSegments(
        text: string,
        _font: string,
        options?: PretextPrepareOptions,
      ) {
        prepareCalls.push(options);
        return text;
      },
      setLocale(_locale?: string) {},
    };

    measureTextBlockWidestLine(engine, {
      font: '600 18px "Segoe UI"',
      locale: "zh-hant",
      text: "設計",
      width: 200,
      wordBreak: "keep-all",
    });

    assertEquals(prepareCalls, [{ wordBreak: "keep-all" }]);
  });
});

describe("letterSpacing option threading", () => {
  it("forwards the numeric letterSpacing to prepare() and partitions the cache per value", () => {
    const prepareCalls: Array<PretextPrepareOptions | undefined> = [];
    const engine = {
      layout(_prepared: string, _maxWidth: number, lineHeight: number) {
        return { height: lineHeight, lineCount: 1 };
      },
      prepare(
        text: string,
        _font: string,
        options?: PretextPrepareOptions,
      ) {
        prepareCalls.push(options);
        return `${options?.letterSpacing ?? "default"}::${text}`;
      },
      setLocale(_locale?: string) {},
    };

    measureTextBlock(engine, {
      font: '700 40px "Segoe UI"',
      letterSpacing: -2.2,
      lineHeight: 40,
      text: "Typography",
      width: 320,
    });
    measureTextBlock(engine, {
      font: '700 40px "Segoe UI"',
      letterSpacing: -2.2,
      lineHeight: 40,
      text: "Typography",
      width: 320,
    });
    measureTextBlock(engine, {
      font: '700 40px "Segoe UI"',
      lineHeight: 40,
      text: "Typography",
      width: 320,
    });

    assertEquals(prepareCalls.length, 2);
    assertEquals(prepareCalls[0], { letterSpacing: -2.2 });
    assertEquals(prepareCalls[1], undefined);
  });

  it("combines wordBreak and letterSpacing in a single prepare() options object", () => {
    const prepareCalls: Array<PretextPrepareOptions | undefined> = [];
    const engine = {
      layout(_prepared: string, _maxWidth: number, lineHeight: number) {
        return { height: lineHeight, lineCount: 1 };
      },
      prepare(
        text: string,
        _font: string,
        options?: PretextPrepareOptions,
      ) {
        prepareCalls.push(options);
        return text;
      },
      setLocale(_locale?: string) {},
    };

    measureTextBlock(engine, {
      font: '700 18px "Segoe UI"',
      letterSpacing: 0.4,
      lineHeight: 22,
      locale: "zh-hans",
      text: "排版",
      width: 200,
      wordBreak: "keep-all",
    });

    assertEquals(prepareCalls, [{
      wordBreak: "keep-all",
      letterSpacing: 0.4,
    }]);
  });

  it("forwards letterSpacing through measureTextBlockWidestLine() as well", () => {
    const prepareCalls: Array<PretextPrepareOptions | undefined> = [];
    const engine = {
      layout(_prepared: string, _maxWidth: number, lineHeight: number) {
        return { height: lineHeight, lineCount: 1 };
      },
      layoutWithLines(
        _prepared: string,
        _maxWidth: number,
        lineHeight: number,
      ) {
        return { height: lineHeight, lineCount: 1, lines: [] };
      },
      measureLineStats(_prepared: string, _maxWidth: number) {
        return { lineCount: 1, maxLineWidth: 120 };
      },
      measureNaturalWidth(_prepared: string) {
        return 120;
      },
      prepare(text: string, _font: string) {
        return text;
      },
      prepareWithSegments(
        text: string,
        _font: string,
        options?: PretextPrepareOptions,
      ) {
        prepareCalls.push(options);
        return text;
      },
      setLocale(_locale?: string) {},
    };

    measureTextBlockWidestLine(engine, {
      font: '700 40px "Segoe UI"',
      letterSpacing: -1.8,
      text: "Editorial",
      width: 600,
    });

    assertEquals(prepareCalls, [{ letterSpacing: -1.8 }]);
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

// A Deno-friendly `OffscreenCanvas` stub that gives Pretext something to call
// for canvas-based text width measurements when no real browser font engine is
// available. Width values are character-class heuristics, not browser-accurate
// — use this for relative / regression signal, not absolute pixel budgets.
//
// Shared between `scripts/pretext-react-harness.tsx` (React hook probing in
// jsdom) and `src/utils/i18n/copy-overflow_test.ts` (dev-time i18n overflow
// guard). Keep all knobs in one place so both surfaces stay in sync.

function parseCanvasFontSize(font: string): number {
  const match = font.match(/(\d+(?:\.\d+)?)px/);
  const matchedValue = match?.[1];

  if (matchedValue === undefined) {
    return 16;
  }

  const value = Number.parseFloat(matchedValue);
  return Number.isFinite(value) ? value : 16;
}

function measureCanvasCharacterWidth(
  character: string,
  fontSize: number,
): number {
  if (/\s/u.test(character)) {
    return fontSize * 0.32;
  }

  if (/[　-ヿ㐀-鿿豈-﫿]/u.test(character)) {
    return fontSize;
  }

  if (/[A-Z0-9]/u.test(character)) {
    return fontSize * 0.62;
  }

  if (/[a-z]/u.test(character)) {
    return fontSize * 0.56;
  }

  if (/[.,;:!?'"`]/u.test(character)) {
    return fontSize * 0.28;
  }

  if (/[-_/\\|()[\]{}]/u.test(character)) {
    return fontSize * 0.36;
  }

  return fontSize * 0.68;
}

export function measureStubTextWidth(
  text: string,
  font: string,
): number {
  const fontSize = parseCanvasFontSize(font);

  return Array.from(text).reduce(
    (width, character) =>
      width + measureCanvasCharacterWidth(character, fontSize),
    0,
  );
}

export class StubCanvasRenderingContext2D {
  font = "16px sans-serif";

  measureText(text: string): TextMetrics {
    return {
      width: Number(measureStubTextWidth(text, this.font).toFixed(3)),
    } as TextMetrics;
  }
}

export class StubOffscreenCanvas {
  constructor(_width: number, _height: number) {}

  getContext(contextId: string): StubCanvasRenderingContext2D | null {
    return contextId === "2d" ? new StubCanvasRenderingContext2D() : null;
  }
}

export function installStubOffscreenCanvas(): () => void {
  const hadOwnProperty = Object.prototype.hasOwnProperty.call(
    globalThis,
    "OffscreenCanvas",
  );
  const previousValue = Reflect.get(globalThis, "OffscreenCanvas");
  Reflect.set(globalThis, "OffscreenCanvas", StubOffscreenCanvas);

  return () => {
    if (hadOwnProperty) {
      Reflect.set(globalThis, "OffscreenCanvas", previousValue);
      return;
    }

    Reflect.deleteProperty(globalThis, "OffscreenCanvas");
  };
}

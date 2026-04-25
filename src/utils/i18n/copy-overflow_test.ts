import { describe, it } from "@std/testing/bdd";

import {
  measureTextBlock,
  PRETEXT_ENGINE,
  resolveLocaleWordBreak,
} from "../../blog/client/pretext-story-core.ts";
import { installStubOffscreenCanvas } from "../../../test/pretext-canvas-stub.ts";
import { type SiteLanguage, SUPPORTED_LANGUAGES } from "./languages.ts";
import { getSiteTranslations } from "./translations.ts";

// Dev-time i18n overflow guard. For each entry in `COPY_OVERFLOW_BUDGETS`, the
// test feeds the translated copy through Pretext and asserts the wrapped line
// count stays within the budget for every supported language. Fonts, widths,
// and letter-spacing mirror the production CSS; numbers are deliberately loose
// so the guard catches "a translation doubled in length" regressions without
// false-positive churn. Canvas text measurement is provided by a heuristic stub
// (`test/pretext-canvas-stub.ts`), so the widths are relative, not pixel-true.
// Grow the budget list as new surfaces or translations ship; keep each entry
// explicit about the CSS it represents.

type CopyOverflowBudget = Readonly<{
  id: string;
  description: string;
  pick: (lang: SiteLanguage) => string;
  font: string;
  letterSpacing?: number;
  widthPx: number;
  lineHeightPx: number;
  maxLines: number;
}>;

const COPY_OVERFLOW_BUDGETS: readonly CopyOverflowBudget[] = [
  {
    id: "home-title-narrow",
    description: ".blog-antd-page-title at ~320px viewport (clamp low end)",
    pick: (lang) => getSiteTranslations(lang).home.title,
    font: '780 41.6px "Inter", system-ui, sans-serif',
    letterSpacing: 41.6 * -0.055,
    widthPx: 260,
    lineHeightPx: 41.6 * 0.92,
    maxLines: 6,
  },
  {
    id: "archive-title-narrow",
    description: ".blog-antd-page-title on /articles at ~320px viewport",
    pick: (lang) => getSiteTranslations(lang).archive.title,
    font: '780 41.6px "Inter", system-ui, sans-serif',
    letterSpacing: 41.6 * -0.055,
    widthPx: 260,
    lineHeightPx: 41.6 * 0.92,
    maxLines: 2,
  },
  {
    id: "home-lead-narrow",
    description: ".blog-antd-page-lead at ~320px viewport",
    pick: (lang) => getSiteTranslations(lang).home.lead,
    font: '400 17px "Inter", system-ui, sans-serif',
    widthPx: 260,
    lineHeightPx: 17 * 1.55,
    maxLines: 5,
  },
  {
    id: "archive-lead-narrow",
    description: ".blog-antd-page-lead on /articles at ~320px viewport",
    pick: (lang) => getSiteTranslations(lang).archive.lead,
    font: '400 17px "Inter", system-ui, sans-serif',
    widthPx: 260,
    lineHeightPx: 17 * 1.55,
    maxLines: 4,
  },
];

describe("i18n copy overflow guard", () => {
  installStubOffscreenCanvas();

  for (const budget of COPY_OVERFLOW_BUDGETS) {
    for (const lang of SUPPORTED_LANGUAGES) {
      it(
        `${budget.id} [${lang}] stays within ${budget.maxLines} line(s)`,
        () => {
          const text = budget.pick(lang);
          const { lineCount } = measureTextBlock(PRETEXT_ENGINE, {
            font: budget.font,
            letterSpacing: budget.letterSpacing,
            lineHeight: budget.lineHeightPx,
            locale: lang,
            text,
            width: budget.widthPx,
            wordBreak: resolveLocaleWordBreak(lang),
          });

          if (lineCount > budget.maxLines) {
            throw new Error(
              `${budget.id} [${lang}] overflowed the ${budget.maxLines}-line ` +
                `budget: got ${lineCount} line(s) measuring "${text}" ` +
                `at ${budget.widthPx}px.`,
            );
          }
        },
      );
    }
  }

  it("flags an overflow when the measured copy exceeds the budget", () => {
    const oversizedText =
      "A deliberately long sentinel title that nobody would ship in production " +
      "but that forces the Pretext stub to wrap many times so the guard can " +
      "prove it still bites when the budget is violated.";
    const { lineCount } = measureTextBlock(PRETEXT_ENGINE, {
      font: '780 41.6px "Inter", system-ui, sans-serif',
      letterSpacing: 41.6 * -0.055,
      lineHeight: 41.6 * 0.92,
      locale: "en",
      text: oversizedText,
      width: 260,
      wordBreak: undefined,
    });

    if (lineCount <= 6) {
      throw new Error(
        `Expected the sentinel overflow to exceed 6 lines, got ${lineCount}. ` +
          `Pretext stub or budget shape changed — recalibrate the guard.`,
      );
    }
  });
});

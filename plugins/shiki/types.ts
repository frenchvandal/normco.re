import type {
  BundledHighlighterOptions,
  BundledLanguage,
  BundledTheme,
  CodeOptionsMultipleThemes,
  CodeOptionsSingleTheme,
  CodeToHastOptions,
} from "shiki";

export type ShikiHighlighterOptions = BundledHighlighterOptions<
  BundledLanguage,
  BundledTheme
>;

type CommonRenderOptions = Partial<
  Omit<
    CodeToHastOptions<BundledLanguage, BundledTheme>,
    "lang" | "theme" | "themes"
  >
>;

export type ShikiRenderOptions =
  | (CommonRenderOptions & CodeOptionsSingleTheme<BundledTheme>)
  | (CommonRenderOptions & CodeOptionsMultipleThemes<BundledTheme>);

export interface ShikiPluginOptions {
  readonly extensions?: readonly string[];
  readonly cssSelector?: string;
  readonly highlighter?: Partial<ShikiHighlighterOptions>;
  readonly render?: ShikiRenderOptions;
  readonly concurrency?: number;
  readonly onError?: "ignore" | "warn";
  readonly resolveLanguage?: (element: Element) => string | undefined;
}

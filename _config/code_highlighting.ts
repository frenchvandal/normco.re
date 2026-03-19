import type { BundledLanguage, BundledTheme } from "npm/shiki";
import type { ShikiPluginOptions } from "../plugins/shiki.ts";

/**
 * Centralized code-highlighting config.
 * Add new fenced-code language ids here when posts start using them.
 */
export const SHIKI_OPTIONS = {
  languages: [
    "bash",
    "ts",
    "yaml",
  ] as const satisfies readonly BundledLanguage[],
  themes: {
    light: "vitesse-light",
    dark: "vitesse-dark",
  } as const satisfies Readonly<Record<"light" | "dark", BundledTheme>>,
} satisfies ShikiPluginOptions;

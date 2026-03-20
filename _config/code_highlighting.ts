import type { ShikiPluginOptions } from "../plugins/shiki/types.ts";

/**
 * Centralized code-highlighting config.
 * Add new fenced-code language ids here when posts start using them.
 */
export const SHIKI_OPTIONS = {
  highlighter: {
    langs: ["bash", "ts", "yaml"],
  },
  render: {
    defaultColor: false,
    themes: {
      light: "vitesse-light",
      dark: "vitesse-dark",
    },
  },
} satisfies ShikiPluginOptions;

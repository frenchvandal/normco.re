import type { ShikiPluginOptions } from "../plugins/shiki/types.ts";

// Keep supported fenced-code languages centralized so post content and the
// Shiki pipeline stay in sync.
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

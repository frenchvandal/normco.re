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
      // GitHub's default themes keep the editorial shell restrained while
      // giving tokens more contrast than the flatter Vitesse pair.
      light: "github-light-default",
      dark: "github-dark-default",
    },
  },
} satisfies ShikiPluginOptions;

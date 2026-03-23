// Centralize Sass load paths even though the active stylesheet no longer
// depends on package-backed design-system sources.
export const SASS_LOAD_PATHS = [
  "node_modules",
] as const;

/**
 * Visual testing configuration
 *
 * Defines the pages and viewports to compare between Lume and PaperMod
 *
 * @module tests/visual/config
 */

/**
 * Page configuration for visual comparison
 */
export interface PageConfig {
  /** Unique identifier for the page */
  name: string;
  /** Path on the Lume site */
  lumePath: string;
  /** Path on the PaperMod demo site */
  papermodPath: string;
  /** Optional description */
  description?: string;
  /** Wait for specific selector before screenshot */
  waitFor?: string;
  /** Additional actions before screenshot (e.g., click, scroll) */
  actions?: PageAction[];
}

/**
 * Action to perform before taking a screenshot
 */
export interface PageAction {
  type: "click" | "scroll" | "wait" | "hover" | "type";
  selector?: string;
  value?: string | number;
}

/**
 * Viewport configuration
 */
export interface ViewportConfig {
  name: string;
  width: number;
  height: number;
}

/**
 * Theme configuration
 */
export type ThemeConfig = "light" | "dark";

/**
 * Base URLs for comparison
 */
export const BASE_URLS = {
  lume: "http://localhost:3000",
  papermod: "https://adityatelange.github.io/hugo-PaperMod",
} as const;

/**
 * Output directories
 */
export const OUTPUT_DIRS = {
  screenshots: "tests/visual/screenshots",
  lume: "tests/visual/screenshots/lume",
  papermod: "tests/visual/screenshots/papermod",
  diff: "tests/visual/screenshots/diff",
  report: "tests/visual/report",
} as const;

/**
 * Viewports to test
 */
export const VIEWPORTS: ViewportConfig[] = [
  { name: "mobile", width: 375, height: 667 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 800 },
  { name: "wide", width: 1920, height: 1080 },
];

/**
 * Themes to test
 */
export const THEMES: ThemeConfig[] = ["light", "dark"];

/**
 * Pages to compare
 *
 * Maps Lume pages to their PaperMod equivalents
 */
export const PAGES: PageConfig[] = [
  {
    name: "home",
    lumePath: "/",
    papermodPath: "/",
    description: "Home page with post list",
    waitFor: ".post-list, .post-entry",
  },
  {
    name: "post-single",
    lumePath: "/posts/code-syntax/",
    papermodPath: "/posts/papermod/papermod-features/",
    description: "Single post view with code blocks",
    waitFor: ".post-content, .post-single",
  },
  {
    name: "post-with-toc",
    lumePath: "/posts/markdown-syntax/",
    papermodPath: "/posts/papermod/papermod-features/",
    description: "Post with table of contents",
    waitFor: ".toc, #TableOfContents",
  },
  {
    name: "archive",
    lumePath: "/archive/",
    papermodPath: "/archives/",
    description: "Archive page with timeline",
    waitFor: ".archive-list, .archive-posts",
  },
  {
    name: "tags",
    lumePath: "/archive/code/",
    papermodPath: "/tags/",
    description: "Tag listing page",
    waitFor: ".archive-list, .terms-tags",
  },
  {
    name: "search-open",
    lumePath: "/",
    papermodPath: "/search/",
    description: "Search modal/page",
    actions: [
      { type: "click", selector: "[data-search-trigger], #searchTrigger" },
      { type: "wait", value: 500 },
    ],
  },
];

/**
 * CSS selectors to exclude from comparison (dynamic content)
 */
export const EXCLUDE_SELECTORS = [
  "[data-pagefind-body]", // Search index content
  ".commit-hash", // Git commit hashes
  "time[datetime]", // Dynamic dates
  ".reading-time", // May vary
];

/**
 * Comparison threshold (0-1, lower = more strict)
 */
export const DIFF_THRESHOLD = 0.1;

/**
 * Generate filename for a screenshot
 */
export function getScreenshotFilename(
  site: "lume" | "papermod",
  page: string,
  viewport: string,
  theme: ThemeConfig,
): string {
  return `${site}-${page}-${viewport}-${theme}.png`;
}

/**
 * Generate filename for a diff image
 */
export function getDiffFilename(
  page: string,
  viewport: string,
  theme: ThemeConfig,
): string {
  return `diff-${page}-${viewport}-${theme}.png`;
}

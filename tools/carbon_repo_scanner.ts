#!/usr/bin/env -S deno run --allow-read --allow-write
/**
 * carbon_repo_scanner.ts
 *
 * Lightweight repository scanner for Carbon-alignment audits.
 * Designed for Deno + static sites.
 *
 * Usage:
 *   deno run --allow-read --allow-write carbon_repo_scanner.ts .
 *
 * Output:
 *   ./CARBON_COMPLIANCE_REPORT.md
 */

type FindingSeverity = "critical" | "important" | "minor";

type Finding = {
  severity: FindingSeverity;
  file: string;
  line?: number;
  rule: string;
  details: string;
  recommendation: string;
  carbonGuideline: string;
};

const root = Deno.args[0] ?? ".";
const findings: Finding[] = [];

const CSS_EXT = new Set([".css", ".scss"]);
const CODE_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".html"]);

/** Directories to skip entirely. */
const SKIP_DIRS = new Set([
  ".git",
  "node_modules",
  "_site",
  "dist",
  ".deno",
  "design-tokens",
]);

/** File name patterns that are never scanned for markup issues. */
const SKIP_MARKUP_PATTERNS = [
  /[._]test\.[jt]sx?$/,
  /_test_/,
  /\.spec\.[jt]sx?$/,
  /\.d\.ts$/,
];

const GUIDELINES = {
  tokens: "https://carbondesignsystem.com/guidelines/tokens/overview/",
  spacing: "https://v10.carbondesignsystem.com/guidelines/spacing/overview/",
  typography:
    "https://v10.carbondesignsystem.com/guidelines/typography/overview/",
  layout: "https://v10.carbondesignsystem.com/guidelines/layout/overview/",
  accessibility:
    "https://carbondesignsystem.com/guidelines/accessibility/overview/",
  uiShell: "https://carbondesignsystem.com/components/ui-shell-header/usage/",
  sideNav: "https://carbondesignsystem.com/components/side-nav/usage/",
  breadcrumb: "https://carbondesignsystem.com/components/breadcrumb/usage/",
  tag: "https://carbondesignsystem.com/components/tag/usage/",
};

/* ===================================================================
   Regex patterns
   =================================================================== */

const HARD_CODED_HEX = /#[0-9a-fA-F]{3,8}\b/g;
const RGB_COLOR = /\brgba?\(/g;
const RAW_PIXEL =
  /(?<![-\w])(?:margin|padding|gap|top|right|bottom|left|width|height|min-width|max-width|min-height|max-height|font-size|line-height|border-radius)\s*:\s*[^;]*\b\d+px\b/g;
/**
 * Matches CSS custom property declarations: `--name: value`.
 * Must start at the beginning of a declaration (after whitespace or semicolon),
 * NOT inside a BEM selector like `.bx--header__action:`.
 * The negative lookbehind excludes word characters before `--` to avoid
 * matching `.bx--header__action:hover` as a token `--header__action`.
 */
const TOKEN_DECL = /(?<![.\w])--([a-zA-Z0-9-_]+)\s*:/g;
const ARIA_MODAL = /aria-modal\s*=\s*["']true["']/g;
const ROLE_DIALOG = /role\s*=\s*["']dialog["']/g;
const ARIA_EXPANDED = /aria-expanded/g;
const ARIA_CONTROLS = /aria-controls/g;
const H1_TAG = /<h1[\s>]/i;
const CURSOR_POINTER_RE = /cursor\s*:\s*pointer/g;

/* ===================================================================
   Helpers
   =================================================================== */

function rel(path: string): string {
  return path.startsWith("./") ? path.slice(2) : path;
}

function basename(path: string): string {
  return path.slice(path.lastIndexOf("/") + 1);
}

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  for await (const entry of Deno.readDir(dir)) {
    const full = `${dir}/${entry.name}`;
    if (SKIP_DIRS.has(entry.name)) continue;
    if (entry.isDirectory) {
      out.push(...await walk(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

function addFinding(finding: Finding) {
  findings.push(finding);
}

function lineNumberForIndex(content: string, index: number): number {
  return content.slice(0, index).split("\n").length;
}

/** Returns the line of content at a given character index. */
function lineAtIndex(content: string, index: number): string {
  const start = content.lastIndexOf("\n", index - 1) + 1;
  const end = content.indexOf("\n", index);
  return content.slice(start, end === -1 ? undefined : end);
}

/** Returns true if the character index sits inside a CSS comment. */
function isInsideCssComment(content: string, index: number): boolean {
  const before = content.slice(0, index);
  const lastOpen = before.lastIndexOf("/*");
  if (lastOpen === -1) return false;
  const lastClose = before.lastIndexOf("*/");
  return lastClose < lastOpen;
}

/**
 * Returns true if the character index is inside a CSS `@media` block
 * that is an accessibility override (prefers-contrast, forced-colors,
 * prefers-reduced-transparency).
 *
 * Walks backwards through all ancestor brace scopes (handles nesting).
 */
function isInsideA11yMediaBlock(content: string, index: number): boolean {
  const patterns = [
    /prefers-contrast/,
    /forced-colors/,
    /prefers-reduced-transparency/,
  ];

  // Walk backwards through ALL ancestor opening braces
  let depth = 0;
  for (let i = index - 1; i >= 0; i--) {
    if (content[i] === "}") {
      depth++;
    } else if (content[i] === "{") {
      if (depth > 0) {
        depth--;
      } else {
        // Found an unclosed opening brace — check the text before it
        // for an @media query with one of our a11y patterns
        const lineStart = content.lastIndexOf("\n", i - 1) + 1;
        const mediaLine = content.slice(lineStart, i);
        if (patterns.some((p) => p.test(mediaLine))) {
          return true;
        }
        // Also check the previous line (multiline @media)
        const prevLineStart = content.lastIndexOf("\n", lineStart - 2) + 1;
        const prevLine = content.slice(prevLineStart, lineStart);
        if (patterns.some((p) => p.test(prevLine))) {
          return true;
        }
        // Continue walking up — this brace might be a nested selector
        // inside an @media block
      }
    }
  }

  return false;
}

/** Returns true if this is a token definition file (tokens layer). */
function isTokenDefinitionFile(path: string): boolean {
  const name = basename(path);
  return name.startsWith("tokens") || name === "design-tokens.css";
}

/**
 * Returns true if the given line contains a CSS custom property
 * declaration that aliases a Carbon token via `var(--cds-*)`.
 */
function isTokenAliasToCds(line: string): boolean {
  return /--[\w-]+\s*:\s*var\(\s*--cds-/.test(line);
}

/** Well-known semantic/editorial token prefixes that are documented. */
const ALLOWED_TOKEN_PREFIXES = [
  "cds-",
  "semantic-",
  "editorial-",
  // Documented convenience aliases
  "focus-ring-",
  "borderRadius-",
  "color-",
  "pagefind-ui-",
];

/** Well-known individual tokens that are documented and allowed. */
const ALLOWED_TOKEN_NAMES = new Set([
  "space-xs",
  "space-s",
  "space-m",
  "space-l",
  "space-xl",
  "space-2xl",
  "font-sans",
  "font-mono",
  "fontStack-system",
  "fontStack-monospace",
  "text-xs",
  "text-sm",
  "text-base",
  "text-lg",
  "text-xl",
  "text-2xl",
  "leading",
  "leading-tight",
  "leading-heading",
  "measure",
]);

function isAllowedTokenName(name: string): boolean {
  if (ALLOWED_TOKEN_NAMES.has(name)) return true;
  return ALLOWED_TOKEN_PREFIXES.some((prefix) => name.startsWith(prefix));
}

/* ===================================================================
   CSS scanning
   =================================================================== */

function scanCss(path: string, content: string) {
  const isTokenFile = isTokenDefinitionFile(path);

  // --- Hex colors ---
  for (const match of content.matchAll(HARD_CODED_HEX)) {
    const index = match.index ?? 0;

    // Skip hex in comments
    if (isInsideCssComment(content, index)) continue;

    // Skip hex in a11y media queries (prefers-contrast, forced-colors, etc.)
    if (isInsideA11yMediaBlock(content, index)) continue;

    // Skip hex inside token definition files (reference palette)
    if (isTokenFile) continue;

    // Skip hex in comment-only lines (e.g. /* #f4f4f4 */)
    const line = lineAtIndex(content, index).trim();
    if (line.startsWith("/*") || line.startsWith("*")) continue;

    addFinding({
      severity: "important",
      file: rel(path),
      line: lineNumberForIndex(content, index),
      rule: "Avoid hard-coded hex colors",
      details: `Found ${match[0]}.`,
      recommendation:
        "Replace raw color values with Carbon or semantic tokens.",
      carbonGuideline: GUIDELINES.tokens,
    });
  }

  // --- RGB/RGBA colors ---
  for (const match of content.matchAll(RGB_COLOR)) {
    const index = match.index ?? 0;

    if (isInsideCssComment(content, index)) continue;
    if (isInsideA11yMediaBlock(content, index)) continue;
    if (isTokenFile) continue;

    addFinding({
      severity: "important",
      file: rel(path),
      line: lineNumberForIndex(content, index),
      rule: "Avoid raw rgb()/rgba() colors",
      details: `Found ${match[0]}.`,
      recommendation:
        "Map colors to semantic tokens aligned with Carbon themes.",
      carbonGuideline: GUIDELINES.tokens,
    });
  }

  // --- Raw pixel values ---
  for (const match of content.matchAll(RAW_PIXEL)) {
    const index = match.index ?? 0;

    if (isInsideCssComment(content, index)) continue;

    // Skip 1px and 2px borders — commonly used for outlines and borders
    const value = match[0];
    if (/:\s*[^;]*\b[12]px\b/.test(value) && !/\b[3-9]\d*px\b/.test(value)) {
      continue;
    }

    addFinding({
      severity: "minor",
      file: rel(path),
      line: lineNumberForIndex(content, index),
      rule: "Prefer tokenized spacing and typography",
      details: `Found raw pixel-based declaration: ${value.trim()}.`,
      recommendation:
        "Replace direct px values with Carbon spacing/type tokens where applicable.",
      carbonGuideline: GUIDELINES.spacing,
    });
  }

  // --- cursor:pointer on non-interactive selectors ---
  for (const match of content.matchAll(CURSOR_POINTER_RE)) {
    const index = match.index ?? 0;

    if (isInsideCssComment(content, index)) continue;

    // Try to extract the CSS selector for this rule
    const before = content.slice(0, index);
    const lastBrace = before.lastIndexOf("{");
    if (lastBrace !== -1) {
      const selectorStart = before.lastIndexOf("}", lastBrace);
      const selector = before.slice(
        selectorStart === -1 ? 0 : selectorStart + 1,
        lastBrace,
      ).trim();

      // Skip if selector targets interactive elements (native or Carbon shell)
      if (
        /\ba\b|\bbutton\b|\binput\b|\bselect\b|:hover|:active|:focus/.test(
          selector,
        ) ||
        // Carbon shell buttons and interactive controls
        /bx--header__action|bx--header__menu-toggle|bx--header__language-toggle/
          .test(
            selector,
          ) ||
        // Generic interactive component patterns
        /toggle|btn|action|link|__clear/.test(selector)
      ) {
        continue;
      }
    }

    addFinding({
      severity: "minor",
      file: rel(path),
      line: lineNumberForIndex(content, index),
      rule: "Do not imply clickability for non-interactive elements",
      details: "Found cursor:pointer. Verify the element is truly interactive.",
      recommendation: "Keep pointer only on actionable controls or links.",
      carbonGuideline: GUIDELINES.tag,
    });
  }

  // --- Non-standard token names ---
  for (const match of content.matchAll(TOKEN_DECL)) {
    const tokenName = match[1];
    if (!tokenName) continue;

    // Skip allowed tokens
    if (isAllowedTokenName(tokenName)) continue;

    // Skip tokens that alias Carbon tokens
    const declLine = lineAtIndex(content, match.index ?? 0);
    if (isTokenAliasToCds(declLine)) continue;

    // Skip tokens inside token definition files
    if (isTokenFile) continue;

    addFinding({
      severity: "minor",
      file: rel(path),
      line: lineNumberForIndex(content, match.index ?? 0),
      rule: "Token naming should be explicit",
      details: `Found custom token --${tokenName}.`,
      recommendation:
        "Group tokens into Carbon base, semantic, or editorial layers.",
      carbonGuideline: GUIDELINES.tokens,
    });
  }
}

/* ===================================================================
   Markup scanning (TSX, JS, HTML)
   =================================================================== */

function isTestFile(path: string): boolean {
  return SKIP_MARKUP_PATTERNS.some((p) => p.test(path));
}

/** Returns true if this file is an i18n/translation file. */
function isI18nFile(path: string): boolean {
  const name = basename(path);
  return name === "i18n.ts" || name === "i18n.tsx" || name === "i18n.js" ||
    /translations?\.[jt]sx?$/.test(name) ||
    /locale[s]?\.[jt]sx?$/.test(name);
}

/** Returns true if this is a page template file. */
function isPageTemplate(path: string): boolean {
  return /\.page\.[jt]sx?$/.test(path) || /\.html$/.test(path);
}

/** Returns true if this is a root/base layout template file. */
function isLayoutFile(path: string): boolean {
  const name = basename(path).toLowerCase();
  // Only flag root layout files (base.tsx, layout.tsx, etc.),
  // not child layouts (post.tsx wraps into base.tsx which has the skip link)
  return (name === "base.tsx" || name === "base.jsx" || name === "base.html" ||
    name === "layout.tsx" || name === "layout.html");
}

function scanMarkup(path: string, content: string) {
  // Skip test files entirely
  if (isTestFile(path)) return;

  // --- aria-modal without dialog role ---
  // Reset regex state
  ARIA_MODAL.lastIndex = 0;
  ROLE_DIALOG.lastIndex = 0;
  const hasAriaModal = ARIA_MODAL.test(content);
  const hasDialogRole = ROLE_DIALOG.test(content);

  if (hasAriaModal && !hasDialogRole) {
    addFinding({
      severity: "critical",
      file: rel(path),
      rule: "aria-modal requires dialog semantics",
      details: 'Found aria-modal="true" without role="dialog".',
      recommendation:
        'Either add role="dialog" and complete dialog behavior, or remove aria-modal.',
      carbonGuideline: GUIDELINES.accessibility,
    });
  }

  // --- aria-expanded without aria-controls ---
  // Only flag on component/template files, not on pure JS controllers
  ARIA_EXPANDED.lastIndex = 0;
  ARIA_CONTROLS.lastIndex = 0;
  if (
    (isPageTemplate(path) || path.includes("_components/")) &&
    ARIA_EXPANDED.test(content) && !ARIA_CONTROLS.test(content)
  ) {
    addFinding({
      severity: "important",
      file: rel(path),
      rule: "aria-expanded should usually be paired with aria-controls",
      details: "Found aria-expanded but no aria-controls in the same file.",
      recommendation: "Link disclosure controls to the surface they toggle.",
      carbonGuideline: GUIDELINES.accessibility,
    });
  }

  // --- Error page missing h1 ---
  // Only check actual page templates, not i18n or test files
  if (isPageTemplate(path) && !isI18nFile(path)) {
    const fileName = basename(path).toLowerCase();
    const isErrorPage = fileName.includes("404") ||
      fileName.includes("not-found") || fileName.includes("notfound") ||
      fileName.includes("error");

    if (isErrorPage && !H1_TAG.test(content)) {
      // Check if the page renders <h1 via template literal
      const rendersH1 = /["'`]<h1[\s>]/.test(content) ||
        /\bh1\b.*class=/.test(content) ||
        /StatePanel\s*\(\s*\{[\s\S]*headingTag:\s*["']h1["']/m.test(content);
      if (!rendersH1) {
        addFinding({
          severity: "critical",
          file: rel(path),
          rule: "Error pages need a clear primary heading",
          details: "404 or error page without a visible <h1>.",
          recommendation: 'Add a semantic <h1>, such as "Page not found".',
          carbonGuideline: GUIDELINES.accessibility,
        });
      }
    }
  }

  // --- Skip link ---
  // Only check layout/base templates (skip link is a layout concern)
  if (isLayoutFile(path)) {
    const SKIP_LINK_RE = /skip[-\s]?(?:to[-\s])?(?:content|main|nav)/i;
    const SKIP_LINK_HREF = /href=["']#main/i;
    if (!SKIP_LINK_RE.test(content) && !SKIP_LINK_HREF.test(content)) {
      addFinding({
        severity: "important",
        file: rel(path),
        rule: "Layout templates should include a skip link",
        details: "No skip-link pattern detected in this layout file.",
        recommendation:
          "Ensure there is a visible-on-focus skip link to the main landmark.",
        carbonGuideline: GUIDELINES.accessibility,
      });
    }
  }
}

/* ===================================================================
   Scoring and reporting
   =================================================================== */

function summarize(findings: Finding[]) {
  const scores = {
    critical: findings.filter((f) => f.severity === "critical").length,
    important: findings.filter((f) => f.severity === "important").length,
    minor: findings.filter((f) => f.severity === "minor").length,
  };

  const penalty = scores.critical * 12 + scores.important * 3 +
    scores.minor * 0.5;
  const compliance = Math.max(0, Math.round(100 - penalty));

  return { scores, compliance };
}

function renderReport(findings: Finding[]) {
  const { scores, compliance } = summarize(findings);
  const bySeverity: FindingSeverity[] = ["critical", "important", "minor"];

  const lines: string[] = [];
  lines.push("# CARBON_COMPLIANCE_REPORT");
  lines.push("");
  lines.push(`Generated by \`carbon_repo_scanner.ts\` against: \`${root}\``);
  lines.push(`\nScan date: ${new Date().toISOString().slice(0, 10)}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Global compliance score: **${compliance} / 100**`);
  lines.push(`- Critical findings: **${scores.critical}**`);
  lines.push(`- Important findings: **${scores.important}**`);
  lines.push(`- Minor findings: **${scores.minor}**`);
  lines.push("");
  lines.push("## Carbon references");
  lines.push("");
  for (const [label, url] of Object.entries(GUIDELINES)) {
    lines.push(`- ${label}: ${url}`);
  }
  lines.push("");

  for (const severity of bySeverity) {
    const group = findings.filter((f) => f.severity === severity);
    const severityLabel = severity.charAt(0).toUpperCase() + severity.slice(1);
    lines.push(`## ${severityLabel} findings`);
    lines.push("");
    if (group.length === 0) {
      lines.push("None.");
      lines.push("");
      continue;
    }

    for (const finding of group) {
      lines.push(`### ${finding.rule}`);
      lines.push("");
      lines.push(
        `- File: \`${finding.file}\`${
          finding.line ? ` line ${finding.line}` : ""
        }`,
      );
      lines.push(`- Details: ${finding.details}`);
      lines.push(`- Recommendation: ${finding.recommendation}`);
      lines.push(`- Carbon guideline: ${finding.carbonGuideline}`);
      lines.push("");
    }
  }

  lines.push("## Next actions");
  lines.push("");
  if (scores.critical > 0) {
    lines.push("1. Fix all critical accessibility findings first.");
  }
  if (scores.important > 0) {
    lines.push("2. Normalize token naming and remove raw colors and spacing.");
  }
  if (scores.minor > 0) {
    lines.push("3. Review minor findings for incremental improvements.");
  }
  if (scores.critical === 0 && scores.important === 0 && scores.minor === 0) {
    lines.push("No findings. The repository is Carbon-aligned.");
  }
  lines.push("");
  lines.push("4. Re-run the scanner after each refactor.");
  lines.push("");

  return lines.join("\n");
}

/* ===================================================================
   Main
   =================================================================== */

const files = await walk(root);

for (const path of files) {
  const ext = path.slice(path.lastIndexOf("."));
  if (!CSS_EXT.has(ext) && !CODE_EXT.has(ext)) continue;

  let content = "";
  try {
    content = await Deno.readTextFile(path);
  } catch {
    continue;
  }

  if (CSS_EXT.has(ext)) {
    scanCss(path, content);
  } else {
    scanMarkup(path, content);
  }
}

const report = renderReport(findings);
const outPath = `${root.replace(/\/$/, "")}/CARBON_COMPLIANCE_REPORT.md`;
await Deno.writeTextFile(outPath, report);

console.log(`Wrote ${outPath}`);

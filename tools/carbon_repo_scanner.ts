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
const CODE_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".html", ".md"]);

const HARD_CODED_HEX = /#[0-9a-fA-F]{3,8}\b/g;
const RGB_COLOR = /\brgba?\(/g;
const RAW_PIXEL =
  /(?<![-\w])(?:margin|padding|gap|top|right|bottom|left|width|height|min-width|max-width|min-height|max-height|font-size|line-height|border-radius)\s*:\s*[^;]*\b\d+px\b/g;
const TOKEN_DECL = /--([a-zA-Z0-9-_]+)\s*:/g;
const ARIA_MODAL = /aria-modal\s*=\s*["']true["']/g;
const ROLE_DIALOG = /role\s*=\s*["']dialog["']/g;
const ARIA_EXPANDED = /aria-expanded/g;
const ARIA_CONTROLS = /aria-controls/g;
const _ARIA_CURRENT = /aria-current/g;
const H1 = /<h1[\s>]/i;
const CURSOR_POINTER = /cursor\s*:\s*pointer/g;
const SKIP_LINK = /(skip link|href=["']#main["'])/i;

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

function rel(path: string): string {
  return path.startsWith("./") ? path.slice(2) : path;
}

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  for await (const entry of Deno.readDir(dir)) {
    const full = `${dir}/${entry.name}`;
    if (
      entry.name === ".git" || entry.name === "node_modules" ||
      entry.name === "_site"
    ) continue;
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

function scanCss(path: string, content: string) {
  for (const match of content.matchAll(HARD_CODED_HEX)) {
    addFinding({
      severity: "important",
      file: rel(path),
      line: lineNumberForIndex(content, match.index ?? 0),
      rule: "Avoid hard-coded hex colors",
      details: `Found ${match[0]}.`,
      recommendation:
        "Replace raw color values with Carbon or semantic tokens.",
      carbonGuideline: GUIDELINES.tokens,
    });
  }

  for (const match of content.matchAll(RGB_COLOR)) {
    addFinding({
      severity: "important",
      file: rel(path),
      line: lineNumberForIndex(content, match.index ?? 0),
      rule: "Avoid raw rgb()/rgba() colors",
      details: `Found ${match[0]}.`,
      recommendation:
        "Map colors to semantic tokens aligned with Carbon themes.",
      carbonGuideline: GUIDELINES.tokens,
    });
  }

  for (const match of content.matchAll(RAW_PIXEL)) {
    addFinding({
      severity: "minor",
      file: rel(path),
      line: lineNumberForIndex(content, match.index ?? 0),
      rule: "Prefer tokenized spacing and typography",
      details: `Found raw pixel-based declaration: ${match[0]}.`,
      recommendation:
        "Replace direct px values with Carbon spacing/type tokens where applicable.",
      carbonGuideline: GUIDELINES.spacing,
    });
  }

  for (const match of content.matchAll(CURSOR_POINTER)) {
    addFinding({
      severity: "minor",
      file: rel(path),
      line: lineNumberForIndex(content, match.index ?? 0),
      rule: "Do not imply clickability for non-interactive elements",
      details: "Found cursor:pointer. Verify the element is truly interactive.",
      recommendation: "Keep pointer only on actionable controls or links.",
      carbonGuideline: GUIDELINES.tag,
    });
  }

  const tokens = [...content.matchAll(TOKEN_DECL)].map((m) => m[1]);
  for (const token of tokens) {
    if (
      !token?.startsWith("cds-") && !token?.startsWith("semantic-") &&
      !token?.startsWith("editorial-")
    ) {
      addFinding({
        severity: "minor",
        file: rel(path),
        rule: "Token naming should be explicit",
        details: `Found custom token --${token}.`,
        recommendation:
          "Group tokens into Carbon base, semantic, or editorial layers.",
        carbonGuideline: GUIDELINES.tokens,
      });
    }
  }
}

function scanMarkup(path: string, content: string) {
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

  if (ARIA_EXPANDED.test(content) && !ARIA_CONTROLS.test(content)) {
    addFinding({
      severity: "important",
      file: rel(path),
      rule: "aria-expanded should usually be paired with aria-controls",
      details: "Found aria-expanded but no aria-controls in the same file.",
      recommendation: "Link disclosure controls to the surface they toggle.",
      carbonGuideline: GUIDELINES.accessibility,
    });
  }

  const isErrorPage = /404|not found/i.test(path) ||
    /page not found/i.test(content);
  if (isErrorPage && !H1.test(content)) {
    addFinding({
      severity: "critical",
      file: rel(path),
      rule: "Error pages need a clear primary heading",
      details: "Potential 404 or not-found page without an h1.",
      recommendation: 'Add a semantic <h1>, such as "Page not found".',
      carbonGuideline: GUIDELINES.accessibility,
    });
  }

  if (
    (/header|nav|menu/i.test(path) ||
      /side-nav|breadcrumb|tag/i.test(content)) && !SKIP_LINK.test(content)
  ) {
    addFinding({
      severity: "minor",
      file: rel(path),
      rule: "Primary navigation layouts should preserve skip-link access",
      details: "No obvious skip-link pattern detected in this file.",
      recommendation:
        "Ensure there is a visible-on-focus skip link to the main landmark.",
      carbonGuideline: GUIDELINES.accessibility,
    });
  }
}

function summarize(findings: Finding[]) {
  const scores = {
    critical: findings.filter((f) => f.severity === "critical").length,
    important: findings.filter((f) => f.severity === "important").length,
    minor: findings.filter((f) => f.severity === "minor").length,
  };

  const penalty = scores.critical * 12 + scores.important * 5 +
    scores.minor * 1.5;
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
  lines.push("1. Fix all critical accessibility findings first.");
  lines.push("2. Normalize token naming and remove raw colors and spacing.");
  lines.push("3. Re-run the scanner after each refactor.");
  lines.push("");

  return lines.join("\n");
}

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

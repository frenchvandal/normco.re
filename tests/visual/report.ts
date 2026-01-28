/**
 * Visual comparison report generator
 *
 * Generates an HTML report showing screenshot comparisons
 *
 * @module tests/visual/report
 */

import { exists } from "@std/fs";
import { join, relative } from "@std/path";
import { bold, cyan, green } from "@std/fmt/colors";
import { OUTPUT_DIRS, THEMES, VIEWPORTS } from "./config.ts";
import type { ComparisonResult } from "./compare.ts";

/**
 * Generate HTML report
 */
function generateHTML(results: ComparisonResult[]): string {
  const timestamp = new Date().toISOString();

  // Group results by page
  const byPage = new Map<string, ComparisonResult[]>();
  for (const result of results) {
    const existing = byPage.get(result.page) || [];
    existing.push(result);
    byPage.set(result.page, existing);
  }

  // Calculate stats
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed && !r.error).length;
  const errors = results.filter((r) => r.error).length;
  const avgDiff =
    results.filter((r) => !r.error).reduce((sum, r) => sum + r.diffPercent, 0) /
      results.filter((r) => !r.error).length || 0;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Visual Regression Report - Lume vs PaperMod</title>
  <style>
    :root {
      --color-pass: #22c55e;
      --color-fail: #ef4444;
      --color-warn: #f59e0b;
      --color-bg: #0f172a;
      --color-surface: #1e293b;
      --color-text: #e2e8f0;
      --color-dim: #94a3b8;
      --color-border: #334155;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: var(--color-bg);
      color: var(--color-text);
      line-height: 1.6;
      padding: 2rem;
    }
    .container { max-width: 1600px; margin: 0 auto; }
    h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, #60a5fa, #a78bfa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .timestamp { color: var(--color-dim); margin-bottom: 2rem; }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .stat {
      background: var(--color-surface);
      border-radius: 8px;
      padding: 1rem;
      text-align: center;
    }
    .stat-value {
      font-size: 2rem;
      font-weight: bold;
    }
    .stat-label { color: var(--color-dim); }
    .stat-pass .stat-value { color: var(--color-pass); }
    .stat-fail .stat-value { color: var(--color-fail); }
    .stat-warn .stat-value { color: var(--color-warn); }
    .page-section {
      background: var(--color-surface);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    .page-title {
      font-size: 1.25rem;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--color-border);
    }
    .comparison-grid {
      display: grid;
      gap: 1rem;
    }
    .comparison-row {
      display: grid;
      grid-template-columns: 150px 1fr 1fr 1fr;
      gap: 1rem;
      padding: 1rem;
      background: var(--color-bg);
      border-radius: 8px;
      align-items: start;
    }
    .comparison-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge-pass { background: var(--color-pass); color: #052e16; }
    .badge-fail { background: var(--color-fail); color: #450a0a; }
    .badge-warn { background: var(--color-warn); color: #451a03; }
    .diff-percent {
      font-size: 1.5rem;
      font-weight: bold;
    }
    .image-container {
      position: relative;
      border-radius: 4px;
      overflow: hidden;
      background: #000;
    }
    .image-container img {
      width: 100%;
      height: auto;
      display: block;
      cursor: zoom-in;
    }
    .image-label {
      position: absolute;
      top: 0;
      left: 0;
      background: rgba(0,0,0,0.7);
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .label-lume { color: #60a5fa; }
    .label-papermod { color: #a78bfa; }
    .label-diff { color: #f472b6; }
    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }
    .filter-group { display: flex; gap: 0.5rem; align-items: center; }
    .filter-group label { color: var(--color-dim); }
    select {
      background: var(--color-bg);
      color: var(--color-text);
      border: 1px solid var(--color-border);
      border-radius: 4px;
      padding: 0.5rem;
    }
    .lightbox {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.95);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      cursor: zoom-out;
    }
    .lightbox.active { display: flex; }
    .lightbox img {
      max-width: 95%;
      max-height: 95%;
      object-fit: contain;
    }
    @media (max-width: 1024px) {
      .comparison-row {
        grid-template-columns: 1fr;
      }
      .image-container { max-height: 300px; }
      .image-container img { object-fit: cover; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔍 Visual Regression Report</h1>
    <p class="timestamp">Lume vs PaperMod • Generated: ${timestamp}</p>

    <div class="stats">
      <div class="stat stat-pass">
        <div class="stat-value">${passed}</div>
        <div class="stat-label">Passed (&lt;5%)</div>
      </div>
      <div class="stat stat-warn">
        <div class="stat-value">${failed}</div>
        <div class="stat-label">Differs</div>
      </div>
      <div class="stat stat-fail">
        <div class="stat-value">${errors}</div>
        <div class="stat-label">Errors</div>
      </div>
      <div class="stat">
        <div class="stat-value">${avgDiff.toFixed(1)}%</div>
        <div class="stat-label">Avg Diff</div>
      </div>
    </div>

    <div class="filters">
      <div class="filter-group">
        <label>Viewport:</label>
        <select id="viewportFilter">
          <option value="all">All</option>
          ${
    VIEWPORTS.map((v) => `<option value="${v.name}">${v.name}</option>`).join(
      "\n          ",
    )
  }
        </select>
      </div>
      <div class="filter-group">
        <label>Theme:</label>
        <select id="themeFilter">
          <option value="all">All</option>
          ${
    THEMES.map((t) => `<option value="${t}">${t}</option>`).join("\n          ")
  }
        </select>
      </div>
      <div class="filter-group">
        <label>Status:</label>
        <select id="statusFilter">
          <option value="all">All</option>
          <option value="passed">Passed</option>
          <option value="failed">Failed</option>
          <option value="error">Errors</option>
        </select>
      </div>
    </div>

    ${
    Array.from(byPage.entries())
      .map(
        ([page, pageResults]) => `
    <section class="page-section" data-page="${page}">
      <h2 class="page-title">📄 ${page}</h2>
      <div class="comparison-grid">
        ${
          pageResults
            .map((r) => {
              const statusClass = r.error ? "fail" : r.passed ? "pass" : "warn";
              const statusText = r.error
                ? "Error"
                : r.passed
                ? "Pass"
                : "Differs";
              const diffColor = r.passed
                ? "var(--color-pass)"
                : r.diffPercent > 20
                ? "var(--color-fail)"
                : "var(--color-warn)";

              // Relative paths for images
              const lumeImg = relative(OUTPUT_DIRS.report, r.lumeFile);
              const papermodImg = relative(OUTPUT_DIRS.report, r.papermodFile);
              const diffImg = relative(OUTPUT_DIRS.report, r.diffFile);

              return `
        <div class="comparison-row" data-viewport="${r.viewport}" data-theme="${r.theme}" data-status="${
                r.error ? "error" : r.passed ? "passed" : "failed"
              }">
          <div class="comparison-info">
            <span class="badge badge-${statusClass}">${statusText}</span>
            <div><strong>${r.viewport}</strong></div>
            <div style="color: var(--color-dim)">${r.theme}</div>
            <div class="diff-percent" style="color: ${diffColor}">${
                r.diffPercent.toFixed(1)
              }%</div>
            ${
                r.error
                  ? `<div style="color: var(--color-fail); font-size: 0.75rem">${r.error}</div>`
                  : ""
              }
          </div>
          <div class="image-container">
            <span class="image-label label-lume">Lume</span>
            <img src="${lumeImg}" alt="Lume screenshot" loading="lazy" onclick="openLightbox(this.src)">
          </div>
          <div class="image-container">
            <span class="image-label label-papermod">PaperMod</span>
            <img src="${papermodImg}" alt="PaperMod screenshot" loading="lazy" onclick="openLightbox(this.src)">
          </div>
          <div class="image-container">
            <span class="image-label label-diff">Diff</span>
            <img src="${diffImg}" alt="Diff image" loading="lazy" onclick="openLightbox(this.src)">
          </div>
        </div>`;
            })
            .join("")
        }
      </div>
    </section>`,
      )
      .join("")
  }
  </div>

  <div class="lightbox" id="lightbox" onclick="closeLightbox()">
    <img id="lightboxImg" src="" alt="Enlarged view">
  </div>

  <script>
    // Filtering
    const filters = {
      viewport: document.getElementById('viewportFilter'),
      theme: document.getElementById('themeFilter'),
      status: document.getElementById('statusFilter')
    };

    function applyFilters() {
      const viewport = filters.viewport.value;
      const theme = filters.theme.value;
      const status = filters.status.value;

      document.querySelectorAll('.comparison-row').forEach(row => {
        const matchViewport = viewport === 'all' || row.dataset.viewport === viewport;
        const matchTheme = theme === 'all' || row.dataset.theme === theme;
        const matchStatus = status === 'all' || row.dataset.status === status;
        row.style.display = matchViewport && matchTheme && matchStatus ? 'grid' : 'none';
      });
    }

    Object.values(filters).forEach(f => f.addEventListener('change', applyFilters));

    // Lightbox
    function openLightbox(src) {
      document.getElementById('lightboxImg').src = src;
      document.getElementById('lightbox').classList.add('active');
    }

    function closeLightbox() {
      document.getElementById('lightbox').classList.remove('active');
    }

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeLightbox();
    });
  </script>
</body>
</html>`;
}

/**
 * Main report generation function
 */
async function main(): Promise<void> {
  console.log(bold(cyan("\n📊 Generating Visual Comparison Report\n")));

  // Load comparison results
  const resultsPath = join(OUTPUT_DIRS.screenshots, "results.json");

  if (!(await exists(resultsPath))) {
    console.log(
      "❌ No comparison results found. Run 'deno task visual:compare' first.",
    );
    Deno.exit(1);
  }

  const resultsJson = await Deno.readTextFile(resultsPath);
  const results: ComparisonResult[] = JSON.parse(resultsJson);

  console.log(`   Loaded ${results.length} comparison results`);

  // Generate HTML report
  const html = generateHTML(results);

  // Save report
  const reportPath = join(OUTPUT_DIRS.report, "index.html");
  await Deno.writeTextFile(reportPath, html);

  console.log(green(`\n✓ Report generated: ${reportPath}`));
  console.log(cyan("\n📂 Open in browser:"));
  console.log(`   file://${Deno.cwd()}/${reportPath}\n`);

  // Also generate a markdown summary
  const mdReport = generateMarkdownSummary(results);
  const mdPath = join(OUTPUT_DIRS.report, "summary.md");
  await Deno.writeTextFile(mdPath, mdReport);
  console.log(`   Markdown summary: ${mdPath}\n`);
}

/**
 * Generate markdown summary
 */
function generateMarkdownSummary(results: ComparisonResult[]): string {
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed && !r.error).length;
  const errors = results.filter((r) => r.error).length;
  const avgDiff =
    results.filter((r) => !r.error).reduce((sum, r) => sum + r.diffPercent, 0) /
      results.filter((r) => !r.error).length || 0;

  let md = `# Visual Regression Report

## Summary

| Metric | Value |
|--------|-------|
| **Passed** (< 5% diff) | ${passed} |
| **Differs** (5-100%) | ${failed} |
| **Errors** | ${errors} |
| **Avg Diff** | ${avgDiff.toFixed(1)}% |

## Results by Page

`;

  // Group by page
  const byPage = new Map<string, ComparisonResult[]>();
  for (const result of results) {
    const existing = byPage.get(result.page) || [];
    existing.push(result);
    byPage.set(result.page, existing);
  }

  for (const [page, pageResults] of byPage.entries()) {
    md += `### ${page}\n\n`;
    md += `| Viewport | Theme | Diff | Status |\n`;
    md += `|----------|-------|------|--------|\n`;

    for (const r of pageResults) {
      const status = r.error ? "❌ Error" : r.passed ? "✅ Pass" : "⚠️ Differs";
      md += `| ${r.viewport} | ${r.theme} | ${
        r.diffPercent.toFixed(1)
      }% | ${status} |\n`;
    }

    md += "\n";
  }

  md += `\n---\n\n*Generated: ${new Date().toISOString()}*\n`;

  return md;
}

// Run
if (import.meta.main) {
  main();
}

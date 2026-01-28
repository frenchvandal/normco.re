# Visual Regression Testing

This directory contains tools for comparing the visual rendering of the Lume
site against the original Hugo PaperMod theme.

## Prerequisites

1. **Lume server running locally**

   ```bash
   DENO_TLS_CA_STORE=system deno task serve
   ```

2. **Playwright browsers installed** (automatic on first run)

## Available Commands

### Capture Screenshots

```bash
deno task visual:capture
```

Captures screenshots of both sites:

- **Lume** (localhost:3000)
- **PaperMod** (adityatelange.github.io/hugo-PaperMod)

Screenshots are organized by:

- Site (lume/papermod)
- Page (home, post-single, archive, etc.)
- Viewport (mobile, tablet, desktop, wide)
- Theme (light, dark)

### Compare Screenshots

```bash
deno task visual:compare
```

Compares Lume vs PaperMod screenshots using pixel-level diffing:

- Generates diff images highlighting differences
- Reports percentage difference for each comparison
- Saves results to `screenshots/results.json`

### Compare CSS Tokens

```bash
deno task visual:tokens
```

Extracts and compares CSS custom properties (design tokens):

- Extracts `--*` variables from both sites
- Maps PaperMod tokens to Lume equivalents
- Calculates color/value similarity
- Saves detailed report to `report/tokens.json`

### Generate HTML Report

```bash
deno task visual:report
```

Creates an interactive HTML report:

- Side-by-side image comparison
- Filtering by viewport, theme, and status
- Lightbox for detailed inspection
- Markdown summary for documentation

### Run All Tests

```bash
deno task visual:all
```

Runs capture → compare → report in sequence.

## Output Structure

```
tests/visual/
├── screenshots/
│   ├── lume/           # Lume site screenshots
│   ├── papermod/       # PaperMod screenshots
│   ├── diff/           # Difference images
│   └── results.json    # Comparison data
├── report/
│   ├── index.html      # Interactive HTML report
│   ├── summary.md      # Markdown summary
│   └── tokens.json     # Token comparison data
├── config.ts           # Test configuration
├── capture.ts          # Screenshot capture script
├── compare.ts          # Image comparison script
├── tokens.ts           # CSS token extraction
└── report.ts           # Report generator
```

## Configuration

Edit `config.ts` to customize:

- **PAGES**: Pages to compare (Lume path ↔ PaperMod path)
- **VIEWPORTS**: Screen sizes to test
- **THEMES**: Color schemes (light/dark)
- **DIFF_THRESHOLD**: Sensitivity (0-1, lower = stricter)

## Interpreting Results

| Diff % | Status  | Meaning                                 |
| ------ | ------- | --------------------------------------- |
| < 5%   | ✅ Pass | Minor differences (content, timestamps) |
| 5-20%  | ⚠️ Warn | Noticeable differences, review needed   |
| > 20%  | ❌ Fail | Significant layout/style differences    |

**Note:** Some differences are expected:

- Content (demo posts differ)
- Dynamic elements (dates, reading time)
- Search implementation (Pagefind vs Fuse.js)

## Tips

1. **Run capture twice** if PaperMod loads slowly (first run warms cache)
2. **Check diff images** to see exactly what differs
3. **Use filters** in HTML report to focus on specific issues
4. **Compare tokens** to identify design token mismatches

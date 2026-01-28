/**
 * Visual comparison script
 *
 * Compares Lume and PaperMod screenshots using pixelmatch
 *
 * @module tests/visual/compare
 */

import { Buffer } from "node:buffer";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { exists } from "@std/fs";
import { join } from "@std/path";
import { bold, cyan, green, red, yellow } from "@std/fmt/colors";
import {
  DIFF_THRESHOLD,
  getDiffFilename,
  getScreenshotFilename,
  OUTPUT_DIRS,
  PAGES,
  type ThemeConfig,
  THEMES,
  type ViewportConfig,
  VIEWPORTS,
} from "./config.ts";

/**
 * Comparison result for a single page
 */
export interface ComparisonResult {
  page: string;
  viewport: string;
  theme: ThemeConfig;
  lumeFile: string;
  papermodFile: string;
  diffFile: string;
  totalPixels: number;
  diffPixels: number;
  diffPercent: number;
  passed: boolean;
  error?: string;
}

/**
 * Read a PNG file and return the image data
 */
async function readPNG(path: string): Promise<PNG | null> {
  try {
    const data = await Deno.readFile(path);
    return new Promise((resolve, reject) => {
      const png = new PNG();
      png.parse(Buffer.from(data), (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  } catch {
    return null;
  }
}

/**
 * Write a PNG file
 */
async function writePNG(path: string, png: PNG): Promise<void> {
  const buffer = PNG.sync.write(png);
  await Deno.writeFile(path, buffer);
}

/**
 * Resize an image to match target dimensions (pad with transparent pixels)
 */
function resizeToMatch(
  img: PNG,
  targetWidth: number,
  targetHeight: number,
): PNG {
  const resized = new PNG({ width: targetWidth, height: targetHeight });

  // Fill with transparent pixels
  for (let i = 0; i < resized.data.length; i += 4) {
    resized.data[i] = 0; // R
    resized.data[i + 1] = 0; // G
    resized.data[i + 2] = 0; // B
    resized.data[i + 3] = 0; // A (transparent)
  }

  // Copy original image data
  for (let y = 0; y < Math.min(img.height, targetHeight); y++) {
    for (let x = 0; x < Math.min(img.width, targetWidth); x++) {
      const srcIdx = (y * img.width + x) * 4;
      const dstIdx = (y * targetWidth + x) * 4;
      resized.data[dstIdx] = img.data[srcIdx];
      resized.data[dstIdx + 1] = img.data[srcIdx + 1];
      resized.data[dstIdx + 2] = img.data[srcIdx + 2];
      resized.data[dstIdx + 3] = img.data[srcIdx + 3];
    }
  }

  return resized;
}

/**
 * Compare two screenshots
 */
async function compareScreenshots(
  page: string,
  viewport: ViewportConfig,
  theme: ThemeConfig,
): Promise<ComparisonResult> {
  const lumeFile = join(
    OUTPUT_DIRS.lume,
    getScreenshotFilename("lume", page, viewport.name, theme),
  );
  const papermodFile = join(
    OUTPUT_DIRS.papermod,
    getScreenshotFilename("papermod", page, viewport.name, theme),
  );
  const diffFile = join(
    OUTPUT_DIRS.diff,
    getDiffFilename(page, viewport.name, theme),
  );

  // Check if files exist
  const lumeExists = await exists(lumeFile);
  const papermodExists = await exists(papermodFile);

  if (!lumeExists || !papermodExists) {
    return {
      page,
      viewport: viewport.name,
      theme,
      lumeFile,
      papermodFile,
      diffFile,
      totalPixels: 0,
      diffPixels: 0,
      diffPercent: 100,
      passed: false,
      error: `Missing file: ${!lumeExists ? lumeFile : papermodFile}`,
    };
  }

  // Read images
  const lumeImg = await readPNG(lumeFile);
  const papermodImg = await readPNG(papermodFile);

  if (!lumeImg || !papermodImg) {
    return {
      page,
      viewport: viewport.name,
      theme,
      lumeFile,
      papermodFile,
      diffFile,
      totalPixels: 0,
      diffPixels: 0,
      diffPercent: 100,
      passed: false,
      error: "Failed to read PNG files",
    };
  }

  // Determine max dimensions (images may have different heights due to content)
  const maxWidth = Math.max(lumeImg.width, papermodImg.width);
  const maxHeight = Math.max(lumeImg.height, papermodImg.height);

  // Resize images to match
  const lumeResized = resizeToMatch(lumeImg, maxWidth, maxHeight);
  const papermodResized = resizeToMatch(papermodImg, maxWidth, maxHeight);

  // Create diff image
  const diffImg = new PNG({ width: maxWidth, height: maxHeight });

  // Compare
  const diffPixels = pixelmatch(
    lumeResized.data,
    papermodResized.data,
    diffImg.data,
    maxWidth,
    maxHeight,
    { threshold: DIFF_THRESHOLD, alpha: 0.3 },
  );

  // Write diff image
  await writePNG(diffFile, diffImg);

  const totalPixels = maxWidth * maxHeight;
  const diffPercent = (diffPixels / totalPixels) * 100;

  // Consider passed if less than 5% difference (content will never match exactly)
  const passed = diffPercent < 5;

  return {
    page,
    viewport: viewport.name,
    theme,
    lumeFile,
    papermodFile,
    diffFile,
    totalPixels,
    diffPixels,
    diffPercent,
    passed,
  };
}

/**
 * Format percentage with color
 */
function formatPercent(percent: number): string {
  const formatted = percent.toFixed(2) + "%";
  if (percent < 5) return green(formatted);
  if (percent < 20) return yellow(formatted);
  return red(formatted);
}

/**
 * Main comparison function
 */
async function main(): Promise<void> {
  console.log(bold(cyan("\n🔍 Visual Regression Test - Comparison\n")));

  const results: ComparisonResult[] = [];

  // Compare all pages
  for (const pageConfig of PAGES) {
    console.log(bold(`\n📄 Page: ${pageConfig.name}`));

    for (const viewport of VIEWPORTS) {
      for (const theme of THEMES) {
        const result = await compareScreenshots(
          pageConfig.name,
          viewport,
          theme,
        );
        results.push(result);

        const label = `   ${viewport.name.padEnd(7)} | ${theme.padEnd(5)} |`;

        if (result.error) {
          console.log(red(`${label} ✗ ${result.error}`));
        } else {
          const status = result.passed ? green("✓") : yellow("~");
          console.log(
            `${label} ${status} diff: ${formatPercent(result.diffPercent)}`,
          );
        }
      }
    }
  }

  // Summary
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed && !r.error).length;
  const errors = results.filter((r) => r.error).length;

  console.log(bold(cyan("\n📊 Comparison Summary")));
  console.log(`   Total:    ${results.length}`);
  console.log(green(`   Passed:   ${passed} (< 5% diff)`));
  if (failed > 0) {
    console.log(yellow(`   Differs:  ${failed} (5-100% diff)`));
  }
  if (errors > 0) {
    console.log(red(`   Errors:   ${errors}`));
  }

  // Calculate average diff
  const validResults = results.filter((r) => !r.error);
  if (validResults.length > 0) {
    const avgDiff = validResults.reduce((sum, r) => sum + r.diffPercent, 0) /
      validResults.length;
    console.log(`   Avg diff: ${formatPercent(avgDiff)}`);
  }

  console.log(bold(cyan("\n📁 Diff images saved to:")));
  console.log(`   ${OUTPUT_DIRS.diff}/`);

  console.log(bold(cyan("\n✨ Next step:")));
  console.log("   Generate report: deno task visual:report\n");

  // Save results as JSON for report
  const resultsPath = join(OUTPUT_DIRS.screenshots, "results.json");
  await Deno.writeTextFile(resultsPath, JSON.stringify(results, null, 2));
  console.log(`   Results saved to: ${resultsPath}\n`);
}

// Run
if (import.meta.main) {
  main();
}

export { compareScreenshots };

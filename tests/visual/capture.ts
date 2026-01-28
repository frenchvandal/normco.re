/**
 * Screenshot capture script for visual regression testing
 *
 * Captures screenshots of both Lume and PaperMod sites for comparison
 *
 * @module tests/visual/capture
 */

import { type Browser, chromium, type Page } from "playwright";
import { ensureDir } from "@std/fs";
import { join } from "@std/path";
import { bold, cyan, green, red, yellow } from "@std/fmt/colors";
import {
  BASE_URLS,
  getScreenshotFilename,
  OUTPUT_DIRS,
  type PageConfig,
  PAGES,
  type ThemeConfig,
  THEMES,
  type ViewportConfig,
  VIEWPORTS,
} from "./config.ts";

/**
 * Set theme on a page
 */
async function setTheme(page: Page, theme: ThemeConfig): Promise<void> {
  // Try multiple methods to set theme (works for both Lume and PaperMod)
  await page.evaluate((t) => {
    // Method 1: data-theme attribute (Lume style)
    document.documentElement.setAttribute("data-theme", t);
    // Method 2: class on body (some themes)
    document.body.classList.remove("light", "dark");
    document.body.classList.add(t);
    // Method 3: localStorage (persistence)
    localStorage.setItem("theme", t);
    localStorage.setItem("pref-theme", t);
  }, theme);

  // Wait for theme transition
  await page.waitForTimeout(100);
}

/**
 * Execute page actions before screenshot
 */
async function executeActions(
  page: Page,
  actions: PageConfig["actions"],
): Promise<void> {
  if (!actions) return;

  for (const action of actions) {
    switch (action.type) {
      case "click":
        if (action.selector) {
          try {
            await page.click(action.selector, { timeout: 2000 });
          } catch {
            console.log(yellow(`  Could not click: ${action.selector}`));
          }
        }
        break;
      case "scroll":
        await page.evaluate(
          (y) => globalThis.scrollTo(0, y as number),
          action.value ?? 0,
        );
        break;
      case "wait":
        await page.waitForTimeout(action.value as number ?? 500);
        break;
      case "hover":
        if (action.selector) {
          try {
            await page.hover(action.selector, { timeout: 2000 });
          } catch {
            console.log(yellow(`  Could not hover: ${action.selector}`));
          }
        }
        break;
      case "type":
        if (action.selector && action.value) {
          try {
            await page.fill(action.selector, String(action.value));
          } catch {
            console.log(yellow(`  Could not type in: ${action.selector}`));
          }
        }
        break;
    }
  }
}

/**
 * Capture a single screenshot
 */
async function captureScreenshot(
  browser: Browser,
  site: "lume" | "papermod",
  pageConfig: PageConfig,
  viewport: ViewportConfig,
  theme: ThemeConfig,
): Promise<{ success: boolean; path?: string; error?: string }> {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    colorScheme: theme === "dark" ? "dark" : "light",
  });

  const page = await context.newPage();
  const baseUrl = BASE_URLS[site];
  const path = site === "lume" ? pageConfig.lumePath : pageConfig.papermodPath;
  const url = `${baseUrl}${path}`;

  try {
    // Navigate to page
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

    // Set theme explicitly
    await setTheme(page, theme);

    // Wait for content
    if (pageConfig.waitFor) {
      try {
        await page.waitForSelector(pageConfig.waitFor, { timeout: 5000 });
      } catch {
        // Selector not found, continue anyway
      }
    }

    // Execute any actions
    await executeActions(page, pageConfig.actions);

    // Wait for animations to settle
    await page.waitForTimeout(300);

    // Generate filename and path
    const filename = getScreenshotFilename(
      site,
      pageConfig.name,
      viewport.name,
      theme,
    );
    const outputDir = site === "lume" ? OUTPUT_DIRS.lume : OUTPUT_DIRS.papermod;
    const outputPath = join(outputDir, filename);

    // Take screenshot
    await page.screenshot({
      path: outputPath,
      fullPage: true,
      animations: "disabled",
    });

    await context.close();
    return { success: true, path: outputPath };
  } catch (error) {
    await context.close();
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Check if Lume server is running
 */
async function checkLumeServer(): Promise<boolean> {
  try {
    const response = await fetch(BASE_URLS.lume);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Main capture function
 */
async function main(): Promise<void> {
  console.log(bold(cyan("\n📸 Visual Regression Test - Screenshot Capture\n")));

  // Check if Lume server is running
  const lumeRunning = await checkLumeServer();
  if (!lumeRunning) {
    console.log(red("❌ Lume server is not running at " + BASE_URLS.lume));
    console.log(
      yellow("   Start it with: DENO_TLS_CA_STORE=system deno task serve"),
    );
    Deno.exit(1);
  }
  console.log(green("✓ Lume server is running"));

  // Ensure output directories exist
  await ensureDir(OUTPUT_DIRS.lume);
  await ensureDir(OUTPUT_DIRS.papermod);
  await ensureDir(OUTPUT_DIRS.diff);

  // Install Playwright browsers if needed
  console.log(cyan("\nInitializing browser..."));
  const browser = await chromium.launch({ headless: true });

  // Statistics
  let total = 0;
  let success = 0;
  let failed = 0;

  // Capture screenshots
  for (const pageConfig of PAGES) {
    console.log(bold(`\n📄 Page: ${pageConfig.name}`));
    if (pageConfig.description) {
      console.log(`   ${pageConfig.description}`);
    }

    for (const viewport of VIEWPORTS) {
      for (const theme of THEMES) {
        for (const site of ["lume", "papermod"] as const) {
          total++;
          const label = `   ${site.padEnd(8)} | ${viewport.name.padEnd(7)} | ${
            theme.padEnd(5)
          }`;

          const result = await captureScreenshot(
            browser,
            site,
            pageConfig,
            viewport,
            theme,
          );

          if (result.success) {
            console.log(green(`${label} ✓`));
            success++;
          } else {
            console.log(red(`${label} ✗ ${result.error}`));
            failed++;
          }
        }
      }
    }
  }

  await browser.close();

  // Summary
  console.log(bold(cyan("\n📊 Capture Summary")));
  console.log(`   Total:   ${total}`);
  console.log(green(`   Success: ${success}`));
  if (failed > 0) {
    console.log(red(`   Failed:  ${failed}`));
  }

  console.log(bold(cyan("\n📁 Screenshots saved to:")));
  console.log(`   Lume:     ${OUTPUT_DIRS.lume}/`);
  console.log(`   PaperMod: ${OUTPUT_DIRS.papermod}/`);

  console.log(bold(cyan("\n✨ Next step:")));
  console.log("   Run comparison: deno task visual:compare\n");
}

// Run
if (import.meta.main) {
  main();
}

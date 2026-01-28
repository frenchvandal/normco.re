/**
 * CSS Tokens comparison script
 *
 * Extracts and compares CSS custom properties (design tokens)
 * between Lume and PaperMod sites
 *
 * @module tests/visual/tokens
 */

import { chromium } from "playwright";
import { ensureDir } from "@std/fs";
import { join } from "@std/path";
import { bold, cyan, green, red, yellow } from "@std/fmt/colors";
import { BASE_URLS, OUTPUT_DIRS } from "./config.ts";

/**
 * CSS token value
 */
interface TokenValue {
  name: string;
  lightValue: string;
  darkValue: string;
}

/**
 * Token comparison result
 */
interface TokenComparison {
  name: string;
  lume: { light: string; dark: string };
  papermod: { light: string; dark: string };
  match: boolean;
  similarity: number;
}

/**
 * Extract CSS custom properties from a page
 */
async function extractTokens(url: string): Promise<{
  light: Record<string, string>;
  dark: Record<string, string>;
}> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

    // Extract tokens for both themes
    const tokens = await page.evaluate(() => {
      const getTokens = (theme: "light" | "dark"): Record<string, string> => {
        const tokens: Record<string, string> = {};

        // Set theme
        document.documentElement.setAttribute("data-theme", theme);
        document.body.classList.remove("light", "dark");
        document.body.classList.add(theme);
        localStorage.setItem("theme", theme);
        localStorage.setItem("pref-theme", theme);

        // Get computed styles
        const styles = getComputedStyle(document.documentElement);

        // Get all CSS variables
        const sheets = document.styleSheets;
        for (const sheet of sheets) {
          try {
            const rules = sheet.cssRules || sheet.rules;
            for (const rule of rules) {
              if (rule instanceof CSSStyleRule) {
                const selector = rule.selectorText;
                if (
                  selector === ":root" ||
                  selector === "[data-theme=light]" ||
                  selector === "[data-theme=dark]" ||
                  selector === "html" ||
                  selector === ".dark" ||
                  selector === ".light"
                ) {
                  for (const prop of rule.style) {
                    if (prop.startsWith("--")) {
                      // Get computed value
                      const value = styles.getPropertyValue(prop).trim();
                      if (value) {
                        tokens[prop] = value;
                      }
                    }
                  }
                }
              }
            }
          } catch {
            // Cross-origin stylesheet, skip
          }
        }

        return tokens;
      };

      return {
        light: getTokens("light"),
        dark: getTokens("dark"),
      };
    });

    await browser.close();
    return tokens;
  } catch (error) {
    await browser.close();
    throw error;
  }
}

/**
 * Normalize a color value for comparison
 */
function normalizeColor(value: string): string {
  // Remove spaces and convert to lowercase
  const normalized = value.toLowerCase().replace(/\s+/g, "");

  // Convert rgb to hex for easier comparison
  const rgbMatch = normalized.match(/rgb\((\d+),(\d+),(\d+)\)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]).toString(16).padStart(2, "0");
    const g = parseInt(rgbMatch[2]).toString(16).padStart(2, "0");
    const b = parseInt(rgbMatch[3]).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
  }

  // Convert rgba to hex with alpha
  const rgbaMatch = normalized.match(/rgba\((\d+),(\d+),(\d+),([\d.]+)\)/);
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1]).toString(16).padStart(2, "0");
    const g = parseInt(rgbaMatch[2]).toString(16).padStart(2, "0");
    const b = parseInt(rgbaMatch[3]).toString(16).padStart(2, "0");
    const a = Math.round(parseFloat(rgbaMatch[4]) * 255)
      .toString(16)
      .padStart(2, "0");
    return `#${r}${g}${b}${a}`;
  }

  return normalized;
}

/**
 * Calculate similarity between two values (0-1)
 */
function calculateSimilarity(value1: string, value2: string): number {
  const norm1 = normalizeColor(value1);
  const norm2 = normalizeColor(value2);

  if (norm1 === norm2) return 1;

  // For hex colors, calculate color distance
  if (norm1.startsWith("#") && norm2.startsWith("#")) {
    const hex1 = norm1.slice(1);
    const hex2 = norm2.slice(1);

    if (hex1.length >= 6 && hex2.length >= 6) {
      const r1 = parseInt(hex1.slice(0, 2), 16);
      const g1 = parseInt(hex1.slice(2, 4), 16);
      const b1 = parseInt(hex1.slice(4, 6), 16);
      const r2 = parseInt(hex2.slice(0, 2), 16);
      const g2 = parseInt(hex2.slice(2, 4), 16);
      const b2 = parseInt(hex2.slice(4, 6), 16);

      // Euclidean distance in RGB space, normalized to 0-1
      const distance = Math.sqrt(
        Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2),
      );
      const maxDistance = Math.sqrt(3 * Math.pow(255, 2));
      return 1 - distance / maxDistance;
    }
  }

  // For numeric values
  const num1 = parseFloat(value1);
  const num2 = parseFloat(value2);
  if (!isNaN(num1) && !isNaN(num2)) {
    const max = Math.max(Math.abs(num1), Math.abs(num2), 1);
    return 1 - Math.abs(num1 - num2) / max;
  }

  // String comparison - Levenshtein-like
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    return 0.8;
  }

  return 0;
}

/**
 * Map PaperMod token names to Lume equivalents
 */
const TOKEN_MAPPING: Record<string, string> = {
  "--theme": "--color-background",
  "--primary": "--color-base",
  "--secondary": "--color-dim",
  "--tertiary": "--color-faint",
  "--content": "--color-text",
  "--hljs-bg": "--code-background",
  "--code-bg": "--code-background",
  "--border": "--color-line",
  "--gap": "--spacing-lg",
  "--radius": "--border-radius-lg",
  "--main-width": "--content-max-width",
};

/**
 * Main comparison function
 */
async function main(): Promise<void> {
  console.log(bold(cyan("\n🎨 CSS Tokens Comparison - Lume vs PaperMod\n")));

  // Check if Lume server is running
  try {
    await fetch(BASE_URLS.lume);
  } catch {
    console.log(red("❌ Lume server is not running at " + BASE_URLS.lume));
    console.log(
      yellow("   Start it with: DENO_TLS_CA_STORE=system deno task serve"),
    );
    Deno.exit(1);
  }
  console.log(green("✓ Lume server is running"));

  console.log(cyan("\nExtracting tokens from Lume..."));
  const lumeTokens = await extractTokens(BASE_URLS.lume);
  console.log(`   Found ${Object.keys(lumeTokens.light).length} light tokens`);
  console.log(`   Found ${Object.keys(lumeTokens.dark).length} dark tokens`);

  console.log(cyan("\nExtracting tokens from PaperMod..."));
  const papermodTokens = await extractTokens(BASE_URLS.papermod);
  console.log(
    `   Found ${Object.keys(papermodTokens.light).length} light tokens`,
  );
  console.log(
    `   Found ${Object.keys(papermodTokens.dark).length} dark tokens`,
  );

  // Compare tokens
  const comparisons: TokenComparison[] = [];

  // Compare mapped tokens
  console.log(bold(cyan("\n📊 Token Comparisons (mapped)")));
  console.log("─".repeat(80));

  for (const [papermodName, lumeName] of Object.entries(TOKEN_MAPPING)) {
    const lumeLight = lumeTokens.light[lumeName] || "";
    const lumeDark = lumeTokens.dark[lumeName] || "";
    const papermodLight = papermodTokens.light[papermodName] || "";
    const papermodDark = papermodTokens.dark[papermodName] || "";

    const lightSim = calculateSimilarity(lumeLight, papermodLight);
    const darkSim = calculateSimilarity(lumeDark, papermodDark);
    const avgSim = (lightSim + darkSim) / 2;
    const match = avgSim >= 0.95;

    comparisons.push({
      name: `${papermodName} → ${lumeName}`,
      lume: { light: lumeLight, dark: lumeDark },
      papermod: { light: papermodLight, dark: papermodDark },
      match,
      similarity: avgSim,
    });

    const status = match ? green("✓") : avgSim >= 0.8 ? yellow("~") : red("✗");
    const simPercent = (avgSim * 100).toFixed(0) + "%";
    console.log(
      `${status} ${papermodName.padEnd(20)} → ${lumeName.padEnd(25)}`,
    );
    console.log(
      `     Light: ${lumeLight.padEnd(20)} vs ${
        papermodLight.padEnd(20)
      } ${simPercent}`,
    );
    console.log(
      `     Dark:  ${lumeDark.padEnd(20)} vs ${papermodDark.padEnd(20)}`,
    );
  }

  // Summary
  const matched = comparisons.filter((c) => c.match).length;
  const partial =
    comparisons.filter((c) => !c.match && c.similarity >= 0.8).length;
  const different = comparisons.filter((c) => c.similarity < 0.8).length;

  console.log(bold(cyan("\n📈 Summary")));
  console.log("─".repeat(40));
  console.log(green(`   Matched (≥95%):  ${matched}`));
  console.log(yellow(`   Partial (80-95%): ${partial}`));
  console.log(red(`   Different (<80%): ${different}`));

  const avgSimilarity = comparisons.reduce((sum, c) => sum + c.similarity, 0) /
    comparisons.length;
  console.log(`\n   Overall similarity: ${(avgSimilarity * 100).toFixed(1)}%`);

  // Save results
  await ensureDir(OUTPUT_DIRS.report);
  const reportPath = join(OUTPUT_DIRS.report, "tokens.json");
  await Deno.writeTextFile(
    reportPath,
    JSON.stringify(
      {
        lume: lumeTokens,
        papermod: papermodTokens,
        comparisons,
        summary: {
          matched,
          partial,
          different,
          avgSimilarity,
        },
      },
      null,
      2,
    ),
  );
  console.log(`\n   Report saved to: ${reportPath}`);

  // List all Lume tokens for reference
  console.log(bold(cyan("\n📋 All Lume Tokens (light theme)")));
  console.log("─".repeat(60));
  const sortedTokens = Object.entries(lumeTokens.light).sort(([a], [b]) =>
    a.localeCompare(b)
  );
  for (const [name, value] of sortedTokens.slice(0, 30)) {
    console.log(`   ${name.padEnd(35)} ${value}`);
  }
  if (sortedTokens.length > 30) {
    console.log(`   ... and ${sortedTokens.length - 30} more tokens`);
  }

  console.log(bold(cyan("\n✨ Done!\n")));
}

// Run
if (import.meta.main) {
  main();
}

export { calculateSimilarity, extractTokens };

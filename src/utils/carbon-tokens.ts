/**
 * Carbon Design System v11 design tokens extracted from Figma JSON exports.
 *
 * Loads token collections from JSON files in `design-tokens/` at build time.
 * The module parses the Figma variable export format and provides typed access
 * to theme colors, spacing, breakpoints, and typography tokens.
 *
 * Color conversion uses the sRGB → LMS → Oklab → Oklch pipeline for accurate
 * perceptually uniform output, independent of any hex value in the source data.
 *
 * @module
 */

// ---------------------------------------------------------------------------
// Figma variable export types
// ---------------------------------------------------------------------------

/** Normalized RGBA color as exported by Figma (channels in 0–1 range). */
type FigmaRgba = {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;
  readonly hex?: string;
};

/** A single design variable from the Figma export. */
type FigmaVariable = {
  readonly name: string;
  readonly type: "COLOR" | "FLOAT" | "STRING" | "BOOLEAN";
  readonly value: FigmaRgba | number | string | boolean | {
    readonly type: "VARIABLE_ALIAS";
    readonly id: string;
  };
  readonly scopes?: ReadonlyArray<string>;
};

/** A mode within a variable collection (e.g., "White Theme", "Gray 90 Theme"). */
type FigmaMode = {
  readonly name: string;
  readonly modeId: string;
  readonly variables: ReadonlyArray<FigmaVariable>;
};

/** A top-level variable collection (e.g., "Theme", "Spacing"). */
type FigmaCollection = {
  readonly name: string;
  readonly modes: ReadonlyArray<FigmaMode>;
};

/** Full Figma export — array of variable collections. */
type FigmaExport = ReadonlyArray<FigmaCollection>;

// ---------------------------------------------------------------------------
// Color conversion: sRGB → Linear sRGB → LMS → Oklab → Oklch
// ---------------------------------------------------------------------------

/**
 * Converts a normalized sRGB color (0–1 channels) to a CSS `oklch()` string.
 *
 * Uses the standard sRGB → Linear sRGB → LMS → Oklab → Oklch pipeline.
 * Does not depend on any `hex` field — only the `r`, `g`, `b`, `a` channels.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert/equals";
 *
 * // Pure white → oklch(100% 0 0)
 * const white = rgbaToOklch({ r: 1, g: 1, b: 1, a: 1 });
 * assertEquals(white, "oklch(100% 0 0)");
 * ```
 *
 * @example
 * ```ts
 * import { assert } from "jsr:@std/assert/assert";
 *
 * // Semi-transparent gray
 * const result = rgbaToOklch({ r: 0.5, g: 0.5, b: 0.5, a: 0.5 });
 * assert(result.startsWith("oklch("));
 * assert(result.includes(" / 0.5)"));
 * ```
 */
export function rgbaToOklch(rgba: FigmaRgba): string {
  const { r, g, b, a } = rgba;

  // sRGB gamma decode → linear sRGB
  const toLinear = (c: number): number =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  const rLin = toLinear(r);
  const gLin = toLinear(g);
  const bLin = toLinear(b);

  // Linear sRGB → LMS (cone response)
  const l = 0.4122214708 * rLin + 0.5363325363 * gLin + 0.0514459929 * bLin;
  const m = 0.2119034982 * rLin + 0.6806995451 * gLin + 0.1073969566 * bLin;
  const s = 0.0883024619 * rLin + 0.2817188376 * gLin + 0.6299787005 * bLin;

  // Cube root (LMS → LMS')
  const lRoot = Math.cbrt(l);
  const mRoot = Math.cbrt(m);
  const sRoot = Math.cbrt(s);

  // LMS' → Oklab (L, a, b)
  const okL = 0.2104542553 * lRoot + 0.7936177850 * mRoot -
    0.0040720468 * sRoot;
  const okA = 1.9779984951 * lRoot - 2.4285922050 * mRoot +
    0.4505937099 * sRoot;
  const okB = 0.0259040371 * lRoot + 0.7827717662 * mRoot -
    0.8086757660 * sRoot;

  // Oklab → Oklch (L, C, h)
  const lightness = Math.round(okL * 10000) / 100; // % with 1 decimal
  const chroma = Math.round(Math.sqrt(okA * okA + okB * okB) * 1000) / 1000;
  let hue = Math.atan2(okB, okA) * (180 / Math.PI);

  if (hue < 0) {
    hue += 360;
  }

  hue = Math.round(hue);

  // Format output — omit chroma and hue when achromatic (grays)
  const isAchromatic = chroma < 0.002;
  const lStr = `${lightness}%`;
  const cStr = isAchromatic ? "0" : `${chroma}`;
  const hStr = isAchromatic ? "0" : `${hue}`;

  if (a < 1) {
    const alphaRounded = Math.round(a * 100) / 100;
    return `oklch(${lStr} ${cStr} ${hStr} / ${alphaRounded})`;
  }

  return `oklch(${lStr} ${cStr} ${hStr})`;
}

/**
 * Converts a normalized sRGB color (0–1 channels) to a `#rrggbb` hex string.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert/equals";
 *
 * const hex = rgbaToHex({ r: 1, g: 1, b: 1, a: 1 });
 * assertEquals(hex, "#ffffff");
 * ```
 */
export function rgbaToHex(rgba: FigmaRgba): string {
  const toHex = (c: number): string =>
    Math.round(c * 255).toString(16).padStart(2, "0");

  return `#${toHex(rgba.r)}${toHex(rgba.g)}${toHex(rgba.b)}`;
}

// ---------------------------------------------------------------------------
// Figma JSON loading
// ---------------------------------------------------------------------------

/**
 * Loads all Figma JSON exports from the `design-tokens/` directory.
 *
 * Reads every `.json` file in the directory and merges their collections
 * into a single flat array. File names are not significant — only the
 * collection `name` field matters.
 */
export async function loadDesignTokens(
  directory = "design-tokens",
): Promise<ReadonlyArray<FigmaCollection>> {
  const collections: FigmaCollection[] = [];

  for await (const entry of Deno.readDir(directory)) {
    if (!entry.isFile || !entry.name.endsWith(".json")) {
      continue;
    }

    const content = await Deno.readTextFile(`${directory}/${entry.name}`);
    const parsed: unknown = JSON.parse(content);

    if (!Array.isArray(parsed)) {
      continue;
    }

    for (const item of parsed) {
      if (
        typeof item === "object" && item !== null && "name" in item &&
        "modes" in item
      ) {
        collections.push(item as FigmaCollection);
      }
    }
  }

  return collections;
}

/**
 * Finds a collection by name from the loaded design tokens.
 */
export function findCollection(
  collections: ReadonlyArray<FigmaCollection>,
  name: string,
): FigmaCollection | undefined {
  return collections.find((c) => c.name === name);
}

/**
 * Extracts all COLOR variables from a specific mode, keyed by variable name.
 */
export function extractColorVariables(
  mode: FigmaMode,
): ReadonlyMap<string, FigmaRgba> {
  const colors = new Map<string, FigmaRgba>();

  for (const variable of mode.variables) {
    if (variable.type !== "COLOR") {
      continue;
    }

    const value = variable.value;

    if (
      typeof value === "object" && value !== null && "r" in value &&
      "g" in value && "b" in value
    ) {
      colors.set(variable.name, value as FigmaRgba);
    }
  }

  return colors;
}

/**
 * Extracts all FLOAT variables from a specific mode, keyed by variable name.
 */
export function extractFloatVariables(
  mode: FigmaMode,
): ReadonlyMap<string, number> {
  const floats = new Map<string, number>();

  for (const variable of mode.variables) {
    if (variable.type !== "FLOAT" || typeof variable.value !== "number") {
      continue;
    }

    floats.set(variable.name, variable.value);
  }

  return floats;
}

// ---------------------------------------------------------------------------
// Static constants (Carbon specification, not Figma-dependent)
// ---------------------------------------------------------------------------

/** Carbon theme mode identifiers. */
export type CarbonTheme = "white" | "gray10" | "gray90" | "gray100";

/** Mapping from theme identifier to Figma mode name. */
export const THEME_MODE_NAMES = {
  white: "White Theme",
  gray10: "Gray 10 Theme",
  gray90: "Gray 90 Theme",
  gray100: "Gray 100 Theme",
} as const satisfies Record<CarbonTheme, string>;

/** Carbon spacing token identifiers. */
export type SpacingToken =
  | "spacing-01"
  | "spacing-02"
  | "spacing-03"
  | "spacing-04"
  | "spacing-05"
  | "spacing-06"
  | "spacing-07"
  | "spacing-08"
  | "spacing-09"
  | "spacing-10"
  | "spacing-11"
  | "spacing-12"
  | "spacing-13";

/** Spacing tokens in pixels and rem units. */
export const SPACING_TOKENS = {
  "spacing-01": { px: 2, rem: 0.125 },
  "spacing-02": { px: 4, rem: 0.25 },
  "spacing-03": { px: 8, rem: 0.5 },
  "spacing-04": { px: 12, rem: 0.75 },
  "spacing-05": { px: 16, rem: 1 },
  "spacing-06": { px: 24, rem: 1.5 },
  "spacing-07": { px: 32, rem: 2 },
  "spacing-08": { px: 40, rem: 2.5 },
  "spacing-09": { px: 48, rem: 3 },
  "spacing-10": { px: 64, rem: 4 },
  "spacing-11": { px: 80, rem: 5 },
  "spacing-12": { px: 96, rem: 6 },
  "spacing-13": { px: 160, rem: 10 },
} as const satisfies Record<
  SpacingToken,
  { readonly px: number; readonly rem: number }
>;

/** Breakpoint definitions in pixels. */
export const BREAKPOINTS = {
  sm: 320,
  md: 672,
  lg: 1056,
  xl: 1312,
  max: 1584,
  maxPlus: 1784,
} as const;

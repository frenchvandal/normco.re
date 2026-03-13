/**
 * Carbon Design System v11 design tokens extracted from Figma JSON exports.
 *
 * This module provides TypeScript types and constants that mirror the Carbon
 * design token structure. The actual CSS custom properties are defined in
 * `src/styles/base.css` and consume these values.
 *
 * @module
 */

import _themeData from "../../design/Theme.json" with { type: "json" };
import _spacingData from "../../design/Spacing.json" with { type: "json" };
import _layerData from "../../design/Layer.json" with { type: "json" };
import _radiusData from "../../design/Radius.json" with { type: "json" };
import _breakpointData from "../../design/Breakpoint.json" with { type: "json" };
import _colorsData from "../../design/Colors.json" with { type: "json" };

/** Carbon theme mode identifiers. */
export type CarbonTheme = "white" | "gray10" | "gray90" | "gray100";

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

/** Carbon layer identifiers. */
export type LayerToken =
  | "background"
  | "layer"
  | "layer-accent"
  | "layer-selected";

/** Carbon color palette token identifiers. */
export type ColorToken =
  | "background"
  | "background-hover"
  | "background-active"
  | "background-selected"
  | "layer"
  | "layer-hover"
  | "layer-active"
  | "layer-selected"
  | "layer-accent"
  | "layer-accent-hover"
  | "layer-accent-active"
  | "field"
  | "field-hover"
  | "border-subtle"
  | "border-strong"
  | "border-inverse"
  | "border-interactive"
  | "text-primary"
  | "text-secondary"
  | "text-placeholder"
  | "text-helper"
  | "text-inverse"
  | "text-link"
  | "text-error"
  | "text-success"
  | "text-warning"
  | "link-primary"
  | "link-primary-hover"
  | "link-primary-visited"
  | "link-inverse"
  | "icon-primary"
  | "icon-secondary"
  | "icon-inverse"
  | "icon-on-color"
  | "icon-disabled"
  | "focus"
  | "interactive"
  | "interactive-hover"
  | "interactive-active"
  | "support-error"
  | "support-success"
  | "support-warning"
  | "support-info";

/** RGB color value as extracted from Figma. */
export type RgbColor = {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;
};

/** Convert RGB color to CSS oklch() string. */
export function rgbToOklch(rgb: RgbColor): string {
  // sRGB to linear RGB conversion
  const toLinear = (c: number): number =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  const rLinear = toLinear(rgb.r);
  const gLinear = toLinear(rgb.g);
  const bLinear = toLinear(rgb.b);

  // sRGB to XYZ (D65 illuminant)
  const x = rLinear * 0.4124564 + gLinear * 0.3575761 + bLinear * 0.1804375;
  const y = rLinear * 0.2126729 + gLinear * 0.7151522 + bLinear * 0.0721750;
  const z = rLinear * 0.0193339 + gLinear * 0.1191920 + bLinear * 0.9503041;

  // XYZ to Oklab
  const l = 0.210454 * x + 0.793617 * y - 0.004072 * z;
  const aVal = 1.977998 * x - 2.428592 * y + 0.450594 * z;
  const bVal = 0.025904 * x - 0.782771 * y + 0.756867 * z;

  const lCube = Math.cbrt(l);
  const aCube = Math.cbrt(aVal);
  const bCube = Math.cbrt(bVal);

  const L = lCube;
  const a = aCube;
  const b = bCube;

  // Oklab to Oklch
  const lightness = L;
  const chroma = Math.sqrt(a * a + b * b);
  let hue = Math.atan2(b, a) * (180 / Math.PI);

  if (hue < 0) {
    hue += 360;
  }

  return `oklch(${(lightness * 100).toFixed(3)}% ${chroma.toFixed(3)} ${
    hue.toFixed(0)
  })`;
}

/** Convert RGB color to CSS hex string. */
export function rgbToHex(rgb: RgbColor): string {
  const toHex = (c: number): string => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };

  const r = toHex(rgb.r);
  const g = toHex(rgb.g);
  const b = toHex(rgb.b);

  return `#${r}${g}${b}`;
}

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

/** Grid configuration per breakpoint. */
export const GRID_CONFIG = {
  wide: {
    sm: { columns: 4, gutter: 32, margin: 16 },
    md: { columns: 8, gutter: 32, margin: 32 },
    lg: { columns: 16, gutter: 32, margin: 32 },
    xl: { columns: 16, gutter: 32, margin: 32 },
    max: { columns: 16, gutter: 32, margin: 40 },
    maxPlus: { columns: 16, gutter: 32, margin: 40 },
  },
  narrow: {
    sm: { columns: 4, gutter: 16, margin: 0 },
    md: { columns: 8, gutter: 16, margin: 16 },
    lg: { columns: 16, gutter: 16, margin: 16 },
    xl: { columns: 16, gutter: 16, margin: 16 },
    max: { columns: 16, gutter: 16, margin: 24 },
    maxPlus: { columns: 16, gutter: 16, margin: 24 },
  },
} as const;

/** Radius tokens. */
export const RADIUS_TOKENS = {
  none: 0,
  round: Number.MAX_SAFE_INTEGER,
} as const;

/** Extract color values from theme JSON for a specific theme mode. */
export function getThemeColors(
  _theme: CarbonTheme,
): Record<string, RgbColor> {
  const modeMap: Record<CarbonTheme, string> = {
    white: "25984:0",
    gray10: "25984:1",
    gray90: "25984:2",
    gray100: "25984:3",
  };

  const _modeId = modeMap[_theme];
  const colors: Record<string, RgbColor> = {};

  // This is a simplified extraction - full implementation would parse
  // the complete Theme.json structure with all variable aliases
  // For now, we use the CSS values defined in base.css

  return colors;
}

/** Generate CSS custom properties from Carbon tokens. */
export function generateCssCustomProperties(
  _theme: CarbonTheme = "white",
): string {
  const properties: string[] = [];

  // Spacing tokens
  for (const [token, values] of Object.entries(SPACING_TOKENS)) {
    properties.push(`--cds-${token}: ${values.rem}rem; /* ${values.px}px */`);
  }

  // Breakpoint media query helpers (as CSS custom properties)
  properties.push(
    `--cds-breakpoint-sm: ${BREAKPOINTS.sm}px;`,
    `--cds-breakpoint-md: ${BREAKPOINTS.md}px;`,
    `--cds-breakpoint-lg: ${BREAKPOINTS.lg}px;`,
    `--cds-breakpoint-xl: ${BREAKPOINTS.xl}px;`,
    `--cds-breakpoint-max: ${BREAKPOINTS.max}px;`,
    `--cds-breakpoint-max-plus: ${BREAKPOINTS.maxPlus}px;`,
  );

  return properties.join("\n  ");
}

/**
 * Returns the Carbon theme class name for a given theme.
 * Use this to toggle themes on the root element.
 */
export function getThemeClassName(theme: CarbonTheme): string {
  return `cds-theme--${theme}`;
}

/**
 * Returns the default Carbon theme for light and dark modes.
 * - Light mode: White theme (cds-theme--white)
 * - Dark mode: Gray 100 theme (cds-theme--gray100)
 */
export function getDefaultThemeForColorScheme(
  prefersDark: boolean,
): CarbonTheme {
  return prefersDark ? "gray100" : "white";
}

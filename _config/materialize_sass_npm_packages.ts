// Ensure Deno materializes the Carbon Sass package graph under top-level
// node_modules so Dart Sass can resolve sibling package imports consistently.
import { fromFileUrl } from "jsr/path";
import carbonColorsPackage from "npm/carbon-colors-package" with {
  type: "json",
};
import carbonFeatureFlagsPackage from "npm/carbon-feature-flags-package" with {
  type: "json",
};
import carbonGridPackage from "npm/carbon-grid-package" with {
  type: "json",
};
import carbonLayoutPackage from "npm/carbon-layout-package" with {
  type: "json",
};
import carbonMotionPackage from "npm/carbon-motion-package" with {
  type: "json",
};
import carbonStylesPackage from "npm/carbon-styles-package" with {
  type: "json",
};
import carbonThemesPackage from "npm/carbon-themes-package" with {
  type: "json",
};
import carbonTypePackage from "npm/carbon-type-package" with {
  type: "json",
};

void [
  carbonColorsPackage,
  carbonFeatureFlagsPackage,
  carbonGridPackage,
  carbonLayoutPackage,
  carbonMotionPackage,
  carbonStylesPackage,
  carbonThemesPackage,
  carbonTypePackage,
];

export const CARBON_SASS_LOAD_PATHS = [
  "node_modules",
  fromFileUrl(
    new URL(
      `../node_modules/.deno/@carbon+styles@${carbonStylesPackage.version}/node_modules`,
      import.meta.url,
    ),
  ),
] as const;

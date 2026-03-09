/**
 * Generates the local Octicons catalog from the official `@primer/octicons` package.
 *
 * Run:
 * `deno run --allow-net --allow-write scripts/sync-octicons.ts`
 */

const OCTICON_VERSION = "19.22.0" as const;
const SOURCE_URL =
  `https://unpkg.com/@primer/octicons@${OCTICON_VERSION}/build/data.json`;
const OUTPUT_PATH = "src/utils/octicon.ts" as const;

type RawOcticonSizeEntry = {
  readonly width: number;
  readonly path: string;
  readonly ast?: {
    readonly attributes?: {
      readonly viewBox?: string;
    };
  };
};

type RawOcticonEntry = {
  readonly keywords: ReadonlyArray<string>;
  readonly heights: Readonly<Record<string, RawOcticonSizeEntry>>;
};

type RawOcticonCatalog = Readonly<Record<string, RawOcticonEntry>>;

/** Extracts all SVG path `d` attributes from a serialized SVG path markup string. */
function extractPathData(pathMarkup: string): ReadonlyArray<string> {
  const paths = Array.from(pathMarkup.matchAll(/d="([^"]+)"/g), (match) => {
    const path = match[1];
    return path ?? "";
  });

  return paths.length > 0 ? paths : [""];
}

/** Creates a stable, generated TypeScript module as a string. */
function renderModule(catalog: RawOcticonCatalog): string {
  const iconNames = Object.keys(catalog).sort();
  const knownSizes = new Set<number>();

  const octiconEntries = iconNames.map((iconName) => {
    const entry = catalog[iconName];
    if (!entry) {
      throw new Error(`Missing Octicon entry for "${iconName}"`);
    }

    const sizeKeys = Object.keys(entry.heights)
      .map((size) => Number(size))
      .sort((a, b) => a - b);

    for (const size of sizeKeys) {
      knownSizes.add(size);
    }

    const defaultSize = sizeKeys.includes(16) ? 16 : (sizeKeys[0] ?? 16);

    const sizeBlocks = sizeKeys.map((size) => {
      const rawSize = entry.heights[String(size)];
      const paths = extractPathData(rawSize?.path ?? "");
      const viewBox = rawSize?.ast?.attributes?.viewBox ??
        `0 0 ${rawSize?.width ?? size} ${size}`;

      return `      ${size}: {
        width: ${rawSize?.width ?? size},
        viewBox: ${JSON.stringify(viewBox)},
        paths: ${JSON.stringify(paths)},
      },`;
    }).join("\n");

    return `  ${JSON.stringify(iconName)}: {
    keywords: ${JSON.stringify(entry.keywords)},
    defaultSize: ${defaultSize},
    sizes: {
${sizeBlocks}
    },
  },`;
  }).join("\n");

  const sortedKnownSizes = Array.from(knownSizes).sort((a, b) => a - b);

  return `/**
 * Full local Octicons catalog.
 *
 * Generated from \`@primer/octicons\` (${OCTICON_VERSION})
 * Source: ${SOURCE_URL}
 */

/** Current upstream Octicons package version used for generation. */
export const OCTICON_VERSION = ${JSON.stringify(OCTICON_VERSION)} as const;

/** Source URL used to generate this local catalog. */
export const OCTICON_SOURCE_URL = ${JSON.stringify(SOURCE_URL)} as const;

type OcticonSizeEntry = {
  readonly width: number;
  readonly viewBox: string;
  readonly paths: ReadonlyArray<string>;
};

type OcticonEntry = {
  readonly keywords: ReadonlyArray<string>;
  readonly defaultSize: number;
  readonly sizes: Readonly<Record<number, OcticonSizeEntry>>;
};

/** Full generated Octicons catalog keyed by icon name. */
export const OCTICONS = {
${octiconEntries}
} as const satisfies Record<string, OcticonEntry>;

/** All available Octicon names, sorted alphabetically. */
export const OCTICON_NAMES = Object.freeze(
  Object.keys(OCTICONS).sort(),
) as ReadonlyArray<keyof typeof OCTICONS>;

/** Octicon name union, derived from the generated catalog keys. */
export type OcticonName = keyof typeof OCTICONS;

/** All available Octicon sizes across the generated catalog. */
export const OCTICON_SIZES = ${JSON.stringify(sortedKnownSizes)} as const;

/** Union of all known Octicon sizes. */
export type OcticonSize = (typeof OCTICON_SIZES)[number];

/**
 * Resolved SVG data for a specific icon and size.
 *
 * The \`path\` field is kept for backward compatibility and maps to
 * \`paths[0]\`.
 */
export interface OcticonData {
  /** Canonical icon name. */
  readonly name: OcticonName;
  /** Requested size after fallback resolution. */
  readonly size: OcticonSize;
  /** SVG viewport width for this size. */
  readonly width: number;
  /** SVG viewBox for this size. */
  readonly viewBox: string;
  /** Ordered path \`d\` segments composing the icon. */
  readonly paths: ReadonlyArray<string>;
  /** Backward-compatible first path alias (equivalent to \`paths[0]\`). */
  readonly path: string;
  /** Search keywords shipped by Octicons metadata. */
  readonly keywords: ReadonlyArray<string>;
  /** Available sizes for this icon. */
  readonly availableSizes: ReadonlyArray<OcticonSize>;
}

/** Returns \`true\` when the provided string is a valid Octicon name. */
export function hasOcticon(name: string): name is OcticonName {
  return name in OCTICONS;
}

/** Returns the full, sorted list of available Octicon names. */
export function listOcticonNames(): ReadonlyArray<OcticonName> {
  return OCTICON_NAMES;
}

/**
 * Returns resolved SVG data for a given icon.
 *
 * If the requested size is unavailable for that icon, the icon default size is used.
 */
export function getOcticonData(
  name: OcticonName,
  size: OcticonSize = 16,
): OcticonData {
  const iconEntry = OCTICONS[name];
  const sizes = iconEntry.sizes as Readonly<Record<number, OcticonSizeEntry>>;
  const fallbackSize = iconEntry.defaultSize as OcticonSize;
  const resolvedSize = sizes[size] ? size : fallbackSize;
  const sizeData = sizes[resolvedSize];

  if (sizeData === undefined) {
    throw new Error(
      \`Cannot resolve Octicon data for "\${name}" at size \${resolvedSize}\`,
    );
  }

  const path = sizeData.paths[0] ?? "";

  return {
    name,
    size: resolvedSize,
    width: sizeData.width,
    viewBox: sizeData.viewBox,
    paths: sizeData.paths,
    path,
    keywords: iconEntry.keywords,
    availableSizes: Object.keys(sizes)
      .map((entrySize) => Number(entrySize) as OcticonSize)
      .sort((a, b) => a - b),
  };
}
`;
}

const response = await fetch(SOURCE_URL);
if (!response.ok) {
  throw new Error(`Cannot download Octicons catalog: HTTP ${response.status}`);
}

const catalog = await response.json() as RawOcticonCatalog;
const moduleText = renderModule(catalog);

await Deno.writeTextFile(OUTPUT_PATH, moduleText);

console.info(
  `Generated ${OUTPUT_PATH} with ${
    Object.keys(catalog).length
  } icons from ${SOURCE_URL}`,
);

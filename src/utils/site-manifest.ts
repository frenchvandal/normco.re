export const APP_MANIFEST_MIME_TYPE = "application/manifest+json" as const;
export const APP_MANIFEST_PATH = "/manifest.webmanifest" as const;

export type SiteChromeData = {
  readonly faviconIcoUrl: string;
  readonly faviconSvgUrl: string;
  readonly appleTouchIconUrl: string;
  readonly themeColorLight: string;
  readonly themeColorDark: string;
};

export type SiteManifestDirection = "ltr" | "rtl" | "auto";
export type SiteManifestDisplay =
  | "browser"
  | "minimal-ui"
  | "standalone"
  | "fullscreen";

export type SiteManifestIcon = {
  readonly src: string;
  readonly sizes: string;
  readonly type: string;
  readonly purpose?: string;
};

export type SiteManifestShortcut = {
  readonly name: string;
  readonly shortName?: string;
  readonly description?: string;
  readonly url: string;
  readonly icons?: ReadonlyArray<SiteManifestIcon>;
};

/**
 * Core members from the current W3C Web Application Manifest processing model.
 * Additional storefront metadata now lives in the separate Application
 * Information note and can be layered on later if needed.
 */
export type SiteManifestData = {
  readonly dir?: SiteManifestDirection;
  readonly lang?: string;
  readonly name: string;
  readonly shortName: string;
  readonly startUrl: string;
  readonly id: string;
  readonly scope: string;
  readonly display: SiteManifestDisplay;
  readonly themeColor: string;
  readonly backgroundColor: string;
  readonly icons: ReadonlyArray<SiteManifestIcon>;
  readonly shortcuts?: ReadonlyArray<SiteManifestShortcut>;
};

function serializeIcon(icon: SiteManifestIcon): Record<string, string> {
  return {
    src: icon.src,
    sizes: icon.sizes,
    type: icon.type,
    ...(icon.purpose ? { purpose: icon.purpose } : {}),
  };
}

function serializeShortcut(
  shortcut: SiteManifestShortcut,
): Record<string, unknown> {
  return {
    name: shortcut.name,
    ...(shortcut.shortName ? { short_name: shortcut.shortName } : {}),
    ...(shortcut.description ? { description: shortcut.description } : {}),
    url: shortcut.url,
    ...(shortcut.icons?.length
      ? { icons: shortcut.icons.map(serializeIcon) }
      : {}),
  };
}

export function buildSiteManifest(
  siteManifest: SiteManifestData,
): Record<string, unknown> {
  return {
    ...(siteManifest.dir ? { dir: siteManifest.dir } : {}),
    ...(siteManifest.lang ? { lang: siteManifest.lang } : {}),
    name: siteManifest.name,
    short_name: siteManifest.shortName,
    start_url: siteManifest.startUrl,
    id: siteManifest.id,
    scope: siteManifest.scope,
    theme_color: siteManifest.themeColor,
    background_color: siteManifest.backgroundColor,
    display: siteManifest.display,
    icons: siteManifest.icons.map(serializeIcon),
    ...(siteManifest.shortcuts?.length
      ? { shortcuts: siteManifest.shortcuts.map(serializeShortcut) }
      : {}),
  };
}

export function stringifySiteManifest(siteManifest: SiteManifestData): string {
  return `${JSON.stringify(buildSiteManifest(siteManifest), null, 2)}\n`;
}

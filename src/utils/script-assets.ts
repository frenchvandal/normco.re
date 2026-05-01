type ScriptAssetDescriptor = Readonly<{
  url: `/scripts/${string}.js`;
  fingerprint: boolean;
  precache: boolean;
}>;

const SCRIPT_ASSET_DESCRIPTORS = [
  {
    url: "/scripts/header-client.js",
    fingerprint: true,
    precache: true,
  },
  {
    url: "/scripts/header-client/focusable-selector.js",
    fingerprint: true,
    precache: true,
  },
  {
    url: "/scripts/header-client/init.js",
    fingerprint: true,
    precache: true,
  },
  {
    url: "/scripts/header-client/search.js",
    fingerprint: true,
    precache: true,
  },
  {
    url: "/scripts/header-client/theme.js",
    fingerprint: true,
    precache: true,
  },
  {
    url: "/scripts/shared/focus-utils.js",
    fingerprint: true,
    precache: true,
  },
  {
    url: "/scripts/shared/clipboard.js",
    fingerprint: true,
    precache: true,
  },
  {
    url: "/scripts/shared/network-utils.js",
    fingerprint: true,
    precache: true,
  },
  {
    url: "/scripts/shared/adaptive-prefetch.js",
    fingerprint: true,
    precache: true,
  },
  {
    url: "/scripts/about-contact-toggletips.js",
    fingerprint: true,
    precache: false,
  },
  {
    url: "/scripts/language-preference.js",
    fingerprint: true,
    precache: true,
  },
  {
    url: "/scripts/feed-copy.js",
    fingerprint: true,
    precache: true,
  },
  {
    url: "/scripts/gallery.js",
    fingerprint: true,
    precache: false,
  },
  {
    url: "/scripts/post-code-copy.js",
    fingerprint: true,
    precache: true,
  },
  {
    url: "/scripts/post-mobile-tools-loader.js",
    fingerprint: true,
    precache: true,
  },
  {
    url: "/scripts/post-mobile-tools.js",
    fingerprint: true,
    precache: false,
  },
  {
    url: "/scripts/pretext-browser-probe.js",
    fingerprint: true,
    precache: false,
  },
  {
    url: "/scripts/link-prefetch-intent.js",
    fingerprint: true,
    precache: true,
  },
  {
    url: "/scripts/sw-register.js",
    fingerprint: true,
    precache: false,
  },
] as const satisfies readonly ScriptAssetDescriptor[];

function collectScriptAssetUrls(
  predicate: (descriptor: ScriptAssetDescriptor) => boolean,
): string[] {
  return SCRIPT_ASSET_DESCRIPTORS
    .filter(predicate)
    .map(({ url }) => url);
}

export const SCRIPT_ASSET_URLS = collectScriptAssetUrls(() => true);
export const FINGERPRINTED_SCRIPT_ASSET_URLS = collectScriptAssetUrls(
  ({ fingerprint }) => fingerprint,
);
export const PRECACHED_SCRIPT_ASSET_URLS = collectScriptAssetUrls(
  ({ precache }) => precache,
);

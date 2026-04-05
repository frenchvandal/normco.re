const ROOT_ICON_PNG_PATTERN =
  /^\/(?:android-chrome-(?:192x192|512x512)|apple-touch-icon(?:-(?:120x120|152x152|167x167))?)\.png$/;

export const transformImages = [
  {
    matches: ROOT_ICON_PNG_PATTERN,
    format: {
      format: "png",
      adaptiveFiltering: true,
      compressionLevel: 9,
      effort: 10,
      palette: true,
      quality: 90,
    },
  },
] as const;

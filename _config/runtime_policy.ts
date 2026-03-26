export type ScopedUpdateMatcher = (path: string) => boolean;

const IMAGE_ASSET_PATTERN = /\.(?:png|jpe?g|webp|avif|gif|svg)$/i;

export function isStylesheetAsset(path: string): boolean {
  return path.endsWith(".css");
}

export function isScriptAsset(path: string): boolean {
  return path.endsWith(".js");
}

export function isImageAsset(path: string): boolean {
  return IMAGE_ASSET_PATTERN.test(path);
}

export function shouldRunPostBuildTasks(isServeTask: boolean): boolean {
  return !isServeTask;
}

export const SCOPED_UPDATE_MATCHERS: readonly ScopedUpdateMatcher[] = [
  isStylesheetAsset,
  isScriptAsset,
  isImageAsset,
];

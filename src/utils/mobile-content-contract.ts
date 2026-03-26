import { getLocalizedUrl, type SiteLanguage } from "./i18n.ts";

export const APP_CONTRACT_VERSION = "1" as const;
export const APP_MANIFEST_API_PATH = "/api/app-manifest.json" as const;
export const POSTS_INDEX_API_PATH = "/api/posts/index.json" as const;
export const POST_DETAIL_API_PATH_TEMPLATE = "/api/posts/{slug}.json" as const;

export function getPostDetailApiPath(
  slug: string,
  language: SiteLanguage,
): string {
  return getLocalizedUrl(`/api/posts/${slug}.json`, language);
}

export function getPostDetailApiPathTemplate(
  language: SiteLanguage,
): string {
  return getLocalizedUrl(POST_DETAIL_API_PATH_TEMPLATE, language);
}

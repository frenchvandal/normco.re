import { getLocalizedUrl, type SiteLanguage } from "./i18n.ts";
import { slugify } from "./slugify.ts";
import { getTagPresetColor, type TagPresetColor } from "./tag-preset-colors.ts";

export type TagColor = TagPresetColor;
export type AntdTagColor = TagPresetColor;

export function getTagSlug(tag: string) {
  return slugify(tag);
}

export function getTagColor(tag: string): TagColor {
  return getTagPresetColor(tag);
}

export function getAntdTagColor(tag: string): AntdTagColor {
  return getTagPresetColor(tag);
}

export function getTagUrl(tag: string, language: SiteLanguage) {
  return getLocalizedUrl(`/tags/${getTagSlug(tag)}/`, language);
}

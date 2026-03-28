import {
  getTagPresetColor,
  type TagPresetColor,
} from "../../utils/tag-preset-colors.ts";

export type BlogTagColor = TagPresetColor;

export function getBlogTagColor(tag: string): BlogTagColor {
  return getTagPresetColor(tag);
}

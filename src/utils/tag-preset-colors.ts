const TAG_PRESET_COLORS = ["blue"] as const;

export type TagPresetColor = (typeof TAG_PRESET_COLORS)[number];

export function getTagPresetColor(_tag: string): TagPresetColor {
  return TAG_PRESET_COLORS[0];
}

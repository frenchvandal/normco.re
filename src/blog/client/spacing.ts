// Ant Design `Flex` accepts CSS custom properties directly, but `Row` gutters
// and `Space` sizes still expect pixel values. Keep both forms aligned with
// the shared `--ph-space-*` token scale.
const BLOG_ANTD_SPACE_2_PX = 8;
const BLOG_ANTD_SPACE_5_PX = 24;
const BLOG_ANTD_SPACE_6_PX = 32;

export const BLOG_ANTD_SPACE_3 = "var(--ph-space-3)";
export const BLOG_ANTD_SPACE_4 = "var(--ph-space-4)";

export const BLOG_ANTD_ROW_GUTTER_GRID = [
  BLOG_ANTD_SPACE_5_PX,
  BLOG_ANTD_SPACE_5_PX,
] as [number, number];

export const BLOG_ANTD_ROW_GUTTER_SECTION = [
  BLOG_ANTD_SPACE_6_PX,
  BLOG_ANTD_SPACE_5_PX,
] as [number, number];

export const BLOG_ANTD_SPACE_SIZE_COMPACT = [
  BLOG_ANTD_SPACE_2_PX,
  BLOG_ANTD_SPACE_2_PX,
] as [number, number];
